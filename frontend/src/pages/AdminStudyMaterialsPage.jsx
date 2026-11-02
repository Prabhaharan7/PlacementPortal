import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import {
    BookOpen, Plus, Trash2, Link as LinkIcon, Download, Loader2
} from 'lucide-react';

const TOPICS = [
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'logical', label: 'Logical' },
    { value: 'reasoning', label: 'Reasoning' },
    { value: 'verbal', label: 'Verbal' },
    { value: 'coding', label: 'Coding' },
    { value: 'resume', label: 'Resume' },
    { value: 'companies', label: 'Companies' },
];

const AdminStudyMaterialsPage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [topic, setTopic] = useState('aptitude');
    const [fileUrl, setFileUrl] = useState('');
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadData = () => {
        setLoading(true);
        apiCall('/api/admin/materials/')
            .then(d => setMaterials(d.materials || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('topic', topic);
        formData.append('file_url', fileUrl);
        if (file) formData.append('file_upload', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/materials/', {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}` },
                body: formData
            });
            if (res.ok) {
                setIsModalOpen(false);
                setTitle(''); setDescription(''); setFileUrl(''); setFile(null);
                loadData();
            } else {
                alert('Failed to save material.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/materials/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (res.ok) {
                setMaterials(prev => prev.filter(m => m.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-600" /> Manage Materials
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Upload and organize study resources for students.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-purple-200"
                >
                    <Plus className="w-5 h-5" /> Upload Material
                </button>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm">
                {loading ? (
                    <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>
                ) : materials.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20 text-purple-500" />
                        <p className="font-medium">No materials uploaded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Material Details</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-32">Topic</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-48 text-center">Attachments</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-24 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {materials.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 text-base">{m.title}</p>
                                            <p className="text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-slate-200">
                                                {m.topic}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                {m.file_url && (
                                                    <a href={m.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors w-28 justify-center border border-blue-100">
                                                        <LinkIcon className="w-3.5 h-3.5" /> Link
                                                    </a>
                                                )}
                                                {m.file_upload && (
                                                    <a href={m.file_upload} target="_blank" rel="noreferrer" download className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors w-28 justify-center border border-emerald-100">
                                                        <Download className="w-3.5 h-3.5" /> File
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Upload Material</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Title <span className="text-red-500">*</span></label>
                                <input required value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Topic <span className="text-red-500">*</span></label>
                                    <select value={topic} onChange={e => setTopic(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
                                        {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Description</label>
                                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Attachments (Provide link or file)</p>

                                <div>
                                    <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">External URL</label>
                                    <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..."
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                                </div>

                                <div className="text-center font-bold text-slate-400 text-xs">— OR —</div>

                                <div>
                                    <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Upload File</label>
                                    <input type="file" onChange={e => setFile(e.target.files[0])}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Upload Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudyMaterialsPage;
