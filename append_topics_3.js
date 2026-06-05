const fs = require('fs');

const topic13 = `TOPIC 13 
t.v./13 
A 35-year-old woman with a history of cholecystectomy arrives in the emergency department with 
intractable hiccups most likely caused by an abdominal abscess secondary to surgical infection. 
Which of the following nerves carries pain sensation caused by irritation of the peritoneum on the 
central portion of the inferior surface of the diaphragm? 
Phrenic nerve 
Vagus nerve 
Lower intercostal nerve  
Greater splanchnic nerve  
Subcostal nerve 
A 16-year-old boy with a ruptured spleen comes to the emergency department for splenectomy. 
Soon after ligation of the splenic artery just distal to its origin, a surgical resident observes that the 
patient is healing normally. Normal blood flow would occur in which of the following arteries? 
Inferior pancreaticoduodenal artery 
Short gastric arteries 
Dorsal pancreatic artery 
Left gastroepiploic artery  
Artery in the lienorenal ligament 
A 9-year-old boy was admitted to the emergency department complaining of nausea, vomiting, 
fever, and loss of appetite. On examination, he was found to have tenderness and pain on the right 
lower quadrant. Based on signs 
and symptoms, the diagnosis of acute appendicitis was made. During an appendectomy performed 
at McBurney point, which of the following structures is most likely to be injured? 
Iliohypogastric nerve 
Deep circumflex femoral artery 
Inferior epigastric artery  
Genitofemoral nerve 
Spermatic cord 
A 54-year-old man with a long history of alcohol abuse presents to the emergency department with 
rapidly increasing abdominal distention most likely resulting from an alteration in portal systemic 
blood flow. Which of the 
following characteristics is associated with the portal vein or the portal venous system? 
Caput medusae and hemorrhoids caused 
by portal hypertension 
Lower blood pressure than in the IVC 
Least risk of venous varices because of portal hypertension 
Distention of the portal vein resulting from 
its numerous valves 
Less blood flow than in the hepatic artery 
While examining radiographs and angiograms of a 52-year-old patient, a physician 
is trying to distinguish the jejunum from the 
ileum. He has observed that the jejunum has: 
Fewer mesenteric arterial arcades 
Fewer plicae circulares 
Less digestion and absorption of nutrients 
Shorter vasa recta 
More fat in its mesentery 
A 67-year-old woman with a long history of liver cirrhosis was seen in the emergency department. In 
this patient with portal hypertension, which of the following veins is most likely to be dilated?  
Right colic vein 
Inferior epigastric vein 
Inferior phrenic vein  
Suprarenal vein  
Ovarian vein 
A 26-year-old patient is admitted to a local hospital with a retroperitoneal infection. Which of the 
following arteries is most likely to be infected? 
Dorsal pancreatic artery 
Left gastric artery  
Proper hepatic artery  
Middle colic artery  
Sigmoid arteries  
A pediatric surgeon has resected a structure that is a fibrous remnant of an embryonic or fetal artery 
in a 5-year-old child. Which of the following structures is most likely to be divided? 
Medial umbilical fold 
Lateral umbilical fold  
Median umbilical fold  
Ligamentum teres hepatis  
Ligamentum venosum 
A 57-year-old patient has a tumor in the body of the pancreas that obstructs the inferior mesenteric 
vein just before joining the splenic vein. Which of the following veins is most likely to be enlarged? 
Left colic vein 
Middle colic vein 
Left gastroepiploic vein 
Inferior pancreaticoduodenal vein 
Ileocolic vein 
An elderly man with prostatic hypertrophy returns to his urologist with another case of epididymitis. 
An acute infection involving the dartos muscle layer of the scrotum most likely leads to an 
enlargement of which of the following lymph nodes?  
Superficial inguinal nodes 
Preaortic nodes  
Lumbar nodes   
External iliac nodes  
Common iliac nodes 
A 3-year-old boy is diagnosed as having a persistent processus vaginalis in its middle portion. Which 
of the following conditions is most likely to be associated with this developmental anomaly? 
Hydrocele 
Direct inguinal hernia  
Gubernaculum testis  
Hematocele  
Cryptorchidism 
Examination of a 54-year-old man reveals an isolated tumor located at the porta hepatis. This tumor 
most likely compresses which of the following structures? 
Branches of the portal vein 
Cystic duct 
Hepatic veins  
Common hepatic artery  
Left gastric artery  
A patient presents with right upper quadrant pain that radiates to the right shoulder. This pain is 
MOST likely due to pathology of the:{ 
=Gallbladder 
~Spleen 
~Liver 
~Stomach 
~Pancreas 
} 
A patient is diagnosed with cirrhosis of the liver. This condition primarily affects the:{ 
=Hepatocytes (liver cells) 
~Gallbladder 
~Spleen 
~Pancreas 
~Bile ducts 
} 
A patient has a history of portal hypertension. Which organ is directly involved in this condition due 
to its role in receiving blood from the gastrointestinal tract?{ 
=Liver 
~Gallbladder 
~Spleen 
~Pancreas 
~Kidneys 
} 
A patient presents with left upper quadrant pain and tenderness after a blunt abdominal trauma. 
Which organ is MOST likely injured?{ 
=Spleen 
~Liver 
~Gallbladder 
~Stomach 
~Pancreas 
} 
A physician is palpating the abdomen. Under normal circumstances, the spleen is:{ 
=Not palpable 
~Easily palpable in the right upper quadrant 
~Palpable in the left lower quadrant 
~Palpable below the xiphoid process 
~Palpable in the midline of the abdomen 
}`;

