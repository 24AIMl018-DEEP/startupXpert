import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  options = [],
  required = false,
  togglePassword,
  showPassword,
  rows = 3
}) => {
  const isError = !!error;

  const baseInputStyles = `w-full rounded-xl border bg-[#0a0a0f] px-4 py-3.5 text-sm text-white placeholder-gray-600 transition-all duration-300 outline-none ${
    isError 
      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30' 
      : 'border-indigo-500/10 hover:border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
  }`;

  return (
    <div className="w-full text-left space-y-1.5">
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wider text-gray-400 focus:outline-none"
        >
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Input Elements */}
      <div className="relative w-full">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`${baseInputStyles} resize-none focus:ring-2 focus:ring-indigo-500`}
            aria-required={required}
            aria-invalid={isError}
          />
        ) : type === 'select' ? (
          <div className="relative">
            <select
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              className={`${baseInputStyles} appearance-none cursor-pointer pr-10 focus:ring-2 focus:ring-indigo-500`}
              aria-required={required}
              aria-invalid={isError}
            >
              {placeholder && <option value="" disabled className="text-gray-700 bg-[#0a0a0f]">{placeholder}</option>}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0f] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-indigo-400"></div>
          </div>
        ) : (
          <div className="relative">
            <input
              id={name}
              type={type === 'password' && showPassword ? 'text' : type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`${baseInputStyles} focus:ring-2 focus:ring-indigo-500`}
              aria-required={required}
              aria-invalid={isError}
            />
            
            {/* Show/Hide password toggle */}
            {type === 'password' && togglePassword && (
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-white transition-colors duration-300 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Error Msg */}
      {isError && (
        <p className="text-xs font-medium text-red-400 mt-1 select-none animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
