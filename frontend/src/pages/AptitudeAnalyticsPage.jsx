import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { TrendingUp, Target, BookOpen, Award, BarChart2 } from 'lucide-react';

const TopicColors = {
    logical: '#6366f1',
    quantitative: '#f59e0b',
    verbal: '#10b981',
    data_interpretation: '#3b82f6',
    general: '#8b5cf6',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ background: color + '20' }}>
            <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
            <p className="text-text-secondary text-sm">{label}</p>
            <p className="text-text-primary text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AptitudeAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiCall('/api/analytics/aptitude/')
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;
    if (!data) return <div className="text-text-secondary text-center py-20">Could not load analytics.</div>;

    const maxScore = data.history.length ? Math.max(...data.history.map(h => h.score)) : 100;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">Aptitude Analytics</h1>
                <p className="text-text-secondary text-sm">Your performance across all aptitude tests</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Total Attempts" value={data.total_attempts} color="#6366f1" />
                <StatCard icon={Target} label="Avg Score" value={`${data.avg_score}%`} color="#f59e0b" />
                <StatCard icon={Award} label="Best Score" value={`${data.best_score}%`} color="#10b981" />
                <StatCard icon={TrendingUp} label="Topics Covered" value={data.topic_breakdown.length} color="#3b82f6" />
            </div>

            {/* Score history */}
            {data.history.length > 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" /> Score History
                    </h3>
                    <div className="flex items-end gap-3 h-40 overflow-x-auto pb-2">
                        {data.history.map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 shrink-0 group">
                                <span className="text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{h.score}%</span>
                                <div className="w-10 rounded-t-lg transition-all duration-300"
                                    style={{ height: `${(h.score / 100) * 120}px`, background: TopicColors[h.topic] || '#6366f1' }}
                                    title={`${h.test}: ${h.score}%`}
                                />
                                <span className="text-[10px] text-text-secondary">{h.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <BarChart2 className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-primary font-medium">No tests taken yet</p>
                    <p className="text-text-secondary text-sm mt-1">Take your first aptitude test to see analytics here!</p>
                </div>
            )}

            {/* Topic breakdown */}
            {data.topic_breakdown.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-text-primary mb-5">Topic Performance</h3>
                    <div className="space-y-4">
                        {data.topic_breakdown.map(t => (
                            <div key={t.topic}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-text-primary capitalize">{t.topic.replace('_', ' ')}</span>
                                    <span className="text-sm text-text-secondary">{t.avg}% avg · {t.attempts} attempt{t.attempts !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${t.avg}%`, background: TopicColors[t.topic] || '#6366f1' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AptitudeAnalyticsPage;
