import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Court from '../src/models/court.model.js';
import Coach from '../src/models/coach.model.js';
import EquipmentCatalog from '../src/models/equipment-catalog.model.js';
import EquipmentInventory from '../src/models/equipment-inventory.model.js';
import PricingRule from '../src/models/pricing-rule.model.js';
import User from '../src/models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear existing data
    await Court.deleteMany({});
    await Coach.deleteMany({});
    await EquipmentCatalog.deleteMany({});
    await EquipmentInventory.deleteMany({});
    await PricingRule.deleteMany({});
    await User.deleteMany({});

    // 1. Create Courts
    const courts = await Court.insertMany([
      { name: 'Indoor 1', type: 'indoor', basePricePerHour: 100 },
      { name: 'Indoor 2', type: 'indoor', basePricePerHour: 100 },
      { name: 'Outdoor 1', type: 'outdoor', basePricePerHour: 80 },
      { name: 'Outdoor 2', type: 'outdoor', basePricePerHour: 80 }
    ]);
    console.log('Courts seeded');

    // 2. Create Equipment
    const racket = await EquipmentCatalog.create({
      name: 'Pro Racket',
      category: 'racket',
      pricePerSession: 20,
      description: 'High quality racket'
    });

    const shoes = await EquipmentCatalog.create({
      name: 'Badminton Shoes',
      category: 'shoes',
      pricePerSession: 15,
      description: 'Non-marking shoes'
    });

    // Inventory
    await EquipmentInventory.create([
        { catalogId: racket._id, totalStock: 10 },
        { catalogId: shoes._id, totalStock: 20 }
    ]);
    console.log('Equipment seeded');

    // 3. Create Coaches
    await Coach.insertMany([
      { name: 'John Doe', hourlyRate: 50, specialization: 'Advanced' },
      { name: 'Jane Smith', hourlyRate: 40, specialization: 'Intermediate' },
      { name: 'Mike Johnson', hourlyRate: 30, specialization: 'Beginner' }
    ]);
    console.log('Coaches seeded');

    // 4. Pricing Rules
    await PricingRule.insertMany([
      {
        name: 'Weekend Surcharge',
        type: 'multiplier',
        priority: 10,
        condition: { dayOfWeek: 'Saturday' }, // Logic handler needs to support $or for Sunday but kept simple
        value: 1.2
      },
      {
        name: 'Evening Premium',
        type: 'flat',
        priority: 5,
        condition: { startTime: { $gte: '18:00' } }, 
        value: 10
      }
    ]);
    // Note: My condition parser in `pricing.service.js` only handles single value checks strictly or simple logic.
    // Real world needs more robust parser.
    console.log('Pricing Rules seeded');

    // 5. Admin User
    // 5. Admin & Owner Users
    await User.create([
      {
        name: 'Super Admin',
        email: 'admin@admin.com',
        password: 'Password!1',
        role: 'admin'
      },
      {
        name: 'Store Owner',
        email: 'owner@store.com',
        password: 'Password!1',
        role: 'owner'
      },
      {
        name: 'Test Tenant',
        email: 'user@test.com',
        password: 'Password!1',
        role: 'user'
      }
    ]);
    console.log('Admin, Owner, and User seeded');
    console.log('Admin User seeded');

    console.log('Seeding Complete');
    process.exit();

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
