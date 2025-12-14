import mongoose from 'mongoose';

const equipmentInventorySchema = new mongoose.Schema({
  catalogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentCatalog',
    required: true
  },
  totalStock: {
    type: Number,
    required: true,
    min: 0
  },
  // Can be used to track damaged/maintenance items, reducing available stock
  maintenanceStock: {
    type: Number,
    default: 0
  }
});

const EquipmentInventory = mongoose.model('EquipmentInventory', equipmentInventorySchema);
export default EquipmentInventory;
