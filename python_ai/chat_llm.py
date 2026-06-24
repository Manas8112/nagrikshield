import sys
import json
import sqlite3
import numpy as np
from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import requests

app = Flask(__name__)

# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------
# Ollama API (already running on your machine!)
OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "gemma3:4b"  # Maximum intelligence — Google's latest Gemma 4

print(f"Using Ollama model: {OLLAMA_MODEL}", file=sys.stderr)
print("Loading RAG Pipeline...", file=sys.stderr)

# Load RAG resources
embedder = SentenceTransformer('all-MiniLM-L6-v2')
rag_index = np.load('rag_index.npz')['embeddings']
with open('rag_corpus.json', 'r', encoding='utf-8') as f:
    rag_corpus = json.load(f)

# ---------------------------------------------------------
# FULL DATABASE SNAPSHOT ENGINE
# Dumps the entire DB state into the prompt so the LLM
# can answer ANY question without us anticipating edge cases.
# ---------------------------------------------------------
DB_PATH = '../data/database.sqlite'

def get_full_db_snapshot():
    """
    Builds a complete, human-readable snapshot of the entire database.
    Injected into EVERY prompt for true general intelligence.
    """
    snapshot = []
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # --- USERS ---
        cursor.execute("SELECT data FROM documents WHERE model='users'")
        users_raw = [json.loads(r[0]) for r in cursor.fetchall()]
        
        admins = []
        user_lines = []
        for u in users_raw:
            role_tag = f" [{u.get('role','user').upper()}]" if u.get('role') != 'user' else ""
            user_lines.append(
                f"  - {u.get('name','?')}{role_tag}: Level {u.get('level',1)}, "
                f"{u.get('xp',0)} XP, {u.get('shieldPoints',0)} SP, "
                f"{u.get('issuesReported',0)} reports, {u.get('issuesValidated',0)} validations, "
                f"Accuracy: {u.get('accuracy',0)}, Area: {u.get('neighborhood','?')}"
            )
            if u.get('role') in ('admin', 'department_head'):
                admins.append(u.get('name','?'))
        
        snapshot.append(f"REGISTERED USERS ({len(users_raw)} total, Admins: {', '.join(admins) if admins else 'none'}):")
        snapshot.append("\n".join(user_lines[:20]))
        
        # --- ISSUES ---
        cursor.execute("SELECT data FROM documents WHERE model='issues'")
        issues_raw = [json.loads(r[0]) for r in cursor.fetchall()]
        
        active = [i for i in issues_raw if i.get('status') != 'resolved']
        resolved = [i for i in issues_raw if i.get('status') == 'resolved']
        
        # Category breakdown
        cats = {}
        for i in issues_raw:
            c = i.get('category', 'other')
            cats[c] = cats.get(c, 0) + 1
        cat_str = ", ".join([f"{k}: {v}" for k, v in cats.items()])
        
        snapshot.append(f"\nISSUES ({len(issues_raw)} total, {len(active)} active, {len(resolved)} resolved):")
        snapshot.append(f"  Categories: {cat_str}")
        
        # All active issues (Gemma can handle the context)
        sorted_issues = sorted(active, key=lambda x: x.get('reportedAt', ''), reverse=True)[:15]
        for i in sorted_issues:
            reporter = next((u.get('name') for u in users_raw if u.get('id') == i.get('reportedBy')), 'Unknown')
            date = i.get('reportedAt', '')[:10]
            snapshot.append(
                f"  - [{i.get('status','?').upper()}] \"{i.get('title','?')}\" ({i.get('category','?')}) "
                f"by {reporter} on {date}, Severity: {i.get('severity','?')}/10, "
                f"Area: {i.get('neighborhood','?')}, ID: {i.get('id','?')}"
            )
        
        conn.close()
    except Exception as e:
        snapshot.append(f"[DB Error: {e}]")
    
    return "\n".join(snapshot)

print("Server ready!", file=sys.stderr)

