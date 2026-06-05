import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import { ArrowRight, User, MapPin, Award, Users, CheckSquare } from 'lucide-react';

const OnboardingRole = () => {
  const { onboardingRole, updateOnboardingRole } = useStartup();
  const navigate = useNavigate();

  // Local Form state initialized from context
  const [formData, setFormData] = useState({
    fullName: onboardingRole.fullName || '',
    age: onboardingRole.age || '',
    gender: onboardingRole.gender || '',
    city: onboardingRole.city || '',
    country: onboardingRole.country || '',
    profession: onboardingRole.profession || '',
    experience: onboardingRole.experience || '',
    founderCount: onboardingRole.founderCount || '',
    founderSkillset: onboardingRole.founderSkillset || [],
  });

  const [errors, setErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePillSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const skills = [...prev.founderSkillset];
      if (skills.includes(skill)) {
        return { ...prev, founderSkillset: skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, founderSkillset: [...skills, skill] };
      }
    });
    if (errors.founderSkillset) {
      setErrors((prev) => ({ ...prev, founderSkillset: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.profession) newErrors.profession = 'Profession is required';
    if (!formData.experience) newErrors.experience = 'Experience level is required';
    if (!formData.founderCount) newErrors.founderCount = 'Founder size is required';
    if (formData.founderSkillset.length === 0) {
      newErrors.founderSkillset = 'Select at least one founder skillset';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to top of form so they see the errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save to context
    updateOnboardingRole(formData);
    
    // Navigate to step 2
    navigate('/onboarding/details');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl mx-auto w-full">
        {/* Progress Tracker */}
        <ProgressBar currentStep={1} />

        <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md space-y-8">
          
          {/* Header */}
          <div className="text-left border-b border-indigo-500/5 pb-4">
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <User className="h-6 w-6 text-indigo-400" />
              Founder Profile &amp; Role Setup
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide your background details so we can customize your analysis models
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleNext} className="space-y-6">
            
            {/* Demographics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <InputField
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleTextChange}
                placeholder="Bill Gates"
                error={errors.fullName}
                required
              />

              <InputField
                label="Age"
                type="text"
                name="age"
                value={formData.age}
                onChange={handleTextChange}
                placeholder="28"
                error={errors.age}
                required
              />

              <InputField
                label="Gender"
                type="select"
                name="gender"
                value={formData.gender}
                onChange={handleTextChange}
                placeholder="Choose Gender"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Non-binary', label: 'Non-binary' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
                error={errors.gender}
                required
              />
            </div>

            {/* Geography Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="City"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleTextChange}
                placeholder="Mumbai"
                error={errors.city}
                required
              />

              <InputField
                label="Country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleTextChange}
                placeholder="India"
                error={errors.country}
                required
              />
            </div>

            {/* Profession Dropdown */}
            <InputField
              label="Profession"
              type="select"
              name="profession"
              value={formData.profession}
              onChange={handleTextChange}
              placeholder="Choose Profession"
              options={[
                { value: 'Founder', label: 'Founder' },
                { value: 'Student', label: 'Student' },
                { value: 'Developer', label: 'Developer' },
                { value: 'Business Analyst', label: 'Business Analyst' },
                { value: 'Other', label: 'Other' },
              ]}
              error={errors.profession}
              required
            />

            {/* Industry Experience Pills */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Industry Experience <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['0-1 yrs', '1-3 yrs', '3-5 yrs', '5+ yrs'].map((exp) => {
                  const isSelected = formData.experience === exp;
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => handlePillSelect('experience', exp)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]' 
                          : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                      }`}
                    >
                      {exp}
                    </button>
                  );
                })}
              </div>
              {errors.experience && (
                <p className="text-xs font-medium text-red-400 mt-1">{errors.experience}</p>
              )}
            </div>

            {/* Founder Count Pills */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Founder Count <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['1', '2', '3', '4+'].map((count) => {
                  const isSelected = formData.founderCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handlePillSelect('founderCount', count)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]' 
                          : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
              {errors.founderCount && (
                <p className="text-xs font-medium text-red-400 mt-1">{errors.founderCount}</p>
              )}
            </div>

            {/* Founder Skillset Checkboxes */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Founder Skillset (Select all that apply) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['Tech', 'Marketing', 'Finance', 'Design', 'Operations'].map((skill) => {
                  const isChecked = formData.founderSkillset.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`flex items-center justify-center gap-2 py-3.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                        isChecked 
                          ? 'bg-cyan-950 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-[1.02]' 
                          : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                      }`}
                    >
                      <CheckSquare className={`h-4 w-4 transition-colors ${isChecked ? 'text-cyan-400' : 'text-gray-600'}`} />
                      {skill}
                    </button>
                  );
                })}
              </div>
              {errors.founderSkillset && (
                <p className="text-xs font-medium text-red-400 mt-1 select-none animate-pulse">
                  {errors.founderSkillset}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-indigo-500/5 flex justify-end">
              <button
                type="submit"
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              >
                Next Step: Startup Details
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </form>
        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. Step 1 of 3 Completed.
      </footer>
    </div>
  );
};

export default OnboardingRole;
