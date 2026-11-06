CHECK THE SERVERLESS LLM ENDPOINT. Independent of the hero build. Read AGENTS.md rules first.

Background: apps/web/api/ask.ts reportedly calls a Gemini 1.5-family model, and that model family may have been retired by Google.

1. Open apps/web/api/ask.ts and the UI that exposes it. List the model id, the request shape, and how failures are handled.
2. If you have web access, check Google's current Gemini API documentation for the model id and whether it is still served. If you do not have web access, say so and do not guess a replacement id.
3. Make the model id configurable through an environment variable (for example GEMINI_MODEL) and document it in docs/ENVIRONMENT.md. Do not hard-code a replacement id that you could not verify.
4. Make sure a failed or retired-model response is handled gracefully: the UI falls back to local retrieval with a short plain message, never a raw error or a stack trace, and the LLM toggle is hidden when no key or model is configured.
5. Never log or expose API keys. Run npm test and npm run build; report real results. Do not run git commit or push.
