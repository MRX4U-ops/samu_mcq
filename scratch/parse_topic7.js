const fs = require('fs');
const text = `What are the solutions that maintain the pH value without changing when a small amount of acid or base is added?
Buffers
Acids
Bases
Electrolytes
Buffer solutions may consist of:
A weak acid and its salt formed with a strong base
A strong acid and its salt formed with a weak base
A strong acid and its salt formed with another strong base
A weak acid and its salt formed with another weak acid
According to the mechanism of buffer action, when a small amount of strong acid or base is added:
A weaker electrolyte is formed from the initial electrolyte
A weak acid is formed
A weak base is formed
A strong acid and weak base salt is formed
The pH of buffer solutions is calculated based on the formula of which author?
Henderson-Hasselbalch
Guldberg-Vaage
Razumovsky
Gay-Lussac
The formula for calculating the pH of buffer solutions is derived from which law?
Law of mass action
Law of conservation of mass
Law of constant composition of chemical substances
Law of small numbers ratio
What is the unit of measurement for buffer capacity?
Milliequivalents
Grams
Milliliters
Liters
Which of the following buffer systems is not found in the human body?
Ammonia-based
Phosphate-based
Hemoglobin-based
Bicarbonate-based
What is the alkaline reserve of blood?
The amount of carbonic acid bound in the form of HCO₃⁻
The amount of strong acid in the blood
The amount of weak acid in the blood
The amount of neutralizing salts in the blood
What weak electrolyte is formed when hydrochloric acid is added to a phosphate buffer?
Dihydrogen phosphate ion (H₂PO₄⁻)
Phosphoric acid
Potassium phosphate
Sodium phosphate
Which indicator is commonly used in determining the buffer capacity of blood in acidic conditions?
Methyl orange
Phenolphthalein
Litmus
Methyl red
Which indicator is commonly used in determining the buffer capacity of blood in basic conditions?
Phenolphthalein
Litmus
Thymolphthalein
Methyl orange
In alkalosis, the pH of the body's organs shifts in which direction?
Increase in alkalinity
Formation of acid
Formation of products
Increase in acidity
In acidosis, the pH of the body's organs shifts in which direction?
Increase in acidity
Formation of acid
Formation of products
Increase in alkalinity
The buffer group that includes hemoglobin-based buffer systems is called:
Protein-based
Phosphate-based
Bicarbonate-based
Amino acid-based
Which buffer system has buffer capacity due to the bipolar nature of its molecules?
Amino acid-based
Bicarbonate-based
Phosphate-based
Protein-based
Which buffer solution keeps the pH constant in urine?
Phosphate-based
Oxyhemoglobin-based
Amino acid-based
Protein-based
What is the name of the limit for the amount of acid or base that can be added to a buffer without significantly changing its pH?
Buffer capacity
Buffer pH
Buffer concentration
Concentration of acid or base
Buffer capacity is calculated for which volume of buffer solution?
1 liter
10 liters
15 liters
5 liters
What is buffer capacity?
The number of moles of acid or base that must be added to 1 liter of buffer solution to change the pH by one unit
The specific amount of base needed to change the pH by two units
The amount of water needed to change the buffer system's concentration
The number of moles of acid needed to change the pH of 1 liter of buffer solution by 1 unit
If the pH = 3, what type of solution is this?
Strong acid
Strong base
Weak base
Weak acid
Choose the carbonate buffer solution:
Na₂CO₃ and NaHCO₃
NH₄Cl and NH₃
HCOOH and CH₃COONa
CH₃COOH and CH₃COONa
Choose the ammonia buffer solution:
NH₄Cl and NH₃
Na₂CO₃ and NaHCO₃
HCOOH and CH₃COONa
CH₃COOH and CH₃COONa
Choose the acetate buffer solution:
CH₃COOH and CH₃COONa
Na₂CO₃ and NaHCO₃
NH₄Cl and NH₃
HCOOH and CH₃COONa
Choose the acidic buffer solution:
CH₃COOH and CH₃COONa
HCOONa and CH₃COONa
Na₂SO₄ and NaHCO₃
NH₄Cl and NH₃
Choose the basic buffer solution:
NH₄Cl and NH₃
CH₃COOH and CH₃COONa
HCOONa and CH₃COONa
Na₂SO₄ and NaHCO₃`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 7'));
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

data['t-s-1-9-6'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 7 of s-1-9.');
