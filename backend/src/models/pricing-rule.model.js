import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiplier', 'flat'],
    required: true
  },
  priority: {
    type: Number,
    default: 0
  },
  condition: {
    type: mongoose.Schema.Types.Mixed, // JSON logic: { "day": "Saturday", "startTime": { "$gte": "18:00" } }
    default: {}
  },
  value: {
    type: Number,
    required: true
  },
  description: String
});

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
export default PricingRule;
