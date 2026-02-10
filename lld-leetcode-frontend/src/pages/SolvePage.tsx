import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/Editor/CodeEditor';
import ResultCard from '../components/Results/ResultCard';
import { submitCode, getProblems } from '../services/api';

const SolvePage = () => {
    const { id } = useParams();
    const [code, setCode] = useState("// Write your Low Level Design here...");
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [problem, setProblem] = useState<any>(null);

    // Fetch problem details on load
    useEffect(() => {
        const fetchProblem = async () => {
            const allProblems = await getProblems();
            const found = allProblems.find((p: any) => p.id === id);
            if (found) {
                setProblem(found);
                setCode(found.starterCode || "// Start coding...");
            }
        };
        fetchProblem();
    }, [id]);

    const handleRun = async () => {
        setLoading(true);
        try {
            const response = await submitCode(id!, code);
            setResults(response.data); // Should match the JSON from backend
        } catch (error) {
            console.error("Error submitting code", error);
        } finally {
            setLoading(false);
        }
    };

    if (!problem) return <div className="text-white p-10">Loading Problem...</div>;

    return (
        <div className="h-screen flex flex-col bg-black text-white">
            {/* Navbar */}
            <nav className="h-14 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900">
                <h1 className="font-bold text-lg">LLD LeetCode</h1>
                <button 
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Run Code'}
                </button>
            </nav>

            {/* Main Content Grid */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Description */}
                <div className="w-1/4 border-r border-gray-800 p-6 overflow-y-auto bg-gray-900/50">
                    <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                    <div className="prose prose-invert">
                        <p className="text-gray-300">{problem.description}</p>
                    </div>
                </div>

                {/* Middle Panel: Editor */}
                <div className="w-2/4 border-r border-gray-800 bg-[#1e1e1e]">
                    <CodeEditor code={code} onChange={(val) => setCode(val || "")} />
                </div>

                {/* Right Panel: Results */}
                <div className="w-1/4 bg-gray-900/50 p-4 overflow-y-auto">
                    <ResultCard 
                        results={results?.solid_analysis} 
                        score={results?.score || 0}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default SolvePage;