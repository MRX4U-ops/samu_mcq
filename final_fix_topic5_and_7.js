const fs = require('fs');
const path = require('path');
const { MCQ_REPOSITORY } = require('./mobile-app/src/data/repository/index.js');

// Read original topic 5
const orig5 = JSON.parse(fs.readFileSync('original_topic5.json', 'utf8'));

// Topic 5 was overwritten, so restore it entirely
MCQ_REPOSITORY['s-1-8']['t-s-1-8-4'] = orig5;

// Read user's questions from update_topic_5.js
const topic7Str = fs.readFileSync('update_topic_5.js', 'utf8');
const match = topic7Str.match(/const topic5TestStr = `([\s\S]*?)`;/);
if (match) {
  const testQsStr = match[1];
  
  function parseQuestions(text) {
    const blocks = text.split(/Question\s*\d+\s*/i).filter(b => b.trim());
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      const question = lines[0];
      const options = lines.slice(1);
      return { question, options };
    });
  }
  
  // Topic 7 should get these new test questions (and keep its situational questions if any)
  MCQ_REPOSITORY['s-1-8']['t-s-1-8-6'].test = parseQuestions(testQsStr);
}

// Ensure the fix is also written to student-web
const mobilePath = path.join('mobile-app', 'src', 'data', 'repository', 'course1', 's-1-8.js');
const webPath = path.join('student-web', 'src', 'data', 'course1', 's-1-8.js');

const jsContent = 'export const s_1_8 = ' + JSON.stringify(MCQ_REPOSITORY['s-1-8'], null, 2) + ';\n';
fs.writeFileSync(mobilePath, jsContent);
fs.writeFileSync(webPath, jsContent);

console.log('Fixed Topic 5 and Topic 7 in both web and mobile-app');
