const fs = require('fs');
const text = `Iodometry involves the titration of:
Free iodine
Potassium permanganate
EDTA
Silver nitrate
Which indicator is commonly used in iodometry?
Starch
Phenolphthalein
Methylene blue
Eriochrome Black T
Iodometry is often used to estimate the concentration of:
Oxidizing agents
Reducing agents
Acids
Bases
In iodometry, iodine is titrated with:
Sodium thiosulfate
Potassium permanganate
EDTA
Silver nitrate
The end point in iodometry is indicated by the disappearance of:
Blue color of starch-iodine complex
Pink color of phenolphthalein
Red color of methyl orange
Yellow color of iodine
In permanganometry, the titrant is:
Potassium permanganate
Sodium thiosulfate
EDTA
Hydrochloric acid
What is the color change at the end point in permanganometry?
Colorless to pink
Pink to colorless
Yellow to blue
Blue to yellow
Permanganometry is based on:
Redox reactions
Neutralization reactions
Precipitation reactions
Complexation reactions
Which acid is commonly used in permanganometry?
Sulfuric acid
Hydrochloric acid
Nitric acid
Acetic acid
Permanganometry is commonly used to determine the concentration of:
Reducing agents
Oxidizing agents
Acids
Bases
Complexometric titrations involve the formation of:
Stable complexes
Precipitates
Neutral salts
Gases
Which reagent is used as a titrant in complexometric titrations?
EDTA
Potassium permanganate
Sodium thiosulfate
Hydrochloric acid
Complexometric titration is commonly used to determine:
Metal ions
Acids
Reducing agents
Gases
What is the most commonly used indicator in complexometric titration?
Eriochrome Black T
Starch
Phenolphthalein
Methyl orange
Which type of titration is used to determine water hardness?
Complexometric titration
Permanganometry
Iodometry
Precipitation titration
Precipitation titration involves the formation of:
Insoluble precipitates
Complexes
Neutral salts
Redox products
Which reagent is commonly used in precipitation titrations?
Silver nitrate
Potassium permanganate
EDTA
Sodium thiosulfate
Which indicator is used in the Mohr method of precipitation titration?
Potassium chromate
Starch
Phenolphthalein
Methylene blue
The Mohr method is used to determine:
Chloride ions
Acids
Bases
Reducing agents
What is the end point in the Volhard method of precipitation titration?
Formation of a red complex
Appearance of a pink color
Disappearance of the blue color
Formation of a white precipitate
Iodometry is often classified as a type of:
Redox titration
Neutralization titration
Precipitation titration
Complexometric titration
Permanganometry is particularly useful for analyzing:
Iron and oxalates
Acids and bases
Salts and gases
Water hardness
Complexometric titrations are commonly carried out in:
Slightly basic medium
Strongly acidic medium
Neutral medium
Strongly basic medium
The Volhard method is a type of:
Precipitation titration
Neutralization titration
Redox titration
Complexometric titration
Precipitation titrations are useful for determining the concentration of:
Halide ions
Metal ions
Acids
Bases`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 5'));
const questions = [];
for (let i = 0; i < lines.length; i += 5) {
  const qText = lines[i];
  const options = [lines[i+1], lines[i+2], lines[i+3], lines[i+4]];
  questions.push({ question: qText, options: options });
}

const filePath = 'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-9.js';
let fileContent = fs.readFileSync(filePath, 'utf8');
const dataStr = fileContent.replace('export const s_1_9 = ', '').replace(/;\s*$/, '');
const data = JSON.parse(dataStr);

data['t-s-1-9-4'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 5 of s-1-9.');
