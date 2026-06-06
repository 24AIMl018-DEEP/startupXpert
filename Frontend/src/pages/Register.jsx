import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import { Sparkles, ArrowRight, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { signUpUser } from "../services/authService";

const Register = () => {
  const { registerUser, isLoggedIn, setLoading } = useStartup();
  const navigate = useNavigate();

  // Redirect authenticated sessions immediately (Auth Redirect)
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Founder', // Default role
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  // Strong Password Checklist Evaluations
  const password = formData.password;
  const pCheck = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@#$%&*!?]/.test(password)
  };

  const satisfiedCount = Object.values(pCheck).filter(Boolean).length;
  const isPasswordValid = satisfiedCount === 5;

  // Strength Meter Computations
  let strengthText = 'Weak';
  let strengthColor = 'w-1/3 bg-rose-500';
  let strengthTextColor = 'text-rose-400';

  if (password.length > 0) {
    if (satisfiedCount === 5) {
      strengthText = 'Strong';
      strengthColor = 'w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      strengthTextColor = 'text-emerald-400';
    } else if (satisfiedCount >= 3) {
      strengthText = 'Medium';
      strengthColor = 'w-2/3 bg-amber-500';
      strengthTextColor = 'text-amber-400';
    }
  }

  // Password matching check
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  const confirmPasswordFilled = formData.confirmPassword.length > 0;

  // Verify form completeness for active submit enablement
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = 
    formData.fullName.trim().length > 0 &&
    emailRegex.test(formData.email) &&
    isPasswordValid &&
    passwordsMatch;

  // Custom Validations
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isPasswordValid) {
      newErrors.password = 'Password does not meet strong security guidelines';
    }

    if (!passwordsMatch) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const data = await signUpUser(formData.fullName, formData.email, formData.password, formData.role);

      // Supabase may require email confirmation before user is active
      const needsConfirmation = data.user && !data.session;
      if (needsConfirmation) {
        setSubmitError(
          '✅ Account created! Please check your email inbox and click the confirmation link to activate your account, then log in.'
        );
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      registerUser(formData.fullName, formData.email, formData.role, data.user?.id || null);
      navigate('/onboarding/role'); // New users must complete onboarding
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden text-white font-sans transition-all duration-300">
      
      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/4 h-[350px] w-[350px] translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
      
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-lg space-y-8 rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
              Create your StartupXpert account
            </h2>
            <p className="text-sm text-gray-500">
              Begin your path to high-probability startup success
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Full Name */}
            <InputField
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Elon Musk"
              error={errors.fullName}
              required
            />

            {/* Email */}
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="founder@venture.com"
              error={errors.email}
              required
            />

            {/* Role Toggle Grid */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Choose Your Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Founder', 'Student', 'Business Team'].map((roleOption) => {
                  const isSelected = formData.role === roleOption;
                  return (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => handleRoleSelect(roleOption)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]' 
                          : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                      }`}
                    >
                      {roleOption}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Fields with inline validators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Password */}
              <div className="space-y-1.5 text-left">
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={formData.password.length > 0 && !isPasswordValid ? 'Password policy not met' : errors.password}
                  togglePassword={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={confirmPasswordFilled && !passwordsMatch ? 'Passwords do not match' : errors.confirmPassword}
                  togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  showPassword={showConfirmPassword}
                  required
                />
              </div>

            </div>

            {/* Live Password Checklist & Strength bar */}
            {formData.password.length > 0 && (
              <div className="rounded-xl border border-indigo-500/5 bg-[#0a0a0f] p-4 text-left space-y-4">
                
                {/* Strength Meter Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-semibold uppercase tracking-wider">Password Strength</span>
                    <span className={`font-bold uppercase tracking-wider ${strengthTextColor}`}>{strengthText}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0e0e16] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strengthColor}`}></div>
                  </div>
                </div>

                {/* Requirements checkmarks */}
                <div className="space-y-2">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Security Parameters</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {[
                      { check: pCheck.length, label: '8+ Characters' },
                      { check: pCheck.uppercase, label: 'Uppercase Letter' },
                      { check: pCheck.lowercase, label: 'Lowercase Letter' },
                      { check: pCheck.number, label: 'Number (0-9)' },
                      { check: pCheck.special, label: 'Special Symbol (@#$%&*!?)' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${item.check ? 'text-emerald-400' : 'text-gray-600'}`} />
                        <span className={item.check ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Live Passwords Match Indicator */}
            {confirmPasswordFilled && (
              <div className="flex items-center gap-1.5 text-xs text-left px-1">
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                    <span className="text-rose-400 font-semibold">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            {/* Submit Error / Success Message */}
            {submitError && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                submitError.startsWith('✅')
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
              }`}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-30 disabled:scale-100 disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Register & Continue
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. Powered by AI and modern methodologies.
      </footer>
    </div>
  );
};

export default Register;
