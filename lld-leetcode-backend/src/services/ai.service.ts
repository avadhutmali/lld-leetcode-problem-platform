// src/services/ai.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { AICheck, TestCaseResult, EvaluationResult, LLDTestCase } from '../types/testCase.types';
import { runAllStructuralChecks } from './structural.service';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // Force the model to return JSON
    generationConfig: { responseMimeType: "application/json" }
});

/**
 * Evaluate AI-based test cases
 */
async function evaluateAIChecks(
    problemDescription: string,
    userCode: string,
    language: string,
    aiChecks: AICheck[]
): Promise<TestCaseResult[]> {
    if (aiChecks.length === 0) return [];

    const checksDescription = aiChecks.map((check, i) => `
    ${i + 1}. ID: "${check.id}"
       Name: "${check.name}"
       Criteria: "${check.criteria}"
       Pass indicators: ${check.passIndicators?.join(', ') || 'N/A'}
       Fail indicators: ${check.failIndicators?.join(', ') || 'N/A'}
       Points: ${check.weight}
    `).join('\n');

    const prompt = `
You are a Senior Software Architect evaluating ${language} code for design quality.

PROBLEM:
${problemDescription}

USER CODE:
${userCode}

DESIGN CHECKS TO EVALUATE:
${checksDescription}

For EACH check, determine if it PASSES or FAILS based on the code.

OUTPUT FORMAT (strict JSON):
{
    "results": [
        {
            "id": "check-id-here",
            "status": "pass" or "fail",
            "reason": "Brief explanation (1-2 sentences)"
        }
    ],
    "summary": "One sentence overall assessment",
    "suggestions": ["Improvement tip 1", "Improvement tip 2"]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        // Map AI results to TestCaseResult format
        return aiChecks.map(check => {
            const aiResult = parsed.results?.find((r: any) => r.id === check.id);
            const passed = aiResult?.status === 'pass';
            return {
                id: check.id,
                name: check.name,
                type: 'ai' as const,
                status: passed ? 'pass' : 'fail',
                reason: aiResult?.reason || 'No evaluation available',
                pointsEarned: passed ? check.weight : 0,
                pointsPossible: check.weight,
            };
        });
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        // Return failed results on error
        return aiChecks.map(check => ({
            id: check.id,
            name: check.name,
            type: 'ai' as const,
            status: 'fail' as const,
            reason: 'AI evaluation failed',
            pointsEarned: 0,
            pointsPossible: check.weight,
        }));
    }
}

/**
 * Main evaluation function - Hybrid approach
 * 1. Run structural checks (fast, deterministic)
 * 2. Run AI checks (slower, subjective)
 * 3. Combine results
 */
export const evaluateCode = async (
    problemDescription: string,
    userCode: string,
    language: string,
    testCases: LLDTestCase[] = []
): Promise<EvaluationResult> => {
    // Separate structural and AI checks
    const structuralChecks = testCases.filter((tc): tc is import('../types/testCase.types').StructuralCheck => tc.type === 'structural');
    const aiChecks = testCases.filter((tc): tc is AICheck => tc.type === 'ai');

    // Run structural checks (instant)
    const structuralResults = runAllStructuralChecks(
        userCode,
        structuralChecks,
        language as 'java' | 'typescript' | 'cpp'
    );

    // Run AI checks (async)
    const aiResults = await evaluateAIChecks(problemDescription, userCode, language, aiChecks);

    // Combine all results
    const allResults = [...structuralResults, ...aiResults];
    const totalScore = allResults.reduce((sum, r) => sum + r.pointsEarned, 0);
    const maxScore = allResults.reduce((sum, r) => sum + r.pointsPossible, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Generate summary
    const passedCount = allResults.filter(r => r.status === 'pass').length;
    const summary = `${passedCount}/${allResults.length} checks passed (${percentage}% score)`;

    // Collect suggestions from failed checks
    const suggestions = allResults
        .filter(r => r.status === 'fail')
        .map(r => `Fix: ${r.name} - ${r.reason}`)
        .slice(0, 3);

    return {
        totalScore,
        maxScore,
        percentage,
        testResults: allResults,
        summary,
        suggestions,
    };
};

/**
 * Legacy function for backward compatibility
 * Used when no structured test cases are defined
 */
export const evaluateCodeLegacy = async (problemDescription: string, userCode: string, language: string) => {
    const prompt = `
    You are a Senior Software Architect. 
    Review the following ${language} code for the problem: "${problemDescription}".
    
    LANGUAGE CONTEXT:
    The user is writing in ${language}. Ensure your feedback uses ${language} specific terminology.

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