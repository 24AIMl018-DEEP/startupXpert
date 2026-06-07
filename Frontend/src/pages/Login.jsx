import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { signInUser } from '../services/authService';
import { fetchLatestSession } from '../services/startupApi';

const Login = () => {
  const { loginUser, isLoggedIn, user, setLoading } = useStartup();
  const navigate = useNavigate();

  // Redirect authenticated sessions immediately (Auth Redirect)
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const savedHistory = localStorage.getItem(`startup_history_${user.email}`) || localStorage.getItem('startup_history');
      const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;
      const wasCompleted = user?.onboardingCompleted === true;
      navigate((hasHistory || wasCompleted) ? '/dashboard' : '/onboarding/role', { replace: true });
    }
  }, [isLoggedIn, user?.email, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Custom Form Validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);
    setSubmitError('');

    try {
      const data = await signInUser(formData.email, formData.password);
      const supabaseUserId = data.user?.id || null;
      const fullName =
        data.user?.user_metadata?.full_name ||
        formData.email.split('@')[0].replace(/^./, (c) => c.toUpperCase());

      // Pass the Supabase UUID so ideas are linked to this account
      loginUser(formData.email, formData.password, fullName, supabaseUserId);

      // Check if user already has a completed validation session in DB
      // If yes → skip onboarding entirely, restore session_id, go to dashboard
      if (supabaseUserId) {
        const existingSession = await fetchLatestSession(supabaseUserId);
        if (existingSession?.id) {
          // Store session_id scoped to this user so roadmap can use it
          localStorage.setItem(`validation_session_id_${formData.email}`, existingSession.id);
          // Mark onboarding as completed
          const prevUser = localStorage.getItem(`startup_user_${formData.email}`);
          const parsed = prevUser ? JSON.parse(prevUser) : {};
          const updated = { ...parsed, onboardingCompleted: true, isNewUser: false };
          localStorage.setItem(`startup_user_${formData.email}`, JSON.stringify(updated));
          localStorage.setItem('startup_user', JSON.stringify(updated));
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // No existing session — check local history as fallback
      const savedHistory = localStorage.getItem(`startup_history_${formData.email}`) || localStorage.getItem('startup_history');
      const hasHistory = savedHistory ? JSON.parse(savedHistory).length > 0 : false;
      const prevUser = localStorage.getItem(`startup_user_${formData.email}`);
      const wasCompleted = prevUser ? JSON.parse(prevUser)?.onboardingCompleted === true : false;

      navigate((hasHistory || wasCompleted) ? '/dashboard' : '/onboarding/role');
    } catch (err) {
      setSubmitError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
      
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          {/* Brand & Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
              Welcome back to StartupXpert
            </h2>
            <p className="text-sm text-gray-500">
              Log in to manage your startup validation roadmaps
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <div className="space-y-1">
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  togglePassword={handleTogglePassword}
                  showPassword={showPassword}
                  required
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => alert('Password reset links are disabled in mockup mode.')}
                    className="text-xs text-gray-500 hover:text-indigo-400 transition-colors duration-300"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            </div>

            {/* Auth Error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. Authorized access only.
      </footer>
    </div>
  );
};

export default Login;
