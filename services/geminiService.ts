import { GoogleGenAI, Type } from "@google/genai";
import { LoginAttempt } from '../types';

// FIX: Removed 'as string' to align with Gemini API initialization guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLoginAttempts = async (username: string): Promise<LoginAttempt[]> => {
  try {
    const randomCount = Math.floor(Math.random() * (100 - 15 + 1)) + 15;
    const prompt = `For the Instagram user '${username}', generate a list of ${randomCount} fake login attempts. Provide details for each attempt. For the 'loginLocation', generate locations mostly around Baku, Azerbaijan (e.g., 'Bakı, Binə qəsəbəsi', 'Gənclik, Bakı'). For the 'loginMethod', use either 'Normal Giriş' or 'Hack Girişi'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              deviceType: {
                type: Type.STRING,
                description: "The type of device, e.g., 'Mobil' or 'PC'."
              },
              deviceModel: {
                type: Type.STRING,
                description: "The specific model of the device, e.g., 'iPhone 14 Pro' or 'Windows 11 PC'."
              },
              loginType: {
                type: Type.STRING,
                description: "The method of login, e.g., 'Password', 'Biometric', '2FA'."
              },
              loginTime: {
                type: Type.STRING,
                description: "The timestamp of the login, in a readable format like 'YYYY-MM-DD HH:MM:SS'."
              },
              loginIp: {
                type: Type.STRING,
                description: "A realistic-looking fake IP address for the login."
              },
              loginLocation: {
                type: Type.STRING,
                description: "The geographical location of the login. Mostly around Baku, Azerbaijan."
              },
              loginMethod: {
                type: Type.STRING,
                description: "The method of the login attempt, e.g., 'Normal Giriş' or 'Hack Girişi'."
              }
            },
            required: ["deviceType", "deviceModel", "loginType", "loginTime", "loginIp", "loginLocation", "loginMethod"]
          }
        },
      },
    });

    // FIX: Trim whitespace from the response text before parsing as JSON for robustness.
    const jsonString = response.text.trim();
    const loginAttempts = JSON.parse(jsonString);
    return loginAttempts as LoginAttempt[];

  } catch (error) {
    console.error("Error generating login attempts:", error);
    throw new Error("Failed to generate login history from AI.");
  }
};