// Coach selector component
import React from 'react';
import { User } from 'lucide-react';

const CoachSelector = ({ coaches, selectedCoachId, onSelect, bookedCoaches = [] }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-500" /> Need a Coach?
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect(null)}
          className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all ${
            !selectedCoachId
              ? 'border-slate-800 bg-slate-800 text-white'
              : 'border-slate-100 text-slate-600 hover:bg-slate-50'
          }`}
        >
          No thanks, I'll play solo
        </button>
        {coaches.map((coach) => {
          const isBusy = bookedCoaches.includes(coach.id);
          return (
            <button
              key={coach.id}
              disabled={isBusy}
              onClick={() => onSelect(coach.id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selectedCoachId === coach.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-slate-100 hover:border-indigo-200'
              } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-left">
                <div className="font-bold">{coach.name}</div>
                <div className="text-xs opacity-70">₹{coach.hourlyRate}/hr</div>
              </div>
              {isBusy && (
                <span className="text-[10px] font-bold bg-slate-200 px-2 py-1 rounded">
                  BUSY
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoachSelector;
