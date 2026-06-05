const fs = require('fs');

const topic10 = `TOPIC 10 
A 75-year-old woman was admitted to a local hospital, and bronchograms and radiographs revealed 
a lung carcinoma in her left lung. Which of the following structures or characteristics does the 
cancerous lung contain? 
Lingula 
Horizontal fissure 
Groove for superior vena cava (SVC) 
Middle lobe 
Larger capacity than the right 
An 18-year-old girl is thrust into the steering wheel while driving and experiences difficulty in 
expiration. Which of the following muscles is most likely damaged? 
Muscles of the abdominal wall 
Levator costarum  
Innermost intercostal muscle  
External intercostal muscle  
Diaphragm 
A 78-year-old patient presents with an advanced cancer in the posterior mediastinum. The surgeons 
are in a dilemma as to how to manage the condition. Which of the following structures is most likely 
damaged? 
Hemiazygos vein 
Brachiocephalic veins  
Trachea 
Arch of the azygos vein  
Arch of the aorta  
A 46-year-old patient comes to his doctor’s office and complains of chest pain and headache. His 
computed tomography (CT) scan reveals a tumor located just superior to the root of the right lung. 
Blood flow in which of the following veins is most likely blocked by this tumor? 
Arch of the azygos vein 
Hemiazygos vein  
Right subclavian vein  
Right brachiocephalic vein  
Accessory hemiazygos vein 
A 21-year-old patient with a stab wound reveals a laceration of the right vagus nerve proximal to the 
origin of the recurrent laryngeal nerve. Which of the following conditions would most likely result 
from this lesion? 
Dilation of the bronchial lumen 
Contraction of bronchial muscle  
Stimulation of bronchial gland secretion  
Decrease in cardiac rate  
Constriction of coronary artery 
A neonate appears severely cyanotic and breathing rapidly. Cardiac echocardiogram reveals that the 
aorta lies to the right of the pulmonary trunk. Which of the following is most likely occurred during 
development? 
AP septum failed to develop in a spiral fashion 
Excessive resorption of septum primum  
Pulmonary valve atresia  
Persistent truncus arteriosus  
Coarctation of the aorta 
A 12-year-old boy was admitted to a local hospital with a known history of heart problems. His left 
ventricular hypertrophy could result from which of the following conditions? 
Stenosis of the aorta 
A constricted pulmonary trunk 
An abnormally small left AV opening  
Improper closing of the pulmonary valves  
An abnormally large right AV opening  
A 31-year-old man was involved in a severe automobile accident and suffered laceration of the left 
primary bronchus. The damaged primary bronchus: 
Is longer than the right primary bronchus 
Has a larger diameter than the right primary bronchus 
Often receives more foreign bodies than 
the right primary bronchus 
Gives rise to the eparterial bronchus  
Runs under the arch of the azygos vein 
A 62-year-old woman who is a heavy smoker has an advanced lung cancer that spread into her right 
third posterior intercostal space posterior to the midaxillary line. If cancer cells are carried in the 
venous drainage, they would 
travel first to which of the following veins? 
Right superior intercostal vein 
SVC 
Right brachiocephalic vein  
Azygos vein  
Hemiazygos vein 
A radiologist examines posterior–anterior chest radiographs of a 27-year-old victim of a car accident. 
Which of the following structures forms the right border of the cardiovascular silhouette? 
SVC 
Arch of the aorta  
Pulmonary trunk 
Ascending aorta  
Left ventricle 
A 37-year-old man is brought to the emergency department complaining of severe chest pain. His 
angiogram reveals thromboses of both brachiocephalic veins just before entering the superior vena 
cava. This condition would most likely cause a dilation of which of the following veins? 
Left superior intercostal 
Azygos 
Hemiazygos 
Right superior intercostal  
Internal thoracic 
A cardiologist is on clinical rounds with her medical students. She asks them, “During the cardiac 
cycle, which of the following events occurs?” 
Blood flow in coronary arteries is maximal during diastole 
AV valves close during diastole  
Aortic valve closes during systole  
Pulmonary valve opens during diastole 
Aortic valve closes at the same time as AVvalve 
A patient presents with dysphagia (difficulty swallowing) and recurrent aspiration pneumonia. A CT 
scan reveals a mass in the posterior mediastinum compressing the esophagus. Which structure is 
MOST likely involved?{ 
=Esophagus 
~Trachea 
~Descending thoracic aorta 
~Superior vena cava 
~Azygos vein 
} 
A patient undergoes a thoracic surgery and experiences postoperative hoarseness. Which nerve is 
MOST likely injured during the procedure, given its close relationship to the esophagus in the 
posterior mediastinum?{ 
=Recurrent laryngeal nerve 
~Phrenic nerve 
~Vagus nerve 
~Intercostal nerves 
~Thoracic sympathetic trunk 
} 
A thoracic aortic aneurysm is discovered on a chest X-ray. This aneurysm involves which vessel 
located in the posterior mediastinum?{ 
=Descending thoracic aorta 
~Ascending aorta 
~Aortic arch 
~Pulmonary trunk 
~Superior vena cava 
} 
A patient undergoes a procedure involving the esophagus in the posterior mediastinum. Which nerve 
plexus, formed by branches of the vagus nerves, is closely associated with the esophageal wall and 
could be affected?{ 
=Esophageal plexus 
~Cardiac plexus 
~Pulmonary plexus 
~Celiac plexus 
~Superior mesenteric plexus 
} 
A patient has a condition affecting venous drainage from the posterior thoracic and abdominal walls. 
Which venous system, located in the posterior mediastinum, is MOST likely involved?{ 
=Azygos venous system (azygos, hemiazygos, and accessory hemiazygos veins) 
~Superior vena cava 
~Inferior vena cava 
~Pulmonary veins 
~Portal venous system 
}`;

