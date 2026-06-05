const fs = require('fs');
try {
  const content = fs.readFileSync('c:\\samu_mcq\\mobile-app\\results.txt', 'utf16le');
  console.log('results.txt UTF-16LE length:', content.length);
  console.log('First 1000 characters:');
  console.log(content.slice(0, 1000));
  console.log('Last 1000 characters:');
  console.log(content.slice(-1000));
} catch (e) {
  console.log('Error reading results.txt:', e.message);
}
