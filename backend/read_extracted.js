const fs = require('fs');

const path = 'c:\\samu_mcq\\mobile-app\\src\\data\\extracted_from_logs.json';
if (!fs.existsSync(path)) {
  console.log('extracted_from_logs.json does not exist');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('All keys:', Object.keys(data));

Object.keys(data).forEach(key => {
  const item = data[key];
  console.log(`Key ${key}: type=${typeof item}, length=${Array.isArray(item) ? item.length : 'N/A'}`);
  if (Array.isArray(item) && item.length > 0) {
    console.log('  First item:', item[0]);
  } else if (item) {
    console.log('  Value preview:', JSON.stringify(item).substring(0, 200));
  }
});
