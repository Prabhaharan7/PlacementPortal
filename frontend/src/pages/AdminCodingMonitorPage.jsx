import React, { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../services/api';
import {
    Code, Terminal, CheckCircle, XCircle, Clock, Search,
    Filter, AlertOctagon, TrendingUp, Zap, ChevronDown, ChevronRight,
    User, AlertCircle
} from 'lucide-react';

const VERDICT_COLORS = {
    'accepted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'wrong_answer': 'bg-red-100 text-red-700 border-red-200',
    'time_limit': 'bg-amber-100 text-amber-700 border-amber-200',
    'runtime_error': 'bg-rose-100 text-rose-700 border-rose-200',
    'compilation_error': 'bg-slate-100 text-slate-700 border-slate-300',
    'pending': 'bg-blue-100 text-blue-700 border-blue-200',
};

const VERDICT_ICONS = {
    'accepted': CheckCircle,
    'wrong_answer': XCircle,
    'time_limit': Clock,
    'runtime_error': AlertOctagon,
    'compilation_error': Terminal,
    'pending': Zap,
};

const AdminCodingMonitorPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // UI state for expansions
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [expandedProblemKey, setExpandedProblemKey] = useState(null);

    useEffect(() => {
        apiCall('/api/admin/coding-monitor/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Grouping the flat submissions into Students -> Problems -> Submissions
    const groupedData = useMemo(() => {
        if (!data?.submissions) return [];

        const studentMap = {};

        data.submissions.forEach(sub => {
            if (!studentMap[sub.student_id]) {
                studentMap[sub.student_id] = {
                    id: sub.student_id,
                    name: sub.student_name,
                    problems: {}
                };
            }

            const pKey = sub.problem_title;
            if (!studentMap[sub.student_id].problems[pKey]) {
                studentMap[sub.student_id].problems[pKey] = {
                    title: pKey,
                    difficulty: sub.difficulty,
                    submissions: [],
                    isCompleted: false
                };
            }

            studentMap[sub.student_id].problems[pKey].submissions.push(sub);
            if (sub.verdict === 'accepted') {
                studentMap[sub.student_id].problems[pKey].isCompleted = true;
            }
        });

        // Convert map to array and compute totals
        const studentsList = Object.values(studentMap).map(student => {
            const probArr = Object.values(student.problems);
            const totalAttempted = probArr.length;
            const totalCompleted = probArr.filter(p => p.isCompleted).length;

            return {
                ...student,
                problems: probArr.sort((a, b) => a.title.localeCompare(b.title)),
                totalAttempted,
                totalCompleted
            };
        });

        return studentsList.sort((a, b) => a.name.localeCompare(b.name));
    }, [data]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return groupedData;
        const lower = searchTerm.toLowerCase();
        return groupedData.filter(s => s.name.toLowerCase().includes(lower));
    }, [groupedData, searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const { difficulty_summary, verdict_summary, total } = data || {};
    const accRate = total > 0 ? ((verdict_summary?.find(v => v.verdict === 'accepted')?.count || 0) / total * 100).toFixed(1) : 0;

    const handleStudentClick = (studentId) => {
        setExpandedStudent(prev => prev === studentId ? null : studentId);
        setExpandedProblemKey(null); // Reset inner accordion when changing students
    };

    const handleProblemClick = (e, probKey) => {
        e.stopPropagation();
        setExpandedProblemKey(prev => prev === probKey ? null : probKey);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-indigo-600" /> Coding Monitor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time code submissions grouped by student</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center min-w-[120px]">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Runs</p>
                        <p className="text-2xl font-black text-slate-800">{total}</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm text-center min-w-[120px]">
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Acceptance Rate</p>
                        <p className="text-2xl font-black text-indigo-700">{accRate}%</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-emerald-500" /> Difficulty Spread
                    </h2>
                    <div className="space-y-4">
                        {['easy', 'medium', 'hard'].map((diff) => {
                            const count = difficulty_summary?.[diff] || 0;
                            const pct = total ? (count / total * 100) : 0;
                            const color = diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-amber-500' : 'bg-rose-500';
                            return (
                                <div key={diff}>
                                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                                        <span className="capitalize w-16">{diff}</span>
                                        <span className="text-slate-400 tabular-nums">{count} runs</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                        <Code className="w-4 h-4 text-indigo-400" /> Execution Verdicts
                    </h2>

                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {verdict_summary?.slice(0, 4).map(({ verdict, count }) => {
                            const pct = total ? (count / total * 100).toFixed(1) : 0;
                            const isAcc = verdict === 'accepted';
                            return (
                                <div key={verdict} className={`p-4 rounded-xl border ${isAcc ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/80 border-slate-700'}`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        {verdict.replace('_', ' ')}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl font-black ${isAcc ? 'text-emerald-400' : 'text-slate-100'}`}>
                                            {count}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">
                                            ({pct}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Student Drill-Down List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by student name..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <div key={student.id} className="group">
                                {/* Student Header Row */}
                                <div
                                    onClick={() => handleStudentClick(student.id)}
                                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${expandedStudent === student.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedStudent === student.id ?
                                            <ChevronDown className="w-5 h-5 text-indigo-500" /> :
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                                        }
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-indigo-200">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{student.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">ID: {student.id}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-semibold text-slate-500 max-md:hidden">Activity</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-emerald-600 font-bold text-sm" title="Completed Problems">{student.totalCompleted} ✅</span>
                                                <span className="text-slate-300 mx-1">/</span>
                                                <span className="text-slate-600 font-bold text-sm" title="Attempted Problems">{student.totalAttempted} 📝</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Problems Panel (Level 1 Expansion) */}
                                {expandedStudent === student.id && (
                                    <div className="bg-slate-50 border-t border-slate-100 divide-y divide-slate-100 pl-16">
                                        {student.problems.map(prob => {
                                            const probKey = prob.title;
                                            const isExpanded = expandedProblemKey === probKey;
                                            return (
                                                <div key={probKey} className="group/prob">
                                                    {/* Problem Header Row */}
                                                    <div
                                                        onClick={(e) => handleProblemClick(e, probKey)}
                                                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-100/30' : 'hover:bg-slate-100/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ?
                                                                <ChevronDown className="w-4 h-4 text-indigo-400" /> :
                                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover/prob:text-indigo-400" />
                                                            }
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-slate-700 text-sm">{prob.title}</span>
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 mt-1 rounded uppercase tracking-widest w-fit ${prob.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                                                        prob.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-rose-100 text-rose-700'
                                                                    }`}>
                                                                    {prob.difficulty}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="pr-4 flex items-center gap-3">
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {prob.submissions.length} submission{prob.submissions.length !== 1 ? 's' : ''}
                                                            </span>
                                                            {prob.isCompleted ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle className="w-3 h-3" /> Completed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                                    <Clock className="w-3 h-3" /> Attempted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Submissions List (Level 2 Expansion) */}
                                                    {isExpanded && (
                                                        <div className="bg-white border-y border-slate-100 py-2 pl-8 pr-4 shadow-inner">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 pl-2">Submission History</h4>
                                                            <div className="space-y-1">
                                                                {prob.submissions.map(sub => {
                                                                    const VIcon = VERDICT_ICONS[sub.verdict] || Zap;
                                                                    return (
                                                                        <div key={sub.submission_id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-50 text-sm border border-transparent hover:border-slate-100">
                                                                            <div className="flex items-center gap-4">
                                                                                <span className={`inline-flex items-center gap-1.5 w-36 px-2 py-0.5 rounded-md text-[10px] font-bold border ${VERDICT_COLORS[sub.verdict] || VERDICT_COLORS.pending}`}>
                                                                                    <VIcon className="w-3 h-3" />
                                                                                    {sub.verdict.replace('_', ' ').toUpperCase()}
                                                                                </span>
                                                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                                                                    {sub.language}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 text-xs">
                                                                                {sub.verdict !== 'accepted' && sub.total > 0 && (
                                                                                    <span className="font-semibold text-slate-500">
                                                                                        {sub.passed}/{sub.total}
                                                                                    </span>
                                                                                )}
                                                                                <span className="text-slate-400">
                                                                                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-20 text-indigo-500" />
                            <p className="text-sm font-medium">No students match your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCodingMonitorPage;
