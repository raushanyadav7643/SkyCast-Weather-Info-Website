
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, AirQualityData } from "../types";

export const getAIWeatherAdvice = async (weather: WeatherData, aqi: AirQualityData | null): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const aqiText = aqi ? `Air Quality Index is ${aqi.list[0].main.aqi} (1-5).` : "";
    const prompt = `
      Act as a local weather expert. Given the current weather in ${weather.name}:
      - Condition: ${weather.weather[0].description}
      - Temperature: ${weather.main.temp}°
      - Humidity: ${weather.main.humidity}%
      - Wind: ${weather.wind.speed} m/s
      ${aqiText}
      
      Provide a concise 2-sentence piece of advice for residents. 
      Mention what to wear and any health/activity tips. 
      Keep it professional but friendly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Stay prepared for the changing conditions today!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Weather looks typical for the season. Stay safe!";
  }
};

export const getCoordinatesByAI = async (query: string): Promise<{lat: number, lon: number, name: string} | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `Find the precise geographic coordinates (latitude and longitude) and the official name for this location: "${query}". It could be a village, block, district, or any landmark. Return the result in JSON format.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lon: { type: Type.NUMBER },
            name: { type: Type.STRING },
          },
          required: ["lat", "lon", "name"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Geocoding Error:", error);
    return null;
  }
};
