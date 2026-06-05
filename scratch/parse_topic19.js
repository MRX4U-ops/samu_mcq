const fs = require('fs');
const text = `1.	What are carbohydrates primarily used for in the human body?
A) Energy production
B) Building bones
C) Digesting fats
D) Synthesizing proteins
2.	Which of the following is a monosaccharide?
A) Glucose
B) Sucrose
C) Lactose
D) Maltose
3.	What type of bond holds monosaccharides together in disaccharides?
A) Glycosidic bond
B) Peptide bond
C) Ionic bond
D) Hydrogen bond
4.	What is the main function of glucose in medicine?
A) It provides immediate energy
B) It strengthens bones
C) It helps in protein synthesis
D) It reduces cholesterol levels
5.	Which monosaccharide is a building block of the disaccharide sucrose?
A) Glucose
B) Fructose
C) Galactose
D) Ribose
6.	What is the role of carbohydrates in treating diabetes?
A) To regulate blood sugar levels
B) To increase insulin production
C) To promote weight gain
D) To stimulate nerve growth
7.	Which carbohydrate is commonly used in intravenous solutions to provide energy?
A) Dextrose
B) Sucrose
C) Fructose
D) Lactose
8.	Which carbohydrate is found in the human bloodstream to transport energy?
A) Glucose
B) Galactose
C) Fructose
D) Maltose
9.	Which is a key characteristic of disaccharides in terms of digestion?
A) They must be broken down into monosaccharides
B) They are immediately absorbed by the body
C) They cannot be digested by the human body
D) They are stored in the liver
10.	What is the main therapeutic use of glucose in the medical field?
A) It provides quick energy in emergencies
B) It acts as an antibiotic
C) It is used for blood clotting
D) It reduces inflammation
11.	How is glucose metabolized in the body?
A) Through glycolysis and the citric acid cycle
B) By breaking down fats into ketones
C) By converting proteins into amino acids
D) By storing excess glucose in the form of fat
12.	What is the common medical application of fructose?
A) It is used as a sweetener in low-calorie foods
B) It is used to treat high blood pressure
C) It is used to reduce cholesterol levels
D) It is used to improve memory
13.	Which of the following is a disaccharide?
A) Lactose
B) Glucose
C) Galactose
D) Fructose
14.	What type of carbohydrate is lactose composed of?
A) Glucose and galactose
B) Glucose and fructose
C) Sucrose and glucose
D) Fructose and galactose
15.	Which monosaccharide is crucial for brain function?
A) Glucose
B) Fructose
C) Galactose
D) Ribose
16.	What medical condition is associated with the inability to digest lactose?
A) Lactose intolerance
B) Diabetes
C) Hypertension
D) Osteoporosis
17.	How is maltose typically used in medicine?
A) It is used in energy solutions
B) It is used as a laxative
C) It is used to treat infections
D) It is used as an antacid
18.	What is the major difference between a monosaccharide and a disaccharide?
A) The number of sugar units
B) The presence of vitamins
C) The type of chemical bonds
D) The solubility in water
19.	Which carbohydrate is often used in the treatment of dehydration in the medical field?
A) Glucose
B) Sucrose
C) Fructose
D) Galactose
20.	What is the primary function of polysaccharides like glycogen in the human body?
A) To store energy
B) To assist in digestion
C) To produce hormones
D) To form structural components
21.	What is a known effect of excess fructose in the diet?
A) It can contribute to insulin resistance
B) It enhances bone density
C) It improves skin elasticity
D) It increases muscle mass
22.	What role do carbohydrates play in wound healing?
A) They provide energy for tissue repair
B) They act as antioxidants
C) They help in blood clotting
D) They reduce inflammation
23.	What is the significance of sucrose in medical solutions?
A) It is used as a source of energy
B) It acts as an antiseptic
C) It is used to lower cholesterol
D) It is used to enhance immune response
24.	How does glucose affect the body's insulin levels?
A) It triggers insulin secretion to regulate blood sugar
B) It suppresses insulin secretion
C) It directly increases insulin resistance
D) It has no effect on insulin
25.	Which carbohydrate is often included in sports drinks to provide rapid energy?
A) Glucose
B) Fructose
C) Galactose
D) Sucrose`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 19'));
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

data['t-s-1-9-18'] = questions;

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 19 of s-1-9.');
