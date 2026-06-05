const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const starIndices = [];
lines.forEach((line, index) => {
  if (line.startsWith('*') || line.match(/^[A-D]\*/i)) {
    starIndices.push(index);
  }
});

function solve(j, lastOptEnd) {
  if (j === starIndices.length) {
    return [];
  }
  const starIdx = starIndices[j];
  
  for (let startOpt = starIdx - 3; startOpt <= starIdx; startOpt++) {
    if (startOpt <= lastOptEnd) continue;
    if (startOpt + 3 >= lines.length) continue;
    
    let starCount = 0;
    for (let k = startOpt; k <= startOpt + 3; k++) {
      if (lines[k].startsWith('*') || lines[k].match(/^[A-D]\*/i)) {
        starCount++;
      }
    }
    if (starCount !== 1) continue;
    
    if (startOpt - 1 < lastOptEnd + 1) continue;
    
    const nextResult = solve(j + 1, startOpt + 3);
    if (nextResult !== null) {
      return [{
        questionLines: lines.slice(lastOptEnd + 1, startOpt),
        optionLines: lines.slice(startOpt, startOpt + 4),
        starIdx: starIdx,
        j: j,
        startOpt: startOpt
      }, ...nextResult];
    }
  }
  return null;
}

const result = solve(0, -1);
const q266 = result.find(q => q.questionLines.join(' ').includes('back pain'));
console.log(JSON.stringify(q266, null, 2));
