const fs = require('fs');
const text = `What is chemical kinetics?
            The study of reaction rates and mechanisms
The study of the structure of compounds
The study of thermodynamics
The study of chemical equilibrium

Which factor directly affects the rate of a chemical reaction?
Temperature
Color of the reactants
Mass of the container
Shape of the molecules

How does an increase in temperature affect reaction rate?
It increases the kinetic energy of the molecules, speeding up the reaction
It decreases the energy of activation
It stops the reaction
It has no effect on the reaction rate

What is the activation energy of a reaction?
The minimum energy required for a reaction to occur
The energy required to break all bonds in the reactants
The energy released during the reaction
The total energy in the system

Which of the following is a factor that influences reaction rate?
Concentration of reactants
The color of the solution
Atmospheric pressure
Type of reaction container

How does a catalyst affect the reaction rate?
It lowers the activation energy, increasing the reaction rate
It raises the activation energy, slowing the reaction
It does not affect the reaction rate
It completely consumes the reactants

What is an enzyme ?
A biological catalyst that speeds up biochemical reactions
A reactant in a chemical reaction
A product of a chemical reaction
A synthetic compound used in industry

What is the role of enzymes in enzymatic catalysis?
To lower the activation energy of biochemical reactions
To stop unwanted reactions
To maintain equilibrium in the reaction
To act as reactants in the process

Which factor does not affect enzyme activity?
Color of the enzyme
Temperature and pH
Substrate concentration
Presence of inhibitors



How do inhibitors affect enzymatic catalysis ?
They decrease enzyme activity by binding to the enzyme
They increase enzyme activity by providing energy
They do not affect enzyme activity
They convert enzymes into substrates

What is the Michaelis-Menten constant (Km)?
A measure of the substrate concentration at which the reaction rate is half of its maximum value
A constant that measures the reaction speed
The energy required to break enzyme-substrate bonds
The rate constant for all reactions

How does substrate concentration affect enzymatic reactions?
An increase in substrate concentration increases the reaction rate until the enzyme is saturated
An increase in substrate concentration decreases reaction rate
Substrate concentration has no effect on reaction rate
Substrate concentration changes enzyme structure

What is an example of an enzymatic reaction in the human body?
The breakdown of starch by amylase in the mouth
The burning of fossil fuels
The reaction between acids and bases
The production of carbon dioxide from limestone

What happens to enzymes at very high temperatures?
They denature and lose their catalytic properties
They become more active
They stop binding to substrates temporarily
They increase reaction rate indefinitely

What is a common use of enzymes in medicine?
Enzyme replacement therapy
Increasing drug solubility
Producing new antibodies
Neutralizing acids in the stomach
Which enzyme is commonly used in diagnosing liver diseases?
Alanine transaminase (ALT)
Amylase
Lactase
Catalase

What is the role of lactase in medicine?
To help digest lactose in patients with lactose intolerance
To treat protein deficiencies
To enhance immune response
To increase vitamin absorption

What is the primary medical use of enzymatic catalysis?
Enhancing metabolic processes and diagnostics
Reducing muscle pain
Promoting cell growth
Treating bacterial infections

What are coenzymes?
Non-protein molecules that assist enzymes in catalysis
Proteins that slow down reactions
Inhibitors that bind to the enzyme
Substrates in enzymatic reactions

How does pH affect enzyme activity?
Each enzyme has an optimal pH range for maximum activity
pH has no effect on enzyme activity
Higher pH always increases enzyme activity
Lower pH always stops enzyme activity


Which enzyme is used to treat blood clots?
Streptokinase
Amylase
Catalase
Lipase

What is the role of catalase in the body?
To break down hydrogen peroxide into water and oxygen
To digest proteins
To speed up blood flow
To break down carbohydrates

What happens if enzyme inhibitors are present in high amounts?
The reaction rate decreases significantly
The reaction rate increases
The enzyme becomes more active
The substrate becomes inactive

How are enzymes used in drug manufacturing?
To catalyze the production of active pharmaceutical ingredients
To inhibit drug solubility
To replace preservatives
To make drugs insoluble

Which is a key benefit of enzymatic catalysis in medicine?
High specificity for target reactions
Increasing overall pH levels in the body
Reducing toxicity of all compounds
Preventing protein synthesis`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 9'));
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

data['t-s-1-9-8'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 9 of s-1-9.');
