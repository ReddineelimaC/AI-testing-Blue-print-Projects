import urllib.request
import json
import sys

def test_ollama():
    url = "http://localhost:11434/api/tags"
    print(f"Testing connection to Ollama at {url}...")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                models = [m.get('name') for m in data.get('models', [])]
                print("====================================")
                print(f"SUCCESS: Ollama is reachable.")
                print(f"Available models: {', '.join(models) if models else 'None'}")
                print("====================================")
                
                if not any('llama3.2' in m for m in models):
                    print("WARNING: 'llama3.2' model not found.")
                    print("Please run: 'ollama pull llama3.2' or 'ollama run llama3.2'")
                else:
                    print("SUCCESS: 'llama3.2' model is available and ready.")
            else:
                print(f"FAILED: Received status code {response.status}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Could not connect to Ollama. Error: {e}")
        print("Please ensure Ollama is installed and running on your local machine.")
        sys.exit(1)

if __name__ == "__main__":
    test_ollama()
