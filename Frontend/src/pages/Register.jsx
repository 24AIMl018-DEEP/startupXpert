import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { Sparkles, ArrowRight, Users, User, Building2, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signUpUser } from '../services/authService';
import { createOrganization, joinOrganization } from '../services/startupApi';

/* ─── tiny helpers ───────────────────────────────── */
const Field = ({ label, name, type = 'text', value, onChange, placeholder, error, icon: Icon }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 5 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />}
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ paddingLeft: Icon ? 32 : undefined }} />
    </div>
    {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</div>}
  </div>
);

const PwdField = ({ label, name, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 5 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" style={{ paddingRight: 36 }} />
        <button type="button" onClick={() => setShow(v => !v)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}>
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</div>}
    </div>
  );
};

/* ─── Register ───────────────────────────────────── */
const Register = () => {
  const { registerUser, isLoggedIn, setLoading } = useStartup();
  const navigate = useNavigate();

  useEffect(() => { if (isLoggedIn) navigate('/dashboard', { replace: true }); }, [isLoggedIn, navigate]);

  // Step 1: user type
  const [userType,  setUserType]  = useState(null); // 'solo' | 'org'
  // Step 2 (org): org mode
  const [orgMode,   setOrgMode]   = useState(null); // 'create' | 'join'

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    // org-create
    orgName: '', orgDomain: '',
    // org-join
    inviteCode: '',
    // member profile
    jobTitle: '', skills: '',
  });
  const [errors,    setErrors]    = useState({});
  const [submitErr, setSubmitErr] = useState('');
  const [loading,   setLoadingL]  = useState(false);

  const ch = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const pwdOk = form.password.length >= 6;
  const matchOk = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())   e.fullName = 'Required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!pwdOk)                  e.password = 'Min 6 characters';
    if (!matchOk)                e.confirmPassword = 'Passwords do not match';
    if (orgMode === 'create' && !form.orgName.trim()) e.orgName = 'Org name required';
    if (orgMode === 'join'   && !form.inviteCode.trim()) e.inviteCode = 'Invite code required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoadingL(true); setLoading(true); setSubmitErr('');
    try {
      const data = await signUpUser(form.fullName, form.email, form.password,
        userType === 'org' ? (orgMode === 'create' ? 'Founder' : 'Member') : 'Solo');

      const needsConfirm = data.user && !data.session;
      if (needsConfirm) {
        setSubmitErr('✅ Check your email to confirm your account, then log in.');
        return;
      }

      const uid = data.user?.id;

      // Org-specific actions
      if (userType === 'org') {
        const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
        if (orgMode === 'create') {
          await createOrganization(form.orgName.trim(), form.orgDomain.trim() || null, uid, form.email.trim().toLowerCase(), form.fullName.trim());
        } else {
          await joinOrganization(form.inviteCode.trim(), uid, form.fullName, form.jobTitle, skills, form.email.trim().toLowerCase());
        }
      }

      registerUser(form.fullName, form.email,
        userType === 'org' ? (orgMode === 'create' ? 'Founder' : 'Member') : 'Solo',
        uid,
        { userType, orgMode }
      );

      // Route: org members go to member dashboard, everyone else to onboarding
      if (userType === 'org' && orgMode === 'join') {
        navigate('/member', { replace: true });
      } else {
        navigate('/onboarding/role', { replace: true });
      }
    } catch (err) {
      setSubmitErr(err.message || 'Registration failed.');
    } finally {
      setLoading(false); setLoadingL(false);
    }
  };

  /* ── Step 1: Choose user type ── */
  if (!userType) return (
    <AuthShell>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>Who are you?</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Choose your workspace type to get started</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TypeCard
          icon={<Building2 size={22} color="var(--brand-light)" />}
          title="Organization"
          sub="Company or startup team — create or join an org"
          onClick={() => setUserType('org')}
        />
        <TypeCard
          icon={<User size={22} color="var(--cyan)" />}
          title="Solo / Student"
          sub="Individual founder, student, or hobbyist"
          onClick={() => setUserType('solo')}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>Sign in</Link>
      </div>
    </AuthShell>
  );

  /* ── Step 2 (org): Create or Join ── */
  if (userType === 'org' && !orgMode) return (
    <AuthShell>
      <button onClick={() => setUserType(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, marginBottom: 20, padding: 0 }}>← Back</button>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>Organization</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Create a new org or join an existing one</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TypeCard
          icon={<Building2 size={22} color="var(--brand-light)" />}
          title="Create Organization"
          sub="Start a new workspace as Founder"
          onClick={() => setOrgMode('create')}
        />
        <TypeCard
          icon={<Key size={22} color="var(--green)" />}
          title="Join with Invite Code"
          sub="Your founder shared an invite code"
          onClick={() => setOrgMode('join')}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>Sign in</Link>
      </div>
    </AuthShell>
  );

  /* ── Step 3: Registration form ── */
  const isOrgJoin   = userType === 'org' && orgMode === 'join';
  const isOrgCreate = userType === 'org' && orgMode === 'create';

  return (
    <AuthShell>
      <button
        onClick={() => { if (userType === 'org') setOrgMode(null); else setUserType(null); }}
        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, marginBottom: 16, padding: 0 }}>
        ← Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>
          {isOrgCreate ? 'Create Your Organization' : isOrgJoin ? 'Join Organization' : 'Create Account'}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99,
          background: userType === 'org' ? 'var(--brand-bg)' : 'rgba(34,211,238,0.08)',
          border: `1px solid ${userType === 'org' ? 'var(--brand-border)' : 'rgba(34,211,238,0.2)'}`,
          fontSize: 11, fontWeight: 600,
          color: userType === 'org' ? 'var(--brand-light)' : 'var(--cyan)' }}>
          {userType === 'org' ? <Building2 size={11}/> : <User size={11}/>}
          {isOrgCreate ? 'Founder' : isOrgJoin ? 'Team Member' : 'Solo / Student'}
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Org-specific fields at top */}
        {isOrgCreate && (
          <>
            <Field label="Organization Name *" name="orgName" value={form.orgName} onChange={ch} placeholder="Acme Inc." error={errors.orgName} icon={Building2} />
            <Field label="Company Domain (optional)" name="orgDomain" value={form.orgDomain} onChange={ch} placeholder="acme.com" />
          </>
        )}
        {isOrgJoin && (
          <>
            <Field label="Invite Code *" name="inviteCode" value={form.inviteCode} onChange={ch} placeholder="e.g. a1b2c3d4" error={errors.inviteCode} icon={Key} />
            <Field label="Your Job Title" name="jobTitle" value={form.jobTitle} onChange={ch} placeholder="CTO, Marketing Lead…" />
            <Field label="Your Skills (comma-separated)" name="skills" value={form.skills} onChange={ch} placeholder="React, Python, Sales…" />
          </>
        )}

        {/* Common fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Full Name *" name="fullName" value={form.fullName} onChange={ch} placeholder="Your name" error={errors.fullName} />
          <Field label="Email *" name="email" type="email" value={form.email} onChange={ch} placeholder="you@email.com" error={errors.email} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <PwdField label="Password *" name="password" value={form.password} onChange={ch} error={errors.password} />
          <PwdField label="Confirm Password *" name="confirmPassword" value={form.confirmPassword} onChange={ch} error={errors.confirmPassword} />
        </div>

        {/* Password strength */}
        {form.password.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { ok: form.password.length >= 6, label: '6+ chars' },
              { ok: /[A-Z]/.test(form.password), label: 'Uppercase' },
              { ok: /[0-9]/.test(form.password), label: 'Number' },
            ].map(({ ok, label }) => (
              <span key={label} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                background: ok ? 'var(--green-bg)' : 'var(--surface3)',
                color: ok ? 'var(--green)' : 'var(--text3)',
                border: `1px solid ${ok ? 'var(--green-border)' : 'var(--border2)'}` }}>
                {ok ? '✓' : '○'} {label}
              </span>
            ))}
          </div>
        )}

        {submitErr && (
          <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 12,
            background: submitErr.startsWith('✅') ? 'var(--green-bg)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${submitErr.startsWith('✅') ? 'var(--green-border)' : 'rgba(239,68,68,0.2)'}`,
            color: submitErr.startsWith('✅') ? 'var(--green)' : 'var(--red)', display: 'flex', gap: 8 }}>
            {submitErr.startsWith('✅') ? <CheckCircle2 size={13}/> : <AlertCircle size={13}/>} {submitErr}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
          {loading
            ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.8s linear infinite' }} />
            : <><ArrowRight size={14}/> {isOrgJoin ? 'Join & Enter Workspace' : isOrgCreate ? 'Create Org & Continue' : 'Create Account'}</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>Sign in</Link>
      </div>
    </AuthShell>
  );
};

/* ─── Shell wrapper ──────────────────────────────── */
const AuthShell = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#0a0a10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,93,249,0.12) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,93,249,0.15)', border: '1px solid rgba(124,93,249,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={15} style={{ color: '#7c5df9' }} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Startup<span style={{ color: '#7c5df9' }}>Xpert</span></span>
    </Link>
    <div style={{ width: '100%', maxWidth: 460, background: 'rgba(20,20,32,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
      {children}
    </div>
    <div style={{ marginTop: 20, fontSize: 11, color: '#4a4f6a', zIndex: 1 }}>© {new Date().getFullYear()} StartupXpert</div>
  </div>
);

/* ─── Type selection card ─────────────────────────── */
const TypeCard = ({ icon, title, sub, onClick }) => (
  <button onClick={onClick} type="button"
    style={{ width: '100%', textAlign: 'left', padding: '16px 18px', borderRadius: 'var(--r-md)', background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s, background 0.15s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.background = 'var(--brand-bg)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
    <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
    </div>
    <ArrowRight size={14} color="var(--text3)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
  </button>
);

export default Register;
