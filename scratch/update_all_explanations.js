const fs = require('fs');
const path = require('path');

// 1. Load biochemistryData.js using require
const biochemPath = path.resolve(__dirname, '../backend/src/data/biochemistryData.js');
const biochemData = require(biochemPath);

// Massive clinical/biochemical concept dictionary
const conceptDict = {
    // 🧬 Molecular Biology / Genetics
    "nucleic acids": "Nucleic acids (DNA and RNA) are biopolymers composed of nucleotide monomers, holding the cell's genetic blueprints.",
    "nucleotides": "Nucleotides are the fundamental units of nucleic acids, consisting of a pentose sugar, a phosphate group, and a nitrogenous base.",
    "purine": "Purines (Adenine and Guanine) are double-ringed heterocyclic aromatic compounds serving as key genetic carriers and metabolic energy agents.",
    "pyrimidine": "Pyrimidines (Cytosine, Thymine, Uracil) are single-ringed nitrogenous bases essential for genetic coding and DNA/RNA structure.",
    "uracil": "Uracil is a pyrimidine base specific to RNA, playing a key role in protein translation and coding.",
    "thymine": "Thymine is a pyrimidine base unique to DNA, pairing with Adenine to maintain double-helix stability.",
    "phosphodiether": "Phosphodiester (phosphodiether) bonds covalently link the sugar-phosphate backbone of DNA and RNA molecules.",
    "trna": "tRNA (transfer RNA) folds into a specific cloverleaf structure, carrying amino acids to ribosomes during translation.",
    "mrna": "mRNA (messenger RNA) carries transcription codes from DNA in the nucleus to ribosomes in the cytoplasm for translation.",
    "rrna": "rRNA (ribosomal RNA) serves as the primary catalytic and structural component of ribosomes.",
    "replication": "DNA replication is the matrix template synthesis of DNA, ensuring accurate transmission of genetic codes before cell division.",
    "transcription": "Transcription is the matrix-directed synthesis of RNA from a DNA template, catalyzed by RNA polymerase.",
    "translation": "Translation (broadcasting) is the ribosomal synthesis of polypeptide chains using an mRNA template.",
    "codon": "A codon is a three-nucleotide sequence in mRNA that codes for a specific amino acid or translation stop/start.",
    "anticodon": "An anticodon is a three-nucleotide sequence on tRNA that complementarily pairs with an mRNA codon.",
    "ribosome": "Ribosomes are ribonucleoprotein complexes acting as the physical and enzymatic sites of protein translation.",
    "exon": "Exons are the protein-coding regions of eukaryotic genes that are preserved during RNA splicing.",
    "intron": "Introns are non-coding segments of eukaryotic pre-mRNA that are excised during post-transcriptional splicing.",
    "operon": "Operons are functional units of genomic DNA containing a cluster of genes under the control of a single promoter.",
    "promoter": "Promoters are specific DNA sequences that initiate transcription by binding RNA polymerase.",

    // 🧪 Carbohydrate Metabolism
    "glycogen": "Glycogen is a highly branched homopolymer of glucose serving as the primary short-term carbohydrate reserve in human liver and muscle.",
    "glycogenolysis": "Glycogenolysis is the enzymatic degradation of glycogen to glucose-1-phosphate, critical for maintaining systemic blood sugar.",
    "glycogenesis": "Glycogenesis is the anabolic pathway synthesizing glycogen from glucose-6-phosphate during periods of nutritional abundance.",
    "gluconeogenesis": "Gluconeogenesis is the hepatic synthesis of glucose from non-carbohydrate precursors (like lactate, glycerol, and amino acids) during fasting.",
    "glycolysis": "Glycolysis is the anaerobic metabolic pathway that converts glucose into pyruvate, generating ATP and NADH.",
    "insulin": "Insulin is an anabolic hormone secreted by pancreatic beta cells that lowers blood glucose by promoting glucose entry and glycogen storage.",
    "glucagon": "Glucagon is a counter-regulatory catabolic hormone secreted by pancreatic alpha cells that elevates blood glucose by initiating glycogenolysis.",
    "epinephrine": "Epinephrine (adrenaline) is a stress hormone that rapidly triggers glycogen breakdown in muscle and liver for emergency energy mobilization.",
    "glucose": "Glucose is the primary monosaccharide used as a universal metabolic fuel source by human tissues, especially the brain.",
    "galactose": "Galactose is a monosaccharide derived from lactose hydrolysis, metabolized primarily in the liver.",
    "fructose": "Fructose is a monosaccharide processed via fructolysis in the liver, bypassing the rate-limiting phosphofructokinase-1 step of glycolysis.",
    "lactate": "Lactate is produced from pyruvate during anaerobic glycolysis, serving as a substrate for gluconeogenesis in the Cori cycle.",

    // 🥩 Amino Acids & Urea Cycle
    "amino acid": "Amino acids are the amine- and carboxyl-bearing monomers of proteins, classified by their variable side chains (R groups).",
    "peptide": "Peptide bonds are covalent amide links connecting amino acid residues in proteins and polypeptides.",
    "transaminase": "Transaminases (aminotransferases) use pyridoxal phosphate (PLP) to transfer amino groups, linking carbohydrate and amino acid pathways.",
    "urea": "Urea is the non-toxic nitrogenous carrier synthesized in the liver via the urea cycle to safely excrete ammonia.",
    "ammonia": "Ammonia is a highly neurotoxic byproduct of amino acid deamination, rapidly converted to urea in the liver.",
    "bilirubin": "Bilirubin is the yellow breakdown product of normal heme catabolism, conjugated with glucuronic acid in the liver before biliary excretion.",
    "alanine": "Alanine is a non-essential glucogenic amino acid, acting as a primary nitrogen carrier from skeletal muscle to the liver.",
    "glutamate": "Glutamate is a glucogenic amino acid, acting as a key neurotransmitter and central collector of amino groups during transamination.",
    "phenylalanine": "Phenylalanine is an essential aromatic amino acid; deficiency in its metabolism leads to phenylketonuria (PKU).",
    "tyrosine": "Tyrosine is a non-essential amino acid synthesized from phenylalanine, serving as the precursor for catecholamines, thyroid hormones, and melanin.",

    // 🧈 Lipids & Cholesterol
    "cholesterol": "Cholesterol is a vital eukaryotic cell membrane sterol and the precursor to bile acids, vitamin D, and steroid hormones.",
    "bile acid": "Bile acids are amphipathic molecules synthesized from cholesterol in the liver that emulsify dietary fats for absorption.",
    "lipoprotein": "Lipoproteins (Chylomicrons, VLDL, LDL, HDL) are macromolecular complexes of lipids and proteins transporting fats through the bloodstream.",
    "triglyceride": "Triglycerides (triacylglycerols) are esters of glycerol and three fatty acids, acting as the primary long-term energy reserve.",
    "phospholipid": "Phospholipids are major structural lipids containing a hydrophilic head and hydrophobic tails, forming the cellular bilayer.",
    "ketone": "Ketone bodies (acetoacetate, beta-hydroxybutyrate) are water-soluble lipid derivatives synthesized by the liver during fasting as alternative fuels.",

    // 💊 Vitamins & Coenzymes
    "vitamin a": "Vitamin A (retinol) is a fat-soluble vitamin essential for visual phototransduction, epithelial tissue maintenance, and gene regulation.",
    "thiamine": "Vitamin B1 (thiamine) is a water-soluble cofactor essential for oxidative decarboxylation in carbohydrate metabolism (e.g., PDH, alpha-KGDH).",
    "riboflavin": "Vitamin B2 (riboflavin) is the precursor to FAD and FMN, crucial for redox reactions in the respiratory chain and Krebs cycle.",
    "niacin": "Vitamin B3 (niacin/PP) is the precursor to NAD and NADP, essential for electron transport and redox biosyntheses.",
    "pantothenic": "Vitamin B5 (pantothenic acid) is a vital precursor to Coenzyme A (CoA-SH) and the acyl carrier protein, key in fatty acid synthesis.",
    "pyridoxine": "Vitamin B6 (pyridoxine/PLP) is the indispensable coenzyme for transaminations, decarboxylations, and glycogen phosphorylase activity.",
    "biotin": "Vitamin B7 (biotin) acts as the prosthetic group for carboxylase enzymes (e.g., pyruvate carboxylase, acetyl-CoA carboxylase).",
    "folate": "Vitamin B9 (folate) is essential for single-carbon transfer reactions in nucleotide synthesis and amino acid metabolism.",
    "cobalamin": "Vitamin B12 (cobalamin) is a cobalt-containing vitamin crucial for methionine synthesis and odd-chain fatty acid metabolism.",
    "ascorbic": "Vitamin C (ascorbic acid) is a water-soluble antioxidant required for collagen hydroxylation and iron absorption.",
    "vitamin d": "Vitamin D (calcitriol) is a steroid-like hormone regulating systemic calcium and phosphate homeostasis.",
    "vitamin e": "Vitamin E (tocopherol) is a lipid-soluble antioxidant protecting cellular membranes from free radical lipid peroxidation.",
    "vitamin k": "Vitamin K is a fat-soluble cofactor necessary for the post-translational gamma-carboxylation of clotting factors (II, VII, IX, X).",

    // ⚡ Enzymes & Energetics
    "enzyme": "Enzymes are highly specific macromolecular catalysts that dramatically lower reaction activation energy.",
    "amylase": "Amylase (e.g., salivary and pancreatic) is an enzyme that hydrolyzes alpha-1,4-glycosidic bonds in dietary starches.",
    "lipase": "Lipase catalyzes the hydrolysis of lipids, essential for dietary fat digestion and intracellular fat mobilization.",
    "pepsin": "Pepsin is an acidic protease secreted by gastric chief cells, initiating protein digestion in the stomach.",
    "atp": "Adenosine triphosphate (ATP) is the universal biological energy currency, storing metabolic energy in its phosphoanhydride bonds.",
    "creatine": "Creatine phosphate acts as a rapid anaerobic ATP regenerator in skeletal muscle and cardiac tissues.",
    "ldh": "Lactate dehydrogenase (LDH/LDG) reversibly interconverts pyruvate and lactate, acting as a crucial clinical biomarker."
};

