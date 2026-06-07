import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import { ArrowRight, User, CheckSquare } from 'lucide-react';

/* ─── Step progress indicator ── */
const StepProgress = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
    {[
      { n: 1, label: 'Profile' },
      { n: 2, label: 'Details' },
      { n: 3, label: 'Analysis' },
    ].map(({ n, label }, i) => (
      <React.Fragment key={n}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={n === current ? 'badge badge-brand' : 'badge badge-ghost'}
            style={{ width: 22, height: 22, justifyContent: 'center', padding: 0, fontSize: 10 }}>
            {n}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: n === current ? 'var(--brand-light)' : 'var(--text3)' }}>{label}</span>
        </div>
        {i < 2 && <div style={{ flex: 1, height: 1, background: n < current ? 'var(--brand-border)' : 'var(--border)' }} />}
      </React.Fragment>
    ))}
  </div>
);

const OnboardingRole = () => {
  const { onboardingRole, updateOnboardingRole } = useStartup();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName:       onboardingRole.fullName       || '',
    age:            onboardingRole.age            || '',
    gender:         onboardingRole.gender         || '',
    city:           onboardingRole.city           || '',
    country:        onboardingRole.country        || '',
    profession:     onboardingRole.profession     || '',
    experience:     onboardingRole.experience     || '',
    founderCount:   onboardingRole.founderCount   || '',
    founderSkillset:onboardingRole.founderSkillset || [],
  });

  const [errors, setErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePillSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = [...prev.founderSkillset];
      if (skills.includes(skill)) {
        return { ...prev, founderSkillset: skills.filter(s => s !== skill) };
      }
      return { ...prev, founderSkillset: [...skills, skill] };
    });
    if (errors.founderSkillset) setErrors(prev => ({ ...prev, founderSkillset: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Full Name is required';
    if (!formData.age.trim())      e.age = 'Age is required';
    else if (isNaN(formData.age) || parseInt(formData.age) <= 0) e.age = 'Please enter a valid age';
    if (!formData.gender)    e.gender    = 'Gender selection is required';
    if (!formData.city.trim()) e.city    = 'City is required';
    if (!formData.country.trim()) e.country = 'Country is required';
    if (!formData.profession)  e.profession  = 'Profession is required';
    if (!formData.experience)  e.experience  = 'Experience level is required';
    if (!formData.founderCount) e.founderCount = 'Founder size is required';
    if (formData.founderSkillset.length === 0) e.founderSkillset = 'Select at least one founder skillset';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    updateOnboardingRole(formData);
    navigate('/onboarding/details');
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <ProgressBar currentStep={1} />

        {/* Step progress */}
        <StepProgress current={1} />

        <div className="glass-card animate-fade-up" style={{ padding: '32px' }}>

          {/* Header */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 18, marginBottom: 28 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: 'var(--text1)', margin: 0, marginBottom: 6 }}>
              <User size={20} style={{ color: 'var(--brand-light)' }} />
              Founder Profile &amp; Role Setup
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
              Provide your background so we can customize your analysis models.
            </p>
          </div>

          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <InputField label="Full Name" type="text" name="fullName" value={formData.fullName} onChange={handleTextChange} placeholder="Bill Gates" error={errors.fullName} required />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Your real name helps personalize analysis.</p>
              </div>
              <div>
                <InputField label="Age" type="text" name="age" value={formData.age} onChange={handleTextChange} placeholder="28" error={errors.age} required />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Used for founder profile benchmarking.</p>
              </div>
              <div>
                <InputField label="Gender" type="select" name="gender" value={formData.gender} onChange={handleTextChange} placeholder="Choose Gender" options={[
                  { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' },
                  { value: 'Non-binary', label: 'Non-binary' }, { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]} error={errors.gender} required />
              </div>
            </div>

            {/* Geography */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <InputField label="City" type="text" name="city" value={formData.city} onChange={handleTextChange} placeholder="Mumbai" error={errors.city} required />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Your primary operating city.</p>
              </div>
              <div>
                <InputField label="Country" type="text" name="country" value={formData.country} onChange={handleTextChange} placeholder="India" error={errors.country} required />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Affects market and regulatory analysis.</p>
              </div>
            </div>

            {/* Profession */}
            <div>
              <InputField label="Profession" type="select" name="profession" value={formData.profession} onChange={handleTextChange} placeholder="Choose Profession" options={[
                { value: 'Founder', label: 'Founder' }, { value: 'Student', label: 'Student' },
                { value: 'Developer', label: 'Developer' }, { value: 'Business Analyst', label: 'Business Analyst' },
                { value: 'Other', label: 'Other' },
              ]} error={errors.profession} required />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Helps tailor the analysis depth for your context.</p>
            </div>

            {/* Experience Pills */}
            <div>
              <label className="field-label">
                Industry Experience <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>How long have you been operating in this space?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {['0-1 yrs', '1-3 yrs', '3-5 yrs', '5+ yrs'].map(exp => (
                  <button key={exp} type="button" onClick={() => handlePillSelect('experience', exp)}
                    className={`pill${formData.experience === exp ? ' active' : ''}`}>
                    {exp}
                  </button>
                ))}
              </div>
              {errors.experience && <p className="field-error">{errors.experience}</p>}
            </div>

            {/* Founder Count Pills */}
            <div>
              <label className="field-label">
                Founder Count <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>How many co-founders are working on this venture?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {['1', '2', '3', '4+'].map(count => (
                  <button key={count} type="button" onClick={() => handlePillSelect('founderCount', count)}
                    className={`pill${formData.founderCount === count ? ' active' : ''}`}>
                    {count}
                  </button>
                ))}
              </div>
              {errors.founderCount && <p className="field-error">{errors.founderCount}</p>}
            </div>

            {/* Skillset Pills */}
            <div>
              <label className="field-label">
                Founder Skillset <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>Select all core skills represented in your founding team.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                {['Tech', 'Marketing', 'Finance', 'Design', 'Operations'].map(skill => {
                  const isChecked = formData.founderSkillset.includes(skill);
                  return (
                    <button key={skill} type="button" onClick={() => handleSkillToggle(skill)}
                      className={`pill${isChecked ? ' active-cyan' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckSquare size={14} style={{ color: isChecked ? 'var(--cyan)' : 'var(--text3)' }} />
                      {skill}
                    </button>
                  );
                })}
              </div>
              {errors.founderSkillset && <p className="field-error">{errors.founderSkillset}</p>}
            </div>

            {/* Submit */}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg">
                Next Step: Startup Details
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', background: 'var(--bg-sub)' }}>
        © {new Date().getFullYear()} StartupXpert — Step 1 of 3
      </footer>
    </div>
  );
};

export default OnboardingRole;
