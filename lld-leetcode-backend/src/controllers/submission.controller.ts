// src/controllers/submission.controller.ts
import { Request, Response } from 'express';
import { evaluateCode } from '../services/ai.service';
import { PROBLEMS } from '../data/problems';

export const submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { problemId, code, language } = req.body; // Extract language

        const problem = PROBLEMS.find(p => p.id === problemId);
        if (!problem) { res.status(404).json({message: "Problem not found"}); return; }

        // Pass language to AI
        const aiResult = await evaluateCode(problem.description, code, language); 

        res.json({ success: true, data: aiResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProblems = (req: Request, res: Response) => {
    // Simple endpoint to list all problems for the frontend
    res.json(PROBLEMS);
};