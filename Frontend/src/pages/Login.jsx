import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signInUser } from '../services/authService';
import { checkUserHasValidation } from '../services/startupApi';

const Login = () => {
  const { loginUser, isLoggedIn, user, setLoading } = useStartup();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user?.email) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, user?.email, navigate]);

  const [form,       setForm]       = useState({ email: '', password: '' });
  const [errors,     setErrors]     = useState({});
  const [submitErr,  setSubmitErr]  = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoadingL]   = useState(false);

  const change = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoadingL(true); setLoading(true); setSubmitErr('');
    try {
      const data = await signInUser(form.email, form.password);
      const uid  = data.user?.id || null;
      const name = data.user?.user_metadata?.full_name || form.email.split('@')[0].replace(/^./, c => c.toUpperCase());
      loginUser(form.email, form.password, name, uid);
      if (uid) {
        const { hasValidation } = await checkUserHasValidation(uid);
        navigate(hasValidation ? '/dashboard' : '/onboarding/role', { replace: true });
      } else navigate('/onboarding/role');
    } catch (err) { setSubmitErr(err.message || 'Invalid credentials.'); }
    finally { setLoading(false); setLoadingL(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,93,249,0.15) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,93,249,0.15)', border: '1px solid rgba(124,93,249,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={15} style={{ color: '#7c5df9' }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Startup<span style={{ color: '#7c5df9' }}>Xpert</span></span>
      </Link>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 400, background: 'rgba(20,20,32,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</div>
          <div style={{ fontSize: 13, color: '#8b90a8' }}>Sign in to your workspace</div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4a4f6a', pointerEvents: 'none' }} />
              <input id="email" name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" style={{ paddingLeft: '32px !important' }} />
            </div>
            {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4a4f6a', pointerEvents: 'none' }} />
              <input id="password" name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={change} placeholder="••••••••" style={{ paddingLeft: '32px !important', paddingRight: '36px !important' }} />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a4f6a', cursor: 'pointer', padding: 2 }}>
                {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {errors.password && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password}</div>}
          </div>

          {/* Error */}
          {submitErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#ef4444' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} /> {submitErr}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 9, border: 'none', background: '#7c5df9', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.15s', marginTop: 4 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6b4fe8'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#7c5df9'}>
            {loading
              ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <><ArrowRight size={14} /> Sign In</>
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#8b90a8' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#7c5df9', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: '#4a4f6a', zIndex: 1 }}>© {new Date().getFullYear()} StartupXpert</div>
    </div>
  );
};

export default Login;
