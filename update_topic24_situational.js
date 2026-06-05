const fs = require('fs');
const path = require('path');
const { MCQ_REPOSITORY } = require('./mobile-app/src/data/repository/index.js');

const rawQuestions = `Question 1 
First aid for poisoning with hymenoptera venom:
a. Apply a warm, tight bandage to the sting site
b. Suck out the poison, treat the sting site with disinfectants.
c. Leave the sting, treat the sting site with disinfectants
**\\*d. Remove the sting, treat the sting site with disinfectants.**

Question 2 
The larval stage of Fasciola hepatica that is invasive to humans is called:
a. Redia
**\\*b. Adoleskariem**
c. Cercaria
d. Miracidium

Question 3 
For personal prevention of taeniasis it is necessary:
a. Wash your hands regularly before eating food
b. Wash vegetables and fruits thoroughly
c. Clean your home thoroughly
**\\*d. Heat treat pork before eating**

Question 4 
First aid for snake poisoning:
a. Apply a tight bandage to the bite site and transport in any position
b. Cauterize the bite site and place the victim in the shade.
c. Cauterize and treat the bite site with disinfectants
**\\*d. Suck out the poison and treat the bite site with disinfectants.**

Question 5 
When poisoned by the venom of slate snakes, the following are observed:
a. Excitation and then depression of the central nervous system, tissue necrosis
b. Inflammation of lymphatic vessels, tissue necrosis
c. Acute pain, tissue necrosis
**\\*d. Excitation and then depression of the central nervous system, respiratory failure**

Question 6 
Mature segments of the causative agent of the disease can actively crawl out of a person’s anus in the following cases:
a. Hymenolepiasis
b. Echinococcosis
c. Alveococcosis
**\\*d. Teniarinhosa**

Question 7 
What helminthiasis pathogen can be contracted directly from a sick dog?
a. Diphyllobothriasis
b. Opisthorchiasis
**\\*c. Echinococcosis**
d. Hymenolepiasis`;

function parseQuestions(text) {
  const blocks = text.split(/Question\s*\d+\s*/i).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const question = lines[0];
    const rawOptions = lines.slice(1);
    
    // Find the correct option (contains '*')
    const correctIdx = rawOptions.findIndex(o => o.includes('*'));
    if (correctIdx === -1) {
        throw new Error('No correct answer found for question: ' + question);
    }
    
    const correctOption = rawOptions[correctIdx];
    // Remove the correct option from its current position
    rawOptions.splice(correctIdx, 1);
    
    // The correct option MUST be at index 0
    const options = [correctOption, ...rawOptions];
    
    return { question, options };
  });
}

const parsedSituational = parseQuestions(rawQuestions);
MCQ_REPOSITORY['s-1-8']['t-s-1-8-23'].situational = parsedSituational;

const mobilePath = path.join('mobile-app', 'src', 'data', 'repository', 'course1', 's-1-8.js');
const webPath = path.join('student-web', 'src', 'data', 'course1', 's-1-8.js');

const jsContent = 'export const s_1_8 = ' + JSON.stringify(MCQ_REPOSITORY['s-1-8'], null, 2) + ';\n';
fs.writeFileSync(mobilePath, jsContent);
fs.writeFileSync(webPath, jsContent);

console.log('Successfully parsed Topic 24 situational questions and set correct answer at index 0.');
