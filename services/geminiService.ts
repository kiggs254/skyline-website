import { GoogleGenAI, Type } from "@google/genai";
import { AIItineraryResponse, TripPlanRequest, DestinationInsight } from "../types";
import { getGeminiApiKey } from '../lib/apiUtil';

const apiKey = getGeminiApiKey();
const NO_API_KEY_ERROR = "AI service is not configured. The API key is missing. Please configure it in your environment variables (API_KEY).";

const getAiInstance = () => {
    if (!apiKey) {
        console.error(NO_API_KEY_ERROR);
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateTripPlan = async (request: TripPlanRequest): Promise<AIItineraryResponse> => {
  const ai = getAiInstance();
  if (!ai) {
    return {
      tripTitle: "AI Planner Offline",
      summary: NO_API_KEY_ERROR,
      estimatedCost: "N/A",
      itinerary: [{ day: 1, title: "Configuration Error", activities: ["Could not connect to the AI service."] }]
    };
  }
  
  try {
    const prompt = `
      Plan a trip to ${request.destination} for ${request.days} days for ${request.travelers} travelers.
      Budget level: ${request.budget}.
      Interests: ${request.interests}.
      
      Provide a structured itinerary including a catchy trip title, a brief summary, estimated total cost in KES (Kenya Shillings), and a day-by-day breakdown of activities.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedCost: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIItineraryResponse;
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Error generating trip:", error);
    // Fallback response in case of API error or quota limits
    return {
      tripTitle: "Classic Harob Safari (Fallback)",
      summary: "We encountered an issue generating your custom AI plan, but here is our recommended classic itinerary.",
      estimatedCost: "KES 45,000 - 60,000",
      itinerary: [
        { day: 1, title: "Arrival & Relaxation", activities: ["Airport pickup", "Check-in to hotel", "Evening relaxation"] },
        { day: 2, title: "Adventure Begins", activities: ["Morning game drive", "Local cultural visit"] },
        { day: 3, title: "Exploration", activities: ["Full day excursion", "Sunset viewpoint"] }
      ]
    };
  }
};

export const getDestinationInsights = async (destinationName: string): Promise<DestinationInsight> => {
  const ai = getAiInstance();
  if (!ai) {
      return {
          content: `## AI Guide Offline\n${NO_API_KEY_ERROR}`,
          sources: []
      };
  }
  
  try {
    // Using Search Grounding to get real-time info
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Provide a detailed travel guide for ${destinationName}. 
        Structure your response with exactly these 3 Markdown headers (##):
        1. Best Time to Visit
        2. Top Local Attractions (list 3-5 specific places)
        3. Cultural Tips (etiquette, dress code, local customs)

        Keep the content engaging and helpful for a tourist.
      `,
      config: {
        tools: [{ googleSearch: {} }], 
        // Note: responseMimeType cannot be used with googleSearch
      }
    });

    const text = response.text || "Information currently unavailable.";
    
    // Extract sources from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => {
        if (c.web) {
          return { title: c.web.title, url: c.web.uri };
        }
        return null;
      })
      .filter((s: any) => s !== null) as { title: string; url: string }[];

    return { content: text, sources };

  } catch (error) {
    console.error("Error fetching destination details:", error);
    return {
      content: "## Error\nWe could not fetch live details at this moment. Please contact us directly for information.",
      sources: []
    };
  }
};
