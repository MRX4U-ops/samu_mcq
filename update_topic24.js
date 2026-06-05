const fs = require('fs');
const path = require('path');
const { MCQ_REPOSITORY } = require('./mobile-app/src/data/repository/index.js');

const rawQuestions = `Question 1
Secondary poisonous:
**\\*a. Their toxicity is revealed when they are eaten by other animals.**
b. Have glands that produce poisons
c. Accumulate toxic metabolites in tissues
d. Produce toxins in special organs

Question 2
When poisoned by scorpion venom, the following are observed:
a. Feelings of fear, nausea and vomiting appear
**\\*b. Acute pain, hyperemia and swelling of the affected area**
c. Hyperemia and swelling of the affected area, a feeling of fear appears
d. There is no acute pain, there is a feeling of fear

Question 3
The venom glands of snakes are:
a. Transformed reproductive system of males
**\\*b. Transformed salivary glands**
c. Modified gonads
d. Transformed reproductive system of females

Question 4
Specify secondary poisonous organisms:
**\\*a. Some insects , fish, shellfish**
b. Mammal animals
c. Karakurt, scorpions
d. Amphibians, snakes

Question 5
The larval stage of Fasciola hepatica that is invasive to humans is called:
**\\*a. Adoleskariem**
b. Miracidium
c. Redia
d. Cercaria

Question 6
Secondary poisonous:
a. Accumulate toxic metabolites in tissues
b. Have glands that produce poisons
**\\*c. Accumulate exogenous poisons in their body**
d. Produce toxins in special organs

Question 7
Which Arthropods are poisonous?
a. Housefly
**\\*b. Karakurt**
c. Dog tick
d. Bed bug

Question 8
And the invasive stage of the causative agent of diphyllobothriasis for the first intermediate host is:
a. Plerocercoid
b. Procercoid
**\\*c. Coracidium**
d. Cysticercus

Question 9
What research method is used to diagnose alveococcosis?
a. Fecal microscopy
**\\*b. Immunological**
c. Sputum microscopy
d. Urine microscopy

Question 10
Bees and wasps are animals:
**\\*a. Primary poisonous armed**
b. Secondary poisonous armed
c. Passive-poisonous armed
d. Passive poisonous unarmed

Question 11
Personal prevention of opisthorchiasis consists of:
**\\*a. Consumption of well-cooked crabs**
b. Maintaining personal hygiene rules
c. Consumption of well-cooked and fried fish
d. Consuming only boiled water

Question 12
Which helminthiasis pathogen can be contracted directly from a sick person?
a. Diphyllobothriasis
b. Alveococcosis
c. Echinococcosis
**\\*d. Hymenolepi doses**

Question 13
Reasons for animal resistance to its toxins:
**\\*a. The poison is produced together with the inhibitor**
b. The peculiar structure of poisonous organs
c. Their toxins act when they enter the blood
d. Presence of enzymatic antitoxins

Question 14
And the larval stage of Opisthorchis felineus, which is invasive to humans, is called:
a. Redia
b. Sporocyst
**\\*c. Metacercariae**
d. Miracidium

Question 15
A person becomes infected with hymenolepiasis through:
a. Fish
**\\*b. Dirty hands**
c. Poorly cooked meat
d. Washed vegetables and fruits

Question 16
Factors that determine the picture of zootoxin poisoning:
a. Times of Day
**\\*b. Composition and amount of poison received**
c. Gender of the affected person
d. Habitus of the affected person

Question 17
Toads and frogs are animals:
**\\*a. Primary poisonous unarmed**
b. Secondary poisonous unarmed
c. Actively poisonous unarmed
d. Secondary poisonous armed

Question 18
Where do the venom glands of the karakurt spider open?
**\\*a. Close to the apex of the chelicerae**
b. In the arachnoid glands
c. In the last abdominal segment
d. On the pedipalps

Question 19
Actively poisonous:
a. Their toxins are broken down in the excretory canal
**\\*b. Their toxins consist of polypeptides and a mixture of lytic enzymes**
c. Usually lead a parasitic lifestyle
d. Their toxins act when they enter the intestines

Question 20
Actively poisonous animals:
a. Jellyfish and gastropods
**\\*b. Cobra and tarantula**
c. Python and tarantula
d. Tarantula and Pufferfish

Question 21
Name the intermediate host of the armed tapeworm :
a. Cattle
b. Cyclops, fish
**\\*c. Pig**
d. Freshwater mollusk

Question 22
Insect venomous apparatus:
**\\*a. Modified female reproductive system**
b. Modified male reproductive system
c. The modified salivary glands of males
d. Modified salivary glands of females

Question 23
A person can only be an intermediate host for:
a. Hymenolepis nana
b. Diphyllobothrium latum
c. Taenia solium
**\\*d. Echinococcus granulosus**

Question 24
Marita of the liver fluke is localized in the liver:
a. Cancer
**\\*b. Human**
c. Small pond snail
d. Toothless

Question 25
What is the medical significance of the tarantula?
**\\*a. Poisonous animal**
b. Intermediate host of guinea worm
c. Causative agent of myiasis
d. Leishmania vector

Question 26
Zootoxins serve:
a. To cleanse the body
b. For metabolism
c. For digestion
**\\*d. For protection from enemies**

Question 27
Armed actively poisonous animals:
a. Bees and amphibians
b. Snakes and amphibians
**\\*c. Snakes and rays**
d. Gastropods and bees

Question 28
Spread of toxicity among animals:
**\\*a. Found in representatives of all groups**
b. Found among helminths
c. More common among low-level groups
d. More common among highly organized groups

Question 29
What helminthiasis can be caused by eating infected wild berries?
a. Taeniasis
**\\*b. Alveococcosis**
c. Diphyllobothriasis
d. Opisthorchiasis

Question 30
Passively poisonous animals:
a. Tarantula and gastropods
b. Cobra and boa constrictor
**\\*c. Pufferfish and gastropods**
d. Jellyfish and tarantula

Question 31
When poisoned by bees and wasps, the following are observed:
a. Allergic reactions, feeling of fear
**\\*b. Hyperemia and swelling of the affected area, allergic reactions**
c. There is no hyperemia or swelling of the affected area
d. Acute pain, feeling of fear

Question 32
The shortest body length is:
a. Hymenolepis papa
**\\*b. Echinococcus granulosus**
c. Taeniarhynchus saginatus
d. Diphyllobothrium latum

Question 33
Echinococcus granulosus is:
**\\*a. Hermaphrodite**
b. Autotroph
c. Dioecious organism
d. Ectoparasite

Question 34
Mature segments of the causative agent of the disease can actively crawl out of a person’s anus in the following cases:
a. Hymenolepiasis
b. Alveococcosis
c. Echinococcosis
**\\*d. Teniarihosa**

Question 35
Name the second intermediate host of the cat fluke:
a. Freshwater crayfish and crabs
b. Cyclops
**\\*c. Fish**
d. Mollusk

Question 36
What is the medical meaning of scorpion:
**\\*a. Poisonous animal**
b. Ectoparasite
c. Leishmania vector
d. Causative agent of myiasis

Question 37
Name the intermediate hosts of the cat fluke:
a. Freshwater crayfish and crabs
b. Cyclops, fish
**\\*c. Mollusc of the genus Bitiniya , fish**
d. Mollusc of the genus Helicela, ants

Question 38
Measures to protect poisonous animals are carried out out:
a. Establishing artificial synthesis of toxins
b. Protection and restoration of natural biogeocenoses
c. Keeping poisonous animals in special laboratories
**\\*d. All answers are correct**

Question 39
Primary poisonous:
a. Plant toxins accumulate
**\\*b. Produce toxins in special organs**
c. Accumulate exogenous poisons in their body
d. Their toxicity is revealed when they are eaten by other animals.

Question 40
What helminthiasis pathogen can be contracted directly from a sick dog?
a. Diphyllobothriasis
b. Opisthorchiasis
**\\*c. Echinococcosis**
d. Hymenolepiasis

Question 41
What is the sexually mature form of trematodes?
a. Redia
b. Cercaria
**\\*c. Marita**
d. Miracidium

Question 42
A person who consumes insufficiently heat-treated fish can become infected with:
a. Hymenolepiasis
b. Teniarinhoz
c. Schistosomiasis
**\\*d. Diphyllobothriasis**

Question 43
What is the medical meaning of karakurt:
**\\*a. Poisonous animal**
b. Ectoparasite
c. Intermediate host of guinea worm
d. Causative agent of myiasis

Question 44
For personal prevention of taeniasis it is necessary:
a. Clean your home thoroughly
**\\*b. Heat treat pork before eating**
c. Wash vegetables and fruits thoroughly
d. Wash your hands regularly before eating food

Question 45
Zootoxins serve:
a. For digestion
**\\*b. As a means of animals attacking their prey**
c. For metabolism
d. To cleanse the body

Question 46
Passive poisonous:
a. Their toxins act when they enter the bloodstream
**\\*b. Their toxins are not made of proteins**
c. Their toxins consist of polypeptides and a mixture of lytic enzymes
d. Their toxins are broken down in the digestive tract

Question 47
When poisoned by tarantula venom, the following are observed:
a. Acute pain and drowsiness
**\\*b. Hyperemia and swelling of the affected area, skin necrosis**
c. There is no hyperemia or swelling of the affected area
d. Hyperemia and swelling of the affected area, drowsiness

Question 48
Actively poisonous:
a. Their toxins are broken down in the excretory canal
b. Usually lead a free lifestyle
c. Their toxins consist of carbohydrates and lytic enzymes
**\\*d. Their toxins act when they enter the bloodstream**

Question 49
Primary venomous animals are divided into :
a. Neurotropic and protein
b. Progressive and non-progressive
c. Enzymatic and hormonal
**\\*d. Actively poisonous and passively poisonous**

Question 50
When poisoned by the venom of slate snakes, the following are observed:
a. Inflammation of lymphatic vessels, tissue necrosis
**\\*b. Excitation and then depression of the central nervous system, respiratory failure**
c. Acute pain, tissue necrosis
d. Excitation and then depression of the central nervous system, tissue necrosis

Question 51
Flatworms that belong to the class of trematodes are characterized by:
a. Do not drink water from open reservoirs
**\\*b. Presence of oral and ventral sucker**
c. Wash hands, vegetables, berries
d. Lack of digestive system

Question 52
Actively poisonous:
a. Plant toxins accumulate
**\\*b. Have devices for introducing poison into the victim’s body**
c. Accumulate exogenous poisons in their body
d. Their toxicity is revealed when they are eaten by other animals.

Question 53
Unarmed actively poisonous animals:
**\\*a. Gastropods and amphibians**
b. Stingrays and gastropods
c. Puffer fish and stingrays
d. Snakes and amphibians

Question 54
When poisoned by the venom of viper snakes, the following are observed:
a. Bleeding disorders and breathing problems
b. Numbness of the limbs and hemorrhagic edema
c. Numbness of the limbs and breathing problems
**\\*d. Acute pain and bleeding disorders**`;

