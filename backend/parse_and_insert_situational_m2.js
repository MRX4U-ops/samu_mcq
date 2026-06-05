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
## TOPIC : 13

### Question 1

8 years old has diphtheria of pharynx. What was the way of diphtheria transmission?

* **a. Air born**
* b. Fecal-oral
* c. Contact
* d. Sexual

### Question 2

Then making Mantouxs test in a child of 4 years old in 72 hours a reddening of the skin in the place of injection of tuberculin is not observed. What does this result test?

* **a. A child is not vaccinated against tuberculosis**
* b. A child has tuberculosis
* c. A child is infected by tuberculosis bacteria
* d. A child is a carrier of tuberculosis bacteria

### Question 3

A mom with a 5 years old girl, who has a cough and flu-like state during 2 weeks, visited the doctor. Last time a cough increased, paroxysmal cough appeared. A doctor diagnosed whooping-cough. What factors do determine virulence of Bordetella pertussis?

* **a. Thermolabile toxin**
* b. Pili
* c. Exotoxin
* d. Hyaluronic acid

### Question 4

A Bacteriological laboratory urine from a patient with an initial diagnosis of kidneys tuberculosis must be investigated in bacteriological laboratory. What method of diagnosis is it better to utilize?

* **a. Biological**
* b. Allergic
* c. Serological
* d. Bacterioscopy

### Question 5

Then staining of patient's sputum by Ziehl-Neelsen technique red rod-shaped bacteria were revealed. The first signs of bacterial growth appeared in 17 days. What bacteria may be there in the smear?

* **a. Mycobacterium tuberculosis**
* b. Histoplasma dubrosii
* c. Coxiella burnetii
* d. Yersinia pseudotuberculosis.

### Question 6

A sore child was tested by Mantouxs test. In 24 hours there were tumidity, hyperemia and painfulness in the place of allergen injection. What basic mechanisms do provide this reaction of a body?

* **a. Mononuclear cells, T-cells, and lymphokines**
* b. Granulocytes, T-lymphocytes, and Ig G.
* c. Plasma cells, T-cells, and lymphokines
* d. B-lymphocytes, IgM

### Question 7

Then vaccination of babies by BCG vaccine immunity to tuberculosis lasts until there are living bacteria of vaccine strain in an organism. What is the correct name of such type of immunity?

* **a. Non-sterile**
* b. Humoral
* c. Natural
* d. Type specific

### Question 8

A Diphtheria was diagnosed in 4 years old child. What preparation is it necessary to inject first of all?

* **a. Diphtherial antiserum.**
* b. TABTe.
* c. Vaccine against whooping cough, diphtheria, and tetanus
* d. Vaccine against diphtheria and tetanus

### Question 9

A sickness has cough with discharges of sputum. During microscopic examination after staining this smear by Ziehl-Neelsens technique dark blue cocci, which form irregular clusters and rod-shaped red bacteria were revealed. What microorganisms may be a cause of disease?

* **a. Mycobacterium tuberculosis**
* b. Actinomyces bovis
* c. E. coli
* d. Staphylococcus aureus

### Question 10

Within examination of bacterial carriers in the kindergarten one nurse showed the presence of Corynebacterium in her throat. The production of toxin by Corynebacterium diphtheriae was checked. It did not produce exotoxin. What test was used for examination of toxicity?

* **a. Precipitation test in gel**
* b. Immunofluorescence test
* c. Agglutination test
* d. Complement fixation test

## TOPIC : 14

### Question 1

In six years old child with paroxysmal cough mucous from oropharynx was taken. This material was inoculated on glycerin-potatoes agar. In 72 hrs of cultivation at 37 C there were small greyish convex, and glistening, resembling globules of mercury appeared. What causative agent did cause this disease?

* **b. Bordetella pertussis**
* a. Neisseria meningitidis
* c. Staphylococcus aureus
* d. Mycobacterium tuberculosis

### Question 2

A Laboratory assistant has to isolate Clostridia tetani, anaerobic sporeforming bacterium, from wound exudation. What will he do before inoculation of material into appropriate culture medium?

* **a. he heats the sample to kill asporogenous bacteria at 800C for 20 min**
* b. wound discharge should be frozen before inoculation to inhibit facultative anaerobes
* c. he will not do anything before investigation
* d. he filtrates the material through cellulose filter

### Question 3

Within examination of the patient's sputum, which was inoculated by Prices technique, rod-shaped bacteria appear as plaits. What substance from tuberculosis bacilli does form such pictures?

* **b. Cord-factor**
* a. Fatty acids.
* c. Tuberculin.
* d. PPD.

### Question 4

Sawbone has suspected anaerobic wound infection. To isolate causative germs collected wound discharge should be cultivated into the such medium as :

* **b. Kitt-Tarozzi medium**
* a. Endo agar
* c. Ploskirev agar
* d. meat peptone agar

### Question 5

In a six years old child active tuberculosis process was suspected. Diagnostic Mantouxs reaction was made. What immunobiological preparation was used?

