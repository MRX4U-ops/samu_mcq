const { MCQ_REPOSITORY } = require('./mobile-app/src/data/mcqRepository');

const CURRICULUM = {
  "1": [
    "Entering to the profession", "Histology, cytology and embriology moodle 1", "Religious studies",
    "The latest history of Uzbekistan. Bioethics", "Human Anatomy -Moodul 2", "Human Anatomy -Moodul 1",
    "Information technologies in medicine", "Medical and biological physics", "Medical biology with elements of ecology Module 1",
    "Medical biology with elements of ecology Module 2", "Medical chemistry Module 1", "Medical chemistry Module 2",
    "Medical English", "Medical latin terminology", "Microbiology, Virology, Parasitology and Immunology",
    "New medical technology and medical equipments", "Pharmacology", "Physiology module 1", "Physiology module 2",
    "Russian language for the students of medical institute", "Uzbek language"
  ],
  "2": [
    "Biochemistry Module 1", "Biochemistry Module 2", "Clinic anatomy", "Clinical laboratory diagnostics",
    "First Aid", "Histology, Cytology and Embryology Module 1", "Histology, Cytology and Embryology Module 2",
    "Human Anatomy Moodul -3", "Medical genetics", "Microbiology, Virology, Parasitology and Immunology-1",
    "Microbiology, Virology, Parasitology and Immunology-2", "Molecular physiology, Pathophysiology",
    "Pathological physiology module 1", "Pathological physiology module 2", "Pathological Anatomy Moodle One",
    "Pediatrics propedeutics", "Pharmacology Moodle 1", "Pharmacology Moodle 2", "Philosophy",
    "Physiology Module 1", "Physiology Module 2", "Propedeutics of internal disease", "Psychology and pedagogy",
    "Medical Deontology. Doctor-Patient Communication"
  ]
};

console.log("=== COURSE 1 MAPPING ===");
CURRICULUM["1"].forEach((name, idx) => {
  const sId = `s-1-${idx}`;
  const hasData = !!MCQ_REPOSITORY[sId];
  console.log(`  idx=${idx} → ${sId} | "${name}" | Has Data: ${hasData}`);
});

console.log("\n=== COURSE 2 MAPPING ===");
CURRICULUM["2"].forEach((name, idx) => {
  const sId = `s-2-${idx}`;
  const hasData = !!MCQ_REPOSITORY[sId];
  console.log(`  idx=${idx} → ${sId} | "${name}" | Has Data: ${hasData}`);
});
