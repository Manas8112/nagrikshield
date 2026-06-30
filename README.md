# NagrikShield - Civic Infrastructure Command Center

NagrikShield is an advanced, gamified civic infrastructure reporting and validation platform. It empowers citizens to report public infrastructure issues (like potholes, water leaks, and structural damage) and leverages a sophisticated AI engine and a community "swarm" consensus model to validate, deduplicate, and prioritize those issues for local authorities.

## Architecture and Technical Stack

The platform is designed around a modern, scalable web architecture integrated heavily with machine learning for data validation and workflow automation:

- **Frontend:** Next.js 15 (App Router), React, Leaflet for geospatial mapping, Vanilla CSS for responsive and modern UI styling.
- **Backend AI Engine (Python):** Flask API powering multiple ML nodes:
  - **Computer Vision Pipeline:** OpenAI CLIP (ViT-B/32) model for deep semantic image validation. Verifies the structural integrity and semantic match of "resolved" proof photos against original reports to prevent corruption.
  - **LLM Command Assistant:** Gemini Pro 3.1 and Google's Gemma-3 (4B). 
  - **RAG Implementation:** Uses SentenceTransformers (all-MiniLM-L6-v2) and FAISS/NumPy for vector indexing and high-speed retrieval of civic policy documents.
  - **Deduplication Engine:** Cosine similarity calculation over unique issue "DNA" (geocoordinates, severity, category) to block duplicate reports.
- **Mock Asynchronous Storage:** A custom IndexedDB/LocalStorage wrapper that mimics a high-latency persistent SQL database for the purpose of this demonstration without requiring complex external database provisioning.
- **Google Antigravity IDE:** The entire architectural structure, modular component design, and complex React state-management of this project was rapidly prototyped and coded utilizing Google Antigravity, an advanced agentic AI coding environment.

## Setup Instructions

To evaluate the project locally, a setup script has been provided which automatically configures the Python virtual environment, installs dependencies, and verifies the presence of the necessary local AI models.

### Prerequisites
- Node.js (v18 or higher)
- Python (3.9 or higher)
- Ollama (installed and running locally)

### Installation Steps

1. **Run the Initialization Script:**
   Navigate to the project root and execute the setup script:
   ```bash
   python setup.py
   ```
   *Note: This script will verify your Ollama installation, attempt to download Google's Gemma 3 model if missing, create a Python virtual environment, and install all required pip and npm dependencies.*

2. **Start the Backend AI Engine (Terminal 1):**
   ```bash
   cd python_ai
   # On Windows:
   .venv\Scripts\python chat_llm.py
   # On Mac/Linux:
   .venv/bin/python chat_llm.py
   ```

3. **Start the Next.js Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open a web browser and navigate to `http://localhost:3000`.

## Features and Workflows

- **Issue Reporting & GPS Mapping:** Citizens can pinpoint exact locations using the interactive Leaflet map and upload images of infrastructure damage.
- **4-Layer Fusion API (Simulated):** The system assesses visual data through semantic classification, structural severity scoring, geo-temporal risk multipliers, and generative ROI projections.
- **Gamified Engagement:** Citizens stake "Shield Points" to report issues and earn XP for accurate validation. False reports result in slashed stakes, ensuring high data fidelity.
- **Swarm Consensus:** Nearby citizens must validate reports. The system requires an 85% confidence score from multiple validators before an issue is officially marked as "Community Validated".
- **Admin Command Center:** Authorities can view prioritized issues, dispatch teams, and upload proof-of-resolution photos which are computationally verified by the CLIP vision model.

## Hackathon Evaluation

This repository constitutes the source code submission for the hackathon. 

- For the deployment link, refer to the provided Google Cloud Run URL in our submission document.
- For detailed information regarding the selected problem statement, solution overview, and specific Google technologies utilized, please refer to the `Submission_Doc.md` file included in this repository.