* **a. Tuberculin.**
* b. BCG vaccine.
* c. No correct answer
* d. Pertussis-diphtheria-tetanus vaccine.

### Question 6

Each year pediatricians use Mantouxs allergic for checking of the children and teenagers. What is the aim of this test?

* **a. A selection of children for revaccination by BCG vaccine**
* b. No correct answer
* c. Treatment of tuberculosis
* d. Vaccination

### Question 7

Within the examination child 6 years old a doctor noticed greyish film on the surface of tonsils. During the attempt of it's deleting moderate bleeding appeared. During bacterioscopy after Neissers staining: rods display club-shaped swellings, volutin granules. What symptoms will appear in a child in the nearest days, if specific treatment will not be prescribed?

* **d. Toxic lesion of cardiac muscle and kidneys**
* a. Papular rashes on the skin
* b. Paroxysmal cough
* c. Oedema of lungs

### Question 8

5 years old child was admitted to the hospital with a diagnosis of diphtheria of pharynx. Material, which was taken from greyish film on tonsils, was inoculated Klauberg's medium. What are there properties of Corynebacterium colonies on this medium?

* **c. Colonies are grey, round, rosette-like**
* a. Colonies are protuberant, viscid, remind a shagreen skin, gray
* b. Colonies are convex, with even edges, colorless
* d. Colonies are rosette-like, a surface is knobby, yellow

### Question 9

5 days old boy has planned immunization with BCG vaccine. In 7 years doctor prescribed repeated immunization with the same vaccine. What examination was the basis of such doctor's decision?

* **a. Skin allergic test**
* b. Medical and genetic examination
* c. X-ray examination of the lungs
* d. Bacterioscopy of children's sputum

### Question 10

In eight years old child active tuberculosis process was suspected. Diagnostic Mantouxs reaction was made. In 30 minutes after the injection there was an insignificant erubescence in the place of injection. In 24 hours the phenomenon of dermahemia disappeared. What does the result of reaction test to?

* **c. A reaction is negative**
* a. Active tubercular process.
* b. Postvaccinal immunity
* d. A tuberculosis process is occult

## TOPIC : 15

### Question 1

A diabetic 68-year-old man develops a necrotic ulcer on his right foot. Infection spreads rapidly and there is gas in soft tissues. His foot is amputated at the ankle. Gram stain of exudate from the amputation site contains large Gram-positive rods. The bacteria grow well anaerobically, producing large ?-hemolytic colonies on sheep blood agar, but do not grow aerobically. What organism is most probable in this setting?

* **d. Clostridium perfringens**
* a. Bacillus cereus
* b. Corynebacterium diphtheriae
* c. Nocardia asteroides

### Question 2

A 40-year-old woman was treated for cystitis [caused by E. coli] with an oral broad-spectrum antibiotic. Three weeks later she developed abdominal pain and diarrhea. A stained smear of stool contained many neutrophils. Cultures for bacterial pathogens were negative. A serological test of stool for Clostridium difficile toxin was positive. Which of the following is most likely to have been the immediately predisposing cause of this patient's C. difficile infection?

* **a. Alteration of her intestinal flora by antibiotic treatment.**
* b. An allergic response to her antibiotic treatment.
* c. Colonization of her large intestine by antibiotic-resistant E. coli.
* d. Binding of neurotransmitter molecules to their receptors

### Question 3

The Stoic paralysis of Tetanus is the effect of a protein exotoxin. Which phrase below best describes the process directly inhibited by Tetanus toxin?

* **d. Docking and fusion of neurotransmitter vesicles with the synaptic membrane.**
* a. Synthesis of neurotransmitter.
* b. Transport of neurotransmitter into vesicles.
* c. Calcium influx required for neurotransmitter release.

### Question 4

5 days ago a 65-year-old woman with a lower urinary tract infection began taking ampicillin. She now has a fever and severe diarrhea. Of the organisms listed, which one is MOST likely to be the cause of the diarrhea?

* **a. Clostridium difficile**
* b. Proteus mirabilis
* c. Bacteroides fragilis
* d. All are true

### Question 5

A Juvenile man develops peritonitis following abdominal trauma. During surgery foul-smelling purulent material is aspirated from the infected area. Gram stain of this material contains a mixture of Grampositive cocci, Gram-positive rods, and many Gram-negative rods. Aerobic culture on sheep blood agar yields many colonies of enterococci and a few colonies of E. coli; culture on MacConkey agar produces only sparse colonies of E. coli. Anaerobic culture on sheep blood agar produces a few colonies of beta-hemolytic Gram-positive rods and many colonies of slender Gram-negative rods. Which organism is most likely to represent the majority of the Gram-negative rods seen when peritoneal exudate was stained?

* **a. Bacteroides fragilis**
* b. Clostridium perfringens
* c. Yersinia enterocolitica
* d. Clostridium tetani

### Question 6

