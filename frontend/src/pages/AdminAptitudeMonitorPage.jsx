import React, { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../services/api';
import {
    Brain, Search, AlertCircle, ChevronDown, ChevronUp,
    ChevronRight, Trophy, TrendingUp, User
} from 'lucide-react';

/* ─── helpers ─── */
const LEVELS = ['easy', 'medium', 'hard'];

const LEVEL_STYLE = {
    easy: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', label: '🟢 Easy' },
    medium: { badge: 'bg-amber-100  text-amber-700  border-amber-200', bar: 'bg-amber-500', label: '🟡 Medium' },
    hard: { badge: 'bg-red-100    text-red-700    border-red-200', bar: 'bg-red-500', label: '🔴 Hard' },
};

const scoreBadge = (pct) => {
    if (pct >= 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (pct >= 50) return 'bg-amber-100  text-amber-700  border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
};
const scoreBar = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
};

/* ─── Sub-component: tests grouped by level ─── */
const StudentTestDetail = ({ attempts }) => {
    const byLevel = useMemo(() => {
        const map = { easy: [], medium: [], hard: [] };
        attempts.forEach(a => {
            const lvl = a.difficulty in map ? a.difficulty : 'easy';
            map[lvl].push(a);
        });
        return map;
    }, [attempts]);

    const hasAny = LEVELS.some(l => byLevel[l].length > 0);

    if (!hasAny) return (
        <div className="px-5 py-4 text-slate-400 text-sm italic">
            No completed tests for this student yet.
        </div>
    );

    return (
        <div className="border-t border-slate-100">
            {LEVELS.map(level => {
                const tests = byLevel[level];
                if (!tests.length) return null;
                const meta = LEVEL_STYLE[level];
                const avgPct = tests.reduce((s, t) => s + (t.percentage ?? 0), 0) / tests.length;

                return (
                    <div key={level} className="border-b border-slate-100 last:border-0">
                        {/* Level header */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
                                {meta.label}
                            </span>
                            <span className="text-xs text-slate-400">
                                {tests.length} test{tests.length > 1 ? 's' : ''}
                            </span>
                            <div className="flex-1" />
                            <span className="text-xs text-slate-500 font-medium">
                                Avg: <span className={`font-bold ${avgPct >= 75 ? 'text-emerald-700' : avgPct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                                    {avgPct.toFixed(1)}%
                                </span>
                            </span>
                        </div>

                        {/* Test rows */}
                        <div className="divide-y divide-slate-50">
                            {tests.map((t, i) => (
                                <div key={t.attempt_id ?? i}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                                    {/* Test title */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium truncate">{t.test_title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                                            {t.topic}
                                            {t.submitted_at && ` · ${new Date(t.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                                        </p>
                                    </div>

                                    {/* Marks */}
                                    {t.score != null && t.total != null && (
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {t.score}/{t.total} marks
                                        </span>
                                    )}

                                    {/* Score bar + badge */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${scoreBar(t.percentage ?? 0)}`}
                                                style={{ width: `${Math.min(t.percentage ?? 0, 100)}%` }} />
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border min-w-[48px] text-center ${scoreBadge(t.percentage ?? 0)}`}>
                                            {(t.percentage ?? 0).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── Student row (collapsed → expand) ─── */
const StudentRow = ({ student, attempts }) => {
    const [open, setOpen] = useState(false);

    const avgPct = attempts.length
        ? attempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / attempts.length
        : 0;
    const bestPct = attempts.length ? Math.max(...attempts.map(a => a.percentage ?? 0)) : 0;
    const levelCounts = useMemo(() => {
        const c = { easy: 0, medium: 0, hard: 0 };
        attempts.forEach(a => { if (a.difficulty in c) c[a.difficulty]++; });
        return c;
    }, [attempts]);

    return (
        <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${open ? 'border-purple-300' : 'border-slate-200 hover:border-purple-200'}`}>
            {/* Header row — always visible */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {student.name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-semibold text-sm">{student.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {attempts.length} test{attempts.length !== 1 ? 's' : ''} taken
                        {' · '}
                        {LEVELS.filter(l => levelCounts[l] > 0).map(l => (
                            <span key={l} className={`inline-flex items-center gap-1 mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_STYLE[l].badge}`}>
                                {levelCounts[l]} {l}
                            </span>
                        ))}
                    </p>
                </div>

                {/* Best score */}
                <div className="hidden sm:flex flex-col items-center shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Best</span>
                    <span className={`text-sm font-bold ${bestPct >= 75 ? 'text-emerald-700' : bestPct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                        {bestPct.toFixed(0)}%
                    </span>
                </div>

                {/* Avg score + bar */}
                <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-28">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avg Score</span>
                    <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${scoreBar(avgPct)}`}
                                style={{ width: `${Math.min(avgPct, 100)}%` }} />
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${avgPct >= 75 ? 'text-emerald-700' : avgPct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                            {avgPct.toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Expand chevron */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Expandable detail */}
            {open && <StudentTestDetail attempts={attempts} />}
        </div>
    );
};

/* ─── Main page ─── */
const AdminAptitudeMonitorPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [topicFilter, setTopicFilter] = useState('all');
    const [openAll, setOpenAll] = useState(false);

    useEffect(() => {
        apiCall('/api/admin/aptitude-monitor/')
            .then(d => setData(d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* Group attempts by student */
    const studentMap = useMemo(() => {
        const map = {};
        (data?.attempts ?? []).forEach(a => {
            if (topicFilter !== 'all' && a.topic !== topicFilter) return;
            if (!map[a.student_id]) {
                map[a.student_id] = { id: a.student_id, name: a.student_name, attempts: [] };
            }
            map[a.student_id].attempts.push(a);
        });
        return map;
    }, [data, topicFilter]);

    const students = useMemo(() =>
        Object.values(studentMap)
            .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => b.attempts.length - a.attempts.length),
        [studentMap, search]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" /> Aptitude Monitor
                </h1>
                <p className="text-slate-500 text-sm mt-1">Click a student to view their test history by level</p>
            </div>

            {/* Topic summary cards */}
            {(data?.topic_summary?.length ?? 0) > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.topic_summary.map(t => (
                        <div key={t.topic}
                            onClick={() => setTopicFilter(v => v === t.topic ? 'all' : t.topic)}
                            className={`rounded-xl p-4 border cursor-pointer transition-all shadow-sm hover:shadow-md ${topicFilter === t.topic
                                    ? 'border-purple-400 bg-purple-50'
                                    : 'border-slate-200 bg-white hover:border-purple-200'
                                }`}>
                            <p className="text-xs text-slate-500 capitalize mb-1 font-medium">{t.topic}</p>
                            <p className="text-2xl font-bold text-slate-800">{t.avg_score}%</p>
                            <p className="text-[11px] text-slate-400 mt-1">{t.attempts} attempts · best {t.max_score}%</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary stats */}
            {!loading && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Students Tested</p>
                        <p className="text-2xl font-bold text-slate-800">{Object.keys(studentMap).length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Attempts</p>
                        <p className="text-2xl font-bold text-slate-800">{data?.total ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Topics Active</p>
                        <p className="text-2xl font-bold text-slate-800">{data?.topic_summary?.length ?? 0}</p>
                    </div>
                </div>
            )}

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search student name…"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                </div>
                {topicFilter !== 'all' && (
                    <button onClick={() => setTopicFilter('all')}
                        className="px-3 py-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium hover:bg-purple-200 transition-colors">
                        Topic: {topicFilter} ✕
                    </button>
                )}
            </div>

            {/* student list */}
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
            ) : students.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-slate-400">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No students found. Students need to submit tests first.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {students.map(s => (
                        <StudentRow key={s.id} student={s} attempts={s.attempts} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAptitudeMonitorPage;
