export interface SymptomSystem {
  key: string
  label: string
  emoji: string
  symptoms: string[]
}

export const SYMPTOM_SYSTEMS: SymptomSystem[] = [
  {
    key: 'constitutional',
    label: 'Constitutional',
    emoji: '🌡️',
    symptoms: [
      'Fever', 'Chills', 'Rigors', 'Night sweats', 'Fatigue', 'Weakness',
      'Malaise', 'Weight loss', 'Weight gain', 'Anorexia', 'Appetite loss',
      'Lymphadenopathy', 'Generalized edema', 'Diaphoresis', 'Unintentional weight loss',
    ],
  },
  {
    key: 'cardiovascular',
    label: 'Cardiovascular',
    emoji: '❤️',
    symptoms: [
      'Chest pain', 'Chest pressure', 'Chest tightness', 'Chest heaviness',
      'Palpitations', 'Tachycardia', 'Racing heart', 'Irregular heartbeat',
      'Skipped beats', 'Dyspnea on exertion', 'Orthopnea',
      'Paroxysmal nocturnal dyspnea (PND)', 'Leg swelling / edema',
      'Ankle swelling', 'Syncope', 'Presyncope', 'Lightheadedness',
      'Claudication', 'Cold extremities', 'Cyanosis of extremities', 'Diaphoresis',
    ],
  },
  {
    key: 'respiratory',
    label: 'Respiratory',
    emoji: '🫁',
    symptoms: [
      'Dyspnea at rest', 'Exertional dyspnea', 'Cough (dry)',
      'Cough (productive / wet)', 'Hemoptysis', 'Wheezing', 'Stridor',
      'Chest pain (pleuritic)', 'Decreased exercise tolerance',
      'Snoring', 'Sleep apnea symptoms', 'Clubbing',
    ],
  },
  {
    key: 'gastrointestinal',
    label: 'Gastrointestinal',
    emoji: '🫄',
    symptoms: [
      'Abdominal pain', 'Epigastric pain', 'RUQ pain', 'RLQ pain',
      'LUQ pain', 'LLQ pain', 'Periumbilical pain', 'Diffuse abdominal pain',
      'Nausea', 'Vomiting', 'Hematemesis', 'Coffee-ground emesis',
      'Diarrhea', 'Bloody diarrhea', 'Constipation', 'Change in bowel habits',
      'Melena', 'Hematochezia', 'Heartburn / GERD', 'Dysphagia',
      'Odynophagia', 'Bloating', 'Flatulence', 'Early satiety',
      'Abdominal distension', 'Jaundice', 'Fatty/oily stools',
      'Loss of appetite', 'Rectal pain', 'Fecal incontinence',
    ],
  },
  {
    key: 'genitourinary',
    label: 'Genitourinary',
    emoji: '🔵',
    symptoms: [
      'Dysuria', 'Urinary frequency', 'Urinary urgency', 'Nocturia',
      'Polyuria', 'Oliguria', 'Anuria', 'Hematuria', 'Cloudy urine',
      'Flank pain', 'Urinary incontinence', 'Urinary retention',
      'Weak urinary stream', 'Hesitancy', 'Dribbling',
      'Pelvic pain', 'Vaginal discharge', 'Vaginal bleeding',
      'Penile discharge', 'Scrotal pain', 'Testicular swelling',
      'Erectile dysfunction', 'Menstrual irregularity', 'Amenorrhea',
      'Dysmenorrhea', 'Menorrhagia', 'Postmenopausal bleeding',
    ],
  },
  {
    key: 'musculoskeletal',
    label: 'Musculoskeletal',
    emoji: '🦴',
    symptoms: [
      'Arthralgia', 'Joint swelling', 'Joint stiffness', 'Morning stiffness',
      'Myalgia', 'Muscle weakness', 'Muscle cramps', 'Muscle spasms',
      'Back pain (low)', 'Back pain (mid)', 'Neck pain', 'Neck stiffness',
      'Shoulder pain', 'Elbow pain', 'Wrist pain', 'Hand pain',
      'Finger joint pain', 'Hip pain', 'Knee pain', 'Ankle pain',
      'Foot pain', 'Joint deformity', 'Limited range of motion',
      'Gait abnormality', 'Bone pain', 'Difficulty walking',
    ],
  },
  {
    key: 'neurological',
    label: 'Neurological',
    emoji: '🧠',
    symptoms: [
      'Headache', 'Severe headache / thunderclap', 'Migraine', 'Cluster headache',
      'Dizziness', 'Vertigo', 'Imbalance / ataxia',
      'Numbness', 'Tingling / paresthesias', 'Peripheral neuropathy',
      'Focal weakness', 'Hemiparesis', 'Facial droop', 'Monoparesis',
      'Tremor (resting)', 'Tremor (action/intention)', 'Involuntary movements',
      'Seizure', 'Convulsions', 'Loss of consciousness', 'Altered mental status',
      'Confusion', 'Delirium', 'Memory loss', 'Cognitive decline',
      'Difficulty concentrating', 'Aphasia / speech difficulty', 'Slurred speech',
      'Dysphagia (neurological)', 'Visual changes', 'Diplopia', 'Visual field loss',
      'Ptosis', 'Tinnitus', 'Hearing loss',
    ],
  },
  {
    key: 'psychiatric',
    label: 'Psychiatric / Behavioral',
    emoji: '🧩',
    symptoms: [
      'Anxiety', 'Panic attacks', 'Depression', 'Low mood', 'Anhedonia',
      'Hopelessness', 'Suicidal ideation', 'Self-harm urges', 'Irritability',
      'Mood swings', 'Insomnia', 'Hypersomnia', 'Nightmares',
      'Hallucinations (auditory)', 'Hallucinations (visual)', 'Delusions',
      'Paranoia', 'Racing thoughts', 'Poor concentration', 'Social withdrawal',
      'Behavioral changes', 'Agitation', 'Aggression', 'Impulsivity',
      'Substance use', 'Eating disturbances',
    ],
  },
  {
    key: 'endocrine',
    label: 'Endocrine / Metabolic',
    emoji: '⚗️',
    symptoms: [
      'Polydipsia', 'Polyuria', 'Polyphagia', 'Heat intolerance',
      'Cold intolerance', 'Excessive sweating', 'Decreased sweating',
      'Tremor (thyroid)', 'Palpitations (thyroid)', 'Hair loss',
      'Hirsutism', 'Amenorrhea', 'Sexual dysfunction', 'Infertility',
      'Rapid weight loss', 'Rapid weight gain', 'Exophthalmos',
      'Goiter / neck swelling', 'Skin changes (acanthosis)',
      'Buffalo hump', 'Moon facies',
    ],
  },
  {
    key: 'skin',
    label: 'Skin / Integumentary',
    emoji: '🩹',
    symptoms: [
      'Rash (generalized)', 'Rash (localized)', 'Maculopapular rash',
      'Vesicular rash', 'Urticaria / hives', 'Petechiae', 'Purpura',
      'Ecchymosis / bruising', 'Pruritus', 'Dry skin', 'Scaling',
      'Skin lesion', 'Ulcer', 'Wound', 'Photosensitivity',
      'Jaundice / icterus', 'Pallor', 'Cyanosis', 'Erythema',
      'Alopecia', 'Nail changes', 'Hyperpigmentation',
      'Hypopigmentation', 'Nodule', 'Swelling / angioedema',
    ],
  },
  {
    key: 'heent',
    label: 'HEENT',
    emoji: '👁️',
    symptoms: [
      'Eye pain', 'Eye redness', 'Watery eyes', 'Discharge from eyes',
      'Photophobia', 'Blurred vision', 'Vision loss (acute)',
      'Double vision', 'Floaters / flashes', 'Ear pain',
      'Ear discharge', 'Nasal congestion', 'Rhinorrhea',
      'Epistaxis', 'Sore throat', 'Hoarseness', 'Dental pain',
      'Facial pain / pressure', 'Sinus pain', 'Jaw pain (TMJ)',
      'Mouth sores', 'Lip swelling',
    ],
  },
  {
    key: 'hematologic',
    label: 'Hematologic / Lymphatic',
    emoji: '🩸',
    symptoms: [
      'Easy bruising', 'Spontaneous bleeding', 'Prolonged bleeding',
      'Gum bleeding', 'Nosebleeds', 'Heavy menstrual bleeding',
      'Fatigue (anemia)', 'Pallor (anemia)', 'Shortness of breath (anemia)',
      'Lymphadenopathy (regional)', 'Lymphadenopathy (generalized)',
      'Splenomegaly symptoms', 'Hepatomegaly symptoms',
      'Petechiae', 'Purpura',
    ],
  },
  {
    key: 'allergic',
    label: 'Allergic / Immunologic',
    emoji: '🛡️',
    symptoms: [
      'Urticaria', 'Angioedema', 'Throat tightness / closing',
      'Anaphylaxis', 'Wheezing (allergic)', 'Rhinitis (allergic)',
      'Sneezing', 'Conjunctivitis (allergic)', 'Drug reaction',
      'Food allergy reaction', 'Contact dermatitis',
      'Recurrent infections', 'Opportunistic infections', 'Oral thrush',
    ],
  },
]