A 12-year old boy develops pain and marked (10 cm.) swelling in his right inguinal lymph node accompanied by fever of 104oF. He and his family have just returned from a vacation trip to Arizona and New Mexico. Aspirate from the node contains Gram-negative rods. A direct immunofluorescent assay on the aspirate provides a definitive diagnosis. The child is (successfully) treated with streptomycin, and the aspirate is sent for culture to the CDC. Culture yields pale colonies on MacConkey agar. What is the most probable pathogen?

* **a. Yersinia pestis.**
* b. Klebsiella pneumoniae
* c. Franciscella tularensis.
* d. Coxiella burnetii.

### Question 7

An baby is brought to the emergency room, cyanotic and with poor muscle tone. Which condition is most likely given these findings?

* **b. Botulism.**
* a. Tetanus.
* c. Anthrax.
* d. Diphtheria.

### Question 8

In the US human Tetanus is now a rare disease. Which measure below has been most important in preventing it?

* **c. Immunization of humans with a toxoid-containing vaccine.**
* a. Vaccination of livestock, especially cattle, with a killed-organism vaccine.
* b. Sewage treatment and purification of water supplies.
* d. Eradication of the organisms from the environment.

### Question 9

Aqua to be used for parenteral injection must sterilized to kill living microbes and then further purified to remove non-living bacterial components. Of those listed below, which is the most toxic?

* **a. Lipopolysaccharide.**
* b. Nucleic acids
* c. Proteins of the outer membrane.
* d. Plasma-membrane lipids.

### Question 10

A safety guard at a New Jersey Court House comes to your office with a large lesion on his left arm. It is 10 cm in diameter and ulcerated. Surrounding tissue is red and markedly swollen. The ulcer is healing to produce a black scab. A swab of the ulcer contains large Gram-positive rods. After aerobic culture on sheep blood agar these produce large alpha-hemolytic colonies. Which organism is most likely?

* **d. Bacillus anthracis**
* a. Clostridium tetani
* b. Clostridium perfringens
* c. Clostridium difficile

---

## TOPIC : 16

### Question 1

12-year-old boy has a skin lesion on his back. It is 20 cm in diameter, with a red inflamed border and a red center, with a paler ring between the red areas. The mother says it has expanded rapidly over the last few days. Which of the following would most likely to cause such a lesion?

* **b. Borrelia burgdorferi**
* a. Streptococcus pyogenes
* c. Treponema pallidum
* d. Chlamydia psittaci

### Question 2

Vacationer develops watery diarrhea but not chills or fever. In this setting which of the following pathogens is the most common?

* **b. Escherichia coli**
* a. Staphylococcus aureus
* c. Salmonella enterica
* d. Campylobacter jejuni

### Question 3

Patient has a peptic ulcer. Which organism is most likely to have created this lesion?

* **d. Helicobacter pylori**
* a. Enterococcus faecalis.
* b. Salmonella enteritidis
* c. Campylobacter jejuni.

### Question 4

A 35-year old person has rapidly developing cough, dyspnoea, expectoration ana blood-tinged sputum, he is febrile, cyanosed and toxic. Chest examination reveals crepitations and rhonchi. The most likely diagnosis is

* **c. Pneumonic plague**
* a. Septicaemic plague
* b. No correct answer
* d. Legionella pneumonia

### Question 5

Man enters the emergency room claiming to have been stabbed two days earlier. Muscles in his arm hurt, and on palpation small air bubbles are felt below the skin. The wound area exudes a blackish, ill-smelling fluid that generates a crackling sound when touched. The patient has a fever, a low blood pressure, marked tachycardia, and urina very little Since his injury. The doctor decides to amputate the arm, as well as monitor the patient for shock and renal failure Which of the following is the most likely cause?

* **b. C. perfringens**
* a. C. difficile
* c. C. tetani
* d. C. septicum

### Question 6

Patient has chronic gastritis. Which of the following organisms is most likely?

* **d. Helicobacter pylori.**
* a. Escherichia coli.
* b. Campylobacter fetus.
* c. Campylobacter jejuni.

### Question 7

A surgeon is struggling to diagnose a woman's flulike illness. She complains of a fever that rises during the day and peaks after dinner (undulant fever), fatigue, spinal tenderness, and loss of appetite. Her lymph nodes are enlarged in physical exam. The doctor has trouble narrowing down the possible etiologies until he hears that she tasted goat cheese at a French village a month before the onset of her symptoms. Which of the following is the most likely cause?

* a. Bordetella pertussis
* **b. Pseudomonas aeruginosa**
* c. Francisella tularensis
* d. Brucella species

### Question 8

28 old woman comes to the doctor with a fever and loose bowels. Her diarrhea occurs in tremendous volumes, she complains, though she doesn't remember seeing blood. She has an unremarkable recent past medical history, except for an infection a few weeks earlier that was treated with clindamycin. Sigmoidoscopy of her colon reveals yellow-white plaques which the doctor predicted after analyzing her stools for toxins. Which of the following is the most likely cause?

