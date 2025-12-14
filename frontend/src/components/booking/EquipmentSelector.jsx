// Equipment selector component
import React from 'react';
import { Briefcase } from 'lucide-react';

const EquipmentSelector = ({ equipment, cart, onUpdateQuantity }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-500" /> Rental Gear
      </h2>
      <div className="space-y-4">
        {equipment.map((item) => {
          const currentQty = cart[item.id] || 0;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div>
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="text-sm text-indigo-600 font-semibold">
                  ₹{item.price}{' '}
                  <span className="text-slate-400 font-normal">/ item</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.id, Math.max(0, currentQty - 1))
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 font-bold transition-colors disabled:opacity-50"
                  disabled={currentQty === 0}
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-slate-800">
                  {currentQty}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, currentQty + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentSelector;
