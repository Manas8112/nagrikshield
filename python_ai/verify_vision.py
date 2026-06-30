import sys
import json
import torch
import clip
from PIL import Image
import io
import urllib.request
import base64
import requests
import warnings

warnings.filterwarnings("ignore")

def load_image(img_str):
    try:
        if img_str.startswith('http'):
            req = urllib.request.Request(img_str, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            return Image.open(io.BytesIO(response.read())).convert('RGB')
        elif img_str.startswith('data:image'):
            header, encoded = img_str.split(",", 1)
            return Image.open(io.BytesIO(base64.b64decode(encoded))).convert('RGB')
        else:
            try:
                return Image.open(io.BytesIO(base64.b64decode(img_str))).convert('RGB')
            except:
                return Image.open(img_str).convert('RGB')
    except Exception as e:
        print(f"[DEBUG] Error loading image: {str(e)}", file=sys.stderr)
        return None

def get_target_description(title, description):
    try:
        print("[DEBUG] Generating target text via LLM...", file=sys.stderr)
        prompt = f"Given the civic issue titled '{title}' with description '{description}', write a single short sentence describing exactly what a photograph of the FIXED and RESOLVED state of this issue would look like. Do not include introductory text, just the visual description."
        
        payload = {
            "model": "gemma2:2b",
            "prompt": prompt,
            "stream": False
        }
        res = requests.post("http://127.0.0.1:11434/api/generate", json=payload)
        res_json = res.json()
        target_text = res_json.get("response", "").strip()
        print(f"[DEBUG] Generated text: {target_text}", file=sys.stderr)
        
        if not target_text or len(target_text) > 200:
            return "A cleanly repaired civic area matching the issue title: " + title
            
        return target_text
    except Exception as e:
        print(f"[DEBUG] Error contacting LLM: {str(e)}", file=sys.stderr)
        return "A cleanly repaired civic area matching the issue title: " + title

def main():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Missing arguments"}))
        return

    img1_str = sys.argv[1] 
    img2_str = sys.argv[2] 
    title = sys.argv[3]
    description = sys.argv[4]

    print("[DEBUG] Loading proof image...", file=sys.stderr)
    img2 = load_image(img2_str)

    if not img2:
        print(json.dumps({"error": "Failed to load proof image", "verified": False}))
        return

    try:
        target_text = get_target_description(title, description)
        
        print("[DEBUG] Loading CLIP model...", file=sys.stderr)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model, preprocess = clip.load("ViT-B/32", device=device)
        
        print("[DEBUG] Extracting features...", file=sys.stderr)
        image = preprocess(img2).unsqueeze(0).to(device)
        # CLIP text has a 77 context limit, truncate if LLM gave too much
        text = clip.tokenize([target_text[:300]], truncate=True).to(device)
        
        with torch.no_grad():
            image_features = model.encode_image(image)
            text_features = model.encode_text(text)
            
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            similarity = (image_features @ text_features.T).item()
            
            threshold = 0.22
            verified = similarity > threshold
            
            if verified:
                error_msg = f"VERIFIED: Proof matches expected target: '{target_text}'"
            else:
                error_msg = f"REJECTED: Proof does not match expected target: '{target_text}'. (Score: {similarity:.3f})"
                
            result = {
                "similarity": similarity,
                "verified": verified,
                "error": error_msg if not verified else None,
                "confidence": min(similarity * 300, 99.9) 
            }
            print(json.dumps(result))

    except Exception as e:
        print(f"[DEBUG] Verification Error: {str(e)}", file=sys.stderr)
        print(json.dumps({"error": str(e), "verified": False}))

if __name__ == "__main__":
    main()
