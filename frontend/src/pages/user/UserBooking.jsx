import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/admin';
import { bookingAPI } from '../../api/bookings';

// Import components
import WizardSteps from '../../components/booking/WizardSteps';
import TimeSlotSelector from '../../components/booking/TimeSlotSelector';
import CourtCard from '../../components/booking/CourtCard';  
import CoachSelector from '../../components/booking/CoachSelector';
import EquipmentSelector from '../../components/booking/EquipmentSelector';
import BookingSummary from '../../components/booking/BookingSummary';
import Toast from '../../components/common/Toast';

import { 
  Trophy, LogOut, Calendar, Clock, ChevronLeft, ChevronRight 
} from 'lucide-react';

const UserBooking = () => {
  const { user, logout } = useAuth();
  
  // Data from backend
  const [courts, setCourts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [cartEquipment, setCartEquipment] = useState({});

  // Pricing & Availability
  const [priceDetails, setPriceDetails] = useState({ total: 0, breakdown: [] });
  const [availability, setAvailability] = useState({ available: true });
  const [notification, setNotification] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [courtsRes, coachesRes, equipRes] = await Promise.all([
          adminAPI.getCourts(),
          adminAPI.getCoaches(),
          adminAPI.getEquipment()
        ]);
        
        setCourts(courtsRes.data || []);
        setCoaches(coachesRes.data || []);
        setEquipment(equipRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({ msg: error.message, type: 'error' });
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate price when selections change
  useEffect(() => {
    if (!selectedCourtId) {
      setPriceDetails({ total: 0, breakdown: [] });
      return;
    }

    const fetchPrice = async () => {
      setPricingLoading(true);
      try {
        const equipmentItems = Object.entries(cartEquipment)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({ inventoryId: id, qty }));

        const result = await bookingAPI.previewPricing({
          courtId: selectedCourtId,
          coachId: selectedCoachId || undefined,
          equipment: equipmentItems,
          // Send as local time (no Z) so server interprets it in its timezone
          startTime: `${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`,
          endTime: `${selectedDate}T${String(selectedHour + 1).padStart(2, '0')}:00:00`
        });
        
        const data = result.data;
        const breakdownData = data.breakdown || {};

        // Format breakdown from backend response
        const breakdown = [
          `Base Rate: ₹${breakdownData.baseCourt || 0}`
        ];
        
        if (breakdownData.coach) {
          breakdown.push(`Coach: +₹${breakdownData.coach}`);
        }
        
        if (breakdownData.equipment) {
          breakdown.push(`Equipment: +₹${breakdownData.equipment}`);
        }
        
        if (breakdownData.adjustments && breakdownData.adjustments.length > 0) {
          breakdownData.adjustments.forEach(rule => {
             const sign = rule.amount >= 0 ? '+' : '';
             breakdown.push(`${rule.name}: ${sign}₹${rule.amount?.toFixed(2) || 0}`);
          });
        }
        console.log(breakdown);
        
        setPriceDetails({
          total: data.finalPrice || 0,
          breakdown
        });
        setPricingLoading(false);
      } catch (error) {
        console.error('Pricing error:', error);
        setPricingLoading(false);
      }
    };

    fetchPrice();
  }, [selectedCourtId, selectedCoachId, cartEquipment, selectedDate, selectedHour]);

  // Check availability when selections change
  useEffect(() => {
    if (!selectedCourtId) {
      setAvailability({ available: true });
      return;
    }

    const checkAvail = async () => {
      try {
        const result = await bookingAPI.checkAvailability({
          courtId: selectedCourtId,
          start: `${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`,
          end: `${selectedDate}T${String(selectedHour + 1).padStart(2, '0')}:00:00`,
          coachId: selectedCoachId || undefined
        });

        const availData = result.data;
        const isCourtFree = availData.court;
        const isCoachFree = !selectedCoachId || availData.coach; // If no coach selected, assume free (or ignore)

        if (isCourtFree && isCoachFree) {
          setAvailability({ available: true });
        } else {
          let reason = 'Slot unavailable';
          if (!isCourtFree) reason = 'Court is already booked';
          else if (!isCoachFree) reason = 'Coach is unavailable';
          
          setAvailability({ 
            available: false, 
            reason
          });
        }
      } catch (error) {
        console.error('Availability check error:', error);
        setAvailability({ 
          available: false, 
          reason: 'Unable to check availability' 
        });
      }
    };

    checkAvail();
  }, [selectedCourtId, selectedDate, selectedHour, selectedCoachId]);

  const handleNext = () => {
    if (step === 2 && !selectedCourtId) {
      setNotification({ msg: 'Select a court to continue!', type: 'error' });
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleBook = async () => {
    if (!availability.available) {
      // Join waitlist
      if (window.confirm(`${availability.reason}\n\nWould you like to join the waitlist?`)) {
        try {
          await bookingAPI.joinWaitlist({
            courtId: selectedCourtId,
            startTime: `${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`,
            endTime: `${selectedDate}T${String(selectedHour + 1).padStart(2, '0')}:00:00`
          });
          setNotification({ msg: 'Added to waitlist!', type: 'success' });
          resetForm();
        } catch (error) {
          setNotification({ msg: error.message, type: 'error' });
        }
      }
      return;
    }

    // Create booking
    try {
      const equipmentItems = Object.entries(cartEquipment)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ inventoryId: id, qty }));

      await bookingAPI.createBooking({
        courtId: selectedCourtId,
        coachId: selectedCoachId || undefined,
        equipment: equipmentItems,
        startTime: `${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`,
        endTime: `${selectedDate}T${String(selectedHour + 1).padStart(2, '0')}:00:00`
      });

      setNotification({ msg: 'Success! Your court is booked.', type: 'success' });
      resetForm();
    } catch (error) {
      setNotification({ msg: error.message, type: 'error' });
    }
  };

  const resetForm = () => {
    setCartEquipment({});
    setSelectedCoachId(null);
    setSelectedCourtId(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading courts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                SmashPoint
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Sports Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mr-4 hidden md:block">
              Dashboard
            </Link>
            <span className="text-sm font-semibold text-slate-700 hidden md:block">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Wizard */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            <WizardSteps currentStep={step} />

            <div className="min-h-[400px]">
              
              {/* Step 1: Date & Time */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" /> Pick a Date
                    </h2>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold text-slate-700 text-lg"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" /> Select Time Slot
                    </h2>
                    <TimeSlotSelector
                      selectedHour={selectedHour}
                      onSelectHour={setSelectedHour}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Court Selection */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Available Courts
                  </h2>
                  {courts.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-500">
                      No courts available. Please contact admin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courts.map((court) => (
                        <CourtCard
                          key={court._id}
                          court={{
                            id: court._id,
                            name: court.name,
                            type: court.type.toUpperCase(),
                            basePrice: court.basePricePerHour,
                            isDisabled: !court.isActive
                          }}
                          isSelected={selectedCourtId === court._id}
                          isTaken={false}
                          onSelect={setSelectedCourtId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Add-ons */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                  <CoachSelector
                    coaches={coaches.map((c) => ({
                      id: c._id,
                      name: c.name,
                      hourlyRate: c.hourlyRate
                    }))}
                    selectedCoachId={selectedCoachId}
                    onSelect={setSelectedCoachId}
                    bookedCoaches={[]}
                  />

                  <EquipmentSelector
                    equipment={equipment.map((e) => ({
                      id: e._id,
                      name: e.name,
                      price: e.pricePerSession,
                      totalStock: e.totalStock
                    }))}
                    cart={cartEquipment}
                    onUpdateQuantity={(id, qty) =>
                      setCartEquipment({ ...cartEquipment, [id]: qty })
                    }
                  />
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50/90 backdrop-blur py-4 z-20">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 ${
                    step === 2 && !selectedCourtId
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="hidden md:flex text-sm text-slate-400 font-medium items-center animate-pulse">
                  Almost there! Check the summary <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              <BookingSummary
                priceDetails={priceDetails}
                availability={availability}
                onBook={handleBook}
                hasSelection={!!selectedCourtId}
                loading={pricingLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserBooking;
