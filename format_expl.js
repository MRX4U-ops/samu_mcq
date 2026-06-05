const fs = require('fs');

const explanations = [
  // Topic 0
  "RNA is complementary to the DNA template strand and replaces Thymine (T) with Uracil (U). A pairs with U, G pairs with S(C), T pairs with A.",
  "Transcription creates a complementary mRNA. For double-stranded DNA synthesis, the strands must be complementary to each other.",
  "The GGGTTA sequence is a telomeric repeat that protects the ends of chromosomes and stores essential genetic information for replication limits.",
  "Telomerase is a ribonucleoprotein that adds a species-dependent telomere repeat sequence to the 3' end of telomeres, acting as a reverse transcriptase.",
  "Telomerase activity is highly upregulated in tumor cells, granting them limitless replicative potential (immortality).",
  // Topic 1
  "Elevated phenylalanine crosses the placenta and is neurotoxic to the developing fetal brain, leading to microcephaly and severe mental retardation (oligophrenia).",
  "Klinefelter syndrome (47, XXY) is definitively diagnosed through cytogenetic analysis (karyotyping) to visualize the extra X chromosome.",
  "Turner syndrome (45, X0) presents with short stature, webbed neck (Sphinx neck), delayed puberty, and underdeveloped ovaries (streak gonads).",
  "Phenylketonuria (PKU) is an inborn error of metabolism causing accumulation of phenylalanine; dropping ferric chloride or trichloroacetic acid yields an olive-green color in urine.",
  "Sex chromatin (Barr body) represents an inactivated X chromosome. Females with Turner syndrome (45, X0) have only one X chromosome, so sex chromatin is absent.",
  // Topic 2
  "Wet gangrene occurs in tissues with poor venous drainage or bacterial superinfection, presenting with severe swelling, foul-smelling discharge, and necrosis.",
  "Apoptosis is programmed cell death characterized by cell shrinkage, chromatin condensation, and fragmentation into apoptotic bodies without an inflammatory response.",
  "Lysosomes contain hydrolytic enzymes (acid hydrolases) that digest cellular macromolecules and organelles during autolysis.",
  "Dry gangrene involves coagulative necrosis due to arterial occlusion (common in long-standing diabetes), resulting in dry, black, and sharply demarcated tissue.",
  "Sickle cell anemia is caused by a point mutation (gene mutation) in the beta-globin gene, leading to a single amino acid substitution of valine for glutamic acid.",
  // Topic 3
  "Fibroadenoma is the most common benign breast tumor in young women, presenting as a firm, painless, well-circumscribed, and highly mobile mass.",
  "For stage IIb middle thoracic esophageal cancer, surgical resection (esophagectomy) combined with neoadjuvant or adjuvant therapy is the standard optimal treatment.",
  "Prostate cancer frequently metastasizes to the axial skeleton (pelvis, spine, ribs) and typically forms osteoblastic (bone-forming) lesions, causing severe pain.",
  "Small cell lung cancer is highly aggressive and usually presents with systemic spread; surgery is almost never indicated. Treatment relies on chemotherapy and radiation.",
  "Carcinogenesis is the complex, multistep process through which normal cells transform into cancer cells via genetic mutations and loss of regulatory controls.",
  // Topic 4
  "Glycosylated hemoglobin (HbA1c) is formed when glucose non-enzymatically binds to hemoglobin; it reflects average blood glucose levels over the past 2-3 months.",
  "C-reactive protein (CRP) is an acute-phase reactant synthesized by the liver; it is a highly sensitive but non-specific marker of systemic inflammation, such as active rheumatism.",
  "Total protein normally ranges from 65-85 g/L. A value of 120 g/L is severely elevated (hyperproteinemia), usually indicating pathology like multiple myeloma or dehydration.",
  "Albumin, synthesized entirely by the liver, constitutes the majority of plasma proteins and is the primary determinant of intravascular oncotic pressure.",
  "Prothrombin (Factor II) and other vitamin K-dependent coagulation factors are synthesized in the liver. Liver failure impairs their synthesis, leading to bleeding.",
  // Topic 5
  "Porphyrias are rare inherited or acquired disorders of certain enzymes in the heme biosynthetic pathway, causing accumulation of porphyrin precursors (red urine).",
  "Pathological bilirubinuria (direct bilirubin in urine) typically indicates conjugated hyperbilirubinemia, caused by either liver parenchyma damage (hepatitis) or biliary obstruction.",
  "Hemolytic jaundice results from massive RBC destruction, leading to increased indirect bilirubin in blood, and elevated urobilin and stercobilin due to high heme breakdown.",
  "Neonatal jaundice is most commonly physiological, caused by a transient immaturity of hepatic UDP-glucuronosyltransferase, leading to elevated indirect (unconjugated) bilirubin.",
  "Venomous snake bites can contain hemotoxins that lyse red blood cells, overwhelming the liver and massively increasing indirect (unconjugated) bilirubin in the plasma.",
  // Topic 6
  "Collagen is characterized by a high abundance of the unusual amino acids hydroxyproline and hydroxylysine; their presence in urine indicates collagen breakdown.",
  "Collagen is the primary structural protein of the extracellular matrix and connective tissues, including the basement membranes of blood vessels.",
  "Carnitine is endogenously synthesized from the essential amino acids lysine and methionine. A deficiency in these impairs carnitine synthesis and fatty acid transport.",
  "In muscular dystrophy, damaged muscle cells release intracellular contents, including creatine kinase and creatine, leading to elevated levels in the blood serum.",
  "Vitamin C (ascorbic acid) is an essential cofactor for prolyl hydroxylase and lysyl hydroxylase. Deficiency causes scurvy, characterized by impaired collagen cross-linking and bleeding.",
  // Topic 7
  "Intestinal bacteria convert the amino acid tryptophan into indole, which is absorbed, detoxified in the liver to indoxyl sulfate, and excreted in urine as indican.",
  "Trasilol (Aprotinin) is a broad-spectrum protease inhibitor used to inhibit pancreatic enzymes (like trypsin) to prevent self-digestion and inflammation of the pancreas.",
  "Amylase (diastase) is an enzyme produced by the pancreas to digest carbohydrates. Markedly elevated levels in urine and blood strongly indicate acute pancreatitis.",
  "Galactosemia is a metabolic disorder caused by a deficiency in galactose-1-phosphate uridyltransferase. Milk sugar (lactose) must be excluded because it breaks down into galactose and glucose.",
  "In children, the gastric enzyme rennin (chymosin) is highly active and coagulates milk. In adults, the primary proteolytic enzyme is pepsin, which functions optimally at pH 1.5-2.0.",
  // Topic 8
  "Pompe disease (Glycogen Storage Disease Type II) is a lysosomal storage disorder caused by acid alpha-glucosidase deficiency, leading to massive glycogen accumulation in the heart and muscles.",
  "Intense anaerobic exercise causes skeletal muscles to rely on anaerobic glycolysis, leading to the formation and accumulation of lactic acid, which causes delayed onset muscle soreness.",
  "During muscle contraction, calcium ions bind to troponin C, causing a conformational change that moves tropomyosin away from the actin-myosin binding site, allowing cross-bridge formation.",
  "The composition of Fast Twitch (FT) and Slow Twitch (ST) muscle fibers and sarcomere proteins is dictated by genetic code (DNA nucleotide sequences), determining athletic predisposition.",
  "Myocardial infarction (heart attack) damages cardiac muscle cells, releasing intracellular cardiac biomarkers such as CK-MB and AST into the bloodstream (enzymodiagnosis).",
  // Topic 9
  "The liver is the primary storage organ for glycogen, which it hydrolyzes into glucose to maintain stable blood sugar levels during fasting states.",
  "Epinephrine and glucagon activate adenylyl cyclase, raising cAMP, which activates Protein Kinase A. This cascade leads to the mobilization of liver glycogen.",
  "Hepatic detoxification involves biotransformation phases (oxidation, conjugation) that convert harmful, non-polar substances into harmless, water-soluble compounds for excretion.",
  "Bile acids (cholic acid and chenodeoxycholic acid) are synthesized directly from cholesterol in the liver, serving as the main pathway for cholesterol excretion.",
  "Bilirubin is detoxified in the liver via conjugation with glucuronic acid. This reaction is catalyzed by the enzyme UDP-glucuronosyltransferase, making it water-soluble.",
  // Topic 10
  "The liver serves as the main glycogen depot for systemic blood glucose regulation, whereas muscle glycogen is strictly reserved for local muscular energy use.",
  "Hepatic glycogen mobilization is triggered by a hormonal cascade that activates protein kinase A, which subsequently phosphorylates and activates downstream glycogenolytic enzymes.",
  "Late (Phase II) detoxification in the liver primarily involves conjugation reactions that attach polar groups to toxic substances, making them completely insensitive (harmless) and excretable.",
  "Bile acids are the major end products of cholesterol metabolism and are essential for the emulsification and absorption of dietary lipids in the intestine.",
  "UDP-glucuronosyltransferase conjugates unconjugated (indirect) bilirubin to form direct bilirubin, a critical step for its neutralization and excretion into bile.",
  // Topic 11
  "Polydipsia and polyuria without glycosuria indicate Diabetes Insipidus, resulting from a deficiency or insensitivity to Vasopressin (Anti-Diuretic Hormone), impairing water reabsorption.",
  "Acromegaly in adults is caused by a hypersecreting pituitary adenoma producing excess Somatotropic hormone (Growth Hormone) after epiphyseal plates have fused.",
  "Addison's disease is primary adrenal insufficiency involving the destruction of the adrenal cortex, leading to a life-threatening deficiency of both cortisol and the mineralocorticoid Aldosterone.",
  "Oxytocin is a posterior pituitary hormone that strongly stimulates uterine smooth muscle contractions. Synthetic versions are routinely used to induce or augment labor.",
  "Hyperparathyroidism is characterized by excess parathyroid hormone (parathormone), which drives severe bone resorption (causing fractures and pain) and hypercalcemia.",
  // Topic 12
  "Severe stress triggers the release of counter-regulatory hormones (cortisol, epinephrine) that can unmask underlying diabetes due to an inability of the pancreas to secrete sufficient insulin.",
  "Gigantism is caused by an excess of Growth Hormone secreted by the anterior pituitary gland during childhood, before the fusion of long bone epiphyseal plates.",
  "A fruity or acetone breath odor is the hallmark of Diabetic Ketoacidosis (DKA), a dangerous complication of diabetes caused by massive lipolysis and ketone body production leading to coma.",
  "The epiphysis (pineal gland) secretes melatonin, which exerts an inhibitory effect on the hypothalamic-pituitary-gonadal axis. Its hypofunction can trigger early (precocious) puberty.",
  "A calcified tumor above the sella turcica is typically a craniopharyngioma. It compresses the pituitary gland (hypophysis), causing panhypopituitarism (stunted growth, delayed puberty).",
  // Topic 13
  "Lead toxicity causes severe acute tubular necrosis in the kidneys. The resulting destruction of the renal parenchyma completely halts urine production, a condition known as anuria.",
  "Excretion of 2g of protein per day indicates significant proteinuria. While typically pathological, the provided answer categorizes it as functional proteinuria depending on the specific diagnostic criteria applied.",
  "Nocturia is often an early symptom of cardiac decompensation (heart failure). Fluid pooled in the lower extremities during the day is mobilized into the circulation and excreted when lying down.",
  "Amidopyrine is an older pyrazolone NSAID that metabolizes into a reddish compound, harmlessly discoloring the urine pinkish-red and mimicking hematuria.",
  "In diabetes mellitus, heavy solute loads (glucose) increase the specific gravity of urine, while the concurrent excretion of ketone bodies causes the urine to become sharply acidic.",
  // Topic 14
  "Multiple sclerosis is an autoimmune demyelinating disease where the immune system attacks the myelin sheath in the central nervous system, leading to myelin deficiency and neurological symptoms.",
  "The brain is highly metabolically active and relies almost entirely on continuous glucose supply. Prolonged mental activity without food causes hypoglycemia, leading to weakness and syncope.",
  "During embryonic development, the brain lacks mature vascularization and relies on massive glycogen stores for anaerobic energy. As the adult brain develops a steady blood supply, glycogen levels drop.",
  "The blood-brain barrier (BBB) strictly regulates nutrient transport. In the elderly, degeneration or absence of BBB integrity severely disrupts the finely tuned supply and outflow of amino acids.",
  "Myasthenia gravis is an autoimmune disease where autoantibodies block or destroy postsynaptic nicotinic acetylcholine receptors at the neuromuscular junction, drastically reducing their number and causing weakness."
];

