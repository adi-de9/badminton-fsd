/**
 * Data mapping utilities to convert backend responses to frontend format
 */

export const mapCourt = (backendCourt) => ({
  id: backendCourt._id,
  name: backendCourt.name,
  type: backendCourt.type.toUpperCase(), // 'indoor' → 'INDOOR'
  basePrice: backendCourt.basePricePerHour,
  isDisabled: !backendCourt.isActive // Backend has isActive, frontend uses isDisabled
});

export const mapCoach = (backendCoach) => ({
  id: backendCoach._id,
  name: backendCoach.name,
  hourlyRate: backendCoach.hourlyRate
});

export const mapEquipment = (backendEquipment) => ({
  id: backendEquipment._id,
  name: backendEquipment.name,
  price: backendEquipment.pricePerSession,
  totalStock: backendEquipment.totalStock
});

export const mapPricingRule = (backendRule) => ({
  id: backendRule._id,
  name: backendRule.name,
  isActive: backendRule.isActive,
  type: backendRule.type === 'multiplier' ? 'MULTIPLIER' : 'FLAT_ADD',
  value: backendRule.value,
  conditions: {
    days: backendRule.condition?.day ? [getDayNumber(backendRule.condition.day)] : undefined,
    startHour: backendRule.condition?.startHour,
    endHour: backendRule.condition?.endHour,
    courtType: backendRule.condition?.courtType?.toUpperCase()
  }
});

export const mapBooking = (backendBooking) => ({
  id: backendBooking._id,
  courtId: backendBooking.court,
  date: new Date(backendBooking.startTime).toISOString().split('T')[0],
  hour: new Date(backendBooking.startTime).getHours(),
  coachId: backendBooking.coach,
  equipment: backendBooking.equipment.map(eq => ({
    id: eq.inventoryId,
    quantity: eq.qty
  })),
  totalPrice: backendBooking.totalPrice,
  status: backendBooking.status === 'confirmed' ? 'CONFIRMED' : 'WAITLISTED'
});

// Helper: Convert day name to number (Sunday=0, Monday=1, etc.)
const getDayNumber = (dayName) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(dayName);
};

// Helper: Format date for API (YYYY-MM-DD → ISO string)
export const formatDateTime = (date, hour) => {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day, hour, 0, 0, 0);
  return dateObj.toISOString();
};

// Helper: Prepare booking data for backend
export const prepareBookingData = (selectedDate, selectedHour, selectedCourtId, selectedCoachId, cartEquipment) => {
  return {
    courtId: selectedCourtId,
    coachId: selectedCoachId || undefined,
    equipment: Object.entries(cartEquipment)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        inventoryId: id,
        qty
      })),
    startTime: formatDateTime(selectedDate, selectedHour),
    endTime: formatDateTime(selectedDate, selectedHour + 1)
  };
};
