const fs = require('fs');
try {
  const content = fs.readFileSync('c:\\samu_mcq\\backend\\full_clipboard_history.txt', 'utf8');
  console.log('Clipboard history length:', content.length);
  console.log('Contains Qaydnoma:', content.includes('Qaydnoma'));
  console.log('Contains Biochemistry:', content.includes('Biochemistry'));
  console.log('Contains Tests in English:', content.includes('Tests in English'));
  console.log('Contains ifa2024:', content.includes('ifa2024'));
  console.log('First 500 characters:');
  console.log(content.slice(0, 500));
} catch (e) {
  console.log('Error reading clipboard history:', e.message);
}
