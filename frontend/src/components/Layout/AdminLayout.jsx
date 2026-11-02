import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Brain, BarChart2, Bell,
    LogOut, ChevronLeft, ShieldCheck, Activity,
    TrendingUp, Building, Code, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/students', icon: Users, label: 'All Students' },
    { path: '/admin/aptitude', icon: Brain, label: 'Aptitude Monitor' },
    { path: '/admin/coding', icon: Code, label: 'Coding Monitor' },
    { path: '/admin/companies', icon: Building, label: 'Company Monitor' },
    { path: '/admin/materials', icon: BookOpen, label: 'Manage Materials' },
    { path: '/admin/analytics', icon: TrendingUp, label: 'Placement Analytics' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* ── Admin Sidebar ── */}
            <aside className={`
                fixed left-0 top-0 h-screen z-50 flex flex-col
                bg-slate-50 border-r border-slate-200 shadow-sm
                transition-all duration-300
                ${collapsed ? 'w-20' : 'w-64'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
                    {!collapsed && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-purple-200">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-slate-800 font-bold text-sm leading-tight">PlacePortal</p>
                                <p className="text-purple-600 text-[10px] font-semibold uppercase tracking-wider">Admin Panel</p>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Admin user badge */}
                {!collapsed && (
                    <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user?.name?.charAt(0) || user?.first_name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-800 text-xs font-semibold truncate">
                                {user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Admin'}
                            </p>
                            <p className="text-purple-500 text-[10px] font-medium">Administrator</p>
                        </div>
                    </div>
                )}

                {/* Nav items */}
                <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                    {!collapsed && (
                        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Monitoring
                        </p>
                    )}
                    {ADMIN_NAV.map(item => (
                        <NavLink key={item.path} to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-all duration-150 group relative
                                ${isActive
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }
                            `}>
                            {({ isActive }) => (<>
                                <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </>)}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-200 shrink-0">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150">
                        <LogOut className="w-4.5 h-4.5 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
                        {!collapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Monitoring Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
