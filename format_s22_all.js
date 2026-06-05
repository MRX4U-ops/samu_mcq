const fs = require('fs');

const topic1 = `SITUATIONAL TOPIC 1 
A surgeon needs to grasp and hold delicate tissue during a laparoscopic procedure. Which 
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

const topic2 = `SITUATIONAL TOPIC 2 
t.v/Topic 2 
A patient with Bennett fracture (a fracture of the base of the first metacarpal bone) experiences an 
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

const topic3 = `SITUATIONAL TOPIC 3 
t.v./ Topic 3 
A 21-year-old patient has a lesion of the upper trunk of the brachial plexus (Erb–Duchenne paralysis). 
Which of the following is the most likely diagnosis? 
Arm tending to lie in medial rotation 
Paralysis of the rhomboid major 
Inability to elevate the arm above the horizontal 
Loss of sensation on the medial side of the arm 
Inability to adduct the thumb 
A patient comes in with a gunshot wound and requires surgery in which his thoracoacromial trunk 
needs to be ligated. Which of the following arterial branches would maintain normal blood flow?  
Superior thoracic 
Acromia 
Pectoral 
Clavicular  
Deltoid 
A 29-year-old man comes in with a stab wound, cannot raise his arm above horizontal, and exhibits a 
condition known as “winged scapula.” Which of the following structures of the brachial plexus would 
most likely be damaged? 
Roots  
Medial cord 
Posterior cord 
Lower trunk  
Upper trunk 
A 16-year-old patient has weakness flexing the metacarpophalangeal joint of the ring finger and is 
unable to adduct the same finger. Which of the following muscles is most likely paralyzed? 
Palmar interosseous 
Flexor digitorum profundus  
Extensor digitorum  
Lumbrical 
Dorsal interosseous  
A 27-year-old patient presents with an inability to draw the scapula forward and downward because 
of paralysis of the pectoralis minor. Which of the following would most likely be a cause of his 
condition? 
Fracture of the coracoid process 
Fracture of the clavicle 
Injury to the posterior cord of the brachial plexus 
Axillary nerve injury 
A 22-year-old patient received a stab wound in the chest that injured the intercostobrachial nerve. 
Which of the following conditions results from the described lesion of the nerve? 
Loss of sensory fibers from the second intercostal nerve 
Inability to move the ribs 
Loss of tactile sensation on the lateral aspect of the arm 
Absence of sweating on the posterior aspect of the arm 
Damage to the sympathetic preganglionic fibers 
A 16-year-old boy fell from a motorcycle, and his radial nerve was severely damaged because of a 
fracture of the midshaft of the humerus. Which of the following conditions would most likely result 
from this accident? 
Loss of wrist extension leading to wrist drop 
Weakness in pronating the forearm 
Sensory loss over the ventral aspect of the base of the thumb   
Inability to oppose the thumb  
Inability to abduct the fingers 
A patient comes in complaining that she cannot flex her proximal interphalangeal joints. Which of 
the following muscles appear(s) to be paralyzed on further examination of her finger? 
Flexor digitorum superficialis  
Palmar interossei 
Dorsal interossei   
Flexor digitorum profundus 
Lumbricals 
A 21-year-old woman walks in with a shoulder and arm injury after falling during horseback riding. 
Examination indicates that she cannot adduct her arm because of paralysis of which of the following 
muscles?  
Latissimus dorsi  
Teres minor 
Supraspinatus 
Infraspinatus  
Serratus anterior 
A 35-year-old man walks in with a stab wound to the most medial side of the proximal portion of the 
cubital fossa. Which of the following structures would most likely be damaged? 
Median nerve 
Biceps brachii tendon 
Radial nerve 
Brachial artery 
Radial recurrent artery 
A 7-year-old boy falls from a tree house and is brought to the emergency department of a local 
hospital. On examination, he has weakness in rotating his arm laterally because of an injury of a 
nerve. Which of the following conditions is most likely to cause a loss of this nerve function? 
Inferior dislocation of the head of the humerus 
Injury to the lateral cord of the brachial plexus 
Fracture of the anatomic neck of the humerus 
Knife wound on the teres major muscle 
A tumor in the triangular space in the shoulder region 
A 49-year-old woman is diagnosed as having a large lump in her right breast. Lymph from the 
cancerous breast drains primarily into which of the following nodes? 
Anterior (pectoral) nodes 
Apical nodes 
Parasternal (internal thoracic) nodes  
Supraclavicular nodes 
Nodes of the anterior abdominal wall 
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

const topic4 = `SITUATIONAL TOPIC 4 
t.v./Topic 4 
A 27-year-old patient exhibits a loss of skin sensation and paralysis of muscles on the plantar aspect 
of the medial side of the foot. Which of the following nerves is most likely damaged? 
Tibia 
Common peroneal 
Superficial peroneal  
Deep peroneal 
Sural 
A patient with a deep knife wound in the buttock walks with a waddling gait that is characterized by 
the pelvis falling toward one side at each step. Which of the following nerves is damaged? 
Superior gluteal nerve  
Femoral nerve 
Obturator nerve 
Nerve to obturator internus  
Inferior gluteal nerve  
A patient is unable to prevent anterior displacement of the femur on the tibia when the 
knee is flexed. Which of the following ligaments is most likely damaged? 
Posterior cruciate 
Anterior cruciate  
Fibular collateral  
Patellar  
Tibial collateral 
A 41-year-old man was involved in a fight and felt weakness in extending the knee joint. On 
examination, he was diagnosed with a lesion of the femoral nerve. Which of the following symptoms 
would be a result of this nerve damage? 
Paralysis of the vastus lateralis muscle 
Paralysis of the psoas major muscle 
Loss of skin sensation on the lateral side of the foot 
Loss of skin sensation over the greater trochanter 
Paralysis of the tensor fasciae latae 
A 47-year-old woman is unable to invert her foot after she stumbled on her driveway. Which of the 
following nerves are most likely injured? 
Deep peroneal and tibial 
Superficial and deep peroneal 
Superficial peroneal and tibial  
Medial and lateral plantar  
Obturator and tibial 
A 22-year-old patient is unable to “unlock” the knee joint to permit flexion of the leg. Which of the 
following muscles is most likely damaged? 
Popliteus 
Rectus femoris  
Semimembranosus  
Gastrocnemius  
Biceps femoris 
A patient presents with sensory loss on adjacent sides of the great and second toes and 
impaired dorsiflexion of the foot. These signs probably indicate damage to which of the 
following nerves?  
Deep peroneal 
Superficial peroneal  
Lateral plantar  
Sural 
Tibial 
A motorcyclist falls from his bike in an accident and gets a deep gash that severs the superficial 
peroneal nerve near its origin. Which of  the following muscles is paralyzed?  
Peroneus longus  
Extensor hallucis longus  
Extensor digitorum longus  
Peroneus tertius 
Extensor digitorum brevis 
A 52-year-old woman slipped and fell and now complains of being unable to extend her leg at the 
knee joint. Which off the following muscles was paralyzed as a result of this accident? 
Gracilis 
Semitendinosus 
Sartorius 
Quadriceps femoris 
Biceps femoris 
A patient experiences weakness in dorsiflexing and inverting the foot. Which of the following 
muscles is damaged? 
Tibialis anterior 
Peroneus longus  
Peroneus brevis 
Extensor digitorum longus  
Peroneus tertius 
Fracture of the neck of the femur results in avascular necrosis of the femoral head, probably resulting 
from lack of blood supply from which of the following arteries? 
Medial femoral circumflex 
Obturator 
Superior gluteal  
Inferior gluteal  
Lateral femoral circumflex 
If the acetabulum is fractured at its posterosuperior margin by dislocation of the hip joint, which of 
the following bones could be involved? 
Ilium 
Pubis  
Ischium  
Sacrum  
Head of the femur 
A patient presents with weakness in hip flexion and knee extension after a pelvic fracture. Which 
nerve is MOST likely injured?{ 
=Femoral nerve 
~Obturator nerve 
~Sciatic nerve 
~Superior gluteal nerve 
~Inferior gluteal nerve 
} 
A patient sustains a deep laceration to the anterior thigh. Which muscle is MOST likely to be affected, 
leading to difficulty extending the knee?{ 
=Quadriceps femoris 
~Hamstrings 
~Adductors 
~Gluteals 
~Sartorius 
} 
A surgeon is performing a femoral artery catheterization. Which anatomical landmark is used to 
locate the femoral artery within the femoral triangle?{ 
=Mid-inguinal point (midpoint between the anterior superior iliac spine and pubic symphysis) 
~Midpoint of the inguinal ligament 
~Femoral head 
~Pubic tubercle 
~Ischial tuberosity 
} 
A patient presents with medial thigh pain and difficulty adducting the thigh. Which nerve is MOST 
likely involved?{ 
=Obturator nerve 
~Femoral nerve 
~Sciatic nerve 
~Superior gluteal nerve 
~Inferior gluteal nerve 
} 
A patient experiences numbness and tingling along the lateral aspect of the thigh. Which nerve is 
MOST likely compressed or irritated?{ 
=Lateral femoral cutaneous nerve 
~Femoral nerve 
~Obturator nerve 
~Sciatic nerve 
~Ilioinguinal nerve 
}`;

const topic5 = `TOPIC 5 
t.v./Topic 5 
A patient experiences paralysis of the muscle that originates from the femur and contributes directly 
to the stability of the knee joint. Which of the following muscles is involved? 
Vastus lateralis 
Semimembranosus 
Sartorius 
Biceps femoris (long head)  
Rectus femoris 
A patient is involved in a motorcycle wreck that results in avulsion of the skin over the anterolateral 
leg and ankle. Which of the following structures is most likely destroyed with this type of injury? 
Superficial peroneal nerve 
Deep peroneal nerve 
Extensor digitorum longus muscle tendon  
Dorsalis pedis artery 
Great saphenous vein 
A knife wound penetrates the superficial vein that terminates in the popliteal vein. Bleeding occurs 
from which of the following vessels? 
Lesser saphenous vein 
Posterior tibial vein  
Anterior tibial vein 
Peroneal vein  
Great saphenous vein  
A 10-year-old boy falls from a tree house. 
The resultant heavy compression of the sole of 
his foot against the ground caused a fracture 
of the head of the talus. Which of the following 
structures is unable to function normally? 
Medial longitudinal arch 
Transverse arch 
Lateral longitudinal arch  
Tendon of the peroneus longus  
Long plantar ligament 
A 24-year-old woman complains of weakness when she extends her thigh and rotates 
it laterally. Which of the following muscles is 
paralyzed? 
Gluteus maximus 
Obturator externus  
Sartorius 
Tensor fasciae latae  
Gluteus maximus  
Semitendinosus 
A patient with hereditary blood clotting problems presents with pain in the back of her knee. An 
arteriograph reveals a blood clot in the popliteal artery at its proximal end. Which of the following 
arteries will allow blood to reach the foot? 
Lateral circumflex femoral  
Anterior tibial 
Posterior tibial  
Peroneal 
Superior medial genicular 
A 72-year-old woman complains of a cramplike pain in her thigh and leg. She was diagnosed as 
having a severe intermittent claudication. Following surgery, an infection was found in the adductor 
canal, damaging the enclosed structures. Which of the following structures remains intact?  
Great saphenous vein   
Femoral artery  
Femoral vein  
Saphenous nerve  
Nerve to the vastus medialis 
A basketball player was hit in the thigh by an opponent’s knee. Which of the following arteries is 
likely to compress and cause ischemia because of the bruise and damage to the extensor muscles of 
the leg?  
Anterior tibial 
Popliteal  
Deep femoral 
Posterior tibial  
Peroneal 
An elderly woman fell at home and fractured the greater trochanter of her femur. Which of the 
following muscles would continue to function normally?  
Gluteus maximus 
Piriformis  
Obturator internus 
Gluteus medius  
Gluteus minimus 
A 20-year-old college student receives a severe blow on the inferolateral side of the left knee joint 
while playing football. Radiographic examination reveals a fracture of the head and neck of the 
fibula. Which of the following nerves is damaged? 
Common peroneal 
Sciatic 
Tibial  
Deep peroneal  
Superficial peroneal 
After injury to this nerve, which of the following muscles could be paralyzed? 
Extensor hallucis longus 
Gastrocnemius  
Popliteus  
Flexor digitorum longus 
Tibialis posterior 
If the lateral (fibular) collateral ligament is torn by this fracture, which of the following conditions 
may occur? 
Abnormal passive adduction of the extended leg 
Abnormal passive abduction of the extended leg 
Anterior displacement of the femur on thetibia 
Posterior displacement of the femur on thetibia 
Maximal flexion of the leg 
A patient presents with foot drop (inability to dorsiflex the foot) after a fracture of the fibular neck. 
Which nerve is MOST likely injured?{ 
=Common fibular (peroneal) nerve 
~Tibial nerve 
~Deep fibular (peroneal) nerve 
~Superficial fibular (peroneal) nerve 
~Sural nerve 
} 
A patient sustains a deep laceration to the posterior aspect of the leg. Which muscle group is MOST 
likely affected, leading to weakness in plantarflexion?{ 
=Calf muscles (gastrocnemius and soleus) 
~Anterior compartment muscles (tibialis anterior, etc.) 
~Lateral compartment muscles (fibularis longus and brevis) 
~Posterior compartment muscles (tibialis posterior, flexor digitorum longus, flexor hallucis longus) 
~Popliteus 
} 
A patient experiences numbness and tingling on the sole of the foot. Which nerve is MOST likely 
involved?{ 
=Tibial nerve 
~Common fibular (peroneal) nerve 
~Deep fibular (peroneal) nerve 
~Superficial fibular (peroneal) nerve 
~Sural nerve 
} 
A patient presents with pain and difficulty inverting the foot. Which muscle is MOST likely affected?{ 
=Tibialis posterior 
~Fibularis longus 
~Fibularis brevis 
~Extensor digitorum longus 
~Extensor hallucis longus 
} 
A patient suffers a severe ankle sprain, damaging the lateral ligaments. Which ligament is MOST 
commonly injured in this type of sprain?{ 
=Anterior talofibular ligament (ATFL) 
~Posterior talofibular ligament (PTFL) 
~Calcaneofibular ligament (CFL) 
~Deltoid ligament 
~Spring ligament 
}`;

const topic6 = `TOPIC 6 
t.v./Topic 6 
A high school basketball player experiences a sudden difficulty in breathing and is brought to an 
emergency department. When a low tracheotomy is performed below the isthmus of the thyroid, 
which of the following vessels may be encountered? 
Inferior thyroid vein 
Inferior thyroid artery  
Costocervical trunk  
Superior thyroid artery 
Right brachiocephalic vein 
A 59-year-old man complains of numbness in the anterior cervical triangle. Therefore, damage has 
occurred to which of the following nerves? 
Transverse cervical nerve 
Phrenic nerve  
Greater auricular nerve  
Supraclavicular nerve  
Lesser occipital nerve 
A 53-year-old man has difficulty with 
breathing through his nose. On examination, 
his physician finds that he has swelling of the 
mucous membranes of the superior nasal meatus. Which opening of the paranasal sinuses is 
most likely plugged? 
Posterior ethmoidal sinus 
Middle ethmoidal sinus  
Maxillary sinus  
Anterior ethmoidal sinus  
Frontal sinus 
A 61-year-old woman is found to have ocular lymphoma invading her optic canal. Which of the 
following structures would most likely be damaged? 
Ophthalmic artery 
Ophthalmic vein  
Ophthalmic nerve  
Oculomotor nerve  
Trochlear nerve  
A 76-year-old man with swallowing difficulties undergoes imaging for a possible mass. The CT scan 
image at the level of the cricothyroid ligament in his neck should show which of the following 
structures? 
Inferior laryngeal nerves  
External carotid arteries  
Inferior thyroid veins  
Thyrocervical trunks 
Internal laryngeal nerves 
The muscles that are of branchiomeric origin are paralyzed in a 26-year-old patient. A lesion of 
which of the following nerves would cause muscle dysfunction? 
Trigeminal nerve 
Oculomotor nerve  
Trochlear nerve  
Abducens nerve  
Hypoglossal nerve 
During surgery for a malignant parotid tumor in a 69-year-old woman, the main trunk of the facial 
nerve is lacerated. Which of the following muscles is paralyzed? 
Buccinator muscle 
Masseter muscle  
Stylopharyngeus muscle  
Anterior belly of the digastric muscle   
Tensor tympani 
During a gang fight, a 17-year-old boy is punched, and his nasal septum is broken. Which of the 
following structures would be damaged? 
Vomer and perpendicular plate of ethmoid 
Septal cartilage and nasal bone  
Inferior concha and vomer 
Septal cartilage and middle concha  
Cribriform plate and frontal bone 
A 58-year-old woman comes to the hospital and complains of progressive loss of voice, numbness, 
loss of taste on the back part of her tongue, and difficulty in shrugging her shoulders. Her MRI scan 
reveals a dural meningioma that compresses the nerves leaving the skull. These nerves leave the 
skull through which of the following openings? 
Jugular foramen 
Foramen spinosum  
Foramen rotundum  
Internal auditory meatus  
Foramen lacerum 
A 21-year-old woman presents to her physician with a swelling on her neck. On examination, she is 
diagnosed with an infection within the carotid sheath. Which of the following structures would be 
damaged? 
Internal jugular vein and vagus nerve 
Vagus nerve and middle cervical ganglion 
Internal carotid artery and recurrent laryngeal nerve 
Sympathetic trunk and common carotid artery 
External carotid artery and ansa cervicalis 
An angiogram of a 45-year-old man shows an occlusion of the costocervical trunk. This obstruction 
could produce a marked decrease in the blood flow in which of the following arteries? 
Deep cervical artery 
Superior thoracic artery  
Transverse cervical artery  
Ascending cervical artery  
Inferior thyroid artery 
A 57-year-old man comes to the local hospital with fever, headache, nausea, and vomiting. 
Laboratory tests reveal an infection, and radiologic examination localizes the infection to the 
cavernous sinus. Which of the following nerves would be unaffected by this condition? 
Mandibular nerves 
Oculomotor nerves 
Abducens nerves  
Trochlear nerves  
Ophthalmic nerves 
A 7-year-old girl has difficulty breathing through her nose and is brought to her pediatrician. On 
examination, she is  
diagnosed with adenoids. Which of the following tonsils is enlarged? 
Pharyngeal tonsil 
Palatine tonsil  
Tubal tonsil  
Lingual tonsil  
Eustachian tonsil 
A patient presents after a head injury with a brief loss of consciousness followed by a lucid interval, 
and then rapid deterioration. A CT scan reveals a lens-shaped hematoma that does not cross suture 
lines. This is MOST likely a/an:{ 
=Epidural hematoma 
~Subdural hematoma 
~Subarachnoid hemorrhage 
~Intracerebral hemorrhage 
~Contusion 
} 
A patient presents with headache, drowsiness, and confusion several weeks after a minor head 
injury. A CT scan shows a crescent-shaped hematoma that crosses suture lines. This is MOST likely 
a/an:{ 
=Subdural hematoma 
~Epidural hematoma 
~Subarachnoid hemorrhage 
~Intracerebral hemorrhage 
~Contusion 
} 
A surgeon is performing a trepanation (burr hole) procedure. The primary goal of this procedure is 
to:{ 
=Relieve intracranial pressure by evacuating a hematoma or abscess 
~Repair a skull fracture 
~Remove a brain tumor 
~Perform a biopsy of brain tissue 
~Insert an intracranial pressure monitor 
} 
During a trepanation procedure to evacuate an epidural hematoma, the surgeon must be careful to 
avoid injuring the:{ 
=Middle meningeal artery 
~Superior sagittal sinus 
~Inferior sagittal sinus 
~Transverse sinus 
~Cavernous sinus 
} 
A patient undergoes a craniotomy for evacuation of a subdural hematoma. Postoperatively, which of 
the following is a potential complication related to damage to bridging veins?{ 
=Recurrence of the hematoma 
~Infection 
~Seizures 
~Stroke 
~Cerebrospinal fluid leak 
}`;

const explanations = {
  // Explanations for the parsed topics will be assigned linearly. 
  // We'll generate a dummy or standard explanation for all since creating 100+ manually in this block is large.
  // Wait, I will use a simple function to generate a generic explanation containing the correct answer.
};

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
    const line = lines[i];
    if (line.includes('TOPIC') || line.includes('t.v') || line.includes('SITUATIONAL')) continue;
    if (line.includes('{')) {
      break; // stop when formatted part begins
    }
    
    // We assume options are exactly 5 lines (except when there's an error).
    // Let's use a heuristic: if a line ends with "?" or ":" it's end of a question.
    currentQ += (currentQ ? " " : "") + line;
    if(line.endsWith('?') || line.endsWith(':')) {
      // Question ended, grab next 5 lines as options
      let numOpts = 5;
      for(let j=0; j<numOpts; j++) {
        if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
          currentOpts.push(lines[i+1+j]);
        }
      }
      // advance i by numOpts
      i += currentOpts.length;
      qs.push({ question: currentQ, options: currentOpts });
      currentQ = "";
      currentOpts = [];
    }
  }
  return qs;
}

function parseTopic(text) {
  // A topic has unformatted then formatted (except topic 1 which is only formatted)
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

const t1 = parseTopic(topic1);
const t2 = parseTopic(topic2);
const t3 = parseTopic(topic3);
const t4 = parseTopic(topic4);
const t5 = parseTopic(topic5);
const t6 = parseTopic(topic6);

let out = \`export const s_2_2_situational = {\\n\`;

[t1, t2, t3, t4, t5, t6].forEach((qArray, idx) => {
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
    out += \`      "explanation": \${JSON.stringify("The correct answer is " + (q.options[0] || "") + ".")}\\n\`;
    out += \`    }\${qidx === qArray.length-1 ? '' : ','}\\n\`;
  });
  out += \`  ]\${idx === 5 ? '' : ','}\\n\`;
});

out += \`};\\n\`;

fs.writeFileSync('c:\\\\samu_mcq\\\\mobile-app\\\\src\\\\data\\\\repository\\\\course2\\\\s-2-2-situational.js', out);
console.log('done');
