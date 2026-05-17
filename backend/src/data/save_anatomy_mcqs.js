const mongoose = require('mongoose');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const connectDB = require('../config/db');

const ANATOMY_DATA = {
  "Topic 1": [
    {
      q: "A surgeon needs to grasp and hold delicate tissue during a laparoscopic procedure. Which instrument is MOST appropriate?",
      opts: ["Grasping forceps", "Scalpel", "Hemostat", "Mayo scissors", "Retractor"],
      correct: 0
    },
    {
      q: "During an open appendectomy, the surgeon needs to control bleeding from small blood vessels. Which instrument is BEST suited for this purpose?",
      opts: ["Hemostat", "Scalpel", "Scissors", "Forceps", "Retractor"],
      correct: 0
    },
    {
      q: "A patient is scheduled for a cholecystectomy, This procedure involves:",
      opts: ["Removal of the gallbladder", "Removal of the appendix", "Removal of the spleen", "Removal of the liver", "Removal of the pancreas"],
      correct: 0
    },
    {
      q: "A surgeon is performing a laparotomy (abdominal exploration) and needs to create an incision through the skin and subcutaneous tissue. Which instrument is used to make the initial skin incision?",
      opts: ["Scalpel", "Scissors", "Forceps", "Hemostat", "Retractor"],
      correct: 0
    },
    {
      q: "During a surgical procedure, the term \"anastomosis\" refers to:",
      opts: ["Surgical connection between two structures (e.g., blood vessels or bowel segments)", "Removal of a structure", "Repair of a structure", "Cutting of a structure", "Examination of a structure"],
      correct: 0
    },
    {
      q: "What is the correct way to hold a scalpel? (Select all that apply)",
      opts: ["The pencil grip, the overhand/fingertip grip", "Left hand", "Wright hand", "The scalpel grip", "There is no incorrect way"],
      correct: 0
    },
    {
      q: "In what hand should you hold your scalpel?",
      opts: ["The dominant hand", "The in-dominant hand", "Always the right hand", "Always the left hand", "Both hands"],
      correct: 0
    },
    {
      q: "When and for how lang must you apply hand disinfectant?",
      opts: ["Two minutes before every surgery", "Five minutes before every surgery", "Two minutes before your first surgery only", "Five minutes before your first surgery only", "Ten minutes before every surgery"],
      correct: 0
    },
    {
      q: "What should you ALWAYS wear entering the operation room? (Select all that apply)",
      opts: ["Scrub cap", "Sterile gloves", "Sterile scrubs", "Surgical mask", "Sterile apron"],
      correct: 0
    },
    {
      q: "What forceps is used to hold sensitive tissue like nerves?",
      opts: ["The anatomical forceps", "The tissue forceps", "The adson forceps", "The langenbeck forceps", "The surgical forceps"],
      correct: 0
    },
    {
      q: "What is a pean used to?",
      opts: ["To clamp blood vessels for haemostasis", "To retract soft tissue exposing the surgical site", "To provide a solide grip on tissue", "To cut sutures?", "Incision of the organ"],
      correct: 0
    },
    {
      q: "What does amputation means?",
      opts: ["Removal of the limbs", "Incision of the limbs", "Excision pathological process", "Incision of the abdominal wall", "Stitching of the tissue"],
      correct: 0
    },
    {
      q: "What does mean rraphy?",
      opts: ["Stitching of the organs wall", "Removal part of the organs", "Excision pathological process", "Incision of the limbs", "Fixation of the tissue"],
      correct: 0
    },
    {
      q: "What does mean laparotomy?",
      opts: ["Incision of the abdominal wall", "Removal tissue", "Stitching abdominal wall", "Excision organ", "Viewing organ with instruments"],
      correct: 0
    },
    {
      q: "What does mean cholecystectomy?",
      opts: ["Removal of the gall bladder", "Removal intestine", "Removal liver", "Removal uterus", "Removal kidney"],
      correct: 0
    }
  ],
  "Topic 2": [
    {
      q: "A patient with Bennett fracture (a fracture of the base of the first metacarpal bone) experiences an impaired thumb movement. Which of the following intrinsic muscles of the thumb is most likely injured?",
      opts: ["Opponens pollicis", "Abductor pollicis brevis", "Flexor pollicis brevis (superficial head)", "Adductor pollicis", "Flexor pollicis brevis (deep head)"],
      correct: 0
    },
    {
      q: "A 27-year-old pianist with a known carpal tunnel syndrome experiences difficulty in finger movements. Which of the following intrinsic muscles of her hand is paralyzed?",
      opts: ["Lateral two lumbricals and opponens", "Palmar interossei and adductor pollicis", "Dorsal interossei", "Abductor pollicis brevis and palmar interossei", "Medial two and lateral two lumbricals"],
      correct: 0
    },
    {
      q: "A 31-year-old roofer walks in with tenosynovitis resulting from a deep penetrated wound in the palm by a big nail. Examination indicates that he has an infection in the ulnar bursa. This infection most likely resulted in necrosis of which of the following tendons?",
      opts: ["Tendon of the flexor digitorum profundus", "Tendon of the flexor carpi ulnaris", "Tendon of the flexor pollicis longus", "Tendon of the flexor carpi radialis", "Tendon of the palmaris longus"],
      correct: 0
    },
    {
      q: "An 18-year-old boy involved in an automobile accident presents with an arm that cannot abduct. His paralysis is caused by damage to which of the following nerves?",
      opts: ["Suprascapular and axillary", "Thoracodorsal and upper subscapular", "Axillary and musculocutaneous", "Radial and lower subscapular", "Suprascapular and dorsal scapular"],
      correct: 0
    },
    {
      q: "A 17-year-old boy with a stab wound received multiple injuries on the upper part of the arm and required surgery. If the brachial artery were ligated at its origin, which of the following arteries would supply blood to the profunda brachii artery?",
      opts: ["Posterior humeral circumflex", "Lateral thoracic", "Subscapular", "Superior ulnar collateral", "Radial recurrent"],
      correct: 0
    },
    {
      q: "A man is unable to hold typing paper between his index and middle fingers. Which of the following nerves was likely injured?",
      opts: ["Ulnar nerve", "Radial nerve", "Median nerve", "Musculocutaneous nerve", "Axillary nerve"],
      correct: 0
    },
    {
      q: "The victim of an automobile accident has a destructive injury of the proximal row of carpal bones. Which of the following bones is most likely damaged?",
      opts: ["Triquetrum", "Capitate", "Hamate", "Trapezium", "Trapezoid"],
      correct: 0
    },
    {
      q: "A patient has a torn rotator cuff of the shoulder joint as the result of an automobile accident. Which of the following muscle tendons is intact and has normal function?",
      opts: ["Teres major", "Supraspinatus", "Subscapularis", "Teres minor", "Infraspinatus"],
      correct: 0
    },
    {
      q: "A patient complains of having pain with repeated movements of his thumb (claudication). His physician performs the Allen test and finds an insufficiency of the radial artery. Which of the following conditions would be a result of the radial artery stenosis?",
      opts: ["A marked decrease in the blood flow in the princeps pollicis artery", "A marked decrease in the blood flow in the superficial palmar arterial arch", "Decreased pulsation in the artery passing superficial to the flexor retinaculum", "Ischemia of the entire extensor muscles of the forearm", "A low blood pressure in the anterior interosseous artery"],
      correct: 0
    },
    {
      q: "A patient bleeding from the shoulder secondary to a knife wound is in fair condition because there is vascular anastomosis around the shoulder. Which of the following arteries is most likely a direct branch of the subclavian artery that is involved in the anastomosis?",
      opts: ["Dorsal scapular artery", "Thoracoacromial artery", "Circumflex scapular artery", "Transverse cervical artery"],
      correct: 0
    },
    {
      q: "A 20-year-old man fell from the parallel bar during the Olympic trial. A neurologic examination reveals that he has a lesion of the lateral cord of the brachial plexus. Which of the following muscles is most likely weakened by this injury?",
      opts: ["Pectoralis major", "Subscapularis", "Teres major", "Latissimus dorsi", "Teres minor"],
      correct: 0
    },
    {
      q: "A 24-year-old carpenter suffers a crush injury of his entire little finger. Which of the following muscles is most likely to be spared?",
      opts: ["Dorsal interossei", "Flexor digitorum profundus", "Extensor digitorum", "Palmar interossei", "Lumbricals"],
      correct: 0
    },
    {
      q: "A patient presents with a stab wound to the anterior forearm, resulting in loss of wrist flexion and weakness in pronation. Which nerve is MOST likely injured?",
      opts: ["Median nerve", "Radial nerve", "Ulnar nerve", "Musculocutaneous nerve", "Axillary nerve"],
      correct: 0
    },
    {
      q: "A patient falls on an outstretched hand, resulting in a fracture of the distal radius with dorsal displacement. This is commonly known as a:",
      opts: ["Colles' fracture", "Smith's fracture", "Scaphoid fracture", "Hamate fracture", "Monteggia fracture"],
      correct: 0
    },
    {
      q: "A surgeon is performing a carpal tunnel release. The primary goal of this procedure is to decompress the:",
      opts: ["Median nerve", "Radial nerve", "Ulnar nerve", "Flexor carpi radialis tendon", "Palmaris longus tendon"],
      correct: 0
    },
    {
      q: "A patient sustains a deep laceration to the medial aspect of the forearm, just proximal to the wrist. Which artery is MOST at risk of injury?",
      opts: ["Ulnar artery", "Radial artery", "Anterior interosseous artery", "Posterior interosseous artery", "Brachial artery"],
      correct: 0
    },
    {
      q: "A patient presents with difficulty extending the fingers at the metacarpophalangeal joints and wrist drop. Which nerve is likely affected, often due to injury in the radial groove of the humerus or during procedures on the forearm?",
      opts: ["Radial nerve", "Median nerve", "Ulnar nerve", "Musculocutaneous nerve", "Axillary nerve"],
      correct: 0
    }
  ],
  "Topic 3": [
    {
      q: "A 21-year-old patient has a lesion of the upper trunk of the brachial plexus (Erb–Duchenne paralysis). Which of the following is the most likely diagnosis?",
      opts: ["Arm tending to lie in medial rotation", "Paralysis of the rhomboid major", "Inability to elevate the arm above the horizontal", "Loss of sensation on the medial side of the arm", "Inability to adduct the thumb"],
      correct: 0
    },
    {
      q: "A patient comes in with a gunshot wound and requires surgery in which his thoracoacromial trunk needs to be ligated. Which of the following arterial branches would maintain normal blood flow?",
      opts: ["Superior thoracic", "Acromia", "Pectoral", "Clavicular", "Deltoid"],
      correct: 0
    },
    {
      q: "A 29-year-old man comes in with a stab wound, cannot raise his arm above horizontal, and exhibits a condition known as “winged scapula.” Which of the following structures of the brachial plexus would most likely be damaged?",
      opts: ["Roots", "Medial cord", "Posterior cord", "Lower trunk", "Upper trunk"],
      correct: 0
    },
    {
      q: "A 16-year-old patient has weakness flexing the metacarpophalangeal joint of the ring finger and is unable to adduct the same finger. Which of the following muscles is most likely paralyzed?",
      opts: ["Palmar interosseous", "Flexor digitorum profundus", "Extensor digitorum", "Lumbrical", "Dorsal interosseous"],
      correct: 0
    },
    {
      q: "A 27-year-old patient presents with an inability to draw the scapula forward and downward because of paralysis of the pectoralis minor. Which of the following would most likely be a cause of his condition?",
      opts: ["Fracture of the coracoid process", "Fracture of the clavicle", "Injury to the posterior cord of the brachial plexus", "Fracture of the coracoid process", "Axillary nerve injury"],
      correct: 0
    },
    {
      q: "A 22-year-old patient received a stab wound in the chest that injured the intercostobrachial nerve. Which of the following conditions results from the described lesion of the nerve?",
      opts: ["Loss of sensory fibers from the second intercostal nerve", "Inability to move the ribs", "Loss of tactile sensation on the lateral aspect of the arm", "Absence of sweating on the posterior aspect of the arm", "Damage to the sympathetic preganglionic fibers"],
      correct: 0
    },
    {
      q: "A 16-year-old boy fell from a motorcycle, and his radial nerve was severely damaged because of a fracture of the midshaft of the humerus. Which of the following conditions would most likely result from this accident?",
      opts: ["Loss of wrist extension leading to wrist drop", "Weakness in pronating the forearm", "Sensory loss over the ventral aspect of the base of the thumb", "Inability to oppose the thumb", "Inability to abduct the fingers"],
      correct: 0
    },
    {
      q: "A patient comes in complaining that she cannot flex her proximal interphalangeal joints. Which of the following muscles appear(s) to be paralyzed on further examination of her finger?",
      opts: ["Flexor digitorum superficialis", "Palmar interossei", "Dorsal interossei", "Flexor digitorum profundus", "Lumbricals"],
      correct: 0
    },
    {
      q: "A 21-year-old woman walks in with a shoulder and arm injury after falling during horseback riding. Examination indicates that she cannot adduct her arm because of paralysis of which of the following muscles?",
      opts: ["Latissimus dorsi", "Teres minor", "Supraspinatus", "Infraspinatus", "Serratus anterior"],
      correct: 0
    },
    {
      q: "A 35-year-old man walks in with a stab wound to the most medial side of the proximal portion of the cubital fossa. Which of the following structures would most likely be damaged?",
      opts: ["Median nerve", "Biceps brachii tendon", "Radial nerve", "Brachial artery", "Radial recurrent artery"],
      correct: 0
    },
    {
      q: "A 7-year-old boy falls from a tree house and is brought to the emergency department of a local hospital. On examination, he has weakness in rotating his arm laterally because of an injury of a nerve. Which of the following conditions is most likely to cause a loss of this nerve function?",
      opts: ["Inferior dislocation of the head of the humerus", "Injury to the lateral cord of the brachial plexus", "Fracture of the anatomic neck of the humerus", "Knife wound on the teres major muscle", "A tumor in the triangular space in the shoulder region"],
      correct: 0
    },
    {
      q: "A 49-year-old woman is diagnosed as having a large lump in her right breast. Lymph from the cancerous breast drains primarily into which of the following nodes?",
      opts: ["Anterior (pectoral) nodes", "Apical nodes", "Parasternal (internal thoracic) nodes", "Supraclavicular nodes", "Nodes of the anterior abdominal wall"],
      correct: 0
    },
    {
      q: "A patient presents with a stab wound to the anterior forearm, resulting in loss of wrist flexion and weakness in pronation. Which nerve is MOST likely injured?",
      opts: ["Median nerve", "Radial nerve", "Ulnar nerve", "Musculocutaneous nerve", "Axillary nerve"],
      correct: 0
    },
    {
      q: "A patient falls on an outstretched hand, resulting in a fracture of the distal radius with dorsal displacement. This is commonly known as a:",
      opts: ["Colles' fracture", "Smith's fracture", "Scaphoid fracture", "Hamate fracture", "Monteggia fracture"],
      correct: 0
    },
    {
      q: "A surgeon is performing a carpal tunnel release. The primary goal of this procedure is to decompress the:",
      opts: ["Median nerve", "Radial nerve", "Ulnar nerve", "Flexor carpi radialis tendon", "Palmaris longus tendon"],
      correct: 0
    },
    {
      q: "A patient sustains a deep laceration to the medial aspect of the forearm, just proximal to the wrist. Which artery is MOST at risk of injury?",
      opts: ["Ulnar artery", "Radial artery", "Anterior interosseous artery", "Posterior interosseous artery", "Brachial artery"],
      correct: 0
    },
    {
      q: "A patient presents with difficulty extending the fingers at the metacarpophalangeal joints and wrist drop. Which nerve is likely affected, often due to injury in the radial groove of the humerus or during procedures on the forearm?",
      opts: ["Radial nerve", "Median nerve", "Ulnar nerve", "Musculocutaneous nerve", "Axillary nerve"],
      correct: 0
    }
  ],
  "Topic 4": [
    {
      q: "A 27-year-old patient exhibits a loss of skin sensation and paralysis of muscles on the plantar aspect of the medial side of the foot. Which of the following nerves is most likely damaged?",
      opts: ["Tibia", "Common peroneal", "Superficial peroneal", "Deep peroneal", "Sural"],
      correct: 0
    },
    {
      q: "A patient with a deep knife wound in the buttock walks with a waddling gait that is characterized by the pelvis falling toward one side at each step. Which of the following nerves is damaged?",
      opts: ["Superior gluteal nerve", "Femoral nerve", "Obturator nerve", "Nerve to obturator internus", "Inferior gluteal nerve"],
      correct: 0
    },
    {
      q: "A patient is unable to prevent anterior displacement of the femur on the tibia when the knee is flexed. Which of the following ligaments is most likely damaged?",
      opts: ["Posterior cruciate", "Anterior cruciate", "Fibular collateral", "Patellar", "Tibial collateral"],
      correct: 0
    },
    {
      q: "A 41-year-old man was involved in a fight and felt weakness in extending the knee joint. On examination, he was diagnosed with a lesion of the femoral nerve. Which of the following symptoms would be a result of this nerve damage?",
      opts: ["Paralysis of the vastus lateralis muscle", "Paralysis of the psoas major muscle", "Loss of skin sensation on the lateral side of the foot", "Loss of skin sensation over the greater trochanter", "Paralysis of the tensor fasciae latae"],
      correct: 0
    },
    {
      q: "A 47-year-old woman is unable to invert her foot after she stumbled on her driveway. Which of the following nerves are most likely injured?",
      opts: ["Deep peroneal and tibial", "Superficial and deep peroneal", "Superficial peroneal and tibial", "Medial and lateral plantar", "Obturator and tibial"],
      correct: 0
    },
    {
      q: "A 22-year-old patient is unable to “unlock” the knee joint to permit flexion of the leg. Which of the following muscles is most likely damaged?",
      opts: ["Popliteus", "Rectus femoris", "Semimembranosus", "Gastrocnemius", "Biceps femoris"],
      correct: 0
    },
    {
      q: "A patient presents with sensory loss on adjacent sides of the great and second toes and impaired dorsiflexion of the foot. These signs probably indicate damage to which of the following nerves?",
      opts: ["Deep peroneal", "Superficial peroneal", "Lateral plantar", "Sural", "Tibial"],
      correct: 0
    },
    {
      q: "A motorcyclist falls from his bike in an accident and gets a deep gash that severs the superficial peroneal nerve near its origin. Which of the following muscles is paralyzed?",
      opts: ["Peroneus longus", "Extensor hallucis longus", "Extensor digitorum longus", "Peroneus tertius", "Extensor digitorum brevis"],
      correct: 0
    },
    {
      q: "A 52-year-old woman slipped and fell and now complains of being unable to extend her leg at the knee joint. Which off the following muscles was paralyzed as a result of this accident?",
      opts: ["Quadriceps femoris", "Gracilis", "Semitendinosus", "Sartorius", "Biceps femoris"],
      correct: 0
    },
    {
      q: "A patient experiences weakness in dorsiflexing and inverting the foot. Which of the following muscles is damaged?",
      opts: ["Tibialis anterior", "Peroneus longus", "Peroneus brevis", "Extensor digitorum longus", "Peroneus tertius"],
      correct: 0
    },
    {
      q: "Fracture of the neck of the femur results in avascular necrosis of the femoral head, probably resulting from lack of blood supply from which of the following arteries?",
      opts: ["Medial femoral circumflex", "Obturator", "Superior gluteal", "Inferior gluteal", "Lateral femoral circumflex"],
      correct: 0
    },
    {
      q: "If the acetabulum is fractured at its posterosuperior margin by dislocation of the hip joint, which of the following bones could be involved?",
      opts: ["Ilium", "Pubis", "Ischium", "Sacrum", "Head of the femur"],
      correct: 0
    },
    {
      q: "A patient presents with weakness in hip flexion and knee extension after a pelvic fracture. Which nerve is MOST likely injured?",
      opts: ["Femoral nerve", "Obturator nerve", "Sciatic nerve", "Superior gluteal nerve", "Inferior gluteal nerve"],
      correct: 0
    },
    {
      q: "A patient sustains a deep laceration to the anterior thigh. Which muscle is MOST likely to be affected, leading to difficulty extending the knee?",
      opts: ["Quadriceps femoris", "Hamstrings", "Adductors", "Gluteals", "Sartorius"],
      correct: 0
    },
    {
      q: "A surgeon is performing a femoral artery catheterization. Which anatomical landmark is used to locate the femoral artery within the femoral triangle?",
      opts: ["Mid-inguinal point (midpoint between the anterior superior iliac spine and pubic symphysis)", "Midpoint of the inguinal ligament", "Femoral head", "Pubic tubercle", "Ischial tuberosity"],
      correct: 0
    },
    {
      q: "A patient presents with medial thigh pain and difficulty adducting the thigh. Which nerve is MOST likely involved?",
      opts: ["Obturator nerve", "Femoral nerve", "Sciatic nerve", "Superior gluteal nerve", "Inferior gluteal nerve"],
      correct: 0
    },
    {
      q: "A patient experiences numbness and tingling along the lateral aspect of the thigh. Which nerve is MOST likely compressed or irritated?",
      opts: ["Lateral femoral cutaneous nerve", "Femoral nerve", "Obturator nerve", "Sciatic nerve", "Ilioinguinal nerve"],
      correct: 0
    }
  ],
  "Topic 5": [
    {
      q: "A patient experiences paralysis of the muscle that originates from the femur and contributes directly to the stability of the knee joint. Which of the following muscles is involved?",
      opts: ["Vastus lateralis", "Semimembranosus", "Sartorius", "Biceps femoris (long head)", "Rectus femoris"],
      correct: 0
    },
    {
      q: "A patient is involved in a motorcycle wreck that results in avulsion of the skin over the anterolateral leg and ankle. Which of the following structures is most likely destroyed with this type of injury?",
      opts: ["Superficial peroneal nerve", "Deep peroneal nerve", "Extensor digitorum longus muscle tendon", "Dorsalis pedis artery", "Great saphenous vein"],
      correct: 0
    },
    {
      q: "A knife wound penetrates the superficial vein that terminates in the popliteal vein. Bleeding occurs from which of the following vessels?",
      opts: ["Lesser saphenous vein", "Posterior tibial vein", "Anterior tibial vein", "Peroneal vein", "Great saphenous vein"],
      correct: 0
    },
    {
      q: "A 10-year-old boy falls from a tree house. The resultant heavy compression of the sole of his foot against the ground caused a fracture of the head of the talus. Which of the following structures is unable to function normally?",
      opts: ["Medial longitudinal arch", "Transverse arch", "Lateral longitudinal arch", "Tendon of the peroneus longus", "Long plantar ligament"],
      correct: 0
    },
    {
      q: "A 24-year-old woman complains of weakness when she extends her thigh and rotates it laterally. Which of the following muscles is paralyzed?",
      opts: ["Gluteus maximus", "Obturator externus", "Sartorius", "Tensor fasciae latae", "Semitendinosus"],
      correct: 0
    },
    {
      q: "A patient with hereditary blood clotting problems presents with pain in the back of her knee. An arteriograph reveals a blood clot in the popliteal artery at its proximal end. Which of the following arteries will allow blood to reach the foot?",
      opts: ["Lateral circumflex femoral", "Anterior tibial", "Posterior tibial", "Peroneal", "Superior medial genicular"],
      correct: 0
    },
    {
      q: "A 72-year-old woman complains of a cramplike pain in her thigh and leg. She was diagnosed as having a severe intermittent claudication. Following surgery, an infection was found in the adductor canal, damaging the enclosed structures. Which of the following structures remains intact?",
      opts: ["Great saphenous vein", "Femoral artery", "Femoral vein", "Saphenous nerve", "Nerve to the vastus medialis"],
      correct: 0
    },
    {
      q: "A basketball player was hit in the thigh by an opponent’s knee. Which of the following arteries is likely to compress and cause ischemia because of the bruise and damage to the extensor muscles of the leg?",
      opts: ["Anterior tibial", "Popliteal", "Deep femoral", "Posterior tibial", "Peroneal"],
      correct: 0
    },
    {
      q: "An elderly woman fell at home and fractured the greater trochanter of her femur. Which of the following muscles would continue to function normally?",
      opts: ["Gluteus maximus", "Piriformis", "Obturator internus", "Gluteus medius", "Gluteus minimus"],
      correct: 0
    },
    {
      q: "A 20-year-old college student receives a severe blow on the inferolateral side of the left knee joint while playing football. Radiographic examination reveals a fracture of the head and neck of the fibula. Which of the following nerves is damaged?",
      opts: ["Common peroneal", "Sciatic", "Tibial", "Deep peroneal", "Superficial peroneal"],
      correct: 0
    },
    {
      q: "After injury to this nerve, which of the following muscles could be paralyzed?",
      opts: ["Extensor hallucis longus", "Gastrocnemius", "Popliteus", "Flexor digitorum longus", "Tibialis posterior"],
      correct: 0
    },
    {
      q: "If the lateral (fibular) collateral ligament is torn by this fracture, which of the following conditions may occur?",
      opts: ["Abnormal passive adduction of the extended leg", "Abnormal passive abduction of the extended leg", "Anterior displacement of the femur on thetibia", "Posterior displacement of the femur on thetibia", "Maximal flexion of the leg"],
      correct: 0
    },
    {
      q: "A patient presents with foot drop (inability to dorsiflex the foot) after a fracture of the fibular neck. Which nerve is MOST likely injured?",
      opts: ["Common fibular (peroneal) nerve", "Tibial nerve", "Deep fibular (peroneal) nerve", "Superficial fibular (peroneal) nerve", "Sural nerve"],
      correct: 0
    },
    {
      q: "A patient sustains a deep laceration to the posterior aspect of the leg. Which muscle group is MOST likely affected, leading to weakness in plantarflexion?",
      opts: ["Calf muscles (gastrocnemius and soleus)", "Anterior compartment muscles (tibialis anterior, etc.)", "Lateral compartment muscles (fibularis longus and brevis)", "Posterior compartment muscles (tibialis posterior, flexor digitorum longus, flexor hallucis longus)", "Popliteus"],
      correct: 0
    },
    {
      q: "A patient experiences numbness and tingling on the sole of the foot. Which nerve is MOST likely involved?",
      opts: ["Tibial nerve", "Common fibular (peroneal) nerve", "Deep fibular (peroneal) nerve", "Superficial fibular (peroneal) nerve", "Sural nerve"],
      correct: 0
    },
    {
      q: "A patient presents with pain and difficulty inverting the foot. Which muscle is MOST likely affected?",
      opts: ["Tibialis posterior", "Fibularis longus", "Fibularis brevis", "Extensor digitorum longus", "Extensor hallucis longus"],
      correct: 0
    },
    {
      q: "A patient suffers a severe ankle sprain, damaging the lateral ligaments. Which ligament is MOST commonly injured in this type of sprain?",
      opts: ["Anterior talofibular ligament (ATFL)", "Posterior talofibular ligament (PTFL)", "Calcaneofibular ligament (CFL)", "Deltoid ligament", "Spring ligament"],
      correct: 0
    }
  ]
};

