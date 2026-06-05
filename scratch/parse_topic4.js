const fs = require('fs');
const text = `What is the purpose of titration?
To determine the concentration of an unknown solution
To mix two solutions
To change the color of the solution
To increase the temperature of the solution
What is the solution of known concentration called in a titration?
Standard solution
Unknown solution
Neutral solution
Buffer solution
The substance that changes color at the equivalence point is called:
Indicator
Titrant
Analyte
Buffer
Which type of reaction is most commonly used in titration?
Neutralization
Combustion
Precipitation
Decomposition
The point at which the reaction is complete is called the:
Equivalence point
Starting point
Buffer point
Dissociation point
Which piece of equipment is used to deliver the titrant in a titration?
Burette
Pipette
Beaker
Funnel
The volume of titrant added to reach the equivalence point is measured using a:
Burette
Flask
Test tube
Pipette
What is the pH at the equivalence point in a strong acid-strong base titration?
7
Less than 7
Greater than 7
Depends on the indicator
Which indicator is commonly used for acid-base titrations?
Phenolphthalein
Methylene blue
Potassium permanganate
Bromine
What is the shape of the titration curve for a strong acid and strong base titration?
S-shaped
Straight line
Circular
Parabolic
In a titration, the analyte is:
The solution with an unknown concentration
The solution with a known concentration
The indicator used
The final product
What is a primary standard?
(a) A substance of high purity used to standardize a solution
b) A mixture of different compounds
c) A solution with a pH of 7
d) A weak acid used in titrations
Which titration involves the use of potassium permanganate?
(a) Redox titration
b) Acid-base titration
c) Complexometric titration
d) Precipitation titration
What is the color change of phenolphthalein in a basic solution?
(a) Pink
b) Colorless
c) Yellow
d) Blue
In a weak acid-strong base titration, the pH at equivalence is:
(a) Greater than 7
b) Less than 7
c) Equal to 7
d) Depends on the acid
Which titration method is used to determine water hardness?
(a) Complexometric titration
b) Redox titration
c) Acid-base titration
d) Precipitation titration
The substance being added during titration is called the:
(a) Titrant
b) Analyte
c) Indicator
d) Buffer
A volumetric flask is used to:
(a) Prepare a standard solution
b) Add titrant to the analyte
c) Measure the final volume of the solution
d) Mix the solutions
What is the function of a pipette in titration?
(a) To measure a specific volume of analyte
b) To deliver titrant to the solution
c) To mix the solution
d) To act as an indicator
Which titration involves EDTA as the titrant?
(a) Complexometric titration
b) Acid-base titration
c) Redox titration
d) Precipitation titration
In titration, an endpoint is:
(a) The point where the indicator changes color
b) The point where the reaction starts
c) The point of maximum pH
d) The halfway point of the reaction
Which is NOT required for titration?
(a) Filter paper
b) Indicator
c) Burette
d) Pipette
Which type of titration uses iodine?
(a) Redox titration
b) Acid-base titration
c) Precipitation titration
d) Complexometric titration
The molarity of the solution can be calculated using the formula:
(a) M₁V₁ = M₂V₂
b) PV = nRT
c) M = m × V
d) ΔT = Kb × m
Which titration method is used for the estimation of chloride ions?
(a) Precipitation titration
b) Acid-base titration
c) Complexometric titration
d) Redox titration`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 4'));
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

data['t-s-1-9-3'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 4 of s-1-9.');
