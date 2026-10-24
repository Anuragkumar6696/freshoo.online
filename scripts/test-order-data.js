const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const order = await mongoose.connection.collection('orders').findOne({ friendlyId: 'FRSH-940368' });
  console.log('Order loaded:', order.friendlyId, order.customerEmail, order.guestEmail);
  
  // Test address structure
  console.log('Address:', order.address);
  console.log('Geo:', order.geoLocation);
  console.log('Items:', order.items?.length);
  await mongoose.disconnect();
}
run().catch(console.error);