const data = fs.readFileSync('c:\\samu_mcq\\format.js', 'utf8');
const rawTextMatch = data.match(/\$CATEGORY:[\s\S]+?(?=`;)/);
if (!rawTextMatch) throw new Error("Could not find raw text in format.js");

const rawText = rawTextMatch[0];

const lines = rawText.split('\n');
let categories = [];
let curCat = null;
let curQ = null;

for(let line of lines) {
  line = line.trim();
  if(!line) continue;
  if(line.startsWith('$CATEGORY')) {
    curCat = { qs: [] };
    categories.push(curCat);
    continue;
  }
  if(line.includes('{') && !line.startsWith('=') && !line.startsWith('~')) {
    curQ = { q: line.replace('{','').trim(), ops: [] };
    curCat.qs.push(curQ);
  } else if (line.startsWith('=')) {
    curQ.ops.push(line.substring(1).trim());
  } else if (line.startsWith('~')) {
    curQ.ops.push(line.substring(1).trim());
  }
}

let explanationIndex = 0;
let out = `export const s_2_1_situational = {\n`;

categories.forEach((cat, idx) => {
  out += `  "t-s-2-1-${idx}": [\n`;
  cat.qs.forEach((q, qidx) => {
    out += `    {\n`;
    out += `      "question": ${JSON.stringify(q.q)},\n`;
    out += `      "options": [\n`;
    q.ops.forEach((op, opidx) => {
      out += `        ${JSON.stringify(op)}${opidx === q.ops.length-1 ? '' : ','}\n`;
    });
    out += `      ],\n`;
    out += `      "correctIndex": 0,\n`;
    
    const expl = explanations[explanationIndex] || "";
    out += `      "explanation": ${JSON.stringify(expl)}\n`;
    explanationIndex++;

    out += `    }${qidx === cat.qs.length-1 ? '' : ','}\n`;
  });
  out += `  ]${idx === categories.length-1 ? '' : ','}\n`;
});

out += `};\n`;

fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-1-situational.js', out);
console.log('done');
