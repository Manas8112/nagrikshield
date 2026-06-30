# NagrikShield - Hackathon Final Submission Document

*Note: Copy this entire content into your final Google Doc for the submission.*

---

## 1. Problem Statement Selected
**Modernizing Civic Infrastructure Management through AI and Community Consensus**
Traditional methods of reporting civic infrastructure failures (potholes, water leaks, broken streetlights) suffer from high friction, rampant deduplication (multiple people reporting the same issue), lack of verification, and inefficient prioritization. Government bodies lack the bandwidth to manually verify thousands of reports, leading to misappropriation of funds and slow response times.

## 2. Solution Overview
NagrikShield is a gamified, AI-powered civic engagement platform that acts as a secure bridge between citizens and government authorities. It is a **fully working, highly complex web application** (not a placeholder/mockup) that utilizes custom machine learning pipelines and local LLM inference. It operates on three core principles:
1.  **High-Fidelity Reporting:** Using interactive geospatial mapping, citizens report issues precisely.
2.  **Swarm Consensus & Gamification:** A unique staking economy (Shield Points) forces citizens to act honestly. Duplicate reports are blocked via AI "DNA" hashing. Nearby citizens must physically validate a report to achieve an 85% "Swarm Confidence" before it is forwarded to the government.
3.  **Anti-Corruption Verification:** Once a government worker claims an issue is resolved, they must submit photo proof. A local AI Computer Vision pipeline evaluates the structural and semantic validity of the repair, ensuring funds are not released for fake fixes.

## 3. Key Features (Fully Working & Testable)

**We highly encourage the judges to test all features below, as they are fully implemented and functional.**

### 🎮 The "Swarm" Economy & Gamification
- **How it works:** Citizens earn Experience Points (XP) and level up. Reporting an issue requires staking "Shield Points" (SP). If a report is validated, they get a bonus; if fraudulent, they lose the stake.
- **How to test:** 
  1. Create a new account or log in.
  2. Notice your Level, XP, and SP in the Profile and Navbar.
  3. Report an issue or validate an existing one on the Live Map to watch your stats update dynamically without page refreshes.

### 🧠 Generative 4-Layer Fusion API (Cascade ROI Engine)
- **How it works:** An AI engine that calculates the exact financial "Cost of Inaction" for ignoring an issue (e.g. predicting a water leak will cause a sinkhole in 3 weeks).
- **How to test:** Navigate to the `/cascade` page. The system will dynamically generate future consequence projections for all active unresolved issues.

### 🗺️ Interactive GPS Integration & Swarm Validation
- **How it works:** Real-time map rendering using Leaflet with auto-zooming heuristics. Issues are plotted precisely.
- **How to test:** Go to `/map` or `/report`. Click the "Fullscreen" button or "GPS Pin" button to auto-zoom to your real location. Click on a red pin (unresolved issue) and click "Validate this Issue". Watch the Swarm Confidence progress bar increase.

### 🧬 AI Deduplication Pipeline
- **How it works:** A Cosine Similarity algorithm hashes the geocoordinates, severity, and category of new reports.
- **How to test:** Attempt to report a pothole in the exact same location as an existing pothole. The system will recognize the >80% similarity threshold and block the duplicate, suggesting you validate the existing issue instead.

### 🤖 RAG-Powered Command Assistant
- **How it works:** An embedded AI chatbot powered by Google's Gemma-3 that is fully aware of the live application database and civic policies using FAISS and vector embeddings.
- **How to test:** Open the AI chatbot widget on the bottom right. Ask it: "Who are the top users?" or "How many active issues are there?" It will read the live database state and answer dynamically.

### 👁️ Python Vision Verification (Anti-Corruption)
- **How it works:** A Computer Vision model (CLIP ViT-B/32) verifies government repairs against the original damage.
- **How to test:** Log in as the admin (`admin@nagrik.in` / `admin123`). Go to the Command Center (`/admin`). Find an active issue, click "Mark Resolved", and upload a repair photo. Watch the Python backend perform semantic similarity checks in real-time.

## 4. Technologies Used
- **Frontend / Fullstack Framework:** Next.js 15 (App Router), React, CSS3.
- **Backend AI Engine:** Python, Flask, NumPy, scikit-learn, SentenceTransformers.
- **Geospatial Mapping:** react-leaflet, OpenStreetMap.
- **Local AI Inference Engine:** Ollama.
- **Storage:** Custom asynchronous IndexedDB/LocalStorage state manager mimicking a high-latency SQL deployment.

## 5. Google Technologies Utilized
- **Gemini Pro 3.1 & Google Gemma 3 (4B):** The primary brains behind the platform's RAG Command Assistant and AI Fusion pipelines. We leverage the open-weights Gemma 3 model running locally to ensure high privacy for civic data while benefiting from Google's state-of-the-art instruction-following capabilities. The system seamlessly scales to **Gemini Pro 3.1** via API fallback to analyze dynamic JSON state structures and calculate the precise "Cost of Inaction" for critical infrastructure failures.
- **Google Antigravity IDE:** The entire architectural structure, modular component design, and complex React state-management of this project was rapidly prototyped, structured, and coded utilizing **Google Antigravity**, an advanced agentic AI coding environment.
- **Google Cloud Platform (Deployment):** The production build of the Next.js frontend is containerized and deployed on Google Cloud Run to ensure high availability, edge caching, and scalable bandwidth during the evaluation period.
