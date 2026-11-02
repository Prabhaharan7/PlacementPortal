import React from 'react';

const DIFF = {
    easy: 'text-green-400  bg-green-400/10  border-green-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    hard: 'text-red-400    bg-red-400/10    border-red-400/30',
};

const ProblemDescription = ({ problem }) => {
    if (!problem) return null;

    return (
        <div className="p-5 space-y-4">
            {/* Title */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-white font-bold text-lg">{problem.title}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border capitalize ${DIFF[problem.difficulty]}`}>
                        {problem.difficulty}
                    </span>
                </div>
                {problem.topic_tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                        {problem.topic_tags.map(tag => (
                            <span key={tag} className="text-[10px] text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full border border-[#30363d]">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="text-[#c9d1d9] text-sm leading-relaxed whitespace-pre-wrap">
                {problem.description}
            </div>

            {/* Constraints */}
            {problem.constraints && (
                <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-3">
                    <p className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-2">Constraints</p>
                    <pre className="text-[#c9d1d9] text-xs font-mono whitespace-pre-wrap">{problem.constraints}</pre>
                </div>
            )}

            {/* Sample Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-3 overflow-x-auto">
                    <p className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-2">Sample Input</p>
                    <pre className="text-[#c9d1d9] text-xs font-mono">{problem.sample_input || '—'}</pre>
                </div>
                <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-3 overflow-x-auto">
                    <p className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-2">Sample Output</p>
                    <pre className="text-green-400 text-xs font-mono">{problem.sample_output || '—'}</pre>
                </div>
            </div>

            {/* Explanation */}
            {problem.explanation && (
                <div className="bg-[#1f6feb]/5 rounded-lg border border-[#1f6feb]/20 p-3 mt-4">
                    <p className="text-[#58a6ff] text-xs font-semibold uppercase tracking-wider mb-1.5">Explanation</p>
                    <p className="text-[#c9d1d9] text-sm">{problem.explanation}</p>
                </div>
            )}
        </div>
    );
};

export default ProblemDescription;