* **b. C. difficile**
* a. C. botulinum
* c. C. septicum
* d. C. tetani

### Question 9

A under-age girl enters the emergency room suffering painful muscle spasms. Throughout her examination, she sustains a facial sneer, a stiff arched back, and clamped palms. Her father is anxious about the fact that she has also experienced difficulty eating, probably due to a stiff jaw. The father affirms that her daughter is usually quite active and boasts how, a week ago, she continued a soccer game even after falling on a nail in the field. Which of the following is the likely cause?

* **a. C. tetani**
* b. C. perfringens
* c. C. septicum
* d. C. botulinum

### Question 10

Women struggles into the emergency room with a marked paralysis of her upper body. She describes the paralysis as a weakness that began in her neck and spread to her arms. She also complains of blurred double vision and requests water to soothe her dry throat. Though she has no fever, she appears quite dizzy and her eyelids are drooping. The day before, she returned from a camping trip where she insists she maintained good hygiene, limiting her diet to canned food only. Which of the following is the most likely cause?

* **c. C. botulinum**
* a. C. septicum
* b. C. tetani
* d. C. difficile

# TOPIC: I7 - EXTRACTED CONTENT

**Question 1**

Some Aqua to be used for parenteral injection must be sterilized to kill living microbes and then further purified to remove non-living bacterial components. Of those listed below, which is the most toxic?

Select one answer:

* a. Nucleic acids
* b. Plasma-membrane lipids.
* c. Lipopolysaccharide. ✓
* d. Proteins of the outer membrane.

**Question 2**

Person got cholera. The best treatment for cholera is

Select one answer:

* a. toxoid
* b. vaccine
* c. rehydration therapy ✓
* d. tetracycline

**Question 3**

12-year old boy develops pain and marked (10 cm.) swelling in his right inguinal lymph node accompanied by fever of 104sF. He and his family have just returned from a vacation trip to Arizona and New Mexico. Aspirate from the node contains Gram-negative rods. A direct immunofluorescent assay on the aspirate provides a definitive diagnosis. The child is (successfully) treated with streptomycin, and the aspirate is sent for culture to the CDC. Culture yields pale colonies on MacConkey agar. What is the most probable pathogen?

Select one answer:

* a. Yersinia pestis. ✓
* b. Coxiella burnetii.
* c. Francisella tularensis.
* d. Klebsiella pneumoniae

**Question 4**

Young woman got a dysentery. Humans acquire shigellosis from:

Select one answer:

* a. chickens
* b. cats
* c. dogs
* d. humans ✓

**Question 5**

Young woman got cholera. The hallmark of therapy for severe cases of cholera is:

Select one answer:

* a. serotherapy
* b. outpatient treatment
* c. replacement of electrolytes ✓
* d. vaccination

**Question 6**

Young man got a dysentery. Which of the following is not true about Shigella?

Select one answer:

* a. The organism multiplies directly in the host cell
* b. Serotyping is based on O and H antigens ✓
* c. Virulence is plasmid mediated
* d. Most strains are lactose nonfermenters

**Question 7**

Young child develops bloody diarrhea, produced by Shigella infection. From which source was this infection most likely to have been contracted?

Select one answer:

* a. Another child. ✓
* b. Cow, horse, or sheep.
* c. Dog or cat.
* d. Rare hamburger.

**Question 8**

Infer the US human Tetanus is now a rare disease. Which measure below has been most important in preventing it?

Select one answer:

* a. Immunization of humans with a toxoid-containing vaccine. ✓
* b. Eradication of the organisms from the environment.
* c. Sewage treatment and purification of water supplies.
* d. Vaccination of livestock, especially cattle, with a killed-organism vaccine.

**Question 9**

Young man got a dysentery. Which Escherichia coli type is most like Shigella in its virulence plasmid and mode of infection:

Select one answer:

* a. EPEC
* b. ETEC
* c. EAggEC
* d. EIEC ✓

**Question 10**

Baby is brought to the emergency room, cyanotic and with poor muscle tone. Which condition is most likely given these findings?

Select one answer:

* a. Tetanus.
* b. Botulism. ✓
* c. Diphtheria.
* d. Anthrax.

# TOPIC: I8 - EXTRACTED CONTENT

**Question 1**

An vacationer develops watery diarrhea but not chills or fever. In this setting which of the following pathogens is the most common?

Select one answer:

* a. Campylobacter jejuni
* b. Salmonella enterica
* c. Escherichia coli ✓
* d. Staphylococcus aureus

**Question 2**

By women struggles into the emergency room with a marked paralysis of her upper body. She describes the paralysis as a weakness that began in her neck and spread to her arms. She also complains of blurred double vision and requests water to soothe her dry throat. Though she has no fever, she appears quite dizzy and her eyelids are drooping. The day before, she returned from a camping trip where she insists she maintained good hygiene, limiting her diet to canned food only. Which of the following is the most likely cause?

