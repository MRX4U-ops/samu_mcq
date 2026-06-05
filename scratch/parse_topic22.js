const fs = require('fs');
const text = `1.	What is the primary function of nucleic acids in the body?
A) To store and transmit genetic information
B) To provide energy for cellular processes
C) To regulate cell division
D) To build muscle tissue
2.	What is the basic building block of DNA and RNA?
A) Nucleotides
B) Amino acids
C) Fatty acids
D) Monosaccharides
3.	What does the structure of DNA look like?
A) A double helix
B) A single strand
C) A triple helix
D) A circular structure
4.	What is the complementary base pair for adenine (A) in DNA?
A) Thymine (T)
B) Cytosine (C)
C) Guanine (G)
D) Uracil (U)
5.	What is the main function of RNA in the body?
A) To carry genetic information for protein synthesis
B) To store genetic information
C) To provide energy for the cell
D) To regulate metabolism
6.	What is the significance of the double helix structure of DNA?
A) It allows for the efficient storage and replication of genetic information
B) It helps in protein synthesis
C) It aids in energy production
D) It provides structural support to the cell
7.	What is the role of ribosomes in protein synthesis?
A) They synthesize proteins by translating mRNA
B) They store genetic information
C) They produce energy for the cell
D) They regulate the immune response
8.	What type of bonds hold the two strands of the DNA double helix together?
A) Hydrogen bonds between complementary base pairs
B) Covalent bonds between sugars and phosphates
C) Ionic bonds between nitrogenous bases
D) Van der Waals forces
9.	What is the difference between DNA and RNA?
A) DNA is double-stranded, while RNA is single-stranded
B) DNA contains uracil, while RNA contains thymine
C) DNA is involved in protein synthesis, while RNA is not
D) DNA is found only in the nucleus, while RNA is found only in the cytoplasm
10.	How does DNA replication occur?
A) The two strands of DNA separate, and each serves as a template for a new strand
B) A single strand of DNA is copied into a single RNA molecule
C) DNA is broken down into nucleotides
D) Proteins are synthesized based on the DNA sequence
11.	What is the function of mRNA (messenger RNA) in protein synthesis?
A) It carries genetic information from DNA to ribosomes for protein synthesis
B) It carries amino acids to the ribosome
C) It helps fold proteins into their functional shape
D) It provides energy for protein synthesis
12.	What is the role of tRNA (transfer RNA) in protein synthesis?
A) It brings amino acids to the ribosome for protein assembly
B) It carries the genetic code to the ribosome
C) It catalyzes protein synthesis
D) It helps in the replication of DNA
13.	What is the secondary structure of nucleic acids?
A) The local folding into structures like alpha helices and beta sheets
B) The sequence of nucleotides
C) The interactions between different RNA molecules
D) The 3D structure of a protein encoded by the nucleic acid
14.	What is the tertiary structure of DNA?
A) The supercoiling of the DNA molecule
B) The bonding between nucleotides
C) The linear sequence of base pairs
D) The formation of hydrogen bonds between the strands
15.	Which type of RNA is involved in the formation of ribosomes?
A) rRNA (ribosomal RNA)
B) mRNA (messenger RNA)
C) tRNA (transfer RNA)
D) snRNA (small nuclear RNA)
16.	What is the main function of DNA in cells?
A) To store and replicate genetic information
B) To synthesize proteins
C) To regulate cell division
D) To control energy production
17.	Which of the following is a characteristic of the tertiary structure of DNA?
A) DNA supercoiling to fit inside the cell nucleus
B) DNA replication
C) DNA transcription
D) DNA translation into protein
18.	What does the RNA sequence carry?
A) The instructions for protein synthesis
B) The genetic material for cell replication
C) The energy needed for cellular processes
D) The structural components for the cell membrane
19.	What is the function of the ribosome in relation to mRNA?
A) It reads the mRNA sequence and synthesizes proteins
B) It copies the mRNA to make DNA
C) It stores the mRNA sequence for future use
D) It breaks down the mRNA molecule
20.	How does complementary base pairing occur in DNA?
A) Adenine pairs with thymine, and cytosine pairs with guanine
B) Adenine pairs with uracil, and cytosine pairs with thymine
C) Guanine pairs with thymine, and cytosine pairs with adenine
D) Uracil pairs with adenine, and thymine pairs with guanine
21.	What is the structure of a ribosome?
A) It consists of two subunits made of rRNA and proteins
B) It is made of a single protein molecule
C) It is composed solely of mRNA
D) It contains DNA and amino acids
22.	What is the purpose of the DNA double helix structure in terms of its function?
A) It enables efficient and accurate DNA replication
B) It provides the shape for proteins to function
C) It stores energy for cellular activities
D) It maintains the stability of the cell membrane
23.	Which RNA type is responsible for bringing amino acids to the ribosome?
A) tRNA (transfer RNA)
B) mRNA (messenger RNA)
C) rRNA (ribosomal RNA)
D) siRNA (small interfering RNA)
24.	What is the significance of the base pairing between adenine and thymine in DNA?
A) It ensures proper DNA replication and stability
B) It helps with protein folding
C) It regulates cell cycle progression
D) It forms the bond between protein subunits
25.	What type of bond forms between the phosphate group and the sugar in nucleotides?
A) Phosphodiester bonds
B) Hydrogen bonds
C) Ionic bonds
D) Peptide bonds`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 22'));
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

data['t-s-1-9-21'] = questions;

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 22 of s-1-9.');
