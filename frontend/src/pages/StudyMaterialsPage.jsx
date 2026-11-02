import React, { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../services/api';
import {
    BookOpen, FileText, Code, Brain, Building2,
    Download, ExternalLink, Search, Filter, BookHeart,
    Lightbulb, Puzzle, BookA, BookText
} from 'lucide-react';

const TOPICS = [
    { id: 'all', label: 'All Resources', icon: BookHeart },
    { id: 'aptitude', label: 'Aptitude', icon: Brain },
    { id: 'logical', label: 'Logical', icon: Lightbulb },
    { id: 'reasoning', label: 'Reasoning', icon: Puzzle },
    { id: 'verbal', label: 'Verbal', icon: BookA },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'companies', label: 'Companies', icon: Building2 },
];

const StudyMaterialsPage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        apiCall('/api/materials/')
            .then(d => setMaterials(d.materials || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => {
            const matchesTab = activeTab === 'all' || m.topic === activeTab;
            const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                (m.description || '').toLowerCase().includes(search.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [materials, activeTab, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-indigo-200" /> Study Materials
                        </h1>
                        <p className="text-indigo-100 mt-2 max-w-lg">
                            Access high-quality resources, practice materials, and guides curated by admins to help you prepare for placements.
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-20 z-10">
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-1 lg:pb-0">
                    {TOPICS.map(t => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-80 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredMaterials.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl py-24 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-700">No materials found</h3>
                    <p className="text-slate-500 mt-1">Check back later or try a different search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMaterials.map(mat => {
                        const TopicIcon = TOPICS.find(t => t.id === mat.topic)?.icon || BookText;
                        return (
                            <div key={mat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                        <TopicIcon className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                        {mat.topic}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                                    {mat.title}
                                </h3>

                                <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">
                                    {mat.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                                    {mat.file_url && (
                                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer"
                                            className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200">
                                            <ExternalLink className="w-4 h-4" /> Open Link
                                        </a>
                                    )}
                                    {mat.file_upload && (
                                        <a href={mat.file_upload} download target="_blank" rel="noopener noreferrer"
                                            className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-indigo-200">
                                            <Download className="w-4 h-4" /> Download File
                                        </a>
                                    )}
                                    {!mat.file_url && !mat.file_upload && (
                                        <span className="flex-1 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-sm font-semibold flex items-center justify-center text-center italic border border-slate-100">
                                            No file attached
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudyMaterialsPage;
