const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const testOrder = {
  friendlyId: 'FRSH-831893',
  date: '23 Oct 2026, 11:42 PM',
  customerName: 'Anurag Kumar',
  customerPhone: '7481820136',
  customerEmail: 'anuragkumarmait@gmail.com',
  isGuestOrder: true,
  items: [
    { product: { name: 'Chicken Curry Cut' }, selectedWeight: '500g', quantity: 1, price: 199 }
  ],
  subtotal: 199,
  discount: 0,
  deliveryFee: 0,
  total: 199,
  paymentMethod: 'COD',
  paymentStatus: 'Pending',
  status: 'Order Received',
  address: { tag: 'Home', addressLine: 'prateek grand city 2007', city: 'Delhi', pincode: '291087' },
  geoLocation: { latitude: 28.6476, longitude: 77.4033, accuracy: 98 }
};

const rows = [
  {
    'Order ID': testOrder.friendlyId,
    'Date & Time': testOrder.date,
    'Customer Name': testOrder.customerName,
    'Phone': testOrder.customerPhone,
    'Email': testOrder.customerEmail,
    'Customer Type': testOrder.isGuestOrder ? 'Guest' : 'Registered',
    'Items Summary': 'Chicken Curry Cut (500g × 1)',
    'Total Items': 1,
    'Subtotal (₹)': 199,
    'Discount (₹)': 0,
    'Delivery Fee (₹)': 0,
    'Total Amount (₹)': 199,
    'Payment Method': 'COD',
    'Payment Status': 'Pending',
    'Order Status': 'Order Received',
    'Address Line': testOrder.address.addressLine,
    'City': testOrder.address.city,
    'Pincode': testOrder.address.pincode,
    'GPS Latitude': testOrder.geoLocation.latitude,
    'GPS Longitude': testOrder.geoLocation.longitude,
    'Google Maps Navigation': `https://www.google.com/maps/dir/?api=1&destination=${testOrder.geoLocation.latitude},${testOrder.geoLocation.longitude}`,
    'Customer WhatsApp': `https://wa.me/91${testOrder.customerPhone}`
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, 'Orders');
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
console.log('Generated Excel buffer bytes:', buf.length);

