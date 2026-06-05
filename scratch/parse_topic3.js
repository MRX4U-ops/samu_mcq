const fs = require('fs');
const text = `Colligative properties depend on:
The number of solute particles
The type of solute
The molecular weight of the solute
The color of the solute
Which of the following is a colligative property?
Freezing point depression
Surface tension
Density
Refractive index
Boiling point elevation occurs when:
A solute is added to a solvent
The solvent is heated without solute
The pressure decreases
The solution is cooled
Freezing point of a solution is:
Lower than that of the pure solvent
Higher than that of the pure solvent
The same as the pure solvent
Independent of solute addition
The formula for osmotic pressure is:
π = iCRT
π = iKf × m
π = P × V / T
π = Kb × i × m
Van 't Hoff factor (i) for NaCl is:
2
1
3
4
Which of the following depends on molality?
Freezing point depression
Vapor pressure
Surface tension
Conductivity
Which of the following solutions has the highest boiling point?
2 M NaCl
2 M Glucose
2 M Sucrose
2 M Urea
Adding a solute to a solvent causes its vapor pressure to:
Decrease
Increase
Remain the same
Fluctuate
Which is NOT a colligative property?
Surface tension
Osmotic pressure
Boiling point elevation
Freezing point depression
Raoult’s Law applies to:
Ideal solutions
Solid solutions
Suspensions
Colloids
Which is an example of a colligative property?
Osmotic pressure
Surface area
Viscosity
Diffusion
Molality is defined as:
Moles of solute per kg of solvent
Moles of solute per liter of solution
Grams of solute per kg of solvent
Grams of solute per liter of solution
Freezing point depression is caused by:
Adding solute to the solvent
Evaporation of the solvent
Cooling the solution rapidly
Mixing two solvents
Van 't Hoff factor (i) accounts for:
The number of particles a solute dissociates into
The molecular weight of the solute
The boiling point of the solvent
The density of the solvent
Which of the following will have the largest freezing point depression?
1 M MgCl2
1 M NaCl
1 M Glucose
1 M Urea
The boiling point of a solution is always:
Higher than that of the pure solvent
Lower than that of the pure solvent
The same as the pure solvent
Unaffected by solute addition
Colligative properties are used to determine:
Molar mass of solutes
Atomic mass of solutes
Color of solutions
Shape of solute molecules
Vapor pressure of a solution is lower than the vapor pressure of:
The pure solvent
A concentrated solution
A solute alone
None of the above
Freezing point depression is represented by the formula:
ΔTf = Kf × m
ΔTf = Kb × m
ΔTf = i × C × R
ΔTf = RT × m
Which constant is used in the freezing point depression formula?
Kf
Kb
R
i
The unit of molality is:
mol/kg
mol/L
g/L
g/kg
Which of these increases when a non-volatile solute is added to water?
Boiling point
Freezing point
Vapor pressure
Solvent density
A solution of 1 M NaCl will have a van 't Hoff factor (i) equal to:
2
1
3
4
Osmosis occurs when a solution has:
A higher solute concentration than the solvent
A lower solute concentration than the solvent
Equal solute and solvent concentrations
No solute`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 3'));
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

data['t-s-1-9-2'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 3 of s-1-9.');
