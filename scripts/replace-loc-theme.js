const fs = require('fs');

const file = 'src/components/LocationSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content
  .replaceAll('bg-emerald-700 hover:bg-emerald-800', 'bg-brand-primary hover:bg-red-700')
  .replaceAll('bg-emerald-700', 'bg-brand-primary')
  .replaceAll('hover:bg-emerald-800', 'hover:bg-red-700')
  .replaceAll('text-emerald-700', 'text-brand-primary')
  .replaceAll('text-emerald-800', 'text-brand-primary')
  .replaceAll('text-emerald-900', 'text-brand-primary')
  .replaceAll('bg-emerald-50/70', 'bg-red-50/70')
  .replaceAll('bg-emerald-50/50', 'bg-red-50/50')
  .replaceAll('bg-emerald-50', 'bg-red-50')
  .replaceAll('bg-emerald-100/70', 'bg-red-100/70')
  .replaceAll('border-emerald-200', 'border-red-200')
  .replaceAll('border-emerald-600', 'border-brand-primary')
  .replaceAll('focus:border-emerald-600', 'focus:border-brand-primary')
  .replaceAll('focus:ring-emerald-600', 'focus:ring-red-100');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced emerald in LocationSelector.tsx');