export const ALL_SYMPTOMS: string[] = SYMPTOM_SYSTEMS.flatMap(s => s.symptoms)

export const SYMPTOM_CHARACTERS: Record<string, string[]> = {
  pain: ['Sharp', 'Dull', 'Burning', 'Stabbing', 'Pressure-like', 'Crushing', 'Squeezing',
         'Throbbing', 'Aching', 'Cramping', 'Tearing', 'Colicky', 'Tight', 'Heavy'],
  cough: ['Dry / non-productive', 'Wet / productive', 'Barky', 'Hacking', 'Persistent'],
  headache: ['Throbbing / pulsating', 'Pressure / band-like', 'Sharp / stabbing',
             'Constant dull ache', 'Electric / shooting', 'Unilateral', 'Bilateral'],
  dyspnea: ['Sudden onset', 'Gradual onset', 'At rest', 'Exertional', 'Positional'],
}

export const COMMON_LOCATIONS = [
  'Chest (central)', 'Chest (left)', 'Chest (right)', 'Chest (bilateral)',
  'Epigastric', 'RUQ', 'LUQ', 'RLQ', 'LLQ', 'Periumbilical', 'Diffuse abdomen',
  'Head (frontal)', 'Head (temporal)', 'Head (occipital)', 'Head (unilateral)',
  'Neck', 'Back (upper)', 'Back (lower/lumbar)', 'Back (unilateral)',
  'Left arm', 'Right arm', 'Both arms', 'Left leg', 'Right leg', 'Both legs',
  'Left shoulder', 'Right shoulder', 'Both shoulders',
  'Left knee', 'Right knee', 'Both knees',
  'Multiple joints', 'Generalized',
]

