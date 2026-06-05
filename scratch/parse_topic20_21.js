const fs = require('fs');

const text20 = `1.	What is the main function of polysaccharides in the human body?
A) Energy storage and structural support
B) Hormone regulation
C) DNA synthesis
D) Muscle contraction
2.	Which of the following is a homo-polysaccharide?
A) Starch
B) Hyaluronic acid
C) Chitin
D) Heparin
3.	What is the primary use of starch in medicine?
A) It serves as an energy source in intravenous solutions
B) It acts as an antibiotic
C) It reduces cholesterol levels
D) It is used for pain relief
4.	Which polysaccharide is commonly found in plant cell walls and used for fiber supplements?
A) Cellulose
B) Glycogen
C) Chitin
D) Heparin
5.	What is the primary biological function of glycogen?
A) Energy storage in animals
B) Blood clotting
C) Cell signaling
D) Nerve transmission
6.	Which polysaccharide is often used as a blood thinner in medical treatments?
A) Heparin
B) Starch
C) Glycogen
D) Cellulose
7.	What is the role of polysaccharides like hyaluronic acid in the human body?
A) They provide lubrication and hydration to joints
B) They enhance digestion
C) They promote muscle growth
D) They aid in protein synthesis
8.	Which heteropolysaccharide is used in wound healing and tissue repair?
A) Hyaluronic acid
B) Cellulose
C) Chitin
D) Starch
9.	What is a common medical application of chitosan, a derivative of chitin?
A) It is used in weight loss supplements
B) It is used to treat infections
C) It is used to increase muscle mass
D) It is used to treat anxiety
10.	How do polysaccharides like glycogen function in energy metabolism?
A) They are broken down into glucose for energy
B) They act as a form of stored protein
C) They provide direct energy to muscles
D) They promote fat storage
11.	Which polysaccharide is used in the pharmaceutical industry as a tablet binder?
A) Starch
B) Glycogen
C) Hyaluronic acid
D) Cellulose
12.	What is a key property of cellulose that makes it suitable for use in medical dressings?
A) Its ability to absorb moisture
B) Its strong odor
C) Its ability to dissolve easily
D) Its high acidity
13.	How does heparin work as a blood thinner in medicine?
A) By inhibiting blood clotting factors
B) By increasing red blood cell production
C) By enhancing platelet function
D) By preventing red blood cell breakdown
14.	What is the role of polysaccharides in drug delivery systems?
A) They help in controlled release of drugs
B) They act as preservatives
C) They reduce side effects
D) They increase the solubility of drugs
15.	Which polysaccharide is commonly used in eye drops for its moisture-retaining properties?
A) Hyaluronic acid
B) Starch
C) Glycogen
D) Chitosan
16.	What is the significance of pectin, a heteropolysaccharide, in medicine?
A) It is used in digestive health supplements
B) It is used to treat infections
C) It is used for pain relief
D) It is used for skin care
17.	Which of the following is a characteristic of polysaccharides in the context of their medical use?
A) They are biocompatible and biodegradable
B) They are toxic to cells
C) They are insoluble in water
D) They cause allergic reactions
18.	What is a medical use of the polysaccharide dextran?
A) It is used in plasma volume expanders
B) It is used to treat high blood pressure
C) It is used as a muscle relaxant
D) It is used for cancer therapy
19.	How is cellulose used in the medical field?
A) As a wound dressing material
B) As an antibiotic
C) As an anti-inflammatory agent
D) As an anesthetic
20.	What is the role of heparin in preventing blood clots?
A) It inactivates thrombin and prevents clot formation
B) It increases platelet aggregation
C) It promotes blood cell production
D) It thickens the blood
21.	Which polysaccharide is commonly found in joint supplements for its lubricating properties?
A) Hyaluronic acid
B) Cellulose
C) Chitin
D) Starch
22.	What is the primary source of cellulose used in medical applications?
A) Plant fibers
B) Animal tissues
C) Microorganisms
D) Synthetic chemicals
23.	How do polysaccharides like dextran affect blood volume?
A) They increase blood plasma volume
B) They decrease blood plasma volume
C) They have no effect on blood volume
D) They cause blood vessel constriction
24.	Which heteropolysaccharide has anti-inflammatory properties and is used in joint pain relief?
A) Hyaluronic acid
B) Starch
C) Cellulose
D) Chitosan
25.	How do polysaccharides contribute to the formation of drug capsules?
A) They act as stabilizers and binders
B) They serve as active ingredients
C) They enhance the flavor of the drug
D) They increase the solubility of the drug`;

