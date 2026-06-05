const fs = require('fs');

const text = `1.	What is the primary function of enzymes in the body?
A) To catalyze biochemical reactions
B) To store genetic information
C) To provide structural support
D) To regulate gene expression
2.	What is an enzyme?
A) A protein that speeds up biochemical reactions
B) A lipid that stores energy
C) A carbohydrate that provides energy
D) A nucleic acid involved in protein synthesis
3.	Which of the following is an example of an enzyme classification based on its function?
A) Hydrolases
B) Carbohydrates
C) Lipids
D) Nucleic acids
4.	What is the main role of enzymes in metabolism?
A) They speed up chemical reactions without being consumed
B) They store energy for the cell
C) They regulate the cell cycle
D) They encode genetic information
5.	Which of the following enzyme types catalyze oxidation-reduction reactions?
A) Oxidoreductases
B) Transferases
C) Hydrolases
D) Ligases
6.	What is the role of enzymes in enzymodiagnostics?
A) They are used to detect specific biomarkers in diseases
B) They provide structural support to cells
C) They regulate gene expression in the body
D) They break down harmful substances in the blood
7.	How do enzymes lower the activation energy of a reaction?
A) By stabilizing the transition state of the reaction
B) By increasing the temperature of the reaction
C) By providing energy to the system
D) By changing the concentration of reactants
8.	What is enzymopathology?
A) The study of diseases caused by enzyme dysfunction
B) The classification of enzymes based on their structure
C) The process of synthesizing enzymes in the lab
D) The diagnostic use of enzymes to detect diseases
9.	Which of the following enzymes is involved in protein digestion?
A) Pepsin
B) Amylase
C) Lactase
D) Lipase
10.	Which factor affects the activity of enzymes?
A) Temperature
B) The molecular weight of the substrate
C) The concentration of the enzyme product
D) The color of the enzyme
11.	What is the significance of enzyme inhibition in medicine?
A) It can be used to treat diseases by blocking harmful enzyme activity
B) It speeds up the metabolic processes in the body
C) It increases the efficiency of protein synthesis
D) It helps in the formation of new cells
12.	What type of enzymes are involved in transferring functional groups?
A) Transferases
B) Hydrolases
C) Isomerases
D) Ligases
13.	How does enzyme therapy work?
A) By supplementing the body with specific enzymes to replace deficiencies
B) By inhibiting enzymes that cause diseases
C) By promoting the production of excess enzymes
D) By blocking enzymes to enhance drug effectiveness
14.	What is the effect of high temperature on enzyme activity?
A) It can denature the enzyme and reduce its activity
B) It increases the reaction rate
C) It stabilizes the enzyme structure
D) It speeds up enzyme production
15.	What is the role of coenzymes in enzyme activity?
A) They help enzymes catalyze reactions by transferring functional groups
B) They inhibit enzyme activity
C) They store energy for enzyme reactions
D) They act as substrates for enzymes
16.	Which of the following is a diagnostic enzyme used to detect liver damage?
A) Alanine aminotransferase (ALT)
B) Amylase
C) Lipase
D) Trypsin
17.	What is the mechanism of enzyme action?
A) Enzymes bind to substrates, forming an enzyme-substrate complex to catalyze reactions
B) Enzymes break down substrates into simpler molecules
C) Enzymes increase the energy of substrates
D) Enzymes release energy during the reaction
18.	Which of the following conditions can be caused by enzyme deficiencies?
A) Phenylketonuria
B) Hypertension
C) Asthma
D) Diabetes
19.	What is the role of hydrolases in the body?
A) They catalyze the breakdown of bonds by adding water molecules
B) They transfer phosphate groups between molecules
C) They form covalent bonds between substrates
D) They catalyze oxidation reactions
20.	Which of the following diseases is related to a deficiency in the enzyme lactase?
A) Lactose intolerance
B) Diabetes
C) Gout
D) Sickle cell anemia
21.	What is the function of isomerases?
A) They catalyze the conversion of one isomer into another
B) They transfer functional groups between molecules
C) They break down complex molecules into simpler ones
D) They add functional groups to substrates
22.	How can enzyme activity be measured in a laboratory?
A) By measuring the rate of substrate conversion to product
B) By measuring the temperature of the reaction
C) By analyzing the color of the enzyme
D) By counting the number of enzyme molecules
23.	Which of the following is a therapeutic use of enzyme inhibitors?
A) To treat infections by inhibiting bacterial enzymes
B) To increase the production of metabolic enzymes
C) To promote the synthesis of proteins
D) To enhance enzyme activity in the body
24.	What is the purpose of enzyme replacement therapy (ERT)?
A) To replace missing or deficient enzymes in the body
B) To increase the production of enzymes
C) To block harmful enzyme activity
D) To enhance enzyme secretion
25.	What is the primary structure of an enzyme?
A) The sequence of amino acids that form the enzyme
B) The three-dimensional shape of the enzyme
C) The number of substrate molecules it can bind
D) The energy it provides to a reaction`;

function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 23'));
  const questions = [];
  for (let i = 0; i < lines.length; i += 5) {
    const qText = lines[i];
    const options = [lines[i+1], lines[i+2], lines[i+3], lines[i+4]];
    questions.push({ question: qText, options: options });
  }
  return questions;
}

const filePath = 'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-9.js';
let fileContent = fs.readFileSync(filePath, 'utf8');
const dataStr = fileContent.replace('export const s_1_9 = ', '').replace(/;\s*$/, '');
const data = JSON.parse(dataStr);

data['t-s-1-9-22'] = parse(text);

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved Topic 23 of s-1-9.');
