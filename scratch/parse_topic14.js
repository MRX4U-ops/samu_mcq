const fs = require('fs');
const text = `•  What is an aromatic heterofunctional compound?
A) A compound containing an aromatic ring and multiple functional groups
B) A compound containing only an aromatic ring
C) A compound containing only one functional group
D) A compound containing no functional groups
•  Which of the following is an example of an aromatic heterofunctional compound?
A) Paracetamol
B) Methane
C) Sodium chloride
D) Glucose
•  Why are aromatic heterofunctional compounds significant in medicine?
A) They serve as active pharmaceutical ingredients
B) They act as inert substances
C) They are used only as preservatives
D) They are primarily used as flavoring agents
•  What is the key feature of aromatic heterofunctional compounds in drug design?
A) Their ability to interact with multiple biological targets
B) Their lack of reactivity
C) Their exclusivity to non-biological systems
D) Their inability to dissolve in water
•  Which aromatic heterofunctional compound is used as an analgesic?
A) Aspirin
B) Sodium bicarbonate
C) Benzene
D) Methanol
•  How do aromatic heterofunctional compounds act in the body?
A) By binding to specific enzymes and receptors
B) By acting as energy storage molecules
C) By forming structural components only
D) By remaining inert
•  Which functional groups are commonly present in aromatic heterofunctional compounds?
A) Hydroxyl, amine, and carboxyl groups
B) Halides only
C) Hydrocarbons only
D) Alkyl chains only
•  What is the medical use of aromatic heterofunctional compounds like sulfonamides?
A) As antibacterial agents
B) As sweetening agents
C) As emulsifiers
D) As flavor enhancers
•  What role does phenol, an aromatic heterofunctional compound, play in medicine?
A) It is used as an antiseptic
B) It is used as a flavoring agent
C) It is used as a fertilizer
D) It is used as an inert filler
•  Which aromatic heterofunctional compound is a common anesthetic?
A) Lidocaine
B) Methane
C) Sodium chloride
D) Glucose
•  How do aromatic heterofunctional compounds contribute to cancer treatment?
A) By targeting specific tumor cells
B) By increasing tumor growth
C) By promoting metastasis
D) By inhibiting blood circulation
•  What is the role of aromatic heterofunctional compounds in anti-inflammatory medications?
A) They inhibit inflammatory pathways
B) They promote inflammation
C) They suppress the immune system entirely
D) They enhance bacterial growth
•  Which aromatic heterofunctional compound is used in the treatment of fungal infections?
A) Ketoconazole
B) Methane
C) Water
D) Glucose
•  Why are aromatic heterofunctional compounds like antihistamines used in medicine?
A) To alleviate allergic reactions
B) To induce sleep exclusively
C) To cause inflammation
D) To inhibit blood clotting
•  What is the main use of aromatic heterofunctional compounds in antibiotics?
A) They inhibit bacterial growth
B) They promote bacterial growth
C) They act as nutrient sources
D) They are used as solvents
•  Which aromatic heterofunctional compound is used as an anticoagulant?
A) Warfarin
B) Sodium bicarbonate
C) Methane
D) Water
•  How do aromatic heterofunctional compounds act as antioxidants?
A) By neutralizing free radicals
B) By increasing free radicals
C) By promoting oxidation
D) By damaging cellular structures
•  Which of the following aromatic heterofunctional compounds is used as a vasodilator?
A) Nitroglycerin
B) Glucose
C) Methane
D) Sodium chloride
•  What is the role of aromatic heterofunctional compounds in neurotransmission?
A) They regulate the synthesis and release of neurotransmitters
B) They block neurotransmitter production
C) They inhibit neural activity
D) They degrade synaptic connections
•  Which aromatic heterofunctional compound is used as an antipyretic?
A) Paracetamol
B) Methanol
C) Sodium bicarbonate
D) Benzene
•  How do aromatic heterofunctional compounds act in cardiovascular drugs?
A) By regulating blood pressure and heart rate
B) By causing arrhythmias
C) By promoting atherosclerosis
D) By inhibiting oxygen transport
•  Which aromatic heterofunctional compound is used in the synthesis of antidepressants?
A) Serotonin analogs
B) Glucose
C) Methane
D) Sodium chloride
•  What is a common characteristic of aromatic heterofunctional compounds used in chemotherapy?
A) They target rapidly dividing cells
B) They promote healthy cell division
C) They cause random mutations
D) They are entirely non-toxic
•  Which aromatic heterofunctional compound is a precursor for many essential drugs?
A) Benzyl chloride
B) Sodium bicarbonate
C) Methanol
D) Glucose
•  What is the significance of aromatic heterofunctional compounds in antiviral drugs?
A) They inhibit viral replication
B) They promote viral growth
C) They act as nutrient carriers
D) They destroy host cells directly`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 14'));
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

data['t-s-1-9-13'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 14 of s-1-9.');
