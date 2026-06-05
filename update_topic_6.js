const rawText = `Question 1. A cross in which the parent organisms differ in many pairs of characters is:
a. Dihybrid
b. Monohybrid
c. Tetrahybrid
*d. Polyhybrid
Question 2. A cross in which the parent organisms differ in one pair of characteristics is:
a. Dihybrid
b. Polyhybrid
*c. Monohybrid
d. Trihybrid
Question 3. The set of genes in a population, which is characterized by a certain frequency, is:
a. Genome
*b. Gene pool
c. Genotype
d. Gene
Question 4. A cross in which the parent organisms differ in four pairs of characters is:
*a. Tetrahybrid
b. Dihybrid
c. Trihybrid
d. Polyhybrid
Question 5. The totality of all external and internal signs of the body is:
a. Genotype
b. Changeability
c. Heredity
*d. Phenotype
Question 6. The totality of all the genes of an organism is:
a. Changeability
*b. Genotype
c. Heredity
d. Inheritance
Question 7. What is the name of the allele that is phenotypically manifested in the heterozygous state?
a. Heterozygous
*b. Dominant
c. Recessive
d. Homozygote recessive
Question 8. Which genotype can be accurately determined by phenotype without special research?
*a. Recessive homozygote genotype (aa)
b. Genotype of dominant homozygote (AA)
c. Heterozygote genotype (Aa)
d. Genotype of any individual
Question 9. A cross in which the parent organisms differ in two pairs of characteristics is:
a. Polyhybrid
*b. Dihybrid
c. Trihybrid
d. Monohybrid
Question 10. An example of codominance is:
a. Inheritance of deafness
b. Height inheritance
*c. Inheritance of blood groups (group IV)
d. Inheritance of polydactyly
Question 11. Rhesus conflict occurs when:
a. Mother is Rh +, and child is Rh +
*b. Mother is Rh - and child is Rh +
c. The mother is Rh - and the child is Rh -
d. Mother is Rh + and child is Rh -
Question 12. The set of genes of the haploid set of chromosomes is:
a. Genotype
b. Gene
c. Gene pool
*d. Genome
Question 13. An example of phenocopy would be:
*a. The birth of a deaf child with a normal genotype to a healthy woman who had rubella during pregnancy
b. Colorblindness in a child whose parents are colorblind
c. Albinism in a child whose mother is an albino and whose father has normal skin pigmentation
d. Hypertension in an adult man who has healthy parents
Question 14. An example of complementarity is:
a. Inheritance of polydactyly
b. Inheritance of blood groups
c. Inheritance of phenylketonuria
*d. Inheritance of deafness
Question 15. Mendel's third law reveals patterns:
a. Intermediate inheritance
b. Analyzing crossing
c. Sex-linked inheritance
*d. Independent combination of features
Question 16. What is the name of the allele that is not phenotypically manifested in the heterozygous state?
a. Dominant
b. Heterozygous
*c. Recessive
d. Homozygote dominant`;

const blocks = rawText.split(/Question\s+\d+\.\s+/).filter(b => b.trim());
const questions = [];

blocks.forEach((block, index) => {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 5) {
    console.error("Block too short: " + block);
    return;
  }
  const questionText = lines[0];
  const options = lines.slice(1);
  questions.push({
    question: questionText,
    options: options
  });
});

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
  
  if (obj["t-s-1-8-6"] && obj["t-s-1-8-6"].test) {
    obj["t-s-1-8-6"].test = questions;
    const jsonStr = JSON.stringify(obj, null, 2);
    const newContent = `export const ${match[1]} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Updated " + filePath);
  } else {
    console.log("t-s-1-8-6 not found in " + filePath);
  }
}

updateFile('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
updateFile('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
