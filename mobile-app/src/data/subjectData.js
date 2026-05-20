const ACADEMIC_CURRICULUM = {
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
    "Human Anatomy Moodul -3", "Medical biology with elements of ecology Module 1", "Microbiology, Virology, Parasitology and Immunology-1",
    "Microbiology, Virology, Parasitology and Immunology-2", "Molecular physiology, Pathophysiology",
    "Pathological physiology module 1", "Pathological physiology module 2", "Pathological Anatomy Moodle One",
    "Pediatrics propedeutics", "Pharmacology Moodle 1", "Pharmacology Moodle 2", "Philosophy",
    "Physiology Module 1", "Physiology Module 2", "Propedeutics of internal disease", "Psychology and pedagogy",
    "Medical Deontology. Doctor-Patient Communication"
  ],
  "3": [
    "Clinical laboratory diagnostics", "Dietology. Nutritionology.",
    "Folk medicine", "General surgery", "Hematology", "Hygiene. Medical Ecology", "Internal medicine",
    "Medical genetics", "Medical radiology", "Molecular Physiology, pathophysiology Module 1",
    "Molecular Physiology, pathophysiology Module 2", "Obstetrics and gynecology Module 1",
    "Obstetrics and gynecology module 2", "Pathological physiology Module 1", "Pathological physiology Module 2",
    "Pathological Anatomy Module 1", "Pathological Anatomy Module 2", "Pediatrics", "Pharmacology Module 1",
    "Pharmacology Module 2", "Propaedeutics of childhood diseases", "Propedeutics of internal disease",
    "Rehabilitology, sport medicine", "Neuroradiology"
  ],
  "4": [
    "Children's surgery", "Clinic Pharmacology", "Clinical allergology and immunology", "Dermatovenerology",
    "Endocrinology", "Forensic medicine", "Internal medicine", "Medical psychology", "Neurology",
    "Neurosurgery", "Obstetrics and gynecology", "Occupational diseases", "Oncology", "Otorhinolaryngology",
    "Pediatrics", "Phthisiology", "Public health", "Scientific research methods and biostatistics",
    "Surgery", "Traumatology and Orthopedics", "Urology", "Dentistry", "Partially removable dentures"
  ],
  "5": [
    "Anesthesiology and resuscitation", "Clinic Pharmacology", "Clinical allergology and immunology",
    "Emergency medicine", "Epidemiology", "Infectious diseases. Children's infectious diseases",
    "Internal medicine", "Neonatolgy", "Neurology", "Neurosurgery", "Obstetrics and gynecology",
    "Occupational diseases", "Oncology", "Ophthalmology", "Otorhinolaryngology", "Phthisiology",
    "Psychiatry, Narcology", "Surgery", "Dentistry", "Fully removable prosthesis", "Periodontology",
    "Traumatology and Orthopedics", "Surgery in familial medicine", "Fundamental endoscopic surgery"
  ],
  "6": [
    "Emergency medicine", "Infectious diseases", "Therapy in family medicine",
    "Therapy in family medicine (subordinature)", "Obstetrics and gynecology",
    "Obstetrics and gynecology in familial medicine", "Obstetrics and gynecology in familial medicine (Subordinature)",
    "Pediatrics in familial medicine (Subordinature)", "Pediatrics in familial medicine- MD (11-semester)",
    "Rheumatology", "Surgery in familial medicine (Subordinature)", "Surgery in familial medicine",
    "Simulation study", "Tropical diseases"
  ]
};

const allSubjects = [];
Object.keys(ACADEMIC_CURRICULUM).forEach(courseId => {
  ACADEMIC_CURRICULUM[courseId].forEach((subjectName, index) => {
    allSubjects.push({
      id: `s-${courseId}-${index}`,
      title: subjectName,
      course: `${courseId}${courseId === "1" ? "st" : courseId === "2" ? "nd" : courseId === "3" ? "rd" : "th"} Course`
    });
  });
});

export const ALL_SUBJECTS = allSubjects;
