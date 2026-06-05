const fs = require('fs');
const text = `1.	What are 6-membered heterocyclic compounds used for in medicine?
They are active ingredients in various medications
They are used in the production of plastics
They serve only as colorants
They are used in food processing only

2.	Which of the following is an example of a 6-membered heterocyclic compound used as a medicinal agent?
Pyrimidine
Acetone
Sodium chloride
Glucose
3.	How do 6-membered heterocyclic compounds function in the body?
They modulate enzymes and receptors
They serve only as energy sources
They neutralize free radicals
They act as preservatives in food
4.	Which 6-membered heterocyclic compound is used in cancer treatment?
Methotrexate
Caffeine
Vitamin D
Water
5.	What is the role of 6-membered heterocyclic compounds in neurology?
They act as modulators of neurotransmitter systems
They are used only for energy production
They assist in digestion
They influence cellular growth only
6.	Which of the following is an example of a 6-membered heterocyclic compound involved in brain function?
Pyridoxine
Chlorine
Sodium bicarbonate
Glucose
7.	6-membered heterocyclic compounds can act as:
Enzyme inhibitors in drug therapies
Coloring agents only
Food preservatives
Structural components only
8.	Which 6-membered heterocyclic compound is used to treat bacterial infections?
Chloramphenicol
Sodium chloride
Acetone
Caffeine
9.	How do 6-membered heterocyclic compounds function in drug design?
They serve as scaffolds for drug molecules to target specific receptors
They act as preservatives in drugs
They increase the energy needed for cellular processes
They neutralize free radicals in the body
10.	6-membered heterocyclic compounds are important in the development of:
Antibiotics and anticancer drugs
Food flavorings only
Cosmetic products
Nutritional supplements
11.	Which of the following is a 6-membered heterocyclic compound used in pain management?
Codeine
Caffeine
Chlorine
Water
12.	What is a common feature of 6-membered heterocyclic compounds used in drug therapies?
Their ability to target specific biological processes
Their sole use in food preservation
Their ability to reduce drug bioavailability
Their lack of biological activity
13.	What is the mechanism of action for 6-membered heterocyclic compounds in treating infections?
They inhibit bacterial cell division
They increase fungal growth
They assist in digestion
They improve nutrient absorption
14.	Which 6-membered heterocyclic compound is used in the treatment of malaria?
Chloroquine
Acetaminophen
Vitamin C
Water
15.	What is the significance of 6-membered heterocyclic compounds in medicine?
Their ability to interact with biological systems in specific ways
Their role as food preservatives only
Their ability to neutralize pathogens without affecting human cells
Their lack of any interaction with biological systems
16.	How do 6-membered heterocyclic compounds contribute to drug efficacy?
By enhancing the interaction between drugs and their targets
By acting as inert carriers
By increasing drug solubility
By reducing side effects
17.	Which 6-membered heterocyclic compound is commonly used as an antidepressant?
Fluoxetine
Chlorine
Caffeine
Vitamin D
18.	6-membered heterocyclic compounds are used to treat:
Cardiovascular diseases
Food flavoring
Muscle growth
Hair loss
19.	How do 6-membered heterocyclic compounds affect neurotransmitter systems?
By modulating receptor activity
By altering digestion processes
By improving cellular energy production
By increasing oxygen supply to tissues
20.	Which 6-membered heterocyclic compound is used in immunosuppressive therapy?
Azathioprine
Sodium chloride
Caffeine
Vitamin C
21.	Which of the following is a role of 6-membered heterocyclic compounds in drug delivery?
They improve the solubility and bioavailability of drugs
They preserve the taste of the drugs
They increase the stability of the drug color
They reduce the drug’s potency
22.	How do 6-membered heterocyclic compounds serve as neuromodulators?
They influence neurotransmitter release and receptor binding
They provide energy to nerve cells only
They enhance muscle contraction
They improve nutrient absorption
23.	What is the application of 6-membered heterocyclic compounds in anti-inflammatory drugs?
They reduce inflammation by blocking specific enzymes
They increase inflammation
They provide nutrients for cell growth
They have no effect on inflammation
24.	6-membered heterocyclic compounds are often involved in the synthesis of:
Therapeutic agents for various diseases
Food additives
Coloring agents
Plastic products
25.	What makes 6-membered heterocyclic compounds effective in medicine?
Their structural flexibility and biological activity
Their inability to interact with biological systems
Their limited interaction with enzymes
Their lack of therapeutic uses`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 16') && !l.toLowerCase().includes('topic 17'));
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

data['t-s-1-9-15'] = questions;
data['t-s-1-9-16'] = questions;

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topics 16 and 17 of s-1-9.');
