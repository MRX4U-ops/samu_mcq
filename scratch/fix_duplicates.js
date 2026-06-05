const fs = require('fs');
const path = require('path');

// 1. biochemistryData.js
console.log('--- Updating biochemistryData.js ---');
const biochemPath = path.resolve(__dirname, '../backend/src/data/biochemistryData.js');
let biochem = fs.readFileSync(biochemPath, 'utf8');

biochem = biochem.replace(
    `"question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n            "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],`,
    `"question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n            "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],`
).replace(
    `"question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n            "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],`,
    `"question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n            "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],`
);

biochem = biochem.replace(
    `"question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n            "options": ["Protein kinase", "Diphosphorylase", "?-amylase", "Lactase"],`,
    `"question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n            "options": ["Protein kinase", "Diphosphorylase", "Alpha-amylase", "Lactase"],`
).replace(
    `"question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n            "options": ["Protein kinase", "Diphosphorylase", "?-amylase", "Lactase"],`,
    `"question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n            "options": ["Protein kinase", "Diphosphorylase", "Alpha-amylase", "Lactase"],`
);

biochem = biochem.replace(
    `"question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n          "options": ["protein kinase", "Diphosphorylase", "?-amylase", "Lactase"],`,
    `"question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n          "options": ["protein kinase", "Diphosphorylase", "Alpha-amylase", "Lactase"],`
).replace(
    `"question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n          "options": ["protein kinase", "Diphosphorylase", "?-amylase", "Lactase"],`,
    `"question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n          "options": ["protein kinase", "Diphosphorylase", "Alpha-amylase", "Lactase"],`
);

fs.writeFileSync(biochemPath, biochem, 'utf8');
console.log('✅ biochemistryData.js updated.');


// 2. mcqRepository.js
console.log('--- Updating mcqRepository.js ---');
const repoPath = path.resolve(__dirname, '../backend/src/data/mcqRepository.js');
let repo = fs.readFileSync(repoPath, 'utf8');

repo = repo.replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],\n        "correctIndex": 0,\n        "explanation": "The correct answer is '?-amylase'. This choice aligns with the established clinical curriculum."`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],\n        "correctIndex": 0,\n        "explanation": "The correct answer is 'Alpha-amylase'. This choice aligns with the established clinical curriculum."`
).replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is '?-amylase'. This choice aligns with the established clinical curriculum."`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is 'Alpha-amylase'. This choice aligns with the established clinical curriculum."`
);

fs.writeFileSync(repoPath, repo, 'utf8');
console.log('✅ mcqRepository.js updated.');


// 3. s-2-1.js
console.log('--- Updating mobile-app s-2-1.js ---');
const s21Path = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-1.js');
let s21 = fs.readFileSync(s21Path, 'utf8');

s21 = s21.replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],\n        "correctIndex": 0,\n        "explanation": "The correct answer is '?-amylase'. This choice aligns with the established clinical curriculum."`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],\n        "correctIndex": 0,\n        "explanation": "The correct answer is 'Alpha-amylase'. This choice aligns with the established clinical curriculum."`
).replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is '?-amylase'. This choice aligns with the established clinical curriculum."`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": ["Alpha-amylase", "Beta-amylase", "Gastroxin", "Ptyalin"],\r\n        "correctIndex": 0,\r\n        "explanation": "The correct answer is 'Alpha-amylase'. This choice aligns with the established clinical curriculum."`
);

fs.writeFileSync(s21Path, s21, 'utf8');
console.log('✅ s-2-1.js updated.');


// 4. s-2-1-situational.js
console.log('--- Updating mobile-app s-2-1-situational.js ---');
const sitPath = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-1-situational.js');
let sit = fs.readFileSync(sitPath, 'utf8');

