import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

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

    const statusById = useMemo(() => {
        if (!results || !isV2Result(results)) return new Map<string, 'pass' | 'fail'>();
        return new Map(results.testResults.map(r => [r.id, r.status] as const));
    }, [results]);

    const colorForStatus = (status?: 'pass' | 'fail') => {
        if (loading) return 'bg-amber-400';
        if (status === 'pass') return 'bg-emerald-400';
        if (status === 'fail') return 'bg-rose-400';
        return 'bg-[#8b949e]';
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] border-t border-[#30363d]">
            {/* --- HEADER TABS --- */}
            <div className="flex items-center bg-[#0d1117] h-10 px-2 select-none border-b border-[#30363d]">
                <button
                    onClick={() => setActiveTab('testcase')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-t-md font-medium transition-colors ${
                        activeTab === 'testcase' ? 'bg-[#161b22] text-[#c9d1d9]' : 'text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                >
                    Test Cases ({testCases?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('result')}
                    disabled={!results && !loading}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-t-md font-medium transition-colors ${
                        activeTab === 'result' 
                            ? 'bg-[#161b22] text-[#c9d1d9]' 
                            : 'text-[#8b949e] hover:text-[#c9d1d9] disabled:opacity-50'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${results ? (getScore() >= 70 ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-[#8b949e]'}`} />
                    Results
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 px-3 py-3 overflow-y-auto font-mono text-sm">
                
                {/* TAB 1: TEST CASES OVERVIEW */}
                {activeTab === 'testcase' && (
                    <div className="h-full flex flex-col">
                        {/* Test Case List */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {testCases?.map((tc) => (
                                (() => {
                                    const status = statusById.get(tc.id);
                                    return (
                                <button
                                    key={tc.id}
                                    onClick={() => setActiveTestId(tc.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        activeTestId === tc.id 
                                        ? 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d]' 
                                        : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22] border border-[#30363d]'
                                    }`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${colorForStatus(status)}`} />
                                    <span className="truncate max-w-[120px]">{tc.name}</span>
                                    <span className="text-[#8b949e]">({tc.weight}pts)</span>
                                </button>
                                    );
                                })()
                            ))}
                        </div>

                        {/* Selected Test Details */}
                        {activeTest && (
                            <div className="mt-2 rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-[#c9d1d9] truncate">{activeTest.name}</div>
                                        <div className="text-xs text-[#8b949e]">
                                            {activeTest.type === 'structural' ? 'Automatic structural check' : 'AI design check'}
                                        </div>
                                    </div>
                                    <div className="shrink-0 inline-flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                                        ⚡ {activeTest.weight} pts
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: RESULTS */}
                {activeTab === 'result' && (
                    <div className="h-full overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-3">
                                <div className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"/>
                                    <span>Evaluating…</span>
                                </div>
                            </div>
                        ) : !results ? (
                            <div className="text-[#8b949e] text-center py-8">Run code to see results.</div>
                        ) : isV2Result(results) ? (
                            /* V2 Results Display */
                            <div className="space-y-4">
                                {/* Score Header */}
                                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                    results.percentage >= 70 ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-rose-950/30 border-rose-800/60'
                                }`}>
                                    <div>
                                        <div className={`text-2xl font-bold ${results.percentage >= 70 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                            {results.percentage >= 70 ? '✓ Accepted' : '✗ Needs Improvement'}
                                        </div>
                                        <div className="text-sm text-[#8b949e]">{results.summary}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-3xl font-bold ${results.percentage >= 70 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                            {results.percentage}%
                                        </div>
                                        <div className="text-xs text-[#8b949e]">{results.totalScore}/{results.maxScore} pts</div>
                                    </div>
                                </div>

                                {/* Test Results Grid */}
                                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 space-y-2">
                                    {results.testResults.map((result) => (
                                        <div 
                                            key={result.id} 
                                            className={`p-3 rounded border ${
                                                result.status === 'pass'
                                                    ? 'border-emerald-900/40 bg-emerald-950/20'
                                                    : 'border-rose-900/40 bg-rose-950/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {result.status === 'pass' 
                                                        ? <CheckCircle className="w-4 h-4 text-emerald-400"/> 
                                                        : <XCircle className="w-4 h-4 text-rose-400"/>
                                                    }
                                                    <span className="font-semibold text-[#c9d1d9]">{result.name}</span>
                                                </div>
                                                <span className="text-xs font-mono text-amber-300 border border-amber-800/60 bg-amber-950/30 rounded-full px-2 py-0.5">
                                                    ⚡ {result.pointsEarned}/{result.pointsPossible} pts
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#8b949e] ml-6 pl-3">{result.reason}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Suggestions */}
                                {results.suggestions.length > 0 && (
                                    <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/60 rounded">
                                        <div className="text-amber-300 text-xs font-bold uppercase mb-2">Suggestions</div>
                                        <ul className="space-y-1 text-xs text-[#c9d1d9]">
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
                                <div className={`text-xl font-bold mb-4 ${results.score >= 80 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    {results.score >= 80 ? 'Accepted' : 'Wrong Answer'} ({results.score}/100)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {results.solid_analysis?.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-3 rounded border border-[#30363d] bg-[#161b22]`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.status === 'Pass' 
                                                    ? <CheckCircle className="w-4 h-4 text-emerald-400"/> 
                                                    : <XCircle className="w-4 h-4 text-rose-400"/>
                                                }
                                                <span className="font-semibold text-[#c9d1d9]">{item.principle}</span>
                                            </div>
                                            <p className="text-xs text-[#8b949e] ml-6">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTION BAR --- */}
            <div className="h-12 bg-[#0d1117] flex items-center justify-between px-4 shrink-0 border-t border-[#30363d]">
                <div className="text-xs text-[#8b949e]">
                    {testCases?.length || 0} checks
                </div>
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`px-5 py-1.5 rounded text-sm font-semibold transition-colors ${
                        loading 
                        ? 'bg-[#161b22] text-[#8b949e] border border-[#30363d] cursor-not-allowed' 
                        : 'bg-[#ffa116] hover:bg-[#ffb23b] text-black'
                    }`}
                >
                    {loading ? 'Evaluating...' : 'Run'}
                </button>
            </div>
        </div>
    );
};

export default ProblemConsole;