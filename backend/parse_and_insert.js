const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RAW_DATA = `
# TOPIC : 13

## Question 1

A patient presented with upper back pain. MRI imaging demonstrated inflammation of the T8-T9 vertebral bodies consistent with osteomyelitis. A bone marrow biopsy, when cultured, produced colonies of Gram-positive cocci. Colonies on sheep blood agar were 3–4 mm in diameter, off-white and beta-hemolytic. Colonies on brain-heart infusion agar were 2–3 mm in diameter and golden-yellow. Catalase and coagulase tests were positive. What was the most likely pathogen?

a. Streptococcus pneumoniae
**b. Staphylococcus aureus**
c. Staphylococcus epidermidis
d. Streptococcus pyogenes

---

## Question 2

A young man has a large pus-filled abscess on his upper arm but does not go to a doctor. Several days later he is brought to the Emergency Room with fever, hypotension, and multiple organ failure. Which of the following is most likely to be responsible?

a. Shigella dysenteriae Shiga Toxin
**b. Staphylococcus aureus Toxic Shock Syndrome Toxin-1**
c. Streptococcus pyogenes Erythrogenic toxin
d. Clostridium perfringens α-toxin

---

## Question 3

A young man has a large pus-filled abscess on his upper arm but does not go to a doctor. Several days later he is brought to the Emergency Room with fever, hypotension, and multiple organ failure. Which of the following is most likely to be responsible?

a. Shigella dysenteriae Shiga Toxin
b. Clostridium perfringens ?-toxin
**c. Staphylococcus aureus Toxic Shock Syndrome Toxin-1**
d. Streptococcus pyogenes Erythrogenic toxin

---

## Question 4

Bacteria which produces coagulase is

a. S hominis
b. S epidermidis
**c. S aureus**
d. S saprophyticus

---

## Question 5

Coagulase-reacting factor is necessary for

a. slide coagulase test
b. none of these
c. precipitation test
**d. tube coagulase test**

---

## Question 6

Identify the bacteria which is oxidase-negative and catalase-positive?

a. Neisseria
**b. Staphylococcus**
c. Pseudomonas
d. Streptococcus

---

## Question 7

Members of a family suffer acute attacks of nausea and vomiting a few hours after returning from a daylong picnic, at which they ate hamburgers, potato salad, and custard pie. By morning everyone is feeling better. Which bacterial toxin is most likely to have caused their symptoms?

**a. Staphylococcus aureus**
b. Escherichia coli Labile Toxin
c. Clostridium difficile Cytotoxin
d. Escherichia coli Stable Toxin

---

## Question 8

Most strains of Staphylococcus aureus indicate

**a. all of the above**
b. a golden-yellow pigment
c. phosphatase production
d. β-hemolysis on sheep blood agar

---

## Question 9

Protein A is found in cell wall of

a. none of these
b. Micrococci
**c. coagulase-negative staphylococci**
d. Staphylococcus aureus

---

## Question 10

Staphylococcal food poisoning usually manifests itself following ingestion of contaminated food after

a. 8–12 hours
b. 12–18 hours
c. 18–36 hours
**d. 2–6 hours**

---

## Question 11

The bacteria which are inhibited on crystal violet (1:500,000) blood agar, is/are

a. Both (a) and (b)
b. Streptococci
c. None of these
**d. Staphylococci**

---

## Question 12

The bacteria which can ferment mannitol anaerobically is

a. S epidermidis
b. None of these
c. S saprophyticus
**d. Staphylococcus aureus**

---

## Question 13

The bacteria which is novobiocin resistant is

a. None of these
b. S epidermidis
c. Staphylococcus aureus
**d. S saprophyticus**

---

## Question 14

The genus/genera that belongs to the family Micrococcaceae is

a. Planococcus
**b. All of these**
c. Micrococcus
d. Staphylococcus

---

## Question 15

The most common cause of cystitis (after Escherichia coli) in healthy sexually active women is

a. Pseudomonas aeruginosa
b. Proteus mirabilis
c. Klebsiella pneumoniae
**d. Staphylococcus saprophyticus**

---

## Question 16

The toxin of Staphylococcus aureus that may result into scalded skin syndrome is

a. Enterotoxin
b. Leucocidin
c. Haemolysin
**d. Epidermolytic toxin**

---

## Question 17

Which of the following bacterial toxins behaves as a superantigen through its stimulation of a very large fraction of the host T-cell population?

a. Salmonella LPS (endotoxin)
b. Pseudomonas Exotoxin A
**c. Staphylococcal toxic shock syndrome toxin**
d. Streptococcal streptolysin

---

## Question 18

Which of the following can be used to detect clumping factor?

a. precipitation test
b. none of these
c. tube coagulase test
**d. slide coagulase test**

---

## Question 19

Which of the following Staphylococcal haemolysins does not cause lysis of human RBCs?

a. γ haemolysin
b. β haemolysin
**c. α haemolysin**
d. δ haemolysin

---

## Question 20

Which of the following Staphylococcal haemolysins does not possess leucocidal activity?

**a. β haemolysin**
b. γ haemolysin
c. δ haemolysin
d. α haemolysin

---

# TOPIC : 14

## Question 1

The toxigenicity of causative agents of diphtheria is directly associated with determinants of toxigenicity (tox+-genes). Where do these genes localize?

a. In Hly plasmids
b. In DNA of causative agents
**c. In DNA of temperate phages**
d. In transposons

---

## Question 2

Thin, slender and gram-positive bacilli possessing metachromatic granules and showing Chinese letter arrangement are characteristic of:

a. Bacillus anthracis
b. Clostridium perfringens
c. Bordetella pertussis
**d. Corynebacterium diphtheriae**

---

## Question 3

What is the colonization site of Corynebacterium diphtheriae, the agent of diphtheria?

**a. throat**
b. eye
c. skin
d. all are false

---

## Question 4

What agent is the colonization site of Corynebacterium diphtheriae?

a. eye
b. urethra
**c. throat**
d. all are false

---

## Question 5

What nutrient media is necessary to use for cultivation of Corynebacterium diphtheriae?

a. sugar MPB, sugar MPA
b. Serum agar
**c. blood agar, blood tellurite agar**
d. Endo, Ploskirev

---

## Question 6

What serologic test was used? For examination of Corynebacterium diphtheriae toxigenicity these microbes were inoculated on the agar and paper strip impregnated with antitoxic serum was put on the surface of gel. After incubation precipitation lines between the bacterial plaques and paper strip appeared in agar.

a. Agglutination test
b. Opsonization test
c. Ring precipitation test
**d. Precipitation test in gel (Elek test)**

---

## Question 7

In an infectious department there is a girl, 10 years old with a diagnosis of diphtheria of pharynx. Toxigenic strain of Corynebacterium diphtheriae was isolated. How can you examine the strain toxicity?

a. test
b. By indirect haemagglutination test
c. By flocculation test
**d. By precipitation test in a gel**

---

## Question 8

Which of the following is NOT a major symptom of diphtheria?

**a. Flat, pink rash on abdomen**
b. Toxic complications
c. Inflammation of heart and nervous system
d. Formation of a leathery pseudomembrane

---

## Question 9

What nutrient media is necessary to use for cultivation of Corynebacterium diphtheriae?

a. Endo, Ploskirev
**b. blood agar, blood tellurite agar**
c. yolk-salt agar
d. sugar MPB, sugar MPA

---

## Question 10

During examination of bacterial carriers in the kindergarten one nurse showed the presence of Corynebacterium in her throat. The production of toxin by Corynebacterium diphtheriae was checked. It did not produce exotoxin. What test was used for examination of toxicity?

a. Ring precipitation test
**b. Precipitation test in gel**
c. Immunofluorescence test
d. Complement fixation test

---

## Question 11

According to epidemiological indication in preschool it is necessary to make vaccination against a whooping cough. What preparation may be used?

**a. Pertussis-diphtheria-tetanus vaccine**
b. Human immunoglobulin
c. Killed pertussis vaccine
d. live attenuated pertussis vaccine

---

## Question 12

Find the microbe that has the following characteristics: Thin, slender and gram-positive bacilli possessing metachromatic granules and showing Chinese letter arrangement

a. Bacillus anthracis
**b. Corynebacterium diphtheriae**
c. Clostridium perfringens
d. Bordetella pertussis

---

## Question 13

According to the type of respiration is diphtheria:

a. Microaerophilic bacteria
b. Capneic bacteria
**c. Facultative anaerobe**
d. Obligate anaerobe

---

## Question 14

During examination of bacterial carriers in the kindergarten one nurse showed the presence of Corynebacterium in her throat. The production of toxin by Corynebacterium diphtheriae was checked. What test was used for examination of toxicity?

a. Complement fixation test
**b. Precipitation test in gel**
c. Ring precipitation test
d. Immunofluorescence test

---

## Question 15

Find that which of the following is NOT a major symptom of Corynebacterium diphtheriae

a. Formation of a leathery pseudomembrane
**b. Flat, pink rash on abdomen**
c. Toxic complications
d. Inflammation of heart and nervous system

---

## Question 16

For a patient with suspicion of diphtheria microbiologist found rod-shaped bacteria with granules of volutin. What method might be used for staining?

**a. Neisser**
b. Anjesky
c. Gram
d. Burry Gins

---

## Question 17

In a smear from a patients tonsils with suspicion of diphtheria blue rod-shaped bacteria display terminal club-shaped swellings, which stained more intensely at their ends were revealed. What method of staining was used?

a. Gram
**b. Loeffler**
c. Neisser
d. Giemsa

---

## Question 18

The common substrate of cholera toxin (ctx) and diphtheria toxin (dtx) is

**a. ADP ribose**
b. elongation factor 2 (EF-2)
c. NAD
d. ATP

---

## Question 19

In a child with the suspicion of diphtheria a swab from the mucus membrane of pharynx was taken. After staining by Loefflers method dark-blue granules of volutin were revealed in bacteria. What value does their examination have?

a. Prophylactic
**b. Diagnostic**
c. All answers are correct
d. None of them

---

## Question 20

For examination of Corynebacterium diphtheriae toxigenicity these microbes were inoculated on the agar and paper strip impregnated with antitoxic serum was put on the surface of gel. After incubation precipitation lines between the bacterial plaques and paper strip appeared in agar. What serologic test was used?

a. Opsonization test
b. Kumbs test
c. Ring precipitation test
**d. Precipitation test in gel**

# TOPIC : 15

## Question 1

Blood culture yields a β-hemolytic Gram-negative rod. In this situation, which pathogen is most common?

**a. Escherichia coli**
b. Serratia marcescens
c. Klebsiella pneumoniae
d. Salmonella enteritidis

---

## Question 2

Which of the following descriptions best fits a typical strain of Escherichia coli?

**a. motile, aerogenic, lactose fermenting, indole positive**
b. motile, aerogenic, non-lactose fermenting, indole positive
c. non-motile, aerogenic, lactose fermenting mucoid colony
d. non-motile, ferments lactose slowly, gram negative

---

## Question 3

What is the most common cause of urinary tract infections?

**a. Enterococcus faecalis**
b. Staphylococcus epidermidis
c. Staphylococcus saprophyticus
d. Escherichia coli

---

## Question 4

Which of the following serotypes of Salmonella can cause gastroenteritis?

a. S. cholerae suis
b. All are true
c. S. Newport
**d. S. Enteritidis**

---

## Question 5

Which of the following bacteria can cause infectious type of food poisoning?

a. Staphylococcus aureus
**b. Salmonella enteritidis**
c. All are true
d. Clostridium perfringens

---

## Question 6

Each of the following statements concerning gram-negative rods is correct EXCEPT:

a. Proteus species are highly motile organisms that are found in the human colon and cause urinary tract infections
b. Escherichia coli ferments lactose, whereas the enteric pathogens Shigella and Salmonella do not
**c. Escherichia coli is part of the normal flora of the colon; therefore, it does not cause diarrhea**
d. All are true

---

## Question 7

Which one of the following organisms causes diarrhea by producing an enterotoxin that activates adenylate cyclase?

a. Staphylococcus aureus
b. Bacteroides fragilis
**c. Escherichia coli**
d. Enterococcus faecalis

---

## Question 8

Which of the following does not occur when an individual is infected with Salmonella enteritidis?

a. Salmonellosis
**b. Proteolytic enzymes cause necrosis**
c. Enterotoxins cause diarrhea
d. Endotoxins cause inflammation and fever

---

## Question 9

Hemolytic uremic syndrome is caused by which of the following bacterium?

a. Ureaplasma
b. Helicobacter pylori
c. Campylobacter jejuni
**d. Escherichia coli O157**

---

## Question 10

After inoculation of Escherichia coli on Ploskirev medium the growth of bacteria is inhibited. What chemical does predetermine this phenomenon?

a. fuchsin
b. Bismuth salts
c. oxalic acid
**d. brilliant green**

---

## Question 11

A lactose-fermenting Gram-negative rod is isolated from the bloody stool of a young child. Which pathogen is most likely?

**a. Escherichia coli**
b. Salmonella enterica
c. Shigella dysenteriae
d. Clostridium difficile

---

## Question 12

The pathogenesis of which one of the following diseases does NOT involve an exotoxin?

**a. Typhoid fever**
b. Botulism
c. Scarlet fever
d. All are true

---

## Question 13

Salmonella, Yersinia, Escherichia and Shigella are put together in Bergey’s Manual because they are all

a. none of the answers are correct
**b. gram-negative facultatively anaerobic rods**
c. pathogens
d. fermentative

---

## Question 14

Which of the following result(s) best describe(s) the listed organism?

a. Shigella sonnei – mannitol negative H2S (wk)
b. Clostridium perfringens – aerobes, sporulated
**c. E coli 0157 – lactose positive, indole positive**
d. Campylobacter jejuni – gram positive gull wings

---

## Question 15

Dysentery like disease may be caused by

**a. enteroinvasive E. coli**
b. enteroaggregative E. coli
c. enterotoxigenic E. coli
d. enteropathogenic Escherichia coli

---

## Question 16

In enteric fever, Salmonella may be isolated from:

a. blood
b. bile
c. urine
**d. All are true**

---

## Question 17

Infections with Salmonella enterica serotype typhi spread throughout the body. A key to the ability of serotype typhi to spread systemically is its ability to multiply intracellularly. Multiplication in which cell type(s) is principally responsible for systematic spread?

a. Basophils
**b. Monocytes/macrophages**
c. Neutrophils
d. Erythrocytes

---

## Question 18

For Escherichia coli most important which antigens?

a. flagellum
b. all are true
c. capsular
**d. somatic**

---

## Question 19

What is the primary cause of death from Salmonella typhi (Typhoid fever)?

a. Toxemia
**b. Hemorrhaging necrosis**
c. Vomiting
d. High fever

---

## Question 20

Which bacteria can produce on Endo medium dark pink colonies?

a. Shigella dysenteriae
**b. Escherichia coli**
c. Shigella sonnei
d. Salmonella enterica

---

# TOPIC : 16

## Question 1

A four-year-old boy was brought to the emergency room with a history of bloody diarrhea over the preceding two days. A fecal smear contained numerous red cells and neutrophils. Stool culture on Endo agar produced lactose-negative colonies amid colonies of “normal intestinal flora”. Which organism is most likely to be the cause of his illness?

a. Balantidium coli
b. Enteropathogenic E. coli
c. Giardia lamblia
**d. Shigella**

---

## Question 2

A laboratory got a sample from a patient with diarrhea. Which of the following media is an enrichment medium for the isolation of Shigella?

a. Tetrathionate broth
b. {
c. Endo medium
d. Alkaline peptone water
**e. Selenite F broth**

---

## Question 3

A young child develops bloody diarrhea, produced by Shigella infection. From which source was this infection most likely to have been contracted?

a. Rare hamburger
b. {
c. Spores present in soil
**d. Another child**
e. Dog or cat

---

## Question 4

A four-year-old boy was brought to the emergency room with a history of bloody diarrhea over the preceding two days. A fecal smear contained numerous red cells and neutrophils. Stool culture on Endo agar produced lactose-negative colonies amid colonies of “normal intestinal flora”. Which organism is most likely to be the cause of his illness?

**a. Shigella**
b. Enteropathogenic E. coli
c. Balantidium coli
d. Giardia lamblia

---

## Question 5

A laboratory got a sample from a patient with cholera. Which of the following tests would not differentiate Vibrio cholera non 01 from Vibrio parahaemolyticus?

**a. Growth on TCBS agar**
b. {
c. oxidase activity
d. Growth on special blood agar
e. Production of enterotoxin

---

## Question 6

A laboratory got a sample from a patient with diarrhea. Shigella is transmitted by

**a. infected food and water**
b. direct contact
c. {
d. louse
e. ticks

---

## Question 7

Which of the following tests may be used to differentiate Salmonella typhi from Shigella species?

a. gas production from glucose
**b. motility**
c. citrate utilization
d. {
e. glucose fermentation

---

## Question 8

The pathogenesis of which one of the following organisms is MOST likely to involve invasion of the intestinal mucosa?

a. Enterotoxigenic Escherichia coli
b. Vibrio cholerae
**c. Shigella sonnei**
d. Clostridium botulinum

---

## Question 9

Which of the following tests may be used to differentiate Salmonella paratyphi from Shigella species?

a. gram staining
b. citrate utilization of Simmons’ citrate agar
**c. gas production from glucose**
d. Fermentation of glucose

---

## Question 10

A patient got diarrhea. The pathogenesis of which one of the following organisms is MOST likely to involve invasion of the intestinal mucosa?

**a. Shigella sonnei**
b. Vibrio cholerae
c. Clostridium botulinum
d. {
e. Enterotoxigenic Escherichia coli

---

## Question 11

A laboratory got a sample from a patient with diarrhea. Shigella is transmitted by

a. {
**b. infected food and water**
c. ticks
d. air drop
e. louse

---

## Question 12

A young child develops bloody diarrhea, produced by Shigella infection. From which source was this infection most likely to have been contracted?

a. Rare hamburger
b. Cow, horse, or sheep
**c. Another child**
d. {
e. Dog or cat

---

## Question 13

A patient got severe diarrhea. If this patient had Shigellosis, the stool culture on MacConkey agar will grow:

a. pink colonies
**b. non-lactose fermenting colonies**
c. glucose fermenting colonies
d. black colonies
e. {

---

## Question 14

A young woman got a dysentery. Humans acquire shigellosis from:

**a. humans**
b. chickens
c. cats
d. dogs
e. {

---

## Question 15

Your patient is a 30-year-old woman who was part of a tour group visiting a N. country. The day before leaving, several members of the group developed fever, abdominal cramps, and bloody diarrhea. Which of the following bacterium is a causative agent of dysenteriae?

a. Proteus
b. {
**c. Shigella**
d. Vibrio
e. E. coli

---

## Question 16

Which microbe produce verotoxin?

a. S. dysentery serotype 2
**b. Shigella dysenteriae serotype I**
c. S. dysentery serotype 8
d. {
e. S. dysentery serotype 4

---

## Question 17

Salmonella, Yersinia, Escherichia and Shigella are put together in Bergey’s Manual because they are all

a. pathogens
b. fermentative
c. gram-positive aerobic cocci
d. {
**e. gram-negative facultatively anaerobic rods**

---

## Question 18

A young man got a dysentery. Which of the following is not true about Shigella?

a. Causes of bacillary dysentery
b. The organism multiplies directly in the host cell
c. Virulence is plasmid mediated
d. {
**e. Serotyping is based on O and H antigens**

---

## Question 19

The 6-year-old boy was brought to the emergency room with a history of bloody diarrhea over the preceding two days. A fecal smear contained numerous red cells and neutrophils. Stool culture on Endo agar produced lactose-negative colonies amid colonies of “normal intestinal flora”. Which of the organisms below is most likely to be the cause of his illness?

a. Enteropathogenic E. coli
b. Balantidium coli
**c. Shigella**
d. Giardia lamblia

---

## Question 20

5-years-old girl develops bloody diarrhea, produced by Shigella infection. From which source was this infection most likely to have been contracted?

a. Cow, horse, or sheep
b. Dog or cat
**c. Another child**
d. Rare hamburger

# TOPIC : 17

## Question 1

A patient has rapidly spreading soft-tissue infection with gas in infected tissue. Fluid from a blister contains many large Gram-positive rods which grow on sheep blood agar anaerobically but not aerobically. Which pathogen is most consistent with these findings?

a. Bacillus anthracis
**b. Clostridium perfringens**
c. Clostridium difficile
d. Bacillus cereus

---

## Question 2

Each of the following statements concerning Clostridium perfringens is correct EXCEPT:

a. It causes gas gangrene
b. It causes food poisoning
c. It produces an exotoxin that degrades lecithin and causes necrosis and hemolysis
**d. It is a gram-negative rod that does not ferment lactose**

---

## Question 3

Five days ago a 65-year-old woman with a lower urinary tract infection began taking ampicillin. She now has a fever and severe diarrhea. Of the organisms listed, which one is MOST likely to be the cause of the diarrhea?

a. Proteus mirabilis
b. Clostridium tetani
**c. Clostridium difficile**
d. Bacteroides fragilis

---

## Question 4

Choose the nutrient media on which it is possible to grow anaerobic microorganisms:

**a. Sugar-blood agar, Zoessler, Kitt-Tarozzi’s medium**
b. Meat-peptone agar, meat-peptone broth
c. Endo’s and Levin’s media
d. The curtailed serum, meat-peptone gelatin

---

## Question 5

Choose method of staining of bacterial spores, which are formed by C. perfringens:

a. Staining by Gram method
**b. Staining by Aujesko's method**
c. Staining by Ziehl-Neelsen's method
d. Staining by methylene blue

---

## Question 6

Each of the following statements concerning wound infections caused by Clostridium perfringens is correct EXCEPT:

**a. The organism grows only in human cell culture**
b. Anaerobic culture of the wound site should be ordered
c. An exotoxin plays a role in pathogenesis
d. Gram-positive rods are found in the exudate

---

## Question 7

Clostridium botulinum releases the most powerful biological poison which belongs to bacterial exotoxins. Choose from proposed list target cell for botulotoxin:

a. Sensitive neuron of spinal cord
b. Epithelial cell of the gut
c. Muscle cell
**d. Motoneuron of central nervous system**

---

## Question 8

Each of the following statements concerning Clostridium tetani is correct EXCEPT:

a. It is a gram-positive, spore-forming rod
**b. It is a facultative organization; it will grow on a blood agar plate in the presence of room air**
c. Pathogenesis is due to the production of an exotoxin that blocks inhibitory neurotransmitters
d. Its natural habitat is principally the soil

---

## Question 9

Each of the following statements concerning Bacteroides fragilis is correct EXCEPT:

a. B. fragilis infections are characterized by foul-smelling pus
b. The capsule of B. fragilis is an important virulence factor
c. B. fragilis is a gram-negative rod that is part of the normal flora of the colon
**d. fragilis forms Endospores, which allow it to survive in the soil**

---

## Question 10

Laboratory assistant has to isolate Clostridium tetani, anaerobic sporeforming bacterium, from wound exudation. What will he do before inoculation of material into appropriate culture medium?

**a. he heats the sample to kill asporogenous bacteria at 80°C for 20 min**
b. wound discharge should be frozen before inoculation to inhibit facultative anaerobes
c. he filtrates the material through cellulose filter
d. he will not do anything before investigation

---

## Question 11

Spores are necessary to bacteria for:

a. Survival into human and animal's organisms
b. Defense against phagocytosis
**c. Survival in an external environment**
d. Reproduction

---

## Question 12

Each of the following statements concerning Clostridium perfringens is correct EXCEPT:

a. It causes food poisoning
b. It causes gas gangrene
c. It produces an exotoxin that degrades lecithin and causes necrosis and hemolysis
**d. It is a gram-negative rod that does not ferment lactose**

---

## Question 13

Clostridium and Bacillus are unique among most bacteria in that they

**a. produce Endopores**
b. do not have teichoic acids
c. are acid-fast
d. are Gram positive

---

## Question 14

Each of the following organisms is an important cause of urinary tract infections EXCEPT:

a. Klebsiella pneumoniae
**b. Bacteroides fragilis**
c. Proteus mirabilis
d. Escherichia coli

---

## Question 15

Five days ago a 65-year-old woman with a lower urinary tract infection began taking ampicillin. She now has a fever and severe diarrhea. Of the organisms listed, which one is MOST likely to be the cause of the diarrhea?

a. Proteus mirabilis
b. Bordetella pertussis
**c. Clostridium difficile**
d. Bacteroides fragilis

---

## Question 16

Each of the following statements concerning exotoxins is correct EXCEPT:

**a. Botulism is caused by a toxin that hydrolyzes lecithin (lecithinase), thereby destroying nerve cells**
b. Some strains of Escherichia coli produce an enterotoxin that causes diarrhea
c. Cholera toxin acts by stimulating adenylate cyclase
d. Diphtheria is caused by an exotoxin that inhibits protein synthesis by inactivating an elongation factor

---

## Question 17

It is possible to cultivate obligate anaerobes on the special medium under absence of air. The most reliable method to create anaerobic condition will be next:

a. usage of thermostat
b. by inoculation into solid media (pour agar culture)
**c. usage of anaerostat**
d. usage of chemostat

---

## Question 18

Choose method of staining of bacterial spores, which are formed by C. tetani and C. botulinum:

a. Staining by Ziehl-Neelsen's method
b. Staining by Gram method
**c. Staining by Aujesko's method**
d. Staining by methylene blue

---

## Question 19

Each of the following statements concerning Clostridium tetani is correct EXCEPT:

**a. It is a facultative organization; it will grow on a blood agar plate in the presence of room air**
b. Pathogenesis is due to the production of an exotoxin that blocks inhibitory neurotransmitters
c. It is a gram-positive, spore-forming rod
d. Its natural habitat is primarily the soil

---

## Question 20

Special nutrient media on which it is possible to grow anaerobic microorganisms will be next:

a. The curtailed serum, meat-peptone gelatin
b. Meat-peptone agar, meat-peptone broth
c. medium Endo's and Levin's media
**d. Zoessler, Kitt-Tarozzi's**

# TOPIC : 18

## Question 1

Each of the following statements concerning Chlamydia infection with *Chlamydia psittaci* is correct EXCEPT:

a. All are true
**b. The infection is more commonly acquired from a nonhuman source than from another human**
c. C psittaci can be isolated by growth in cell culture and will not grow in blood agar
d. The organism appears purple in Gram-stained smears of sputum
e. The infection is more readily diagnosed by serologic tests than by isolation of the organism

---

## Question 2

Of the following organisms that can cross the placenta, which of the following is associated with congenital CN VIII deafness, mulberry molars, saddle nose, blindness, deafness, and cardiovascular problems?

a. Herpes, HIV
b. Cytomegalovirus
c. Toxoplasma gondii
d. Rubella
**e. Syphilis**

---

## Question 3

What is characteristic of primary syphilis?

**a. Painless chancre**
b. Several painless ulcers in genital region
c. Several painful ulcers in genital region
d. Disseminating rash on entire body, soles, and palms
e. Painful chancres

---

## Question 4

Lyme disease is caused by a

a. Chlamydiae
**b. a spirochete**
c. all are false
d. Rickettsiae
e. enteric bacteria

---

## Question 5

Ticks are vectors for the transmission of each of the following diseases EXCEPT:

a. Lyme disease
**b. epidemic typhus**
c. tularemia
d. All are true
e. Rocky Mountain spotted fever

---

## Question 6

Each of the following statements concerning spirochetes is correct EXCEPT:

a. Species of Borrelia cause a tick-borne disease called relapsing fever
b. All are true
c. Species of Treponema cause syphilis and yaws
**d. The species of Leptospira that cause leptospirosis grow primarily in humans and are usually transmitted by human-to-human contact**
e. Species of Treponema are part of the normal flora of the mouth

---

## Question 7

Indicate microbe which has sexual mode of transmission:

a. Leptoras interrogans
b. Borrelia recurrentis
**c. Treponema pallidum**
d. Treponema vincentii
e. Borrelia burgdorferi

---

## Question 8

Indicate disease caused by *Borrelia recurrentis*:

**a. Endemic relapsing fever**
b. Syphilis
c. Lyme disease
d. Enteric fever
e. Weil syndrome (icterohemorrhagic fever), canicola fever

---

## Question 9

Borrelia is classified with the spirochetes because it

a. none of the answers
**b. possesses an axial filament**
c. is a parent
d. is a pathogen
e. is aerobic

---

## Question 10

What stage of syphilis is characterized by disseminating rash, alopecia, lymphadenopathy, and flulike symptoms.

a. Congenital
b. Tertiary
**c. Secondary**
d. No correct answer
e. Primary

---

## Question 11

The tissue destruction and lesions observed in syphilis are primarily a consequence of which of the following?

a. Bacterial capsule
b. Bacterial endoflagellum
c. Bacterial overgrowth
**d. Host immune response**
e. Bacterial hyaluronidase

---

## Question 12

Each of the following statements concerning Q fever is correct EXCEPT:

a. It is caused by Coxiella burnetii
b. Farm animals are an important reservoir
c. It is transmitted by respiratory aerosol
**d. Rash is a prominent feature**

---

## Question 13

Each of the following statements concerning pneumonia caused by *Mycoplasma pneumoniae* is correct EXCEPT:

**a. The disease occurs primarily in immunocompetent individuals**
b. All are true
c. The disease is associated with a rise in the titer of cold agglutinins
d. The disease is one of the "atypical" pneumonias
e. The organism cannot be cultured in vitro because it has no cell wall

---

## Question 14

An 8-year-old boy living in a wooded area of Virginia suddenly developed fever, headache, and myalgia. On physical exam, a rash was noted on his limbs and trunk. Lesions of the rash were red and a few mm in diameter. No organisms were isolated from several blood cultures. The child was treated with tetracycline and recovered. Serologic tests of acute and convalescent serum samples from the child are most likely to reveal an increase in antibody titer to...

a. Chlamydia pneumoniae
b. Yersinia pestis
c. Francisella tularensis
d. Borrelia burgdorferi
**e. Rickettsia rickettsii**

---

## Question 15

Indicate disease caused by *Borrelia burgdorferi*:

a. Weil syndrome (icterohemorrhagic fever), canicola fever
b. Endemic relapsing fever
**c. Lyme disease**
d. Syphilis
e. Enteric fever

---

## Question 16

A 15-year-old female presented with a three-day history of fever, headache and a non-productive cough. Penicillin was prescribed and the patient was sent home. Her illness did not respond to this antibiotic. Gram stain and culture of the patient's sputum and a throat swab revealed only 'normal oral flora'. She was then successfully treated with erythromycin. Which organism below is most likely to have caused her illness?

**a. Mycoplasma pneumoniae**
b. Mycobacterium tuberculosis
c. Corynebacterium diphtheriae
d. Haemophilus influenzae
e. Streptococcus pneumoniae

---

## Question 17

Children born with congenital syphilis often exhibit the Hutchinson Triad, which includes deafness, blindness, and centrally notched teeth. If the mother has been exposed to Chlamydia, syphilis, or gonorrhea, the newborn may receive a prophylactic antibiotic for them:

a. Systemic antibiotic (via IV)
b. Mouth
c. Nose
**d. Eyes**
e. Ears

---

## Question 18

Indicate microbe which uses ticks for mode of transmission:

a. Borrelia recurrentis
**b. Borrelia burgdorferi**
c. Treponema vincentii
d. Treponema pallidum
e. Leptospiras interrogans

---

## Question 19

Indicate disease caused by *Treponema pallidum*:

a. Lyme disease
**b. Syphilis**
c. Endemic relapsing fever
d. Enteric fever
e. Weil syndrome (icterohemorrhagic fever), canicola fever

---

## Question 20

Indicate disease caused by *Leptospira interrogans*:

a. Enteric fever
b. Lyme disease
**c. Weil syndrome (icterohemorrhagic fever), canicola fever**
d. Syphilis
e. Endemic relapsing fever

# TOPIC : 19

## Question 1

Normal intestinal microflora (all are true except):

a. has antagonistic properties
b. the most diverse
**c. represented mainly by aerobes**
d. defines colonization resistance

---

## Question 2

Intestinal dysbacteriosis is characterized by (everything is correct except):

**a. increased colonization resistance**
b. a large number of fungi of the genus Candida
c. a decrease in the number of bifidobacteria
d. the presence of hemolysing Escherichia coli

---

## Question 3

The most physiological microorganisms for creating probiotics:

**a. bifidobacteria**
b. bacilli
c. E. coli
d. yeast

---

## Question 4

In the microbiological diagnosis of bacterial vaginosis, the following is mainly used:

a. serological method
b. bacteriological method
c. gas-liquid chromatography (GLC)
**d. microscopic method**

---

## Question 5

Reasons for the development of intestinal dysbacteriosis (all are true except):

a. Gastrointestinal diseases
b. endocrine disorders
**c. taking probiotics**
d. hormone therapy

---

## Question 6

Bacterial vaginosis:

a. STD
**b. non-inflammatory syndrome associated with vaginal dysbacteriosis**
c. highly contagious
d. is inherited

---

## Question 7

Indications for examination for intestinal dysbacteriosis:

a. work in children's organized groups
b. blood donation
**c. long-term bowel dysfunction**
d. work in the catering system

---

## Question 8

There is an increased risk of bacterial vaginosis (all are true except):

a. STD development
**b. the development of cardiovascular disease**
c. pathology of pregnancy
d. diseases of the uterus and appendages

---

## Question 9

For the specific treatment of dysbacteriosis, they use (everything is true, except):

**a. antibiotics**
b. probiotics
c. bacteriophages
d. prebiotics

---

## Question 10

Reasons for the development of intestinal dysbacteriosis (all are true except):

a. hormone therapy
**b. obtain probiotics**
c. Gastrointestinal diseases
d. endocrine disorders

---

## Question 11

Dysbacteriosis:

a. nosocomial infection
b. infectious disease
c. transmitted by contact
**d. violation of the quantitative and qualitative composition of the microflora**

---

## Question 12

There is an increased risk of bacterial vaginosis (all are true except):

a. viral infection activation
**b. the development of cardiovascular disease**
c. diseases of the uterus and appendages
d. pathology of pregnancy

---

## Question 13

Requirements for microorganisms that are part of probiotics (all are true except):

a. tolerance to obligate representatives of normoflora
b. no pathogenicity
**c. antagonism towards the majority of representatives of normal flora**
d. preservation of viability when introduced into the body

---

## Question 14

Probiotics are:

**a. representatives of normoflora**
b. vaccines
c. allergens
d. vitamins

---

## Question 15

The basis of the treatment of dysbacteriosis:

a. rational antibiotic therapy
**b. elimination of the cause of dysbacteriosis**
c. taking probiotics
d. immunity correction

---

## Question 16

The protective role of the normoflora of the vagina is provided (everything is true, except):

**a. phagocytosis of pathogens**
b. blocking receptors
c. by inducing an immune response
d. production of antimicrobial substances

---

## Question 17

The immunogenic function of normal microflora is associated with (all are correct except):

**a. formation of immunological tolerance to UPM**
b. production of antagonistically active substances
c. influence on the development of lymphoid tissue
d. immunomodulatory activity

---

## Question 18

Intestinal dysbacteriosis is detected by:

a. in serological testing
b. in an experiment on gnotobionts
c. during allergy testing
**d. in bacteriological examination**

---

## Question 19

Microscopy criteria for bacterial vaginosis (all are true except):

a. absence of lactobacilli
b. microflora is represented by gram-variable coccobacteria
**c. enunciated leukocyte reaction**
d. massive amount of microorganisms

---

## Question 20

Microscopy criteria for bacterial vaginosis (all are true except):

**a. pronounced leukocyte reaction**
b. microflora is represented by gram-variable coccobacteria
c. absence of lactobacilli
d. massive amount of microorganisms

---

# TOPIC : 20

## Question 1

Gram-positive cell walls are what percentage of peptidoglycan?

a. 5–10%
b. 25–30%
c. 50–60%
**d. 90–95%**

---

## Question 2

What do the RNA orthomyxoviruses cause?

a. Colds
**b. Influenza**
c. Yellow fever
d. Meningitis

---

## Question 3

Macrolides bind to the 50S subunit of the ribosome inhibiting translocation of the growing peptide chain. Which of these are examples of macrolides?

a. Amoxicillin
b. Vancomycin
**c. Erythromycin, azithromycin, clarithromycin**
d. Streptomycin, gentamicin

---

## Question 4

Salmonella causes Enteric fever (typhoid) and food poisoning. Is it a...

a. Gram positive cocci
**b. Gram negative bacilli**
c. Gram-positive bacilli
d. Fungi

---

## Question 5

Which virus is known to cause cervical cancer?

**a. Papillomavirus**
b. Paramyxoviruses
c. Parvovirus
d. Poxvirus

---

## Question 6

What does the protozoa plasmodia cause?

**a. Malaria**
b. Dysentery
c. Ringworm
d. Meningitis

---

## Question 7

For an anaerobic infection which drug is our first choice?

a. Amoxycillin
b. Vancomycin
**c. Metronidazole**
d. Gentamicin

---

## Question 8

What word describes a mutually beneficial relationship?

a. Saprophytic
b. Commensal
c. Pathogenic
**d. Symbiotic**

---

## Question 9

What does Streptococcus pneumoniae cause?

**a. Pneumonia, otitis media, meningitis**
b. Tonsillitis, cellulitis, scarlet fever, septicaemia
c. Boils, septicaemia, food poisoning, wound infections
d. Endocarditis, dental caries

---

## Question 10

Which of these causes AIDS?

a. Orthomyxoviruses
**b. Retroviruses**
c. Rhabdoviruses
d. Reoviruses

---

## Question 11

Which of these antibiotics works by inhibiting the folic acid converting enzyme?

**a. Trimethoprim**
b. Metronidazole
c. Amoxicillin
d. Rifampicin

---

## Question 12

What disease/condition does Haemophilus influenzae cause?

a. Endocarditis
**b. Respiratory and CNS infection, especially in infants**
c. Enteric fever
d. Cellulitis/skin infection

---

## Question 13

Which of these groups of antibiotics work by affecting nucleic acid function or synthesis?

a. Aminoglycosides
b. Sulfonamides
c. Macrolides
**d. Quinolones and fluoroquinolones**

---

## Question 14

What does Staphylococcus aureus cause?

a. Tonsillitis, cellulitis, scarlet fever, septicaemia
**b. Boils, septicaemia, food poisoning, wound infections**
c. Pneumonia, otitis media, meningitis
d. Endocarditis, dental caries

---

## Question 15

What type of antibiotics works by affecting cell wall synthesis?

**a. Beta-lactam antibiotics**
b. Macrolides
c. Tetracyclines
d. Aminoglycosides

---

## Question 16

Which of these is not a gram-negative bacteria?

**a. Streptococcus pneumoniae**
b. Haemophilus influenzae
c. Escherichia coli (E. coli)
d. Salmonella

---

## Question 17

Which of these gram-negative bacteria commonly cause a UTI?

a. Salmonella
**b. Escherichia coli (E. coli)**
c. Neisseria meningitidis
d. Neisseria gonorrhoeae

---

## Question 18

Aminoglycosides work by interaction with the 30S subunit of ribosomes. Which of these are examples of aminoglycosides?

a. Penicillin
b. Vancomycin
c. Erythromycin, azithromycin, clarithromycin
**d. Streptomycin, gentamicin**

---

## Question 19

Hepatitis B is caused by the DNA virus hepadnavirus. How is it transmitted?

a. Airborne
b. Waterborne
**c. Blood and bodily fluids**
d. Foodborne

---

## Question 20

What disease/condition does salmonella cause?

a. Respiratory and CNS infection, especially in infants
b. CNS infection
c. Hepatobiliary tract infection
**d. Enteric fever and Gastroenteritis in the elderly**
`;