Select one answer:

* a. C. septicum
* b. C. difficile
* c. C. tetani
* d. C. botulinum ✓

**Question 3**

Mother enters the emergency room claiming to have been stabbed two days earlier. Muscles in his arm hurt and on palpation small air bubbles are felt below the skin. The wound area exudes a blackish, ill-smelling fluid that generates a crackling sound when touched. The patient has a fever, a low blood pressure, marked tachycardia, and urina very little since his injury. The doctor decides to amputate the arm, as well as monitor the patient for shock and renal failure Which of the following is the most likely cause?

Select one answer:

* a. C. difficile
* b. C. septicum
* c. C. tetani
* d. C. perfringens ✓

**Question 4**

An under-age girl enters the emergency room suffering painful muscle spasms. Throughout her examination, she sustains a facial sneer, a stiff arched back, and clamped palms. Her father is anxious about the fact that she has also experienced difficulty eating, probably due to a stiff jaw. The father affirms that her daughter is usually quite active and boosts how, a week ago, she continued a soccer game even after falling on a nail in the field. Which of the following is the most likely cause?

Select one answer:

* a. C. tetani ✓
* b. C. septicum
* c. C. perfringens
* d. C. botulinum

**Question 5**

A surgeon is struggling to diagnose a woman's flulike illness. She complains of a fever that rises during the day and peaks after dinner (undulant fever), fatigue, spinal tenderness, and loss of appetite. Her lymph nodes are enlarged in physical exam. The doctor has trouble narrowing down the possible etiologies until he hears that she tasted goat cheese at a French village a month before the onset of her symptoms. Which of the following is the most likely cause?

Select one answer:

* a. Pseudomonas aeruginosa ✓
* b. Francisella tularensis
* c. Brucella species
* d. Bordetella pertussis

**Question 6**

Sickness has a peptic ulcer. Which organism is most likely to have created this lesion?

Select one answer:

* a. Helicobacter pylori ✓
* b. Campylobacter jejuni.
* c. Salmonella enteritidis
* d. Enterococcus faecalis.

**Question 7**

35-year old person has rapidly developing cough, dyspnoea, expectoration ana blood-tinged sputum, he is febrile, cyanosed and toxic. Chest examination reveals crepitations and rhonchi. The most likely diagnosis is

Select one answer:

* a. Septicaemic plague
* b. No correct answer
* c. Legionella pneumonia
* d. Pneumonic plague ✓

**Question 8**

Old women comes to the doctor with a fever and loose bowels. Her diarrhea occurs in tremendous volumes, she complains, though she doesn't remember seeing blood. She has an unremarkable recent past medical history, except for an infection a few weeks earlier that was treated with clindamycin. Sigmoidoscopy of her colon reveals yellow-white plaques which the doctor predicted after analyzing her stools for toxins. Which of the following is the most likely cause?

Select one answer:

* a. C. difficile ✓
* b. C. septicum
* c. C. botulinum
* d. C. tetani

**Question 9**

Mom brings her 12-year-old son to your office because he has a skin lesion on his back. It is 20 cm in diameter, with a red inflamed border and red center, with a paler ring between the red areas. The mother says it has expanded rapidly over the last few days. Which of the following would be most likely to cause such a lesion?

Select one answer:

* a. Borrelia burgdorferi ✓
* b. Treponema pallidum
* c. Streptococcus pyogenes
* d. Chlamydia psittaci

**Question 10**

Sickness has chronic gastritis. Which of the following organisms is most likely?

Select one answer:

* a. Escherichia coli.
* b. Campylobacter jejuni.
* c. Helicobacter pylori. ✓
* d. Campylobacter fetus.

# TOPIC: I9 - EXTRACTED CONTENT

**Question 1**

In cervical specimens of 21-year-old woman presents gram-negative diplococci within leucocytes. Which bacterium is most likely to be the cause of this infection?

Select one answer:

* a. Neisseria gonorrhoeae ✓
* b. Nocardia asteroids
* c. Streptococcus pneumoniae
* d. Haemophilus influenzae

**Question 2**

In the morning mss R. had become ill, with high fever, severe headache, and stiff neck. She was admitted to the hospital. Later that day she developed rash, at first petechial and then purpuric. Gram stain of CSF showed many white cells and Gram-negative cocci, many in pairs. Which organism is most likely to be the cause of her infection?

Select one answer:

* a. Haemophilus influenzae.
* b. Escherichia coli.
* c. Streptococcus agalactiae.
* d. Neisseria meningitidis. ✓

**Question 3**

A nine-year-old child develops high fever and stiff neck. A spinal tap is performed. A Gram-stained smear of cerebrospinal fluid reveals many neutrophils and Gram-negative cocci that resemble paired kidney beans within leucocytes. Which organism below is most likely to have caused this infection?

Select one answer:

* a. Listeria monocytogenes
* b. Haemophilus influenzae
* c. Escherichia coli
* d. Neisseria meningitidis ✓

