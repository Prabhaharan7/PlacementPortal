import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Brain,
    Code,
    FileText,
    Building2,
    User,
    ChevronLeft,
    LogOut,
    Trophy,
    CalendarClock,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const studentNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/aptitude', icon: Brain, label: 'Aptitude' },
    { path: '/coding', icon: Code, label: 'Coding' },
    { path: '/materials', icon: BookOpen, label: 'Study Materials' },
    { path: '/resume', icon: FileText, label: 'Resume' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) => `
                flex items-center space-x-3 px-3 py-3 rounded-lg
                transition-all duration-200 group relative
                ${isActive
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-text-secondary hover:bg-accent/10 hover:text-accent'
                }
            `}
        >
            {({ isActive }) => (<>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                {isActive && <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />}
            </>)}
        </NavLink>
    );

    return (
        <div className={`
            fixed left-0 top-0 h-screen bg-slate-50 border-r border-border shadow-sm
            transition-all duration-300 z-50 flex flex-col
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <span className="font-display font-semibold text-lg text-text-primary">PlacePortal</span>
                    </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-primary transition-colors">
                    <ChevronLeft className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation — students only */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {studentNavItems.map(item => <NavItem key={item.path} item={item} />)}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border shrink-0">
                <button onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-all duration-200">
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>

            {/* Collapse hint */}
            {isCollapsed && (
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div className="w-6 h-12 bg-secondary border border-border rounded-r-lg flex items-center justify-center">
                        <div className="w-1 h-6 bg-accent rounded-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