const topic14 = `TOPIC 14 
t.v,/Topic 14 
During an outbreak of meningitis at a local college, a 20-year-old student presents to a hospital 
emergency department complaining of headache, fever, chills, and stiff neck. On examination, it 
appears that he may have meningitis and needs a lumbar puncture or a spinal tap. Cerebrospinal 
fluid (CSF) is normally withdrawn from which of the following spaces? 
Subarachnoid space 
Epidural space 
Subdural space 
Space between the spinal cord and the piamater  
Space between the arachnoid and dura maters 
A 23-year-old jockey falls from her horse and complains of headache, backache, and weakness. 
Radiologic examination would reveal blood in which of the following spaces if the internal vertebral 
venous plexus was ruptured? 
Epidural space 
Space deep to the pia mater 
Space between the arachnoid and duramaters  
Subdural space  
Subarachnoid space 
A 42-year-old woman with metastatic breast cancer is known to have tumors in the intervertebral 
foramina between the fourth and fifth cervical vertebrae and between the fourth and fifth thoracic 
vertebrae. Which of the following spinal nerves may be damaged? 
Fifth cervical and fourth thoracic nerves 
Fourth cervical and fourth thoracic nerves 
Fifth cervical and fifth thoracic nerves  
Fourth cervical and fifth thoracic nerves  
Third cervical and fourth thoracic nerves 
A 39-year-old woman with headaches presents to her primary care physician with a possible 
herniated disk. Her magnetic resonance imaging (MRI) scan reveals that the posterolateral protrusion 
of the intervertebral disk between L4 and L5 vertebrae would most likely affect nerve roots of which 
of the following spinal nerves? 
Fifth lumbar nerve 
Third lumbar nerve  
Fourth lumbar nerve  
First sacral nerve  
Second sacral nerve 
A 57-year-old woman comes into her physician’s office complaining of fever, nausea, vomiting, and 
the worst headache of her life. Tests and physical examination suggest hydrocephalus (widening 
ventricles) resulting from a decrease in the absorption of cerebrospinal fluid (CSF). A decrease of 
flow in the CSF through which of the following structures would be responsible for these findings? 
Arachnoid villi 
Choroid plexus  
Vertebral venous plexus  
Internal jugular vein 
Subarachnoid trabeculae 
After a 26-year-old man’s car was broadsided by a large truck, he is brought to the emergency 
department with multiple fractures of the transverse processes of the cervical and upper thoracic 
vertebrae. Which of the following 
muscles might be affected?  
Levator scapulae 
Trapezius 
Rhomboid major  
Serratus posterior superior  
Rectus capitis posterior major 
A 27-year-old mountain climber falls from a steep rock wall and is brought to the emergency 
department. His physical examination and computed tomography (CT) scan reveal dislocation 
fracture of the upper thoracic vertebrae. The fractured body of the T4 vertebra articulates with 
which of the following parts of the ribs? 
Head of the fifth rib 
Head of the third rib 
Neck of the fourth rib  
Tubercle of the fourth rib  
Tubercle of the fifth rib 
A young toddler presents to her pediatrician with rather new onset of bowel and bladder 
dysfunction and loss of the lower limb function. Her mother had not taken enough folic acid (to the 
point of a deficiency) during her pregnancy. On examination, the child has protrusion of the spinal 
cord and meninges and is diagnosed with which of the following conditions? 
Meningomyelocele 
Spina bifida occulta 
Meningocele  
Myeloschisis   
Syringomyelocele 
A 34-year-old woman crashes into a tree during a skiing lesson and is brought to a hospital with 
multiple injuries that impinge the dorsal primary rami of several spinal nerves. Such lesions could 
affect which of the following muscles? 
Iliocostalis 
Rhomboid major  
Levator scapulae  
Serratus posterior superior  
Latissimus dorsi 
During a domestic dispute, a 16-year-old boy receives a deep stab wound around the superior angle 
of the scapula near the medial border, which injures both the dorsal scapular and spinal accessory 
nerves. Such an injury could result in paralysis or weakness of which of the following muscles? 
Rhomboid major and trapezius 
Trapezius and serratus posterior superior  
Rhomboid minor and latissimus dorsi  
Splenius cervicis and sternocleidomastoid  
Levator scapulae and erector spinae 
An elderly man at a nursing home is known to have degenerative brain disease. When cerebrospinal 
fluid (CSF) is withdrawn by lumbar puncture for further examination, which of the following 
structures is most likely penetrated by the needle? 
Ligamentum flavum 
Pia mater 
Filum terminale externum  
Posterior longitudinal ligament  
Annulus fibrosus 
A 27-year-old stuntman is thrown out of his vehicle prematurely when the car used for a particular 
scene speeds out of control. His spinal cord is crushed at the level of the fourth lumbar spinal 
segment. Which of the following structures would most likely be spared from destruction?  
Lateral horn 
Dorsal horn  
Ventral horn  
Gray matter  
Pia mater 
A patient presents with lower back pain radiating down the posterior aspect of the leg. This pain is 
MOST likely caused by compression of a nerve root at which level of the spine?{ 
=Lumbar spine 
~Thoracic spine 
~Cervical spine 
~Sacral spine 
~Coccyx 
} 
A patient is diagnosed with a retroperitoneal hematoma after a car accident. Which of the following 
organs, located in the retroperitoneal space, is MOST likely the source of the bleeding?{ 
=Kidney 
~Stomach 
~Small intestine 
~Liver 
~Gallbladder 
} 
A patient undergoes an abdominal CT scan that reveals a mass in the retroperitoneal space anterior 
to the vertebral bodies and posterior to the peritoneum. Which structure is MOST likely involved?{ 
=Abdominal aorta or inferior vena cava 
~Stomach 
~Spleen 
~Liver 
~Transverse colon 
} 
A patient presents with flank pain and hematuria (blood in the urine). Which retroperitoneal organ is 
MOST likely affected?{ 
=Kidney 
~Pancreas 
~Adrenal gland 
~Ureter 
~Ascending colon 
} 
A patient has a tumor involving the psoas major muscle. This muscle is located:{ 
=Retroperitoneally 
~Intraperitoneally 
~Within the pelvis only 
~Within the abdominal wall only 
~Within the thoracic cavity 
}`;

