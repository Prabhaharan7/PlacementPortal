import React, { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../services/api';
import {
    Building, Briefcase, Users, CheckCircle, Search, Filter,
    ArrowRight, Star, Clock, AlertCircle
} from 'lucide-react';

const STATUS_META = {
    'applied': { label: 'Applied', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'shortlisted': { label: 'Shortlisted', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'interview': { label: 'Interviewing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    'offered': { label: 'Offered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'rejected': { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    'withdrawn': { label: 'Withdrawn', color: 'bg-slate-100 text-slate-600 border-slate-300' },
};

const AdminCompanyMonitorPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        apiCall('/api/admin/company-monitor/')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredApps = useMemo(() => {
        if (!data?.applications) return [];
        return data.applications.filter(a => {
            const matchesSearch = a.student_name.toLowerCase().includes(search.toLowerCase()) ||
                a.company_name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    const { company_summary, total } = data || {};
    const totalOffered = company_summary?.reduce((acc, c) => acc + c.offered, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Building className="w-6 h-6 text-emerald-600" /> Company Monitor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track recruitment pipelines and placed students</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Apps</p>
                        <p className="text-2xl font-black text-slate-800">{total}</p>
                    </div>
                    <div className="bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Total Offers</p>
                        <p className="text-2xl font-black text-emerald-700">{totalOffered}</p>
                    </div>
                </div>
            </div>

            {/* Pipeline Overview Cards */}
            {company_summary && company_summary.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-emerald-500" /> Recruitment Pipelines
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {company_summary.map((comp) => {
                            const max = Math.max(comp.total, 1);
                            const pShort = (comp.shortlisted / max) * 100;
                            const pInt = (comp.interview / max) * 100;
                            const pOff = (comp.offered / max) * 100;

                            return (
                                <div key={comp.company} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 text-slate-500 font-bold shadow-sm">
                                                <Briefcase className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-800">{comp.company}</h3>
                                        </div>
                                        <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-50 transition-colors">
                                            {comp.total}
                                        </span>
                                    </div>

                                    {/* Funnel visualization */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Users className="w-3 h-3 text-blue-600" /></div>
                                            <div className="flex-1 text-slate-600 text-xs font-semibold">Applied</div>
                                            <div className="font-bold tabular-nums text-slate-800">{comp.total}</div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Star className="w-3 h-3 text-amber-600" /></div>
                                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pShort}%` }} />
                                            </div>
                                            <div className="font-bold tabular-nums text-slate-800 w-6 text-right">{comp.shortlisted}</div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><Clock className="w-3 h-3 text-purple-600" /></div>
                                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pInt}%` }} />
                                            </div>
                                            <div className="font-bold tabular-nums text-slate-800 w-6 text-right">{comp.interview}</div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle className="w-3 h-3 text-emerald-600" /></div>
                                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pOff}%` }} />
                                            </div>
                                            <div className="font-bold tabular-nums text-emerald-600 w-6 text-right">{comp.offered}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Application List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Student or Company..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar scroll-smooth">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        {['all', 'applied', 'shortlisted', 'interview', 'offered', 'rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${statusFilter === s
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {s === 'all' ? 'All Statuses' : STATUS_META[s]?.label || s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Applied On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredApps.length > 0 ? filteredApps.map((app) => (
                                <tr key={app.application_id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                                                {app.student_name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{app.student_name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">ID: {app.student_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-700 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                                            {app.company_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${STATUS_META[app.status]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {STATUS_META[app.status]?.label || app.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-medium text-slate-600">
                                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                                        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20 text-emerald-500" />
                                        <p className="text-sm font-medium">No applications match your search criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCompanyMonitorPage;
