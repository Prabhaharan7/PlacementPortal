import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import {
    Search, Users, ChevronRight, Filter, Download
} from 'lucide-react';

const pct2style = (pct) => {
    if (pct >= 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (pct >= 40) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

const AdminStudentMonitorPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPerf, setFilterPerf] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        apiCall('/api/admin/students/')
            .then(d => setStudents(d.students || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        return students.filter(s => {
            const name = `${s.first_name} ${s.last_name} ${s.username} ${s.email}`.toLowerCase();
            if (search && !name.includes(search.toLowerCase())) return false;
            if (filterPerf === 'top' && s.overall_percentage < 70) return false;
            if (filterPerf === 'mid' && (s.overall_percentage < 40 || s.overall_percentage >= 70)) return false;
            if (filterPerf === 'low' && s.overall_percentage >= 40) return false;
            return true;
        });
    }, [students, search, filterPerf]);

    const stats = useMemo(() => {
        const top = students.filter(s => s.overall_percentage >= 70).length;
        const mid = students.filter(s => s.overall_percentage >= 40 && s.overall_percentage < 70).length;
        const low = students.filter(s => s.overall_percentage < 40).length;
        return { total: students.length, top, mid, low };
    }, [students]);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Name,Username,Email,Overall_Score\n"
            + filtered.map(s => `${s.id},"${s.first_name} ${s.last_name}",${s.username},${s.email},${s.overall_percentage}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-600" /> Student Directory
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all registered students and their overall placement readiness.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Enrolled</p>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Top Tier (≥70%)</p>
                        <p className="text-2xl font-black text-emerald-700">{stats.top}</p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, username, or email..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'top', label: 'Top (≥70%)' },
                            { key: 'mid', label: 'Mid (40–69%)' },
                            { key: 'low', label: 'At Risk (<40%)' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilterPerf(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${filterPerf === f.key
                                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={handleExport} className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* Clean Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20 text-purple-500" />
                        <p className="text-sm font-medium">No students match your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Candidate Info</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-center">Contact</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-center">Overall Readiness</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(s => {
                                    const displayName = [s.first_name, s.last_name].filter(Boolean).join(' ') || s.username;
                                    return (
                                        <tr key={s.id}
                                            onClick={() => navigate(`/admin/students/${s.id}`)}
                                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-indigo-200">
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{displayName}</span>
                                                        <span className="text-[11px] text-slate-400 font-medium">@{s.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs text-slate-500">{s.email || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${pct2style(s.overall_percentage)}`}>
                                                    {s.overall_percentage.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end pr-2">
                                                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-purple-100 transition-colors border border-transparent group-hover:border-purple-200 text-slate-400 group-hover:text-purple-600">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStudentMonitorPage;
