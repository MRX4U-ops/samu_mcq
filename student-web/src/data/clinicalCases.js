/**
 * SAMU MCQs — Clinical Cases of the Day
 * Rotates daily based on date. One per day of 14-day cycle.
 */
export const CLINICAL_CASES = [
  {
    id: 'cc-01',
    title: 'The Breathless Farmer',
    difficulty: 'Intermediate',
    speciality: 'Pulmonology',
    patient: { age: 55, gender: 'Male', occupation: 'Farmer, Punjab' },
    presentation: 'A 55-year-old farmer presents with progressive breathlessness for 6 months, worse on exertion. He reports a productive cough with white sputum for the past 2 years, especially in winter. He smokes 20 cigarettes/day for 30 years. On examination: barrel-shaped chest, hyperresonant on percussion, reduced breath sounds bilaterally.',
    vitals: { BP: '130/80 mmHg', HR: '88/min', RR: '22/min', SpO2: '91% on room air', Temp: 'Afebrile' },
    history: ['Smoker 30 pack-years', 'Occupational dust exposure', 'No tuberculosis contact', 'No cardiac history'],
    physicalFindings: ['Barrel-shaped chest', 'Hyperresonance on percussion', 'Reduced vesicular breath sounds', 'Pursed lip breathing', 'Use of accessory muscles', 'Clubbing: absent'],
    labFindings: ['ABG: pH 7.38, PaO2 58mmHg, PaCO2 48mmHg, HCO3 29 mEq/L', 'CBC: Hb 16.5g/dL (polycythemia)', 'FEV1/FVC: 0.55 (post-bronchodilator)'],
    imagingFindings: ['CXR: Hyperinflated lung fields, flattened diaphragm, increased retrosternal airspace', 'HRCT: Centrilobular emphysema'],
    questions: {
      diagnosis: 'Most likely diagnosis?',
      investigation: 'Best confirmatory investigation?',
      treatment: 'First-line management?',
    },
    answer: {
      diagnosis: 'COPD (Chronic Obstructive Pulmonary Disease) — GOLD Stage III',
      investigation: 'Spirometry (Pulmonary Function Tests) — FEV1/FVC < 0.70 post-bronchodilator is diagnostic',
      treatment: 'Smoking cessation (most important!) + LAMA (Tiotropium) + LABA + ICS + Pulmonary rehabilitation + Vaccination (Influenza, Pneumococcal)',
      explanation: 'COPD is defined by persistent airflow limitation not fully reversible. The classic COPD patient has smoking history, progressive dyspnea, barrel chest (due to air trapping), hyperresonance, and spirometry showing obstructive pattern (FEV1/FVC < 0.70). ABG shows Type 2 respiratory failure with metabolic compensation (high HCO3).',
      differentials: ['Asthma (reversible, younger, atopy)', 'Pulmonary fibrosis (restrictive, crackles)', 'Congestive heart failure (bilateral crackles, JVP elevated)', 'Lung cancer (weight loss, hemoptysis)'],
      treatmentPlan: ['1. Smoking cessation (most important single intervention)', '2. SABA/SAMA for immediate relief', '3. LAMA (Tiotropium) for maintenance', '4. Add LABA if still symptomatic', '5. Add ICS if FEV1 < 50% or frequent exacerbations', '6. Pulmonary rehabilitation', '7. Long-term oxygen if PaO2 < 55mmHg', '8. Vaccinations'],
      highYieldPoints: [
        'COPD diagnosis: FEV1/FVC < 0.70 post-bronchodilator',
        'Smoking cessation reduces mortality most effectively',
        'Barrel chest: due to air trapping → AP diameter increases',
        'Type 2 RF in COPD: high CO2 retention (hypercapnia)',
        'Polycythemia: compensatory response to chronic hypoxia',
        'Never give high-flow O2 in COPD (hypoxic drive suppression)'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-02',
    title: 'The Collapsing Student',
    difficulty: 'Intermediate',
    speciality: 'Cardiology',
    patient: { age: 19, gender: 'Male', occupation: 'Medical Student' },
    presentation: 'A 19-year-old male collapses during a college cricket match. He is revived. He reports 2 previous episodes of near-syncope during exertion. His father died suddenly at age 35. On examination: ejection systolic murmur at left sternal border that increases on Valsalva maneuver and standing. Murmur decreases on squatting.',
    vitals: { BP: '110/80 mmHg', HR: '92/min', RR: '16/min', SpO2: '99%', Temp: 'Afebrile' },
    history: ['Exertional syncope episodes ×2', 'Positive family history: paternal sudden death age 35', 'No chest pain', 'No fever'],
    physicalFindings: ['Ejection systolic murmur at LSB', 'Murmur ↑ with Valsalva and standing', 'Murmur ↓ with squatting and handgrip', 'Bifid carotid pulse (pulsus bisferiens)', 'S4 gallop'],
    labFindings: ['ECG: LVH pattern, inverted T-waves V4-V6, deep Q-waves II,III,aVF', 'CXR: Mild cardiomegaly'],
    imagingFindings: ['2D Echo: Asymmetric septal hypertrophy (IVS:PW ratio > 1.3), SAM of mitral valve, LVOTO gradient 45mmHg', 'Septal thickness 22mm'],
    questions: {
      diagnosis: 'What is the diagnosis?',
      investigation: 'Gold standard investigation?',
      treatment: 'Treatment of choice?',
    },
    answer: {
      diagnosis: 'Hypertrophic Obstructive Cardiomyopathy (HOCM)',
      investigation: '2D Echocardiography — shows asymmetric septal hypertrophy (ASH) and SAM (Systolic Anterior Motion of mitral valve)',
      treatment: 'Beta-blockers (Metoprolol/Propranolol) or Calcium channel blockers (Verapamil). Implantable Cardioverter Defibrillator (ICD) for sudden cardiac death prevention. Avoid: Digoxin, Nitrates, Diuretics.',
      explanation: 'HOCM is an autosomal dominant disorder (sarcomere protein mutations, most commonly beta-myosin heavy chain). The hallmark is dynamic LVOT obstruction. Murmur characteristics: increases with maneuvers that ↓ preload (Valsalva, standing) and decreases with ↑ preload (squatting). It is the most common cause of sudden cardiac death in young athletes.',
      differentials: ['Valvular aortic stenosis (fixed murmur, calcified valve on echo)', 'Athlete\'s heart (physiologic hypertrophy, concentric)', 'WPW syndrome (delta waves on ECG)', 'Mitral valve prolapse (mid-systolic click)'],
      treatmentPlan: ['1. Beta-blockers (Metoprolol) — first-line for symptoms', '2. Verapamil — if beta-blockers contraindicated', '3. ICD — for high-risk patients (sudden death prevention)', '4. Septal myectomy — surgical treatment for severe LVOTO', '5. Alcohol septal ablation — percutaneous alternative', '6. Avoid: Digoxin, Nitrates, Diuretics, Heavy exercise'],
      highYieldPoints: [
        'Most common cause of sudden cardiac death in young athletes',
        'Autosomal dominant — genetic counseling required',
        'Dynamic obstruction: ↑ with Valsalva, standing, dehydration',
        'SAM of mitral valve → mitral regurgitation',
        'ECG: LVH + deep Q-waves (pseudo-infarction pattern)',
        'NEVER give digoxin or nitrates in HOCM'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-03',
    title: 'The Thirsty Executive',
    difficulty: 'Beginner',
    speciality: 'Endocrinology',
    patient: { age: 48, gender: 'Male', occupation: 'IT Executive, Hyderabad' },
    presentation: 'A 48-year-old obese IT professional presents with 3 months of polyuria, polydipsia and unexplained weight loss of 5kg. He also reports blurred vision and tingling in both feet. He has a sedentary lifestyle and family history of T2DM. BMI: 31 kg/m2.',
    vitals: { BP: '148/92 mmHg', HR: '80/min', RR: '16/min', SpO2: '98%', Temp: 'Afebrile' },
    history: ['Polyuria, polydipsia ×3 months', 'Weight loss 5kg unintentional', 'Family history: mother with T2DM', 'Sedentary lifestyle, high-carb diet', 'No previous diabetes diagnosis'],
    physicalFindings: ['BMI 31 kg/m2 (obese)', 'BP 148/92 mmHg', 'Acanthosis nigricans (neck, axilla)', 'Reduced sensation to vibration feet', 'Normal fundoscopy (early)'],
    labFindings: ['FBG: 11.2 mmol/L (202 mg/dL)', 'HbA1c: 9.8%', 'Serum creatinine: 1.2 mg/dL', 'Urine: Glucosuria + Microalbuminuria 45 mg/g', 'Fasting lipids: LDL 168, TG 310 mg/dL'],
    imagingFindings: ['Renal USG: Bilateral mildly enlarged kidneys (early nephropathy)'],
    questions: {
      diagnosis: 'Confirm the diagnosis and stage of complications.',
      investigation: 'Best test to monitor long-term glycemic control?',
      treatment: 'Initial management strategy?',
    },
    answer: {
      diagnosis: 'Type 2 Diabetes Mellitus with early peripheral neuropathy and early nephropathy (microalbuminuria)',
      investigation: 'HbA1c — reflects average blood glucose over 2–3 months. Target: < 7% (< 53 mmol/mol)',
      treatment: 'Metformin (first-line) + Lifestyle modification (diet + exercise + weight loss). Add SGLT2 inhibitor (if CKD/CVD) or GLP-1 agonist (if obesity dominant).',
      explanation: 'T2DM diagnosis: FBG ≥ 7 mmol/L or 2h PG ≥ 11.1 mmol/L or HbA1c ≥ 6.5% on two occasions. Acanthosis nigricans indicates insulin resistance. Complications: peripheral neuropathy (tingling/numbness feet), nephropathy (microalbuminuria). Metformin is the first-line agent as it reduces hepatic glucose output without hypoglycemia.',
      differentials: ['Type 1 DM (younger, lean, GAD antibodies +, DKA prone)', 'MODY (monogenic, family history, young onset)', 'Steroid-induced diabetes', 'Cushing syndrome (weight gain, striae, HTN)'],
      treatmentPlan: ['1. Lifestyle: Mediterranean diet, 150 min/week moderate exercise', '2. Metformin 500mg BD → titrate to 1000mg BD', '3. Monitor HbA1c every 3 months initially', '4. ACEI/ARB for hypertension and nephroprotection', '5. Statin for dyslipidemia', '6. Annual eye, foot, kidney screening', '7. Influenza + Pneumococcal vaccination'],
      highYieldPoints: [
        'T2DM diagnosis: FBG ≥ 126 mg/dL or HbA1c ≥ 6.5% on 2 occasions',
        'HbA1c = gold standard for monitoring (not diagnosis in all settings)',
        'Metformin: first-line, no hypoglycemia, weight neutral',
        'Acanthosis nigricans = insulin resistance marker',
        'Triad of T2DM complications: Neuropathy, Nephropathy, Retinopathy',
        'SGLT2 inhibitors: best add-on if CKD or heart failure'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-04',
    title: 'The Yellow-Eyed Rickshaw Driver',
    difficulty: 'Intermediate',
    speciality: 'Gastroenterology',
    patient: { age: 38, gender: 'Male', occupation: 'Rickshaw driver' },
    presentation: 'A 38-year-old presents with 1 week of jaundice, dark urine and pale stools. He had nausea and anorexia for 2 weeks before jaundice appeared. He shares needles for intravenous drug use occasionally. On examination: icteric sclerae, tender hepatomegaly (liver 14cm), no ascites, no splenomegaly.',
    vitals: { BP: '118/76 mmHg', HR: '74/min', RR: '14/min', Temp: '37.8°C', SpO2: '99%' },
    history: ['IV drug use (occasional, shared needles)', 'No blood transfusion', 'No alcohol history', 'No previous jaundice', 'No TB/diabetes history'],
    physicalFindings: ['Icterus (sclerae + skin)', 'Tender hepatomegaly 14cm', 'No splenomegaly', 'No ascites', 'No encephalopathy', 'Palmar erythema: absent'],
    labFindings: ['Bilirubin Total: 8.2 mg/dL (D:5.4, I:2.8)', 'AST: 1850 U/L, ALT: 2100 U/L', 'ALP: 180 U/L', 'Albumin: 3.8 g/dL', 'PT: 14s (INR 1.1 — normal)'],
    imagingFindings: ['USG Abdomen: Hepatomegaly with normal echotexture, no biliary dilation, no gallstones'],
    questions: {
      diagnosis: 'What type of jaundice and most likely cause?',
      investigation: 'Which specific serological test will confirm diagnosis?',
      treatment: 'Management?',
    },
    answer: {
      diagnosis: 'Hepatocellular jaundice due to Acute Viral Hepatitis B (anti-HBc IgM likely positive)',
      investigation: 'HBsAg + Anti-HBc IgM — confirms acute Hepatitis B. Also check HBeAg (infectivity), HBV DNA',
      treatment: 'Mostly supportive (rest, nutrition, avoid hepatotoxic drugs/alcohol). Antiviral (Entecavir/Tenofovir) if: fulminant hepatitis, immunocompromised, high HBV DNA.',
      explanation: 'Pattern: Isolated ↑↑ transaminases (>10× ULN), mild ALP rise = hepatocellular injury. Dark urine + pale stools = conjugated hyperbilirubinemia. IV drug use is a classic risk factor for Hepatitis B and C. The prodrome (nausea before jaundice) is classic for viral hepatitis. Normal INR indicates preserved synthetic function (not fulminant).',
      differentials: ['Hepatitis A (feco-oral, anti-HAV IgM)', 'Hepatitis C (IV drugs, anti-HCV, insidious)', 'Alcoholic hepatitis (AST:ALT ratio >2)', 'Drug-induced liver injury (paracetamol overdose)'],
      treatmentPlan: ['1. Supportive: rest, high-calorie diet, hydration', '2. Avoid: alcohol, paracetamol, hepatotoxic drugs, NSAIDs', '3. Monitor: LFTs, INR, bilirubin weekly', '4. Antiviral if fulminant, immunocompromised, or high HBV DNA', '5. Notify contacts for HBV vaccination', '6. Follow up: HBsAg at 6 months (if persistent = chronic HBV)'],
      highYieldPoints: [
        'HBsAg: surface antigen — first to appear, indicates infection',
        'Anti-HBc IgM: acute infection marker',
        'HBeAg: high infectivity',
        'Anti-HBs: immunity (vaccination or recovery)',
        'Fulminant hepatitis: INR > 1.5, encephalopathy — transplant consideration',
        'Window period: HBsAg negative, anti-HBs negative, anti-HBc IgM positive'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-05',
    title: 'The Headachy Teacher',
    difficulty: 'Advanced',
    speciality: 'Neurology',
    patient: { age: 32, gender: 'Female', occupation: 'School Teacher' },
    presentation: 'A 32-year-old female presents to emergency with sudden-onset "worst headache of her life" that started during exercise 2 hours ago. She describes it as a thunderclap headache reaching maximum intensity within seconds. She vomited twice. No fever. No focal neurological deficits. Neck stiffness present on examination.',
    vitals: { BP: '168/102 mmHg', HR: '95/min', RR: '18/min', Temp: '37.2°C', SpO2: '99%' },
    history: ['Thunderclap headache — sudden onset', 'Reached maximum intensity < 60 seconds', 'Vomiting ×2', 'Previously healthy', 'No similar episodes before', 'On oral contraceptive pills'],
    physicalFindings: ['Neck stiffness (Kernig + Brudzinski positive)', 'No focal neurological deficits', 'No papilledema on fundoscopy', 'No rash'],
    labFindings: ['CT head (non-contrast): Report pending', 'CBC: Normal', 'Coagulation profile: Normal'],
    imagingFindings: ['CT head non-contrast: Hyperdense blood in basal cisterns and Sylvian fissures'],
    questions: {
      diagnosis: 'What is the diagnosis?',
      investigation: 'What is the next investigation if CT was normal?',
      treatment: 'Immediate management?',
    },
    answer: {
      diagnosis: 'Subarachnoid Hemorrhage (SAH) secondary to ruptured intracranial aneurysm',
      investigation: 'Lumbar puncture (if CT negative within 6h) — looking for xanthochromia (yellow CSF) or RBCs that do not clear in consecutive tubes',
      treatment: 'Immediate: Nimodipine (60mg 4-hourly for 21 days — prevents vasospasm), BP control, ICU admission, Neurosurgical consultation for aneurysm clipping or coiling',
      explanation: 'SAH presents classically with thunderclap headache ("worst headache of life"). CT is >98% sensitive in first 6 hours (blood appears hyperdense). If CT negative, LP is mandatory. Xanthochromia (yellow pigmentation from bilirubin) confirms SAH. The most common cause is ruptured berry aneurysm (Circle of Willis). Nimodipine prevents delayed ischemic neurological deficit (DIND) from vasospasm.',
      differentials: ['Meningitis (fever, gradual onset, infectious CSF)', 'Migraine (recurrent, aura, photophobia)', 'Hypertensive encephalopathy (papilledema, very high BP)', 'Cerebral venous sinus thrombosis (OCP use, focal deficit)'],
      treatmentPlan: ['1. Stabilize: ABCs, ICU admission', '2. Nimodipine 60mg PO/NG every 4 hours × 21 days (vasospasm prevention)', '3. BP control: target < 160/90 mmHg (avoid excessive lowering)', '4. Angiography (CTA/DSA) to identify aneurysm', '5. Neurosurgery: Clipping (open) or Endovascular coiling', '6. Treat hydrocephalus (EVD if needed)', '7. DVT prophylaxis'],
      highYieldPoints: [
        'Thunderclap headache = SAH until proven otherwise',
        'CT sensitivity: >98% in first 6h (decreases rapidly after)',
        'LP if CT negative: xanthochromia is diagnostic',
        'Most common cause: Berry aneurysm (Circle of Willis)',
        'Nimodipine: for vasospasm, NOT initial bleed',
        'OCP use: risk factor for cerebral venous thrombosis'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-06',
    title: 'The Breathless Woman',
    difficulty: 'Intermediate',
    speciality: 'Pulmonology / Emergency',
    patient: { age: 26, gender: 'Female', occupation: 'Software engineer' },
    presentation: 'A 26-year-old female on oral contraceptive pills presents with sudden onset right-sided pleuritic chest pain and breathlessness for 6 hours. She just returned from a 14-hour international flight. She denies fever or cough. On examination: tachycardia, tachypnea, right leg swelling.',
    vitals: { BP: '110/72 mmHg', HR: '108/min', RR: '24/min', SpO2: '92%', Temp: '37.5°C' },
    history: ['OCP use for 2 years', 'Long-haul flight 14 hours', 'Right leg swelling 2 days', 'No previous clots', 'Non-smoker'],
    physicalFindings: ['Tachycardia + tachypnea', 'Right calf swelling, tender, +ve Homan sign', 'Lung: decreased breath sounds right base', 'No cyanosis'],
    labFindings: ['D-Dimer: 3200 ng/mL (elevated)', 'ABG: pH 7.48, PaO2 72mmHg, PaCO2 32mmHg (Type 1 RF, respiratory alkalosis)', 'Troponin: 0.15 ng/mL (mildly elevated)', 'ECG: S1Q3T3 pattern, sinus tachycardia', 'CBC: Normal'],
    imagingFindings: ['CT Pulmonary Angiography (CTPA): Filling defect in right main pulmonary artery'],
    questions: {
      diagnosis: 'What is the diagnosis?',
      investigation: 'Gold standard investigation?',
      treatment: 'Immediate treatment?',
    },
    answer: {
      diagnosis: 'Pulmonary Embolism (PE) with DVT (right leg) — risk factors: OCP + prolonged immobility',
      investigation: 'CTPA (CT Pulmonary Angiography) — gold standard for PE diagnosis',
      treatment: 'Anticoagulation immediately: LMWH (Enoxaparin) or UFH IV. Followed by oral anticoagulation (DOAC: Rivaroxaban or Apixaban preferred; or warfarin INR 2-3). Stop OCP.',
      explanation: 'Classic presentation: Virchow\'s triad (stasis from long flight, hypercoagulability from OCP, endothelial activation). Pleuritic chest pain + dyspnea + hypoxia + tachycardia with risk factors = PE until proven otherwise. D-dimer is sensitive but not specific. S1Q3T3 on ECG is classic but uncommon. CTPA is gold standard.',
      differentials: ['Pneumothorax (tracheal deviation, hyperresonance)', 'Pleuritis (friction rub, no hypoxia)', 'ACS (crushing chest pain, ST changes)', 'Aortic dissection (tearing pain, BP differential)'],
      treatmentPlan: ['1. Oxygen supplementation', '2. LMWH (Enoxaparin 1mg/kg SC BD) immediately', '3. CTPA to confirm (if stable)', '4. Long-term oral anticoagulation 3–6 months', '5. Stop OCP permanently', '6. If massive PE (hemodynamically unstable): thrombolysis (Alteplase)', '7. Consider IVC filter if anticoagulation contraindicated'],
      highYieldPoints: [
        'Virchow\'s triad: Stasis + Hypercoagulability + Endothelial damage',
        'D-Dimer: High sensitivity (rules out if negative), low specificity',
        'S1Q3T3 on ECG: Classic but found in < 20% of PE',
        'CTPA: Gold standard investigation for PE',
        'Wells score: clinical probability before investigation',
        'OCP + smoking + immobility = high thrombotic risk'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-07',
    title: 'The Feverish Child',
    difficulty: 'Intermediate',
    speciality: 'Pediatrics',
    patient: { age: 5, gender: 'Female', occupation: 'Student (Kindergarten)' },
    presentation: 'A 5-year-old girl presents with 5-day fever (up to 40°C), bilateral non-purulent conjunctival injection, strawberry tongue, cervical lymphadenopathy (2.5cm), and a maculopapular rash on the trunk. Palms and soles are red and swollen. Parents report BCG vaccination site is red and swollen.',
    vitals: { BP: '98/60 mmHg', HR: '130/min', RR: '28/min', Temp: '39.8°C', SpO2: '98%' },
    history: ['Fever × 5 days (>38.5°C)', 'Conjunctivitis bilateral', 'Rash 3 days', 'Irritable child', 'No sick contacts', 'All vaccinations up to date'],
    physicalFindings: ['Bilateral non-purulent conjunctival injection', 'Strawberry tongue, cracked lips', 'Cervical LAP (2.5cm, single node)', 'Maculopapular rash trunk', 'Palmar/plantar erythema and edema', 'BCG site reaction (Calmette-Guerin sign)'],
    labFindings: ['CBC: Hb 10.5, WBC 18,000 (neutrophilia), Platelets 520,000', 'ESR: 85mm/h, CRP: 92 mg/L', 'Echo: No coronary aneurysm at presentation'],
    imagingFindings: ['Chest X-ray: Normal', 'Echocardiography: Normal coronary arteries at Day 5'],
    questions: {
      diagnosis: 'What is the diagnosis?',
      investigation: 'Most important investigation to monitor?',
      treatment: 'Treatment of choice?',
    },
    answer: {
      diagnosis: 'Kawasaki Disease (Mucocutaneous Lymph Node Syndrome)',
      investigation: 'Echocardiography — to monitor for coronary artery aneurysms (most feared complication)',
      treatment: 'IVIG (Intravenous Immunoglobulin) 2g/kg single infusion + Aspirin 80-100mg/kg/day (high dose, anti-inflammatory phase) → then low-dose aspirin 3-5mg/kg/day (anti-platelet)',
      explanation: 'Kawasaki disease is a vasculitis of small/medium vessels. Diagnosis requires: Fever ≥ 5 days + ≥4 of 5 criteria: Conjunctivitis, Oral changes (strawberry tongue, cracked lips), Rash, Adenopathy, Extremity changes (palmar erythema/edema → periungual desquamation later). BCG site reaction (Calmette-Guerin sign) is a helpful clinical clue. Coronary artery aneurysm occurs in 25% if untreated.',
      differentials: ['Viral exanthem (measles, rubella)', 'Scarlet fever (streptococcal)', 'Juvenile idiopathic arthritis (arthritis prominent)', 'Drug reaction (drug exposure history)'],
      treatmentPlan: ['1. IVIG 2g/kg IV over 10-12 hours (within 10 days of fever)', '2. High-dose aspirin 80-100mg/kg/day in 4 divided doses', '3. Reduce aspirin to low dose (3-5mg/kg) when afebrile × 48h', '4. Echo at diagnosis, at 2 weeks, and 6 weeks', '5. Long-term aspirin if coronary aneurysms develop', '6. Corticosteroids: for IVIG-resistant KD'],
      highYieldPoints: [
        'Classic presentation: CRASH mnemonic — Conjunctivitis, Rash, Adenopathy, Strawberry tongue, Hand/foot changes',
        'Most serious complication: Coronary artery aneurysm',
        'Treatment: IVIG within 10 days reduces aneurysm risk',
        'Aspirin: high dose (anti-inflammatory) → low dose (antiplatelet)',
        'Aspirin NEVER used in children with viral infections except KD',
        'Calmette-Guerin sign (BCG site reaction): highly specific for KD in endemic TB countries'
      ],
      coins: 50,
    },
  },
  {
    id: 'cc-08',
    title: 'The Confused Grandfather',
    difficulty: 'Advanced',
    speciality: 'Neurology / Medicine',
    patient: { age: 70, gender: 'Male', occupation: 'Retired teacher' },
    presentation: 'A 70-year-old male brought by family with 3-day confusion, fever and headache. He had flu-like illness 2 weeks ago. On examination: confused (GCS 12/15), fever, neck stiffness, Kernig and Brudzinski positive. No focal deficits. History of receiving herpes labialis treatment recently.',
    vitals: { BP: '140/88 mmHg', HR: '102/min', RR: '20/min', Temp: '38.9°C', SpO2: '97%' },
    history: ['Confusion 3 days (worsening)', 'Fever, headache 4 days', 'Recent herpes labialis (cold sores) treated', 'No TB contact', 'No recent travel', 'Hypertension, on amlodipine'],
    physicalFindings: ['GCS 12/15 (E3V4M5)', 'Neck stiffness, Kernig +, Brudzinski +', 'Bilateral temporal lobe tenderness', 'No focal deficits', 'No rash'],
    labFindings: ['CBC: WBC 14,500, lymphocytosis', 'CSF: Clear, pressure 200mmH2O, cells 150 (90% lymphocytes), protein 120mg/dL, glucose 65mg/dL (serum 95mg/dL)', 'CSF Gram stain: No organisms'],
    imagingFindings: ['MRI Brain: T2/FLAIR hyperintensity in bilateral temporal lobes and insular cortex', 'EEG: Periodic lateralizing epileptiform discharges (PLEDs) in temporal regions'],
    questions: {
      diagnosis: 'What is the diagnosis?',
      investigation: 'Confirmatory test?',
      treatment: 'Treatment of choice?',
    },
    answer: {
      diagnosis: 'Herpes Simplex Encephalitis (HSE) — HSV-1',
      investigation: 'CSF PCR for HSV DNA — gold standard (sensitivity >95%)',
      treatment: 'IV Acyclovir 10mg/kg every 8 hours for 14–21 days. Start EMPIRICALLY before PCR result (do not delay)',
      explanation: 'HSV Encephalitis is the most common cause of sporadic viral encephalitis. Classic triad: fever + altered consciousness + temporal lobe involvement. CSF shows lymphocytic pleocytosis (lymphocyte-predominant), elevated protein, normal glucose. MRI: temporal/insular involvement is characteristic. PCR is gold standard. Acyclovir must be started immediately if suspected — delay worsens prognosis.',
      differentials: ['Bacterial meningitis (neutrophilia in CSF, low glucose)', 'Tuberculous meningitis (chronic, high protein, very low glucose)', 'Autoimmune encephalitis (anti-NMDAR antibodies)', 'Cerebral abscess (focal signs, ring-enhancing lesion on CT)'],
      treatmentPlan: ['1. IV Acyclovir IMMEDIATELY (do not wait for PCR)', '2. Supportive: ICU care, seizure prophylaxis (Levetiracetam)', '3. Dexamethasone: controversial in viral encephalitis', '4. Duration: 14–21 days IV Acyclovir', '5. Oral Valacyclovir to follow for immunocompromised', '6. Repeat CSF PCR after 14 days to confirm clearance'],
      highYieldPoints: [
        'Most common cause of sporadic fatal encephalitis',
        'Bilateral temporal lobe involvement on MRI is hallmark',
        'CSF: Lymphocytic pleocytosis, normal to low glucose',
        'Start Acyclovir empirically — never delay for PCR',
        'PLEDs on EEG: characteristic but not specific',
        'Poor prognosis if treatment delayed > 48 hours after symptom onset'
      ],
      coins: 50,
    },
  },
];

/**
 * Get the case of the day based on current date
 */
export function getCaseOfTheDay() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % CLINICAL_CASES.length;
  return CLINICAL_CASES[index];
}

/**
 * Get all cases
 */
export function getAllCases() {
  return CLINICAL_CASES;
}
