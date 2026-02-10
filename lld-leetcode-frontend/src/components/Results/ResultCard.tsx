import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SolidResult {
    principle: string;
    status: "Pass" | "Fail";
    reason: string;
}

interface ResultProps {
    results: SolidResult[];
    score: number;
    loading: boolean;
}

const ResultCard: React.FC<ResultProps> = ({ results, score, loading }) => {
    if (loading) return <div className="text-white animate-pulse">Running AI Analysis...</div>;
    if (!results || results.length === 0) return <div className="text-gray-400">Run code to see analysis.</div>;

    return (
        <div className="bg-gray-900 p-4 rounded-lg h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-xl font-bold text-white">Design Analysis</h3>
                <span className={`px-3 py-1 rounded-full font-bold ${score > 70 ? 'bg-green-600' : 'bg-red-600'}`}>
                    Score: {score}/100
                </span>
            </div>

            <div className="space-y-3">
                {results.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-md border ${item.status === 'Pass' ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {item.status === 'Pass' 
                                ? <CheckCircle className="text-green-500 w-5 h-5" /> 
                                : <XCircle className="text-red-500 w-5 h-5" />
                            }
                            <span className="font-semibold text-gray-200">{item.principle}</span>
                        </div>
                        <p className="text-sm text-gray-400 ml-7">{item.reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultCard;