import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    ArrowRight,
    Trophy,
    Target,
    Clock,
    FileText
} from 'lucide-react';

const DashboardPage = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        tests_taken: 0,
        applications: 0,
        shortlisted: 0,
        interviews: 0
    });

    const [activities, setActivities] = useState([]);

    const [upcomingEvents, setUpcomingEvents] = useState([
        { id: 1, title: 'Check new placements', date: new Date().toISOString(), time: '', type: 'info' }
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch('/api/dashboard/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setActivities(data.recent_activity);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-text-primary mb-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-${color}/20`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                </div>
            </div>
        </div>
    );

    const ActivityItem = ({ activity }) => {
        const getIcon = () => {
            switch (activity.type) {
                case 'application': return <FileText className="w-4 h-4" />;
                case 'test': return <Target className="w-4 h-4" />;
                case 'interview': return <Users className="w-4 h-4" />;
                case 'rejection': return <XCircle className="w-4 h-4" />;
                default: return <CheckCircle className="w-4 h-4" />;
            }
        };

        const getStatusColor = () => {
            switch (activity.status) {
                case 'success': return 'bg-success/20 text-success';
                case 'info': return 'bg-accent/20 text-accent';
                case 'danger': return 'bg-danger/20 text-danger';
                default: return 'bg-text-secondary/20 text-text-secondary';
            }
        };

        return (
            <div className="flex items-start space-x-4 p-4 hover:bg-primary/50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getStatusColor()}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p className="text-text-primary font-medium">{activity.title}</p>
                    <p className="text-text-secondary text-sm">
                        {new Date(activity.time).toLocaleDateString()} at {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    };

    const EventItem = ({ event }) => (
        <div className="flex items-center space-x-4 p-4 bg-primary/50 rounded-lg hover:bg-primary transition-colors">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex flex-col items-center justify-center">
                    <span className="text-accent font-bold text-sm">
                        {new Date(event.date).getDate()}
                    </span>
                    <span className="text-accent text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-text-primary font-medium">{event.title}</h4>
                <p className="text-text-secondary text-sm flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-accent/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-accent" />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Welcome back, Student! 👋
                    </h1>
                    <p className="text-text-secondary">
                        Here's what's happening with your placements today
                    </p>
                </div>
                <button
                    onClick={() => navigate('/companies')}
                    className="btn-primary flex items-center space-x-2"
                >
                    <span>Apply to Company</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Target}
                    title="Tests Finished"
                    value={stats.tests_taken}
                    color="accent"
                />
                <StatCard
                    icon={FileText}
                    title="Total Applications"
                    value={stats.applications}
                    color="purple-500"
                />
                <StatCard
                    icon={CheckCircle}
                    title="Shortlisted"
                    value={stats.shortlisted}
                    color="success"
                />
                <StatCard
                    icon={Users}
                    title="Interviews"
                    value={stats.interviews}
                    color="warning"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed - 2 columns */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
                        <button className="text-accent hover:text-accent-hover text-sm font-medium">
                            View All
                        </button>
                    </div>
                    <div className="space-y-2">
                        {activities.map(activity => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>

                {/* Upcoming Events - 1 column */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-text-primary">Upcoming Events</h2>
                        <Calendar className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="space-y-3">
                        {upcomingEvents.map(event => (
                            <EventItem key={event.id} event={event} />
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 border border-border rounded-lg text-text-secondary hover:bg-primary hover:text-text-primary transition-colors">
                        View Calendar
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/aptitude')}
                        className="p-6 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-xl hover:scale-105 transition-transform text-left"
                    >
                        <Trophy className="w-8 h-8 text-accent mb-3" />
                        <h3 className="font-semibold text-text-primary mb-1">Take Test</h3>
                        <p className="text-sm text-text-secondary">Practice aptitude tests</p>
                    </button>
                    <button
                        onClick={() => navigate('/resume')}
                        className="p-6 bg-gradient-to-br from-success/20 to-success/10 border border-success/30 rounded-xl hover:scale-105 transition-transform text-left"
                    >
                        <FileText className="w-8 h-8 text-success mb-3" />
                        <h3 className="font-semibold text-text-primary mb-1">Build Resume</h3>
                        <p className="text-sm text-text-secondary">Create your resume</p>
                    </button>
                    <button
                        onClick={() => navigate('/coding')}
                        className="p-6 bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/30 rounded-xl hover:scale-105 transition-transform text-left"
                    >
                        <Target className="w-8 h-8 text-warning mb-3" />
                        <h3 className="font-semibold text-text-primary mb-1">Solve Problems</h3>
                        <p className="text-sm text-text-secondary">Practice coding</p>
                    </button>
                    <button
                        onClick={() => navigate('/companies')}
                        className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-xl hover:scale-105 transition-transform text-left"
                    >
                        <Users className="w-8 h-8 text-purple-400 mb-3" />
                        <h3 className="font-semibold text-text-primary mb-1">View Companies</h3>
                        <p className="text-sm text-text-secondary">Browse opportunities</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
