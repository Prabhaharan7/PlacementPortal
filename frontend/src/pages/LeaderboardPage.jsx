import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

const RANK_ICONS = {
    1: <Trophy className="w-6 h-6 text-yellow-400" />,
    2: <Medal className="w-6 h-6 text-gray-300" />,
    3: <Medal className="w-6 h-6 text-amber-600" />,
};

const LeaderboardPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiCall('/api/leaderboard/').then(d => { setData(d.leaderboard); setLoading(false); });
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">Leaderboard</h1>
                <p className="text-text-secondary text-sm">Top students ranked by overall progress percentage</p>
            </div>

            {/* Top 3 Podium */}
            {top3.length >= 1 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* 2nd place */}
                    <div className={`flex flex-col items-center pt-8 ${top3.length < 2 ? 'opacity-0' : ''}`}>
                        {top3[1] && <>
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl font-bold mb-2 ${top3[1].is_me ? 'ring-4 ring-accent' : ''}`}>
                                {top3[1].name[0]}
                            </div>
                            <p className="text-text-primary font-semibold text-sm text-center">{top3[1].name}{top3[1].is_me && ' (You)'}</p>
                            <p className="text-text-secondary text-xs">{top3[1].overall_pct}%</p>
                            <div className="mt-2 w-full bg-gray-500/20 rounded-t-xl py-8 flex items-end justify-center">
                                <Medal className="w-8 h-8 text-gray-300" />
                            </div>
                        </>}
                    </div>
                    {/* 1st place */}
                    <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold mb-2 ${top3[0]?.is_me ? 'ring-4 ring-accent' : ''}`}>
                            {top3[0]?.name[0]}
                        </div>
                        <p className="text-text-primary font-bold text-center">{top3[0]?.name}{top3[0]?.is_me && ' (You)'}</p>
                        <p className="text-yellow-400 text-sm font-semibold">{top3[0]?.overall_pct}%</p>
                        <div className="mt-2 w-full bg-yellow-500/20 rounded-t-xl py-12 flex items-end justify-center">
                            <Trophy className="w-10 h-10 text-yellow-400" />
                        </div>
                    </div>
                    {/* 3rd place */}
                    <div className={`flex flex-col items-center pt-12 ${top3.length < 3 ? 'opacity-0' : ''}`}>
                        {top3[2] && <>
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-lg font-bold mb-2 ${top3[2].is_me ? 'ring-4 ring-accent' : ''}`}>
                                {top3[2].name[0]}
                            </div>
                            <p className="text-text-primary font-semibold text-sm text-center">{top3[2].name}{top3[2].is_me && ' (You)'}</p>
                            <p className="text-text-secondary text-xs">{top3[2].overall_pct}%</p>
                            <div className="mt-2 w-full bg-amber-600/20 rounded-t-xl py-6 flex items-end justify-center">
                                <Medal className="w-7 h-7 text-amber-600" />
                            </div>
                        </>}
                    </div>
                </div>
            )}

            {/* Full rankings table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Student</div>
                    <div className="col-span-3">Branch</div>
                    <div className="col-span-2">Batch</div>
                    <div className="col-span-1 text-right">Score</div>
                </div>
                {data.map(entry => (
                    <div key={entry.id} className={`grid grid-cols-12 px-5 py-3.5 border-b border-border/50 hover:bg-secondary/30 transition-colors ${entry.is_me ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}>
                        <div className="col-span-1 flex items-center">
                            {RANK_ICONS[entry.rank] || <span className="text-text-secondary font-mono text-sm">{entry.rank}</span>}
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {entry.name[0]}
                            </div>
                            <div>
                                <p className="text-text-primary text-sm font-medium">{entry.name}{entry.is_me && <span className="text-accent text-xs ml-1">(You)</span>}</p>
                                <p className="text-text-secondary text-xs">@{entry.username}</p>
                            </div>
                        </div>
                        <div className="col-span-3 flex items-center text-text-secondary text-sm">{entry.branch || '—'}</div>
                        <div className="col-span-2 flex items-center text-text-secondary text-sm">{entry.batch_year || '—'}</div>
                        <div className="col-span-1 flex items-center justify-end">
                            <span className={`text-sm font-bold ${entry.overall_pct >= 70 ? 'text-green-400' : entry.overall_pct >= 40 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                                {entry.overall_pct}%
                            </span>
                        </div>
                    </div>
                ))}
                {data.length === 0 && <div className="p-12 text-center text-text-secondary">No students yet.</div>}
            </div>
        </div>
    );
};

export default LeaderboardPage;
