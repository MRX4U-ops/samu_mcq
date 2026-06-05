const fs = require('fs');
const text = `Which element helps heal wounds and is widely used in cosmetology and dermatology?
	Zinc
	Sodium
	Calcium
	Copper
	
	Which disease occurs due to fluorine deficiency in the body?
	Caries
	Fluorosis
	Osteoporosis
	Rickets
	
	Which disease occurs due to fluorine excess in the body?
	Fluorosis
	Caries
	Osteoporosis
	Rickets
	
	Which disease occurs due to iodine deficiency in the body?
	Goiter
	Caries
	Osteoporosis
	Rickets
	
	Which disease occurs due to calcium deficiency in the body?
	Caries and Osteoporosis
	Stones in the kidneys and gallbladder
	Argyria
	Silicosis
	
	Which disease occurs due to calcium excess in the body?
	Stones in the kidneys and gallbladder
	Caries and Osteoporosis
	Argyria
	Silicosis
	
	Which disease occurs due to strontium excess in the body?
	Caries and Osteoporosis
	Rickets
	Stones in the kidneys and gallbladder
	Silicosis
	
	What is the name for poisoning caused by aluminum?
	Aluminosis
	Anthracosis
	Argyria
	Silicosis
	
	
	
	
	What is the name for poisoning caused by silicon?
	Silicosis
	Aluminosis
	Anthracosis
	Argyria
	
	What is the name for poisoning caused by carbon?
	Anthracosis
	Aluminosis
	Argyria
	Silicosis
	
	What is the name for poisoning caused by silver?
	Argyria
	Aluminosis
	Anthracosis
	Silicosis
	
	What is the name for poisoning caused by beryllium?
	Berylliosis
	Anthracosis
	Argyria
	Silicosis
	
	What type(s) of biological elements does calcium represent?
	Organogenic, Essential
	Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does carbon represent?
	 Essential
	Organogenic, Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does hydrogen represent?
	Organogenic, Essential
	Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does oxygen represent?
	Organogenic, Essential
	Essential
	Organogenic
	Inorganic
	
	
	
	
	
	What type(s) of biological elements does sodium represent?
	Essential
	Organogenic, Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does potassium represent?
	Essential
	Organogenic, Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does chlorine represent?
	Essential
	Organogenic, Essential
	Organogenic
	Inorganic
	
	What type(s) of biological elements does magnesium represent?
	Essential
	Organogenic, Essential
	Organogenic
	Inorganic`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && l !== 'topic 2');
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

data['t-s-1-9-1'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 2 of s-1-9.');
