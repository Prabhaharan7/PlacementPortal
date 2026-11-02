import React, { useState, useEffect } from 'react';
import { User, Edit, Save, Github, Linkedin, Plus, X } from 'lucide-react';

/* ── Reusable light input ── */
const Field = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
        {children}
    </div>
);

const lightInput = `
    w-full bg-white border border-gray-300 rounded-xl px-4 py-3
    text-gray-900 placeholder-gray-400 text-sm
    focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-all duration-200
`.replace(/\s+/g, ' ').trim();

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        roll_number: '',
        branch: '',
        batch_year: '',
        location: '',
        bio: '',
        skills: [],
        linkedin: '',
        github: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/auth/user/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        roll_number: data.roll_number || '',
                        branch: data.branch || '',
                        batch_year: data.batch_year ? data.batch_year.toString() : '',
                        location: data.location || '',
                        bio: data.bio || '',
                        skills: data.skills || [],
                        linkedin: data.linkedin || '',
                        github: data.github || ''
                    });
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                setIsEditing(false);
            } else {
                alert('Failed to save profile.');
            }
        } catch (error) {
            console.error("Error saving profile", error);
            alert('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const achievements = [
        { id: 1, title: 'First in Aptitude Test', icon: '🏆', date: '2024-02-10' },
        { id: 2, title: '100 Problems Solved', icon: '💻', date: '2024-02-05' },
        { id: 3, title: 'Perfect Resume Score', icon: '📄', date: '2024-01-28' },
    ];

    const set = (key) => (e) => setProfile({ ...profile, [key]: e.target.value });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1">Profile</h1>
                    <p className="text-text-secondary text-sm">Manage your personal information</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    {isEditing ? <><Save className="w-4 h-4" /><span>{saving ? 'Saving...' : 'Save Changes'}</span></> : <><Edit className="w-4 h-4" /><span>Edit Profile</span></>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: Avatar + quick stats + achievements ── */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Avatar card */}
                    <div className="bg-card border border-border rounded-2xl p-6 text-center">
                        <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg">
                            <User className="w-14 h-14 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">{`${profile.first_name} ${profile.last_name}`}</h2>
                        <p className="text-text-secondary text-sm mt-0.5">{profile.roll_number}</p>

                        <div className="mt-4 space-y-2 text-left">
                            {[
                                { label: 'Branch', value: profile.branch || 'Not set' },
                                { label: 'Batch Year', value: profile.batch_year || 'Not set' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
                                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bio side preview */}
                        {profile.bio && (
                            <div className="mt-6 text-left">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h4>
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-line">
                                    {profile.bio}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-text-primary mb-4">Achievements</h3>
                        <div className="space-y-3">
                            {achievements.map(a => (
                                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <span className="text-2xl">{a.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{a.title}</p>
                                        <p className="text-xs text-gray-400">{a.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Editable form ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-5">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="First Name">
                                <input type="text" value={profile.first_name || ''} onChange={set('first_name')} disabled={!isEditing} className={lightInput} placeholder="First name" />
                            </Field>
                            <Field label="Last Name">
                                <input type="text" value={profile.last_name || ''} onChange={set('last_name')} disabled={!isEditing} className={lightInput} placeholder="Last name" />
                            </Field>
                            <Field label="Phone Number">
                                <input type="tel" value={profile.phone || ''} onChange={set('phone')} disabled={!isEditing} className={lightInput} placeholder="+91 XXXXX XXXXX" />
                            </Field>
                            <Field label="Roll Number">
                                <input type="text" value={profile.roll_number || ''} onChange={set('roll_number')} disabled={!isEditing} className={lightInput} placeholder="Roll Number" />
                            </Field>
                            <Field label="Branch">
                                <input type="text" value={profile.branch || ''} onChange={set('branch')} disabled={!isEditing} className={lightInput} placeholder="e.g. Computer Science" />
                            </Field>
                            <Field label="Batch Year">
                                <input type="text" value={profile.batch_year || ''} onChange={set('batch_year')} disabled={!isEditing} className={lightInput} placeholder="e.g. 2026" />
                            </Field>
                            <Field label="Bio">
                                <div className="md:col-span-2">
                                    <textarea
                                        value={profile.bio}
                                        onChange={set('bio')}
                                        disabled={!isEditing}
                                        rows={3}
                                        className={lightInput + ' resize-none'}
                                        placeholder="Tell us about yourself…"
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-5">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="LinkedIn">
                                <div className="relative">
                                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                    <input type="text" value={profile.linkedin} onChange={set('linkedin')} disabled={!isEditing} className={lightInput + ' pl-10'} placeholder="linkedin.com/in/username" />
                                </div>
                            </Field>
                            <Field label="GitHub">
                                <div className="relative">
                                    <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                    <input type="text" value={profile.github} onChange={set('github')} disabled={!isEditing} className={lightInput + ' pl-10'} placeholder="github.com/username" />
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(profile.skills) && profile.skills.map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium border border-accent/20 flex items-center gap-2">
                                    {skill}
                                    {isEditing && (
                                        <button
                                            onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })}
                                            className="text-accent/60 hover:text-red-500 transition-colors focus:outline-none"
                                            title="Remove skill"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>

                        {/* Add new skill input */}
                        {isEditing && (
                            <div className="mt-4 flex items-center gap-2 max-w-sm">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newSkill.trim()) {
                                                const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
                                                setProfile({ ...profile, skills: [...currentSkills, newSkill.trim()] });
                                                setNewSkill('');
                                            }
                                        }
                                    }}
                                    placeholder="Type a skill & press enter..."
                                    className={`${lightInput} py-2 text-sm flex-1`}
                                />
                                <button
                                    onClick={() => {
                                        if (newSkill.trim()) {
                                            const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
                                            setProfile({ ...profile, skills: [...currentSkills, newSkill.trim()] });
                                            setNewSkill('');
                                        }
                                    }}
                                    className="bg-accent hover:bg-accent/90 text-white p-2 rounded-xl transition-colors focus:outline-none"
                                    title="Add skill"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
