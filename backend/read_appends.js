const fs = require('fs');

['append_topics.js', 'append_topics_2.js', 'append_topics_3.js'].forEach(file => {
  const path = `c:\\samu_mcq\\${file}`;
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    console.log(`=== File: ${file} (Size: ${content.length}) ===`);
    console.log(content.substring(0, 1000) + '...\n');
  }
});
