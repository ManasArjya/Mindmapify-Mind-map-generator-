// Requires: npm install mermaid@latest framer-motion
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

function App() {
  const [text, setText] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [mindMap, setMindMap] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [selectedPart, setSelectedPart] = useState("all");

  const handleTextExtract = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/nlp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Text Extract Response:", data);
      setConcepts(data.nodes?.flatMap(n => n.children.map(c => c.name)) || []);
      generateMindMap(data, selectedPart);
    } catch (err) {
      console.error("Text Extract error:", err);
      setError("Failed to generate mind map");
      setConcepts([]);
      generateMindMap({}, selectedPart);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/upload-pdf/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("File Upload Response:", data);
      if (data.error) {
        setError(data.error);
        setConcepts([]);
        generateMindMap({}, selectedPart);
        return;
      }
      setText(data.text || "");
      setConcepts(data.nodes?.flatMap(n => n.children.map(c => c.name)) || []);
      generateMindMap(data, selectedPart);
    } catch (err) {
      console.error("File Upload error:", err);
      setError("Failed to process PDF");
      setConcepts([]);
      generateMindMap({}, selectedPart);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMindMap = useCallback((data, part) => {
    console.log("MindMap Data:", data);
    const root = data.root || "Topic";
    const nodes = data.nodes || [];
    if (!nodes.length) {
      console.warn("No nodes; skipping mind map");
      setMindMap("");
      return;
    }
    const map = [`graph TD`, `R["${root}"]`];
    if (part === "all") {
      nodes.forEach((node, i) => {
        const nodeId = `N${i}`;
        map.push(`R --> ${nodeId}["${node.name}"]`);
        node.children.forEach((child, j) => {
          const childId = `C${i}${j}`;
          map.push(`${nodeId} --> ${childId}["${child.name}"]`);
          child.children.forEach((subchild, k) => {
            const subchildId = `S${i}${j}${k}`;
            map.push(`${childId} --> ${subchildId}["${subchild}"]`);
          });
        });
      });
    } else {
      const node = nodes.find(n => n.name === part);
      if (node) {
        const nodeId = `N0`;
        map.push(`R --> ${nodeId}["${node.name}"]`);
        node.children.forEach((child, j) => {
          const childId = `C0${j}`;
          map.push(`${nodeId} --> ${childId}["${child.name}"]`);
          child.children.forEach((subchild, k) => {
            const subchildId = `S0${j}${k}`;
            map.push(`${childId} --> ${subchildId}["${subchild}"]`);
          });
        });
      }
    }
    const newMindMap = map.join("\n");
    console.log("Generated MindMap:", newMindMap);
    setMindMap(newMindMap);
  }, []);

  useEffect(() => {
    if (mindMap) {
      import("mermaid").then((mermaid) => {
        try {
          mermaid.default.initialize({
            startOnLoad: false,
            theme: "neutral",
            flowchart: {
              useMaxWidth: false,
              width: 1200,
              nodeSpacing: 60,
              rankSpacing: 80,
            },
            securityLevel: "loose",
          });
          const element = document.getElementById("mindmap");
          if (element) {
            element.innerHTML = "";
            const renderId = `graphDiv-${Date.now()}`;
            mermaid.default.render(renderId, mindMap, element)
              .then(({ svg, bindFunctions }) => {
                console.log("Mermaid SVG generated:", svg);
                element.innerHTML = svg;
                if (bindFunctions) bindFunctions(element);
                // Apply zoom
                const svgElement = element.querySelector("svg");
                if (svgElement) {
                  svgElement.style.transform = `scale(${zoom})`;
                  svgElement.style.transformOrigin = "top left";
                }
              })
              .catch((err) => {
                console.error("Mermaid render error:", err);
                setError("Failed to render mind map");
              });
          }
        } catch (err) {
          console.error("Mermaid initialization error:", err);
        }
      });
    }
  }, [mindMap, zoom]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-lg p-4 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">MindMapify</h1>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Create Mind Map</h2>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={8}
                placeholder="Enter notes (e.g., 'Skills: C/C++, DBMS')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleTextExtract}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    "Generate"
                  )}
                </button>
                <label className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer flex items-center gap-2 transition-colors">
                  Upload PDF
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf"
                    disabled={isLoading}
                  />
                </label>
              </div>
              {fileName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Uploaded: {fileName}</p>
              )}
              {error && (
                <p className="text-sm text-red-500 mt-3">{error}</p>
              )}
            </motion.div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {concepts.length > 0 && (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Concepts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
                  {concepts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-indigo-400 rounded-full" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Mind Map</h2>
              {mindMap ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Zoom In
                    </button>
                    <button
                      onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Zoom Out
                    </button>
                    <select
                      value={selectedPart}
                      onChange={(e) => {
                        setSelectedPart(e.target.value);
                        generateMindMap({ root: text.root, nodes: text.nodes }, e.target.value);
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      {concepts.nodes?.map((node) => (
                        <option key={node.name} value={node.name}>{node.name}</option>
                      ))}
                    </select>
                  </div>
                  <div
                    id="mindmap"
                    className="mermaid-svg bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto"
                    style={{ minHeight: "600px", maxWidth: "100%" }}
                  >
                    {!document.querySelector("#mindmap svg") && (
                      <p className="text-gray-500 dark:text-gray-400">Rendering...</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No mind map to display</p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;