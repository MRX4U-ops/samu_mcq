const fs = require('fs');
const path = require('path');
const { MCQ_REPOSITORY } = require('./mobile-app/src/data/repository/index.js');

const rawQuestions = `Q1. Find the features characteristic of mitosis:
 *a. Daughter cells contain the exact same set of chromosomes as the mother - diploid
  b. As a result of division in daughter cells, the set of chromosomes is not diploid but haploid
  c. Maintains species constancy of the number of chromosomes during sexual reproduction
  d. Between two cell divisions there is a short interphase, but DNA synthesis does not occur in it, which is why it is called interkinesis

Q2. Crossing over occurs during:
  a. Diplonemes
* b. Pachynema
  c. Zygonema
  d. Diakinesis

Q3. The haploid set of chromosomes contains:
  a. Any immature sex cell
  b. Spermatogonia
* c. A mature germ cell that is formed as a result of the normal course of meiosis
  d. Ovogonium

Q4. Biological significance of mitosis:
  a. From one mother cell two daughter cells are formed with a different set of chromosomes
  b. From one mother cell two daughter cells with a triploid set of chromosomes are formed
* c. From one mother cell two daughter cells are formed, genetically identical to the mother one
  d. From one mother cell two daughter cells with a haploid set of chromosomes are formed

Q5. Meiosis is:
  a. Direct division of the cell nucleus
  b. Indirect division of the cell nucleus, resulting in the formation of genetically identical cells
  c. Cytokinesis
* d. Reductive division of the cell nucleus (reduction in the number of chromosomes) and the formation of cells with a haploid set of chromosomes

Q6. The chromatids of the chromosomes separate and move to different poles of the cell in:
  a. Prophase of mitosis
* b. Anaphase of mitosis
  c. Telophase of mitosis
  d. Metaphase of mitosis

Q7. Crossing over is:
  a. The mechanism by which daughter cells receive the same genetic material from the mother
* b. Exchange of homologous regions of chromosomes
  c. Exchange of non-homologous regions between different pairs of chromosomes
  d. Fusion of germ cells

Q8. Chromosomes are best seen under a light microscope at:
  a. Telophase of mitosis
  b. Prophase of mitosis
* c. Metaphase of mitosis
  d. Anaphase of mitosis

Q9. Near the poles of the cell there is a haploid set of single-chromatid chromosomes in:
  a. Metaphase of the second meiotic division
  b. Metaphase of the first meiotic division
* c. Telophase of the second meiotic division
  d. Prophase of the second meiotic division

Q10. During cell division, the nuclear membrane dissolves into:
* a. Prophase of mitosis
  b. Anaphase of mitosis
  c. Metaphase of mitosis
  d. Telophase of mitosis

Q11. Near the cell poles there is a haploid set of bichromatid chromosomes in:
  a. Prophase of the first meiotic division
* b. Telophase of the first meiotic division
  c. Telophase of the second meiotic division
  d. Metaphase of the second meiotic division

Q12. Chromosome conjugation occurs in:
* a. Prophase of the first meiotic division
  b. Anaphase of the second meiotic division
  c. Anaphase of the first meiotic division
  d. Metaphase of the second meiotic division

Q13. During cell division, the nuclear membrane is formed in:
  a. Metaphase of mitosis
  b. Prophase of mitosis
  c. Anaphase of mitosis
* d. Telophase of mitosis

Q14. The exchange of homologous regions of chromosomes is:
* a. Crossing over
  b. Replication
  c. Bivalent
  d. Conjugation

Q15. At what stage of meiosis, prophase I, does crossing over occur?
* a. Pachinema
  b. Leptonema
  c. Zygonema
  d. Diplonema

Q16. Chromosomes line up along the equatorial plane of the cell during:
  a. Prophase of mitosis
* b. Metaphase of mitosis
  c. Anaphase of mitosis
  d. Telophase of mitosis

Q17. Chromosome spiralization begins in:
  a. Anaphase of mitosis
* b. Prophase of mitosis
  c. Telophase of mitosis
  d. Metaphase of mitosis

Q18. Meiosis precedes the formation of:
  a. Corneal cells of the eye
  b. Red blood cells
* c. Mature germ cells
  d. Nerve cells

Q19. Biological significance of meiosis?
  a. From one mother cell two daughter cells with a tetraploid set of chromosomes are formed
  b. From one mother cell, 4 daughter cells with a triploid set of chromosomes are formed
  c. From one mother cell two daughter cells with a double set of chromosomes are formed
* d. From one mother cell, 4 daughter cells with a haploid set of chromosomes are formed

Q20. The very first phase of mitosis (karyokinesis) is:
  a. Telophase
  b. Anaphase
* c. Prophase
  d. Interphase`;

function parseQuestions(text) {
  const blocks = text.split(/Q\d+\.\s*/i).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const question = lines[0];
    const rawOptions = lines.slice(1);
    
    // Find the correct option (contains '*')
    const correctIdx = rawOptions.findIndex(o => o.includes('*'));
    if (correctIdx === -1) {
        throw new Error('No correct answer found for question: ' + question);
    }
    
    let correctOption = rawOptions[correctIdx];
    // Reformat correctOption so it specifically uses **\\*...** for consistency if needed, but not strictly required if we just ensure it's at index 0. Actually, let's keep exact formatting except ensure it's index 0. The app parses it fine. Wait, the user specifically wants the * preserved. Let's just ensure it's at index 0.
    
    // Actually, let's standardize it:
    correctOption = '**\\\\*' + correctOption.replace(/\*\*/g, '').replace(/\\\\\*/g, '').replace(/\\\*/g, '').replace(/\*/g, '').trim() + '**';

    rawOptions.splice(correctIdx, 1);
    
    const options = [correctOption, ...rawOptions];
    return { question, options };
  });
}

const s18 = MCQ_REPOSITORY['s-1-8'];

// 1. Update Topic 4 test questions
const parsedTest = parseQuestions(rawQuestions);
s18['t-s-1-8-3'].test = parsedTest;

// 2. Reverse the swap between Topic 5 (t-s-1-8-4) and Topic 7 (t-s-1-8-6)
const tempTest = s18['t-s-1-8-4'].test;
const tempSituational = s18['t-s-1-8-4'].situational;

s18['t-s-1-8-4'].test = s18['t-s-1-8-6'].test;
s18['t-s-1-8-4'].situational = s18['t-s-1-8-6'].situational;

s18['t-s-1-8-6'].test = tempTest;
s18['t-s-1-8-6'].situational = tempSituational;

// 3. Write changes
const mobilePath = path.join('mobile-app', 'src', 'data', 'repository', 'course1', 's-1-8.js');
const webPath = path.join('student-web', 'src', 'data', 'course1', 's-1-8.js');

const jsContent = 'export const s_1_8 = ' + JSON.stringify(s18, null, 2) + ';\n';
fs.writeFileSync(mobilePath, jsContent);
fs.writeFileSync(webPath, jsContent);

console.log('Successfully updated Topic 4 and reversed Topic 5 & 7 swap.');
