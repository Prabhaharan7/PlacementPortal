import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import {
    ArrowLeft, Brain, Code, FileText, Building2,
    CheckCircle, XCircle, Clock, Star, AlertCircle, User
} from 'lucide-react';

/* ── helpers ── */
const TOPIC_META = {
    aptitude: { label: 'Aptitude', icon: Brain, from: 'from-blue-500', to: 'to-blue-600', ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-700' },
    coding: { label: 'Coding', icon: Code, from: 'from-emerald-500', to: 'to-emerald-600', ring: 'ring-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    resume: { label: 'Resume', icon: FileText, from: 'from-amber-500', to: 'to-amber-600', ring: 'ring-amber-100', bg: 'bg-amber-50', text: 'text-amber-700' },
    companies: { label: 'Companies', icon: Building2, from: 'from-purple-500', to: 'to-purple-600', ring: 'ring-purple-100', bg: 'bg-purple-50', text: 'text-purple-700' },
};

const ACTION_ICON = {
    quiz_completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    problem_solved: <CheckCircle className="w-4 h-4 text-blue-500" />,
    resume_updated: <CheckCircle className="w-4 h-4 text-amber-500" />,
    company_viewed: <CheckCircle className="w-4 h-4 text-purple-500" />,
    test_started: <Clock className="w-4 h-4 text-gray-400" />,
    test_failed: <XCircle className="w-4 h-4 text-red-400" />,
};

const ACTION_LABEL = {
    quiz_completed: 'Quiz Completed',
    problem_solved: 'Problem Solved',
    resume_updated: 'Resume Updated',
    company_viewed: 'Company Viewed',
    test_started: 'Test Started',
    test_failed: 'Test Failed',
};

const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ── circular progress ── */
const CircularProgress = ({ pct, size = 80, stroke = 7, from, to }) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="#f1f5f9" fill="none" />
            <circle
                cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
                stroke="url(#grad)" strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    );
};

/* ── main component ── */
const AdminStudentDetailPage = () => {
    const { id: studentId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [topicFilter, setTopicFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiCall(`/api/admin/students/${studentId}/`, 'GET');
                setData(res);
            } catch (e) {
                setError(e.message || 'Failed to load student data');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [studentId]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
    );

    const { student, overall_percentage, topics, activities } = data;
    const topicMap = Object.fromEntries(topics.map(t => [t.topic, t]));
    const filteredActivities = topicFilter === 'all'
        ? activities
        : activities.filter(a => a.topic === topicFilter);

    return (
        <div className="p-6 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {(student.first_name?.[0] || student.username[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900">
                        {student.first_name && student.last_name
                            ? `${student.first_name} ${student.last_name}`
                            : student.username}
                    </h1>
                    <p className="text-gray-500 text-sm">{student.email}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Joined {fmt(student.date_joined)}</p>
                </div>
                {/* Overall circular progress */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="relative">
                        <CircularProgress pct={overall_percentage} />
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                            <span className="text-base font-bold text-gray-800">{overall_percentage}%</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">Overall Progress</span>
                </div>
            </div>

            {/* Topic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(TOPIC_META).map(([key, meta]) => {
                    const t = topicMap[key];
                    const pct = t ? t.percentage : 0;
                    const Icon = meta.icon;
                    return (
                        <div key={key} className={`rounded-2xl p-5 border ${meta.bg} ring-1 ${meta.ring}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.from} ${meta.to} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className={`font-semibold text-sm ${meta.text}`}>{meta.label}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{t ? t.completed : 0} / {t ? t.total : 0} items</span>
                                    <span className={`font-bold ${meta.text}`}>{pct}%</span>
                                </div>
                                <div className="h-2.5 bg-white/70 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${meta.from} ${meta.to} rounded-full transition-all duration-700`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                            {/* Scores */}
                            {t && (
                                <div className="flex gap-3 text-xs text-gray-500">
                                    <span>Avg: <span className="font-semibold text-gray-700">{t.avg_score.toFixed(1)}</span></span>
                                    <span>Best: <span className="font-semibold text-gray-700">{t.best_score.toFixed(1)}</span></span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold text-gray-800">Activity Log</h2>
                    {/* Topic filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {['all', 'aptitude', 'coding', 'resume', 'companies'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTopicFilter(f)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${topicFilter === f
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredActivities.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">No activities recorded.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredActivities.map(act => {
                            const tm = TOPIC_META[act.topic];
                            return (
                                <div key={act.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="shrink-0">{ACTION_ICON[act.action] || <CheckCircle className="w-4 h-4 text-gray-400" />}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{act.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-xs font-medium ${tm?.text ?? 'text-gray-500'}`}>{tm?.label ?? act.topic}</span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-xs text-gray-400">{ACTION_LABEL[act.action] ?? act.action}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {act.score !== null && (
                                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 mb-0.5">
                                                <Star className="w-3 h-3" /> {act.score.toFixed(1)}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-400">{fmt(act.timestamp)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStudentDetailPage;