sit = sit.replace(
    `      "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n      "options": [\n        "Protein kinase",\n        "Diphosphorylase",\n        "?-amylase",\n        "Lactase"\n      ],`,
    `      "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n      "options": [\n        "Protein kinase",\n        "Diphosphorylase",\n        "Alpha-amylase",\n        "Lactase"\n      ],`
).replace(
    `      "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n      "options": [\r\n        "Protein kinase",\r\n        "Diphosphorylase",\r\n        "?-amylase",\r\n        "Lactase"\r\n      ],`,
    `      "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n      "options": [\r\n        "Protein kinase",\r\n        "Diphosphorylase",\r\n        "Alpha-amylase",\r\n        "Lactase"\r\n      ],`
);

sit = sit.replace(
    `      "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n      "options": [\n        "protein kinase",\n        "Diphosphorylase",\n        "?-amylase",\n        "Lactase"\n      ],`,
    `      "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n      "options": [\n        "protein kinase",\n        "Diphosphorylase",\n        "Alpha-amylase",\n        "Lactase"\n      ],`
).replace(
    `      "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n      "options": [\r\n        "protein kinase",\r\n        "Diphosphorylase",\r\n        "?-amylase",\r\n        "Lactase"\r\n      ],`,
    `      "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n      "options": [\r\n        "protein kinase",\r\n        "Diphosphorylase",\r\n        "Alpha-amylase",\r\n        "Lactase"\r\n      ],`
);

fs.writeFileSync(sitPath, sit, 'utf8');
console.log('✅ s-2-1-situational.js updated.');


// 5. anatomyData.js
console.log('--- Updating anatomyData.js ---');
const anatPath = path.resolve(__dirname, '../backend/src/data/anatomyData.js');
let anat = fs.readFileSync(anatPath, 'utf8');

anat = anat.replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": [\n          "?-amylase",\n          "Trypsin",\n          "Gastroxin",\n          "Ptyalin"\n        ],`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\n        "options": [\n          "Alpha-amylase",\n          "Trypsin",\n          "Gastroxin",\n          "Ptyalin"\n        ],`
).replace(
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": [\r\n          "?-amylase",\r\n          "Trypsin",\r\n          "Gastroxin",\r\n          "Ptyalin"\r\n        ],`,
    `        "question": "The activity of which enzyme increases when the salivary glands are inflamed?",\r\n        "options": [\r\n          "Alpha-amylase",\r\n          "Trypsin",\r\n          "Gastroxin",\r\n          "Ptyalin"\r\n        ],`
);

anat = anat.replace(
    `          "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n          "options": [\n            "Protein kinase",\n            "Diphosphorylase",\n            "?-amylase",\n            "Lactase"\n          ],`,
    `          "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\n          "options": [\n            "Protein kinase",\n            "Diphosphorylase",\n            "Alpha-amylase",\n            "Lactase"\n          ],`
).replace(
    `          "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n          "options": [\r\n            "Protein kinase",\r\n            "Diphosphorylase",\r\n            "?-amylase",\r\n            "Lactase"\r\n          ],`,
    `          "question": "Indicate the enzyme involved in the cascade mechanism in the mobilization of liver glycogen:",\r\n          "options": [\r\n            "Protein kinase",\r\n            "Diphosphorylase",\r\n            "Alpha-amylase",\r\n            "Lactase"\r\n          ],`
);

anat = anat.replace(
    `          "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n          "options": [\n            "protein kinase",\n            "Diphosphorylase",\n            "?-amylase",\n            "Lactase"\n          ],`,
    `          "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\n          "options": [\n            "protein kinase",\n            "Diphosphorylase",\n            "Alpha-amylase",\n            "Lactase"\n          ],`
).replace(
    `          "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n          "options": [\r\n            "protein kinase",\r\n            "Diphosphorylase",\r\n            "?-amylase",\r\n            "Lactase"\r\n          ],`,
    `          "question": "Specify the enzyme involved in the cascade mechanism of hepatic glycogen mobilization:",\r\n          "options": [\r\n            "protein kinase",\r\n            "Diphosphorylase",\r\n            "Alpha-amylase",\r\n            "Lactase"\r\n          ],`
);

fs.writeFileSync(anatPath, anat, 'utf8');
console.log('✅ anatomyData.js updated.');

console.log('🎉 Files replacement completed successfully.');
