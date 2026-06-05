const fs = require('fs');

const topic4TestStr = fs.readFileSync('c:/samu_mcq/update_topic_4.js', 'utf8').match(/const rawText = `([\s\S]+?)`;/)[1];
const topic5TestStr = fs.readFileSync('c:/samu_mcq/update_topic_5.js', 'utf8').match(/const rawText = `([\s\S]+?)`;/)[1];
const topic6TestStr = fs.readFileSync('c:/samu_mcq/update_topic_6.js', 'utf8').match(/const rawText = `([\s\S]+?)`;/)[1];
const situationalStr = fs.readFileSync('c:/samu_mcq/update_situational.js', 'utf8');
const topic4SitStr = situationalStr.match(/const rawTextTopic4 = `([\s\S]+?)`;/)[1];
const topic6SitStr = situationalStr.match(/const rawTextTopic6 = `([\s\S]+?)`;/)[1];

function parseBlocks(rawText, isQFormat) {
  const regex = isQFormat ? /(?:Q\d+\.|Question\s+\d+\.)\s+/ : /Question\s+\d+/;
  const blocks = rawText.split(regex).filter(b => b.trim());
  const questions = [];
  blocks.forEach(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 5) return;
    questions.push({ question: lines[0], options: lines.slice(1) });
  });
  return questions;
}

const topic4Test = parseBlocks(topic4TestStr, true);
const topic5Test = parseBlocks(topic5TestStr, false);
const topic6Test = parseBlocks(topic6TestStr, true);

const topic4Sit = parseBlocks(topic4SitStr, true);
const topic6Sit = parseBlocks(topic6SitStr, true);

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
  if (!match) return;
  
  let obj = eval('(' + match[2] + ')');
  
  if (obj["t-s-1-8-3"]) {
    obj["t-s-1-8-3"].test = topic4Test;
    obj["t-s-1-8-3"].situational = topic4Sit;
  }
  if (obj["t-s-1-8-4"]) {
    obj["t-s-1-8-4"].test = topic5Test;
    // topic 5 situational wasn't requested
  }
  if (obj["t-s-1-8-5"]) {
    obj["t-s-1-8-5"].test = topic6Test;
    obj["t-s-1-8-5"].situational = topic6Sit;
  }

  const jsonStr = JSON.stringify(obj, null, 2);
  const newContent = `export const ${match[1]} = ${jsonStr};\n`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Updated " + filePath);
}

updateFile('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
updateFile('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