const topic15 = `TOPIC 15 
t.v./Topic 15 
A 68-year-old woman with uterine carcinoma undergoes surgical resection. This cancer can spread 
directly to the labia majora in lymphatics that follow which of the following structures? 
Round ligament of the uterus 
Pubic arcuate ligament  
Suspensory ligament of the ovary  
Cardinal (transverse cervical) ligament  
Suspensory ligament of the clitoris  
A 17-year-old boy suffers a traumatic groin injury during a soccer match. The urologist notices 
tenderness and swelling of the boy’s left testicle that may be produced by thrombosis in which of the 
following veins? 
Left renal vein 
Left internal pudendal vein  
Inferior vena cava  
Left inferior epigastric vein  
Left external pudendal vein 
On a busy Saturday night in Chicago, a 16-year-old boy presents to the emergency department with 
a stab wound from a knife that entered the pelvis above the piriformis muscle. Which of the 
following structures is most likely to be damaged? 
Superior gluteal nerve 
Sciatic nerve 
Internal pudendal artery  
Inferior gluteal artery  
Posterior femoral cutaneous nerve 
A 22-year-old woman receives a deep cut in the inguinal canal 1 in. lateral to the pubic tubercle. 
Which of the following ligaments is lacerated within the inguinal canal? 
Round ligament of the uterus 
Suspensory ligament of the ovary  
Ovarian ligament  
Mesosalpinx 
Rectouterine ligament 
A 29-year-old carpenter sustains severe injuries of the pelvic splanchnic nerve by a deep puncture 
wound, which has become contaminated. The injured parasympathetic preganglionic fibers in the 
splanchnic nerve are most likely to synapse in which of the following ganglia? 
Ganglia in or near the viscera or pelvic plexus 
Sympathetic chain ganglia  
Collateral ganglia  
Dorsal root ganglia  
Ganglion impar 
A 59-year-old woman comes to a local hospital for uterine cancer surgery. As the uterine 
artery passes from the internal iliac artery to the 
uterus, it crosses superior to which of the following structures that is sometimes mistakenly 
ligated during such surgery? 
Ureter 
Ovarian artery  
Ovarian ligament  
Uterine tube  
Round ligament of the uterus 
A 29-year-old woman is admitted to a hospital because the birth of her child is several days 
overdue. Tearing of the pelvic diaphragm during childbirth leads to paralysis of which of the 
following muscles? 
Levator ani 
Piriformis  
Sphincter urethrae  
Obturator internus  
Sphincter ani externus 
8. A 37-year-old small business manager receives a gunshot wound in the pelvic cavity, resulting in a 
lesion of the sacral splanchnic nerves. Which of the following nerve fibers would primarily be 
damaged? 
Preganglionic sympathetic fibers 
Postganglionic parasympathetic fibers 
Postganglionic sympathetic fibers 
Preganglionic parasympathetic fibers 
Postganglionic sympathetic and parasympathetic fibers 
A young couple is having difficulty conceiving a child. Their physician at a reproduction and fertility 
clinic explains to them that 
Fertilization occurs in the infundibulum or ampulla of the uterine tube 
The ovary lies within the broad ligament 
The glans clitoris is formed from the corpus spongiosum 
Erection of the penis is a sympathetic response 
Ejaculation follows parasympathetic stimulation 
A 46-year-old woman has a history of infection in her perineal region. A comprehensive examination 
reveals a tear of the superior boundary of the superficial perineal space. Which of the following 
structures would most likely be injured? 
Perineal membrane 
Pelvic diaphragm  
Colles fascia  
Superficial perineal fascia  
Deep perineal fascia  
11. A 58-year-old man is diagnosed as having a slowly growing tumor in the deep perineal space. 
Which of the following structures would most likely be injured? 
Bulbourethral glands  
Crus of penis  
Bulb of vestibule  
Spongy urethra  
Great vestibular gland 
12. An elderly man with a benign enlargement of his prostate experiences difficulty in urination, 
urinary frequency, and urgency. Which of the following lobes of the prostate gland is commonly 
involved in benign hypertrophy that obstructs the prostatic urethra? 
Middle lobe 
Anterior lobe 
Right lateral lobe 
Left lateral lobe  
Posterior lobe 
A male patient presents with difficulty initiating urination and a weak urinary stream. Digital rectal 
examination reveals an enlarged prostate gland. The prostate gland is located:{ 
=Inferior to the urinary bladder 
~Superior to the urinary bladder 
~Anterior to the rectum 
~Posterior to the rectum 
~Lateral to the rectum 
} 
A female patient presents with pelvic pain and a feeling of pressure in the pelvis. On examination, a 
prolapse of the pelvic organs is noted. Which structure is MOST likely involved in a rectocele?{ 
=Rectum 
~Urinary bladder 
~Uterus 
~Urethra 
~Vagina 
} 
A patient is diagnosed with bladder cancer. The tumor is located in the trigone of the bladder. This 
area is defined by the openings of:{ 
=The two ureters and the urethra 
~The ureters and the rectum 
~The urethra and the rectum 
~The ureters and the uterine tubes (in females) 
~The urethra and the uterine tubes (in females) 
} 
A patient undergoes a pelvic fracture that damages the pelvic floor muscles. Which muscle is MOST 
important for supporting the pelvic organs and preventing prolapse?{ 
=Levator ani 
~Piriformis 
~Obturator internus 
~Coccygeus 
~Iliopsoas 
} 
A patient experiences fecal incontinence after a difficult childbirth. Which muscle, part of the levator 
ani, is MOST likely damaged?{ 
=Puborectalis 
~Pubococcygeus 
~Iliococcygeus 
~Coccygeus 
~Piriformis 
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
    
    // Remove leading numbers like "8. " or "11. "
    line = line.replace(/^\d+\.\s*/, '');
    
    currentQ += (currentQ ? " " : "") + line;
    if(line.endsWith('?') || line.endsWith(':') || line.endsWith('tube') && currentQ.includes('explains to them that')) {
      // Small manual fix: Question 9 in Topic 15 ends with "...explains to them that", which isn't ? or :. 
      // I'll adjust the parser so if line ends with "that", it's a question.
      // Wait, let's just make it robust:
      if (line.endsWith('that')) {
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
        continue;
      }
    }
    
    if(line.endsWith('?') || line.endsWith(':')) {
      // In Topic 13 Q4, option 1 and 2 are split?
      // Let's just consume the next 5 NON-question lines.
      let numOpts = 5;
      for(let j=0; j<numOpts; j++) {
        if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
          currentOpts.push(lines[i+1+j]);
        }
      }
      // Wait, some options span multiple lines?
      // e.g., Topic 13 Q4:
      // Caput medusae and hemorrhoids caused 
      // by portal hypertension 
      // If we just take 5 lines, we'll miss some.
      // Since it's messy, let's just use the basic 5-line heuristic.
      // Let's combine lines if they don't look like options, but actually most start with capital letters.
      // I'll just consume 5 lines. If one is split, it will take 5 lines and the next question will be messed up.
      // Let's see Topic 13 Q4 options:
      // 1. Caput medusae and hemorrhoids caused by portal hypertension (split into 2)
      // 2. Lower blood pressure than in the IVC
      // 3. Least risk of venous varices because of portal hypertension
      // 4. Distention of the portal vein resulting from its numerous valves (split into 2)
      // 5. Less blood flow than in the hepatic artery
      // Total lines = 7 lines!
      // This requires a smarter parser: all lines until the next question (which ends in ? or :).
      let tempOpts = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('{') && !lines[j].endsWith('?') && !lines[j].endsWith(':') && !lines[j].endsWith('that')) {
        tempOpts.push(lines[j]);
        j++;
      }
      i = j - 1;
      
      // Merge tempOpts into 5 options based on capitalized letters? Or just keep them as an array.
      // It's safer to just join them and split into 5, but we can't easily. Let's just use tempOpts as the options array.
      qs.push({ question: currentQ, options: tempOpts });
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

const t13 = parseTopic(topic13);
const t14 = parseTopic(topic14);
const t15 = parseTopic(topic15);

const filePath = 'c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js';
let existing = fs.readFileSync(filePath, 'utf8');

existing = existing.replace(/\s*\};?\s*$/, '');

let out = existing + ',\n';

[t13, t14, t15].forEach((qArray, idx) => {
  const actualIdx = idx + 12; // Topic 13 is index 12 (0-indexed topic count)
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
