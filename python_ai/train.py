import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
import os

def train_model():
    print("Loading dataset...")
    with open('intents.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    sentences = []
    labels = []

    for item in data:
        intent = item['intent']
        for example in item['examples']:
            sentences.append(example)
            labels.append(intent)

    print(f"Loaded {len(sentences)} training examples across {len(data)} intents.")

    # Convert text into TF-IDF numerical vectors
    print("Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
    X = vectorizer.fit_transform(sentences)

    # Train a Linear Support Vector Classifier (extremely fast, great for small datasets)
    print("Training LinearSVC model...")
    clf = LinearSVC(C=1.0, random_state=42)
    clf.fit(X, labels)

    print("Model trained successfully. Saving artifacts...")
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf, f)

    print("Done! model.pkl and vectorizer.pkl created.")

if __name__ == '__main__':
    train_model()