function dynamicRephrase(question, answer) {
    let q = question.trim();
    if (q.endsWith('?')) q = q.slice(0, -1);
    
    // Strip trailing helper phrases
    q = q.replace(/\s+called$/i, '')
         .replace(/\s+known\s+as$/i, '')
         .replace(/\s+characterized$/i, '');
         
    // Grammar cleanup
    q = q.replace(/^what\s+kind\s+of\s+/i, 'the ')
         .replace(/^what\s+type\s+of\s+/i, 'the ');

    // 1. Apoptosis / Necrosis special patterns
    if (q.toLowerCase().includes("apoptosis") && answer.toLowerCase() === "elimination") {
        return "Elimination of specific cells is a key outcome of apoptosis, which is the programmed cell death mechanism that removes unwanted or damaged cells without causing inflammatory damage.";
    }
    if (q.toLowerCase().includes("inflammatory processes") && answer.toLowerCase() === "necrosis") {
        return "Necrosis refers to the premature, pathological death of cells and living tissue caused by external factors (like injury or infection), which triggers an inflammatory response.";
    }

    // 2. Clover leaf pattern
    if (q.toLowerCase().includes("clover leaf") || q.toLowerCase().includes("cloverleaf")) {
        return `${answer} is the specific nucleic acid characterized by a cloverleaf tertiary folding structure, essential for translation coding.`;
    }

    // 3. What is / What are
    if (q.match(/^what\s+is\s+/i)) {
        let predicate = q.replace(/^what\s+is\s+/i, '');
        predicate = predicate.charAt(0).toLowerCase() + predicate.slice(1);
        return `${answer} refers to ${predicate}, representing a fundamental concept in biochemistry.`;
    }
    if (q.match(/^what\s+are\s+/i)) {
        let predicate = q.replace(/^what\s+are\s+/i, '');
        predicate = predicate.charAt(0).toLowerCase() + predicate.slice(1);
        return `${answer} are defined as ${predicate}.`;
    }
    
    // 4. Which
    if (q.match(/^which\s+/i)) {
        let predicate = q.replace(/^which\s+/i, '');
        return `${answer} is the specific ${predicate}.`;
    }
    
    // 5. Where
    if (q.match(/^where\s+/i)) {
        let predicate = q.replace(/^where\s+/i, '');
        return `${answer} is the precise site where ${predicate}.`;
    }
    
    // 6. Name
    if (q.match(/^name\s+/i)) {
        let predicate = q.replace(/^name\s+/i, '');
        return `${answer} is a primary example of ${predicate}.`;
    }
    
    // 7. How
    if (q.match(/^how\s+/i)) {
        let predicate = q.replace(/^how\s+/i, '');
        return `${answer} describes how ${predicate}.`;
    }

    // 8. Show / Select / Identify
    if (q.match(/^show\s+/i)) {
        let predicate = q.replace(/^show\s+/i, '');
        return `${answer} is the ${predicate}.`;
    }
    if (q.match(/^select\s+/i)) {
        let predicate = q.replace(/^select\s+/i, '');
        return `${answer} is selected as the ${predicate}.`;
    }
    if (q.match(/^identify\s+/i)) {
        let predicate = q.replace(/^identify\s+/i, '');
        return `${answer} is identified as the ${predicate}.`;
    }
    
    // General fallback
    return `${answer} is the correct answer to the question regarding "${question.toLowerCase().replace('?', '')}".`;
}

