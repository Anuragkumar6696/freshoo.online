const fs = require('fs');

const file = 'src/app/checkout/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content
  .replaceAll('bg-emerald-700 hover:bg-emerald-800', 'bg-brand-primary hover:bg-red-700')
  .replaceAll('bg-emerald-700', 'bg-brand-primary')
  .replaceAll('hover:bg-emerald-800', 'hover:bg-red-700')
  .replaceAll('text-emerald-700', 'text-brand-primary')
  .replaceAll('text-emerald-800', 'text-brand-primary')
  .replaceAll('text-emerald-950', 'text-stone-900')
  .replaceAll('bg-emerald-50/60', 'bg-red-50/60')
  .replaceAll('bg-emerald-50/40', 'bg-red-50/40')
  .replaceAll('bg-emerald-50/30', 'bg-red-50/30')
  .replaceAll('bg-emerald-50', 'bg-red-50')
  .replaceAll('bg-emerald-100', 'bg-red-100')
  .replaceAll('border-emerald-200', 'border-red-200')
  .replaceAll('border-emerald-300', 'border-red-300')
  .replaceAll('border-emerald-600', 'border-brand-primary')
  .replaceAll('border-emerald-700', 'border-brand-primary')
  .replaceAll('focus:border-emerald-600', 'focus:border-brand-primary')
  .replaceAll('shadow-emerald-700/20', 'shadow-red-700/20')
  .replaceAll('accent-emerald-700', 'accent-red-600');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced emerald in checkout/page.tsx');

