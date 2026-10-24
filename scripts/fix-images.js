const mongoose = require('mongoose');

async function fixImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = mongoose.connection.collection('products');
  
  // Fix Mutton
  const muttonRes = await products.updateMany(
    { category: { $regex: /mutton/i } },
    { $set: { image: '/mutton-fresh.png' } }
  );
  console.log('Mutton updated:', muttonRes.modifiedCount);

  // Fix Fish if it points to chicken1.png
  const fishRes = await products.updateMany(
    { category: { $regex: /fish/i }, image: '/chicken1.png' },
    { $set: { image: '/fish.png' } }
  );
  console.log('Fish updated:', fishRes.modifiedCount);

  const all = await products.find({}).toArray();
  console.log('Products after update:', all.map(p => ({ name: p.name, category: p.category, image: p.image })));
  await mongoose.disconnect();
}

fixImages().catch(console.error);

