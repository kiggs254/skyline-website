import { AIItineraryResponse, TripPlanRequest, DestinationInsight } from "../types";
import { getOpenAiApiKey } from '../lib/apiUtil';

const apiKey = getOpenAiApiKey();
const API_URL = 'https://api.openai.com/v1/chat/completions';
// FIX: Updated error message to avoid exposing implementation details like VITE_OPENAI_API_KEY.
const NO_API_KEY_ERROR = "AI service is not configured. The OpenAI API key is missing.";

const callOpenAI = async (prompt: string, jsonSchema: any) => {
    if (!apiKey) {
        throw new Error(NO_API_KEY_ERROR);
    }

    const body = {
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: `You are a helpful travel assistant. Respond with a valid JSON object that strictly adheres to this schema: ${JSON.stringify(jsonSchema)}`
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: { type: "json_object" }
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(errorData.error?.message || "Failed to fetch from OpenAI API");
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
};

export const generateTripPlan = async (request: TripPlanRequest): Promise<AIItineraryResponse> => {
  try {
    const prompt = `
      Plan a trip to ${request.destination} for ${request.days} days for ${request.travelers} travelers.
      Budget level: ${request.budget}.
      Interests: ${request.interests}.
      
      Provide a structured itinerary including a catchy trip title, a brief summary, an estimated total cost in KES (Kenya Shillings), and a day-by-day breakdown of activities.
    `;
    
    const schema = {
        type: "object",
        properties: {
            tripTitle: { type: "string" },
            summary: { type: "string" },
            estimatedCost: { type: "string" },
            itinerary: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        day: { type: "integer" },
                        title: { type: "string" },
                        activities: { type: "array", items: { type: "string" } }
                    },
                    required: ["day", "title", "activities"]
                }
            }
        },
        required: ["tripTitle", "summary", "estimatedCost", "itinerary"]
    };

    return await callOpenAI(prompt, schema) as AIItineraryResponse;

  } catch (error) {
    console.error("Error generating trip with OpenAI:", error);
    const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
    return {
      tripTitle: "AI Planner Offline (OpenAI)",
      summary: errorMessage,
      estimatedCost: "N/A",
      itinerary: [{ day: 1, title: "Configuration Error", activities: ["Could not connect to the OpenAI service."] }]
    };
  }
};

export const getDestinationInsights = async (destinationName: string): Promise<DestinationInsight> => {
  try {
    const prompt = `
      Provide a detailed travel guide for ${destinationName}.
      The response must be a single string containing Markdown formatting.
      Structure your response with exactly these 3 Markdown headers (starting with ##):
      1. Best Time to Visit
      2. Top Local Attractions (list 3-5 specific places)
      3. Cultural Tips (etiquette, dress code, local customs)
      Keep the content engaging and helpful for a tourist.
    `;

    // OpenAI doesn't have a direct schema for a single string, so we wrap it.
    const schema = {
        type: "object",
        properties: {
            content: {
                type: "string",
                description: "The full travel guide content in Markdown format."
            }
        },
        required: ["content"]
    };

    const result = await callOpenAI(prompt, schema);

    // OpenAI does not provide verifiable sources like Gemini's search grounding.
    return { content: result.content, sources: [] };

  } catch (error) {
    console.error("Error fetching destination details with OpenAI:", error);
    return {
      content: "## Error\nWe could not fetch live details at this moment. Please contact us directly for information.",
      sources: []
    };
  }
};
