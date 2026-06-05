const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, 'mobile-app', 'src', 'data', 'repository');
let fixedCount = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') && file !== 'index.js') {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to find question blocks. 
  // We look for {"question": "Question X", "options": [ ... ] }
  // We can just parse the file if we strip the export and then write it back
  
  // The file format is: export const something = { ... };
  let match = content.match(/export const \w+\s*=\s*(\{[\s\S]+\});/);
  if (!match) return;
  
  let objText = match[1];
  let obj;
  try {
    // We can evaluate it safely since we know it's our own static data
    obj = eval('(' + objText + ')');
  } catch (e) {
    console.error("Eval failed for " + filePath);
    return;
  }
  
  let modified = false;

  for (const topicKey in obj) {
    const topic = obj[topicKey];
    if (topic.test && Array.isArray(topic.test)) {
      topic.test.forEach(q => fixQuestion(q, () => modified = true));
    }
    if (topic.situational && Array.isArray(topic.situational)) {
      topic.situational.forEach(q => fixQuestion(q, () => modified = true));
    }
  }

  if (modified) {
    // serialize back
    const jsonStr = JSON.stringify(obj, null, 2);
    const varNameMatch = content.match(/export const (\w+)\s*=/);
    const varName = varNameMatch ? varNameMatch[1] : 'MCQ_DATA';
    
    const newContent = `export const ${varName} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedCount++;
  }
}

function fixQuestion(q, setModified) {
  // If we have exactly 5 options, one of them might be the actual question text
  if (q.options && q.options.length === 5) {
    // Find the option that does not have an option prefix
    let questionTextIndex = -1;
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      // Does it look like an option?
      // Options typically start with A., B., a), b), etc., or **\*a.
      const isOption = /^[\*\s\\"'`\/]*[a-eA-E][\.\)\-]\s*/.test(opt);
      if (!isOption) {
        questionTextIndex = i;
      }
    }

    if (questionTextIndex !== -1) {
      // We found exactly one that doesn't look like an option, or the last one we found
      // Let's make sure it's actually just one
      let nonOptionCount = 0;
      let lastNonOptionIndex = -1;
      for (let i = 0; i < q.options.length; i++) {
         if (!/^[\*\s\\"'`\/]*[a-eA-E][\.\)\-]\s*/.test(q.options[i])) {
           nonOptionCount++;
           lastNonOptionIndex = i;
         }
      }

      if (nonOptionCount === 1) {
        // Safe to replace
        const actualQuestionText = q.options[lastNonOptionIndex];
        q.question = actualQuestionText;
        q.options.splice(lastNonOptionIndex, 1);
        setModified();
      } else {
        // If there are multiple, maybe the options didn't have letters?
        // Let's check if the generic question matches "Question \d+"
        if (/^Question\s+\d+/i.test(q.question)) {
          // It's definitely a generic question, let's just pick the longest option as the question
          let maxLen = 0;
          let maxIdx = -1;
          for (let i = 0; i < q.options.length; i++) {
            if (q.options[i].length > maxLen) {
              maxLen = q.options[i].length;
              maxIdx = i;
            }
          }
          if (maxIdx !== -1) {
            q.question = q.options[maxIdx];
            q.options.splice(maxIdx, 1);
            setModified();
          }
        }
      }
    }
  }
}

walk(repoDir);
console.log("Fixed files: " + fixedCount);
