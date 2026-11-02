import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import { Code2, CheckCircle, ArrowRight } from 'lucide-react';

const DIFF = {
    easy: 'text-green-400  bg-green-400/10  border-green-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    hard: 'text-red-400    bg-red-400/10    border-red-400/30',
};

const Skeleton = () => (
    <div className="animate-pulse p-5 md:p-8 space-y-4 max-w-4xl mx-auto w-full">
        <div className="h-8 bg-[#21262d] rounded w-1/3" />
        <div className="h-4 bg-[#21262d] rounded w-1/6" />
        <div className="h-px bg-[#30363d] my-6" />
        <div className="h-24 bg-[#21262d] rounded" />
        <div className="h-32 bg-[#21262d] rounded" />
    </div>
);

const CodingPage = () => {
    const navigate = useNavigate();
    
    // Problem list
    const [problems, setProblems] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [filterDiff, setFilterDiff] = useState('all');

    // Active problem
    const [selectedId, setSelectedId] = useState(null);
    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(false);

    useEffect(() => {
        apiCall('/api/coding/problems/')
            .then(d => setProblems(d.problems || []))
            .catch(() => { })
            .finally(() => setLoadingList(false));
    }, []);

    const loadProblem = async (p) => {
        if (p.id === selectedId) return; // Already selected
        setSelectedId(p.id);
        setProblem(null);
        setLoadingProblem(true);

        try {
            const detail = await apiCall(`/api/coding/problems/${p.id}/`);
            setProblem(detail);
        } catch { }
        setLoadingProblem(false);
    };

    const filtered = problems.filter(p => {
        const matchText = p.title.toLowerCase().includes(filterText.toLowerCase());
        const matchDiff = filterDiff === 'all' || p.difficulty === filterDiff;
        return matchText && matchDiff;
    });

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden bg-[#0d1117]">
            {/* LEFT: Problem List */}
            <div className="shrink-0 flex flex-col border-r border-[#30363d] bg-[#161b22] w-72 md:w-80 transition-all h-full">
                {/* Header */}
                <div className="px-4 py-4 border-b border-[#30363d] space-y-3 shrink-0">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Code2 className="w-5 h-5 text-[#58a6ff]" /> Problems
                        <span className="ml-auto text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full">{filtered.length}</span>
                    </div>
                    <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)}
                        placeholder="Search…"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-[#58a6ff] placeholder-[#8b949e]" />
                    <div className="flex gap-1.5 pt-1">
                        {['all', 'easy', 'medium', 'hard'].map(d => (
                            <button key={d} onClick={() => setFilterDiff(d)}
                                className={`flex-1 text-[11px] font-semibold py-1.5 rounded capitalize transition-colors
                                    ${filterDiff === d
                                        ? d === 'easy' ? 'bg-green-500/20 text-green-400' : d === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : d === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-[#58a6ff]/20 text-[#58a6ff]'
                                        : 'text-[#8b949e] hover:text-[#c9d1d9] bg-[#21262d]'}`}>
                                {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Problem list */}
                <div className="flex-1 overflow-y-auto">
                    {loadingList ? (
                        <div className="p-4 space-y-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse h-16 bg-[#21262d] rounded-lg" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-[#8b949e] text-sm">No problems match your filters</div>
                    ) : filtered.map(p => (
                        <button key={p.id} onClick={() => loadProblem(p)}
                            className={`w-full text-left px-4 py-3 border-b border-[#21262d] hover:bg-[#21262d] transition-colors
                                ${selectedId === p.id ? 'bg-[#1f6feb]/10 border-l-[3px] border-l-[#58a6ff]' : 'border-l-[3px] border-l-transparent'}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${DIFF[p.difficulty]}`}>
                                    {p.difficulty}
                                </span>
                                {p.solved && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" title="Solved" />}
                            </div>
                            <p className={`text-sm font-medium leading-snug ${selectedId === p.id ? 'text-[#58a6ff]' : 'text-[#c9d1d9]'}`}>
                                {p.title}
                            </p>
                            {p.topic_tags?.length > 0 && (
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {p.topic_tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Problem Description View */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] h-full relative">
                <div className="flex-1 overflow-y-auto w-full">
                    {!selectedId ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-20 h-20 bg-[#161b22] rounded-full flex items-center justify-center mb-6 border border-[#30363d]">
                                <Code2 className="w-10 h-10 text-[#58a6ff]" />
                            </div>
                            <h3 className="text-[#c9d1d9] font-bold text-xl mb-2">Welcome to Coding Challenge</h3>
                            <p className="text-[#8b949e] text-base max-w-sm">Select a problem from the list on the left to view details and start solving.</p>
                        </div>
                    ) : loadingProblem ? <Skeleton /> : problem ? (
                        <div className="p-6 md:p-8 lg:p-10 space-y-6 max-w-5xl mx-auto w-full pb-32">
                            {/* Title & Solve button header */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h2 className="text-white font-bold text-2xl md:text-3xl">{problem.title}</h2>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded border capitalize ${DIFF[problem.difficulty]}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    {problem.topic_tags?.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {problem.topic_tags.map(tag => (
                                                <span key={tag} className="text-xs font-medium text-[#c9d1d9] bg-[#21262d] px-2.5 py-1 rounded-full border border-[#30363d]">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:hidden">
                                     <button
                                        onClick={() => navigate(`/coding/problem/${problem.id}`)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        <Code2 className="w-5 h-5" />
                                        Solve Problem
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>

                            <hr className="border-[#30363d]" />

                            {/* Description */}
                            <div className="text-[#c9d1d9] text-base leading-relaxed whitespace-pre-wrap font-sans">
                                {problem.description}
                            </div>

                            {/* Constraints */}
                            {problem.constraints && (
                                <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-5 shadow-sm">
                                    <p className="text-[#8b949e] text-sm font-bold uppercase tracking-wider mb-3">Constraints</p>
                                    <pre className="text-[#c9d1d9] text-sm font-mono whitespace-pre-wrap">{problem.constraints}</pre>
                                </div>
                            )}

                            {/* Sample Input / Output */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-5 shadow-sm overflow-x-auto">
                                    <p className="text-[#8b949e] text-sm font-bold uppercase tracking-wider mb-3">Sample Input</p>
                                    <pre className="text-[#c9d1d9] text-sm font-mono">{problem.sample_input || '—'}</pre>
                                </div>
                                <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-5 shadow-sm overflow-x-auto">
                                    <p className="text-[#8b949e] text-sm font-bold uppercase tracking-wider mb-3">Sample Output</p>
                                    <pre className="text-green-400 text-sm font-mono">{problem.sample_output || '—'}</pre>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
                
                {/* Floating Solve Button (Desktop) */}
                {selectedId && !loadingProblem && problem && (
                    <div className="hidden md:flex absolute bottom-8 right-8 z-10">
                        <button
                            onClick={() => navigate(`/coding/problem/${problem.id}`)}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <Code2 className="w-5 h-5" />
                            Solve Problem
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodingPage;
