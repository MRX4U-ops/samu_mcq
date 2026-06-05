const fs = require('fs');
const text = `Surfactants have the following properties:
Reduces surface activity
Increases surface activity
Partially changes surface activity
Generates surface energy

An adsorbent is a substance that:
Absorbs the molecules or ions of another substance on its surface
Dissolves other substances on its surface
Distributes other substances evenly
Breaks down other substances on its surface

The Gibbs equation relates the amount of adsorption to the following parameter:
Surface activity
Degree of dispersity
Coagulation
Hydrophilicity

An adsorptive is a substance that:
Is adsorbed on the surface of other substances
Changes surface tension
Adsorbs other substances on its surface
Increases surface tension

The reverse process of adsorption is called:
Desorption
Absorption
Chemisorption
Sorption

Hydrophilic surfaces:
Interact with water
Do not interact with water
Do not interact with organic solvents
Do not absorb substances

Hydrophobic surfaces:
Do not interact with water
Do not interact with organic solvents
Do not absorb substances
Interact with organic solvents

Chromatography is a physical-chemical method based on the following characteristic of the adsorbent:
Selectively adsorbing dissolved substances
Changing the color of dissolved substances
Compressing the adsorbed substances
Selectively absorbing solvent molecules

If the dissolved substance increases the surface tension of the solvent, adsorption will be:
Negative
Positive
Selective
Neutralizing

If the dissolved substance decreases the surface tension of the solvent, adsorption will be:
Positive
Selective
Neutralizing
Bilayer

In the adsorption isotherm, the relationship between adsorption and concentration is shown, with the following condition required:
Constant temperature
Variable temperature
Constant pressure
Temperature not depending on pressure

The core and adsorption layer composition is:
Core and adsorption layer
Diffusion layer and potential determining ions
Adsorption and diffusion layers
Diffusion and adsorption layers

The composition of a micelle:
Core, adsorption, and diffusion layers together
Core and adsorption layer
Adsorption and diffusion layers
Core and diffusion layer

Processes occurring at the phase boundary:
Surface phenomena
Intramolecular processes
Evaporation
Boiling

The mathematical expression for calculating surface tension is:
σ = G/S
σ = S/G
σ = nRT
σ = C/RT

Surface-active substances do not include:
Hydrochloric acid
Fatty acid salt
Protein
Diethyl ether

The energy of molecules located on the surface:
Surface energy
Enthalpy
Entropy
Helmholtz energy

Adsorption is:
The change in concentration of components on the surface layer relative to the open phase
The process by which a substance integrates into the entire volume of another substance
The change in concentration of components in the main part relative to the surface layer
The increase in the volume of substances

Surface-active substances include:
Isopropyl alcohol
Hydrochloric acid
Calcium hydroxide
Sodium chloride

Surface tension is measured in:
J/m²
N/m²
J/cm
N/cm²

Methods for measuring surface tension include:
Stalagmometric method
Potentiometric method
Complexometry
Trommer method

The increase in concentration of one or more components in the surface layer of the adsorbent is:
Adsorption
Absorption
Desorption
Chemisorption

Absorption is:
The integration of a substance into the entire volume of another substance
The change in concentration of components on the surface layer relative to the open phase
The change in concentration of components in the main part relative to the surface layer
The increase in the volume of substances

Sorption is:
The adsorption of gases and vapors by solid materials
The separation of adsorbent and adsorbed material
The evaporation process
The method of analyzing weight

An adsorbent is:
A solid body where adsorption occurs
An adsorbed substance
The working solution
The initial material
Chemisorption is:
The purification of blood from toxins through adsorbents
The binding of toxins in the gastrointestinal tract
The evaporation process
The breakdown of hemoglobin

Adsorption is:
An adsorbed substance
A substance that adsorbs
A reaction product
A titrant

Enterosorption is:
The binding of toxins in the gastrointestinal tract
The purification of blood from toxins through adsorbents
The evaporation process
The breakdown of hemoglobin


Washing adsorbed substances from the adsorbent using solvents is called:
Elution
Hydration
Through adsorption
Through absorption

The first rule of Panet-Fayans states:
The crystal lattice of the adsorbent is filled with ions that are part of it
The crystal lattice of the adsorbent is filled not only with the ions in its composition
Only ions with opposite charges to the adsorbent’s surface charge are adsorbed
Polar adsorbents bind better to polar adsorbents

Ion exchange adsorption is:
The ion exchange process occurring in strict equivalent ratios
The electron exchange process
The molecular exchange process
The adsorption of gases and vapors by solid materials
From the given examples, choose the cation exchanger:
Kat-H+
AnOH-
AnCl-
AnSO₄²⁻`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 11'));
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

data['t-s-1-9-10'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 11 of s-1-9.');
