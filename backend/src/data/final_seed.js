const mongoose = require('mongoose');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const { MONGODB_URI } = require('../config/env');

const data = [
  {
    course: "1st Course",
    subjects: [
      "Entering to the profession",
      "Histology, cytology and embriology moodle 1",
      "Religious studies",
      "The latest history of Uzbekistan. Bioethics",
      "Human Anatomy -Moodul 2",
      "Human Anatomy -Moodul 1",
      "Information technologies in medicine",
      "Medical and biological physics",
      "Medical biology with elements of ecology Module 1",
      "Medical biology with elements of ecology Module 2",
      "Medical chemistry Module 1",
      "Medical chemistry Module 2",
      "Medical English",
      "Medical latin terminology",
      "Microbiology, Virology, Parasitology and Immunology",
      "New medical technology and medical equipments",
      "Pharmacology",
      "Physiology module 1",
      "Physiology module 2",
      "Russian language for the students of medical institute",
      "Uzbek language"
    ]
  },
  {
    course: "2nd course",
    subjects: [
      "Biochemistry Module 1",
      "Biochemistry Module 2",
      "Clinic anatomy",
      "Clinical laboratory diagnostics",
      "First Aid",
      "Histology, Cytology and Embryology Module 1",
      "Histology, Cytology and Embryology Module 2",
      "Human Anatomy Moodul -3",
      "Medical genetics",
      "Microbiology, Virology, Parasitology and Immunology-1",
      "Microbiology, Virology, Parasitology and Immunology-2",
      "Molecular physiology, Pathophysiology",
      "Pathological physiology module 1",
      "Pathological physiology module 2",
      "Pathological Anatomy Moodle One",
      "Pediatrics propedeutics",
      "Pharmacology Moodle 1",
      "Pharmacology Moodle 2",
      "Philosophy",
      "Physiology Module 1",
      "Physiology Module 2",
      "Propedeutics of internal disease",
      "Psychology and pedagogy",
      "Medical Deontology. Doctor-Patient Communication"
    ]
  },
  {
    course: "3rd Course",
    subjects: [
      "Clinical laboratory diagnostics",
      "Clinical laboratory diagnostics",
      "Dietology. Nutritionology.",
      "Folk medicine",
      "General surgery",
      "Hematology",
      "Hygiene. Medical Ecology",
      "Internal medicine",
      "Medical genetics",
      "Medical radiology",
      "Molecular Physiology, pathophysiology Module 1",
      "Molecular Physiology, pathophysiology Module 2",
      "Obstetrics and gynecology Module 1",
      "Obstetrics and gynecology module 2",
      "Pathological physiology Module 1",
      "Pathological physiology Module 2",
      "Pathological Anatomy Module 1",
      "Pathological Anatomy Module 2",
      "Pediatrics",
      "Pharmacology Module 1",
      "Pharmacology Module 2",
      "Propaedeutics of childhood diseases",
      "Propedeutics of internal disease",
      "Rehabilitology, sport medicine",
      "Neuroradiology"
    ]
  },
  {
    course: "4th Course",
    subjects: [
      "Children's surgery",
      "Clinic Pharmacology",
      "Clinical allergology and immunology",
      "Dermatovenerology",
      "Endocrinology",
      "Forensic medicine",
      "Internal medicine",
      "Medical psychology",
      "Neurology",
      "Neurosurgery",
      "Obstetrics and gynecology",
      "Occupational diseases",
      "Oncology",
      "Otorhinolaryngology",
      "Pediatrics",
      "Phthisiology",
      "Public health",
      "Scientific research methods and biostatistics",
      "Surgery",
      "Traumatology and Orthopedics",
      "Urology",
      "Dentistry",
      "Partially removable dentures"
    ]
  },
  {
    course: "5th course",
    subjects: [
      "Anesthesiology and resuscitation",
      "Clinic Pharmacology",
      "Clinical allergology and immunology",
      "Emergency medicine",
      "Epidemiology",
      "Infectious diseases. Children's infectious diseases",
      "Internal medicine",
      "Neonatolgy",
      "Neurology",
      "Neurosurgery",
      "Obstetrics and gynecology",
      "Occupational diseases",
      "Oncology",
      "Ophthalmology",
      "Otorhinolaryngology",
      "Phthisiology",
      "Psychiatry, Narcology",
      "Surgery",
      "Dentistry",
      "Fully removable prosthesis",
      "Periodontology",
      "Traumatology and Orthopedics",
      "Surgery in familial medicine",
      "Fundamental endoscopic surgery"
    ]
  },
  {
    course: "6th Course",
    subjects: [
      "Emergency medicine",
      "Infectious diseases",
      "Therapy in family medicine",
      "Therapy in family medicine (subordinature)",
      "Obstetrics and gynecology",
      "Obstetrics and gynecology in familial medicine",
      "Obstetrics and gynecology in familial medicine (Subordinature)",
      "Pediatrics in familial medicine (Subordinature)",
      "Pediatrics in familial medicine- MD (11-semester)",
      "Rheumatology",
      "Surgery in familial medicine (Subordinature)",
      "Surgery in familial medicine",
      "Simulation study",
      "Tropical diseases"
    ]
  }
];

const seedDB = async () => {
  try {
    const uri = MONGODB_URI || "mongodb://localhost:27017/ssmu_mcqs";
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${uri}...`);

    // Clear existing
    await Course.deleteMany({});
    await Subject.deleteMany({});

    for (const item of data) {
      const course = await Course.create({ title: item.course });
      console.log(`Created Course: ${course.title}`);

      for (const subTitle of item.subjects) {
        const subject = await Subject.create({ 
          title: subTitle, 
          courseId: course._id 
        });

        // Generate 15 Topics per Subject
        for (let i = 1; i <= 15; i++) {
          const topic = await Topic.create({
            title: `Topic ${i}: Comprehensive Review`,
            subjectId: subject._id
          });

          // Add 1 Test Question and 1 Situational Task per topic as samples
          await MCQ.create([
            {
              topicId: topic._id,
              question: `[TEST] Sample medical question for ${subTitle} - Topic ${i}`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctIndex: 0,
              explanation: "Educational explanation for test mode.",
              taskType: 'test_question'
            },
            {
              topicId: topic._id,
              question: `[SITUATIONAL] Clinical case study for ${subTitle} - Topic ${i}`,
              options: ["Diagnosis A", "Diagnosis B", "Diagnosis C", "Diagnosis D"],
              correctIndex: 1,
              explanation: "Step-by-step clinical reasoning.",
              taskType: 'situational_task'
            }
          ]);
        }
      }
    }

    console.log('Final database synchronization complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
