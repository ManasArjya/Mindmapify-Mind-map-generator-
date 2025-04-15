from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import spacy
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
from pydantic import BaseModel
from typing import Dict, List
from collections import defaultdict

app = FastAPI()
try:
    nlp = spacy.load("en_core_web_lg")
except OSError:
    nlp = spacy.load("en_core_web_sm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextData(BaseModel):
    text: str

@app.post("/nlp/")
async def nlp_extract(data: TextData):
    text = data.text.strip()
    if not text:
        return {"root": "", "nodes": []}
    return extract_hierarchy(text)

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if not fitz:
        return {"error": "PDF processing unavailable; PyMuPDF not installed"}
    try:
        content = await file.read()
        text = ""
        with fitz.open(stream=content, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        text = text.strip()
        if not text:
            return {"text": "", "root": "", "nodes": []}
        hierarchy = extract_hierarchy(text)
        return {"text": text, **hierarchy}
    except Exception as e:
        return {"error": f"Failed to process PDF: {str(e)}"}

def extract_hierarchy(text: str) -> Dict:
    """
    Extract a 2-3 level hierarchy for mind map.
    Returns: {"root": str, "nodes": [{"name": str, "children": [{"name": str, "children": [str, ...]}, ...]}, ...]}
    """
    doc = nlp(text)
    # Dynamic root from first sentence
    root = "Topic"
    for sent in doc.sents:
        for token in sent:
            if token.dep_ in ("nsubj", "root") and token.pos_ in ("NOUN", "PROPN"):
                root = token.text.capitalize()
                break
        break

    # Extract concepts
    concepts = set(chunk.text.lower() for chunk in doc.noun_chunks if len(chunk.text) > 2)
    if not concepts:
        return {"root": root, "nodes": []}

    # Build hierarchy with dependency parsing
    hierarchy = defaultdict(list)
    for sent in doc.sents:
        for token in sent:
            if token.pos_ in ("NOUN", "PROPN") and token.dep_ in ("nsubj", "dobj", "pobj"):
                parent = token.text.lower()
                children = [
                    child.text.lower() for child in token.children
                    if child.pos_ in ("NOUN", "PROPN", "ADJ", "VERB") and child.text.lower() not in parent
                ]
                hierarchy[parent].extend(children)

    # Organize into categories
    nodes = []
    categories = {
        "Skills": ["c/c++", "dbms", "programming", "algorithms", "data structures", "python", "java"],
        "Education": ["certification", "bootcamp", "degree", "iit bombay", "course"],
        "Locations": ["howrah", "city", "region"],
        "Projects": ["application", "radio", "software", "research"],
    }

    for cat, keywords in categories.items():
        cat_node = {"name": cat, "children": []}
        for parent, children in list(hierarchy.items()):
            if any(k.lower() in parent.lower() for k in keywords):
                # Create sub-hierarchy
                sub_children = []
                for child in set(children):
                    if child in concepts:
                        # Look for child's own children
                        grand_children = hierarchy.get(child, [])
                        sub_children.append({
                            "name": child.capitalize(),
                            "children": [gc.capitalize() for gc in grand_children if gc in concepts][:5]  # Limit to 5
                        })
                if parent in concepts:
                    cat_node["children"].append({
                        "name": parent.capitalize(),
                        "children": [c["name"] for c in sub_children]
                    })
                elif sub_children:
                    cat_node["children"].extend(sub_children)
                del hierarchy[parent]  # Remove processed parent
        # Limit children to prevent overload
        cat_node["children"] = cat_node["children"][:10]
        for child in cat_node["children"]:
            child["children"] = child["children"][:5]
        if cat_node["children"]:
            nodes.append(cat_node)

    # Remaining concepts
    used = set(c["name"].lower() for n in nodes for c in n["children"]) | set(c.lower() for n in nodes for c in n["children"] for c in c["children"])
    other = [c.capitalize() for c in concepts if c not in used]
    if other:
        nodes.append({
            "name": "Other",
            "children": [{"name": c, "children": hierarchy.get(c.lower(), [])[:5]} for c in other[:10]]
        })

    # Limit total nodes
    nodes = nodes[:5]
    return {"root": root, "nodes": nodes}