const topic11 = `TOPIC 11 
A 63-year-old man comes to the emergency department with back pain, weakness, and shortness of 
breath. On examination, he has an aneurysm of the abdominal aorta at the aortic hiatus of the 
diaphragm. Which of the following pairs of structures would most likely be compressed? 
Azygos vein and thoracic duct 
Vagus nerve and azygos vein 
Esophagus and vagus nerve 
Thoracic duct and vagus nerve 
Inferior vena cava (IVC) and phrenic nerve 
A 36-year-old woman with yellow pigmentation of the skin and sclerae presents at the outpatient 
clinic. Which of the following conditions most likely is the cause of her obstructive jaundice? 
Cancer in the head of the pancreas 
Aneurysm of the splenic artery  
Perforated ulcer of the stomach  
Obstruction of the main pancreatic duct  
Cancer in the body of the pancreas 
A 2-year-old boy presents with pain in his groin that has been increasing in nature over the past few 
weeks. He is found to have a degenerative malformation of the transversalis fascia during 
development. Which of the following structures on the anterior abdominal wall is likely defective? 
Deep inguinal ring 
Superficial inguinal ring   
Inguinal ligament 
Sac of a direct inguinal hernia  
Anterior wall of the inguinal canal 
A 29-year-old man comes to a local hospital with duodenal peptic ulcer and complains of cramping 
epigastric pain. Which of the following structures harbors the cell bodies of abdominal pain fibers? 
Dorsal root ganglion 
Lateral horn of the spinal cord  
Anterior horn of the spinal cord 
Sympathetic chain ganglion  
Celiac ganglion 
A 42-year-old obese woman with seven children is brought to a local hospital by her daughter. 
Physical examination and her radiograph reveal that large gallstones have ulcerated through the 
posterior wall of the fundus of the gallbladder into the intestine. Which of the following parts of the 
intestine is most likely to initially contain gallstones? 
Transverse colon 
Cecum  
Ascending colon  
Descending colon  
Sigmoid colon 
A 35-year-old woman comes to a local hospital with abdominal tenderness and acute pain. 
On examination, her physician observes that an abdominal infection has spread retroperitoneally. 
Which of the following structures is most likely affected?  
Descending colon 
Stomach  
Transverse colon  
Jejunum  
Spleen 
During an annual health examination of a 46-year-old woman, a physician finds hypersecretion of 
norepinephrine from her suprarenal medulla. Which of the following types of nerve fibers are most 
likely overstimulated? 
Preganglionic sympathetic fibers 
Postganglionic sympathetic fibers  
Somatic motor fibers  
Postganglionic parasympathetic fibers  
Preganglionic parasympathetic fibers 
A 6-year-old girl comes to her pediatrician with constipation, abdominal distention, and vomiting. 
After thorough examination, she is diagnosed as having Hirschsprung disease (aganglionic 
megacolon), which is a congenital disease and leads to dilation of the colon. This condition is caused 
by an absence of which of the following kinds of neural cell bodies? 
Parasympathetic postganglionic neuron cell bodies 
Sympathetic preganglionic neuron cell bodies 
Sympathetic postganglionic neuron cell bodies 
Parasympathetic preganglionic neuron cell bodies 
Sensory neuron cell bodies 
A pediatric surgeon is resecting a possible malignant mass from the liver of a neonate with cerebral 
palsy. The surgeon divides the round ligament of the liver during surgery. A fibrous remnant of which 
of the following fetal vessels 
is severed?  
Left umbilical vein 
Ductus venosus  
Ductus arteriosus  
Right umbilical vein  
Umbilical artery 
A 27-year-old woman has suffered a gunshot wound to her midabdomen. After examining the 
patient’s angiogram, a trauma surgeon locates the source of bleeding from pairs of veins that 
typically terminate in the same vein. Which of the following veins are damaged? 
Left and right hepatic veins 
Left and right ovarian veins 
Left and right gastroepiploic veins  
Left and right colic veins  
Left and right suprarenal veins  
A 6-year-old boy comes to his pediatrician with a lump in the groin near the thigh and pain in the 
groin. On examination, the physician makes a diagnosis of a direct inguinal hernia because the 
herniated tissue: 
Develops after birth 
Enters the deep inguinal ring 
Lies lateral to the inferior epigastric artery  
Is covered by spermatic fasciae  
Descends into the scrotum  
A 21-year-old man developed a hernia after lifting heavy boxes while moving into his new house. 
During the repair of his resulting hernia, the urologist recalls that the genitofemoral nerve: 
Passes through the deep inguinal ring 
Runs in front of the quadratus lumborum  
Is a branch of the femoral nerve  
Supplies the testis 
Gives rise to an anterior scrotal branch 
A patient presents with a bulge in the groin area that appears when they cough or strain. The bulge is 
located medial to the inferior epigastric vessels. This is MOST likely a/an:{ 
=Direct inguinal hernia 
~Indirect inguinal hernia 
~Femoral hernia 
~Umbilical hernia 
~Epigastric hernia 
} 
A patient develops a bulge in the groin area after heavy lifting. The bulge is located lateral to the 
inferior epigastric vessels. This is MOST likely a/an:{ 
=Indirect inguinal hernia 
~Direct inguinal hernia 
~Femoral hernia 
~Umbilical hernia 
~Epigastric hernia 
} 
A female patient presents with a bulge in the upper thigh, just below the inguinal ligament. This type 
of hernia is MOST likely a/an:{ 
=Femoral hernia 
~Inguinal hernia (direct or indirect) 
~Umbilical hernia 
~Epigastric hernia 
~Spigelian hernia 
} 
A patient has undergone abdominal surgery and develops a hernia at the site of the incision. This is 
known as a/an:{ 
=Incisional hernia 
~Umbilical hernia 
~Epigastric hernia 
~Spigelian hernia 
~Hiatal hernia 
} 
During an inguinal hernia repair, the surgeon identifies the conjoint tendon. This structure is formed 
by the aponeuroses of which two muscles?{ 
=Internal oblique and transversus abdominis 
~External oblique and internal oblique 
~Transversus abdominis and rectus abdominis 
~External oblique and transversalis fascia 
~Internal oblique and transversalis fascia 
}`;

