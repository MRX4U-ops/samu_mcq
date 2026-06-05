const fs = require('fs');

function swapTopics(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
  if (!match) return;
  
  let obj = eval('(' + match[2] + ')');
  
  if (obj["t-s-1-8-4"] && obj["t-s-1-8-6"]) {
    // Save topic 5 data
    const topic5Test = obj["t-s-1-8-4"].test;
    const topic5Sit = obj["t-s-1-8-4"].situational;
    
    // Save topic 7 data
    const topic7Test = obj["t-s-1-8-6"].test;
    const topic7Sit = obj["t-s-1-8-6"].situational;
    
    // Swap
    obj["t-s-1-8-4"].test = topic7Test;
    obj["t-s-1-8-4"].situational = topic7Sit;
    
    obj["t-s-1-8-6"].test = topic5Test;
    obj["t-s-1-8-6"].situational = topic5Sit;

    const jsonStr = JSON.stringify(obj, null, 2);
    const newContent = `export const ${match[1]} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Swapped Topic 5 and Topic 7 in " + filePath);
  } else {
    console.log("Missing topics in " + filePath);
  }
}

swapTopics('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
swapTopics('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
