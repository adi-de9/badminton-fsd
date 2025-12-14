import PricingRule from '../models/pricing-rule.model.js';
import Court from '../models/court.model.js';
import EquipmentCatalog from '../models/equipment-catalog.model.js';
import Coach from '../models/coach.model.js';

// Helper to evaluate conditions
const matchesCondition = (rule, context) => {
  const { condition } = rule;
  if (!condition || Object.keys(condition).length === 0) return true;

  // Basic implementation of verify specific conditions
  // Context: { startTime, dayOfWeek, courtType, ... }
  
  for (const key in condition) {
    const value = condition[key];
    
    // Example: "day": "Saturday"
    if (key === 'day' && context.dayOfWeek !== value) return false;
    
    // Example: "courtType": "indoor"
    if (key === 'courtType' && context.courtType !== value) return false;

    // Example: "startTime": { "$gte": "18:00" }
    // Implement simple operators if value is object
    if (typeof value === 'object') {
       if (value.$gte && context.time < value.$gte) return false;
       if (value.$lte && context.time > value.$lte) return false;
    }
  }
  return true;
};

export const calculatePrice = async (bookingData) => {
  const { courtId, coachId, equipment, startTime, endTime } = bookingData;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = (end - start) / (1000 * 60 * 60);

  // Fetch Base Resources
  const court = await Court.findById(courtId);
  const coach = coachId ? await Coach.findById(coachId) : null;
  
  // Calculate Base Costs
  let baseCourtCost = court.basePricePerHour * durationHours;
  let coachCost = coach ? coach.hourlyRate * durationHours : 0;
  
  // Equipment Cost
  let equipmentCost = 0;
  if (equipment && equipment.length > 0) {
    // Need to populate equipment prices. 
    // Usually passes catalog items or we look them up.
    // Assuming 'equipment' has inventoryId which links to catalog.
    // We need to fetch Inventory -> Catalog to get price.
    
    // Optimization: In a real app, we'd preload these. 
    // Here we might need to query.
    // However, to keep this pure, let's assume the caller might pass details or we fetch here.
    const { default: EquipmentInventory } = await import('../models/equipment-inventory.model.js');
    
    for (const item of equipment) {
       const inv = await EquipmentInventory.findById(item.inventoryId).populate('catalogId');
       if (inv && inv.catalogId) {
         equipmentCost += inv.catalogId.pricePerSession * item.qty; // Per session (flat) or per hour? Prompt says "pricePerSession" in my Schema, but "price" usually.
         // Let's assume pricePerSession is flat fee per booking for equipment.
       }
    }
  }

  // Subtotal
  let subtotal = baseCourtCost + coachCost + equipmentCost;

  // Context for rules
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const context = {
    dayOfWeek: days[start.getDay()],
    time: start.toTimeString().substring(0, 5), // "14:00"
    courtType: court.type
  };

  // Fetch Rules
  const rules = await PricingRule.find().sort({ priority: -1 }); // High priority first? Or application order?
  // Usually apply multipliers then flats. Or priority defines order.
  // The user prompt: "2. Apply all matching multiplier rules, 3. Apply all flat rules"
  
  const multipliers = rules.filter(r => r.type === 'multiplier');
  const flats = rules.filter(r => r.type === 'flat');

  let breakdown = {
    baseCourt: baseCourtCost,
    coach: coachCost,
    equipment: equipmentCost,
    subtotal: subtotal,
    adjustments: []
  };

  // Apply Multipliers
  for (const rule of multipliers) {
    if (matchesCondition(rule, context)) {
      const adjustment = subtotal * (rule.value - 1); // if 1.5, add 0.5 * subtotal
      subtotal *= rule.value;
      breakdown.adjustments.push({ name: rule.name, type: 'multiplier', value: rule.value, amount: adjustment });
    }
  }

  // Apply Flats
  for (const rule of flats) {
    if (matchesCondition(rule, context)) {
      subtotal += rule.value;
      breakdown.adjustments.push({ name: rule.name, type: 'flat', value: rule.value, amount: rule.value });
    }
  }

  return {
    finalPrice: Math.round(subtotal * 100) / 100,
    breakdown
  };
};
