import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Menu, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NOTIF_ICONS = {
    success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />,
    alert: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
};

const TopBar = ({ onMenuClick }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchFocus, setSearchFocus] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = () => {
        apiCall('/api/notifications/').then(d => {
            setNotifications(d.notifications || []);
            setUnreadCount(d.unread_count || 0);
        }).catch(() => { });
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        await apiCall(`/api/notifications/${id}/read/`, 'POST');
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        await apiCall('/api/notifications/read-all/', 'POST');
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const timeAgo = (iso) => {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div className="h-16 bg-secondary/80 backdrop-blur-md border-b border-border sticky top-0 z-40 supports-[backdrop-filter]:bg-secondary/60">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center space-x-4">
                    <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-primary transition-colors">
                        <Menu className="w-5 h-5 text-text-secondary" />
                    </button>
                    <div className={`relative flex items-center transition-all duration-300 ${searchFocus ? 'w-96' : 'w-64'}`}>
                        <Search className="absolute left-3 w-5 h-5 text-text-secondary" />
                        <input type="text" placeholder="Search companies, tests, problems..."
                            className="w-full pl-10 pr-4 py-2 bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                            onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)} />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg hover:bg-primary transition-colors">
                            <Bell className="w-5 h-5 text-text-secondary" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                    <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                        <Bell className="w-4 h-4" /> Notifications
                                        {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-xs text-accent hover:text-accent/80 flex items-center gap-1">
                                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-text-secondary text-sm">No notifications yet</div>
                                    ) : notifications.map(n => (
                                        <div key={n.id}
                                            onClick={() => { markRead(n.id); if (n.link) { navigate(n.link); setShowNotifications(false); } }}
                                            className={`p-4 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors ${!n.is_read ? 'bg-accent/5' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {NOTIF_ICONS[n.type] || NOTIF_ICONS.info}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium ${!n.is_read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</p>
                                                        {!n.is_read && <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />}
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-text-secondary mt-1">{timeAgo(n.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button className="p-2 rounded-lg hover:bg-primary transition-colors">
                        <Settings className="w-5 h-5 text-text-secondary" />
                    </button>

                    {/* User profile */}
                    <div className="flex items-center space-x-3 pl-4 border-l border-border">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">{user?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-text-primary">{[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || 'Student'}</p>
                            <p className="text-xs text-text-secondary">{user?.role === 'admin' ? 'Administrator' : (user?.roll_number || 'Student')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
