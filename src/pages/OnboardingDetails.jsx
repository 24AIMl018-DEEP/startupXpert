import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Compass, HelpCircle } from 'lucide-react';

const OnboardingDetails = () => {
  const { startupDetails, updateStartupDetails, updateStartupDetailsBulk } = useStartup();
  const navigate = useNavigate();

  // Local state for the 17 fields, synchronized with context
  const [formData, setFormData] = useState({
    startupName: startupDetails.startupName || '',
    startupDomain: startupDetails.startupDomain || '',
    problemStatement: startupDetails.problemStatement || '',
    startupDescription: startupDetails.startupDescription || '',
    targetAudience: startupDetails.targetAudience || '',
    geographicMarket: startupDetails.geographicMarket || '',
    existingCompetitors: startupDetails.existingCompetitors || '',
    revenueModel: startupDetails.revenueModel || '',
    estimatedPricing: startupDetails.estimatedPricing || '',
    availableFunding: startupDetails.availableFunding || '',
    monthlyBurnCapacity: startupDetails.monthlyBurnCapacity || '',
    platformType: startupDetails.platformType || [],
    techComplexity: startupDetails.techComplexity || '',
    mvpTimeline: startupDetails.mvpTimeline || '',
    scalabilityGoal: startupDetails.scalabilityGoal || '',
    acquisitionStrategy: startupDetails.acquisitionStrategy || '',
    startupStage: startupDetails.startupStage || '',
  });

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [error, setError] = useState('');
  const [animateClass, setAnimateClass] = useState('opacity-100 translate-x-0');

  // Define the 17 fields in chronological order
  const fields = [
    {
      id: 'startupName',
      label: 'Startup Name',
      description: 'What is the working name of your venture?',
      type: 'text',
      placeholder: 'e.g. VentureAI',
      required: true
    },
    {
      id: 'startupDomain',
      label: 'Startup Domain',
      description: 'Select the primary industry domain that describes your business.',
      type: 'select',
      placeholder: 'Choose domain',
      options: [
        { value: 'HealthTech', label: 'HealthTech (Healthcare IT)' },
        { value: 'EdTech', label: 'EdTech (Education Services)' },
        { value: 'FinTech', label: 'FinTech (Financial Services)' },
        { value: 'AgriTech', label: 'AgriTech (Agricultural Engineering)' },
        { value: 'E-Commerce', label: 'E-Commerce (Retail & Delivery)' },
        { value: 'SaaS', label: 'SaaS (Software as a Service)' },
        { value: 'Other', label: 'Other Domain' }
      ],
      required: true
    },
    {
      id: 'problemStatement',
      label: 'Problem Statement',
      description: 'What critical friction point or pain point does your startup solve?',
      type: 'textarea',
      placeholder: 'Describe the core problem in detail...',
      required: true
    },
    {
      id: 'startupDescription',
      label: 'Startup Description',
      description: 'Describe your product or service. Explain how it works and resolves the problem.',
      type: 'textarea',
      placeholder: 'Describe the startup proposal (this becomes the core prompt for our AI analyzers)...',
      required: true
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      description: 'Who is your ideal customer profile (ICP)?',
      type: 'text',
      placeholder: 'e.g. B2B marketers, tech-savvy parents, Gen Z students',
      required: true
    },
    {
      id: 'geographicMarket',
      label: 'Geographic Market',
      description: 'Where is your primary launching territory or geographic scope?',
      type: 'text',
      placeholder: 'e.g. Southeast Asia, Tier-1 cities in India, Global remote',
      required: true
    },
    {
      id: 'existingCompetitors',
      label: 'Existing Competitors',
      description: 'List any key competitors or alternatives in this space.',
      type: 'text',
      placeholder: 'e.g. Manual Excel tracking, Stripe Billing, Incumbent SaaS',
      required: true
    },
    {
      id: 'revenueModel',
      label: 'Revenue Model',
      description: 'How does your startup plan to monetize its offering?',
      type: 'select',
      placeholder: 'Choose revenue model',
      options: [
        { value: 'Subscription', label: 'Subscription (SaaS, Monthly/Yearly)' },
        { value: 'Freemium', label: 'Freemium (Free tier + paid features)' },
        { value: 'One-time', label: 'One-time License / Transactional fee' },
        { value: 'Commission', label: 'Commission / Marketplace take-rate' },
        { value: 'Ads', label: 'Advertising / Data Monetization' },
        { value: 'Other', label: 'Other Model' }
      ],
      required: true
    },
    {
      id: 'estimatedPricing',
      label: 'Estimated Pricing',
      description: 'What is the target price-point or average subscription fee?',
      type: 'text',
      placeholder: 'e.g. ₹499/month, $19/user/month',
      required: true
    },
    {
      id: 'availableFunding',
      label: 'Available Funding',
      description: 'Select your current funding or bootstrap resources.',
      type: 'select',
      placeholder: 'Choose funding range',
      options: [
        { value: 'Bootstrapped', label: 'Self-funded / Bootstrapped' },
        { value: '<₹1L', label: 'Seed budget (< ₹1 Lakh)' },
        { value: '₹1L-10L', label: 'Angel budget (₹1 Lakh - ₹10 Lakhs)' },
        { value: '₹10L-1Cr', label: 'Pre-seed budget (₹10 Lakhs - ₹1 Crore)' },
        { value: 'VC Funded', label: 'Institutional / VC Funded' }
      ],
      required: true
    },
    {
      id: 'monthlyBurnCapacity',
      label: 'Monthly Burn Capacity',
      description: 'How much operational capital are you comfortable burning each month?',
      type: 'text',
      placeholder: 'e.g. ₹20,000/month, $5,000/month',
      required: true
    },
    {
      id: 'platformType',
      label: 'Platform Type',
      description: 'Choose target platforms (Select all that apply).',
      type: 'pills-multi',
      options: ['Web App', 'Mobile App', 'API', 'Desktop', 'SaaS'],
      required: true
    },
    {
      id: 'techComplexity',
      label: 'Technology Complexity',
      description: 'Rate the technical implementation depth of the product.',
      type: 'pills-single',
      options: ['Low', 'Medium', 'High'],
      required: true
    },
    {
      id: 'mvpTimeline',
      label: 'MVP Timeline',
      description: 'What is your timeline goal to launch a minimal working prototype?',
      type: 'pills-single',
      options: ['1 month', '3 months', '6 months', '12 months'],
      required: true
    },
    {
      id: 'scalabilityGoal',
      label: 'Scalability Goal',
      description: 'What is your growth target or geographic scaling limit?',
      type: 'pills-single',
      options: ['Local', 'National', 'Global'],
      required: true
    },
    {
      id: 'acquisitionStrategy',
      label: 'Customer Acquisition Strategy',
      description: 'How do you plan to acquire your first 100 paying customers?',
      type: 'textarea',
      placeholder: 'Describe your cold outreach, SEO, social media, or performance marketing plans...',
      required: true
    },
    {
      id: 'startupStage',
      label: 'Current Startup Stage',
      description: 'Select the statement that matches your current operational maturity.',
      type: 'pills-single',
      options: ['Idea', 'Validation', 'MVP', 'Growth', 'Scaling'],
      required: true
    }
  ];

  const currentField = fields[currentFieldIndex];

  // Capture standard keyboard Enter key to advance naturally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && currentField.type !== 'textarea') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFieldIndex, formData]);

  const validateCurrentField = () => {
    const val = formData[currentField.id];
    if (currentField.required) {
      if (currentField.type === 'pills-multi') {
        if (!val || val.length === 0) {
          setError('Please select at least one platform option.');
          return false;
        }
      } else {
        if (!val || (typeof val === 'string' && !val.trim())) {
          setError(`"${currentField.label}" is required to proceed.`);
          return false;
        }
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentField()) return;

    // Trigger sliding animation
    setAnimateClass('opacity-0 translate-x-[-20px] transition-all duration-300');

    setTimeout(() => {
      if (currentFieldIndex < fields.length - 1) {
        // Save current field value to context as we go
        updateStartupDetails(currentField.id, formData[currentField.id]);
        
        setCurrentFieldIndex((prev) => prev + 1);
        setAnimateClass('opacity-100 translate-x-0 transition-all duration-300');
      } else {
        // Final Submit: Save everything and navigate to step 3
        updateStartupDetailsBulk(formData);
        navigate('/startup/validate');
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentFieldIndex > 0) {
      setAnimateClass('opacity-0 translate-x-[20px] transition-all duration-300');

      setTimeout(() => {
        setError('');
        setCurrentFieldIndex((prev) => prev - 1);
        setAnimateClass('opacity-100 translate-x-0 transition-all duration-300');
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePillSingleSelect = (val) => {
    setFormData((prev) => ({ ...prev, [currentField.id]: val }));
    setError('');
  };

  const handlePillMultiToggle = (val) => {
    setFormData((prev) => {
      const activePills = [...(prev[currentField.id] || [])];
      if (activePills.includes(val)) {
        return { ...prev, [currentField.id]: activePills.filter((p) => p !== val) };
      } else {
        return { ...prev, [currentField.id]: [...activePills, val] };
      }
    });
    setError('');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-3xl mx-auto w-full flex flex-col justify-center">
        {/* Progress Tracker */}
        <ProgressBar currentStep={2} />

        <div className="rounded-2xl border border-indigo-500/10 bg-[#0e0e16]/80 p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative min-h-[450px] flex flex-col justify-between">
          
          {/* Header Progress Counter */}
          <div className="flex items-center justify-between border-b border-indigo-500/5 pb-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Compass className="h-4 w-4 animate-spin-slow text-indigo-400" />
              Startup Parameters Setup
            </span>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-white font-mono">
              {currentFieldIndex + 1} of {fields.length}
            </span>
          </div>

          {/* Typeform Sequential Input Slider */}
          <div className={`flex-grow flex flex-col justify-center ${animateClass}`}>
            <div className="space-y-4 mb-6">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                {currentFieldIndex + 1}. {currentField.description}
              </h3>
            </div>

            {/* Field Rendering Logic */}
            <div className="w-full min-h-[120px] flex items-center justify-center">
              {currentField.type === 'text' && (
                <InputField
                  name={currentField.id}
                  value={formData[currentField.id]}
                  onChange={handleInputChange}
                  placeholder={currentField.placeholder}
                  error={error}
                  required={currentField.required}
                />
              )}

              {currentField.type === 'textarea' && (
                <InputField
                  type="textarea"
                  name={currentField.id}
                  value={formData[currentField.id]}
                  onChange={handleInputChange}
                  placeholder={currentField.placeholder}
                  error={error}
                  rows={4}
                  required={currentField.required}
                />
              )}

              {currentField.type === 'select' && (
                <InputField
                  type="select"
                  name={currentField.id}
                  value={formData[currentField.id]}
                  onChange={handleInputChange}
                  placeholder={currentField.placeholder}
                  options={currentField.options}
                  error={error}
                  required={currentField.required}
                />
              )}

              {currentField.type === 'pills-single' && (
                <div className="w-full text-left space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentField.options.map((opt) => {
                      const isSelected = formData[currentField.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handlePillSingleSelect(opt)}
                          className={`py-4 px-4 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]'
                              : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {error && (
                    <p className="text-xs font-medium text-red-400 mt-1 select-none animate-pulse flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {error}
                    </p>
                  )}
                </div>
              )}

              {currentField.type === 'pills-multi' && (
                <div className="w-full text-left space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentField.options.map((opt) => {
                      const isChecked = (formData[currentField.id] || []).includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handlePillMultiToggle(opt)}
                          className={`py-4 px-4 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center gap-2 ${
                            isChecked
                              ? 'bg-cyan-950 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-[1.02]'
                              : 'bg-[#0a0a0f] border-indigo-500/10 text-gray-400 hover:text-white hover:border-indigo-500/30'
                          }`}
                        >
                          {isChecked && <Check className="h-4.5 w-4.5 text-cyan-400" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {error && (
                    <p className="text-xs font-medium text-red-400 mt-1 select-none animate-pulse flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="mt-8 border-t border-indigo-500/5 pt-6 flex justify-between items-center gap-4">
            <button
              onClick={handleBack}
              disabled={currentFieldIndex === 0}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/10 bg-indigo-500/5 px-5 py-3 text-sm font-bold text-gray-400 hover:bg-indigo-500/10 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-indigo-500/5 disabled:hover:text-gray-400"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Back
            </button>

            {currentField.type !== 'textarea' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-600 tracking-wider uppercase font-mono select-none">
                Press <span className="bg-indigo-950 border border-indigo-800 text-indigo-400 px-1.5 py-0.5 rounded font-bold font-sans">Enter ↵</span> to advance
              </span>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              {currentFieldIndex === fields.length - 1 ? (
                <>
                  Complete Onboarding
                  <Check className="h-4.5 w-4.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert. Step 2 of 3 Completed.
      </footer>
    </div>
  );
};

export default OnboardingDetails;
