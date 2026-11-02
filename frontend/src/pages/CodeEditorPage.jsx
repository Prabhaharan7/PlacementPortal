import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import { ChevronDown, Terminal, List, FileCode, ArrowLeft, Code2, BookOpen } from 'lucide-react';
import CodeEditor from '../components/Coding/CodeEditor';
import ProblemDescription from '../components/Coding/ProblemDescription';
import TestCases from '../components/Coding/TestCases';

const LANGUAGES = [
    {
        id: 'python', label: 'Python 3', monaco: 'python',
        template: '# Write your solution here\n\n',
    },
    {
        id: 'javascript', label: 'JavaScript', monaco: 'javascript',
        template: '// Write your solution here\n\nconst readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", l => lines.push(l.trim()));\nrl.on("close", () => {\n    // process lines[]\n});\n',
    },
    {
        id: 'java', label: 'Java', monaco: 'java',
        template: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n',
    },
    {
        id: 'c', label: 'C', monaco: 'c',
        template: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
    },
    {
        id: 'cpp', label: 'C++', monaco: 'cpp',
        template: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write your solution here\n    return 0;\n}\n',
    },
];

const Skeleton = () => (
    <div className="animate-pulse p-5 space-y-3 w-full h-full">
        <div className="h-6 bg-[#30363d] rounded w-2/3" />
        <div className="h-4 bg-[#30363d] rounded w-1/4" />
        <div className="h-32 bg-[#30363d] rounded" />
        <div className="h-4 bg-[#30363d] rounded" />
        <div className="h-4 bg-[#30363d] rounded w-3/4" />
    </div>
);

const CodeEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Problem state
    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);

    // Editor state
    const codeStore = useRef({});
    const [lang, setLang] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].template);
    const [customInput, setCustomInput] = useState('');

    // Results state
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    
    // UI state
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bottomTab, setBottomTab] = useState('output'); 
    const [bottomOpen, setBottomOpen] = useState(true);
    const [mobileTab, setMobileTab] = useState('problem'); // problem | code | output

    // Panel resize state
    const [descW, setDescW] = useState(40); // 40%
    const [bottomH, setBottomH] = useState(250); 
    const containerRef = useRef(null);
    const dragging = useRef(null);

    const storeKey = (pId, lId) => `${pId}_${lId}`;

    useEffect(() => {
        const fetchProblem = async () => {
            setLoadingProblem(true);
            try {
                const [detail, subs] = await Promise.all([
                    apiCall(`/api/coding/problems/${id}/`),
                    apiCall('/api/coding/submissions/')
                ]);
                setProblem(detail);
                setCustomInput(detail.sample_input || '');
                const stored = codeStore.current[storeKey(id, lang.id)];
                setCode(stored ?? lang.template);
                setSubmissions((subs.submissions || []).filter(s => String(s.problem_id) === String(id)));
            } catch (err) {
                console.error("Error fetching problem details", err);
            }
            setLoadingProblem(false);
        };
        fetchProblem();
    }, [id]);

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return;
            const { type, startX, startY, startVal } = dragging.current;
            if (type === 'desc') {
                const contW = containerRef.current?.offsetWidth || window.innerWidth;
                const delta = ((e.clientX - startX) / contW) * 100;
                setDescW(Math.max(20, Math.min(60, startVal + delta)));
            } else if (type === 'bottom') {
                setBottomH(Math.max(40, Math.min(520, startVal - (e.clientY - startY))));
            }
        };
        const onUp = () => { dragging.current = null; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, []);

    const startDrag = (e, type) => {
        e.preventDefault();
        dragging.current = {
            type, startX: e.clientX, startY: e.clientY,
            startVal: type === 'desc' ? descW : bottomH,
        };
    };

    const VDivider = () => (
        <div
            onMouseDown={e => startDrag(e, 'desc')}
            className="hidden md:flex shrink-0 items-center justify-center w-1 hover:w-1.5 transition-all cursor-col-resize bg-[#30363d] hover:bg-[#58a6ff] group"
            style={{ zIndex: 10 }}
        >
            <div className="w-px h-8 bg-transparent group-hover:bg-[#58a6ff] rounded transition-colors" />
        </div>
    );

    const HDivider = () => (
        <div
            onMouseDown={e => startDrag(e, 'bottom')}
            className="shrink-0 h-1 hover:h-1.5 transition-all cursor-row-resize bg-[#30363d] hover:bg-[#58a6ff] flex items-center justify-center group"
            style={{ zIndex: 10 }}
        >
            <div className="h-px w-8 bg-transparent group-hover:bg-[#58a6ff] rounded transition-colors" />
        </div>
    );

    const handleLangChange = (newLang) => {
        codeStore.current[storeKey(id, lang.id)] = code;
        const stored = codeStore.current[storeKey(id, newLang.id)];
        setCode(stored ?? newLang.template);
        setLang(newLang);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        codeStore.current[storeKey(id, lang.id)] = newCode;
    };

    const handleReset = () => {
        if (!window.confirm('Reset code to template?')) return;
        const fresh = lang.template;
        codeStore.current[storeKey(id, lang.id)] = fresh;
        setCode(fresh);
    };

    const handleRun = async () => {
        setRunning(true);
        setRunResult(null);
        setSubmitResult(null);
        setBottomTab('output');
        setBottomOpen(true);
        setMobileTab('output');
        try {
            const r = await apiCall('/api/coding/run/', 'POST', { language: lang.id, code, stdin: customInput });
            setRunResult(r);
        } catch (e) {
            setRunResult({ error: e.message, stdout: '', stderr: '', code: -1 });
        }
        setRunning(false);
    };

    const handleSubmit = async () => {
        if (!problem) return;
        setSubmitting(true);
        setRunResult(null);
        setSubmitResult(null);
        setBottomTab('testcases');
        setBottomOpen(true);
        setMobileTab('output');
        try {
            const r = await apiCall(`/api/coding/submit/${problem.id}/`, 'POST', { language: lang.id, code });
            setSubmitResult(r);
            const subs = await apiCall('/api/coding/submissions/');
            setSubmissions((subs.submissions || []).filter(s => String(s.problem_id) === String(problem.id)));
        } catch (e) {
            setSubmitResult({ verdict: 'runtime_error', error: e.message, passed: 0, total: 0, case_results: [] });
        }
        setSubmitting(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-[#30363d] shadow-sm shrink-0">
                <button 
                    onClick={() => navigate('/coding')}
                    className="flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors mr-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Back to Problems</span>
                </button>
                <div className="h-6 w-px bg-[#30363d] mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-white font-semibold">
                    <Code2 className="w-5 h-5 text-[#58a6ff]" />
                    {loadingProblem ? <div className="h-4 w-32 bg-[#30363d] rounded animate-pulse"></div> : (problem?.title || 'Unknown Problem')}
                </div>
            </div>

            {/* Mobile Tabs Header */}
            <div className="md:hidden flex bg-[#161b22] border-b border-[#30363d] shrink-0">
                {[
                    { id: 'problem', label: 'Problem', icon: BookOpen },
                    { id: 'code', label: 'Code', icon: Code2 },
                    { id: 'output', label: 'Output', icon: Terminal },
                ].map(({id: tabId, label, icon: Icon}) => (
                    <button 
                        key={tabId} 
                        onClick={() => setMobileTab(tabId)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2
                            ${mobileTab === tabId ? 'text-[#58a6ff] border-[#58a6ff]' : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div ref={containerRef} className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                
                {/* LEFT: Problem Description */}
                <div 
                    className={`md:flex flex-col bg-[#0d1117] shrink-0 border-r border-[#30363d] ${mobileTab === 'problem' ? 'flex flex-1' : 'hidden md:flex'}`} 
                    style={{ width: window.innerWidth >= 768 ? `${descW}%` : '100%' }}
                >
                    <div className="flex-1 overflow-y-auto w-full">
                        {loadingProblem ? <Skeleton /> : <ProblemDescription problem={problem} />}
                    </div>
                    {/* Custom Input Panel fixed at bottom of description */}
                    {problem && (
                        <div className="border-t border-[#30363d] p-3 bg-[#161b22] shrink-0">
                            <p className="text-[#8b949e] text-xs font-semibold mb-1.5 uppercase tracking-wider">Custom Input (for Run)</p>
                            <textarea 
                                value={customInput} 
                                onChange={e => setCustomInput(e.target.value)} 
                                rows={3}
                                placeholder="Enter custom input here..."
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#c9d1d9] text-xs font-mono focus:outline-none focus:border-[#58a6ff] resize-none" 
                            />
                        </div>
                    )}
                </div>

                <VDivider />

                {/* RIGHT: Editor & Output */}
                <div className={`md:flex flex-1 flex-col overflow-hidden min-w-0 ${mobileTab === 'code' || mobileTab === 'output' ? 'flex' : 'hidden md:flex'}`}>
                    
                    {/* Editor Section */}
                    <div className={`flex-1 flex flex-col ${mobileTab === 'output' ? 'hidden md:flex' : 'flex'}`}>
                        <CodeEditor 
                            code={code}
                            setCode={handleCodeChange}
                            lang={lang}
                            setLang={handleLangChange}
                            onRun={handleRun}
                            onSubmit={handleSubmit}
                            running={running}
                            submitting={submitting}
                            onReset={handleReset}
                        />
                    </div>

                    {/* Output Drawer (Desktop) & Output Section (Mobile) */}
                    {(bottomOpen || window.innerWidth < 768) && <HDivider />}
                    <div 
                        className={`border-t border-[#30363d] bg-[#161b22] flex flex-col shrink-0 ${mobileTab === 'code' ? 'hidden md:flex' : 'flex'}`}
                        style={{ height: window.innerWidth >= 768 ? (bottomOpen ? bottomH : 38) : '100%' }}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center border-b border-[#30363d] shrink-0 bg-[#0d1117]">
                            <button 
                                onClick={() => setBottomOpen(o => !o)}
                                className="p-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors hidden md:block"
                                title={bottomOpen ? "Collapse panel" : "Expand panel"}
                            >
                                <ChevronDown className={`w-4 h-4 transition-transform ${bottomOpen ? '' : 'rotate-180'}`} />
                            </button>

                            {[
                                { id: 'output', label: 'Run Output', icon: Terminal },
                                { id: 'testcases', label: 'Test Cases', icon: List },
                                { id: 'submissions', label: 'Submissions', icon: FileCode },
                            ].map(({ id: tbId, label, icon: Icon }) => (
                                <button key={tbId} onClick={() => { setBottomTab(tbId); setBottomOpen(true); }}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-t-2
                                        ${bottomTab === tbId && (bottomOpen || window.innerWidth < 768) ? 'text-[#58a6ff] border-[#58a6ff] bg-[#161b22]' : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] bg-[#0d1117]'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                    {tbId === 'testcases' && submitResult && (
                                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                                            ${submitResult.verdict === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {submitResult.passed}/{submitResult.total}
                                        </span>
                                    )}
                                    {tbId === 'submissions' && submissions.length > 0 && (
                                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]">
                                            {submissions.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Drawer Content */}
                        {(bottomOpen || window.innerWidth < 768) && (
                            <TestCases 
                                bottomTab={bottomTab}
                                running={running}
                                submitResult={submitResult}
                                runResult={runResult}
                                submitting={submitting}
                                submissions={submissions}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorPage;