**Question 4**

A complication of genital gonorrhea in both men and women is

Select one answer:

* a. infertility ✓
* b. blindness
* c. arthritis
* d. E. urethritis

**Question 5**

Three organisms, Streptococcus pneumoniae, Neisseria meningitidis, and Haemophilus influenzae cause the vast majority of cases of bacterial meningitis. What is the MOST important pathogenic component they share?

Select one answer:

* a. Capsule ✓
* b. Protein A
* c. Endotoxin
* d. All are true

**Question 6**

After Gram stain of spinal fluid sample from a patient with meningitis Medical personal during microscopy examination detected Gram-negative cocci, many in pairs. Which organism below is most likely?

Select one answer:

* a. Escherichia coli
* b. Pseudomonas aeruginosa
* c. Neisseria meningitidis ✓
* d. Haemophilus influenzae

**Question 7**

A 25-year-old woman presents with a swollen, warm, painful knee. Aspirated joint fluid is cloudy and when cultured on chocolate agar gives rise to oxidase-positive colonies of Gram-negative diplococci. Which bacterium is most likely to be the cause of this infection?

Select one answer:

* a. Nocardia asteroids
* b. Streptococcus pneumoniae
* c. Haemophilus influenzae
* d. Neisseria gonorrhoeae ✓

**Question 8**

Before the advent of immunization, outbreaks of meningococcal disease were frequent in military camps. A factor in the development of such outbreaks is the ability of Neisseria meningitidis to establish an asymptomatic 'carrier state'. What is the predominant site of carriage of Neisseria?

Select one answer:

* a. Urethral epithelium.
* b. Nasopharynx. ✓
* c. Gall bladder.
* d. Large intestine.

**Question 9**

A individual may have repeated infections with Neisseria gonorrhoeae, despite the fact that each infection gives rise to an immune response. By which mechanism does the gonococcus evade protective immunity?

Select one answer:

* a. The surface antigens present change continually, as a result of pre-programmed changes in DNA. ✓
* b. Outer membrane lacks any antigenic components.
* c. Thick capsule prevents binding of antibodies to the cell surface.
* d. Pili adhere to epithelial cells despite binding of antibodies.

**Question 10**

A 75-year-old man reports malaise, headache, and fever. On examination his neck is stiff. Gram stain of CSF reveals neutrophils and numerous Gram-negative cocci, many in pairs. Which organism below is most likely?

Select one answer:

* a. Pseudomonas aeruginosa
* b. Neisseria meningitidis ✓
* c. Haemophilus influenzae
* d. Klebsiella pneumoniae

# TOPIC: 20 - EXTRACTED CONTENT

**Question 1**

After staining of patient's sputum by Ziehl-Neelsen technique red rod-shaped bacteria were revealed. The first signs of bacterial growth appeared in 17 days. What bacteria may be there in the smear?

Select one answer:

