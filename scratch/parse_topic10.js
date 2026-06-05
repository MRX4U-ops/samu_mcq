const fs = require('fs');
const text = `What are dispers systems?
Systems where one substance is dispersed in another
Pure substances
Homogeneous mixtures
Gaseous mixtures

Which of the following is a characteristic of colloidal systems?
The dispersed phase cannot be seen by the naked eye
The dispersed phase is visible to the naked eye
The system is always homogeneous
The system is composed of only one substance

What is the size range of particles in a colloidal system?
1 to 1000 nanometers
100 to 1000 micrometers
0.1 to 10 micrometers
1 to 100 micrometers

Which of the following is a common example of a colloidal system in medicine?
Aerosols
Salt solution
Sugar syrup
Pure water

What is the structure of a colloidal system?
A dispersed phase and a continuous phase
A single-phase system
A crystalline structure
A solid phase only

Which technique is used to prepare colloidal systems?
Dispersion method
Distillation method
Filtration method
Freezing method

What is the Tyndall effect observed in colloidal systems?
Scattering of light by colloidal particles
Complete absorption of light by colloidal particles
Reflection of light by colloidal particles
Transmission of light without scattering

Which method is commonly used to purify colloidal systems?
Dialysis
Filtration
Distillation
Evaporation

Which of the following is a characteristic of colloidal particles?
They remain suspended in the medium
They settle at the bottom rapidly
They form a solid block
They evaporate easily

Which of the following is an example of a pharmaceutical colloid?
Injectable solutions
Table salt
Glucose crystals
Powdered medications

What is the main characteristic of lyophilic colloids?
They have a strong affinity for the dispersing medium
They do not mix with the dispersing medium
They form stable solids
They are always unstable

Which of the following is a method for preparing colloidal dispersions?
High-pressure homogenization
Boiling
Freezing
Crystallization

What is the main use of colloidal silver in medicine?
Antibacterial agent
Pain reliever
Blood thinner
Immunosuppressant

How are colloidal systems used in drug delivery?
To improve the bioavailability of drugs
To decrease the shelf life of medications
To remove toxic substances from the body
To increase the viscosity of fluids

What is the role of surfactants in colloidal systems?
To stabilize the dispersion of colloidal particles
To dissolve solid particles
To increase particle size
To filter impurities

What is the function of colloidal systems in diagnostic imaging?
They enhance the contrast in imaging techniques
They slow down the imaging process
They decrease the resolution of the images
They distort the image quality

Which of the following is a typical use of colloidal systems in cosmetics?
To stabilize emulsions in creams and lotions
To increase the solubility of water in oils
To solidify cosmetic products
To separate active ingredients from inactive components

How are colloidal systems classified based on their dispersion medium?
Aerosols, foams, gels, sols
Liquids, gases, solids
Organic and inorganic
Solvents and solutes

What is the importance of colloidal systems in the pharmaceutical industry?
They facilitate controlled drug release
They are used for packaging medications
They help in dissolving the active ingredients
They enhance the color of the medicine

Which of the following is an example of a colloidal gel used in medicine?
Hydrogel wound dressings
Salt solutions
Alcohol-based solutions
Solid tablets

What property of colloidal systems is used to separate particles in purification methods?
Diffusion rate
Sedimentation rate
Surface charge
Melting point

Which method is used to determine the size of particles in a colloidal system?
Dynamic light scattering
Refractometry
Spectroscopy
Filtration

Which of the following is an application of colloidal systems in medical imaging?
Magnetic resonance imaging (MRI)
X-ray reflection
Ultrasonic scanning
Optical coherence tomography

How can colloidal systems help in targeted drug delivery?
By encapsulating drugs within nanoparticles for specific release
By dissolving drugs faster in the bloodstream
By reducing the dosage of drugs required
By preventing drug absorption in the digestive system

Which of the following is an example of a colloidal system used in vaccines?
Liposomal formulations for drug delivery
Crystalline antibody solutions
Solid tablets for oral administration
Diluted saline solutions`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 10'));
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

data['t-s-1-9-9'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 10 of s-1-9.');
