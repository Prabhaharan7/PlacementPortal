import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import {
    Users, Building2, TrendingUp, IndianRupee, Award, BarChart2,
    GraduationCap, AlertCircle, CheckCircle, Target
} from 'lucide-react';

/* ─── Helpers ─── */
const StatCard = ({ icon: Icon, label, value, sub, color = '#6366f1' }) => (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '1a' }}>
            <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
            <p className="text-text-secondary text-sm">{label}</p>
            <p className="text-text-primary text-2xl font-bold">{value}</p>
            {sub && <p className="text-text-secondary text-xs mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Bar = ({ label, value, max, color, extra }) => (
    <div className="flex items-center gap-3">
        <span className="text-text-secondary text-xs w-32 shrink-0 truncate" title={label}>{label}</span>
        <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: max ? `${(value / max) * 100}%` : '0%', background: color }} />
        </div>
        <span className="text-text-primary text-xs font-semibold w-8 text-right">{value}</span>
        {extra && <span className="text-text-secondary text-xs w-20 text-right">{extra}</span>}
    </div>
);

const AdminPlacementAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        apiCall('/api/admin/analytics/placements/')
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;
    if (!data) return <div className="text-text-secondary text-center py-20">Failed to load analytics. Make sure you're logged in as admin.</div>;

    const { summary, company_stats, batch_stats, branch_stats, recent_placements, unplaced_students } = data;
    const maxCompany = company_stats.length ? company_stats[0].selected : 1;
    const maxBranch = branch_stats.length ? Math.max(...branch_stats.map(b => b.total)) : 1;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'companies', label: 'Companies' },
        { id: 'batch', label: 'Batch / Branch' },
        { id: 'recent', label: 'Recent Placements' },
        { id: 'unplaced', label: `Unplaced (${unplaced_students.length})` },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Placement Analytics</h1>
                    <p className="text-text-secondary text-sm">Comprehensive placement data for all batches</p>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard icon={Users} label="Total Students" value={summary.total_students} color="#6366f1" />
                <StatCard icon={CheckCircle} label="Total Placed" value={summary.total_placed} color="#10b981" />
                <StatCard icon={Target} label="Placement Rate" value={`${summary.placement_rate}%`} color="#f59e0b" />
                <StatCard icon={IndianRupee} label="Avg Package" value={`₹${summary.avg_package} LPA`} color="#3b82f6" />
                <StatCard icon={Award} label="Highest Package" value={`₹${summary.max_package} LPA`} color="#ec4899" />
                <StatCard icon={Building2} label="Companies" value={summary.total_companies} color="#8b5cf6" />
            </div>

            {/* Placement rate visual */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-text-primary">Overall Placement Rate</h3>
                    <span className={`text-2xl font-bold ${summary.placement_rate >= 70 ? 'text-green-400' : summary.placement_rate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {summary.placement_rate}%
                    </span>
                </div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${summary.placement_rate}%` }} />
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                    <span>{summary.total_placed} placed</span>
                    <span>{summary.total_students - summary.total_placed} yet to be placed</span>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 bg-secondary rounded-2xl p-1.5 w-fit">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveSection(t.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === t.id ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Overview ── */}
            {activeSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company bar */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-accent" /> Top Hiring Companies
                        </h3>
                        <div className="space-y-3">
                            {company_stats.slice(0, 6).map(c => (
                                <Bar key={c.company} label={c.company} value={c.selected} max={maxCompany} color="#6366f1"
                                    extra={c.avg_package ? `₹${c.avg_package}L` : ''} />
                            ))}
                            {company_stats.length === 0 && <p className="text-text-secondary text-sm text-center py-4">No placement records yet</p>}
                        </div>
                    </div>
                    {/* Branch placement */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-accent" /> Branch Placement Rate
                        </h3>
                        <div className="space-y-3">
                            {branch_stats.map(b => (
                                <div key={b.branch}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-text-secondary text-xs">{b.branch}</span>
                                        <span className="text-text-primary text-xs font-semibold">{b.placed}/{b.total} — {b.rate}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${b.rate}%`, background: b.rate >= 70 ? '#10b981' : b.rate >= 40 ? '#f59e0b' : '#ef4444' }} />
                                    </div>
                                </div>
                            ))}
                            {branch_stats.length === 0 && <p className="text-text-secondary text-sm text-center py-4">No branch data yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Companies ── */}
            {activeSection === 'companies' && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Company</div>
                        <div className="col-span-3">Students Selected</div>
                        <div className="col-span-3">Avg Package</div>
                    </div>
                    {company_stats.map((c, i) => (
                        <div key={c.company} className="grid grid-cols-12 px-5 py-3.5 border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <div className="col-span-1 text-text-secondary text-sm">{i + 1}</div>
                            <div className="col-span-5 text-text-primary font-medium text-sm">{c.company}</div>
                            <div className="col-span-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-24">
                                        <div className="h-full rounded-full bg-accent" style={{ width: `${(c.selected / maxCompany) * 100}%` }} />
                                    </div>
                                    <span className="text-text-primary text-sm font-semibold">{c.selected}</span>
                                </div>
                            </div>
                            <div className="col-span-3 text-text-primary text-sm">{c.avg_package ? `₹${c.avg_package} LPA` : '—'}</div>
                        </div>
                    ))}
                    {company_stats.length === 0 && <div className="p-12 text-center text-text-secondary text-sm">No placement records yet. Mark students as placed from the admin panel.</div>}
                </div>
            )}

            {/* ── Batch / Branch ── */}
            {activeSection === 'batch' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-text-primary mb-5">Batch-Year Comparison</h3>
                        {batch_stats.length === 0 ? (
                            <p className="text-text-secondary text-sm text-center py-8">No batch year data set for students yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {batch_stats.map(b => (
                                    <div key={b.year} className="bg-secondary rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-text-primary font-semibold">Batch {b.year}</span>
                                            <span className={`text-sm font-bold ${b.rate >= 70 ? 'text-green-400' : b.rate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{b.rate}%</span>
                                        </div>
                                        <div className="h-2.5 bg-border rounded-full overflow-hidden mb-1">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${b.rate}%`, background: b.rate >= 70 ? '#10b981' : b.rate >= 40 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                        <p className="text-text-secondary text-xs">{b.placed} placed / {b.total} total</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-text-primary mb-5">Branch-wise Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-xs text-text-secondary uppercase">
                                        <th className="text-left py-2">Branch</th>
                                        <th className="text-right py-2">Total</th>
                                        <th className="text-right py-2">Placed</th>
                                        <th className="text-right py-2">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branch_stats.map(b => (
                                        <tr key={b.branch} className="border-b border-border/50">
                                            <td className="py-3 text-text-primary">{b.branch}</td>
                                            <td className="py-3 text-right text-text-secondary">{b.total}</td>
                                            <td className="py-3 text-right text-green-400 font-semibold">{b.placed}</td>
                                            <td className={`py-3 text-right font-bold ${b.rate >= 70 ? 'text-green-400' : b.rate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{b.rate}%</td>
                                        </tr>
                                    ))}
                                    {branch_stats.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-text-secondary">No branch data</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recent Placements ── */}
            {activeSection === 'recent' && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        <div className="col-span-3">Student</div>
                        <div className="col-span-3">Company</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-2">Package</div>
                        <div className="col-span-1">Date</div>
                    </div>
                    {recent_placements.map((p, i) => (
                        <div key={i} className="grid grid-cols-12 px-5 py-3.5 border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <div className="col-span-3 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {p.student[0]}
                                </div>
                                <span className="text-text-primary text-sm">{p.student}</span>
                            </div>
                            <div className="col-span-3 text-text-primary text-sm flex items-center">{p.company}</div>
                            <div className="col-span-3 text-text-secondary text-sm flex items-center">{p.role}</div>
                            <div className="col-span-2 text-green-400 text-sm font-semibold flex items-center">₹{p.package} LPA</div>
                            <div className="col-span-1 text-text-secondary text-xs flex items-center">{p.date}</div>
                        </div>
                    ))}
                    {recent_placements.length === 0 && <div className="p-12 text-center text-text-secondary text-sm">No placement records yet.</div>}
                </div>
            )}

            {/* ── Unplaced Students ── */}
            {activeSection === 'unplaced' && (
                <div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                        <p className="text-yellow-400 text-sm">Showing up to 20 unplaced students. Mark them as placed from the student detail page.</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            <div className="col-span-4">Name</div>
                            <div className="col-span-4">Branch</div>
                            <div className="col-span-2">Batch</div>
                            <div className="col-span-2">CGPA</div>
                        </div>
                        {unplaced_students.map(s => (
                            <div key={s.id} className="grid grid-cols-12 px-5 py-3.5 border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                <div className="col-span-4 text-text-primary text-sm font-medium">{s.name}</div>
                                <div className="col-span-4 text-text-secondary text-sm">{s.branch}</div>
                                <div className="col-span-2 text-text-secondary text-sm">{s.batch_year}</div>
                                <div className="col-span-2 text-text-secondary text-sm">{s.cgpa}</div>
                            </div>
                        ))}
                        {unplaced_students.length === 0 && <div className="p-12 text-center text-green-400 font-semibold">🎉 All students are placed!</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlacementAnalyticsPage;
