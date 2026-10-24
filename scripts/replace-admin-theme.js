const fs = require('fs');

const file = 'src/app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content
  .replaceAll('bg-emerald-700 hover:bg-emerald-800', 'bg-brand-primary hover:bg-red-700')
  .replaceAll('bg-emerald-700', 'bg-brand-primary')
  .replaceAll('hover:bg-emerald-800', 'hover:bg-red-700')
  .replaceAll('text-emerald-700', 'text-brand-primary')
  .replaceAll('text-emerald-800', 'text-brand-primary')
  .replaceAll('text-emerald-900', 'text-brand-primary')
  .replaceAll('bg-emerald-100', 'bg-red-50')
  .replaceAll('bg-emerald-50/50', 'bg-red-50/50')
  .replaceAll('bg-emerald-50', 'bg-red-50')
  .replaceAll('border-emerald-300', 'border-red-200')
  .replaceAll('border-emerald-200', 'border-red-200')
  .replaceAll('border-emerald-100', 'border-red-100')
  .replaceAll('focus:border-emerald-700', 'focus:border-brand-primary')
  .replaceAll('accent-emerald-700', 'accent-red-600');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced emerald in admin/page.tsx');

