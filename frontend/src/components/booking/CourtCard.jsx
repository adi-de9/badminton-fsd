// Court card component
import React from 'react';
import { Zap, Wind, CheckCircle } from 'lucide-react';

const CourtCard = ({ court, isSelected, isTaken, onSelect }) => {
  return (
    <button
      disabled={isTaken || court.isDisabled}
      onClick={() => onSelect(court.id)}
      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${
        isSelected
          ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-xl scale-[1.02] z-10'
          : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg'
      } ${
        isTaken || court.isDisabled
          ? 'opacity-60 grayscale cursor-not-allowed bg-slate-50'
          : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            court.type === 'INDOOR'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {court.type === 'INDOOR' ? (
            <Zap className="w-3 h-3" />
          ) : (
            <Wind className="w-3 h-3" />
          )}
          {court.type}
        </span>
        {isSelected && (
          <div className="bg-indigo-600 text-white rounded-full p-1">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-900 text-xl mb-1 group-hover:text-indigo-700 transition-colors">
        {court.name}
      </h3>
      <p className="text-slate-500 text-sm mb-4">Professional grade surface</p>

      <div className="flex items-end justify-between border-t border-slate-50 pt-4">
        <div className="text-xs font-bold text-slate-400 uppercase">
          Rate per hour
        </div>
        <div className="font-bold text-slate-900 text-2xl">₹{court.basePrice}</div>
      </div>

      {(isTaken || court.isDisabled) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <span className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg">
            {court.isDisabled ? 'Maintenance' : 'Booked'}
          </span>
        </div>
      )}
    </button>
  );
};

export default CourtCard;
