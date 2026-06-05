const fs = require('fs');
const text = `1.	What are 5-membered heterocyclic compounds primarily used for in medicine?
They serve as active pharmaceutical ingredients
They are used solely as food additives
They are involved only in industrial applications
They function as inert substances in the body

2.	Which of the following is an example of a 5-membered heterocyclic compound used in medicine?
Imidazole
Acetone
Water
Chlorine

3.	How do 5-membered heterocyclic compounds function in neuromodulation?
They interact with neurotransmitter systems
They only serve as energy sources
They act as preservatives
They have no effect on the nervous system

4.	Which 5-membered heterocyclic compound is used in the treatment of fungal infections?
Fluconazole
Sodium chloride
Glucose
Vitamin C

5.	5-membered heterocyclic compounds can act as:
Antifungal and antibacterial agents
Water carriers only
Food preservatives
Sources of vitamins

6.	What role do heterocyclic compounds play in designing neuroactive drugs?
They serve as modulators of neurotransmitter receptors
They enhance the absorption of nutrients
They are used to create food coloring agents
They are only used in diagnostic imaging

7.	Which of the following is an example of a neuromodulator containing a 5-membered heterocycle?
Histamine
Glucose
Insulin
Cortisol

8.	5-membered heterocyclic compounds are important because:
They can alter brain chemistry to treat neurological disorders
They are used solely for energy production
They aid in digestion
They are used in food production

9.	Which 5-membered heterocyclic compound has anti-inflammatory properties?
Caffeine
Methanol
Chlorine
Sodium bicarbonate

10.	How do 5-membered heterocyclic compounds affect the central nervous system?
They modulate neurotransmitter release
They reduce energy expenditure
They influence digestive processes
They directly bind to oxygen molecules

11.	5-membered heterocyclic compounds can be classified as:
Therapeutic agents
Food ingredients only
Solvents
Coloring agents

12.	Which of the following is a therapeutic application of 5-membered heterocyclic compounds?
Treating fungal infections
Providing nutrition
Neutralizing toxins
Increasing blood pressure

13.	What is a primary characteristic of condensed heterocyclic compounds?
They are composed of fused rings
They are simple linear molecules
They are used only for energy storage
They contain no nitrogen atoms

14.	What is the function of heterocyclic neuromodulators?
They alter neural signaling to affect mood and behavior
They promote digestion
They assist in energy production
They are used to treat respiratory disorders

15.	Condensed heterocyclic compounds are often used in medicine to:
Target bacterial and fungal infections
Improve hair growth
Regulate digestion
Increase appetite

16.	How do condensed heterocyclic compounds contribute to drug efficacy?
They enhance the binding to biological receptors
They only act as food preservatives
They serve as colorants in medications
They increase the shelf-life of drugs

17.	Which 5-membered heterocyclic compound is used as an antidepressant?
Fluoxetine
Sodium chloride
Glucose
Caffeine

18.	Condensed heterocyclic compounds are typically used in:
Antiviral drug development
Food flavoring
Nutritional supplements
Skin care products


19.	What is a key characteristic of heterocyclic compounds in terms of drug design?
They provide structural diversity for targeting multiple diseases
They are solely used to increase food shelf-life
They work only as colorants
They help to create non-toxic compounds

20.	Which of the following is a 5-membered heterocyclic compound used in treating parasitic infections?
Albendazole
Caffeine
Glucose
Chlorine

21.	How do condensed heterocyclic compounds work as neuroprotective agents?
By preventing neuronal damage and improving cognitive function
By acting as anti-inflammatory agents
By neutralizing toxins
By enhancing digestion

22.	What is the role of 5-membered heterocyclic compounds in antifungal treatments?
They target fungal cell wall synthesis
They increase fungal growth
They reduce fungal resistance
They act as preservatives

23.	5-membered heterocyclic compounds can act as:
Enzyme inhibitors in drug therapy
Food preservatives
Energy sources
Plasticizers

24.	Which of the following is an example of a neuromodulator with a 5-membered heterocycle?
Serotonin
Chlorine
Glucose
Urea

25.	How are 5-membered heterocyclic compounds metabolized in the body?
Through enzymatic transformations
By simple absorption
Without modification
They are excreted unchanged`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 15'));
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

data['t-s-1-9-14'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 15 of s-1-9.');
