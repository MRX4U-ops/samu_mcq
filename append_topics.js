const fs = require('fs');

const topic7 = `TOPIC 7 
t.v./ Topic 7 
A 19-year-old woman complains of numbness of the nasopharynx after surgical removal 
of the adenoid. A lesion of which of the following nerves would be expected? 
Glossopharyngeal nerve 
Maxillary nerve  
Superior cervical ganglion  
External laryngeal nerve  
Vagus nerve 
During surgery on a 56-year-old man for a squamous cell carcinoma of the neck, the surgeon notices 
profuse bleeding from the deep cervical artery. Which of the following arteries must be ligated 
immediately to stop bleeding?) Costocervical trunk 
Inferior thyroid artery 
Transverse cervical artery 
Thyrocervical trunk 
Ascending cervical artery 
A 17-year-old boy receives an injury to the phrenic nerve by a knife wound in the neck. The 
damaged nerve passes by which of the following structures in the neck? 
Superficial to the anterior scalene muscle 
Anterior to the subclavian vein 
Posterior to the subclavian artery  
Deep to the brachial plexus  
Medial to the common carotid artery  
A 45-year-old woman is suffering from numbness over the tip of her nose. Which of the following 
nerves is most likely to be damaged? 
Ophthalmic division of the trigeminal nerve 
Maxillary division of the trigeminal nerve 
Mandibular division of the trigeminal nerve 
Facial nerve 
Auriculotemporal nerve 
.A 26-year-old singer visits her physician—an ear, nose, and throat (ENT) surgeon—and complains of 
changes in her voice. A laryngoscopic examination demonstrates a lesion of the superior laryngeal 
nerve, causing weakness of which 
of the following muscles?  
Inferior pharyngeal constrictor  
Middle pharyngeal constrictor  
Superior pharyngeal constrictor  
Thyroarytenoid 
Thyrohyoid 
A 44-year-old man with “crocodile tears syndrome” has spontaneous lacrimation during eating 
because of misdirection of regenerating autonomic nerve fibers. Which of the following nerves has 
been injured? 
Facial nerve proximal to the geniculate ganglion 
Auriculotemporal nerve 
Chorda tympani in the infratemporal fossa 
Facial nerve at the stylomastoid foramen 
Lacrimal nerve 
A young girl complains of dryness of the 
nose and the palate. This would indicate a lesion of which of the following ganglia? 
Pterygopalatine ganglion 
Nodose ganglion  
Optic ganglion  
Submandibular ganglion  
Ciliary ganglion 
A 33-year-old woman develops Bell palsy. She must be cautious because this can result in corneal 
inflammation and subsequent ulceration. This symptom results from which of the following 
conditions? 
Absence of the corneal blink reflex 
Sensory loss of the cornea and conjunctiva 
Lack of secretion of the parotid gland 
Absence of sweating on the face 
Inability to constrict the pupil 
A 39-year-old woman presents to your clinic with complaints of headache and dizziness. She has an 
infection of a cranial dural sinus. The sinus that lies in the margin of the tentorium cerebelli and runs 
from the posterior end of the cavernous sinus to the transverse sinus is infected. Which of the 
following sinuses is affected by inflammation? 
Superior petrosal sinus 
Straight sinus 
Inferior sagittal sinus  
Sphenoparietal sinus  
Cavernous sinus 
A 24-year-old man falls from his motorcycle and lands in a creek. Death may result from bilateral 
severance of which of the following nerves? 
Vagus nerve 
Trigeminal nerve 
Facial nerve  
Spinal accessory nerve  
Hypoglossal nerve 
A young singer at the local music theater visits her physician and complains of vocal difficulties. On 
examination, she is unable to abduct the vocal cords during quiet breathing. Which of the following 
muscles is most likely paralyzed? 
Posterior cricoarytenoid muscle 
Vocalis muscle  
Cricothyroid muscle  
Oblique arytenoid muscle  
Thyroarytenoid muscle 
A 71-year-old woman often visits an emergency department with swallowing difficulties and 
subsequent choking while eating food. Which of the following pairs of muscles is most instrumental 
in preventing food from entering 
the larynx and trachea during swallowing? 
Oblique arytenoid and aryepiglottic Muscles 
Sternohyoid and sternothyroid muscles 
Inferior pharyngeal constrictor and thyrohyoid muscles 
Levator veli palatini and tensor veli palatini muscles 
Musculus uv 
A patient presents with a stab wound to the anterior triangle of the neck, resulting in significant 
bleeding. Which major vessel is MOST likely injured?{ 
=Carotid artery (common, internal, or external) 
~Subclavian artery 
~Jugular vein (internal or external) 
~Brachial artery 
~Vertebral artery 
} 
A patient undergoes a thyroidectomy (removal of the thyroid gland). Which nerve is at risk of injury 
during this procedure, potentially leading to hoarseness?{ 
=Recurrent laryngeal nerve 
~Vagus nerve 
~Phrenic nerve 
~Hypoglossal nerve 
~Cervical sympathetic trunk 
} 
A patient presents with a swelling in the posterior triangle of the neck. Which lymph nodes are 
commonly located in this region and might be involved in infection or malignancy?{ 
=Cervical lymph nodes (posterior) 
~Submandibular lymph nodes 
~Submental lymph nodes 
~Preauricular lymph nodes 
~Parotid lymph nodes 
} 
A patient has a deep infection in the neck that spreads along fascial planes. Which fascial layer is 
MOST likely to be involved in a deep neck infection that can spread to the mediastinum?{ 
=Pretracheal fascia 
~Prevertebral fascia 
~Investing layer of deep cervical fascia 
~Carotid sheath 
~Superficial cervical fascia 
} 
A surgeon is performing a neck dissection, a procedure to remove lymph nodes in the neck, often for 
cancer treatment. Which muscle is often used as a landmark during this procedure, dividing the 
anterior and posterior triangles of the neck?{ 
=Sternocleidomastoid muscle 
~Trapezius muscle 
~Platysma muscle 
~Omohyoid muscle 
~Digastric muscle 
}`;