// Parser helper
function parseTopics(text) {
    const topicsMap = {};
    const lines = text.split('\n');
    let currentTopicNum = null;
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Check for Topic heading: # TOPIC : XX
        const topicMatch = line.match(/^#\s*TOPIC\s*:\s*(\d+)/i);
        if (topicMatch) {
            if (currentQuestion && currentTopicNum) {
                topicsMap[currentTopicNum].push(currentQuestion);
            }
            currentTopicNum = parseInt(topicMatch[1]);
            topicsMap[currentTopicNum] = [];
            currentQuestion = null;
            continue;
        }

        if (!currentTopicNum) continue;

        // Check for Question heading: ## Question XX
        const qMatch = line.match(/^##\s*Question\s*(\d+)/i);
        if (qMatch) {
            if (currentQuestion) {
                topicsMap[currentTopicNum].push(currentQuestion);
            }
            currentQuestion = {
                question: "",
                options: [],
                correctIndex: 0,
                explanation: ""
            };
            continue;
        }

        if (!currentQuestion) continue;

        // Check for options (e.g. a. option, b. option, **c. option**, etc.)
        const optMatch = line.match(/^(\*\*|)\s*([a-f])\.\s*(.*?)\s*(\*\*|)$/i);
        if (optMatch) {
            let optionText = optMatch[3].trim();
            const isCorrect = optMatch[1] === '**' || optMatch[4] === '**';
            currentQuestion.options.push({ text: optionText, isCorrect });
            continue;
        }

        // Accumulate question text
        if (line !== '---') {
            if (currentQuestion.question) {
                currentQuestion.question += "\n" + line;
            } else {
                currentQuestion.question = line;
            }
        }
    }

    // Push the last question
    if (currentQuestion && currentTopicNum) {
        topicsMap[currentTopicNum].push(currentQuestion);
    }

    // Process options to: options[0] = correct answer, correctIndex = 0
    const processedMap = {};
    Object.keys(topicsMap).forEach(topicNum => {
        processedMap[topicNum] = topicsMap[topicNum].map(q => {
            const correctOpt = q.options.find(o => o.isCorrect);
            if (!correctOpt) {
                console.error(`❌ Question missing correct answer: ${q.question}`);
                process.exit(1);
            }
            const incorrectOpts = q.options.filter(o => !o.isCorrect).map(o => o.text);
            const options = [correctOpt.text, ...incorrectOpts];
            return {
                question: q.question,
                options,
                correctIndex: 0,
                explanation: `${correctOpt.text} is correct. This aligns with standard microbiology and immunology curriculum.`
            };
        });
    });

    return processedMap;
}

async function run() {
    const parsedData = parseTopics(RAW_DATA);
    console.log('✅ Parsed topics:', Object.keys(parsedData));

    // 1. Get Subject
    const { data: subject, error: sErr } = await supabase
        .from('subjects')
        .select('id, title')
        .ilike('title', '%Microbiology, Virology, Parasitology and Immunology-2%')
        .maybeSingle();

    if (sErr || !subject) {
        console.error('❌ Subject not found:', sErr ? sErr.message : 'No match');
        process.exit(1);
    }

    // 2. Fetch Topics from Database to match titles to UUIDs
    const { data: dbTopics, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subject.id);

    if (tErr) {
        console.error('❌ Error fetching topics:', tErr.message);
        process.exit(1);
    }

    // 3. Insert into Supabase
    for (const topicNumStr of Object.keys(parsedData)) {
        const topicNum = parseInt(topicNumStr);
        const topicTitle = `Topic ${topicNum}`;
        const dbTopic = dbTopics.find(t => t.title === topicTitle);

        if (!dbTopic) {
            console.error(`❌ Could not find database topic with title: "${topicTitle}"`);
            continue;
        }

        console.log(`🧹 Deleting old MCQs for ${topicTitle} (${dbTopic.id})...`);
        await supabase.from('mcqs').delete().eq('topic_id', dbTopic.id);

        const mcqData = parsedData[topicNumStr].map(q => ({
            topic_id: dbTopic.id,
            question: q.question,
            options: q.options,
            correct_index: 0,
            explanation: q.explanation,
            task_type: 'test_question'
        }));

        console.log(`📥 Inserting ${mcqData.length} MCQs for ${topicTitle} into Supabase...`);
        const { error: insErr } = await supabase.from('mcqs').insert(mcqData);
        if (insErr) {
            console.error(`❌ Error inserting MCQs for ${topicTitle}:`, insErr.message);
        } else {
            console.log(`✅ Successfully synced ${topicTitle} in Supabase.`);
        }
    }

    // 4. Generate local client JS file: c:\samu_mcq\mobile-app\src\data\repository\course2\s-2-10.js
    const outputJsPath = path.join(__dirname, '../mobile-app/src/data/repository/course2/s-2-10.js');
    console.log(`\n💾 Generating local client repository file at: ${outputJsPath}`);

    const clientDataObj = {};
    Object.keys(parsedData).forEach(topicNumStr => {
        const topicNum = parseInt(topicNumStr);
        const localKey = `t-s-2-10-${topicNum}`;
        clientDataObj[localKey] = parsedData[topicNumStr];
    });

    const fileContent = `// Course 2 - Subject 10 - Microbiology, Virology, Parasitology and Immunology-2\n` +
        `export const s_2_10 = ${JSON.stringify(clientDataObj, null, 2)};\n`;

    fs.writeFileSync(outputJsPath, fileContent, 'utf-8');
    console.log('✅ Client JS file generated successfully.');
}

run();
