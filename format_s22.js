const fs = require('fs');

const explanations = [
  // Topic 1
  "Grasping forceps are designed with atraumatic, fenestrated jaws to safely hold and manipulate delicate tissues like bowel or omentum without causing crush injuries during laparoscopy.",
  "A hemostat (artery forceps) has serrated jaws and a locking ratchet mechanism designed specifically to clamp bleeding blood vessels to achieve hemostasis before ligation or cautery.",
  "The suffix '-ectomy' means surgical removal. A cholecystectomy is the surgical removal of the gallbladder (cholecyst-), typically performed to treat symptomatic gallstones.",
  "A scalpel with a surgical blade (typically #10 or #15) is the primary instrument used to make clean, precise linear incisions through the skin and subcutaneous fat.",
  "An anastomosis is a surgical connection created between two tubular structures, such as blood vessels or segments of the intestine, to restore continuity after resection.",
  "The scalpel is safely and precisely held using either the pencil grip (for fine, precise incisions) or the overhand/fingertip grip (for longer, firmer incisions).",
  "The scalpel must always be held in the surgeon's dominant hand to ensure maximum control, precision, and safety during tissue dissection and incisions.",
  "Standard surgical hand antisepsis requires a thorough scrub or the application of an alcohol-based hand rub for at least two minutes prior to every surgical procedure.",
  "A scrub cap (along with a surgical mask and dedicated scrubs) is part of standard surgical attire to prevent hair and dander from contaminating the sterile operating room environment.",
  "Anatomical forceps are non-toothed and atraumatic, making them ideal for handling delicate structures like nerves, blood vessels, and mucosa without causing puncture damage.",
  "A Pean clamp (or Kelly/Pean forceps) is a heavy hemostatic forceps used primarily to securely clamp larger blood vessels or tissue bundles to achieve hemostasis.",
  "Amputation refers to the surgical removal of all or part of an extremity (limb) or appendage, typically due to severe trauma, infection, or ischemia.",
  "The suffix '-rrhaphy' denotes the surgical suturing or repair of an organ or tissue wall, such as herniorrhaphy (repair of a hernia) or myorrhaphy (suturing of a muscle).",
  "Laparotomy (from 'laparo-' meaning flank/abdomen and '-tomy' meaning incision) is a surgical incision into the abdominal cavity to provide access to the abdominal organs.",
  "Cholecystectomy is the surgical removal of the gallbladder, derived from 'chole-' (bile), 'cyst-' (bladder), and '-ectomy' (excision).",
  
  // Topic 2
  "The opponens pollicis inserts on the first metacarpal, making it highly susceptible to injury or dysfunction in base of thumb fractures.",
  "The median nerve, compressed in carpal tunnel syndrome, innervates the LOAF muscles: Lateral two lumbricals, Opponens pollicis, Abductor pollicis brevis, Flexor pollicis brevis.",
  "The ulnar bursa envelops the tendons of the flexor digitorum superficialis and profundus; infection here threatens these specific tendons.",
  "Abduction is initiated by the supraspinatus (suprascapular nerve) and continued by the deltoid (axillary nerve).",
  "Collateral circulation around the surgical neck via the posterior humeral circumflex artery can supply the profunda brachii artery.",
  "Holding paper between fingers requires adduction and abduction, powered by the interossei muscles, which are innervated by the ulnar nerve.",
  "The proximal row consists of the scaphoid, lunate, triquetrum, and pisiform. Capitate, hamate, trapezium, trapezoid are distal.",
  "The rotator cuff consists of the SITS muscles (Supraspinatus, Infraspinatus, Teres minor, Subscapularis). Teres major is not part of the rotator cuff.",
  "The princeps pollicis artery is a direct terminal branch of the radial artery supplying the thumb.",
  "The dorsal scapular artery branches from the subclavian artery and contributes to the scapular anastomosis.",
  "The lateral pectoral nerve arises from the lateral cord to innervate the pectoralis major muscle.",
  "There is no dorsal interosseous muscle attached to the little finger (digit 5).",
  "The median nerve innervates most of the flexors in the anterior forearm and the pronator teres/quadratus.",
  "A Colles' fracture is a classic fracture of the distal radius with dorsal (posterior) displacement, usually from a fall on an outstretched hand.",
  "Carpal tunnel release surgically divides the flexor retinaculum (transverse carpal ligament) to relieve pressure on the median nerve.",
  "The ulnar artery travels down the medial (ulnar) side of the forearm and passes just proximal to the wrist.",
  "The radial nerve innervates the extensor compartments of the arm and forearm; injury results in paralysis of extensors, causing wrist drop."
];

