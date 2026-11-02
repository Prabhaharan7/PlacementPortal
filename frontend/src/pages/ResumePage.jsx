import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    FileText, Download, Save, Plus, Trash2, ChevronDown, ChevronUp,
    User, Mail, Phone, MapPin, Linkedin, Github, BookOpen, Briefcase,
    Code2, Award, GripVertical, CheckCircle
} from 'lucide-react';
import { apiCall } from '../services/api';

/* ─────────── helpers ─────────── */
const API_BASE = 'http://localhost:8000';

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {open && <div className="px-5 pb-5 pt-1 space-y-3">{children}</div>}
        </div>
    );
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
    </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none" />
    </div>
);

/* ─────────── LIVE PREVIEW ─────────── */
const ResumePreview = React.forwardRef(({ data }, ref) => {
    const { name = 'Your Name', email = '', phone = '', location = '', linkedin = '', github = '',
        summary = '', skills = [], education = [], experience = [], projects = [], certifications = [] } = data;

    const hasContact = email || phone || location || linkedin || github;

    return (
        <div ref={ref} className="bg-white text-gray-900 font-sans p-8 min-h-[1122px] text-[13px] leading-relaxed shadow-2xl">
            {/* Header */}
            <div className="border-b-2 border-blue-600 pb-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{name || 'Your Name'}</h1>
                {hasContact && (
                    <p className="text-gray-500 mt-1 text-xs flex flex-wrap gap-x-3">
                        {email && <span>✉ {email}</span>}
                        {phone && <span>📞 {phone}</span>}
                        {location && <span>📍 {location}</span>}
                        {linkedin && <span>in {linkedin}</span>}
                        {github && <span>⌥ {github}</span>}
                    </p>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Professional Summary</h2>
                    <p className="text-gray-700">{summary}</p>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Technical Skills</h2>
                    <p className="text-gray-700">{skills.join(' · ')}</p>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Education</h2>
                    {education.map((e, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">{e.degree}{e.institution && ` — ${e.institution}`}</span>
                                <span className="text-gray-500 text-xs">{e.year}</span>
                            </div>
                            {e.cgpa && <p className="text-gray-500 text-xs">CGPA: {e.cgpa}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Experience</h2>
                    {experience.map((e, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">{e.role}{e.company && ` — ${e.company}`}</span>
                                <span className="text-gray-500 text-xs">{e.period}</span>
                            </div>
                            {e.description && <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-line">{e.description}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Projects</h2>
                    {projects.map((p, i) => (
                        <div key={i} className="mb-3">
                            <span className="font-semibold text-gray-900">{p.name}</span>
                            {p.technologies && <span className="text-gray-500 text-xs"> ({p.technologies})</span>}
                            {p.description && <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-line">{p.description}</p>}
                            {p.link && <p className="text-blue-600 text-xs">{p.link}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Certifications</h2>
                    {certifications.map((c, i) => (
                        <p key={i} className="text-gray-700">• <strong>{c.name}</strong>{c.issuer && ` — ${c.issuer}`} {c.year}</p>
                    ))}
                </div>
            )}
        </div>
    );
});

/* ─────────── MAIN PAGE ─────────── */
const DEFAULT_DATA = {
    name: '', email: '', phone: '', location: '', linkedin: '', github: '',
    summary: '',
    skills: ['React', 'Python', 'Django', 'SQL'],
    education: [{ degree: '', institution: '', year: '', cgpa: '' }],
    experience: [],
    projects: [{ name: '', technologies: '', description: '', link: '' }],
    certifications: [],
};

const ResumePage = () => {
    const [data, setData] = useState(DEFAULT_DATA);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [activeTab, setActiveTab] = useState('edit'); // edit | preview
    const previewRef = useRef(null);
    const token = localStorage.getItem('token');

    /* Load existing resume on mount */
    useEffect(() => {
        apiCall('/api/resume/').then(res => {
            if (res.resume?.data) {
                setData(prev => ({ ...DEFAULT_DATA, ...res.resume.data }));
            }
        }).catch(() => { });
    }, []);

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

    const updateArr = (field, idx, key, value) => {
        setData(prev => {
            const arr = [...(prev[field] || [])];
            arr[idx] = { ...arr[idx], [key]: value };
            return { ...prev, [field]: arr };
        });
    };

    const addArr = (field, template) => setData(prev => ({ ...prev, [field]: [...(prev[field] || []), template] }));
    const removeArr = (field, idx) => setData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiCall('/api/resume/', { method: 'POST', body: JSON.stringify({ template: 'modern', data }) });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { }
        setSaving(false);
    };

    const handleDownload = async () => {
        const node = previewRef.current;
        if (!node) { alert('Preview not found. Please try again.'); return; }
        setDownloading(true);

        // If on Edit tab, briefly show preview to capture it
        const wasEdit = activeTab === 'edit';
        if (wasEdit) setActiveTab('preview');

        // Wait for the DOM to update after tab switch
        await new Promise(r => setTimeout(r, 300));

        try {
            const A4_W_MM = 210;
            const A4_H_MM = 297;

            const canvas = await html2canvas(node, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                windowWidth: node.scrollWidth,
                windowHeight: node.scrollHeight,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

            const imgW = A4_W_MM;
            const imgH = (canvas.height / canvas.width) * imgW;
            const pageH = A4_H_MM;

            if (imgH <= pageH) {
                pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
            } else {
                let yPos = 0;
                let heightLeft = imgH;
                pdf.addImage(imgData, 'JPEG', 0, yPos, imgW, imgH);
                heightLeft -= pageH;
                while (heightLeft > 0) {
                    yPos -= pageH;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, yPos, imgW, imgH);
                    heightLeft -= pageH;
                }
            }

            pdf.save(`${data.name || 'Resume'}.pdf`);
        } catch (e) {
            console.error(e);
            alert('PDF generation failed. Please try again.');
        }

        if (wasEdit) setActiveTab('edit');
        setDownloading(false);
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !data.skills.includes(s)) {
            update('skills', [...data.skills, s]);
        }
        setSkillInput('');
    };

    return (
        <div className="flex flex-col h-full -m-6">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Resume Builder</h1>
                    <p className="text-text-secondary text-xs">Fill in your details and download a professional PDF</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Tab toggle */}
                    <div className="flex bg-secondary rounded-xl p-1 text-sm">
                        <button onClick={() => setActiveTab('edit')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'edit' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Edit</button>
                        <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Preview</button>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-secondary border border-border text-text-primary hover:bg-border'}`}>
                        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                    <button onClick={handleDownload} disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                        <Download className="w-4 h-4" />
                        {downloading ? 'Generating…' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ── EDIT PANEL ── */}
                <div className={`${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[52%] overflow-y-auto bg-gray-50 border-r border-border`}>
                    <div className="p-5 space-y-4">

                        {/* Personal Info */}
                        <Section title="Personal Information" icon={User}>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Full Name" value={data.name} onChange={v => update('name', v)} placeholder="John Doe" />
                                <Input label="Email" type="email" value={data.email} onChange={v => update('email', v)} placeholder="john@example.com" />
                                <Input label="Phone" value={data.phone} onChange={v => update('phone', v)} placeholder="+91 9876543210" />
                                <Input label="Location" value={data.location} onChange={v => update('location', v)} placeholder="Chennai, TN" />
                                <Input label="LinkedIn URL" value={data.linkedin} onChange={v => update('linkedin', v)} placeholder="linkedin.com/in/yourname" />
                                <Input label="GitHub URL" value={data.github} onChange={v => update('github', v)} placeholder="github.com/yourname" />
                            </div>
                        </Section>

                        {/* Summary */}
                        <Section title="Professional Summary" icon={FileText}>
                            <Textarea label="Summary" value={data.summary} onChange={v => update('summary', v)}
                                placeholder="Motivated CS student with strong foundation in web development and algorithms…" rows={4} />
                        </Section>

                        {/* Skills */}
                        <Section title="Technical Skills" icon={Code2}>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {data.skills.map((s, i) => (
                                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                                        {s}
                                        <button onClick={() => update('skills', data.skills.filter((_, ii) => ii !== i))} className="hover:text-red-500 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                                    placeholder="Type a skill and press Enter…"
                                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
                                <button onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Add</button>
                            </div>
                        </Section>

                        {/* Education */}
                        <Section title="Education" icon={BookOpen}>
                            {data.education.map((edu, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 relative">
                                    <button onClick={() => removeArr('education', i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input label="Degree / Course" value={edu.degree} onChange={v => updateArr('education', i, 'degree', v)} placeholder="B.Tech Computer Science" />
                                        <Input label="Institution" value={edu.institution} onChange={v => updateArr('education', i, 'institution', v)} placeholder="Anna University" />
                                        <Input label="Year" value={edu.year} onChange={v => updateArr('education', i, 'year', v)} placeholder="2021–2025" />
                                        <Input label="CGPA / %" value={edu.cgpa} onChange={v => updateArr('education', i, 'cgpa', v)} placeholder="8.5" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addArr('education', { degree: '', institution: '', year: '', cgpa: '' })}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        </Section>

                        {/* Experience */}
                        <Section title="Experience" icon={Briefcase} defaultOpen={false}>
                            {data.experience.map((exp, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 relative">
                                    <button onClick={() => removeArr('experience', i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input label="Role / Title" value={exp.role} onChange={v => updateArr('experience', i, 'role', v)} placeholder="Software Intern" />
                                        <Input label="Company" value={exp.company} onChange={v => updateArr('experience', i, 'company', v)} placeholder="TCS" />
                                        <Input label="Period" value={exp.period} onChange={v => updateArr('experience', i, 'period', v)} placeholder="Jun–Aug 2024" />
                                    </div>
                                    <Textarea label="Description (one achievement per line)" value={exp.description} onChange={v => updateArr('experience', i, 'description', v)}
                                        placeholder="Built REST API reducing load time by 40%&#10;Worked with React and Django stack" rows={3} />
                                </div>
                            ))}
                            <button onClick={() => addArr('experience', { role: '', company: '', period: '', description: '' })}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Experience
                            </button>
                        </Section>

                        {/* Projects */}
                        <Section title="Projects" icon={Code2}>
                            {data.projects.map((proj, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 relative">
                                    <button onClick={() => removeArr('projects', i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input label="Project Name" value={proj.name} onChange={v => updateArr('projects', i, 'name', v)} placeholder="PlacePortal" />
                                        <Input label="Technologies" value={proj.technologies} onChange={v => updateArr('projects', i, 'technologies', v)} placeholder="React, Django, SQLite" />
                                    </div>
                                    <Textarea label="Description" value={proj.description} onChange={v => updateArr('projects', i, 'description', v)}
                                        placeholder="Full-stack college placement portal…" rows={2} />
                                    <Input label="GitHub / Live Link" value={proj.link} onChange={v => updateArr('projects', i, 'link', v)} placeholder="https://github.com/…" />
                                </div>
                            ))}
                            <button onClick={() => addArr('projects', { name: '', technologies: '', description: '', link: '' })}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Project
                            </button>
                        </Section>

                        {/* Certifications */}
                        <Section title="Certifications" icon={Award} defaultOpen={false}>
                            {data.certifications.map((cert, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 relative">
                                    <button onClick={() => removeArr('certifications', i)} className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input label="Certificate Name" value={cert.name} onChange={v => updateArr('certifications', i, 'name', v)} placeholder="AWS Cloud Practitioner" />
                                        <Input label="Issuer" value={cert.issuer} onChange={v => updateArr('certifications', i, 'issuer', v)} placeholder="Amazon" />
                                        <Input label="Year" value={cert.year} onChange={v => updateArr('certifications', i, 'year', v)} placeholder="2024" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addArr('certifications', { name: '', issuer: '', year: '' })}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Certification
                            </button>
                        </Section>
                    </div>
                </div>

                {/* ── PREVIEW PANEL ── */}
                <div className={`${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'} flex-1 flex-col overflow-y-auto bg-gray-200 items-center py-6 px-4`}>
                    <div className="w-full max-w-[210mm]">
                        <ResumePreview data={data} ref={previewRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumePage;
