const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local without dotenv dependency
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const franchisesCol = mongoose.connection.collection('franchises');

  const hubs = [
    {
      code: 'GZB-SIDDHARTH-VIHAR',
      name: 'Siddharth Vihar Hub (Ghaziabad)',
      address: 'Siddharth Vihar, Near NH-24 / Delhi-Meerut Expressway, Ghaziabad, Uttar Pradesh 201009',
      city: 'Ghaziabad',
      coordinates: { latitude: 28.6472, longitude: 77.4111 },
      phone: '+919310593167',
      email: 'freshoo.online@gmail.com',
      deliveryRadiusKm: 15,
      isActive: true,
      openingTime: '07:00',
      closingTime: '23:00',
      isTemporarilyClosed: false,
      holidays: [],
      updatedAt: new Date(),
    },
    {
      code: 'ROHINI-22',
      name: 'Rohini Sector 22 Hub (Delhi)',
      address: 'Pocket 4, Sector 22, Rohini, New Delhi, Delhi 110086',
      city: 'Delhi',
      coordinates: { latitude: 28.7188, longitude: 77.0673 },
      phone: '+919310593167',
      email: 'freshoo.online@gmail.com',
      deliveryRadiusKm: 15,
      isActive: true,
      openingTime: '07:00',
      closingTime: '23:00',
      isTemporarilyClosed: false,
      holidays: [],
      updatedAt: new Date(),
    },
  ];

  for (const hub of hubs) {
    const existing = await franchisesCol.findOne({ code: hub.code });
    if (existing) {
      await franchisesCol.updateOne({ code: hub.code }, { $set: hub });
      console.log(`Updated Hub: ${hub.name} (${hub.code})`);
    } else {
      hub.createdAt = new Date();
      await franchisesCol.insertOne(hub);
      console.log(`Inserted Hub: ${hub.name} (${hub.code})`);
    }
  }

  // Also add common locations for Ghaziabad & Delhi to locations collection
  const locationsCol = mongoose.connection.collection('locations');
  const targetLocations = [
    { name: 'Siddharth Vihar, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 1 },
    { name: 'Pratap Vihar, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 2 },
    { name: 'Indirapuram, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 3 },
    { name: 'Crossings Republik, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 4 },
    { name: 'Vasundhara, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 5 },
    { name: 'Vaishali, Ghaziabad', city: 'Ghaziabad', isActive: true, sortOrder: 6 },
    { name: 'Rohini Sector 22, Delhi', city: 'Delhi', isActive: true, sortOrder: 7 },
    { name: 'Rohini Sector 21, Delhi', city: 'Delhi', isActive: true, sortOrder: 8 },
    { name: 'Rohini Sector 23, Delhi', city: 'Delhi', isActive: true, sortOrder: 9 },
    { name: 'Rohini Sector 24, Delhi', city: 'Delhi', isActive: true, sortOrder: 10 },
    { name: 'Pitampura, Delhi', city: 'Delhi', isActive: true, sortOrder: 11 },
    { name: 'Prashant Vihar, Delhi', city: 'Delhi', isActive: true, sortOrder: 12 },
  ];

  for (const loc of targetLocations) {
    await locationsCol.updateOne(
      { name: loc.name },
      { $set: loc },
      { upsert: true }
    );
  }
  console.log('Seeded target locations for Ghaziabad and Delhi');

  // Keep only the two active hubs
  await franchisesCol.deleteMany({ code: { $nin: ['ROHINI-22', 'GZB-SIDDHARTH-VIHAR'] } });

  const allFranchises = await franchisesCol.find({}).toArray();
  console.log('Current Active Hubs in DB:', allFranchises.map(f => ({ code: f.code, name: f.name, city: f.city })));

  await mongoose.disconnect();
  console.log('Database sync complete');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
