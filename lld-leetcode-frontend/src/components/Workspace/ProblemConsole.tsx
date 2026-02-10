import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Terminal, AlertCircle } from 'lucide-react';

interface TestCase {
    id: number;
    title: string;
    input: string;
    expected: string;
}

interface ConsoleProps {
    testCases: TestCase[]; // Data passed from parent
    results: any;          // AI Results
    loading: boolean;
    onRun: () => void;
}

const ProblemConsole: React.FC<ConsoleProps> = ({ testCases, results, loading, onRun }) => {
    const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
    const [activeCaseId, setActiveCaseId] = useState<number>(1);

    // Automatically switch to 'result' tab when results arrive
    useEffect(() => {
        if (results) setActiveTab('result');
    }, [results]);

    const activeCase = testCases?.find(tc => tc.id === activeCaseId) || testCases?.[0];

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
                    Testcase
                </button>
                <button
                    onClick={() => setActiveTab('result')}
                    disabled={!results && !loading} // Disable if no run yet
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-t-md font-medium transition-colors ${
                        activeTab === 'result' 
                            ? 'bg-[#1e1e1e] text-white' 
                            : 'text-gray-400 hover:text-gray-200 disabled:opacity-50'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${results ? (results.score > 70 ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-500'}`} />
                    Test Result
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                
                {/* STATE 1: TEST CASES (PRE-RUN) */}
                {activeTab === 'testcase' && (
                    <div className="h-full flex flex-col">
                        {/* Case Selector Buttons */}
                        <div className="flex gap-3 mb-6">
                            {testCases?.map((tc) => (
                                <button
                                    key={tc.id}
                                    onClick={() => setActiveCaseId(tc.id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                                        activeCaseId === tc.id 
                                        ? 'bg-gray-700 text-white' 
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    Case {tc.id}
                                </button>
                            ))}
                        </div>

                        {/* Case Details */}
                        {activeCase && (
                            <div className="space-y-4 text-gray-300">
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Check Focus</span>
                                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                                        {activeCase.title}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Constraint / Input</span>
                                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                                        {activeCase.input}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Expected Design</span>
                                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                                        {activeCase.expected}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STATE 2: TEST RESULTS (POST-RUN) */}
                {activeTab === 'result' && (
                    <div className="h-full">
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"/>
                                Running AI Tests...
                            </div>
                        ) : !results ? (
                            <div className="text-gray-500">Run code to see results.</div>
                        ) : (
                            <div>
                                <div className={`text-xl font-bold mb-4 ${results.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                                    {results.score >= 80 ? 'Accepted' : 'Wrong Answer'}
                                </div>

                                {/* Summary Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {results.solid_analysis.map((item: any, idx: number) => (
                                        <div 
                                            key={idx} 
                                            className={`p-3 rounded border-l-4 bg-gray-800/30 ${
                                                item.status === 'Pass' ? 'border-green-500' : 'border-red-500'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.status === 'Pass' ? <CheckCircle className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
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

            {/* --- ACTION BAR (Bottom Right) --- */}
            <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4">
                <div className="text-xs text-gray-500">Console</div>
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`px-5 py-1.5 rounded text-sm font-semibold transition-colors ${
                        loading 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                >
                    {loading ? 'Judging...' : 'Run'}
                </button>
            </div>
        </div>
    );
};

export default ProblemConsole;