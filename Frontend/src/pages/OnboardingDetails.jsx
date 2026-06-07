import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Compass, Save } from 'lucide-react';

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
          <span className={n === current ? 'badge badge-brand' : n < current ? 'badge badge-green' : 'badge badge-ghost'}
            style={{ width: 22, height: 22, justifyContent: 'center', padding: 0, fontSize: 10 }}>
            {n < current ? <Check size={10} /> : n}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: n === current ? 'var(--brand-light)' : n < current ? 'var(--green)' : 'var(--text3)' }}>{label}</span>
        </div>
        {i < 2 && <div style={{ flex: 1, height: 1, background: n < current ? 'var(--brand-border)' : 'var(--border)' }} />}
      </React.Fragment>
    ))}
  </div>
);

const OnboardingDetails = () => {
  const {
    startupDetails, updateStartupDetails, updateStartupDetailsBulk,
    currentStep, setCurrentStep, saveDraft,
  } = useStartup();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startupName:         startupDetails.startupName         || '',
    startupDomain:       startupDetails.startupDomain       || '',
    problemStatement:    startupDetails.problemStatement     || '',
    startupDescription:  startupDetails.startupDescription  || '',
    targetAudience:      startupDetails.targetAudience       || '',
    geographicMarket:    startupDetails.geographicMarket     || '',
    existingCompetitors: startupDetails.existingCompetitors  || '',
    revenueModel:        startupDetails.revenueModel         || '',
    estimatedPricing:    startupDetails.estimatedPricing     || '',
    availableFunding:    startupDetails.availableFunding     || '',
    monthlyBurnCapacity: startupDetails.monthlyBurnCapacity  || '',
    platformType:        startupDetails.platformType         || [],
    techComplexity:      startupDetails.techComplexity       || '',
    mvpTimeline:         startupDetails.mvpTimeline          || '',
    scalabilityGoal:     startupDetails.scalabilityGoal      || '',
    acquisitionStrategy: startupDetails.acquisitionStrategy  || '',
    startupStage:        startupDetails.startupStage         || '',
  });

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [error, setError] = useState('');
  const [animateClass, setAnimateClass] = useState('opacity-100 translate-x-0');

  const fields = [
    { id: 'startupName',         label: 'Startup Name',              description: 'What is the working name of your venture?',                                            type: 'text',        placeholder: 'e.g. VentureAI',                                             required: true },
    { id: 'startupDomain',       label: 'Startup Domain',            description: 'Select the primary industry domain that describes your business.',                     type: 'select',      placeholder: 'Choose domain',                                              required: true, options: [{ value: 'HealthTech', label: 'HealthTech' }, { value: 'EdTech', label: 'EdTech' }, { value: 'FinTech', label: 'FinTech' }, { value: 'AgriTech', label: 'AgriTech' }, { value: 'E-Commerce', label: 'E-Commerce' }, { value: 'SaaS', label: 'SaaS' }, { value: 'Other', label: 'Other' }] },
    { id: 'problemStatement',    label: 'Problem Statement',         description: 'What critical pain point does your startup solve?',                                    type: 'textarea',    placeholder: 'Describe the core problem in detail...',                     required: true },
    { id: 'startupDescription',  label: 'Startup Description',       description: 'Describe your product or service and how it resolves the problem.',                    type: 'textarea',    placeholder: 'Describe the startup proposal...',                           required: true },
    { id: 'targetAudience',      label: 'Target Audience',           description: 'Who is your ideal customer profile (ICP)?',                                            type: 'text',        placeholder: 'e.g. B2B marketers, Gen Z students',                         required: true },
    { id: 'geographicMarket',    label: 'Geographic Market',         description: 'Where is your primary launching territory or geographic scope?',                       type: 'text',        placeholder: 'e.g. Southeast Asia, Global remote',                         required: true },
    { id: 'existingCompetitors', label: 'Existing Competitors',      description: 'List any key competitors or alternatives in this space.',                               type: 'text',        placeholder: 'e.g. Manual Excel tracking, Stripe Billing',                 required: true },
    { id: 'revenueModel',        label: 'Revenue Model',             description: 'How does your startup plan to monetize its offering?',                                 type: 'select',      placeholder: 'Choose revenue model',                                       required: true, options: [{ value: 'Subscription', label: 'Subscription' }, { value: 'Freemium', label: 'Freemium' }, { value: 'One-time', label: 'One-time License' }, { value: 'Commission', label: 'Commission / Marketplace' }, { value: 'Ads', label: 'Advertising / Data' }, { value: 'Other', label: 'Other' }] },
    { id: 'estimatedPricing',    label: 'Estimated Pricing',         description: 'What is the target price-point or average subscription fee?',                          type: 'text',        placeholder: 'e.g. ₹499/month, $19/user/month',                            required: true },
    { id: 'availableFunding',    label: 'Available Funding',         description: 'Select your current funding or bootstrap resources.',                                  type: 'select',      placeholder: 'Choose funding range',                                       required: true, options: [{ value: 'Bootstrapped', label: 'Bootstrapped' }, { value: '<₹1L', label: 'Seed budget < ₹1 Lakh' }, { value: '₹1L-10L', label: 'Angel budget ₹1L–₹10L' }, { value: '₹10L-1Cr', label: 'Pre-seed ₹10L–₹1Cr' }, { value: 'VC Funded', label: 'VC Funded' }] },
    { id: 'monthlyBurnCapacity', label: 'Monthly Burn Capacity',     description: 'How much operational capital are you comfortable burning each month?',                  type: 'text',        placeholder: 'e.g. ₹20,000/month, $5,000/month',                           required: true },
    { id: 'platformType',        label: 'Platform Type',             description: 'Choose your target platforms (select all that apply).',                                type: 'pills-multi', options: ['Web App', 'Mobile App', 'API', 'Desktop', 'SaaS'],              required: true },
    { id: 'techComplexity',      label: 'Technology Complexity',     description: 'Rate the technical implementation depth of the product.',                              type: 'pills-single',options: ['Low', 'Medium', 'High'],                                           required: true },
    { id: 'mvpTimeline',         label: 'MVP Timeline',              description: 'What is your timeline goal to launch a minimal working prototype?',                    type: 'pills-single',options: ['1 month', '3 months', '6 months', '12 months'],                  required: true },
    { id: 'scalabilityGoal',     label: 'Scalability Goal',          description: 'What is your growth target or geographic scaling limit?',                               type: 'pills-single',options: ['Local', 'National', 'Global'],                                      required: true },
    { id: 'acquisitionStrategy', label: 'Customer Acquisition',      description: 'How do you plan to acquire your first 100 paying customers?',                         type: 'textarea',    placeholder: 'Describe your cold outreach, SEO, or performance marketing...', required: true },
    { id: 'startupStage',        label: 'Current Startup Stage',     description: 'Select the statement that matches your current operational maturity.',                  type: 'pills-single',options: ['Idea', 'Validation', 'MVP', 'Growth', 'Scaling'],               required: true },
  ];

  const currentField = fields[currentFieldIndex];

  useEffect(() => {
    if (currentStep > 0 && currentStep < fields.length) setCurrentFieldIndex(currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && currentField.type !== 'textarea') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFieldIndex, formData]);

  const validateCurrentField = () => {
    const val = formData[currentField.id];
    if (currentField.required) {
      if (currentField.type === 'pills-multi') {
        if (!val || val.length === 0) { setError('Please select at least one platform option.'); return false; }
      } else {
        if (!val || (typeof val === 'string' && !val.trim())) { setError(`"${currentField.label}" is required to proceed.`); return false; }
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentField()) return;
    setAnimateClass('opacity-0 translate-x-[-20px] transition-all duration-300');
    setTimeout(() => {
      if (currentFieldIndex < fields.length - 1) {
        updateStartupDetails(currentField.id, formData[currentField.id]);
        const next = currentFieldIndex + 1;
        setCurrentStep(next);
        setCurrentFieldIndex(next);
        setAnimateClass('opacity-100 translate-x-0 transition-all duration-300');
      } else {
        updateStartupDetailsBulk(formData);
        setCurrentStep(0);
        navigate('/analysis/loader');
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentFieldIndex > 0) {
      setAnimateClass('opacity-0 translate-x-[20px] transition-all duration-300');
      setTimeout(() => {
        setError('');
        const prev = currentFieldIndex - 1;
        setCurrentStep(prev);
        setCurrentFieldIndex(prev);
        setAnimateClass('opacity-100 translate-x-0 transition-all duration-300');
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePillSingleSelect = (val) => {
    setFormData(prev => ({ ...prev, [currentField.id]: val }));
    setError('');
  };

  const handlePillMultiToggle = (val) => {
    setFormData(prev => {
      const active = [...(prev[currentField.id] || [])];
      const updated = active.includes(val) ? active.filter(p => p !== val) : [...active, val];
      return { ...prev, [currentField.id]: updated };
    });
    setError('');
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 680, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ProgressBar currentStep={2} />

        {/* Step progress */}
        <StepProgress current={2} />

        <div className="glass-card animate-fade-up" style={{ padding: '32px', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 28, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-light)' }}>
              <Compass size={14} className="animate-spin-slow" />
              Startup Parameters
            </span>
            <span className="badge badge-brand" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {currentFieldIndex + 1} / {fields.length}
            </span>
          </div>

          {/* Question slider */}
          <div className={`flex-grow flex flex-col justify-center ${animateClass}`} style={{ flex: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.4, margin: 0, marginBottom: 6 }}>
                {currentFieldIndex + 1}. {currentField.description}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
                Field: <strong style={{ color: 'var(--brand-light)' }}>{currentField.label}</strong>
              </p>
            </div>

            {/* Input rendering */}
            <div style={{ minHeight: 100, display: 'flex', alignItems: 'center' }}>
              {currentField.type === 'text' && (
                <InputField name={currentField.id} value={formData[currentField.id]} onChange={handleInputChange}
                  placeholder={currentField.placeholder} error={error} required={currentField.required} aria-label={currentField.label} />
              )}

              {currentField.type === 'textarea' && (
                <InputField type="textarea" name={currentField.id} value={formData[currentField.id]} onChange={handleInputChange}
                  placeholder={currentField.placeholder} error={error} rows={4} required={currentField.required} aria-label={currentField.label} />
              )}

              {currentField.type === 'select' && (
                <InputField type="select" name={currentField.id} value={formData[currentField.id]} onChange={handleInputChange}
                  placeholder={currentField.placeholder} options={currentField.options} error={error} required={currentField.required} aria-label={currentField.label} />
              )}

              {currentField.type === 'pills-single' && (
                <div style={{ width: '100%' }} role="group" aria-label={currentField.label}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                    {currentField.options.map(opt => (
                      <button key={opt} type="button" onClick={() => handlePillSingleSelect(opt)} aria-pressed={formData[currentField.id] === opt}
                        className={`pill${formData[currentField.id] === opt ? ' active' : ''}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <p className="field-error" style={{ marginTop: 8 }}>
                      <AlertCircle size={12} /> {error}
                    </p>
                  )}
                </div>
              )}

              {currentField.type === 'pills-multi' && (
                <div style={{ width: '100%' }} role="group" aria-label={currentField.label}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                    {currentField.options.map(opt => {
                      const isChecked = (formData[currentField.id] || []).includes(opt);
                      return (
                        <button key={opt} type="button" onClick={() => handlePillMultiToggle(opt)} aria-pressed={isChecked}
                          className={`pill${isChecked ? ' active-cyan' : ''}`}
                          style={{ gap: 6 }}>
                          {isChecked && <Check size={13} style={{ color: 'var(--cyan)' }} />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {error && (
                    <p className="field-error" style={{ marginTop: 8 }}>
                      <AlertCircle size={12} /> {error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleBack} disabled={currentFieldIndex === 0} className="btn btn-outline"
                aria-label="Back to previous question">
                <ArrowLeft size={15} /> Back
              </button>
              <button type="button" onClick={() => saveDraft(currentFieldIndex, formData)} className="btn btn-ghost btn-sm"
                aria-label="Save draft">
                <Save size={14} /> Save Draft
              </button>
            </div>

            {currentField.type !== 'textarea' && (
              <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }} className="hidden sm:inline">
                Press <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '1px 6px', color: 'var(--brand-light)', fontSize: 10 }}>Enter ↵</kbd> to advance
              </span>
            )}

            <button onClick={handleNext} className="btn btn-primary"
              aria-label={currentFieldIndex === fields.length - 1 ? 'Run Analysis' : 'Next question'}>
              {currentFieldIndex === fields.length - 1 ? (
                <><Check size={15} /> Run Analysis</>
              ) : (
                <>Next <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', background: 'var(--bg-sub)' }}>
        © {new Date().getFullYear()} StartupXpert — Step 2 of 3
      </footer>
    </div>
  );
};

export default OnboardingDetails;