const topic12 = `TOPIC 12 
A physical fitness trainer for a young Hollywood movie star explains the reasons for 100 stomach 
crunches a day. The young star, a medical student before ‘hitting it big,’ reaffirms to his trainer that 
the lateral margin of the rectus abdominis, the muscle responsible for a washboard stomach, defines 
which of the following structures? 
Linea semilunaris 
Linea alba  
Linea circularis  
Transversalis fascia  
Falx inguinalis 
During surgical treatment of portal hypertension in a 59-year-old man with liver cirrhosis, a surgeon 
inadvertently lacerates the dilated paraumbilical veins. The veins must be repaired to allow collateral 
flow. Which of the following ligaments is most likely severed? 
Ligamentum teres hepatis 
Lienorenal ligament 
Lienogastric ligament  
Gastrophrenic ligament 
Ligamentum venosum 
A 43-year-old woman is admitted to the hospital because of deep abdominal pain in her epigastric 
region. On examination, it is observed that a retroperitoneal infection erodes an artery that runs 
along the superior border of the pancreas. Which of the following arteries is likely injured? 
Splenic artery 
Right gastric artery  
Left gastroepiploic artery  
Gastroduodenal artery  
Dorsal pancreatic artery 
A 19-year-old young woman with a long history of irritable bowel syndrome presents for the 
possibility of surgical resection of the gastrointestinal (GI) tract where the vagal parasympathetic 
innervation terminates. Which of the following sites is most appropriate for surgical resection? 
Left colic flexure 
Duodenojejunal junction  
Ileocecal junction  
Right colic flexure  
Anorectal junction 
A 58-year-old man is admitted to the hospital with severe abdominal pain, nausea, and vomiting 
resulting in dehydration. 
Emergency CT scan reveals a tumor located between the celiac trunk and the superior 
mesenteric artery. Which of the following structures is likely compressed by this tumor? 
Neck of the pancreas 
Fundus of the stomach  
Transverse colon  
Hepatopancreatic ampulla  
Duodenojejunal junction 
An emergent hernia repair is scheduled. Asthe attending physician is driving to the hospital, the 
medical student assisting on the case quickly reviews his anatomy atlas and is trying 
to commit to memory that the internal oblique abdominis muscle contributes to the formation of 
which of the following structures? 
Falx inguinalis (conjoint tendon 
Inguinal ligament 
Deep inguinal ring 
Internal spermatic fascia  
Reflected inguinal ligament 
49. A 9-year-old girl has crashed into her neighbor’s brick fence while riding her bike and is brought 
to the emergency department with a great deal of abdominal pain. Her radiogram and angiogram 
show laceration of the superior mesenteric artery immediately distal to the origin of the middle colic 
artery. If collateral circulation is discounted, which of the following organs may become ischemic? 
Ascending colon 
Descending colon  
Duodenum  
Pancreas  
Transverse colon 
A 53-year-old woman with known kidney disease presents to a hospital because her pain has 
become increasingly more severe. A physician performing kidney surgery must remember that: 
The left renal vein runs anterior to both the aorta and the left renal artery 
The left kidney lies a bit lower than the right one 
The perirenal fat lies external to the renal fascia 
The renal fascia does not surround the suprarenal gland 
The right renal artery is shorter than the left renal artery 
51. A neonatal baby was born with diabetes mellitus due to an inadequate production of insulin. 
Cells in the endocrine portion of the pancreas that secrete insulin, glucagon, and somatostatin are 
derived from which of the following? 
Endoderm 
Ectoderm  
Mesoderm  
Proctodeum 
Neural crest cells 
52. During development, the midgut arteryappears to be markedly narrowed at its origin. Which of 
the following structures is derivedfrom the midgut and may receive inadequate blood supply? 
Ascending colon 
Gallbladder  
Stomach 
Descending colon  
Rectum 
A 3-year-old boy is admitted to the children’s hospital with complaints of restlessness, abdominal 
pain, and fever. An MRI examination reveals that he has a double ureter. Which of the following 
embryonic structures is most likely failed to develop normally? 
Ureteric bud 
Mesonephric (Wolffian) duct 
Paramesonephric (Müllerian) duct 
Metanephros  
Pronephros 
A neonate has a small reducible protrusion through a defined ring at the umbilicus. His pediatrician 
indicates to the parents that this will likely close spontaneously. Which of the following congenital 
malformations is present? 
Umbilical hernia 
Symptomatic patent urachus 
Patent omphalomesenteric duct  
Omphalocele  
Gastroschisi 
A patient with severe esophageal stricture is unable to eat orally. A surgical procedure is performed 
to create an opening into the stomach for feeding. This procedure is called a:{ 
=Gastrostomy 
~Cholecystostomy 
~Jejunostomy 
~Ileostomy 
~Esophagectomy 
} 
A patient undergoes a partial gastrectomy for gastric cancer. A Billroth I procedure is performed, 
which involves:{ 
=Anastomosis of the remaining stomach to the duodenum 
~Anastomosis of the remaining stomach to the jejunum 
~Removal of the entire stomach 
~Removal of the duodenum 
~Creation of a new esophagus 
} 
A patient develops severe postprandial dumping syndrome after a gastrectomy. This syndrome is 
characterized by:{ 
=Rapid emptying of gastric contents into the small intestine 
~Delayed gastric emptying 
~Obstruction of the pylorus 
~Inflammation of the gastric mucosa 
~Perforation of the stomach 
} 
A surgeon is performing a laparoscopic gastrostomy. The endoscope is inserted through the 
abdominal wall to visualize the stomach and guide the placement of the feeding tube. The initial 
puncture site is typically in the:{ 
=Left upper quadrant 
~Right upper quadrant 
~Left lower quadrant 
~Right lower quadrant 
~Epigastric region 
} 
A patient presents with a perforated gastric ulcer in the anterior wall of the stomach. Which 
anatomical structure is MOST likely to be involved in the resulting peritonitis?{ 
=Greater omentum 
~Lesser omentum 
~Transverse mesocolon 
~Root of the mesentery 
~Retroperitoneal space 
}`;

