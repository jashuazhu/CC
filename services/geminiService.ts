import { GoogleGenAI } from "@google/genai";
import { Statistics, AssetType } from "../types";

export const getMarketAnalysis = async (
  asset: AssetType,
  stats: Statistics,
  recentTrend: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Error: API_KEY is missing in environment variables.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Analyze the following crypto market data for ${asset}.
      
      Statistics:
      - Max Price: $${stats.max}
      - Min Price: $${stats.min}
      - Mean Price: $${stats.mean}
      - Std Dev: $${stats.stdDev}
      
      Recent Trend Description: ${recentTrend}
      
      Provide a concise summary (max 3 sentences) of the market volatility and a potential short-term outlook. Do not give financial advice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to fetch AI analysis.";
  }
};
