const fs = require('fs');

const text = `1.	What is the main function of vitamins in the body?
A) To regulate biochemical processes and support metabolism
B) To provide energy
C) To store genetic information
D) To catalyze chemical reactions
2.	Which of the following is a fat-soluble vitamin?
A) Vitamin A
B) Vitamin C
C) Vitamin B12
D) Vitamin B6
3.	What is the main role of vitamin A in the body?
A) It supports vision and immune function
B) It helps in protein digestion
C) It regulates blood sugar levels
D) It aids in the absorption of calcium
4.	Which vitamin is essential for the synthesis of collagen in the body?
A) Vitamin C
B) Vitamin D
C) Vitamin A
D) Vitamin K
5.	What is a deficiency of vitamin D commonly associated with?
A) Rickets
B) Night blindness
C) Pellagra
D) Scurvy
6.	What is the function of vitamin E in the body?
A) It acts as an antioxidant and protects cells from damage
B) It helps in blood clotting
C) It is involved in the synthesis of hemoglobin
D) It regulates the metabolism of fats
7.	Which vitamin is necessary for the synthesis of coenzyme A, which is involved in the Krebs cycle?
A) Vitamin B5 (Pantothenic acid)
B) Vitamin B2 (Riboflavin)
C) Vitamin B1 (Thiamine)
D) Vitamin B3 (Niacin)
8.	What is the function of vitamin K in the body?
A) It plays a crucial role in blood clotting
B) It supports immune function
C) It helps with calcium absorption
D) It regulates blood pressure
9.	Which of the following vitamins is water-soluble?
A) Vitamin C
B) Vitamin A
C) Vitamin D
D) Vitamin E
10.	How does vitamin B12 function in the body?
A) It helps in the formation of red blood cells and the maintenance of the nervous system
B) It supports bone health
C) It helps in the digestion of fats
D) It regulates the immune response
11.	What can cause vitamin C deficiency?
A) Scurvy
B) Rickets
C) Beriberi
D) Pellagra
12.	What is the primary role of folic acid (vitamin B9) in the body?
A) It is involved in DNA synthesis and red blood cell formation
B) It helps with bone formation
C) It is essential for nerve function
D) It supports the immune system
13.	What is the major source of vitamin D for the body?
A) Sunlight exposure
B) Green leafy vegetables
C) Fruits
D) Animal fats
14.	Which vitamin is involved in the formation of collagen and is an antioxidant?
A) Vitamin C
B) Vitamin A
C) Vitamin E
D) Vitamin K
15.	What is the effect of a deficiency in vitamin A?
A) Night blindness
B) Scurvy
C) Rickets
D) Beriberi
16.	What is the structure of vitamin A?
A) It is a retinoid compound
B) It is a polyunsaturated fatty acid
C) It is a water-soluble antioxidant
D) It is a steroid hormone
17.	Which of the following vitamins is essential for proper calcium metabolism?
A) Vitamin D
B) Vitamin A
C) Vitamin C
D) Vitamin B12
18.	How is vitamin E involved in protecting the body?
A) It acts as a potent antioxidant that protects cells from oxidative damage
B) It helps in blood clotting
C) It aids in the production of red blood cells
D) It regulates hormone production
19.	What condition is associated with a deficiency of vitamin K?
A) Hemorrhaging or excessive bleeding
B) Rickets
C) Night blindness
D) Osteoporosis
20.	What is the primary function of vitamin B1 (thiamine)?
A) It is essential for carbohydrate metabolism
B) It aids in the synthesis of DNA
C) It supports bone health
D) It protects the liver from toxins
21.	Which vitamin deficiency is linked to the development of pellagra?
A) Vitamin B3 (Niacin)
B) Vitamin B6 (Pyridoxine)
C) Vitamin C
D) Vitamin A
22.	What is a common dietary source of vitamin B12?
A) Animal products like meat and dairy
B) Leafy green vegetables
C) Citrus fruits
D) Whole grains
23.	How does vitamin C contribute to the immune system?
A) It helps stimulate the production of white blood cells
B) It helps the body absorb iron
C) It promotes bone growth
D) It supports the synthesis of vitamin D
24.	Which of the following vitamins is important for vision?
A) Vitamin A
B) Vitamin E
C) Vitamin D
D) Vitamin K
25.	What is the consequence of vitamin D deficiency in children?
A) Rickets
B) Night blindness
C) Anemia
D) Bleeding disorders`;

function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 24'));
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

data['t-s-1-9-23'] = parse(text); // 23 refers to Topic 24 (0-indexed topic IDs internally? No, Topic 1 is t-s-1-9-0. Topic 24 is t-s-1-9-23.)

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved Topic 24 of s-1-9.');
