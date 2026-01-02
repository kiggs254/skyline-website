// This function retrieves the Gemini API key.
// The value is securely injected by the Vite build process from your hosting environment variables.
export const getGeminiApiKey = (): string | undefined => {
    // Per coding guidelines, the API key must be obtained *exclusively* from `process.env.API_KEY`.
    // The Vite config (`vite.config.ts`) is responsible for defining this variable.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        return apiKey;
    }
    
    // FIX: Updated warning to avoid exposing implementation details like VITE_GEMINI_API_KEY.
    console.warn('[API Util] Gemini API Key not found. The application will not be able to connect to the Gemini API.');
    return undefined;
};

// This function retrieves the OpenAI API key.
// The value is securely injected by the Vite build process from your hosting environment variables.
export const getOpenAiApiKey = (): string | undefined => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
        return apiKey;
    }

    // FIX: Updated warning to avoid exposing implementation details like VITE_OPENAI_API_KEY.
    console.warn('[API Util] OpenAI API Key not found. The application will not be able to connect to the OpenAI API.');
    return undefined;
};
