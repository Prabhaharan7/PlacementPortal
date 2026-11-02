import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiCall } from '../services/api';
import {
    Bell, Send, Clock, Info, AlertTriangle, CheckCircle,
    AlertCircle, Users, Search, ChevronDown, ChevronUp,
    UserCheck, UserX, Shield, CheckSquare, Square
} from 'lucide-react';

/* ── constants ── */
const TYPE_META = {
    info: { icon: Info, label: 'Info', sel: 'bg-blue-600 text-white border-blue-700', idle: 'bg-blue-50 text-blue-700 border-blue-200' },
    success: { icon: CheckCircle, label: 'Success', sel: 'bg-emerald-600 text-white border-emerald-700', idle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    warning: { icon: AlertTriangle, label: 'Warning', sel: 'bg-amber-500 text-white border-amber-600', idle: 'bg-amber-50 text-amber-700 border-amber-200' },
    alert: { icon: AlertCircle, label: 'Alert', sel: 'bg-red-600 text-white border-red-700', idle: 'bg-red-50 text-red-700 border-red-200' },
};

const STATUS_META = {
    success: { label: '✅ Success', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', desc: 'Avg ≥ 70%' },
    warning: { label: '⚠️ Warning', badge: 'bg-amber-100  text-amber-700  border-amber-200', dot: 'bg-amber-500', desc: 'Avg 40–70%' },
    alert: { label: '🚨 Alert', badge: 'bg-red-100    text-red-700    border-red-200', dot: 'bg-red-500', desc: 'Avg < 40%' },
};

const BADGE = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    alert: 'bg-red-100 text-red-700 border-red-200',
};

function timeAgo(iso) {
    if (!iso) return '';
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

/* ── Student selector panel ── */
const StudentSelector = ({ students, selected, onToggle, onSelectAll, onClearAll, statusFilter, setStatusFilter }) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() =>
        students.filter(s => {
            const m = statusFilter === 'all' || s.status === statusFilter;
            const q = !search || `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase());
            return m && q;
        }),
        [students, statusFilter, search]
    );

    const grouped = useMemo(() => {
        const g = { alert: [], warning: [], success: [] };
        filtered.forEach(s => g[s.status]?.push(s));
        return g;
    }, [filtered]);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Status filter tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                {[{ key: 'all', label: 'All' }, ...Object.entries(STATUS_META).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
                    <button key={f.key} onClick={() => setStatusFilter(f.key)}
                        className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors border-b-2 ${statusFilter === f.key
                            ? 'border-purple-600 text-purple-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Search + bulk actions */}
            <div className="p-3 flex items-center gap-2 border-b border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search students…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                    />
                </div>
                <button onClick={() => onSelectAll(filtered.map(s => s.id))}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition-colors whitespace-nowrap">
                    All
                </button>
                <button onClick={onClearAll}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                    Clear
                </button>
            </div>

            {/* Student list grouped by status */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {['alert', 'warning', 'success'].map(status => {
                    const group = grouped[status];
                    if (!group?.length) return null;
                    const meta = STATUS_META[status];
                    return (
                        <div key={status}>
                            <div className="sticky top-0 px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                <span className="text-xs font-semibold text-slate-500">{meta.label} · {meta.desc}</span>
                                <span className="ml-auto text-[10px] text-slate-400">{group.length} students</span>
                            </div>
                            {group.map(s => (
                                <label key={s.id}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input type="checkbox"
                                        checked={selected.includes(s.id)}
                                        onChange={() => onToggle(s.id)}
                                        className="w-4 h-4 accent-purple-600 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium truncate">{s.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{s.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                        <span className="text-xs text-slate-500">{s.avg_score}%</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">No students found.</div>
                )}
            </div>

            {/* Selection count */}
            {selected.length > 0 && (
                <div className="px-3 py-2 bg-purple-50 border-t border-purple-100 text-xs text-purple-700 font-semibold">
                    {selected.length} student{selected.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
};

/* ── Main page ── */
const AdminNotificationsPage = () => {
    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [recipient, setRecipient] = useState('all'); // 'all' | 'selected'
    const [selectedIds, setSelectedIds] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

    // Send state
    const [sending, setSending] = useState(false);
    const [sentMsg, setSentMsg] = useState('');
    const [error, setError] = useState('');

    // Data state
    const [students, setStudents] = useState([]);
    const [history, setHistory] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const loadHistory = useCallback(() => {
        setLoadingHistory(true);
        apiCall('/api/admin/notifications/sent/')
            .then(d => setHistory(d.notifications || []))
            .catch(() => { })
            .finally(() => setLoadingHistory(false));
    }, []);

    // Load students when 'selected' mode is chosen
    useEffect(() => {
        if (recipient === 'selected' && students.length === 0) {
            setLoadingStudents(true);
            apiCall('/api/admin/notifications/students/')
                .then(d => setStudents(d.students || []))
                .catch(() => { })
                .finally(() => setLoadingStudents(false));
        }
    }, [recipient]);

    useEffect(() => { loadHistory(); }, []);

    const toggleStudent = (id) => setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    const selectAll = (ids) => setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    const clearAll = () => setSelectedIds([]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;
        if (recipient === 'selected' && selectedIds.length === 0) {
            setError('Please select at least one student.');
            return;
        }
        setSending(true); setError(''); setSentMsg('');
        try {
            const res = await apiCall('/api/admin/notifications/', 'POST', {
                title: title.trim(),
                message: message.trim(),
                type,
                recipient,
                student_ids: selectedIds,
            });
            setSentMsg(`✅ Sent to ${res.sent_to} student${res.sent_to !== 1 ? 's' : ''}!`);
            setTitle(''); setMessage(''); setSelectedIds([]);
            loadHistory();
            setTimeout(() => setSentMsg(''), 4000);
        } catch (err) {
            setError(err.message || 'Failed to send. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-purple-600" /> Notifications
                </h1>
                <p className="text-slate-500 text-sm mt-1">Send targeted or broadcast messages to students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── LEFT: Compose ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-slate-700 font-semibold flex items-center gap-2">
                        <Send className="w-4 h-4 text-purple-600" /> Compose
                    </h2>

                    {sentMsg && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 shrink-0" /> {sentMsg}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-4">
                        {/* Notification type */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(TYPE_META).map(([key, meta]) => {
                                    const Icon = meta.icon;
                                    return (
                                        <button type="button" key={key} onClick={() => setType(key)}
                                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${type === key ? meta.sel : meta.idle}`}>
                                            <Icon className="w-4 h-4" />
                                            {meta.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required
                                placeholder="e.g. Placement Drive on March 5th"
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Message</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={3}
                                placeholder="Write your message here…"
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                            />
                        </div>

                        {/* Recipients */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recipients</label>
                            <div className="flex gap-2 mb-3">
                                <button type="button" onClick={() => setRecipient('all')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${recipient === 'all'
                                        ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-100'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}>
                                    <Users className="w-4 h-4" /> All Students
                                </button>
                                <button type="button" onClick={() => setRecipient('selected')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${recipient === 'selected'
                                        ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-100'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}>
                                    <UserCheck className="w-4 h-4" /> Select Students
                                </button>
                            </div>

                            {/* Student selector — shows when 'selected' */}
                            {recipient === 'selected' && (
                                loadingStudents ? (
                                    <div className="flex items-center justify-center h-20">
                                        <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <StudentSelector
                                        students={students}
                                        selected={selectedIds}
                                        onToggle={toggleStudent}
                                        onSelectAll={selectAll}
                                        onClearAll={clearAll}
                                        statusFilter={statusFilter}
                                        setStatusFilter={setStatusFilter}
                                    />
                                )
                            )}

                            {recipient === 'all' && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                                    <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    This notification will be delivered to every registered student
                                </div>
                            )}
                        </div>

                        <button type="submit"
                            disabled={sending || !title.trim() || !message.trim() || (recipient === 'selected' && selectedIds.length === 0)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-md shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            {sending
                                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                                : <><Send className="w-4 h-4" /> {recipient === 'all' ? 'Send to All Students' : `Send to ${selectedIds.length} Student${selectedIds.length !== 1 ? 's' : ''}`}</>
                            }
                        </button>
                    </form>
                </div>

                {/* ── RIGHT: History ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-slate-700 font-semibold mb-5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" /> Sent History
                    </h2>
                    {loadingHistory ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-slate-400">
                            <Bell className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No notifications sent yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {history.map(n => {
                                const meta = TYPE_META[n.type] || TYPE_META.info;
                                const Icon = meta.icon;
                                return (
                                    <div key={n.id} className={`rounded-xl p-3.5 border ${BADGE[n.type] || BADGE.info}`}>
                                        <div className="flex items-start gap-2.5">
                                            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                                                    <span>{timeAgo(n.created_at)}</span>
                                                    <span>·</span>
                                                    <span>{n.recipient_count} recipient{n.recipient_count !== 1 ? 's' : ''}</span>
                                                    {n.read_count > 0 && <>
                                                        <span>·</span>
                                                        <span className="text-emerald-600">{n.read_count} read</span>
                                                    </>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsPage;
