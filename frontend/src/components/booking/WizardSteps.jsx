// Booking wizard step indicator component
import React from 'react';
import { CheckCircle } from 'lucide-react';

const WizardSteps = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Date & Time' },
    { num: 2, label: 'Select Court' },
    { num: 3, label: 'Extras' }
  ];

  return (
    <div className="flex justify-between items-center mb-8 px-2">
      {steps.map((s, index) => (
        <div key={s.num} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
              currentStep >= s.num
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {currentStep > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
          </div>
          <span
            className={`ml-2 text-sm font-semibold hidden md:block ${
              currentStep >= s.num ? 'text-indigo-900' : 'text-slate-400'
            }`}
          >
            {s.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-4 ${
                currentStep > s.num ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default WizardSteps;
