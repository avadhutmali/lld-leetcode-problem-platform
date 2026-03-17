import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Terminal, Cpu, Brain } from 'lucide-react';

// New structured test case type
interface TestCase {
    id: string;
    name: string;
    type: 'structural' | 'ai';
    weight: number;
}

// New evaluation result types
interface TestCaseResult {
    id: string;
    name: string;
    type: 'structural' | 'ai';
    status: 'pass' | 'fail';
    reason: string;
    pointsEarned: number;
    pointsPossible: number;
}

interface EvaluationResult {
    totalScore: number;
    maxScore: number;
    percentage: number;
    testResults: TestCaseResult[];
    summary: string;
    suggestions: string[];
}

// Legacy result type (v1)
interface LegacyResult {
    score: number;
    feedback_summary: string;
    solid_analysis: Array<{
        principle: string;
        status: 'Pass' | 'Fail';
        reason: string;
    }>;
    suggestions: string[];
}

interface ConsoleProps {
    testCases: TestCase[];
    results: EvaluationResult | LegacyResult | null;
    loading: boolean;
    onRun: () => void;
}

// Type guard for new v2 results
const isV2Result = (results: any): results is EvaluationResult => {
    return results && 'testResults' in results;
};

const ProblemConsole: React.FC<ConsoleProps> = ({ testCases, results, loading, onRun }) => {
    const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
    const [activeTestId, setActiveTestId] = useState<string | null>(null);

    useEffect(() => {
        if (testCases?.length > 0 && !activeTestId) {
            setActiveTestId(testCases[0].id);
        }
    }, [testCases, activeTestId]);

    useEffect(() => {
        if (results) setActiveTab('result');
    }, [results]);

    const activeTest = testCases?.find(tc => tc.id === activeTestId);
    
    // Calculate score for indicator
    const getScore = () => {
        if (!results) return 0;
        if (isV2Result(results)) return results.percentage;
        return results.score;
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-gray-700">
            {/* --- HEADER TABS --- */}
            <div className="flex items-center bg-[#2d2d2d] h-10 px-2 select-none">
                <button
                    onClick={() => setActiveTab('testcase')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-t-md font-medium transition-colors ${
                        activeTab === 'testcase' ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Terminal className="w-4 h-4" />
                    Test Cases ({testCases?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('result')}
                    disabled={!results && !loading}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-t-md font-medium transition-colors ${
                        activeTab === 'result' 
                            ? 'bg-[#1e1e1e] text-white' 
                            : 'text-gray-400 hover:text-gray-200 disabled:opacity-50'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${results ? (getScore() >= 70 ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-500'}`} />
                    Results
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                
                {/* TAB 1: TEST CASES OVERVIEW */}
                {activeTab === 'testcase' && (
                    <div className="h-full flex flex-col">
                        {/* Test Case List */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {testCases?.map((tc) => (
                                <button
                                    key={tc.id}
                                    onClick={() => setActiveTestId(tc.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        activeTestId === tc.id 
                                        ? 'bg-gray-700 text-white border border-gray-500' 
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent'
                                    }`}
                                >
                                    {tc.type === 'structural' ? (
                                        <Cpu className="w-3 h-3 text-blue-400" />
                                    ) : (
                                        <Brain className="w-3 h-3 text-purple-400" />
                                    )}
                                    <span className="truncate max-w-[120px]">{tc.name}</span>
                                    <span className="text-gray-500">({tc.weight}pts)</span>
                                </button>
                            ))}
                        </div>

                        {/* Selected Test Details */}
                        {activeTest && (
                            <div className="space-y-3 text-gray-300 border-t border-gray-700 pt-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                        activeTest.type === 'structural' 
                                        ? 'bg-blue-900/50 text-blue-400 border border-blue-700' 
                                        : 'bg-purple-900/50 text-purple-400 border border-purple-700'
                                    }`}>
                                        {activeTest.type}
                                    </span>
                                    <span className="text-white font-semibold">{activeTest.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {activeTest.type === 'structural' 
                                        ? '⚡ Checked automatically via code analysis' 
                                        : '🤖 Evaluated by AI for design quality'}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Points: <span className="text-white font-bold">{activeTest.weight}</span>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-blue-400" />
                                <span>Structural (instant)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Brain className="w-3 h-3 text-purple-400" />
                                <span>AI-evaluated</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: RESULTS */}
                {activeTab === 'result' && (
                    <div className="h-full overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-3">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"/>
                                    <span>Running structural checks...</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"/>
                                    <span>AI evaluation in progress...</span>
                                </div>
                            </div>
                        ) : !results ? (
                            <div className="text-gray-500 text-center py-8">Run code to see results.</div>
                        ) : isV2Result(results) ? (
                            /* V2 Results Display */
                            <div className="space-y-4">
                                {/* Score Header */}
                                <div className={`flex items-center justify-between p-4 rounded-lg ${
                                    results.percentage >= 70 ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'
                                }`}>
                                    <div>
                                        <div className={`text-2xl font-bold ${results.percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                                            {results.percentage >= 70 ? '✓ Accepted' : '✗ Needs Improvement'}
                                        </div>
                                        <div className="text-sm text-gray-400">{results.summary}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-3xl font-bold ${results.percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                                            {results.percentage}%
                                        </div>
                                        <div className="text-xs text-gray-500">{results.totalScore}/{results.maxScore} pts</div>
                                    </div>
                                </div>

                                {/* Test Results Grid */}
                                <div className="space-y-2">
                                    {results.testResults.map((result) => (
                                        <div 
                                            key={result.id} 
                                            className={`p-3 rounded border-l-4 bg-gray-800/30 ${
                                                result.status === 'pass' ? 'border-green-500' : 'border-red-500'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {result.status === 'pass' 
                                                        ? <CheckCircle className="w-4 h-4 text-green-500"/> 
                                                        : <XCircle className="w-4 h-4 text-red-500"/>
                                                    }
                                                    {result.type === 'structural' 
                                                        ? <Cpu className="w-3 h-3 text-blue-400"/>
                                                        : <Brain className="w-3 h-3 text-purple-400"/>
                                                    }
                                                    <span className="font-semibold text-gray-200">{result.name}</span>
                                                </div>
                                                <span className={`text-xs font-mono ${result.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {result.pointsEarned}/{result.pointsPossible}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 ml-6 pl-3">{result.reason}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Suggestions */}
                                {results.suggestions.length > 0 && (
                                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                                        <div className="text-yellow-500 text-xs font-bold uppercase mb-2">💡 Suggestions</div>
                                        <ul className="space-y-1 text-xs text-gray-300">
                                            {results.suggestions.map((s, i) => (
                                                <li key={i}>• {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* V1 Legacy Results Display */
                            <div>
                                <div className={`text-xl font-bold mb-4 ${results.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                                    {results.score >= 80 ? 'Accepted' : 'Wrong Answer'} ({results.score}/100)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {results.solid_analysis?.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-3 rounded border-l-4 bg-gray-800/30 ${
                                                item.status === 'Pass' ? 'border-green-500' : 'border-red-500'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.status === 'Pass' 
                                                    ? <CheckCircle className="w-4 h-4 text-green-500"/> 
                                                    : <XCircle className="w-4 h-4 text-red-500"/>
                                                }
                                                <span className="font-semibold text-gray-200">{item.principle}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 ml-6">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTION BAR --- */}
            <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 shrink-0">
                <div className="text-xs text-gray-500">
                    {testCases?.length || 0} checks • {testCases?.filter(t => t.type === 'structural').length || 0} structural • {testCases?.filter(t => t.type === 'ai').length || 0} AI
                </div>
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`px-5 py-1.5 rounded text-sm font-semibold transition-colors ${
                        loading 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                >
                    {loading ? 'Evaluating...' : 'Run'}
                </button>
            </div>
        </div>
    );
};

export default ProblemConsole;