const topic1 = `A surgeon needs to grasp and hold delicate tissue during a laparoscopic procedure. Which 
instrument is MOST appropriate?{ 
=Grasping forceps 
~Scalpel 
~Hemostat 
~Mayo scissors 
~Retractor 
} 
During an open appendectomy, the surgeon needs to control bleeding from small blood vessels. 
Which instrument is BEST suited for this purpose?{ 
=Hemostat 
~Scalpel 
~Scissors 
~Forceps 
~Retractor 
} 
A patient is scheduled for a cholecystectomy ,This procedure involves:{ 
=Removal of the gallbladder 
~Removal of the appendix 
~Removal of the spleen 
~Removal of the liver 
~Removal of the pancreas 
} 
A surgeon is performing a laparotomy (abdominal exploration) and needs to create an incision 
through the skin and subcutaneous tissue. Which instrument is used to make the initial skin 
incision?{ 
=Scalpel 
~Scissors 
~Forceps 
~Hemostat 
~Retractor 
} 
During a surgical procedure, the term "anastomosis" refers to:{ 
=Surgical connection between two structures (e.g., blood vessels or bowel segments) 
~Removal of a structure 
~Repair of a structure 
~Cutting of a structure 
~Examination of a structure 
} 
What is the correct way to hold a scalpel? (Select all that apply){ 
=The pencil grip , the overhand/fingertip grip 
~Left hand 
~Wright hand 
~The scalpel grip 
~There is no incorrect way 
} 
In what hand should you hold your scalpel?{ 
=The dominant hand 
~The in-dominant hand 
~Always the right hand 
~Always the left hand 
~Both hands 
} 
When and for how lang must you apply hand disinfectant?{ 
=Two minutes before every surgery 
~Five minutes before every surgery 
~Two minutes before your first surgery only 
~Five minutes before your first surgery only 
~Ten minutes before every surgery 
} 
What should you ALWAYS wear entering the operation room? (Select all that apply){ 
=Scrub cap 
~Sterile gloves 
~Sterile scrubs 
~Surgical mask 
~Sterile apron 
} 
What forceps is used to hold sensitive tissue like nerves?{ 
=The anatomical forceps 
~The tissue forceps 
~The adson forceps 
~The langenbeck forceps 
~The surgical forceps 
} 
What is a pean used to?{ 
=To clamp blood vessels for haemostasis 
~To retract soft tissue exposing the surgical site 
~To provide a solide grip on tissue 
~To cut sutures? 
~Incision of the organ 
} 
What does amputation means?{ 
=Removal of  the limbs 
~Incision of the limbs 
~Excision pathological process 
~Incision of the abdominal wall 
~Stitching of the tissue 
} 
What does mean rraphy?{ 
=Stitching of the organs wall 
~Removal part of the organs 
~Excision pathological process 
~Incision of the limbs 
~Fixation of the tissue 
} 
What does mean laparotomy?{ 
=Incision of the abdominal wall 
~Removal tissue 
~Stitching abdominal wall 
~Excision organ 
~Viewing organ with instruments 
} 
What does mean cholecystectomy?{ 
=Removal of the gall bladder 
~Removal intestine 
~Removal liver 
~Removal uterus 
~Removal kidney 
}`;