const topic8 = `TOPIC 8 
t.v./Topic 8 
A 32-year-old patient who weighs 275 lb comes to the doctor’s office. On the surface of the chest, 
the physician is able to locate the apex of the heart: 
In the left fifth intercostal space 
At the level of the sternal angle  
In the left fourth intercostal space  
In the right fifth intercostal space 
At the level of the xiphoid process of the sternum 
A 43-year-old female patient has been lying down on the hospital bed for more than 4 months. Her 
normal, quiet expiration is achieved by contraction of which of the following structures? 
Elastic tissue in the lungs and thoracic wall  
Serratus posterior superior muscles  
Pectoralis minor muscles 
Serratus anterior muscles  
Diaphragm 
A 23-year-old man received a gunshot wound, and his greater splanchnic nerve was destroyed. 
Which of the following nerve fibers would be injured? 
GVA and preganglionic sympathetic fibers 
General somatic afferent (GSA) and preganglionic sympathetic fibers 
General visceral afferent (GVA) and postganglionic sympathetic fibers 
General somatic efferent (GSE) and postganglionic sympathetic fibers 
GVA and GSE fibers 
17-year-old boy was involved in a gang fight, and a stab wound severed the white rami 
communicantes at the level of his sixth thoracic vertebra. This injury would result in degeneration of 
nerve cell bodies in which of the following structures? 
Dorsal root ganglion and lateral horn of the spinal cord 
Dorsal root ganglion and anterior horn of the spinal cord 
Sympathetic chain ganglion and dorsal root ganglion 
Sympathetic chain ganglion and posterior horn of the spinal cord 
Anterior and lateral horns of the spinal cord 
A 27-year-old cardiac patient with an irregular heartbeat visits her doctor’s office for examination. 
Where should the physician place the stethoscope to listen to the sound of the mitral valve? 
In the left fifth intercostal space at the midclavicular line 
Over the medial end of the second left intercostal space 
Over the medial end of the second right intercostal space 
In the left fourth intercostal space at the midclavicular line 
Over the right half of the lower end of the body of the sternum 
A 19-year-old man came to the emergency department, and his angiogram exhibited that he was 
bleeding from the vein that is accompanied by the posterior interventricular artery. Which of the 
following veins is most likely to be ruptured? 
Middle cardiac vein 
Great cardiac vein  
Anterior cardiac vein  
Small cardiac vein  
Oblique veins of the left atrium 
A 37-year-old patient with palpitation was examined by her physician, and one of the diagnostic 
records included a posterior–anterior chest radiograph. Which of the following comprises the largest 
portion of the sternocostal surface of the heart seen on the radiograph? 
Right ventricle 
Left atrium 
Right atrium  
Left ventricle  
Base of the heart 
A 5-year-old girl is brought to the emergency department because of difficulty breathing (dyspnea), 
palpitations, and shortness of breath. Doppler study of the heart reveals an atrial septal defect (ASD). 
This malformation usually results from incomplete closure of which of the following embryonic 
structures? 
Foramen ovale 
Ductus arteriosus 
Ductus venosus  
Sinus venarum  
Truncus arteriosus 
A 54-year-old patient is implanted with an artificial cardiac pacemaker. Which of 
the following conductive tissues of the heart had a defective function that required the 
pacemaker? 
Sinoatrial 
Atrioventricular (AV) bundle  
AV node 
(SA) node  
Purkinje fiber  
Moderator band 
A thoracic surgeon removed the right middle lobar (secondary) bronchus along with lung tissue from 
a 57-year-old heavy smoker with lung cancer. Which of the following bronchopulmonary segments 
must contain cancerous tissues? 
Medial and lateral 
Anterior and posterior 
Anterior basal and medial basal  
Anterior basal and posterior basal  
Lateral basal and posterior basal 
Coronary angiographs of a 44-year-old male patient reveal an occlusion of the circumflex branch of 
the left coronary artery. This patient has been suffering from myocardial infarction in which of the 
following areas? 
Left atrium and ventricle 
Right and left ventricles  
Right and left atria  
Interventricular septum  
Apex of the heart  
A patient has a small but solid tumor in the mediastinum, which is confined at the level of the 
sternal angle. Which of the following structures would most likely be found at this level? 
Bifurcation of the trachea 
Beginning of the ascending aorta 
Middle of the aortic arch 
Articulation of the third rib with the sternum 
Superior border of the superior mediastinum 
A woman notices a new lump in her breast during a self-exam. The most common location for breast 
masses, including cancerous ones, is the:{ 
=Upper outer quadrant 
~Upper inner quadrant 
~Lower outer quadrant 
~Lower inner quadrant 
~Central (subareolar) region 
} 
A medical student is palpating the breast of a patient. The axillary tail of Spence, which is an 
extension of breast tissue, extends towards the:{ 
=Axilla (armpit) 
~Clavicle 
~Sternum 
~Abdomen 
~Back 
} 
During a physical exam, the physician notes prominent skin dimpling over the breast. This finding is 
MOST suggestive of involvement of:{ 
=Cooper's ligaments (suspensory ligaments) 
~Lactiferous ducts 
~Montgomery glands 
~Rib cage 
~Pectoralis major muscle 
} 
A breastfeeding mother experiences redness, warmth, and tenderness in a localized area of her 
breast. This is MOST likely due to:{ 
=Mastitis (inflammation of the breast tissue) 
~Fibroadenoma (benign tumor) 
~Breast cancer 
~A simple cyst 
~Fat necrosis 
} 
A physician is explaining the lymphatic drainage of the breast to a patient. They emphasize the 
importance of the axillary lymph nodes because they:{ 
=Are the primary site of lymphatic drainage from the breast 
~Drain directly into the bloodstream 
~Are easily accessible for biopsy 
~Are located within the breast tissue itself 
~Drain only the medial aspect of the breast 
}`;

