import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import {
    Users, Brain, TrendingUp, Activity, Trophy,
    Zap, CheckCircle, Clock, ChevronRight, AlertCircle
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, border }) => (
    <div className={`bg-white rounded-2xl p-5 border ${border} shadow-sm`}>
        <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm font-medium">{label}</span>
            <div className={`p-2 rounded-xl ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
        </div>
        <p className="text-3xl font-bold text-slate-800">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
);

const topicGradients = {
    aptitude: 'from-blue-500 to-blue-600',
    coding: 'from-emerald-500 to-green-600',
    resume: 'from-amber-500 to-yellow-500',
    companies: 'from-purple-500 to-violet-600',
};

const AdminDashboardPage = () => {
    const [data, setData] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            apiCall('/api/admin/overview/'),
            apiCall('/api/admin/activity/?limit=15'),
        ]).then(([overview, act]) => {
            setData(overview);
            setActivity(act.activity || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time student monitoring dashboard</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Students" value={data?.total_students} sub="registered accounts" iconBg="bg-blue-50" iconColor="text-blue-600" border="border-blue-100" />
                <StatCard icon={CheckCircle} label="Placed Students" value={data?.placed_students} sub={`${data?.placed_pct ?? 0}% rate`} iconBg="bg-emerald-50" iconColor="text-emerald-600" border="border-emerald-100" />
                <StatCard icon={Zap} label="Active This Week" value={data?.active_this_week} sub="students used the platform" iconBg="bg-amber-50" iconColor="text-amber-600" border="border-amber-100" />
                <StatCard icon={Brain} label="Avg Aptitude Score" value={data?.avg_aptitude_score ? `${data.avg_aptitude_score}%` : '—'} sub="across all tests" iconBg="bg-purple-50" iconColor="text-purple-600" border="border-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Topic Breakdown */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" /> Topic Engagement
                    </h2>
                    {data?.topic_breakdown?.length > 0 ? (
                        <div className="space-y-4">
                            {data.topic_breakdown.map(t => (
                                <div key={t.topic}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-600 capitalize font-medium">{t.topic}</span>
                                        <span className="text-slate-500">{t.avg_completion}% avg completion</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full bg-gradient-to-r ${topicGradients[t.topic] || 'from-purple-500 to-indigo-500'}`}
                                            style={{ width: `${Math.min(t.avg_completion, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">No progress data yet.</p>
                    )}
                </div>

                {/* Top Performers */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" /> Top Performers
                    </h2>
                    {data?.top_performers?.length > 0 ? (
                        <div className="space-y-2">
                            {data.top_performers.map((s, i) => (
                                <div key={s.id}
                                    onClick={() => navigate(`/admin/students/${s.id}`)}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-400 text-white' :
                                            i === 1 ? 'bg-slate-300 text-slate-700' :
                                                i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium truncate">{s.name}</p>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                            <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                style={{ width: `${Math.min(s.overall_pct, 100)}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600 shrink-0">{s.overall_pct}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">No student progress yet.</p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-700 font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-500" /> Recent Activity
                    </h2>
                    <button onClick={() => navigate('/admin/aptitude')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                        View all <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                {activity.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-slate-400">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No recent activity yet.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activity.map((a, i) => (
                            <div key={i}
                                onClick={() => navigate(`/admin/students/${a.student_id}`)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.type === 'aptitude' ? 'bg-blue-100 text-blue-600' :
                                        a.type === 'coding' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-purple-100 text-purple-600'
                                    }`}>
                                    {a.type === 'aptitude' ? <Brain className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 font-medium truncate">{a.student_name}</p>
                                    <p className="text-xs text-slate-400 truncate">{a.description}</p>
                                </div>
                                {a.score != null && (
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${a.score >= 75 ? 'bg-emerald-100 text-emerald-700' :
                                            a.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>{a.score}%</span>
                                )}
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors shrink-0" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
