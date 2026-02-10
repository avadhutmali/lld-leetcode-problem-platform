// src/controllers/submission.controller.ts
import { Request, Response } from 'express';
import { evaluateCode } from '../services/ai.service';
import { PROBLEMS } from '../data/problems';

export const submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Get data from frontend
        const { problemId, code } = req.body;

        // 2. Find the problem in our "Mock DB"
        const problem = PROBLEMS.find(p => p.id === problemId);

        if (!problem) {
            res.status(404).json({ success: false, message: "Problem not found" });
            return;
        }

        // 3. Send to Gemini
        console.log(`Evaluating submission for: ${problem.title}...`);
        const aiResult = await evaluateCode(problem.description, code);

        // 4. Return result to frontend
        res.json({
            success: true,
            data: aiResult
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProblems = (req: Request, res: Response) => {
    // Simple endpoint to list all problems for the frontend
    res.json(PROBLEMS);
};