function parseFormatted(text) {
  const blocks = text.split('}').filter(t => t.trim());
  let qs = [];
  blocks.forEach(block => {
    const parts = block.split('{');
    if(parts.length < 2) return;
    const qText = parts[0].trim().replace(/\n/g, ' ');
    const opts = parts[1].trim().split('\n').filter(l => l.trim()).map(l => l.trim().substring(1).trim());
    qs.push({ question: qText, options: opts });
  });
  return qs;
}

function parseUnformatted(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let qs = [];
  let currentQ = "";
  let currentOpts = [];
  
  for(let i=0; i<lines.length; i++) {
    let line = lines[i];
    if (line.includes('TOPIC') || line.includes('t.v') || line.includes('SITUATIONAL')) continue;
    if (line.includes('{')) {
      break; 
    }
    
    // remove question numbers if present "49. A 9-year-old..."
    line = line.replace(/^\d+\.\s*/, '');
    
    currentQ += (currentQ ? " " : "") + line;
    if(line.endsWith('?') || line.endsWith(':')) {
      let numOpts = 5;
      for(let j=0; j<numOpts; j++) {
        if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
          currentOpts.push(lines[i+1+j]);
        }
      }
      i += currentOpts.length;
      qs.push({ question: currentQ, options: currentOpts });
      currentQ = "";
      currentOpts = [];
    }
  }
  return qs;
}