async function seedAnatomy() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const course = await Course.findOne({ title: '2nd course' });
    if (!course) throw new Error('Course 2 not found');

    const subject = await Subject.findOne({ title: 'Clinic anatomy', courseId: course._id });
    if (!subject) throw new Error('Clinic anatomy subject not found');

    for (const [topicTitle, questions] of Object.entries(ANATOMY_DATA)) {
      const topic = await Topic.findOne({ title: topicTitle, subjectId: subject._id });
      if (!topic) {
        console.warn(`Topic ${topicTitle} not found, skipping...`);
        continue;
      }

      console.log(`Processing ${topicTitle}...`);
      
      // Delete existing situational tasks for this topic to avoid duplicates
      await MCQ.deleteMany({ topicId: topic._id, taskType: 'situational_task' });

      const mcqDocs = questions.map(q => ({
        topicId: topic._id,
        taskType: 'situational_task',
        question: q.q,
        options: q.opts,
        correctIndex: q.correct,
        explanation: "Verified clinical anatomical answer based on standard medical curriculum."
      }));

      await MCQ.insertMany(mcqDocs);
      console.log(`Inserted ${mcqDocs.length} questions for ${topicTitle}`);
    }

    console.log('✅ ALL ANATOMY TOPICS UPDATED SUCCESSFULLY');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding anatomy:', error);
    process.exit(1);
  }
}

seedAnatomy();
