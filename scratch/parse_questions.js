const fs = require('fs');
const path = require('path');

const rawText = `
What is the monomer of nucleic acids:{
=Nucleotides
~Amino acids
~Monosaccharides
~Peptides
}

Show the heterocyclic compound that forms the basis of the structure of adenine:{
=Purine
~Pyrimidine
~Imidazole
~Tryptophan
}

Show the nitrogenous base that is formed during the recovery of the RNA chain from the DNA chain:{
=Uracil
~Adenine
~Guanine
~Cytosine
}

What kind of bond provides the primary structure of DNA and RNA:{
=Phosphodiether
~Glycoside
~Peptide
~Hydrophobic
}

Name a structural component that is not specific to DNA:{
=dUMF
~dAMF
~dSMF
~dTMF
}

Select a matrix biosynthesis process:{
=Everything is correct
~Replication
~Transcription
~Broadcasting
}

Clover leaf structure is characteristic for which nucleic acid:{
=tRNA
~Tertiary structure of DNA
~mRNA
~mRNA
}

Which type of nucleic acid contains thymine?{
=DNA
~rRNA
~mRNA
~tRNA
}

Nucleoproteins are representatives of:{
=Ribosome
~Microsome
~Liposome
~Lysosome
}

Splicing is:{
=Introns are cut and exons are joined
~Copying of RNA molecules
~Cutting of exons, splicing of introns
~An adenylate residue is attached to the 3-end of the mRNA molecule
}

Enzyme involved in replication:{
=Helicase
~Insertase
~DNA hydrolase
~Phosphokinase
}

What is not involved in the replication process:{
=m-RNA
~Primer
~Primaza
~DNA polymerase
}

Select substrates for DNA polymerase{
=dATF, dGTF, dSTF, dTTF
~ATF, GTF, UTF, STF
~ATF, GTF, STF, TTF
~AMF, GMF, TMF, SMF
}

Enzyme involved in repair:{
=Purine-insertase
~RNA polymerase
~Helicase
~s.s.b proteins
}

Determine the name of the chemical bond that forms the primary structure of the DNA molecule{
=Phosphodiether
~Hydrogen
~Coordination
~Disulfide
}

What determines the primary structure of RNA?{
=A single strand of DNA
~Two strands of DNA
~RNA polymerase
~ribosome
}

How many types of mRNA are there?{
=the type of molecules is equal to the number of proteins
~61 different molecules
~3 different molecules
~64 different molecules
}

How many types of tRNA are there?{
=61 different molecules
~the type of molecules is equal to the number of proteins
~3 different molecules
~64 different molecules
}

How is one strand connected to another to form the secondary structure of DNA:{
=hydrogen bonds
~covalent bonds
~ionic interactions
~hydrophobic bonds
}

Information storage parts of transcriptons:{
=exon
~acceptor
~operon
~intron
}

Show the part of the transcripton where the repressor protein binds:{
=operator
~promoter
~operon
~intron
}

What is the mechanism of sickle cell anemia?{
=substitution of a nitrogenous base in a gene
~dropping a nucleotide from the gene
~entering the nucleotide into the gene
~substitution of termination codon instead of sense codon
}

Point mutations-{
=Change of nitrogen bases in DNA molecule
~Multiple damage to the DNA molecule
~Change in enzyme activity
~Change in gene operator activity
}

Primary transcript content:{
=exon+intron
~exon only
~intron only
~operon
}

Define transcription{
=DNA-based RNA synthesis
~RNA-based DNA synthesis
~DNA-based protein synthesis
~RNA-based protein synthesis
}

RNA maturation process:{
=Processing
~Splicing
~Broadcasting
~Transcription
}

In the process of processing occurs:{
=All answers are correct
~Excision of introns
~Splicing of nonsense codons
~Modification of informative parts
}

What is reparation?{
=Repair of damaged parts of DNA
~Repair of damaged RNA fragments
~The origin of mutations in DNA
~DNA synthesis based on RNA
}

Not used in RNA synthesis{
=TTF
~ATF
~GTF
~STF
}

Factor causing mutation:{
=Ion radiations
~Somatic diseases
~Hunger
~Obesity
}
`;

function parseGIFT(text) {
    const blocks = text.trim().split(/(?:\r?\n){2,}/);
    const questions = [];

    for (const block of blocks) {
        if (!block.trim()) continue;
        
        // Find question part and choices part
        const match = block.match(/^([^{]+)\{([^}]+)\}/s);
        if (!match) {
            console.error('Failed to parse block:', block);
            continue;
        }

        let question = match[1].trim();
        // Remove trailing colon or similar
        question = question.replace(/[:-]$/, '').trim();
        // Add trailing colon if that was the original style in some files, but wait, let's keep it clean or add colon.
        // Looking at the provided questions, some have colons and some don't. Let's make sure they end with proper punctuation (question mark or colon).
        if (!question.endsWith('?') && !question.endsWith(':')) {
            question += ':';
        }

        const choicesText = match[2].trim();
        const lines = choicesText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        let correctOption = '';
        const distractors = [];

        for (const line of lines) {
            if (line.startsWith('=')) {
                correctOption = line.substring(1).trim();
            } else if (line.startsWith('~')) {
                distractors.push(line.substring(1).trim());
            }
        }

        if (!correctOption) {
            console.error('No correct option found for block:', block);
            continue;
        }

        const options = [correctOption, ...distractors];

        questions.push({
            question,
            options,
            correctIndex: 0
        });
    }

    return questions;
}

const parsedQuestions = parseGIFT(rawText);
console.log(`Parsed ${parsedQuestions.length} questions.`);

// Format for biochemistryData.js (explanation = "")
const formatData = parsedQuestions.map(q => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: ""
}));

// Format for mcqRepository.js and s-2-1.js (explanation with standard template)
const formatRepo = parsedQuestions.map(q => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: `The correct answer is '${q.options[0]}'. This choice aligns with the established clinical curriculum.`
}));

fs.writeFileSync(path.join(__dirname, 'parsed_biochem_data.json'), JSON.stringify(formatData, null, 2));
fs.writeFileSync(path.join(__dirname, 'parsed_biochem_repo.json'), JSON.stringify(formatRepo, null, 2));
console.log('Saved parsed files.');
