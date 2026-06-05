const fs = require('fs');
const path = require('path');

const dir = 'c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course1';

if (fs.existsSync(dir)) {
  const list = fs.readdirSync(dir);
  console.log(`Found ${list.length} files in course1 repository:`);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    console.log(`- ${file} (Size: ${stat.size} bytes, Modified: ${stat.mtime})`);
  });
} else {
  console.log('course1 directory does not exist');
}