const topic2 = `A patient with Bennett fracture (a fracture of the base of the first metacarpal bone) experiences an 
impaired thumb movement. Which of the following intrinsic muscles of the thumb is most likely 
injured? 
Opponens pollicis  
Abductor pollicis brevis 
Flexor pollicis brevis (superficial head) 
Adductor pollicis 
Flexor pollicis brevis (deep head) 

A 27-year-old pianist with a known carpal tunnel syndrome experiences difficulty in finger 
movements. Which of the   following intrinsic muscles of her hand is paralyzed? 
Lateral two lumbricals and opponens 
Palmar interossei and adductor pollicis 
Dorsal interossei  
Abductor pollicis brevis and palmar 
interossei 
Medial two and lateral two lumbricals 

A 31-year-old roofer walks in with tenosynovitis resulting from a deep penetrated wound in the palm 
by a big nail. Examination indicates that he has an infection in the ulnar bursa. This infection most 
likely resulted in necrosis of which of the following tendons? 
Tendon of the flexor digitorum profundus 
Tendon of the flexor carpi ulnaris  
Tendon of the flexor pollicis longus  
Tendon of the flexor carpi radialis  
Tendon of the palmaris longus 

An 18-year-old boy involved in an automobile accident presents with an arm that cannot 
abduct. His paralysis is caused by damage to which of the following nerves? 
Suprascapular and axillary 
Thoracodorsal and upper subscapular 
Axillary and musculocutaneous 
Radial and lower subscapular 
Suprascapular and dorsal scapular 

A 17-year-old boy with a stab wound received multiple injuries on the upper part of the arm and 
required surgery. If the brachial artery were ligated at its origin, which of the following arteries would 
supply blood to the profunda brachii artery? 
Posterior humeral circumflex 
Lateral thoracic 
Subscapular 
Superior ulnar collateral 
Radial recurrent 

A man is unable to hold typing paper between his index and middle fingers. Which of the following 
nerves was likely injured? 
Ulnar nerve 
Radial nerve  
Median nerve  
Musculocutaneous nerve  
Axillary nerve 

The victim of an automobile accident has a destructive injury of the proximal row of carpal bones. 
Which of the following bones is most likely damaged?  
Triquetrum 
Capitate  
Hamate 
Trapezium  
Trapezoid 

A patient has a torn rotator cuff of the shoulder joint as the result of an automobile accident. Which 
of the following muscle tendons is intact and has normal function? 
Teres major 
Supraspinatus  
Subscapularis  
Teres minor 
Infraspinatus 

A patient complains of having pain with repeated movements of his thumb (claudication). His 
physician performs the Allen test and finds an insufficiency of the radial artery. Which of the 
following conditions would be a result of the radial artery stenosis? 
A marked decrease in the blood flow in the princeps pollicis artery 
A marked decrease in the blood flow in the superficial palmar arterial arch 
Decreased pulsation in the artery passing superficial to the flexor retinaculum 
Ischemia of the entire extensor muscles of the forearm 
A low blood pressure in the anterior interosseous artery 

A patient bleeding from the shoulder secondary to a knife wound is in fair condition because there is 
vascular anastomosis around the shoulder. Which of the following arteries is most likely a direct 
branch of the subclavian artery that is involved in the anastomosis? 
Dorsal scapular artery  
Thoracoacromial artery  
Circumflex scapular artery  
Transverse cervical artery 

A 20-year-old man fell from the parallel bar during the Olympic trial. A neurologic examination 
reveals that he has a lesion of the lateral cord of the brachial plexus. Which of the following muscles 
is most likely weakened by 
this injury?  
Pectoralis major 
Subscapularis  
Teres major  
Latissimus dorsi  
Teres minor  

A 24-year-old carpenter suffers a crush injury of his entire little finger. Which of the following muscles 
is most likely to be spared? 
Dorsal interossei 
Flexor digitorum profundus  
Extensor digitorum  
Palmar interossei  
Lumbricals 

A patient presents with a stab wound to the anterior forearm, resulting in loss of wrist flexion and 
weakness in pronation. Which nerve is MOST likely injured?{ 
=Median nerve 
~Radial nerve 
~Ulnar nerve 
~Musculocutaneous nerve 
~Axillary nerve 
} 

A patient falls on an outstretched hand, resulting in a fracture of the distal radius with dorsal 
displacement. This is commonly known as a:{ 
=Colles' fracture 
~Smith's fracture 
~Scaphoid fracture 
~Hamate fracture 
~Monteggia fracture 
} 

A surgeon is performing a carpal tunnel release. The primary goal of this procedure is to decompress 
the:{ 
=Median nerve 
~Radial nerve 
~Ulnar nerve 
~Flexor carpi radialis tendon 
~Palmaris longus tendon 
} 

A patient sustains a deep laceration to the medial aspect of the forearm, just proximal to the wrist. 
Which artery is MOST at risk of injury?{ 
=Ulnar artery 
~Radial artery 
~Anterior interosseous artery 
~Posterior interosseous artery 
~Brachial artery 
} 

A patient presents with difficulty extending the fingers at the metacarpophalangeal joints and wrist 
drop. Which nerve is likely affected, often due to injury in the radial groove of the humerus or during 
procedures on the forearm?{ 
=Radial nerve 
~Median nerve 
~Ulnar nerve 
~Musculocutaneous nerve 
~Axillary nerve 
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
  // Topic 2 has some questions separated by double newlines or similar.
  const blocks = text.split(/\n\s*\n/).filter(t => t.trim());
  let qs = [];
  blocks.forEach(block => {
    if(block.includes('{')) {
      qs = qs.concat(parseFormatted(block));
    } else {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      // Last 5 lines are options. (except one has "interossei" wrapped... wait!)
      // Wait, let's look at question 2 in unformatted.
      // "Abductor pollicis brevis and palmar\ninterossei" -> this is wrapped!
      // To be safe, let's count options. In unformatted they are strictly the last N lines, but with wrapping, it's tricky.
      // Let's just find the first line that doesn't end with "?" or is after the question.
      let qText = "";
      let optLines = [];
      let foundQ = false;
      for(let i=0; i<lines.length; i++) {
        if(!foundQ) {
          qText += (qText ? " " : "") + lines[i];
          if(lines[i].endsWith('?') || lines[i].endsWith(':')) {
             foundQ = true;
          }
        } else {
          optLines.push(lines[i]);
        }
      }
      // If "interossei" is on a separate line, let's join it to the previous if it makes 6 options?
      if(optLines.length === 6) {
        // Find "interossei" and merge
        const idx = optLines.findIndex(o => o.toLowerCase() === 'interossei');
        if(idx > 0) {
          optLines[idx-1] += " " + optLines[idx];
          optLines.splice(idx, 1);
        }
      }
      
      qs.push({ question: qText, options: optLines });
    }
  });
  return qs;
}

let t1Qs = parseFormatted(topic1);
let t2Qs = parseUnformatted(topic2);

let explanationIndex = 0;
let out = \`export const s_2_2_situational = {\\n\`;

[t1Qs, t2Qs].forEach((qArray, idx) => {
  out += \`  "t-s-2-2-\${idx}": [\\n\`;
  qArray.forEach((q, qidx) => {
    out += \`    {\\n\`;
    out += \`      "question": \${JSON.stringify(q.question)},\\n\`;
    out += \`      "options": [\\n\`;
    q.options.forEach((op, opidx) => {
      out += \`        \${JSON.stringify(op)}\${opidx === q.options.length-1 ? '' : ','}\\n\`;
    });
    out += \`      ],\\n\`;
    out += \`      "correctIndex": 0,\\n\`;
    out += \`      "explanation": \${JSON.stringify(explanations[explanationIndex] || "")}\\n\`;
    out += \`    }\${qidx === qArray.length-1 ? '' : ','}\\n\`;
    explanationIndex++;
  });
  out += \`  ]\${idx === 1 ? '' : ','}\\n\`;
});

out += \`};\\n\`;

fs.writeFileSync('c:\\\\samu_mcq\\\\mobile-app\\\\src\\\\data\\\\repository\\\\course2\\\\s-2-2-situational.js', out);
console.log('done');
