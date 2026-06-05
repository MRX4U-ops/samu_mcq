const fs = require('fs');
const text = `Which radioactive isotope is commonly used for diagnosing thyroid disorders?
Iodine-131
Carbon-14
Technetium-99m
Cobalt-60
Which of the following is used in PET scans?
Fluorine-18
Iodine-131
Cobalt-60
Cesium-137
Nuclear medicine primarily involves the use of:
Radioactive isotopes
X-rays
Ultrasound waves
Magnetic fields
The most commonly used isotope in diagnostic nuclear medicine is:
Technetium-99m
Carbon-14
Iodine-125
Uranium-238
Which technique uses radioactive tracers to create images of organs?
Scintigraphy
Ultrasound
MRI
CT scan
Cobalt-60 is used in medicine for:
Cancer treatment
Heart imaging
Bone density measurement
Kidney function testing
Radiation therapy primarily targets:
Cancerous cells
Healthy cells
Viruses
Bacteria
Brachytherapy involves:
Implanting radioactive sources near a tumor
Using external radiation beams
Ingesting radioactive substances
Using laser therapy
Which type of radiation is most commonly used in cancer treatment?
Gamma radiation
Alpha radiation
Beta radiation
Neutron radiation
What is the role of nuclear medicine in cancer treatment?
Destroying cancer cells using targeted radiation
Replacing damaged cells with healthy cells
Delivering chemotherapy drugs
Performing surgery on tumors
Radioisotopes are used in nuclear medicine because they emit:
Gamma rays
X-rays
Ultraviolet rays
Infrared rays
The half-life of a radioactive isotope determines:
How long it remains active in the body
Its toxicity
Its medical applications
Its stability
What does SPECT stand for in nuclear medicine?
Single Photon Emission Computed Tomography
Scanning Photon Emission Computed Technology
Standard Photon Emission Critical Tomography
Special Photon Energy Computed Tomography
Which isotope is commonly used in bone scans?
Technetium-99m
Iodine-131
Carbon-14
Cobalt-60
Which property of a radioisotope is crucial for medical imaging?
Short half-life
Long half-life
High toxicity
Low radiation emission
Radiopharmaceuticals are:
Drugs containing radioactive isotopes
Non-radioactive drugs
Chemotherapy agents
Antibiotics
Which radiopharmaceutical is used to measure cardiac blood flow?
Thallium-201
Iodine-131
Technetium-99m
Cobalt-60
Which radioisotope is used to study lung ventilation?
Xenon-133
Iodine-125
Fluorine-18
Radon-222
In radiopharmaceuticals, the carrier molecule determines:
The target organ
The radiation type
The half-life
The decay mode
Radiopharmaceuticals are introduced into the body by:
Injection, inhalation, or ingestion
External application
Surgery
Laser therapy
Which device is used to monitor radiation exposure in medical workers?
Dosimeter
Stethoscope
Thermometer
ECG machine
The main advantage of nuclear medicine is:
Non-invasive imaging and treatment
Minimal radiation exposure
Use of natural isotopes
Permanent removal of radioactive isotopes
Which regulation ensures the safe use of radioactive materials in medicine?
Radiation Protection Standards
FDA Food Standards
Good Manufacturing Practices (GMP)
Medical Ethics Guidelines
To minimize radiation risk, nuclear medicine uses isotopes with:
Short half-lives and controlled doses
Long half-lives and high doses
No half-lives
Unlimited decay products
Why is nuclear medicine highly targeted?
Radiopharmaceuticals are designed to accumulate in specific tissues
Radiation spreads uniformly in the body
Isotopes target all cells equally
High doses of radiation are always used`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.toLowerCase().includes('topic 6'));
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

data['t-s-1-9-5'] = questions;
fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Saved ' + questions.length + ' questions for Topic 6 of s-1-9.');