const text21 = `1.	What is the main function of nucleotides in the human body?
A) They are building blocks for DNA and RNA
B) They serve as an energy source
C) They regulate blood pressure
D) They aid in digestion
2.	What is the structure of a nucleoside?
A) A nitrogenous base attached to a sugar molecule
B) A sugar molecule and a phosphate group
C) A nitrogenous base and a phosphate group
D) A sugar molecule attached to a fatty acid
3.	Which of the following is a common medical use of nucleotides?
A) They are used in gene therapy
B) They are used in pain relief medications
C) They are used as muscle relaxants
D) They are used to treat infections
4.	What is the role of ATP (adenosine triphosphate) in the body?
A) It provides energy for cellular processes
B) It serves as a hormone
C) It helps in digestion
D) It regulates blood sugar levels
5.	Which of the following is a component of a nucleotide?
A) A nitrogenous base
B) A protein
C) A lipid molecule
D) A carbohydrate
6.	How do nucleoside analogs function in antiviral treatments?
A) They inhibit viral replication
B) They increase viral production
C) They enhance immune response
D) They block viral binding to cells
7.	Which nucleoside is commonly used in the treatment of herpesvirus infections?
A) Acyclovir
B) Ibuprofen
C) Paracetamol
D) Penicillin
8.	What is the main function of cyclic AMP (cAMP) in cellular signaling?
A) It acts as a secondary messenger
B) It directly binds to DNA
C) It provides energy for cellular functions
D) It regulates cell division
9.	Which of the following is a coenzyme derived from a nucleotide?
A) NAD+ (Nicotinamide adenine dinucleotide)
B) ATP
C) Glucose
D) Vitamin C
10.	What is the role of cAMP in the regulation of heart rate?
A) It activates protein kinase A to influence heart muscle contraction
B) It directly affects sodium channels in the heart
C) It increases blood pressure
D) It regulates insulin secretion
11.	What is the difference between a nucleoside and a nucleotide?
A) A nucleotide contains a phosphate group, while a nucleoside does not
B) A nucleoside contains a phosphate group, while a nucleotide does not
C) Nucleotides are larger than nucleosides
D) There is no difference
12.	Which of the following is a key enzyme involved in nucleotide metabolism?
A) Kinase
B) Amylase
C) Lipase
D) Peptidase
13.	How do nucleotides contribute to the synthesis of proteins?
A) They are components of RNA, which is involved in protein synthesis
B) They directly form protein chains
C) They store genetic information in protein form
D) They act as enzymes in protein formation
14.	What is the role of adenosine monophosphate (AMP) in cellular energy regulation?
A) It helps regulate energy production
B) It promotes protein synthesis
C) It stores genetic information
D) It aids in cellular division
15.	How do nucleoside analogs treat cancer?
A) They interfere with DNA replication and inhibit cancer cell division
B) They strengthen the immune system
C) They block blood vessel growth in tumors
D) They promote cell growth and repair
16.	What is the role of NAD+ in cellular metabolism?
A) It acts as an electron carrier in redox reactions
B) It provides energy for muscle contraction
C) It regulates insulin secretion
D) It strengthens bones
17.	Which of the following is a nucleotide-based coenzyme involved in energy metabolism?
A) Coenzyme A
B) Glucose
C) Vitamin D
D) Iron
18.	What is the function of the nucleotide GTP (Guanosine triphosphate) in the body?
A) It acts as an energy source and is involved in protein synthesis
B) It aids in blood clotting
C) It promotes fat storage
D) It regulates blood pressure
19.	Which nucleoside is used in the treatment of HIV infections?
A) Zidovudine
B) Paracetamol
C) Amoxicillin
D) Ibuprofen
20.	What is the role of nucleotides in DNA synthesis?
A) They are the building blocks of DNA
B) They provide energy for the process
C) They regulate the expression of genes
D) They catalyze DNA replication
21.	Which of the following nucleosides is essential for the synthesis of RNA?
A) Uridine
B) Glucose
C) Glycine
D) Threonine
22.	What is the main use of nucleotide analogs in cancer treatment?
A) To inhibit DNA replication in rapidly dividing cancer cells
B) To enhance the immune response
C) To promote the growth of cancer cells
D) To decrease the side effects of chemotherapy
23.	What is the significance of ATP in cellular function?
A) It acts as the primary energy carrier in cells
B) It serves as a structural component of the cell membrane
C) It stores genetic information
D) It regulates water balance in cells
24.	Which of the following is a nucleotide that plays a role in energy transfer within cells?
A) ATP (Adenosine triphosphate)
B) Glucose
C) Protein
D) Cholesterol
25.	How do cyclic nucleotides, such as cAMP, influence cellular processes?
A) They activate signaling pathways that regulate various cellular functions
B) They directly affect the structure of DNA
C) They produce energy for the cell
D) They promote cell division`;

function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
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

data['t-s-1-9-19'] = parse(text20);
data['t-s-1-9-20'] = parse(text21);

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved Topic 20 and Topic 21 of s-1-9.');
