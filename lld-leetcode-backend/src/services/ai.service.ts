// src/services/ai.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    // Force the model to return JSON
    generationConfig: { responseMimeType: "application/json" }
});

export const evaluateCode = async (problemDescription: string, userCode: string) => {
    const prompt = `
    You are a Senior Software Architect acting as a Unit Test engine for Low-Level Design (LLD).
    
    TASK:
    Analyze the following code solution for the problem: "${problemDescription}".
    Check for strict adherence to SOLID principles and Design Patterns.

    INPUT CODE:
    ${userCode}

    OUTPUT FORMAT:
    Return a valid JSON object strictly matching this schema:
    {
        "score": number (0-100),
        "feedback_summary": "One sentence summary",
        "solid_analysis": [
            { "principle": "S - Single Responsibility", "status": "Pass" or "Fail", "reason": "Short explanation" },
            { "principle": "O - Open/Closed", "status": "Pass" or "Fail", "reason": "Short explanation" },
            { "principle": "L - Liskov Substitution", "status": "Pass" or "Fail", "reason": "Short explanation" },
            { "principle": "I - Interface Segregation", "status": "Pass" or "Fail", "reason": "Short explanation" },
            { "principle": "D - Dependency Inversion", "status": "Pass" or "Fail", "reason": "Short explanation" }
        ],
        "suggestions": ["Tip 1", "Tip 2"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Gemini is usually good at returning pure JSON when asked, 
        // but we parse it to be safe.
        return JSON.parse(responseText);

    } catch (error) {
        console.error("Gemini Error:", error);
        return {
            score: 0,
            feedback_summary: "Error evaluating code.",
            solid_analysis: [],
            suggestions: ["AI Service Unavailable"]
        };
    }
};