function parseTopic(text) {
  let unformatted = parseUnformatted(text);
  let formattedMatch = text.match(/[\s\S]*?(\{[\s\S]*)/);
  let formatted = [];
  if (formattedMatch && formattedMatch[1]) {
    formatted = parseFormatted(formattedMatch[1]);
  } else if (text.includes('{')) {
     formatted = parseFormatted(text);
  }
  return unformatted.concat(formatted);
}

const t10 = parseTopic(topic10);
const t11 = parseTopic(topic11);
const t12 = parseTopic(topic12);

const filePath = 'c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js';
let existing = fs.readFileSync(filePath, 'utf8');

existing = existing.replace(/\s*\};?\s*$/, '');

let out = existing + ',\n';

[t10, t11, t12].forEach((qArray, idx) => {
  const actualIdx = idx + 9; // Topic 10 is index 9 (0-indexed topic count)
  out += `  "t-s-2-2-${actualIdx}": [\n`;
  qArray.forEach((q, qidx) => {
    out += `    {\n`;
    out += `      "question": ${JSON.stringify(q.question)},\n`;
    out += `      "options": [\n`;
    q.options.forEach((op, opidx) => {
      out += `        ${JSON.stringify(op)}${opidx === q.options.length-1 ? '' : ','}\n`;
    });
    out += `      ],\n`;
    out += `      "correctIndex": 0,\n`;
    out += `      "explanation": ${JSON.stringify("The correct answer is " + (q.options[0] || "") + ".")}\n`;
    out += `    }${qidx === qArray.length-1 ? '' : ','}\n`;
  });
  out += `  ]${idx === 2 ? '' : ','}\n`;
});

out += `\n};\n`;

fs.writeFileSync(filePath, out);
console.log('done');
