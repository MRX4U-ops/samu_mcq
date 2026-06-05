const fs = require('fs');

const path = 'c:\\samu_mcq\\mobile-app\\src\\data\\recovered_topics.json';
if (!fs.existsSync(path)) {
  console.log('recovered_topics.json does not exist');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('Keys in recovered_topics:', Object.keys(data));

// Print the first few keys and a sample
const keys = Object.keys(data);
console.log('Sample keys:');
keys.slice(0, 10).forEach(k => {
  console.log(`  ${k}: ${Array.isArray(data[k]) ? data[k].length + ' questions' : typeof data[k]}`);
});

// Search for any microbiology keywords in the keys or question text
let found = 0;
for (const k of keys) {
  const qs = data[k];
  if (Array.isArray(qs)) {
    qs.forEach((q, idx) => {
      const txt = JSON.stringify(q).toLowerCase();
      if (txt.includes('nocardia') || txt.includes('lophotrichous') || txt.includes('sulfuric acid')) {
        console.log(`[MATCH] Found in key "${k}" at index ${idx}:`);
        console.log(q);
        found++;
      }
    });
  }
}
console.log(`Search completed. Found ${found} matches.`);
