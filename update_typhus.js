const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Notice the exact spacing and backslashes
  // Since we don't know the exact order of options from the previous parse (they might be in any order),
  // let's just use a regex to find the question and replace its options entirely.
  
  const regex = /"question": "Name the causative agent of epidemic typhus:",\s*"options": \[\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*"[^"]+"\s*\]/g;
  
  const replacement = `"question": "Name the causative agent of epidemic typhus:",
        "options": [
          "a. Village tick",
          "b. Clothes louse",
          "c. Rickettsia Provacek",
          "**\\\\*d. Obermeyer's spirochetes**"
        ]`;
        
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated " + filePath);
  } else {
    console.log("Could not find the target question in " + filePath);
  }
}

updateFile('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
updateFile('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
