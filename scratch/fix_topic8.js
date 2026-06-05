const fs = require('fs');

const topic8 = JSON.parse(fs.readFileSync('c:/samu_mcq/scratch/topic8.json', 'utf8'));

topic8[0].options = ["A compound formed when a central atom bonds with ligands through coordinate covalent bonds", "A substance formed by simple covalent bonds", "A mixture of ionic substances"];
topic8[0].correctIndex = 0;
topic8[1].correctIndex = 1;
topic8[2].options = ["Complexes formed when ligands with multiple bonding sites bind to a metal ion to form a ring", "Compounds formed by ionic bonds", "Mixtures of simple salts"];
topic8[2].correctIndex = 0;
topic8[3].correctIndex = 1;
topic8[4].correctIndex = 2;
topic8[5].correctIndex = 0;
topic8[6].correctIndex = 1;
topic8[7].correctIndex = 0;
topic8[8].correctIndex = 0;
topic8[9].correctIndex = 1;
topic8[10].correctIndex = 2;
topic8[11].correctIndex = 0;
topic8[12].correctIndex = 2;
topic8[13].correctIndex = 0;
topic8[14].correctIndex = 2;
topic8[15].correctIndex = 0;
topic8[16].correctIndex = 1;
topic8[17].correctIndex = 2;
topic8[18].correctIndex = 0;
topic8[19].correctIndex = 1;
topic8[20].correctIndex = 0;
topic8[21].correctIndex = 1;
topic8[22].correctIndex = 2;
topic8[23].correctIndex = 2;
topic8[24].correctIndex = 2;

for (let q of topic8) {
  q.explanation = "The correct answer is '" + q.options[q.correctIndex] + "'. This choice aligns with the established clinical curriculum.";
}

const fileContent = fs.readFileSync('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-10.js', 'utf8');

let objStr = fileContent.replace('export const s_1_10 = ', '');
let s_1_10;
eval('s_1_10 = ' + objStr);

s_1_10['t-s-1-10-7'] = topic8;

const newFileContent = 'export const s_1_10 = ' + JSON.stringify(s_1_10, null, 2) + ';\n';
fs.writeFileSync('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-10.js', newFileContent, 'utf8');
console.log('Fixed Topic 8 questions in s-1-10.js');