# ---------------------------------------------------------
# CHAT API ENDPOINT
# ---------------------------------------------------------
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '')
    live_context = data.get('live_context', '')
    history = data.get('history', [])
    
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    # 1. RAG Retrieval
    print("Retrieving civic knowledge context...", file=sys.stderr)
    user_embedding = embedder.encode([user_input], convert_to_numpy=True)
    similarities = cosine_similarity(user_embedding, rag_index)[0]
    best_idx = np.argmax(similarities)
    
    retrieved_context = ""
    if similarities[best_idx] > 0.3:
        retrieved_context = rag_corpus[best_idx]
        print(f"RAG Context Found: {retrieved_context[:50]}...", file=sys.stderr)

    # 2. Full database snapshot
    print("Building database snapshot...", file=sys.stderr)
    db_snapshot = get_full_db_snapshot()

    # 3. Build system prompt with ALL context
    system_prompt = f"""You are 'Earth Guardian', the AI assistant for NagrikShield — a civic tech platform where citizens report infrastructure issues (potholes, water leaks, garbage, streetlights) and earn XP/Shield Points for participation.

YOUR PERSONALITY:
- Speak with confidence, modern flair, and technological authority
- Use Markdown: **bold** for emphasis, bullet points for lists
- Be concise but impressive — like a futuristic city guardian
- Sound elite and premium, never like a generic chatbot

YOUR LIVE DATABASE (USE THIS DATA TO ANSWER QUESTIONS):
{db_snapshot}

{f"KNOWLEDGE BASE: {retrieved_context}" if retrieved_context else ""}

{f"ADDITIONAL CONTEXT FROM FRONTEND: {live_context}" if live_context else ""}

CRITICAL RULES:
1. When asked about statistics, users, issues, admins — ONLY use the data above. Never invent numbers.
2. When referring to issues, mention the reporter name, date, severity, and area.
3. Issue detail pages: /issue/ISSUE_ID (e.g., /issue/i-1). Format as markdown links: [View Issue](/issue/i-1)
4. Report new issues: [Report Issue](/report)
5. View map: [View Map](/map)
6. User profiles: [My Profile](/profile)
7. If asked something not in the data, say so honestly.
8. Keep answers focused — 2-4 sentences for simple questions, more for complex ones.
9. Always use the EXACT numbers from the database. Never guess or approximate.
10. If the user is submitting feedback, a feature request, or an idea to improve the platform, you MUST include the exact text `[INTENT: FEEDBACK]` somewhere in your response. This signals the system to save their request to the Admin Dashboard."""

    # Format history for Ollama
    formatted_history = []
    for msg in history:
        # Avoid passing internal tool text back to the LLM
        role = "assistant" if msg.get("role") == "assistant" else "user"
        content = msg.get("text", "")
        # Only add valid text messages to history
        if content and not content.startswith("[SYSTEM:"):
            formatted_history.append({"role": role, "content": content})

    # Combine all messages
    messages = [{"role": "system", "content": system_prompt}] + formatted_history + [{"role": "user", "content": user_input}]

    # 4. Call Ollama API
    print(f"Calling Ollama ({OLLAMA_MODEL})...", file=sys.stderr)
    try:
        ollama_response = requests.post(OLLAMA_URL, json={
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 400
            }
        }, timeout=60)
        
        result = ollama_response.json()
        if "error" in result:
            err_msg = result["error"]
            if "requires more system memory" in err_msg:
                response = f"⚠️ **GPU Memory Error:** The massive `{OLLAMA_MODEL}` requires more free VRAM than is currently available on your RTX 4060. Please close some background applications to free up VRAM, or switch the backend model back to `gemma3:4b` in `chat_llm.py`."
            else:
                response = f"⚠️ **Ollama Error:** {err_msg}"
        else:
            response = result.get("message", {}).get("content", "I'm having trouble generating a response right now.")
        print(f"Ollama response: {response[:100]}...", file=sys.stderr)
        
    except requests.exceptions.ConnectionError:
        response = "⚠️ The AI engine (Ollama) is not running. Please start it with `ollama serve` in a terminal."
        print("ERROR: Ollama not reachable!", file=sys.stderr)
    except Exception as e:
        response = f"An error occurred while processing your request."
        print(f"Ollama error: {e}", file=sys.stderr)

    output = {
        "intent": "LLM_GENERATED",
        "category": None,
        "original_input": user_input,
        "text": response
    }
    
    return jsonify(output)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
