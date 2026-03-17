// src/controllers/submission.controller.ts
import { Request, Response } from 'express';
import { evaluateCode, evaluateCodeLegacy } from '../services/ai.service';
import { PROBLEMS } from '../data/problems';

export const submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { problemId, code, language } = req.body;

        const problem = PROBLEMS.find(p => p.id === problemId);
        if (!problem) { 
            res.status(404).json({ message: "Problem not found" }); 
            return; 
        }

        // Use new hybrid evaluation if test cases are defined
        if (problem.testCases && problem.testCases.length > 0) {
            const result = await evaluateCode(
                problem.description, 
                code, 
                language, 
                problem.testCases
            );
            res.json({ success: true, data: result, version: 'v2' });
        } else {
            // Fallback to legacy SOLID-only evaluation
            const result = await evaluateCodeLegacy(problem.description, code, language);
            res.json({ success: true, data: result, version: 'v1' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProblems = (req: Request, res: Response) => {
    // Return problems with test case metadata (not full details)
    const problemsForClient = PROBLEMS.map(p => ({
        ...p,
        testCases: p.testCases.map(tc => ({
            id: tc.id,
            name: tc.name,
            type: tc.type,
            weight: tc.weight,
        }))
    }));
    res.json(problemsForClient);
};