const topic9 = `TOPIC 9 
The bronchogram of a 45-year-old female smoker shows the presence of a tumor in the eparterial 
bronchus. Which airway is most likely blocked? 
Right superior bronchus 
Left superior bronchus 
Left inferior bronchus  
Right middle bronchus  
Right inferior bronchus 
An 83-year-old man with a typical coronary circulation has been suffering from an embolism of the 
circumflex branch of the left coronary artery. This condition would result in ischemia of which of the 
following areas of the heart? 
Posterior part of the left ventricle 
Anterior part of the left ventricle 
Anterior interventricular region  
Posterior interventricular region  
Anterior part of the right ventricle 
A 44-year-old man with a stab wound was brought to the emergency department, and a physician 
found that the patient was suffering from a laceration of his right phrenic nerve. Which of the 
following conditions has likely occurred? 
Loss of sensation in the fibrous pericardium and mediastinal pleura 
Injury to only GSE fiber 
Difficulty in expiration 
Normal function of the diaphragm 
Loss of sensation in the costal part of the diaphragm 
An 8-year-old boy with ASD presents to a pediatrician. This congenital heart defect shunts blood 
from the left atrium to the right atrium and causes hypertrophy of the right atrium, right ventricle, 
and pulmonary trunk. Which of the following veins opens into the hypertrophied atrium? 
Anterior cardiac vein 
Middle cardiac vein  
Small cardiac vein  
Oblique cardiac vein  
Right pulmonary vein 
A 37-year-old patient with severe chest pain, shortness of breath, and congestive heart failure was 
admitted to a local hospital. His coronary angiograms reveal a thrombosis in the circumflex branch of 
the left coronary artery. Which of the following conditions could result from the blockage of blood 
flow in the circumflex branch? 
Mitral valve insufficiency 
Tricuspid valve insufficiency 
Ischemia of AV node  
Paralysis of pectinate muscle  
Necrosis of septomarginal trabecula 
A 75-year-old patient has been suffering from lung cancer located near the cardiac 
notch, a deep indentation on the lung. Which of the following lobes is most likely to be excised? 
Superior lobe of the left lung 
Superior lobe of the right lung  
Middle lobe of the right lung  
Inferior lobe of the right lung  
Inferior lobe of the left lung 
A thoracentesis is performed to aspirate an abnormal accumulation of fluid in a 37-yearold patient 
with pleural effusion. A needle should be inserted at the midaxillary line between which of the 
following two ribs so as to avoid puncturing the lung? 
Ribs 7 and 9 
Ribs 1 and 3 
Ribs 3 and 5 
Ribs 5 and 7 
Ribs 9 and 11 
A newborn baby is readmitted to the hospital with hypoxia and upon testing is found to 
have pulmonary stenosis, dextraposition of the aorta, interventricular septal defect, and hypertrophy 
of the right ventricle. Which of the following is best described by these symptoms? 
Tetralogy of Fallot 
ASD 
Patent ductus arteriosus 
Aortic stenosis  
Coarctation of the aorta 
A 33-year-old patient is suffering from a sudden occlusion at the origin of the descending (thoracic) 
aorta. This condition would most likely decrease blood flow in which of the following intercostal 
arteries? 
Lower six posterior 
Upper six anterior  
All of the posterior  
Upper two posterior  
Lower anterior  
A 56-year-old patient recently suffered a myocardial infarction in the area of the apex of the heart. 
The occlusion by atherosclerosis is in which of the following arteries? 
Anterior interventricular artery 
Marginal artery 
Right coronary artery at its origin  
Posterior interventricular artery 
Circumflex branch of the left coronary artery 
A 45-year-old woman presents with a tumor 
confined to the posterior mediastinum. This 
could result in compression of which of the following structures?  
Descending aorta 
Trachea  
Arch of the aorta  
Arch of the azygos vein  
Phrenic nerve 
A 62-year-old patient with pericardial effusion comes to a local hospital for aspiration 
of pericardial fluid by pericardiocentesis. The 
needle is inserted into the pericardial cavity through which of the following intercostal 
spaces adjacent to the sternum? 
Left fifth intercostal space 
Right fourth intercostal space  
Left fourth intercostal space  
Right fifth intercostal space  
Right sixth intercostal space 
A patient is involved in a motor vehicle accident and sustains a penetrating injury to the anterior 
chest wall near the sternal angle (angle of Louis). Which structure is MOST likely to be directly 
posterior to this landmark?{ 
=The aortic arch 
~The superior vena cava 
~The trachea 
~The esophagus 
~The pulmonary trunk 
} 
A surgeon is performing a median sternotomy (splitting the sternum) to access the heart. Which 
structure is immediately posterior to the sternum and must be carefully avoided?{ 
=The thymus (or remnants of it) 
~The trachea 
~The esophagus 
~The aortic arch 
~The superior vena cava 
} 
A patient presents with a goiter (enlargement of the thyroid gland). Which anatomical structure is at 
risk of compression due to this enlargement, potentially causing difficulty breathing?{ 
=The trachea 
~The esophagus 
~The vagus nerve 
~The phrenic nerve 
~The internal jugular vein 
} 
A patient undergoes a thyroidectomy (removal of the thyroid gland). Postoperatively, they develop 
hoarseness. Which nerve is MOST likely injured during the procedure?{ 
=Recurrent laryngeal nerve 
~Vagus nerve 
~Phrenic nerve 
~Hypoglossal nerve 
~Cervical sympathetic trunk 
} 
A central venous catheter is being inserted into the subclavian vein. Which other large vessel is in 
close proximity and could be inadvertently punctured if the procedure is not performed carefully?{ 
=Subclavian artery 
~Internal jugular vein 
~External jugular vein 
~Brachiocephalic vein 
~Axillary vein 
}`;

