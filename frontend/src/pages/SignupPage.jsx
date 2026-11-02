import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Animated particle canvas (shared background)
───────────────────────────────────────────── */
const ParticleCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            o: Math.random() * 0.5 + 0.15,
        }));

        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148,163,184,${p.o})`;
                ctx.fill();
            });
            // connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.strokeStyle = `rgba(148,163,184,${0.08 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

/* ─────────────────────────────────────────────
   Reusable input field
───────────────────────────────────────────── */
const InputField = ({ icon: Icon, type, value, onChange, placeholder, accentColor, label }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    return (
        <div className="group mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2 opacity-60 text-white">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 opacity-70 group-focus-within:opacity-100 group-focus-within:text-white transition-all" />
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    autoComplete={isPassword ? 'new-password' : 'off'}
                    className={`
            w-full pl-11 pr-11 py-3.5 rounded-xl text-sm
            bg-white/5 border border-white/10
            placeholder-white/20 text-white
            focus:outline-none focus:border-${accentColor}-400/60
            focus:ring-2 focus:ring-${accentColor}-400/20
            transition-all duration-200
          `}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-opacity"
                    >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Signup Page
───────────────────────────────────────────── */
const SignupPage = () => {
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signup(form.first_name, form.last_name, form.email, form.password);
            if (result.success) navigate('/dashboard');
            else setError(result.error || 'Signup failed. Please try again.');
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
            {/* Shared animated background */}
            <ParticleCanvas />

            {/* Gradient orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 text-center pb-6 animate-[fadeDown_0.6s_ease_both]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-2xl shadow-blue-500/40">
                    <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    PlacePortal
                </h1>
                <p className="text-slate-400 text-sm mt-1">Start your career journey today</p>
            </div>

            {/* Signup Form */}
            <div className="relative z-10 w-full max-w-lg px-4 animate-[fadeUp_0.7s_ease_both]">
                {/* Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500">
                    {/* Blue glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/8 to-transparent pointer-events-none" />

                    <div className="relative">
                        {/* Icon + title */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Student Registration</h2>
                                <p className="text-xs text-slate-400">Create your new account</p>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} autoComplete="off">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <InputField
                                        icon={User} type="text" label="First Name"
                                        value={form.first_name} accentColor="blue"
                                        onChange={e => setForm({ ...form, first_name: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="flex-1">
                                    <InputField
                                        icon={User} type="text" label="Last Name"
                                        value={form.last_name} accentColor="blue"
                                        onChange={e => setForm({ ...form, last_name: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <InputField
                                icon={Mail} type="email" label="Email Address"
                                value={form.email} accentColor="blue"
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="student@university.edu"
                            />

                            <InputField
                                icon={Lock} type="password" label="Password"
                                value={form.password} accentColor="blue"
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 mt-2 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    }
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-6 animate-[fadeUp_0.9s_ease_both]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
