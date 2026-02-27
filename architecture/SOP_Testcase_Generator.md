# SOP: Local Testcase Generator

## 1. Goal
Generate behavior-driven and unit test cases based on user-provided component descriptions or code snippets using a locally hosted LLM (Ollama), prioritizing reliability and deterministic execution of the API calls.

## 2. Inputs Payload
- `user_input` (string): The code snippet, function, or feature description to be tested.
- `system_prompt` (string): The instruction template for the LLM to format the test cases. (To be provided by the user).
- `model` (string): Fixed to `llama3.2`.

## 3. Architecture & Routing (Layer 2 & 3 Integration)
1. **Trigger / Entry (UI Layer)**: User enters input via the web-based Chat Interface.
2. **Pre-flight Check (Tools Layer)**: The backend/UI verifies the connection to the Ollama daemon via `http://localhost:11434/api/tags`.
3. **Payload Construction**: The system frames the request, pairing the predefined System Prompt template with the User Input.
4. **Execution**: A streaming `POST` request is routed to `http://localhost:11434/api/chat`. 
5. **Return**: The streaming JSON response is caught, parsed, and routed back to the rendering engine.

## 4. Edge Cases & Error Handling
- **Ollama Host Unreachable**: If the `pre-flight` handshake fails, execution halts immediately. The user receives a clear instruction to launch the local Ollama process.
- **Target Model Missing**: If the model `llama3.2` is not found during inference, execution halts, instructing the user to run `ollama pull llama3.2`.
- **Empty Payload**: If `user_input` is null or empty string, the execution is bypassed completely to save resources.
- **Malformed Stream Chunks**: The JSON chunk parser implements a strict `try/catch` wrapper to discard split chunks from the local model stream without breaking the application state.
