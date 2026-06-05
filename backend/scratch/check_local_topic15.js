const fs = require('fs');
const path = require('path');
const content = fs.readFileSync('../mobile-app/src/data/repository/course2/s-2-10.js', 'utf8');
const cjs = content.replace('export const s_2_10 =', 'module.exports =');
const tempPath = path.resolve(__dirname, 'temp_check4.js');
fs.writeFileSync(tempPath, cjs, 'utf8');
const s_2_10 = require(tempPath);
console.log(JSON.stringify(s_2_10['t-s-2-10-15'], null, 2));
fs.unlinkSync(tempPath);