export const ROS_PERTINENT_NEGATIVES = [
  'No fever', 'No chills', 'No night sweats', 'No weight loss',
  'No chest pain', 'No palpitations', 'No syncope',
  'No dyspnea', 'No wheezing', 'No cough',
  'No nausea/vomiting', 'No abdominal pain', 'No diarrhea',
  'No headache', 'No dizziness', 'No focal neurological deficits',
  'No weakness', 'No numbness/tingling',
  'No rash', 'No pruritus', 'No jaundice',
  'No dysuria', 'No hematuria', 'No urinary symptoms',
  'No joint pain', 'No myalgias',
  'No bleeding', 'No easy bruising',
  'No suicidal ideation',
]

export const COMMON_PMH = [
  'Hypertension (HTN)', 'Type 2 Diabetes Mellitus (T2DM)', 'Type 1 Diabetes Mellitus (T1DM)',
  'Coronary Artery Disease (CAD)', 'Heart Failure (HF)', 'Atrial Fibrillation (AFib)',
  'Hyperlipidemia', 'Asthma', 'COPD', 'Chronic Kidney Disease (CKD)',
  'Hypothyroidism', 'Hyperthyroidism', 'GERD', 'IBS', 'IBD (Crohn\'s / UC)',
  'Rheumatoid Arthritis (RA)', 'Systemic Lupus Erythematosus (SLE)',
  'Osteoporosis', 'Osteoarthritis', 'Depression', 'Anxiety Disorder',
  'Bipolar Disorder', 'Schizophrenia', 'PTSD',
  'HIV/AIDS', 'Hepatitis B', 'Hepatitis C',
  'Stroke / TIA', 'Epilepsy', 'Migraine', 'Parkinson\'s Disease',
  'Dementia / Alzheimer\'s', 'Multiple Sclerosis (MS)',
  'Obesity', 'Obstructive Sleep Apnea (OSA)', 'Anemia',
  'Cancer (specify)', 'Chronic Liver Disease', 'Cirrhosis',
  'Deep Vein Thrombosis (DVT)', 'Pulmonary Embolism (PE)',
  'Peripheral Artery Disease (PAD)',
]

export const COMMON_MEDICATIONS = [
  'Aspirin', 'Metoprolol', 'Atorvastatin', 'Lisinopril', 'Amlodipine',
  'Metformin', 'Insulin (basal)', 'Insulin (rapid-acting)',
  'Levothyroxine', 'Omeprazole', 'Pantoprazole',
  'Amlodipine', 'Losartan', 'Hydrochlorothiazide',
  'Warfarin', 'Apixaban', 'Rivaroxaban', 'Clopidogrel',
  'Albuterol (PRN)', 'Fluticasone (ICS)', 'Montelukast',
  'Sertraline', 'Escitalopram', 'Fluoxetine', 'Bupropion',
  'Alprazolam', 'Lorazepam', 'Clonazepam',
  'Gabapentin', 'Pregabalin', 'Amitriptyline',
  'Prednisone', 'Methylprednisolone', 'Dexamethasone',
  'Ibuprofen', 'Naproxen', 'Acetaminophen',
  'Oxycodone', 'Hydrocodone', 'Morphine', 'Tramadol',
]
