const fs = require('fs');
const text = `1.	What are proteins primarily responsible for in the body?
Building and repairing tissues
Increasing blood sugar levels
Preserving food
Acting as flavor enhancers
2.	Which of the following is an important function of proteins in medicine?
Enzyme catalysis and immune response
Serving as a source of energy only
Increasing food shelf-life
Providing structural support in bones
3.	How do proteins contribute to cellular functions?
By serving as enzymes and structural components
By acting as preservatives
By increasing fat storage
By altering the taste of food
4.	What is the primary structure of proteins?
A sequence of amino acids linked by peptide bonds
A structure of glucose molecules
A chain of fatty acids
A series of nucleotides
5.	Which of the following is an example of a protein involved in immune response?
Antibodies
Sodium chloride
Chlorine
Vitamin C
6.	How do proteins contribute to muscle function?
By forming structural components of muscle fibers
By serving as a source of glucose
By increasing muscle size
By altering blood pressure
7.	What is the role of proteins in enzyme catalysis?
They speed up chemical reactions
They preserve the taste of food
They neutralize toxins
They provide energy for cellular processes
8.	Which of the following proteins is critical for blood clotting?
Fibrinogen
Caffeine
Glucose
Sodium chloride
9.	Proteins are important for:
Maintaining immune function and catalyzing reactions
Increasing fat storage
Flavoring food
Serving as preservatives
10.	Which protein is essential for the transport of oxygen in the blood?
Hemoglobin
Chlorine
Caffeine
Sodium chloride
11.	How are proteins used in medicine to treat diseases?
By supplementing deficiencies and providing therapeutic enzymes
By increasing food flavoring
By neutralizing free radicals
By acting as food preservatives
12.	Which of the following is a function of proteins in blood circulation?
Regulating osmotic pressure
Enhancing flavor
Reducing drug absorption
Increasing acidity
13.	Proteins can be used therapeutically to:
Treat enzyme deficiencies and hormonal imbalances
Enhance food flavor
Increase drug absorption
Alter the taste of food
14.	How do proteins affect drug efficacy?
By acting as carriers for drug molecules
By enhancing the taste of the drug
By increasing the shelf-life of the drug
By reducing drug solubility
15.	Which protein is involved in oxygen transport in muscles?
Myoglobin
Caffeine
Chlorine
Glucose
16.	Proteins play an essential role in:
Muscle contraction and immune defense
Increasing fat storage
Serving as preservatives
Providing structural support in non-biological products
17.	Which of the following reactions are specific to proteins?
Enzyme catalysis and antigen-antibody reactions
Food preservation reactions
Energy release reactions
Muscle contraction
18.	What is the role of proteins in cellular communication?
They act as receptors for signaling molecules
They increase blood sugar levels
They serve as preservatives
They enhance the flavor of food
19.	Which of the following is a function of proteins in the nervous system?
They serve as neurotransmitters and receptors
They act as colorants
They increase muscle growth
They neutralize toxins
20.	Proteins contribute to cell structure by:
Providing structural integrity in the form of cytoskeletal elements
Serving as food preservatives
Increasing fat storage
Providing energy directly
21.	Which protein is involved in the immune response to infections?
Antibodies
Glucose
Caffeine
Sodium chloride
22.	How do proteins act in the healing of wounds?
By promoting tissue repair and collagen formation
By increasing blood pressure
By enhancing nutrient absorption
By increasing blood sugar levels
23.	Proteins are essential for the function of:
Enzymes and antibodies
Flavor enhancers
Food preservatives
Colorants
24.	How do proteins regulate metabolic processes in the body?
By acting as enzymes and hormone precursors
By serving as preservatives
By neutralizing free radicals
By reducing fat storage
25.	Which protein is involved in the response to cellular stress?
Heat shock proteins
Caffeine
Sodium chloride
Glucose`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 18'));
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

data['t-s-1-9-17'] = questions;

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 18 of s-1-9.');
