import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const VERDICT_STYLE = {
    accepted: { color: 'text-green-400', bg: 'bg-green-500/10  border-green-500/30', icon: CheckCircle, label: '✓ Accepted' },
    wrong_answer: { color: 'text-red-400', bg: 'bg-red-500/10    border-red-500/30', icon: XCircle, label: '✗ Wrong Answer' },
    time_limit: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Clock, label: '⏱ Time Limit Exceeded' },
    runtime_error: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertCircle, label: '💥 Runtime Error' },
    compilation_error: { color: 'text-red-500', bg: 'bg-red-600/10   border-red-600/30', icon: AlertCircle, label: '⚙ Compilation Error' },
};

const CaseChip = ({ passed, index }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
        ${passed ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
        {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        Case {index}
    </div>
);

const TestCases = ({ bottomTab, running, submitResult, runResult, submitting, submissions }) => {

    return (
        <div className="flex-1 overflow-y-auto p-3">
            {/* ── RUN OUTPUT ── */}
            {bottomTab === 'output' && (
                <div>
                    {running && (
                        <div className="flex items-center gap-2 text-[#8b949e] text-xs">
                            <div className="w-3 h-3 border border-[#8b949e] border-t-transparent rounded-full animate-spin" />
                            Executing code…
                        </div>
                    )}
                    {!running && !runResult && (
                        <p className="text-[#8b949e] text-xs">Click <span className="text-green-400 font-semibold">Run Code</span> to execute with Custom Input and see output here.</p>
                    )}
                    {runResult && (
                        <div className="space-y-2">
                            {/* Status line */}
                            <div className={`text-xs font-semibold ${runResult.code === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {runResult.error ? '⚠ Error' : runResult.code === 0 ? '✓ Executed successfully' : `✗ Exit code ${runResult.code}`}
                            </div>

                            {/* stdout */}
                            {runResult.stdout && (
                                <div>
                                    <p className="text-[#8b949e] text-[10px] font-semibold uppercase mb-1">Output</p>
                                    <pre className="bg-[#0d1117] rounded-md px-3 py-2 text-green-300 text-xs font-mono whitespace-pre-wrap border border-[#30363d]">
                                        {runResult.stdout}
                                    </pre>
                                </div>
                            )}

                            {/* stderr */}
                            {runResult.stderr && (
                                <div>
                                    <p className="text-[#8b949e] text-[10px] font-semibold uppercase mb-1">Stderr / Error</p>
                                    <pre className="bg-[#0d1117] rounded-md px-3 py-2 text-red-400 text-xs font-mono whitespace-pre-wrap border border-red-900/30">
                                        {runResult.stderr}
                                    </pre>
                                </div>
                            )}

                            {/* generic error */}
                            {runResult.error && !runResult.stderr && (
                                <pre className="bg-[#0d1117] rounded-md px-3 py-2 text-red-400 text-xs font-mono whitespace-pre-wrap border border-red-900/30">
                                    {runResult.error}
                                </pre>
                            )}

                            {/* No output at all */}
                            {!runResult.stdout && !runResult.stderr && !runResult.error && (
                                <p className="text-[#8b949e] text-xs italic">(No output produced)</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── TEST CASES ── */}
            {bottomTab === 'testcases' && (
                <div>
                    {submitting && (
                        <div className="flex items-center gap-2 text-[#8b949e] text-xs">
                            <div className="w-3 h-3 border border-[#8b949e] border-t-transparent rounded-full animate-spin" />
                            Running all test cases…
                        </div>
                    )}
                    {!submitting && !submitResult && (
                        <p className="text-[#8b949e] text-xs">Click <span className="text-[#58a6ff] font-semibold">Submit</span> to run against all test cases.</p>
                    )}
                    {submitResult && (() => {
                        const vs = VERDICT_STYLE[submitResult.verdict] || VERDICT_STYLE.wrong_answer;
                        const Icon = vs.icon;
                        return (
                            <div className="space-y-3">
                                {/* Verdict banner */}
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${vs.bg}`}>
                                    <Icon className={`w-5 h-5 ${vs.color}`} />
                                    <div>
                                        <p className={`font-bold text-sm ${vs.color}`}>{vs.label}</p>
                                        {submitResult.total > 0 && (
                                            <p className="text-[#8b949e] text-xs">
                                                {submitResult.passed} / {submitResult.total} test cases passed
                                            </p>
                                        )}
                                    </div>
                                    {/* Progress bar */}
                                    {submitResult.total > 0 && (
                                        <div className="ml-auto w-24">
                                            <div className="w-full bg-[#21262d] rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full transition-all ${submitResult.verdict === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`}
                                                    style={{ width: `${(submitResult.passed / submitResult.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Test case chips */}
                                {submitResult.case_results?.length > 0 && (
                                    <div>
                                        <p className="text-[#8b949e] text-[10px] font-semibold uppercase mb-2">Test Case Results</p>
                                        <div className="flex flex-wrap gap-2">
                                            {submitResult.case_results.map(c => (
                                                <CaseChip key={c.case} passed={c.passed} index={c.case} />
                                            ))}
                                        </div>
                                        {/* First failing case detail */}
                                        {submitResult.case_results.filter(c => !c.passed).slice(0, 1).map(c => (
                                            <div key={c.case} className="mt-2 bg-[#0d1117] rounded-md border border-[#30363d] p-2.5 text-xs font-mono space-y-1">
                                                <p className="text-[#8b949e] font-sans font-semibold text-[10px] uppercase">First Failing Case #{c.case}</p>
                                                <p><span className="text-[#8b949e]">Expected:</span> <span className="text-green-300">{c.expected || '(empty)'}</span></p>
                                                <p><span className="text-[#8b949e]">Got:     </span> <span className="text-red-300">{c.got || '(empty)'}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Error output */}
                                {submitResult.error && (
                                    <div>
                                        <p className="text-[#8b949e] text-[10px] font-semibold uppercase mb-1">Error</p>
                                        <pre className="bg-[#0d1117] rounded-md px-3 py-2 text-red-400 text-xs font-mono whitespace-pre-wrap border border-red-900/30">
                                            {submitResult.error}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── SUBMISSIONS ── */}
            {bottomTab === 'submissions' && (
                <div>
                    {submissions.length === 0 ? (
                        <p className="text-[#8b949e] text-xs">No submissions yet for this problem.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {submissions.slice(0, 10).map((s, i) => {
                                const vs = VERDICT_STYLE[s.verdict] || VERDICT_STYLE.wrong_answer;
                                return (
                                    <div key={s.id || i} className="flex items-center gap-3 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2">
                                        <span className={`text-xs font-bold capitalize ${vs.color}`}>{s.verdict?.replace(/_/g, ' ')}</span>
                                        <span className="text-[#8b949e] text-[10px]">{s.language}</span>
                                        <span className="text-[#8b949e] text-[10px] ml-auto">
                                            {s.passed_cases}/{s.total_cases} cases
                                        </span>
                                        {s.submitted_at && (
                                            <span className="text-[#8b949e] text-[10px]">
                                                {new Date(s.submitted_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestCases;
