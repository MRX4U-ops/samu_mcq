const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../mobile-app/src/data/repository/course2/s-2-10.js');
const fileContent = fs.readFileSync(filePath, 'utf8');

const newQuestions = [
  {
    "question": ". Blood culture yields a ?-hemolytic Gram-negative rod. In this situation, which pathogen is most common?",
    "options": [
      "Escherichia coli. A sexually-active woman develops a urinary tract infection which ascends to the kidneys..",
      "Klebsiella pneumoniae.",
      "Serratia marcescens.",
      "Salmonella enteritidis."
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli. A sexually-active woman develops a urinary tract infection which ascends to the kidneys.. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which of the following does not occur when an individual is infected with Salmonella enteriditis?",
    "options": [
      "Proteolytic enzymes cause necrosis",
      "Salmonellosis",
      "Enterotoxins cause diarrhea",
      "Endotoxins cause inflammation and fever"
    ],
    "correctIndex": 0,
    "explanation": "Proteolytic enzymes cause necrosis is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "A lactose-fermenting Gram-negative rod is isolated from the bloody stool of a young child. Which pathogen is most likely?",
    "options": [
      "Escherichia coli.",
      "Shigella dysenteriae.",
      "Clostridium difficile",
      "Salmonella enterica."
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "In enteric fever, Salmonella may be isolated from:",
    "options": [
      "All are true.",
      "urine.",
      "blood.",
      "bile"
    ],
    "correctIndex": 0,
    "explanation": "All are true. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "What is the primary cause of death from Salmonella typhi (Typhoid fever)?",
    "options": [
      "Toxemia",
      "Hemorrhaging necrosis",
      "Vomiting",
      "High fever"
    ],
    "correctIndex": 0,
    "explanation": "Toxemia is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which bacteria can produce on Endo medium dark pink colonies?",
    "options": [
      "Escherichia coli",
      "Salmonella enterica",
      "Shigella sonnei",
      "Shigella dysenteriae"
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which one of the following organisms causes diarrhea by producing an enterotoxin that activates adenylate cyclase?",
    "options": [
      "Escherichia coli",
      "Enterococcus faecalis",
      "Staphylococcus aureus",
      "Bacteroides fragilis"
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Hemolytic uremic syndrome is caused by which of the following bacterium?",
    "options": [
      "Escherichia coli 0157",
      "Ureaplasma",
      "Helicobacter pylori",
      "Campylobacter jejuni"
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli 0157 is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "For Escherichia coli most impotent which antigens?",
    "options": [
      "somatic",
      "flagellar",
      "all are true",
      "capsular"
    ],
    "correctIndex": 0,
    "explanation": "somatic is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which of the following result(s) best describe(s) the listed organism?",
    "options": [
      "E. coli 0157 – lactose positive, indole positive",
      "Shigella Sonnei – mannitol negative H2S (wk)",
      "Campylobacter jejuni - gram positive gull wings",
      "Clostridium perfringens – aerobes, sporulated"
    ],
    "correctIndex": 0,
    "explanation": "E. coli 0157 – lactose positive, indole positive is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "What is the most common cause of urinary tract infections?",
    "options": [
      "Enterococcus fecalis",
      "Staphylococcus saprophyticus",
      "Staphylococcus epidermidis",
      "Escherichia coli"
    ],
    "correctIndex": 0,
    "explanation": "Enterococcus fecalis is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "After inoculation of Escherichia coli on Ploskirev medium the growth of bacteria is inhibited. What chemical does predetermine this phenomenon?",
    "options": [
      "brilliant green",
      "oxalic acid",
      "Bismuth salts",
      "fuchsin"
    ],
    "correctIndex": 0,
    "explanation": "brilliant green is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Infections with Salmonella enterica, serotype typhi, spread throughout the body. A key to the ability of serotype typhi to spread systemically is its ability to multiply intracellularly. Multiplication in which cell type(s) is principally responsible for systemic spread?",
    "options": [
      "Monocytes/macrophages.",
      "Neutrophils.",
      "Basophils.",
      "Erythrocytes."
    ],
    "correctIndex": 0,
    "explanation": "Monocytes/macrophages. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which of the following bacteria can cause infective type of food poisoning?",
    "options": [
      "Salmonella enteritidis.",
      "All are true",
      "Staphylococcus aureus.",
      "Clostridium perfringens"
    ],
    "correctIndex": 0,
    "explanation": "Salmonella enteritidis. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "The pathogenesis of which one of the following diseases does NOT involve an exotoxin?",
    "options": [
      "Typhoid fever",
      "All are true",
      "Botulism",
      "Scarlet fever"
    ],
    "correctIndex": 0,
    "explanation": "Typhoid fever is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which of the following descriptions best fits a typical strain of Escherichia coli?",
    "options": [
      "motile, aerogenic, lactose fermenting, indole positive",
      "non-motile, ferments lactose slowly, gramnegative",
      "non-motile, aerogenic, lactose fermenting mucoid colony",
      "motile, anaerogenic, non-lactose fermenting, indole positive"
    ],
    "correctIndex": 0,
    "explanation": "motile, aerogenic, lactose fermenting, indole positive is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Each of the following statements concerning gram-negative rods is correct EXCEPT:",
    "options": [
      "Escherichia coli is part of the normal flora of the colon; therefore, it does not cause diarrhea",
      "Escherichia coli ferments lactose, whereas the enteric pathogens Shigella and Salmonella do not",
      "Proteus species are highly motile organisms that are found in the human colon and cause urinary tract infections",
      "All are true"
    ],
    "correctIndex": 0,
    "explanation": "Escherichia coli is part of the normal flora of the colon; therefore, it does not cause diarrhea is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Dysentery like disease may be caused by",
    "options": [
      "enteroinvasive E. coli.",
      "enterotoxigenic E. coli.",
      "enteroaggregative E. coli.",
      "enteropathogenic Escherichia colt."
    ],
    "correctIndex": 0,
    "explanation": "enteroinvasive E. coli. is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Salmonella, Yersinia, Escherichia and Shigella are put together in Bergey's Manual because they are all",
    "options": [
      "gram-negative facultatively anaerobic rods",
      "fermentative",
      "pathogens",
      "none answers are correct"
    ],
    "correctIndex": 0,
    "explanation": "gram-negative facultatively anaerobic rods is correct. This aligns with standard microbiology and immunology curriculum."
  },
  {
    "question": "Which of the following serotypes of Salmonella can cause gastroenteritis?",
    "options": [
      "All are true.",
      "S. cholerae suis",
      "S. Newport.",
      "S. Enteritidis."
    ],
    "correctIndex": 0,
    "explanation": "All are true. is correct. This aligns with standard microbiology and immunology curriculum."
  }
];

const lines = fileContent.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"t-s-2-10-15": [')) {
    startIndex = i;
  }
  if (startIndex !== -1 && endIndex === -1) {
    if (lines[i].trim() === '],' && (lines[i+1] && lines[i+1].includes('"t-s-2-10-16": ['))) {
      endIndex = i;
    }
  }
}

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not locate Topic 15 range in s-2-10.js');
  process.exit(1);
}

// Generate the new Topic 15 string
const indent = '  ';
let newTopicStr = `${indent}"t-s-2-10-15": [\n`;
newQuestions.forEach((q, idx) => {
  newTopicStr += `${indent}${indent}{\n`;
  newTopicStr += `${indent}${indent}${indent}"question": ${JSON.stringify(q.question)},\n`;
  newTopicStr += `${indent}${indent}${indent}"options": [\n`;
  q.options.forEach((opt, oIdx) => {
    const trailingComma = oIdx === q.options.length - 1 ? '' : ',';
    newTopicStr += `${indent}${indent}${indent}${indent}${JSON.stringify(opt)}${trailingComma}\n`;
  });
  newTopicStr += `${indent}${indent}${indent}],\n`;
  newTopicStr += `${indent}${indent}${indent}"correctIndex": 0,\n`;
  newTopicStr += `${indent}${indent}${indent}"explanation": ${JSON.stringify(q.explanation)}\n`;
  
  const closingComma = idx === newQuestions.length - 1 ? '' : ',';
  newTopicStr += `${indent}${indent}}${closingComma}\n`;
});
newTopicStr += `${indent}],`;

// Replace lines from startIndex to endIndex (inclusive)
const before = lines.slice(0, startIndex).join('\n');
const after = lines.slice(endIndex + 1).join('\n');

const updatedContent = before + '\n' + newTopicStr + '\n' + after;
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('✅ Successfully updated Topic 15 in s-2-10.js');
