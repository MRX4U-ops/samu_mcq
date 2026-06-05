const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, 'student-web', 'src', 'data');
let fixedCount = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return;
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
  let match = content.match(/export const \w+\s*=\s*(\{[\s\S]+\});/);
  if (!match) return;
  
  let objText = match[1];
  let obj;
  try {
    obj = eval('(' + objText + ')');
  } catch (e) {
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
    const jsonStr = JSON.stringify(obj, null, 2);
    const varNameMatch = content.match(/export const (\w+)\s*=/);
    const varName = varNameMatch ? varNameMatch[1] : 'MCQ_DATA';
    
    const newContent = `export const ${varName} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedCount++;
  }
}

function fixQuestion(q, setModified) {
  if (q.options && q.options.length === 5) {
    let questionTextIndex = -1;
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      const isOption = /^[\*\s\\"'`\/]*[a-eA-E][\.\)\-]\s*/.test(opt);
      if (!isOption) {
        questionTextIndex = i;
      }
    }

    if (questionTextIndex !== -1) {
      let nonOptionCount = 0;
      let lastNonOptionIndex = -1;
      for (let i = 0; i < q.options.length; i++) {
         if (!/^[\*\s\\"'`\/]*[a-eA-E][\.\)\-]\s*/.test(q.options[i])) {
           nonOptionCount++;
           lastNonOptionIndex = i;
         }
      }

      if (nonOptionCount === 1) {
        const actualQuestionText = q.options[lastNonOptionIndex];
        q.question = actualQuestionText;
        q.options.splice(lastNonOptionIndex, 1);
        setModified();
      } else {
        if (/^Question\s+\d+/i.test(q.question)) {
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