function generatePremiumExplanation(question, answer, subjKey, tKey) {
    const qLower = question.toLowerCase();
    const aLower = answer.toLowerCase();
    
    // 1. Check specific match in rich concept dictionary
    for (const [key, value] of Object.entries(conceptDict)) {
        if (qLower.includes(key) || aLower.includes(key)) {
            return `${answer} is correct. ${value} This aligns with established biochemical pathways and clinical diagnostics.`;
        }
    }
    
    // 2. Synthesize dynamic grammatical rephrasing of the question
    return dynamicRephrase(question, answer);
}

// 2. Scan and enhance explanations in biochemistryData.js
let generatedCount = 0;
let totalChecked = 0;

['s-2-0', 's-2-1'].forEach(subjKey => {
    const subj = biochemData[subjKey];
    if (!subj) return;
    
    Object.keys(subj).forEach(tKey => {
        const topic = subj[tKey];
        ['test', 'situational'].forEach(type => {
            if (Array.isArray(topic[type])) {
                topic[type].forEach(q => {
                    totalChecked++;
                    const answer = q.options[q.correctIndex !== undefined ? q.correctIndex : 0];
                    
                    // We rewrite explanations that contain generic text, or are empty, or were topic-based fallbacks (containing "directly satisfies the clinical diagnostic requirements")
                    if (!q.explanation || 
                        q.explanation.trim() === '' || 
                        q.explanation.includes('established clinical curriculum') ||
                        q.explanation.includes('directly satisfies the clinical diagnostic requirements')) {
                            q.explanation = generatePremiumExplanation(q.question, answer, subjKey, tKey);
                            generatedCount++;
                    }
                });
            }
        });
    });
});

