import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';

const Register = () => {
  const { registerUser } = useStartup();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Founder', // Default role
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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

  // Custom Validations
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate standard latency
    setTimeout(() => {
      registerUser(formData.fullName, formData.email, formData.role);
      setIsSubmitting(false);
      navigate('/onboarding/role');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-hidden">
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
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
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

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                togglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
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