function parseFormatted(text) {
  const blocks = text.split('}').filter(t => t.trim());
  let qs = [];
  blocks.forEach(block => {
    const parts = block.split('{');
    if(parts.length < 2) return;
    const qText = parts[0].trim().replace(/\\n/g, ' ');
    const opts = parts[1].trim().split('\\n').filter(l => l.trim()).map(l => l.trim().substring(1).trim());
    qs.push({ question: qText, options: opts });
  });
  return qs;
}

function parseUnformatted(text) {
  const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
  let qs = [];
  let currentQ = "";
  let currentOpts = [];
  
  for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (line.includes('TOPIC') || line.includes('t.v') || line.includes('SITUATIONAL') || line.includes('The bronchogram')) {
      if (line.includes('The bronchogram')) {
        currentQ += (currentQ ? " " : "") + line;
      }
      continue;
    }
    if (line.includes('{')) {
      break; 
    }
    
    currentQ += (currentQ ? " " : "") + line;
    if(line.endsWith('?') || line.endsWith(':') || line.endsWith(') Costocervical trunk')) {
      // Small fix for Topic 7 Q2 where option is on same line as question: "...stop bleeding?) Costocervical trunk"
      if (line.endsWith(') Costocervical trunk')) {
        currentQ = currentQ.replace(') Costocervical trunk', ')');
        currentOpts.push('Costocervical trunk');
        let numOpts = 4;
        for(let j=0; j<numOpts; j++) {
          if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
            currentOpts.push(lines[i+1+j]);
          }
        }
        i += currentOpts.length - 1;
      } else {
        let numOpts = 5;
        for(let j=0; j<numOpts; j++) {
          if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
            currentOpts.push(lines[i+1+j]);
          }
        }
        i += currentOpts.length;
      }
      
      qs.push({ question: currentQ, options: currentOpts });
      currentQ = "";
      currentOpts = [];
    }
  }
  return qs;
}

