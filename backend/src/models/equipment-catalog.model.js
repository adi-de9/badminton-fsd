import mongoose from 'mongoose';

const equipmentCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['racket', 'shoes', 'shuttlecock', 'accessory'],
    required: true
  },
  pricePerSession: {
    type: Number,
    required: true
  },
  imageUrl: String,
  description: String
});

const EquipmentCatalog = mongoose.model('EquipmentCatalog', equipmentCatalogSchema);
export default EquipmentCatalog;
