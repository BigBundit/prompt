
import { GoogleGenAI } from "@google/genai";
import { SceneData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const formatDataForPrompt = (data: SceneData): string => {
    return Object.entries(data)
        .filter(([, value]) => value && value.trim() !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
};

export const generateProjectName = async (data: SceneData): Promise<string> => {
    if (!API_KEY) {
        return "สร้างชื่ออัตโนมัติ (ต้องการ API Key)";
    }
    
    const sceneDescription = formatDataForPrompt(data);
    if (!sceneDescription) {
        return "โปรเจคไม่มีชื่อ";
    }

    const prompt = `จากข้อมูลฉากต่อไปนี้: "${sceneDescription}" \n\nโปรดตั้งชื่อโปรเจคที่สร้างสรรค์และสั้นกระชับเป็นภาษาไทย ไม่เกิน 10 คำ.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 1,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating project name:", error);
        return "เกิดข้อผิดพลาดในการสร้างชื่อ";
    }
};
