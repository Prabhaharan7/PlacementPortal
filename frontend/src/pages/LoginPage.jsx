import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Shield, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
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
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2 opacity-60">{label}</label>
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
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Login Page
───────────────────────────────────────────── */
const LoginPage = () => {
  const [studentForm, setStudentForm] = useState({ email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [studentLoading, setStudentLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [adminError, setAdminError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setStudentLoading(true);
    setStudentError('');
    try {
      const result = await login(studentForm.email, studentForm.password, 'student');
      if (result.success) navigate('/dashboard');
      else setStudentError(result.error || 'Invalid email or password.');
    } catch {
      setStudentError('An error occurred. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');
    try {
      const result = await login(adminForm.email, adminForm.password, 'admin');
      if (result.success) navigate('/admin/dashboard');
      else setAdminError(result.error || 'Invalid email or password.');
    } catch {
      setAdminError('An error occurred. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col">
      {/* Shared animated background */}
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[70%] bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center pt-10 pb-6 animate-[fadeDown_0.6s_ease_both]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-2xl shadow-blue-500/40">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          PlacePortal
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your Gateway to Career Success</p>
      </div>

      {/* Split panels */}
      <div className="relative z-10 flex flex-1 items-stretch px-4 pb-10 gap-0 max-w-5xl mx-auto w-full">

        {/* ── LEFT: Student ── */}
        <div className="flex-1 flex items-center justify-center pr-8 animate-[slideLeft_0.7s_ease_both]">
          <div className="w-full max-w-sm">
            {/* Card */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500">
              {/* Blue glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/8 to-transparent pointer-events-none" />

              <div className="relative">
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Student Login</h2>
                    <p className="text-xs text-slate-400">Access your placement dashboard</p>
                  </div>
                </div>

                {/* Error */}
                {studentError && (
                  <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    {studentError}
                  </div>
                )}

                <form onSubmit={handleStudentLogin} autoComplete="off">
                  <InputField
                    icon={Mail} type="email" label="Email Address"
                    value={studentForm.email} accentColor="blue"
                    onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="student@university.edu"
                  />
                  <InputField
                    icon={Lock} type="password" label="Password"
                    value={studentForm.password} accentColor="blue"
                    onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="••••••••"
                  />

                  <div className="flex items-center justify-between text-xs mb-5 text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-500" />
                      Remember me
                    </label>
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={studentLoading}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {studentLoading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      }
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </form>

                {/* Hint */}
                <p className="text-center text-xs text-slate-500 mt-5">
                  Demo: <span className="text-slate-400">student@university.edu</span> / <span className="text-slate-400">student123</span>
                </p>

                {/* Sign up link */}
                <p className="text-center text-sm text-slate-400 mt-4">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="flex flex-col items-center justify-center gap-3 px-2 shrink-0">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-xs font-bold">OR</span>
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        </div>

        {/* ── RIGHT: Admin ── */}
        <div className="flex-1 flex items-center justify-center pl-8 animate-[slideRight_0.7s_ease_both]">
          <div className="w-full max-w-sm">
            {/* Card */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-500">
              {/* Purple glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-bl from-purple-500/8 to-transparent pointer-events-none" />

              <div className="relative">
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Login</h2>
                    <p className="text-xs text-slate-400">Access administrative panel</p>
                  </div>
                </div>

                {/* Error */}
                {adminError && (
                  <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} autoComplete="off">
                  <InputField
                    icon={Mail} type="email" label="Admin Email"
                    value={adminForm.email} accentColor="purple"
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="admin@placeportal.com"
                  />
                  <InputField
                    icon={Lock} type="password" label="Password"
                    value={adminForm.password} accentColor="purple"
                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="••••••••"
                  />

                  <div className="flex items-center justify-between text-xs mb-5 text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded accent-purple-500" />
                      Remember me
                    </label>
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {adminLoading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Admin Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      }
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </form>

                {/* Hint */}
                <p className="text-center text-xs text-slate-500 mt-5">
                  Demo: <span className="text-slate-400">admin@placeportal.com</span> / <span className="text-slate-400">Admin@123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 text-slate-600 text-xs">
        © 2024 PlacePortal. All rights reserved.
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