function parseQuestions(text) {
  const blocks = text.split(/Question\s*\d+\s*/i).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const question = lines[0];
    const rawOptions = lines.slice(1);
    
    // Find the correct option (contains '*')
    const correctIdx = rawOptions.findIndex(o => o.includes('*'));
    if (correctIdx === -1) {
        throw new Error('No correct answer found for question: ' + question);
    }
    
    const correctOption = rawOptions[correctIdx];
    // Remove the correct option from its current position
    rawOptions.splice(correctIdx, 1);
    
    // The correct option MUST be at index 0
    const options = [correctOption, ...rawOptions];
    
    return { question, options };
  });
}

const parsedTest = parseQuestions(rawQuestions);
MCQ_REPOSITORY['s-1-8']['t-s-1-8-23'].test = parsedTest;

const mobilePath = path.join('mobile-app', 'src', 'data', 'repository', 'course1', 's-1-8.js');
const webPath = path.join('student-web', 'src', 'data', 'course1', 's-1-8.js');

const jsContent = 'export const s_1_8 = ' + JSON.stringify(MCQ_REPOSITORY['s-1-8'], null, 2) + ';\n';
fs.writeFileSync(mobilePath, jsContent);
fs.writeFileSync(webPath, jsContent);

console.log('Successfully re-parsed Topic 24 and set correct answer at index 0.');
console.log(JSON.stringify(MCQ_REPOSITORY['s-1-8']['t-s-1-8-23'].test[0], null, 2));
