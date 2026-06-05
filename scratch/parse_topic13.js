const fs = require('fs');
const text = `1.	What are heterofunctional compounds used for in medicine?
The synthesis of drugs and metabolites
The production of food additives
The creation of plastic materials
The manufacturing of synthetic fibers
2.	Which of the following is an example of a heterofunctional compound used as a medicinal agent?
Penicillin
Sodium chloride
Water
Glucose
3.	How do heterofunctional compounds interact in the body?
They serve as therapeutic agents and interact with biological targets
They provide energy to cells only
They function solely as preservatives
They neutralize acidic substances
4.	What role do heterofunctional compounds play in drug development?
They allow for targeting multiple disease mechanisms
They are used exclusively for diagnostic purposes
They are used only in the preparation of vaccines
They serve as food preservatives
5.	What type of functional groups are typically present in heterofunctional compounds?
Alcohol, amine, and carboxyl groups
Only ester groups
Hydrocarbon chains
Halide groups
6.	Which heterofunctional compound is commonly used as an antibiotic?
Amoxicillin
Methane
Sodium chloride
Water
7.	How do heterofunctional compounds contribute to metabolism?
They act as intermediates in metabolic pathways
They serve only as storage molecules
They increase the energy required for cellular processes
They act as DNA builders
8.	What is the significance of heterofunctional compounds in the synthesis of medicines?
They enhance the specificity and efficiency of drug interactions
They only increase the shelf-life of drugs
They act as preservatives without any other medicinal value
They function as carriers in drug delivery
9.	Which heterofunctional compound is involved in anti-inflammatory action?
Aspirin
Caffeine
Chlorine
Sodium chloride
10.	How do heterofunctional compounds influence disease treatment?
They target specific molecular pathways in the body
They simply neutralize the presence of pathogens
They provide a source of energy for infected cells
They increase the acidity of tissues
11.	Heterofunctional compounds are primarily used in medicine for:
Treating various diseases
Increasing metabolic rate
Enhancing digestive functions
Promoting hair growth
12.	Which class of drugs includes heterofunctional compounds?
Antibiotics
Vitamins
Minerals
Enzymes
13.	Which heterofunctional compound is used in the treatment of bacterial infections?
Penicillin
Insulin
Glucose
Caffeine
14.	What is the primary use of heterofunctional compounds like aspirin?
Pain relief and anti-inflammatory purposes
Improving digestive health
Improving hair growth
Increasing muscle mass
15.	Heterofunctional compounds are important because they:
Can interact with multiple biological targets
Serve as food preservatives
Are used in genetic engineering
Enhance the shelf life of non-pharmaceutical products
16.	How are heterofunctional compounds metabolized in the body?
Through enzymatic processes
Through simple absorption
By passive diffusion only
Without any alteration in the body
17.	Which heterofunctional compound is known for its role in treating hypertension?
ACE inhibitors
Sodium chloride
Glucose
Chlorophyll
18.	What makes heterofunctional compounds versatile in drug design?
Their ability to bind to various receptors
Their sole role in preserving drugs
Their function in increasing drug solubility
Their involvement in food processing only
19.	Heterofunctional compounds in medicine may act as:
Antioxidants or anti-inflammatory agents
Water carriers only
Energy storage molecules only
Structural components only
20.	Which of the following is a heterofunctional compound used to treat pain?
Ibuprofen
Glucose
Water
Sodium chloride
21.	How do heterofunctional compounds contribute to pharmaceutical formulations?
They enhance drug bioavailability
They only act as inactive carriers
They serve as colorants for tablets
They work to increase drug resistance
22.	What is a primary benefit of using heterofunctional compounds in drug development?
Their ability to address multiple drug targets
Their potential to serve as preservatives
Their ability to improve flavor
Their role in altering drug color
23.	Which of the following is an important characteristic of heterofunctional compounds in drug development?
Their ability to undergo functional transformations
Their inertness in the body
Their incompatibility with other drugs
Their limited interaction with biological systems
24.	In the context of drug design, heterofunctional compounds are:
Key for optimizing drug efficacy
Used solely for aesthetic purposes
Involved in increasing the toxicity of drugs
Not used in modern pharmacology
25.	Heterofunctional compounds are critical in:
Designing drugs that target specific biological processes
Creating preservatives for food storage
Developing non-pharmaceutical products
Enhancing flavor in food products`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 13'));
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

data['t-s-1-9-12'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 13 of s-1-9.');
