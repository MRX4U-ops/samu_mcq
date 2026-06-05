const fs = require('fs');
const path = require('path');

// 1. biochemistryData.js
console.log('--- Updating biochemistryData.js ---');
const biochemPath = path.resolve(__dirname, '../backend/src/data/biochemistryData.js');
let biochem = fs.readFileSync(biochemPath, 'utf8');

biochem = biochem.replace(
    `"options": ["Gem storage", "Normal protein", "Contains fluoride", "Zinc preserves"],`,
    `"options": ["Hem storage", "Normal protein", "Contains fluoride", "Zinc preserves"],`
).replace(
    `"explanation": "Cytochrome oxidase is characterized by its heme (gem) and metal ion centers."`,
    `"explanation": "Cytochrome oxidase is characterized by its heme (hem) and metal ion centers."`
);

fs.writeFileSync(biochemPath, biochem, 'utf8');
console.log('✅ biochemistryData.js updated.');


// 2. s-2-0.js
console.log('--- Updating mobile-app s-2-0.js ---');
const s20Path = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-0.js');
let s20 = fs.readFileSync(s20Path, 'utf8');

s20 = s20.replace(
    `          "Gem storage",\n          "Normal protein",\n          "Contains fluoride",\n          "Zinc preserves"\n        ],\n        "correctIndex": 0,\n        "explanation": "The correct answer is 'Gem storage'. This choice aligns with the established clinical curriculum."`,
    `          "Hem storage",\n          "Normal protein",\n          "Contains fluoride",\n          "Zinc preserves"\n        ],\n        "correctIndex": 0,\n        "explanation": "The correct answer is 'Hem storage'. This choice aligns with the established clinical curriculum."`
).replace(
    `          "Gem storage",\r\n          "Normal protein",\r\n          "Contains fluoride",\r\n          "Zinc preserves"\r\n        ],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is 'Gem storage'. This choice aligns with the established clinical curriculum."`,
    `          "Hem storage",\r\n          "Normal protein",\r\n          "Contains fluoride",\r\n          "Zinc preserves"\r\n        ],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is 'Hem storage'. This choice aligns with the established clinical curriculum."`
);

fs.writeFileSync(s20Path, s20, 'utf8');
console.log('✅ s-2-0.js updated.');


// 3. anatomyData.js
console.log('--- Updating anatomyData.js ---');
const anatPath = path.resolve(__dirname, '../backend/src/data/anatomyData.js');
let anat = fs.readFileSync(anatPath, 'utf8');

anat = anat.replace(
    `            "Gem storage",\n            "Normal protein",\n            "Contains fluoride",\n            "Zinc preserves"\n          ],\n          "correctIndex": 0,\n          "explanation": "Cytochrome oxidase is characterized by its heme (gem) and metal ion centers."`,
    `            "Hem storage",\n            "Normal protein",\n            "Contains fluoride",\n            "Zinc preserves"\n          ],\n          "correctIndex": 0,\n          "explanation": "Cytochrome oxidase is characterized by its heme (hem) and metal ion centers."`
).replace(
    `            "Gem storage",\r\n            "Normal protein",\r\n            "Contains fluoride",\r\n            "Zinc preserves"\r\n          ],\r\n          "correctIndex": 0,\r\n          "explanation": "Cytochrome oxidase is characterized by its heme (gem) and metal ion centers."`,
    `            "Hem storage",\r\n            "Normal protein",\r\n            "Contains fluoride",\r\n            "Zinc preserves"\r\n          ],\r\n          "correctIndex": 0,\r\n          "explanation": "Cytochrome oxidase is characterized by its heme (hem) and metal ion centers."`
);

fs.writeFileSync(anatPath, anat, 'utf8');
console.log('✅ anatomyData.js updated.');


// 4. mined_questions.json
console.log('--- Updating mined_questions.json ---');
const minedPath = path.resolve(__dirname, '../mobile-app/src/data/mined_questions.json');
let mined = fs.readFileSync(minedPath, 'utf8');

mined = mined.replace(
    `      "Gem storage",\n      "Normal protein",\n      "Contains fluoride",\n      "Zinc preserves"\n    ],`,
    `      "Hem storage",\n      "Normal protein",\n      "Contains fluoride",\n      "Zinc preserves"\n    ],`
).replace(
    `      "Gem storage",\r\n      "Normal protein",\r\n      "Contains fluoride",\r\n      "Zinc preserves"\r\n    ],`,
    `      "Hem storage",\r\n      "Normal protein",\r\n      "Contains fluoride",\r\n      "Zinc preserves"\r\n    ],`
);

fs.writeFileSync(minedPath, mined, 'utf8');
console.log('✅ mined_questions.json updated.');

console.log('🎉 Replacement of Gem storage -> Hem storage completed successfully.');
