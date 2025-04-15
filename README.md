# MindMapify

MindMapify is a web app that turns your notes or PDFs into interactive mind maps! Type a resume, upload a PDF, and see a diagram with branches for Skills, Education, Projects, and more. Zoom, scroll, and click parts to explore—it’s like a map for your thoughts!

## Features
- **Text Input:** Enter notes (e.g., "Skills: C++, Python"), get a mind map.
- **PDF Upload:** Upload a PDF, see the same diagram.
- **Interactive Maps:** Zoom (0.5x–2x), scroll, select parts (e.g., "Skills" only).
- **Smart Analysis:** Finds key ideas (like "C++", "IIT Bombay") automatically.
- **Pretty UI:** Colorful gradient, smooth animations.

## Prerequisites
- **Python 3.10.11**: For the backend.
- **Node.js 20.x**: For the frontend.
- A computer (Windows, Mac, Linux).

## Installation
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/your-username/mindmapify.git
   cd mindmapify

## Backend Setup:

cd backend
python -m venv venv

venv\Scripts\activate     # On Windows
source venv/bin/activate  # On Mac/Linux

pip install -r requirements.txt				
python -m spacy download en_core_web_sm			
pip install python-multipart

**Start Backend:**

cd backend
venv\Scripts\activate
uvicorn app:app --reload --port 8000


## Frontend Setup

cd frontend
npm install	

**If npm install doesnt work fully you can also execute these before npm install.**

npm install mermaid					
npm install -D tailwindcss postcss autoprefixer		
npx tailwindcss init -p					
npm install framer-motion				
					

**Start Frontend (in another terminal)**
cd frontend
npm run dev

**Open Browser:**
Go to http://localhost:5173. or to whatever your frontend provides.
Type notes (e.g., "Skills: C++, Python") or upload a PDF.
Click "Generate Synopsis" to see your mind map!

## Example Input:

Professional Profile:
My skills include C/C++ programming, DBMS expertise, Python development, and data structures mastery. I am proficient in algorithms and machine learning.
Education includes a B.Tech degree from IIT Bombay, a machine learning certification from Coursera, and an advanced programming bootcamp.
My projects involve a radio application developed in Howrah, an AI software research project, and a mobile app for community services.
I am currently based in Howrah, with experience working in urban cities like Mumbai and Bangalore.

or upload any pdf.

## Project Structure

mindmapify/
├── backend/
│   ├── app.py              # Backend logic (text/PDF to mind map)
│   ├── requirements.txt    # Python libraries
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main webpage (mind map display)
│   │   ├── main.jsx        # Starts the app
│   │   ├── index.css       # Styles
│   ├── index.html          # Webpage frame
│   ├── package.json        # JavaScript libraries
│   ├── vite.config.js      # Bundler settings
├── README.md               # This file
├── .gitignore              # Skips junk files

## Technologies

Backend: Python, FastAPI, spaCy (for text analysis), PyMuPDF (for PDFs).
Frontend: React, Vite, Mermaid (for mind maps), Tailwind CSS, Framer Motion.
Connection: HTTP API (backend at localhost:8000, frontend at localhost:5173).

## Demo

![alt text](<images/Screenshot (708).png>) 
![alt text](<images/Screenshot (709).png>) 
![alt text](<images/Screenshot (710).png>) 
![alt text](<images/Screenshot (711).png>) 
![alt text](<images/Screenshot (712).png>) 
![alt text](<images/Screenshot (713).png>)

## License
MIT License (free to use, share, modify with credit).

## Version
This is version 1.0 of the project.

## Contributing
Want to contribute? Awesome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit issues, feature requests, or pull requests.

## Contact
Made with ❤️ by Manas. Ping me at manassonu1254@gmail.com or on GitHub: https://github.com/ManasArjya .
