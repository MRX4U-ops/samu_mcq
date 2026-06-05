const fs = require('fs');
const text = `What is a polyfunctional compound?
A compound that contains two or more functional groups
A compound with only one functional group
A compound that is purely inorganic
A compound that does not react with other substances
Which of the following is an example of a polyfunctional compound?
Acetaminophen
Methane
Sodium chloride
Carbon dioxide
What role do polyfunctional compounds play in medicine?
They serve as drugs and metabolites
They are used as solvents only
They act solely as preservatives
They are only used in food processing
Which of the following is a polyfunctional metabolite used in medicine?
Glutathione
Sodium chloride
Glucose
Water
Polyfunctional compounds are important in drug design because they:
Can interact with multiple targets
Have only one interaction site
Are completely inert
Can only interact with enzymes
What functional groups are commonly found in polyfunctional compounds?
Alcohol, amine, and carboxyl groups
Ester groups only
Hydrocarbon chains only
Halide groups only
What is a common use of polyfunctional compounds in medicine?
As therapeutic agents
As fertilizers
As flavor enhancers
As disinfectants
Which of the following polyfunctional compounds is used as an analgesic?
Acetaminophen
Sodium bicarbonate
Benzene
Methanol
How do polyfunctional compounds like antibiotics work in the body?
By targeting specific bacteria or fungi
By increasing blood pressure
By promoting sleep
By altering skin pigmentation
Which metabolic pathway involves polyfunctional compounds like ATP?
Cellular respiration
Photosynthesis
Glycolysis
Nitrogen fixation
Which polyfunctional compound is commonly used to treat bacterial infections?
Penicillin
Acetaminophen
Sodium chloride
Glucose
Polyfunctional compounds are important for the synthesis of:
Proteins and nucleic acids
Water
Oxygen
Carbon dioxide
Which of the following polyfunctional compounds is involved in the inflammatory response?
Prostaglandins
Hemoglobin
Collagen
Insulin
How do polyfunctional compounds act as antioxidants in medicine?
By neutralizing free radicals
By speeding up metabolism
By improving digestion
By increasing blood flow
Which of the following is a polyfunctional compound with anti-cancer properties?
Curcumin
Glucose
Urea
Sodium chloride
Polyfunctional compounds like steroids are used in medicine for:
Anti-inflammatory purposes
Enhancing taste
Increasing appetite
Controlling blood pressure
Which polyfunctional compound is known for its role in pain relief and inflammation reduction?
Aspirin
Methane
Sodium chloride
Glucose
How do polyfunctional metabolites affect the central nervous system?
By modulating neurotransmitter levels
By increasing blood sugar levels
By altering digestion processes
By improving skin elasticity
Which polyfunctional compound is involved in the regulation of blood sugar levels?
Insulin
Sodium chloride
Cortisol
Vitamin C
In what form do polyfunctional compounds typically exist when used as drugs?
As active pharmaceutical ingredients
As inactive metabolites
As water-soluble salts
As insoluble crystals
Which of the following is a polyfunctional compound that can be used to treat heart disease?
Nitroglycerin
Acetaminophen
Sodium bicarbonate
Magnesium sulfate
Polyfunctional compounds in metabolic pathways can act as:
Enzyme inhibitors or activators
Water carriers only
Energy sources exclusively
Structural components only
What is a key characteristic of polyfunctional compounds used in chemotherapy?
They target specific cancer cells
They act as general pain relievers
They provide nutrition to the body
They increase the growth of healthy cells
Which polyfunctional compound is involved in the body's response to stress?
Cortisol
Serotonin
Estrogen
Thyroxine
Polyfunctional compounds like antioxidants are often included in drugs to:
Prevent oxidative damage
Increase blood pressure
Promote digestion
Reduce appetite`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 12'));
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

data['t-s-1-9-11'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 12 of s-1-9.');
