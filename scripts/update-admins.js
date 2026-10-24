const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const targetEmails = [
    'officialanurag6696@gmail.com',
    'anuragkumarmait@gmail.com',
    'freshoo.online@gmail.com',
    'admin@freshoo.in'
  ];

  const res = await mongoose.connection.collection('users').updateMany(
    { email: { $in: targetEmails } },
    { $set: { isAdmin: true, role: 'ADMIN' } }
  );
  console.log('Updated user records to ADMIN:', res.modifiedCount);

  const admins = await mongoose.connection.collection('users').find(
    { isAdmin: true },
    { projection: { name: 1, email: 1, phone: 1, isAdmin: 1, role: 1 } }
  ).toArray();
  console.log('Confirmed Admins in MongoDB:', JSON.stringify(admins, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);

