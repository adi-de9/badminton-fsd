import User from '../models/user.model.js';
import Court from '../models/court.model.js';
import EquipmentCatalog from '../models/equipment-catalog.model.js';
import Coach from '../models/coach.model.js';
import CoachAvailability from '../models/coach-availability.model.js';
import PricingRule from '../models/pricing-rule.model.js';
import catchAsync from '../utils/catchAsync.js';

// Generic Factory for CRUD (Simplified)
const factory = (Model) => ({
    getAll: catchAsync(async (req, res) => {
        const docs = await Model.find();
        res.status(200).json({ success: true, results: docs.length, data: docs });
    }),
    create: catchAsync(async (req, res) => {
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, data: doc });
    }),
    update: catchAsync(async (req, res) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: doc });
    }),
    delete: catchAsync(async (req, res) => {
        await Model.findByIdAndDelete(req.params.id);
        res.status(204).json({ success: true, data: null });
    })
});

// Courts
export const getAllCourts = factory(Court).getAll;
export const createCourt = factory(Court).create;
export const updateCourt = factory(Court).update;
export const deleteCourt = factory(Court).delete;

// Equipment
export const getAllEquipment = factory(EquipmentCatalog).getAll;
export const createEquipment = factory(EquipmentCatalog).create;
export const updateEquipment = factory(EquipmentCatalog).update;
export const deleteEquipment = factory(EquipmentCatalog).delete;

// Coaches
export const getAllCoaches = factory(Coach).getAll;
export const createCoach = factory(Coach).create;
export const updateCoach = factory(Coach).update;
export const deleteCoach = factory(Coach).delete;

// Pricing Rules
export const getAllPricingRules = factory(PricingRule).getAll;
export const createPricingRule = factory(PricingRule).create;
export const updatePricingRule = factory(PricingRule).update;
export const deletePricingRule = factory(PricingRule).delete;

// Coach Availability
export const getCoachAvailability = catchAsync(async(req, res) => {
    const avail = await CoachAvailability.find({ coachId: req.params.id });
     res.status(200).json({ success: true, data: avail });
});

export const createCoachAvailability = catchAsync(async(req, res) => {
    const avail = await CoachAvailability.create({ ...req.body, coachId: req.params.id });
    res.status(201).json({ success: true, data: avail });
});

// Users
export const getAllUsers = factory(User).getAll;
export const createUser = factory(User).create;
export const updateUser = factory(User).update;
export const deleteUser = factory(User).delete;
