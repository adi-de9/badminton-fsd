import { LayoutGrid, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const BookingSummary = ({ 
  priceDetails, 
  availability, 
  onBook, 
  hasSelection,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
      {/* Decorative Ticket Header */}
      <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-1 bg-white/20 rounded-full mb-4" />
          <h3 className="font-bold text-xl tracking-wider uppercase mb-1">
            Your Booking
          </h3>
          <div className="text-indigo-200 text-sm font-medium">
            {new Date().toDateString()}
          </div>
        </div>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-xl opacity-20 transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-overlay filter blur-xl opacity-20 transform -translate-x-10 translate-y-10" />
      </div>

      <div className="p-6 relative">
        {/* Perforated Line Effect */}
        <div className="absolute -top-3 left-0 w-full flex justify-between px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-slate-50" />
          ))}
        </div>

        {!hasSelection ? (
          <div className="py-12 flex flex-col items-center text-center text-slate-400">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-sm">
              Select a time and court
              <br />
              to generate your ticket
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl transition-all duration-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            <div className={`space-y-4 mb-8 pt-4 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
              {/* Items List */}
              {priceDetails.breakdown.map((line, idx) => {
                const parts = line.split(':');
                const label = parts[0];
                const price = parts.slice(1).join(':'); // Handle case where price might contain colon (unlikely but safe)
                
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-baseline text-sm group"
                  >
                    <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">
                      {label}
                    </span>
                    <span className="font-bold text-slate-800 font-mono bg-slate-50 px-2 py-0.5 rounded">
                      {price}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`border-t-2 border-dashed border-slate-100 my-6 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`} />

            <div className={`flex justify-between items-end mb-6 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Due
                </span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                  ₹{priceDetails.total.toFixed(2)}
                </span>
              </div>
              {availability.available && (
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Warnings */}
            {!availability.available && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">
                    Slot Unavailable
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {availability.reason}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onBook}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                availability.available
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
              } ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
            >
              {availability.available ? 'Complete Booking' : 'Join Waitlist'}
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>

            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-wider">
              Instant Confirmation via Email
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
