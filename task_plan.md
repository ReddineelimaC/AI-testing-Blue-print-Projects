# Task Plan

## Phase 1: Planning and Discovery
- [x] Answer Discovery Questions
- [x] Define Data Schema in `gemini.md`
- [x] Approve the Blueprint

## Phase 2: L - Link (Connections & APIs)
- [x] Test all API connections and `.env` credentials (Local Ollama port 11434).
- [x] Build minimal scripts in `tools/` (e.g. `test_ollama.py`) to verify that external services are responding correctly.
- [x] Create basic HTML UI structure with chat interface.
- [x] Implement vanilla JS logic to connect to local Ollama API (`localhost:11434/api/chat`).
- [x] Set up the internal prompt template for Test Case Generation.

## Phase 3: A - Architect (Core Logic & Parsing)
- [x] Develop the payload formatter (injecting user input into the template).
- [x] Handle real-time streaming response from Ollama (so the chat feels alive).
- [x] Parse and display markdown output (test cases) cleanly in the UI.

## Phase 4: S - Stylize (Error Handling & UX)
- [x] Style the Chat UI to look premium (Glassmorphism, Dark mode, Animations).
- [x] Add specific visual cues (loading states, "Ollama is thinking...", error messages if Ollama is unreachable).

## Phase 5: T - Trigger (Testing & E2E)
- [ ] Paste the Master Prompt into `script.js`.
- [ ] Start Ollama and test end-to-end with the llama3.2 model.
- [ ] Test the UI with a real component request.
