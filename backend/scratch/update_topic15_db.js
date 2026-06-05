const { supabaseAdmin } = require('../src/config/supabase');
require('dotenv').config();

const TOPIC_ID = '56d847c3-e627-4cb4-84a5-deac4b0c7d5d';

const newQuestions = [
  {
    question: ". Blood culture yields a ?-hemolytic Gram-negative rod. In this situation, which pathogen is most common?",
    options: [
      "Escherichia coli. A sexually-active woman develops a urinary tract infection which ascends to the kidneys..",
      "Klebsiella pneumoniae.",
      "Serratia marcescens.",
      "Salmonella enteritidis."
    ]
  },
  {
    question: "Which of the following does not occur when an individual is infected with Salmonella enteriditis?",
    options: [
      "Proteolytic enzymes cause necrosis",
      "Salmonellosis",
      "Enterotoxins cause diarrhea",
      "Endotoxins cause inflammation and fever"
    ]
  },
  {
    question: "A lactose-fermenting Gram-negative rod is isolated from the bloody stool of a young child. Which pathogen is most likely?",
    options: [
      "Escherichia coli.",
      "Shigella dysenteriae.",
      "Clostridium difficile",
      "Salmonella enterica."
    ]
  },
  {
    question: "In enteric fever, Salmonella may be isolated from:",
    options: [
      "All are true.",
      "urine.",
      "blood.",
      "bile"
    ]
  },
  {
    question: "What is the primary cause of death from Salmonella typhi (Typhoid fever)?",
    options: [
      "Toxemia",
      "Hemorrhaging necrosis",
      "Vomiting",
      "High fever"
    ]
  },
  {
    question: "Which bacteria can produce on Endo medium dark pink colonies?",
    options: [
      "Escherichia coli",
      "Salmonella enterica",
      "Shigella sonnei",
      "Shigella dysenteriae"
    ]
  },
  {
    question: "Which one of the following organisms causes diarrhea by producing an enterotoxin that activates adenylate cyclase?",
    options: [
      "Escherichia coli",
      "Enterococcus faecalis",
      "Staphylococcus aureus",
      "Bacteroides fragilis"
    ]
  },
  {
    question: "Hemolytic uremic syndrome is caused by which of the following bacterium?",
    options: [
      "Escherichia coli 0157",
      "Ureaplasma",
      "Helicobacter pylori",
      "Campylobacter jejuni"
    ]
  },
  {
    question: "For Escherichia coli most impotent which antigens?",
    options: [
      "somatic",
      "flagellar",
      "all are true",
      "capsular"
    ]
  },
  {
    question: "Which of the following result(s) best describe(s) the listed organism?",
    options: [
      "E. coli 0157 – lactose positive, indole positive",
      "Shigella Sonnei – mannitol negative H2S (wk)",
      "Campylobacter jejuni - gram positive gull wings",
      "Clostridium perfringens – aerobes, sporulated"
    ]
  },
  {
    question: "What is the most common cause of urinary tract infections?",
    options: [
      "Enterococcus fecalis",
      "Staphylococcus saprophyticus",
      "Staphylococcus epidermidis",
      "Escherichia coli"
    ]
  },
  {
    question: "After inoculation of Escherichia coli on Ploskirev medium the growth of bacteria is inhibited. What chemical does predetermine this phenomenon?",
    options: [
      "brilliant green",
      "oxalic acid",
      "Bismuth salts",
      "fuchsin"
    ]
  },
  {
    question: "Infections with Salmonella enterica, serotype typhi, spread throughout the body. A key to the ability of serotype typhi to spread systemically is its ability to multiply intracellularly. Multiplication in which cell type(s) is principally responsible for systemic spread?",
    options: [
      "Monocytes/macrophages.",
      "Neutrophils.",
      "Basophils.",
      "Erythrocytes."
    ]
  },
  {
    question: "Which of the following bacteria can cause infective type of food poisoning?",
    options: [
      "Salmonella enteritidis.",
      "All are true",
      "Staphylococcus aureus.",
      "Clostridium perfringens"
    ]
  },
  {
    question: "The pathogenesis of which one of the following diseases does NOT involve an exotoxin?",
    options: [
      "Typhoid fever",
      "All are true",
      "Botulism",
      "Scarlet fever"
    ]
  },
  {
    question: "Which of the following descriptions best fits a typical strain of Escherichia coli?",
    options: [
      "motile, aerogenic, lactose fermenting, indole positive",
      "non-motile, ferments lactose slowly, gramnegative",
      "non-motile, aerogenic, lactose fermenting mucoid colony",
      "motile, anaerogenic, non-lactose fermenting, indole positive"
    ]
  },
  {
    question: "Each of the following statements concerning gram-negative rods is correct EXCEPT:",
    options: [
      "Escherichia coli is part of the normal flora of the colon; therefore, it does not cause diarrhea",
      "Escherichia coli ferments lactose, whereas the enteric pathogens Shigella and Salmonella do not",
      "Proteus species are highly motile organisms that are found in the human colon and cause urinary tract infections",
      "All are true"
    ]
  },
  {
    question: "Dysentery like disease may be caused by",
    options: [
      "enteroinvasive E. coli.",
      "enterotoxigenic E. coli.",
      "enteroaggregative E. coli.",
      "enteropathogenic Escherichia colt."
    ]
  },
  {
    question: "Salmonella, Yersinia, Escherichia and Shigella are put together in Bergey's Manual because they are all",
    options: [
      "gram-negative facultatively anaerobic rods",
      "fermentative",
      "pathogens",
      "none answers are correct"
    ]
  },
  {
    question: "Which of the following serotypes of Salmonella can cause gastroenteritis?",
    options: [
      "All are true.",
      "S. cholerae suis",
      "S. Newport.",
      "S. Enteritidis."
    ]
  }
];

async function updateDB() {
  try {
    console.log('🧹 Deleting existing MCQs for Topic 15 (ID:', TOPIC_ID, ')...');
    const { error: deleteError } = await supabaseAdmin
      .from('mcqs')
      .delete()
      .eq('topic_id', TOPIC_ID);

    if (deleteError) {
      console.error('❌ Error deleting old MCQs:', deleteError);
      process.exit(1);
    }
    console.log('✅ Deleted old MCQs.');

    const mcqsToInsert = newQuestions.map(q => {
      // Correct answer is always the first option (index 0)
      const correctOption = q.options[0];
      const explanationText = `${correctOption} is correct. This aligns with standard microbiology and immunology curriculum.`;
      return {
        topic_id: TOPIC_ID,
        question: q.question,
        options: q.options,
        correct_index: 0,
        explanation: explanationText,
        task_type: 'test_question'
      };
    });

    console.log(`🚀 Inserting ${mcqsToInsert.length} new MCQs into Topic 15...`);
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('mcqs')
      .insert(mcqsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting new MCQs:', insertError);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${inserted.length} MCQs.`);
    console.log('🎉 Done DB Update!');
  } catch (err) {
    console.error('❌ Unexpected error during DB Update:', err);
    process.exit(1);
  }
}

updateDB();
