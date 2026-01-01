require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');

const run = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) throw new Error('DB_URL not set in .env');

    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data (optional)
    await User.deleteMany({});
    await Item.deleteMany({});

    // Create sample users
    const usersData = [
      { name: 'Alice Example', email: 'alice@example.com', password: 'password123' },
      { name: 'Bob Example', email: 'bob@example.com', password: 'password123' }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const created = await User.create(u);
      createdUsers.push(created);
      console.log(`Created user: ${created.email} (id: ${created._id})`);
    }

    // Create sample items for each user
    const itemsData = [
      { name: 'Sample Item 1', description: 'First sample item', user: createdUsers[0]._id },
      { name: 'Sample Item 2', description: 'Second sample item', user: createdUsers[0]._id },
      { name: 'Bob\'s Item', description: 'Item for Bob', user: createdUsers[1]._id }
    ];

    const createdItems = [];
    for (const it of itemsData) {
      const created = await Item.create(it);
      createdItems.push(created);
      console.log(`Created item: ${created.name} (id: ${created._id})`);
    }

    console.log('Seeding complete.');
    console.log(`Users created: ${createdUsers.length}, Items created: ${createdItems.length}`);

    // Print JWT tokens for testing (use Authorization: Bearer <token>)
    console.log('\n=== Test tokens (use as Authorization header) ===');
    for (const u of createdUsers) {
      const token = jwt.sign({ userId: u._id, email: u.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      console.log(`${u.email}: ${token}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();