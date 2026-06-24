import sys
import pickle
import json

def load_model():
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    with open('model.pkl', 'rb') as f:
        clf = pickle.load(f)
    return vectorizer, clf

def extract_category(text):
    lower = text.lower()
    if 'pothole' in lower or 'road' in lower: return 'POTHOLE'
    if 'water' in lower or 'leak' in lower or 'pipe' in lower: return 'WATER_LEAK'
    if 'garbage' in lower or 'trash' in lower or 'waste' in lower: return 'GARBAGE'
    if 'light' in lower or 'lamp' in lower or 'dark' in lower: return 'STREETLIGHT'
    return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided"}))
        return

    user_input = sys.argv[1]
    
    try:
        vectorizer, clf = load_model()
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
        return

    # Vectorize and Predict
    X = vectorizer.transform([user_input])
    prediction = clf.predict(X)[0]
    
    # Optional: we can extract confidence using decision_function if we wanted to
    category = extract_category(user_input)
    
    # Return JSON to the Node.js API
    output = {
        "intent": prediction,
        "category": category,
        "original_input": user_input
    }
    
    print(json.dumps(output))

if __name__ == '__main__':
    main()
