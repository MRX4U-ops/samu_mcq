const fs = require('fs');
const path = require('path');
const { MCQ_REPOSITORY } = require('./mobile-app/src/data/repository/index.js');

const rawQuestions = `Question 1. Unit of distance between genes:
a. Centimeter
b. Angstrom
c. Nanometer
*d. Morganida

Question 2. It is known that gene linkage is not absolute, since it is disrupted as a result of:
a. Non-allelic gene interactions
b. Independent chromosome segregation during meiosis
*c. Crossing over during meiosis
d. Pleiotropy

Question 3. Genes localized on one chromosome:
*a. Form a gene linkage group
b. Give different combinations
c. Inherited independently of each other
d. Called unlinked

Question 4. Gender-dependent signs:
a. Polygenic traits
b. Traits are determined by genes that are located on the X and Y chromosomes
c. Traits determined by autosomal genes in women
*d. Traits determined by autosomal genes in men and women, but these traits appear more often in one sex than the other

Question 5. Linkage between genes can be:
a. Incomplete, not providing discrepancies
*b. Full or incomplete
c. Complete, there is a discrepancy
d. Full, but crossing over

Question 6. Indicate a gender-linked human characteristic:
a. Color of the skin
b. Hair color
*c. Hemophilia
d. Polydactyly

Question 7. What are the names of the characteristics predetermined by the genes that are located on the X and Y chromosomes?
a. Dominant
*b. Glued to the floor
c. Gender dependent
d. holandric

Question 8. If a disease (sign) is inherited through the male line from generation to generation from a father to all his sons, then this is a sign:
a. Autosomal recessive type of inheritance
*b. Y-linked type of inheritance
c. X-linked dominant type of inheritance
d. X-linked recessive inheritance

Question 9. Hemophilia is a disease that has:
a. Y-linked inheritance
*b. X-linked recessive inheritance
c. Autosomal recessive mode of inheritance
d. Autosomal dominant type of inheritance

Question 10. The father has hemophilia, and the mother is homozygous for a gene that determines normal blood clotting. With what genotypes should we expect offspring?
a. XhXH
b. XhY
*c. XHXh
d. XHXH

Question 11. What is the number of gene linkage groups in the organisms of each biological species?
a. Number of sex chromosomes
b. Number of pairs of non-allelic genes
*c. Haploid set of chromosomes
d. Diploid set of chromosomes

Question 12. Indicate the main provisions of the chromosomal theory of heredity?
a. Crossing over is not observed in male mammals
*b. The frequency of crossing over between chromosomes is directly proportional to the distance between genes
c. Crossing over can occur between non-homologous chromosomes
d. The number of linkage groups is equal to the diploid set of chromosomes

Question 13. Who established the linked inheritance of genes localized in one pair of homologous chromosomes?
a. H. Koran
*b. T. Morgan
c. V. Johansen
d. G. de Vries

Question 14. Ichthyosis is observed in the family pedigree. This symptom occurs in all generations only in men. What type of inheritance of the trait?
*a. Linked to the Y chromosome
b. Recessive, linked to the X chromosome
c. Dominant, linked to the X chromosome
d. Autosomal recessive

Question 15. Enamel hypoplasia is inherited as a sex-linked dominant trait. In a family where both parents suffer from this anomaly, a son was born with normal teeth. What is the probability that the next child will also have healthy teeth?
a. 50% girls
b. 50% of all children
c. all children
*d. 50% boys

Question 16. The father is color blind, and the mother is heterozygous for a gene that predetermines normal color perception. With what genotypes should we expect offspring?
a. XDXd
b. Dd
*c. XdXd
d. XDXD

Question 17. The holandric trait is:
a. Blonde hair
*b. Hypertrichosis
c. Hemophilia
d. Polydactyly

Question 18. Which of the following is a holandric trait?
a. Colorblindness
*b. Hypertrichosis
c. Polydactyly
d. Blonde hair

Question 19. In what units is crossing over frequency measured?
a. In centimeters
b. In the Morganids
*c. In percentages
d. In nanometers

Question 20. Hypertrichosis (hair growth along the edge of the ear) is inherited as a trait linked to the Y chromosome. What is the probability of having a child with this anomaly in a family where the father suffers from hypertrichosis?
a. 50% boys
b. All children
*c. 100% boys
d. 50% girls`;

function parseQuestions(text) {
  const blocks = text.split(/Question\s*\d+\.\s*/i).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('___'));
    const question = lines[0];
    const rawOptions = lines.slice(1);
    
    const correctIdx = rawOptions.findIndex(o => o.includes('*'));
    if (correctIdx === -1) {
        throw new Error('No correct answer found for question: ' + question);
    }
    
    let correctOption = rawOptions[correctIdx];
    correctOption = '**\\\\*' + correctOption.replace(/\*\*/g, '').replace(/\\\\\*/g, '').replace(/\\\*/g, '').replace(/\*/g, '').trim() + '**';

    rawOptions.splice(correctIdx, 1);
    const options = [correctOption, ...rawOptions];
    
    return { question, options };
  });
}

const parsedTest = parseQuestions(rawQuestions);
MCQ_REPOSITORY['s-1-8']['t-s-1-8-6'].test = parsedTest;

const mobilePath = path.join('mobile-app', 'src', 'data', 'repository', 'course1', 's-1-8.js');
const webPath = path.join('student-web', 'src', 'data', 'course1', 's-1-8.js');

const jsContent = 'export const s_1_8 = ' + JSON.stringify(MCQ_REPOSITORY['s-1-8'], null, 2) + ';\n';
fs.writeFileSync(mobilePath, jsContent);
fs.writeFileSync(webPath, jsContent);

console.log('Successfully re-parsed Topic 7 test questions with the new 20 questions and set correct answer at index 0.');
