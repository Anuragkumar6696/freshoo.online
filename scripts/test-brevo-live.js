const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orderDoc = await mongoose.connection.collection('orders').findOne({ friendlyId: 'FRSH-940368' });
  orderDoc.id = orderDoc.friendlyId;
  
  // Test Brevo direct payload
  const apiKey = process.env.BREVO_API_KEY;
  console.log('Sending test customer confirmation for FRSH-940368 to freshoo.online@gmail.com');
  
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'freshoo', email: 'freshoo.online@gmail.com' },
      to: [{ email: 'freshoo.online@gmail.com', name: 'Customer Test' }],
      subject: `🧾 Order Confirmed ${orderDoc.id} • Freshoo`,
      htmlContent: `<p>Test customer order confirmation for ${orderDoc.id}</p>`
    })
  });
  console.log('Brevo customer send status:', res.status);
  const text = await res.text();
  console.log('Brevo response:', text);
  await mongoose.disconnect();
}
test().catch(console.error);

