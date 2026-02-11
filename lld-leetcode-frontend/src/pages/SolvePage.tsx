import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Panel, Group } from "react-resizable-panels";
import ResizeHandle from '../components/Workspace/ResizeHandle';
import { ChevronDown } from 'lucide-react';

import CodeEditor from '../components/Editor/CodeEditor';
import ProblemConsole from '../components/Workspace/ProblemConsole';
import { submitCode, getProblems } from '../services/api';

const SolvePage = () => {
    const { id } = useParams();
    
    // State
    const [language, setLanguage] = useState<'typescript' | 'java' | 'cpp'>('java');
    const [code, setCode] = useState("// Loading...");
    const [problem, setProblem] = useState<any>(null);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Fetch problem logic (Same as before)
    useEffect(() => {
        const fetchProblem = async () => {
            const allProblems = await getProblems();
            const found = allProblems.find((p: any) => p.id === id);
            if (found) {
                setProblem(found);
                setCode(found.starterCode[language]);
            }
        };
        fetchProblem();
    }, [id]);

    const handleLanguageChange = (newLang: 'typescript' | 'java' | 'cpp') => {
        setLanguage(newLang);
        if (problem) setCode(problem.starterCode[newLang]);
    };

    const handleRun = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await submitCode(id, code, language);
            if (response.success) setResults(response.data);
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!problem) return <div className="text-white p-10">Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
            {/* --- NAVBAR --- */}
            <nav className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-[#282828] shrink-0">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-200">LLD LeetCode</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-sm text-gray-300 truncate max-w-[200px]">{problem.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Language Dropdown */}
                    <div className="relative group z-50">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#333] hover:bg-[#444] rounded text-sm transition-colors border border-gray-600">
                            <span className="capitalize text-green-400 font-mono">{language === 'cpp' ? 'C++' : language}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-[#2d2d2d] border border-gray-600 rounded shadow-xl hidden group-hover:block">
                            {['java', 'cpp', 'typescript'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang as any)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#3d3d3d] capitalize text-gray-300"
                                >
                                    {lang === 'cpp' ? 'C++' : lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleRun}
                        disabled={loading}
                        className={`px-6 py-1.5 rounded-md font-medium text-sm transition-all ${
                            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {loading ? 'Judging...' : 'Run Code'}
                    </button>
                </div>
            </nav>

            {/* --- RESIZABLE WORKSPACE --- */}
            <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal">
                    
                    {/* LEFT PANEL: Problem Description */}
                    <Panel defaultSize={35} minSize={20}>
                        <div className="h-full flex flex-col bg-[#1e1e1e]">
                            <div className="p-6 overflow-y-auto custom-scrollbar h-full">
                                <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
                                <div className="flex gap-2 mb-6">
                                    <span className="px-3 py-1 bg-yellow-900/40 text-yellow-500 text-xs rounded-full border border-yellow-700/50">
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <div className="prose prose-invert prose-sm text-gray-300 whitespace-pre-wrap pb-10">
                                    {problem.description}
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* DRAG HANDLE (Left <-> Right) */}
                    <ResizeHandle direction="horizontal" />

                    {/* RIGHT PANEL: Editor + Console */}
                    <Panel minSize={30}>
                        <Group orientation="vertical">
                            
                            {/* TOP RIGHT: Code Editor */}
                            <Panel defaultSize={60} minSize={20}>
                                <div className="h-full w-full">
                                    <CodeEditor 
                                        code={code} 
                                        onChange={(val) => setCode(val || "")} 
                                        language={language} 
                                    />
                                </div>
                            </Panel>

                            {/* DRAG HANDLE (Top <-> Bottom) */}
                            <ResizeHandle direction="vertical" />

                            {/* BOTTOM RIGHT: Console */}
                            <Panel defaultSize={40} minSize={10}>
                                <div className="h-full w-full overflow-hidden">
                                    <ProblemConsole 
                                        testCases={problem.testCases} 
                                        results={results} 
                                        loading={loading} 
                                        onRun={handleRun}
                                    />
                                </div>
                            </Panel>

                        </Group>
                    </Panel>

                </Group>
            </div>
        </div>
    );
};

export default SolvePage;