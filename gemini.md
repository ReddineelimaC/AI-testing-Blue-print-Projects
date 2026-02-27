# Project Constitution

## Data Schemas
**Input Payload (From Client to App):**
```json
{
  "user_input": "string (the component/feature to test)"
}
```

**Ollama API Request Payload (App to Ollama):**
```json
{
  "model": "llama3.2",
  "messages": [
    {
      "role": "system",
      "content": "string (The Testcase Generator Template)"
    },
    {
      "role": "user",
      "content": "string (user input)"
    }
  ],
  "stream": true 
}
```

**Output Payload (Ollama to App):**
```json
{
  "message": {
    "role": "assistant",
    "content": "string (Generated Test Cases)"
  }
}
```

## Behavioral Rules
- Use deterministic, self-healing automation.
- Prioritize reliability over speed.
- Never guess at business logic.
- User enters an input, and the app uses a predefined template to prompt Ollama (llama3.2) to generate test cases.
- Provide a responsive Chat UI for interacting with the local model.

## Architectural Invariants
- Follow the A.N.T. 3-layer architecture.
- Follow the B.L.A.S.T. protocol.
- Client Side: HTML/Vanilla JS/CSS UI.
- Backend/API Layer: Local Ollama instance handling inference.
