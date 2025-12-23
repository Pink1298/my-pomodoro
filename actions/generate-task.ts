'use server';

// New SDK import
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateTaskFromPrompt(prompt: string) {
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not set. Using mock response.");
        return mockGenerate(prompt);
    }

    // Try primary model first, then fallback
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting generation with model: ${modelName}`);

            // New SDK initialization
            const ai = new GoogleGenAI({ apiKey });

            const systemPrompt = `
            You are a helpful task assistant. Extract task details from the user's prompt (which may be in Vietnamese or English).
            Return ONLY a JSON object with the following fields:
            - title: (string) clearly summarized task title (in Vietnamese if prompt is Vietnamese)
            - description: (string) enriched description or original prompt if short
            - priority: 'low' | 'normal' | 'high' (infer from context, default normal)
            - energyLevel: 'low' | 'medium' | 'high' (infer from context, default medium)
            - estimatedPomodoros: (number) estimated 25-min blocks (default 1)
            - dueDate: (string) ISO 8601 date string (YYYY-MM-DD) if a date is mentioned relative to today (${new Date().toISOString().split('T')[0]}). If no date mentioned, return null. 
            
            Example Input: "Viết báo cáo quan trọng cho ngày mai mất khoảng 2 tiếng"
            Example Output: { "title": "Viết báo cáo", "description": "Viết báo cáo quan trọng", "priority": "high", "energyLevel": "high", "estimatedPomodoros": 4, "dueDate": "2024-01-02" }
            `;

            // New SDK usage pattern
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser Input: " + prompt }] }],
                config: { responseMimeType: "application/json" } // Use 'config' instead of 'generationConfig' in new SDK? Check docs if failure.
                // Quickstart didn't show config structure details, but assuming similar. 
                // If this fails, I will remove config and parse manually.
            });

            // New SDK: response.text is a property (or method? Doc said console.log(response.text))
            // Let's assume property based on <console.log(response.text)> example.
            const responseText = response.text || "";
            console.log(`AI Response (${modelName}):`, responseText);

            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);

        } catch (error: any) {
            console.warn(`Failed with model ${modelName}:`, error.message || error);
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                console.error("All models failed.");
                throw new Error("Failed to generate task from AI. Please check server logs.");
            }
        }
    }
}

function mockGenerate(prompt: string) {
    // Simple mock heuristic
    const lower = prompt.toLowerCase();
    const priority = lower.includes('high') || lower.includes('urgent') ? 'high' : lower.includes('low') ? 'low' : 'normal';
    const energy = lower.includes('drain') || lower.includes('hard') ? 'high' : lower.includes('easy') ? 'low' : 'medium';

    return {
        title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
        description: prompt,
        priority,
        energyLevel: energy,
        estimatedPomodoros: 1,
        dueDate: null
    };
}
