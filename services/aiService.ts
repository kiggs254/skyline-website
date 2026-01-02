import { AIItineraryResponse, TripPlanRequest, DestinationInsight } from "../types";
import * as geminiService from './geminiService';
import * as openAiService from './openAiService';

type AIProvider = 'gemini' | 'openai';

export const generateTripPlan = async (
  request: TripPlanRequest,
  provider: AIProvider
): Promise<AIItineraryResponse> => {
  if (provider === 'openai') {
    return openAiService.generateTripPlan(request);
  }
  // Default to Gemini
  return geminiService.generateTripPlan(request);
};

export const getDestinationInsights = async (
  destinationName: string,
  provider: AIProvider
): Promise<DestinationInsight> => {
  if (provider === 'openai') {
    return openAiService.getDestinationInsights(destinationName);
  }
  // Default to Gemini
  return geminiService.getDestinationInsights(destinationName);
};