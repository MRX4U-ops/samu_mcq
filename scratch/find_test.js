const fs = require('fs');
const file = fs.readFileSync('backend/src/data/anatomyData.js', 'utf8');
const pos = file.indexOf('"t-s-2-2-5"');
if (pos !== -1) {
  const sub = file.substring(pos, pos + 25000);
  const testPos = sub.indexOf('"test"');
  if (testPos !== -1) {
    const absoluteTestPos = pos + testPos;
    const beforeTest = file.substring(0, absoluteTestPos);
    const startLine = beforeTest.split('\n').length;
    console.log('Start line of test:', startLine);
    
    // find end of test array
    const testSub = file.substring(absoluteTestPos);
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = 0; i < testSub.length; i++) {
      if (testSub[i] === '[') bracketCount++;
      else if (testSub[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      const beforeEnd = file.substring(0, absoluteTestPos + endIdx + 1);
      const endLine = beforeEnd.split('\n').length;
      console.log('End line of test:', endLine);
      console.log('Snippet of start:', file.substring(absoluteTestPos, absoluteTestPos + 300));
      console.log('Snippet of end:', file.substring(absoluteTestPos + endIdx - 200, absoluteTestPos + endIdx + 1));
    }
  } else {
    console.log('test not found');
  }
} else {
  console.log('t-s-2-2-5 not found');
}
