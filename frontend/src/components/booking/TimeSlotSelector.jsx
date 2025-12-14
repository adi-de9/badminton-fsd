// Time slot selector component
import React from 'react';
import { Sunrise, Sun, Moon } from 'lucide-react';

const TimeSlotSelector = ({ selectedHour, onSelectHour }) => {
  const morningHours = [7, 8, 9, 10, 11];
  const afternoonHours = [12, 13, 14, 15, 16];
  const eveningHours = [17, 18, 19, 20, 21];

  const renderTimeButton = (h) => (
    <button
      key={h}
      onClick={() => onSelectHour(h)}
      className={`relative p-3 rounded-xl text-center border-2 transition-all duration-200 ${
        selectedHour === h
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-105 z-10'
          : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="text-sm font-bold">
        {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
      </div>
      {h >= 18 && h <= 21 && selectedHour !== h && (
        <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-amber-200">
          Peak
        </div>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          <Sunrise className="w-4 h-4" /> Morning
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {morningHours.map(renderTimeButton)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          <Sun className="w-4 h-4" /> Afternoon
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {afternoonHours.map(renderTimeButton)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          <Moon className="w-4 h-4" /> Evening
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {eveningHours.map(renderTimeButton)}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;
