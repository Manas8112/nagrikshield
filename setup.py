import os
import sys
import subprocess
import urllib.request
import json
import time

def check_ollama():
    print("Checking for Ollama instance on http://localhost:11434...")
    try:
        req = urllib.request.Request("http://localhost:11434/api/version", method="GET")
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                print("✅ Ollama is running.")
                return True
    except Exception:
        print("❌ Ollama is NOT running or not installed.")
        print("\n--- ACTION REQUIRED ---")
        print("Please install Ollama from https://ollama.com and ensure it is running.")
        print("Alternatively, if you wish to use the Google Gemini API, provide a GEMINI_API_KEY in a .env file (Feature toggled in python_ai/chat_llm.py).")
        return False

def check_gemma3():
    print("Checking for Google's Gemma 2 model (gemma2:2b) in Ollama...")
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            models = [m.get("name") for m in data.get("models", [])]
            if "gemma2:2b" in models or "gemma2:latest" in models or "gemma2:2b-instruct-q4_K_M" in models:
                print("✅ Gemma 2 model found.")
                return True
            else:
                print("❌ Gemma 2 model NOT found.")
                print("Attempting to pull gemma2:2b. This may take a few minutes...")
                pull_req = urllib.request.Request("http://localhost:11434/api/pull", data=json.dumps({"name": "gemma2:2b"}).encode(), headers={'Content-Type': 'application/json'}, method="POST")
                with urllib.request.urlopen(pull_req) as pull_response:
                    print("✅ Successfully pulled Gemma 2 model.")
                    return True
    except Exception as e:
        print(f"❌ Failed to verify Gemma 2 model: {e}")
        return False

def setup_python_env():
    print("\nSetting up Python backend dependencies...")
    os.chdir("python_ai")
    
    # Check if we should create a virtual environment
    if not os.path.exists(".venv"):
        print("Creating virtual environment...")
        subprocess.check_call([sys.executable, "-m", "venv", ".venv"])
    
    pip_executable = os.path.join(".venv", "Scripts", "pip") if os.name == 'nt' else os.path.join(".venv", "bin", "pip")
    python_executable = os.path.join(".venv", "Scripts", "python") if os.name == 'nt' else os.path.join(".venv", "bin", "python")
    
    print("Installing requirements...")
    subprocess.check_call([pip_executable, "install", "flask", "requests", "sentence-transformers", "scikit-learn", "numpy", "transformers", "torch", "datasets", "accelerate", "pillow", "flask-cors"])
    
    print("✅ Python backend setup complete.")
    os.chdir("..")
    return python_executable

def setup_node_env():
    print("\nSetting up Node.js frontend dependencies...")
    subprocess.check_call(["npm", "install"], shell=(os.name == 'nt'))
    print("✅ Node.js setup complete.")

def main():
    print("="*50)
    print(" NagrikShield Setup Script ")
    print("="*50)
    
    ollama_ok = check_ollama()
    if ollama_ok:
        check_gemma3()
    
    python_exe = setup_python_env()
    setup_node_env()
    
    print("\n" + "="*50)
    print(" 🎉 SETUP COMPLETE! 🎉")
    print("="*50)
    print("\nTo start the application, you need two terminal windows:")
    print("\n1. Start the AI Engine (Terminal 1):")
    print("   cd python_ai")
    print(f"   {python_exe} chat_llm.py")
    print("\n2. Start the Next.js Frontend (Terminal 2):")
    print("   npm run dev")
    print("\nOpen http://localhost:3000 in your browser.")
    print("="*50)

if __name__ == "__main__":
    main()
