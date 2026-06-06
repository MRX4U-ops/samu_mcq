const rawText = `Question  1
Diseases resulting from genomic mutations:
a. Hypertrichosis
**\\*b. Patau syndrome**
c. Thalassemia
d. Cry of the Cat Syndrome

Question  2
With an autosomal dominant type of inheritance, the following is observed:
**\\*a. The trait is passed on from generation to generation and both sexes are affected with equal frequency**
b. Sick parents give birth to healthy children
c. Healthy parents give birth to sick children
d. The father passes on his trait only to his daughters

Question  3
To diagnose metabolic diseases, use:
a. Simulation method
**\\*b. Biochemical method**
c. Twin method
d. Hybridological method

Question  4
Incestuous marriage is:
a. B cancer between individuals with the same phenotypes for a certain trait
b. Marriage between people of the second and third levels of family
c. Selective marriage
**\\*d. Marriage between people of the first degree of family**

Question  5
Genetic disease in which a change in the shape of red blood cells occurs
**\\*a. Sickle cell anemia**
b. Tay–Sachs syndrome
c. Alkaptonuria
d. Lesch–Nayan syndrome

Question  6
Alkaptonuria is a metabolic pathology:
a. Leucine
**\\*b. Tyrosine**
c. Phenylalanine
d. Valina

Question  7
Monosomy is:
a. An increase in the number of chromosomes in a karyotype by
b. Increasing the number of chromosomes in a karyotype to another
c. Complete absence of one pair of homologous chromosomes in the karyotype
**\\*d. Reducing the number of chromosomes in a karyotype by one chromosome**

Question  8
For Klinefelter syndrome:
**\\*a. In the karyotype of men there is an extra X - the sex chromosome**
b. In the karyotype of women, one sex chromosome is missing - the X chromosome.
c. In the karyotype of women there is an extra X - the sex chromosome
d. There is no clump of sex chromatin in the somatic cells of women

Question  9
Signs of "Cry the Cat" syndrome:
a. Number of chromosomes 45
b. Deletion of the short arm of chromosome pair 21
c. Karyotype of syndrome 44+XXY
**\\*d. Underdevelopment of vocal cords**

Question  10
To diagnose phenylketonuria use:
**\\*a. Film sample**
b. Sodium chloride test
c. Test with 2,4-dinitrophenylhydrazine
d. Test with nitropruside

Question  11
Chromosomal diseases:
a. Inherited through the male line
b. Passed on from generation to generation
c. Not limited to distribution within just one generation
**\\*d. Develop as a result of a change (increase or decrease) in the number of individual, paired, homologous chromosomes in the human karyotype**

Question  12
Tay-Sachs disease is a genetic disease:
a. Metal metabolism disorder
b. Amino acid metabolism disorder
c. Hormone metabolism disorder
**\\*d. Lipid metabolism disorder**

Question  13
Monogenic diseases:
**\\*a. Alkaptonuria**
b. Hypertension
c. Cry of the Cat Syndrome
d. Down's disease

Question  14
Specify diseases of lipid metabolism disorders:
**\\*a. Leukodystrophy**
b. Galactosemia
c. Mucopolysaccharidosis
d. Pentosuria

Question  15
Galactosemia is a metabolic disease:
a. Fructose
**\\*b. Galactose**
c. Glycogen
d. Maltose

Question  16
Define diseases inherited in an autosomal dominant manner?
a. Phenylketonuria
**\\*b. Marfan syndrome**
c. Hepatolenticular degeneration
d. Tay-Sachs disease

Question  17
Signs that appear with phenylketonuria:
a. Frequent respiratory diseases: bronchitis, bronchiectasis
b. Signs of the disease begin at 2-3 years of age
**\\*c. Pigmentation of the skin, hair, and iris of the eyes decreases**
d. There is muscle atrophy, "duck gait"

Question  18
Hereditary diseases caused by genes linked to human sex chromosomes:
a. Down syndrome, Marfan syndrome
b. Hepatitis, diabetes mellitus
c. Hemophilia, hypertension, glycogenosis
**\\*d. Color blindness, lack of sweat glands**

Question  19
When diagnosing chromosomal diseases, the mandatory method is: Karyotype study Fructosemia is a metabolic disease:
a. Sucrose
**\\*b. Fructose**
c. Maltose
d. Glycogen

Question  20
Disease related to hemoglobinopathy
**\\*a. Thalassemia**
b. Mental retardation
c. Galactosemia
d. Albinism`;

const blocks = rawText.split(/Question\s+\d+/i).filter(b => b.trim());
const questions = [];

blocks.forEach((block, index) => {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 5) {
    console.error("Block too short: " + block);
    return;
  }
  
  const questionText = `${index + 1}. ${lines[0]}`;
  
  const options = lines.slice(1).map(opt => {
    opt = opt.replace(/\*\*/g, '');
    opt = opt.replace(/^\\\*/, '*');
    return opt;
  });
  
  questions.push({
    question: questionText,
    options: options
  });
});

const fs = require('fs');

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("File not found: " + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  let match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
  if (!match) {
    console.log("Could not parse file structure for: " + filePath);
    return;
  }
  
  let objText = match[2];
  let obj;
  try {
    obj = eval('(' + objText + ')');
  } catch (e) {
    console.error("Eval failed for " + filePath, e);
    return;
  }
  
  const topicId = "t-s-1-8-11";
  if (obj[topicId]) {
    obj[topicId].test = questions;
    const jsonStr = JSON.stringify(obj, null, 2);
    const newContent = `export const ${match[1]} = ${jsonStr};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Updated " + filePath);
  } else {
    console.log(topicId + " not found in " + filePath);
  }
}

updateFile('c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js');
updateFile('c:/samu_mcq/student-web/src/data/course1/s-1-8.js');
