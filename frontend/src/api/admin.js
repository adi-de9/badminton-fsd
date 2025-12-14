import api from './axios';

export const adminAPI = {
  // Courts
  getCourts: async () => api.get('/admin/courts'),
  createCourt: async (courtData) => api.post('/admin/courts', courtData),
  updateCourt: async (id, courtData) => api.patch(`/admin/courts/${id}`, courtData),
  deleteCourt: async (id) => api.delete(`/admin/courts/${id}`),

  // Equipment
  getEquipment: async () => api.get('/admin/equipment'),
  createEquipment: async (equipmentData) => api.post('/admin/equipment', equipmentData),
  updateEquipment: async (id, equipmentData) => api.patch(`/admin/equipment/${id}`, equipmentData),
  deleteEquipment: async (id) => api.delete(`/admin/equipment/${id}`),

  // Coaches
  getCoaches: async () => api.get('/admin/coaches'),
  createCoach: async (coachData) => api.post('/admin/coaches', coachData),
  updateCoach: async (id, coachData) => api.patch(`/admin/coaches/${id}`, coachData),
  deleteCoach: async (id) => api.delete(`/admin/coaches/${id}`),

  // Coach Availability
  getCoachAvailability: async (coachId) => api.get(`/admin/coaches/${coachId}/availability`),
  createCoachAvailability: async (coachId, availabilityData) => 
    api.post(`/admin/coaches/${coachId}/availability`, availabilityData),

  // Pricing Rules
  getPricingRules: async () => api.get('/admin/pricing-rules'),
  createPricingRule: async (ruleData) => api.post('/admin/pricing-rules', ruleData),
  updatePricingRule: async (id, ruleData) => api.patch(`/admin/pricing-rules/${id}`, ruleData),
  deletePricingRule: async (id) => api.delete(`/admin/pricing-rules/${id}`)
};
