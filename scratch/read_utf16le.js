const fs = require('fs');
try {
  const content = fs.readFileSync('c:\\samu_mcq\\scratch\\user_input.json', 'utf16le');
  console.log('UTF-16LE Content length:', content.length);
  console.log('Content preview:', content.slice(0, 500));
} catch (e) {
  console.log('Error reading as UTF-16LE:', e.message);
  try {
    const contentUtf8 = fs.readFileSync('c:\\samu_mcq\\scratch\\user_input.json', 'utf8');
    console.log('UTF-8 Content length:', contentUtf8.length);
    console.log('Content preview:', contentUtf8.slice(0, 500));
  } catch (err) {
    console.log('Error reading as UTF-8:', err.message);
  }
}