console.log(`🎉 Evaluated ${totalChecked} questions in biochemistryData.js. Upgraded/re-synthesized ${generatedCount} explanations.`);

// Save updated biochemistryData.js with clean CJS structure
const updatedBiochemContent = `const BIOCHEMISTRY_MCQS = ${JSON.stringify(biochemData, null, 2)};\n\nmodule.exports = BIOCHEMISTRY_MCQS;\n`;
fs.writeFileSync(biochemPath, updatedBiochemContent, 'utf8');
console.log('✅ Saved updated biochemistryData.js to backend.');


// 3. Propagate to mobile app files: s-2-0.js, s-2-0-situational.js, s-2-1.js, s-2-1-situational.js

// PROPAGATION 1: mobile-app/.../s-2-0.js
const s20Path = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-0.js');
let s20Content = fs.readFileSync(s20Path, 'utf8');
let s20Stripped = s20Content.replace(/export\s+const\s+s_2_0\s*=\s*/g, '').trim();
if (s20Stripped.endsWith(';')) s20Stripped = s20Stripped.slice(0, -1);
let s20Data = eval('(' + s20Stripped + ')');

const bS20 = biochemData["s-2-0"];
Object.keys(s20Data).forEach(mobileTKey => {
    const idx = parseInt(mobileTKey.split('-').pop());
    const biochemTKey = `t-s-2-0-${idx + 1}`;
    const bTopic = bS20[biochemTKey];
    
    if (bTopic && Array.isArray(bTopic.test)) {
        s20Data[mobileTKey].forEach((q, qIdx) => {
            const bQ = bTopic.test[qIdx];
            if (bQ && bQ.explanation) {
                q.explanation = bQ.explanation;
            }
        });
    }
});
fs.writeFileSync(s20Path, `export const s_2_0 = ${JSON.stringify(s20Data, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to mobile-app s-2-0.js.');


// PROPAGATION 2: mobile-app/.../s-2-0-situational.js
const s20SitPath = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-0-situational.js');
let s20SitContent = fs.readFileSync(s20SitPath, 'utf8');
let s20SitStripped = s20SitContent.replace(/export\s+const\s+s_2_0_situational\s*=\s*/g, '').trim();
if (s20SitStripped.endsWith(';')) s20SitStripped = s20SitStripped.slice(0, -1);
let s20SitData = eval('(' + s20SitStripped + ')');

Object.keys(s20SitData).forEach(mobileTKey => {
    const idx = parseInt(mobileTKey.split('-').pop());
    const biochemTKey = `t-s-2-0-${idx + 1}`;
    const bTopic = bS20[biochemTKey];
    
    if (bTopic && Array.isArray(bTopic.situational)) {
        s20SitData[mobileTKey].forEach((q, qIdx) => {
            const bQ = bTopic.situational[qIdx];
            if (bQ && bQ.explanation) {
                q.explanation = bQ.explanation;
            }
        });
    }
});
fs.writeFileSync(s20SitPath, `export const s_2_0_situational = ${JSON.stringify(s20SitData, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to mobile-app s-2-0-situational.js.');


// PROPAGATION 3: mobile-app/.../s-2-1.js
const s21Path = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-1.js');
let s21Content = fs.readFileSync(s21Path, 'utf8');
let s21Stripped = s21Content.replace(/export\s+const\s+s_2_1\s*=\s*/g, '').trim();
if (s21Stripped.endsWith(';')) s21Stripped = s21Stripped.slice(0, -1);
let s21Data = eval('(' + s21Stripped + ')');

const bS21 = biochemData["s-2-1"];
Object.keys(s21Data).forEach(mobileTKey => {
    const idx = parseInt(mobileTKey.split('-').pop());
    const biochemTKey = `t-s-2-1-${idx + 1}`;
    const bTopic = bS21[biochemTKey];
    
    if (bTopic && Array.isArray(bTopic.test)) {
        s21Data[mobileTKey].forEach((q, qIdx) => {
            const bQ = bTopic.test[qIdx];
            if (bQ && bQ.explanation) {
                q.explanation = bQ.explanation;
            }
        });
    }
});
fs.writeFileSync(s21Path, `export const s_2_1 = ${JSON.stringify(s21Data, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to mobile-app s-2-1.js.');


// PROPAGATION 4: mobile-app/.../s-2-1-situational.js
const s21SitPath = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-1-situational.js');
let s21SitContent = fs.readFileSync(s21SitPath, 'utf8');
let s21SitStripped = s21SitContent.replace(/export\s+const\s+s_2_1_situational\s*=\s*/g, '').trim();
if (s21SitStripped.endsWith(';')) s21SitStripped = s21SitStripped.slice(0, -1);
let s21SitData = eval('(' + s21SitStripped + ')');

Object.keys(s21SitData).forEach(mobileTKey => {
    const idx = parseInt(mobileTKey.split('-').pop());
    const biochemTKey = `t-s-2-1-${idx + 1}`;
    const bTopic = bS21[biochemTKey];
    
    if (bTopic && Array.isArray(bTopic.situational)) {
        s21SitData[mobileTKey].forEach((q, qIdx) => {
            const bQ = bTopic.situational[qIdx];
            if (bQ && bQ.explanation) {
                q.explanation = bQ.explanation;
            }
        });
    }
});
fs.writeFileSync(s21SitPath, `export const s_2_1_situational = ${JSON.stringify(s21SitData, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to mobile-app s-2-1-situational.js.');


// 4. PROPAGATION 5: backend consolidated mcqRepository.js using direct require
const repoPath = path.resolve(__dirname, '../backend/src/data/mcqRepository.js');
const repoData = require(repoPath);

// Map biochemistryData.js["s-2-0"] and ["s-2-1"] into mcqRepository.js
["s-2-0", "s-2-1"].forEach(subjKey => {
    const bSubj = biochemData[subjKey];
    const rSubj = repoData[subjKey];
    if (bSubj && rSubj) {
        Object.keys(rSubj).forEach(rTKey => {
            const bTopic = bSubj[rTKey];
            if (bTopic && Array.isArray(bTopic.test)) {
                rSubj[rTKey].forEach((q, idx) => {
                    const bQ = bTopic.test[idx];
                    if (bQ && bQ.explanation) {
                        q.explanation = bQ.explanation;
                    }
                });
            }
        });
    }
});
fs.writeFileSync(repoPath, `module.exports = ${JSON.stringify(repoData, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to backend mcqRepository.js.');


// 5. PROPAGATION 6: backend anatomyData.js (backup/full registry) using direct require
const anatPath = path.resolve(__dirname, '../backend/src/data/anatomyData.js');
const anatData = require(anatPath);

["s-2-0", "s-2-1"].forEach(subjKey => {
    const bSubj = biochemData[subjKey];
    const aSubj = anatData[subjKey];
    if (bSubj && aSubj) {
        Object.keys(aSubj).forEach(aTKey => {
            const bTopic = bSubj[aTKey];
            if (bTopic) {
                if (Array.isArray(aSubj[aTKey]) && Array.isArray(bTopic.test)) {
                    aSubj[aTKey].forEach((q, idx) => {
                        const bQ = bTopic.test[idx];
                        if (bQ && bQ.explanation) {
                            q.explanation = bQ.explanation;
                        }
                    });
                } else {
                    ['test', 'situational'].forEach(type => {
                        if (Array.isArray(bTopic[type]) && aSubj[aTKey] && Array.isArray(aSubj[aTKey][type])) {
                            aSubj[aTKey][type].forEach((q, idx) => {
                                const bQ = bTopic[type][idx];
                                if (bQ && bQ.explanation) {
                                    q.explanation = bQ.explanation;
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});
fs.writeFileSync(anatPath, `module.exports = ${JSON.stringify(anatData, null, 2)};\n`, 'utf8');
console.log('✅ Propagated updated explanations to backend anatomyData.js.');

console.log('\n🏁 Master propagation script executed successfully. All local file stores synchronized.');
