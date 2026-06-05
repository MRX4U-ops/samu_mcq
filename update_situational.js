const rawTextTopic4 = `Q1. In the presynthetic period of the mitotic cycle:
  a. DNA replication occurs
  b. The nuclear envelope is destroyed
* c. Enzymes are synthesized that ensure replication
  d. Nothing is synthesized

Q2. During the synthetic period of the mitotic cycle:
  a. The cell does not synthesize anything
* b. DNA replication occurs
  c. Broadcast in progress
  d. DNA repair occurs

Q3. The regions of chromosomes to which the spindle strands are attached are called:
  a. Satellites
  b. Secondary chromosome constrictions
  c. Shoulders of chromosomes
* d. Kinetochores

Q4. Pachynema is a stage of prophase I of meiosis, during which:
* a. Chromosomes are connected into bivalents and look like thick threads (crossing over occurs here)
  b. Homologous chromosomes that were connected into bivalents begin to repel each other
  c. Homologous chromosomes are connected in pairs to each other (conjugation occurs here)
  d. The nuclear envelope is synthesized

Q5. The preparation shows a section of the seminiferous tubule, which contains spermatids. What stage of spermatogenesis is visible in the section?
  a. Ovulation
  b. Formations
  c. Maturation
 * d. Growth`;

const rawTextTopic6 = `Question 1. Which genotype can be accurately determined by phenotype without special research?
*a. Recessive homozygote genotype (aa)
b. Genotype of any individual
c. Heterozygote genotype (Aa)
d. Genotype of dominant homozygote (AA)
Question 2. What is the name of the allele that is phenotypically manifested in the heterozygous state?
*a. Dominant
b. Recessive
c. Homozygote recessive
d. Heterozygous
Question 3. The set of genes in a population, which is characterized by a certain frequency, is:
*a. Gene pool
b. Genome
c. Gene
d. Genotype
Question 4. An example of complementarity is:
*a. Inheritance of deafness
b. Inheritance of phenylketonuria
c. Inheritance of polydactyly
d. Inheritance of blood groups
Question 5. A cross in which the parent organisms differ in four pairs of characters is:
a. Dihybrid
*b. Tetrahybrid
c. Polyhybrid
d. Trihybrid`;

function parseBlocks(rawText) {
  const blocks = rawText.split(/(?:Q\d+\.|Question\s+\d+\.)\s+/).filter(b => b.trim());
  const questions = [];
  blocks.forEach(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 5) {
      return;
    }
    const questionText = lines[0];
    const options = lines.slice(1);
    questions.push({ question: questionText, options: options });
  });
  return questions;
}

const questionsTopic4 = parseBlocks(rawTextTopic4);
const questionsTopic6 = parseBlocks(rawTextTopic6);

const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
  if (!match) return;
  
  let objText = match[2];
  let obj;
  try {
    obj = eval('(' + objText + ')');
  } catch (e) {
    console.error("Eval failed", e);
    return;
  }
  
  let updated = false;
  if (obj["t-s-1-8-4"]) {
    obj["t-s-1-8-4"].situational = questionsTopic4;
    updated = true;
  }
  if (obj["t-s-1-8-6"]) {
    obj["t-s-1-8-6"].situational = questionsTopic6;
    updated = true;
  }

  if (updated) {
    const jsonStr = JSON.stringify(obj, null, 2);
    const newContent = `export const ${match[1]} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Updated " + filePath);
  }
}

updateFile('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
updateFile('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