* a. Histoplasma dubrosii
* b. Mycobacterium tuberculosis ✓
* c. Coxiella burnetii
* d. KIPubsiella rhinoscleromanis
* e. (

**Question 2**

A growth of tuberculosis bacteria on nutrient media takes a place in 3 weeks, sometimes in 2-3 months. But express technique for there cultivation, Prices and Shkolnikov's methods may be used. In what time is it possible to get growth of tuberculosis microcultures?

Select one answer:

* a. over 40 days
* b. (
* c. 20-30 days
* d. 7-10 days ✓
* e. over 50 days

**Question 3**

Patients sputum was sent to a laboratory. What method of staining does it follow to utilize for the examination of causative agents of tuberculosis?

Select one answer:

* a. Gins-Burry
* b. Ziehl-Neelsen ✓
* c. Gram
* d. Neissers
* e. (

**Question 4**

After vaccination of babies by BCG vaccine immunity to tuberculosis lasts until there are living bacteria of vaccine strain in an organism. What is the correct name of such type of immunity?

Select one answer:

* a. Type specific
* b. Humor
* c. Natural
* d. Non-sterile ✓
* e. (

**Question 5**

In 1874 G. Hansen described the causative agent of serious human infectious chronic disease, which has very long incubation. Specific infiltrates – lepromas are formed in patients. What family does the causative agent of disease belong to?

Select one answer:

* a. Enterobacteriaceae
* b. Corynebacteriaceae
* c. (
* d. Rickettsiaceae
* e. Mycobacteriaceae ✓

**Question 6**

A 55-year-old man has a firm 2-month history of fever and weight loss. He has recently begun to cough up yellow-green sputum, sometimes with blood-tinged evidence of lung cavitation and damage. He is given a PPD skin test. Which statement below about the results of PPD testing is most accurate?

Select one answer:

* a. A positive PPD test indicates active tuberculosis.
* b. A PPD test may produce a false-negative (or weakly-positive) result if the patient has impaired cell-mediated immunity. ✓
* c. A positive PPD test indicates active tuberculosis high level of immunity.
* d. A PPD test may cause a person (previously unexposed to Mycobacterium tuberculosis) to cover to PPD-positive status, and so can be performed only once on a patient.
* e. (

**Question 7**

A patient has cough with discharges of sputum. During microscopic examination after staining the smear by Ziehl-Neelsens technique dark blue cocci, which form irregular clusters and rod-shaped red bacteria were revealed. What microorganisms may be a cause of disease?

Select one answer:

* a. Mycobacterium tuberculosis ✓
* b. E. coli
* c. (
* d. Corynebacterium diphtheriae
* e. Actinomyces bovis

**Question 8**

A microbiologist put a few drops of 1% Ziehlе fuchsine on a paper which covers a smear from patients sputum, heat it until steam rose. He repeated this procedure three times. Then took off a paper, put a smear in 5% sulfuric acid, wash it with water and stained by methylene blue. What microbes can be examined by this technique?

Select one answer:

* a. M. tuberculosis ✓
* b. (
* c. S. viridans
* d. K. pneumoniae
* e. S. aureus

**Question 9**

Bacteriological laboratory urine from a patient with an initial diagnosis of kidneys tuberculosis must be investigated in bacteriological laboratory. What method of diagnosis is it better to utilize?

Select one answer:

* a. Allergic
* b. Biological ✓
* c. Serological
* d. Bacteriological
* e. (

**Question 10**

A man, 40 years old has chronic kidneys infection. During examination of urine acids fast rod-shaped microbes were revealed. They did not grow on simple nutrient media, but on Loewenstein-Jensen medium in a few weeks they formed dry yellowish colonies. What group of microorganisms could cause his disease?

Select one answer:

* a. Mycobacteria ✓
* b. Chlamydia
* c. Gardnerella
* d. (
* e. Mycoplasma
`;

function parseRawData(rawText) {
    const lines = rawText.split('\n');
    const topics = {};
    let currentTopicNum = null;
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect topic header (e.g. # TOPIC : 13 or ## TOPIC : 13 or # TOPIC: I7)
        const topicMatch = line.match(/^(?:#|##)\s*TOPIC\s*:\s*([0-9iI]+)/i);
        if (topicMatch) {
            if (currentQuestion && currentTopicNum !== null) {
                topics[currentTopicNum].push(currentQuestion);
            }
            const normalizedTopic = topicMatch[1].replace(/i/gi, '1');
            currentTopicNum = parseInt(normalizedTopic, 10);
            topics[currentTopicNum] = [];
            currentQuestion = null;
            continue;
        }

        // If no topic selected yet, skip
        if (currentTopicNum === null) continue;

        // Ignore instructions/helper texts
        if (line.toLowerCase().startsWith('select one')) {
            continue;
        }

        // Detect question header (e.g. ### Question 1)
        const qMatch = line.match(/^(?:##|###|\*\*)\s*Question\s*(\d+)/i);
        if (qMatch) {
            if (currentQuestion) {
                topics[currentTopicNum].push(currentQuestion);
            }
            currentQuestion = {
                question: "",
                options: [],
                explanation: "This aligns with standard microbiology and immunology curriculum."
            };
            continue;
        }

        // If not inside a question, skip
        if (!currentQuestion) continue;

        // Check for options (e.g. a. option, b. option, **c. option**, etc.)
        let cleanLine = line.replace(/^\*\s+/, '').trim();
        let isCorrect = false;

        // Check for checkmark
        if (cleanLine.endsWith('✓') || cleanLine.endsWith('✔') || cleanLine.endsWith('✔️')) {
            isCorrect = true;
            cleanLine = cleanLine.substring(0, cleanLine.length - 1).trim();
        }

        if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
            isCorrect = true;
            cleanLine = cleanLine.slice(2, -2).trim();
        } else if (cleanLine.startsWith('**')) {
            isCorrect = true;
            cleanLine = cleanLine.replace(/^\*\*/, '').trim();
        }

        const optMatch = cleanLine.match(/^([a-fA-F])\.\s*(.*?)$/);
        if (optMatch) {
            let optVal = optMatch[2].trim();
            if (optVal.endsWith('**')) {
                optVal = optVal.slice(0, -2).trim();
                isCorrect = true;
            }
            if (optVal.endsWith('✓') || optVal.endsWith('✔') || optVal.endsWith('✔️')) {
                optVal = optVal.substring(0, optVal.length - 1).trim();
                isCorrect = true;
            }
            optVal = optVal.replace(/\*\*/g, '').trim();
            
            // Skip placeholders like '(' or empty options
            if (optVal && optVal !== '(' && optVal !== ')' && optVal.replace(/[()\s]/g, '') !== '') {
                currentQuestion.options.push({ text: optVal, isCorrect });
            }
            continue;
        }

        // Treat as part of question description if not a separator
        if (line === '---') {
            continue;
        }

        // Append to question text
        if (currentQuestion.question) {
            currentQuestion.question += '\n' + line;
        } else {
            currentQuestion.question = line;
        }
    }

    // Push the last question
    if (currentQuestion && currentTopicNum !== null) {
        topics[currentTopicNum].push(currentQuestion);
    }

    return topics;
}

async function run() {
    const parsedTopics = parseRawData(RAW_DATA);
    console.log('Parsed topics summary:');
    const activeTopicNums = Object.keys(parsedTopics).map(Number).sort((a,b)=>a-b);
    for (const tNum of activeTopicNums) {
        console.log(`Topic ${tNum}: ${parsedTopics[tNum].length} questions parsed`);
    }

    // 1. Find the Subject ID
    const { data: subject, error: sErr } = await supabase
        .from('subjects')
        .select('id, title')
        .ilike('title', '%Microbiology, Virology, Parasitology and Immunology-2%')
        .maybeSingle();

    if (sErr || !subject) {
        console.error('❌ Subject not found:', sErr ? sErr.message : 'No match');
        process.exit(1);
    }
    console.log(`✅ Found Subject: "${subject.title}" (${subject.id})`);

    // 2. Fetch all topics for this subject to get their UUIDs
    const { data: dbTopics, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subject.id);

    if (tErr) {
        console.error('❌ Error fetching topics:', tErr.message);
        process.exit(1);
    }

    console.log(`Loaded ${dbTopics.length} topics from DB.`);

    const clientData = {};

    for (const tNum of activeTopicNums) {
        const topicTitle = `Topic ${tNum}`;
        let dbTopic = dbTopics.find(t => t.title.toLowerCase() === topicTitle.toLowerCase());

        if (!dbTopic) {
            console.log(`➕ Creating missing topic "${topicTitle}"...`);
            const { data: newTopic, error: createErr } = await supabase
                .from('topics')
                .insert({ subject_id: subject.id, title: topicTitle })
                .select()
                .single();
            if (createErr) {
                console.error(`❌ Error creating topic ${topicTitle}:`, createErr.message);
                continue;
            }
            dbTopic = newTopic;
        }

        const questions = parsedTopics[tNum] || [];
        console.log(`Processing "${topicTitle}" (${dbTopic.id}) with ${questions.length} questions...`);

        // Clean existing situational tasks for this topic
        const { error: delErr } = await supabase
            .from('mcqs')
            .delete()
            .eq('topic_id', dbTopic.id)
            .eq('task_type', 'situational_task');

        if (delErr) {
            console.error(`❌ Error deleting existing MCQs for ${topicTitle}:`, delErr.message);
            continue;
        }

        const inserts = [];
        const clientList = [];

        for (const q of questions) {
            const correctOpt = q.options.find(o => o.isCorrect);
            if (!correctOpt) {
                console.error(`❌ No correct option found for question in Topic ${tNum}: "${q.question.substring(0, 50)}..."`);
                console.log('Options details:', q.options);
                continue;
            }

            const incorrectOpts = q.options.filter(o => !o.isCorrect).map(o => o.text);
            const finalOptions = [correctOpt.text, ...incorrectOpts];

            inserts.push({
                topic_id: dbTopic.id,
                question: q.question,
                options: finalOptions,
                correct_index: 0,
                explanation: q.explanation,
                task_type: 'situational_task'
            });

            clientList.push({
                question: q.question,
                options: finalOptions,
                correctIndex: 0,
                explanation: q.explanation
            });
        }

        if (inserts.length > 0) {
            const { error: insErr } = await supabase
                .from('mcqs')
                .insert(inserts);

            if (insErr) {
                console.error(`❌ Error inserting MCQs for ${topicTitle}:`, insErr.message);
            } else {
                console.log(`✅ Inserted ${inserts.length} MCQs for ${topicTitle}.`);
            }
        }

        const localKey = `t-s-2-10-${tNum}`;
        clientData[localKey] = clientList;
    }

    // Write client JS file
    const clientFilePath = path.join(__dirname, '../mobile-app/src/data/repository/course2/s-2-10-situational.js');
    
    // Merge with existing client file if it exists, to avoid overwriting previously written topics of the same subject
    let finalClientData = {};
    if (fs.existsSync(clientFilePath)) {
        try {
            const fileContent = fs.readFileSync(clientFilePath, 'utf-8');
            // Try to extract the JSON object
            const match = fileContent.match(/export const s_2_10_situational = (\{[\s\S]*?\});/);
            if (match) {
                finalClientData = JSON.parse(match[1]);
            }
        } catch (e) {
            console.log('⚠️ Could not parse existing client file, starting fresh.');
        }
    }

    Object.assign(finalClientData, clientData);

    const clientFileContent = `// Course 2 - Subject 10 - Microbiology, Virology, Parasitology and Immunology-2 (Situational)
export const s_2_10_situational = ${JSON.stringify(finalClientData, null, 2)};
`;
    fs.writeFileSync(clientFilePath, clientFileContent, 'utf-8');
    console.log(`🎉 Client repository file written to ${clientFilePath}`);
}

run();