function parseTopic(text) {
  let unformatted = parseUnformatted(text);
  let formattedMatch = text.match(/[\\s\\S]*?(\\{[\\s\\S]*)/);
  let formatted = [];
  if (formattedMatch && formattedMatch[1]) {
    formatted = parseFormatted(formattedMatch[1]);
  } else if (text.includes('{')) {
     formatted = parseFormatted(text);
  }
  return unformatted.concat(formatted);
}

const t7 = parseTopic(topic7);
const t8 = parseTopic(topic8);
const t9 = parseTopic(topic9);

const filePath = 'c:\\\\samu_mcq\\\\mobile-app\\\\src\\\\data\\\\repository\\\\course2\\\\s-2-2-situational.js';
let existing = fs.readFileSync(filePath, 'utf8');

// remove the trailing };
existing = existing.replace(/\\s*\\};?\\s*$/, '');

let out = existing + ',\\n';

[t7, t8, t9].forEach((qArray, idx) => {
  const actualIdx = idx + 6; // Topic 7 is idx 6, etc.
  out += \`  "t-s-2-2-\${actualIdx}": [\\n\`;
  qArray.forEach((q, qidx) => {
    out += \`    {\\n\`;
    out += \`      "question": \${JSON.stringify(q.question)},\\n\`;
    out += \`      "options": [\\n\`;
    q.options.forEach((op, opidx) => {
      out += \`        \${JSON.stringify(op)}\${opidx === q.options.length-1 ? '' : ','}\\n\`;
    });
    out += \`      ],\\n\`;
    out += \`      "correctIndex": 0,\\n\`;
    out += \`      "explanation": \${JSON.stringify("The correct answer is " + (q.options[0] || "") + ".")}\\n\`;
    out += \`    }\${qidx === qArray.length-1 ? '' : ','}\\n\`;
  });
  out += \`  ]\${idx === 2 ? '' : ','}\\n\`;
});

out += \`\\n};\\n\`;

fs.writeFileSync(filePath, out);
console.log('done');
