import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
// Helper for Write Access
const allowWrite = restrictTo('admin', 'owner');

// Courts
router.route('/courts')
  .get(adminController.getAllCourts)
  .post(allowWrite, adminController.createCourt);
router.route('/courts/:id')
  .patch(allowWrite, adminController.updateCourt)
  .delete(allowWrite, adminController.deleteCourt);

// Equipment
router.route('/equipment')
  .get(adminController.getAllEquipment)
  .post(allowWrite, adminController.createEquipment);
router.route('/equipment/:id')
  .patch(allowWrite, adminController.updateEquipment)
  .delete(allowWrite, adminController.deleteEquipment);

// Coaches
router.route('/coaches')
  .get(adminController.getAllCoaches)
  .post(allowWrite, adminController.createCoach);
router.route('/coaches/:id')
  .patch(allowWrite, adminController.updateCoach)
  .delete(allowWrite, adminController.deleteCoach);

// Coach Availability
router.route('/coaches/:id/availability')
  .get(adminController.getCoachAvailability)
  .post(allowWrite, adminController.createCoachAvailability);

// Pricing Rules
router.route('/pricing-rules')
  .get(adminController.getAllPricingRules)
  .post(allowWrite, adminController.createPricingRule);
router.route('/pricing-rules/:id')
  .patch(allowWrite, adminController.updatePricingRule) 
  .delete(allowWrite, adminController.deletePricingRule);

// User Management (Protected)
router.use('/users', restrictTo('admin', 'owner')); // Base restriction for users

router.route('/users')
  .get(adminController.getAllUsers)
  .post(adminController.createUser);

router.route('/users/:id')
  .patch(restrictTo('admin'), adminController.updateUser)
  .delete(restrictTo('admin'), adminController.deleteUser);

export default router;
