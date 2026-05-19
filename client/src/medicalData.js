// Comprehensive Medical Database for Disease Detection
// This includes symptoms, diseases, medicines (allopathic & Ayurvedic), fruits, and exercises

export const medicalDatabase = {
  // Disease definitions with symptoms, medicines, and recommendations
  diseases: {
    "Common Cold": {
      symptoms: ["runny nose", "sneezing", "sore throat", "cough", "congestion", "mild fever", "headache", "fatigue", "watery eyes"],
      allopathic: [
        { name: "Paracetamol 500mg", dosage: "1 tablet 3 times daily", duration: "3-5 days" },
        { name: "Cetirizine 10mg", dosage: "1 tablet at night", duration: "5 days" },
        { name: "Phenylephrine nasal drops", dosage: "2 drops in each nostril", duration: "3 days" },
        { name: "Cough syrup (Expectorant)", dosage: "2 teaspoons 3 times daily", duration: "5 days" }
      ],
      ayurvedic: [
        { name: "Tulsi Tea", dosage: "1 cup twice daily", duration: "5-7 days" },
        { name: "Ginger & Honey", dosage: "1 tsp ginger juice + 1 tsp honey", duration: "5 days" },
        { name: "Giloy juice", dosage: "2 tablespoons morning empty stomach", duration: "7 days" },
        { name: "Steam inhalation with eucalyptus oil", dosage: "Once daily", duration: "5 days" }
      ],
      fruits: ["Citrus fruits (orange, lemon)", "Kiwi", "Papaya", "Guava", "Apple"],
      exercises: ["Light walking (15-20 min)", "Gentle stretching", "Deep breathing exercises", "Yoga (Pranayama)"],
      precautions: ["Rest adequately", "Stay hydrated", "Avoid cold drinks", "Keep warm", "Use humidifier"]
    },
    "Flu (Influenza)": {
      symptoms: ["high fever", "body ache", "chills", "fatigue", "dry cough", "headache", "sore throat", "loss of appetite", "runny nose"],
      allopathic: [
        { name: "Oseltamivir 75mg", dosage: "1 capsule twice daily", duration: "5 days" },
        { name: "Paracetamol 650mg", dosage: "1 tablet 4 times daily", duration: "5 days" },
        { name: "Dispray 0.5mg", dosage: "2 puffs when needed", duration: "5 days" },
        { name: "Azithromycin 500mg", dosage: "1 tablet daily", duration: "3 days" }
      ],
      ayurvedic: [
        { name: "Tulsi-Ginger kadha", dosage: "2 tablespoons twice daily", duration: "7 days" },
        { name: "Giloy Ghana vati", dosage: "2 tablets twice daily", duration: "7 days" },
        { name: "Turmeric milk", dosage: "1 glass warm milk with 1/2 tsp turmeric", duration: "7 days" },
        { name: "Mulethi (Licorice) tea", dosage: "1 cup daily", duration: "5 days" }
      ],
      fruits: ["Orange", "Pomegranate", "Mango", "Berries", "Banana"],
      exercises: ["Complete rest during fever", "Light stretching when fever subsides", "Walking after recovery", "Breathing exercises"],
      precautions: ["Get plenty of rest", "Stay hydrated", "Take fever-reducing medicines", "Avoid going to public places", "Cover mouth when coughing"]
    },
    "Viral Fever": {
      symptoms: ["high fever", "headache", "body ache", "fatigue", "weakness", "sweating", "chills", "loss of appetite", "dehydration"],
      allopathic: [
        { name: "Paracetamol 500mg", dosage: "1 tablet 4-6 hours as needed", duration: "Until fever subsides" },
        { name: "Ibuprofen 400mg", dosage: "1 tablet twice daily after food", duration: "3 days" },
        { name: "ORS solution", dosage: "1 packet in 1 liter water", duration: "Until hydrated" },
        { name: "Vitamin C 1000mg", dosage: "1 tablet daily", duration: "7 days" }
      ],
      ayurvedic: [
        { name: "Tulsi leaves decoction", dosage: "10-15 leaves boiled in water", duration: "5 days" },
        { name: "Guduchi (Giloy) decoction", dosage: "2 tablespoons twice daily", duration: "7 days" },
        { name: "Ginger-Clove tea", dosage: "1 cup twice daily", duration: "5 days" },
        { name: "Cold sponging with neem water", dosage: "When fever is high", duration: "As needed" }
      ],
      fruits: ["Watermelon", "Coconut water", "Orange", "Mosambi", "Papaya"],
      exercises: ["Complete bed rest", "Light breathing exercises only", "No strenuous activity until fever breaks", "Gentle walking after recovery"],
      precautions: ["Monitor temperature regularly", "Stay hydrated", "Take sponge bath if fever is high", "Don't take antibiotics without prescription", "Seek doctor if fever persists beyond 3 days"]
    },
    "Dengue Fever": {
      symptoms: ["high fever", "severe headache", "pain behind eyes", "joint pain", "muscle pain", "rash", "fatigue", "nausea", "mild bleeding"],
      allopathic: [
        { name: "Paracetamol 500mg", dosage: "1 tablet 4 times daily", duration: "Until fever subsides" },
        { name: "ORS (Oral Rehydration Solution)", dosage: "As needed", duration: "Throughout illness" },
        { name: "Vitamin C 1000mg", dosage: "1 tablet daily", duration: "10 days" },
        { name: "Papaya leaf extract", dosage: "2 tablespoons twice daily", duration: "7 days" }
      ],
      ayurvedic: [
        { name: "Giloy juice", dosage: "2 tablespoons in morning", duration: "10 days" },
        { name: "Neem leaves decoction", dosage: "1 cup daily", duration: "7 days" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "10 days" },
        { name: "Tulsi tea", dosage: "2 cups daily", duration: "10 days" }
      ],
      fruits: ["Papaya", "Pomegranate", "Coconut water", "Orange", "Kiwi"],
      exercises: ["Complete bed rest", "No exercise during fever", "Light walking after recovery", "Gentle yoga after platelet count improves"],
      precautions: ["Avoid ibuprofen/aspirin", "Monitor platelet count", "Stay hydrated", "Use mosquito nets", "Seek immediate medical attention if bleeding occurs"]
    },
    "Malaria": {
      symptoms: ["high fever", "chills", "sweating", "headache", "nausea", "vomiting", "body ache", "fatigue", "enlarged spleen"],
      allopathic: [
        { name: "Chloroquine 500mg", dosage: "As per doctor's prescription", duration: "As prescribed" },
        { name: "Artemisinin Combination Therapy", dosage: "As per doctor's prescription", duration: "As prescribed" },
        { name: "Paracetamol 500mg", dosage: "For fever", duration: "As needed" },
        { name: "Iron supplements", dosage: "1 tablet daily", duration: "1 month" }
      ],
      ayurvedic: [
        { name: "Giloy decoction", dosage: "2 tablespoons morning and evening", duration: "15 days" },
        { name: "Neem leaves juice", dosage: "1 tablespoon daily", duration: "10 days" },
        { name: "Tulsi leaves decoction", dosage: "1 cup twice daily", duration: "15 days" },
        { name: "Ginger tea", dosage: "1 cup twice daily", duration: "10 days" }
      ],
      fruits: ["Pomegranate", "Apple", "Orange", "Banana", "Grapes"],
      exercises: ["Complete rest during treatment", "Light walking after recovery", "No strenuous exercise", "Yoga and meditation for recovery"],
      precautions: ["Complete full course of medicines", "Use mosquito nets/repellents", "Stay hydrated", "Take iron-rich foods", "Regular follow-up with doctor"]
    },
    "Typhoid": {
      symptoms: ["high fever", "weakness", "abdominal pain", "constipation", "diarrhea", "headache", "loss of appetite", "rash", "enlarged liver"],
      allopathic: [
        { name: "Azithromycin 500mg", dosage: "1 tablet daily", duration: "7 days" },
        { name: "Ceftriaxone Injection", dosage: "As per doctor's advice", duration: "As prescribed" },
        { name: "Paracetamol 500mg", dosage: "For fever", duration: "As needed" },
        { name: "ORS solution", dosage: "Regular intake", duration: "Until symptoms improve" }
      ],
      ayurvedic: [
        { name: "Giloy juice", dosage: "2 tablespoons twice daily", duration: "14 days" },
        { name: "Buttermilk with cumin", dosage: "1 glass twice daily", duration: "10 days" },
        { name: "Banana smoothie", dosage: "1 glass daily", duration: "7 days" },
        { name: "Garlic", dosage: "2 cloves daily", duration: "10 days" }
      ],
      fruits: ["Banana", "Papaya", "Apple", "Mango", "Coconut water"],
      exercises: ["Complete bed rest", "No exercise during illness", "Light walking after recovery", "Gradual return to normal activities"],
      precautions: ["Complete antibiotic course", "Maintain hygiene", "Avoid spicy foods", "Drink only boiled water", "Regular follow-up"]
    },
    "Gastroenteritis": {
      symptoms: ["diarrhea", "vomiting", "stomach pain", "cramps", "fever", "dehydration", "loss of appetite", "fatigue", "blood in stool"],
      allopathic: [
        { name: "ORS (Oral Rehydration Solution)", dosage: "1 packet in 1 liter water", duration: "Until hydrated" },
        { name: "Loperamide 2mg", dosage: "After each loose motion, max 8mg/day", duration: "2 days" },
        { name: "Metronidazole 400mg", dosage: "3 times daily", duration: "5 days" },
        { name: "Domperidone 10mg", dosage: "For vomiting", duration: "As needed" }
      ],
      ayurvedic: [
        { name: "Jeera water", dosage: "1 tsp jeera in 1 glass water", duration: "3-4 times daily" },
        { name: "Buttermilk with black salt", dosage: "1 glass twice daily", duration: "5 days" },
        { name: "Pomegranate juice", dosage: "1 glass twice daily", duration: "3 days" },
        { name: "Banana with curd", dosage: "1 banana with 2 tbsp curd", duration: "3 days" }
      ],
      fruits: ["Banana", "Apple", "Pomegranate", "Papaya", "Mango"],
      exercises: ["Rest during acute phase", "Light walking after symptoms improve", "No intense exercise until fully recovered", "Yoga (avoid strenuous poses)"],
      precautions: ["Stay hydrated", "Avoid dairy initially", "Eat bland diet", "Wash hands frequently", "Avoid street food"]
    },
    "Migraine": {
      symptoms: ["severe headache", "nausea", "vomiting", "sensitivity to light", "sensitivity to sound", "visual disturbances", "dizziness", "fatigue"],
      allopathic: [
        { name: "Sumatriptan 50mg", dosage: "1 tablet at onset of headache", duration: "As needed" },
        { name: "Paracetamol 500mg", dosage: "1 tablet", duration: "As needed" },
        { name: "Domperidone 10mg", dosage: "For nausea", duration: "As needed" },
        { name: "Propranolol 40mg", dosage: "For prevention", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Brahmi juice", dosage: "1 tablespoon morning", duration: "30 days" },
        { name: "Shankhapushpi powder", dosage: "1 tsp with milk", duration: "30 days" },
        { name: "Ginger tea", dosage: "1 cup at onset", duration: "As needed" },
        { name: "Eucalyptus oil massage", dosage: "On temples", duration: "During headache" }
      ],
      fruits: ["Banana", "Blueberries", "Avocado", "Melon", "Apple"],
      exercises: ["Regular exercise (30 min)", "Yoga and meditation", "Deep breathing", "Neck stretches", "Eye exercises"],
      precautions: ["Identify triggers", "Maintain regular sleep schedule", "Avoid stress", "Limit caffeine", "Stay hydrated"]
    },
    "Hypertension": {
      symptoms: ["headache", "shortness of breath", "nosebleeds", "dizziness", "chest pain", "visual changes", "fatigue", "irregular heartbeat"],
      allopathic: [
        { name: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Losartan 50mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Hydrochlorothiazide 12.5mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Aspirin 75mg", dosage: "1 tablet daily", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Arjuna bark decoction", dosage: "1 cup twice daily", duration: "Long term" },
        { name: "Garlic (2 cloves) daily", dosage: "Morning empty stomach", duration: "Long term" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" },
        { name: "Pomegranate juice", dosage: "1 glass daily", duration: "Long term" }
      ],
      fruits: ["Banana", "Watermelon", "Orange", "Avocado", "Berries"],
      exercises: ["Aerobic exercise (30 min daily)", "Walking", "Swimming", "Cycling", "Yoga (Shavasana, Pranayama)"],
      precautions: ["Reduce salt intake", "Limit alcohol", "Quit smoking", "Manage stress", "Regular BP monitoring", "Avoid fried foods"]
    },
    "Diabetes": {
      symptoms: ["frequent urination", "excessive thirst", "fatigue", "weight loss", "blurred vision", "slow healing", "increased hunger", "tingling in hands/feet"],
      allopathic: [
        { name: "Metformin 500mg", dosage: "1 tablet twice daily", duration: "As prescribed" },
        { name: "Glipizide 5mg", dosage: "1 tablet before breakfast", duration: "As prescribed" },
        { name: "Sitagliptin 100mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Insulin (as prescribed)", dosage: "As per doctor's advice", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Karela juice", dosage: "2 tablespoons morning", duration: "Long term" },
        { name: "Methi seeds water", dosage: "1 tsp in water overnight", duration: "Long term" },
        { name: "Amla juice", dosage: "1 tablespoon daily", duration: "Long term" },
        { name: "Turmeric with warm milk", dosage: "1 glass at night", duration: "Long term" }
      ],
      fruits: ["Apple", "Berries", "Citrus fruits", "Guava", "Cherry"],
      exercises: ["Daily walking (30-45 min)", "Cycling", "Swimming", "Strength training", "Yoga ( Surya Namaskar, Pranayama)"],
      precautions: ["Monitor blood sugar regularly", "Follow low-GI diet", "Avoid sugar", "Eat small frequent meals", "Regular exercise", "Foot care"]
    },
    "Asthma": {
      symptoms: ["shortness of breath", "wheezing", "chest tightness", "coughing", "nighttime symptoms", "fatigue", "difficulty speaking", "lip or fingernail blueness"],
      allopathic: [
        { name: "Salbutamol inhaler", dosage: "2 puffs when needed", duration: "As needed" },
        { name: "Budesonide inhaler", dosage: "2 puffs twice daily", duration: "As prescribed" },
        { name: "Montelukast 10mg", dosage: "1 tablet at night", duration: "As prescribed" },
        { name: "Theophylline 300mg", dosage: "As prescribed", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Sitopaladi churna", dosage: "1 tsp with honey", duration: "30 days" },
        { name: "Licorice (Mulethi) tea", dosage: "1 cup daily", duration: "30 days" },
        { name: "Ginger with garlic", dosage: "1 tsp daily", duration: "Long term" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" }
      ],
      fruits: ["Apple", "Banana", "Orange", "Papaya", "Kiwi"],
      exercises: ["Breathing exercises", "Swimming", "Walking", "Yoga (Pranayama, Bhastrika)", "Cycling (moderate)"],
      precautions: ["Avoid triggers (dust, smoke)", "Keep inhaler handy", "Regular check-ups", "Avoid cold air", "Stay active", "Manage stress"]
    },
    "Arthritis": {
      symptoms: ["joint pain", "stiffness", "swelling", "reduced range of motion", "fatigue", "fever", "weight loss", "joint redness"],
      allopathic: [
        { name: "Ibuprofen 400mg", dosage: "1 tablet twice daily", duration: "As needed" },
        { name: "Diclofenac gel", dosage: "Apply on affected joints", duration: "As needed" },
        { name: "Glucosamine supplements", dosage: "1 tablet twice daily", duration: "3 months" },
        { name: "Calcium + Vitamin D", dosage: "1 tablet daily", duration: "Long term" }
      ],
      ayurvedic: [
        { name: "Ashwagandha", dosage: "1 tsp with milk", duration: "30 days" },
        { name: "Guggulu tablets", dosage: "2 tablets twice daily", duration: "30 days" },
        { name: "Turmeric paste", dosage: "Apply on joints", duration: "As needed" },
        { name: "Ginger tea", dosage: "1 cup twice daily", duration: "Long term" }
      ],
      fruits: ["Orange", "Papaya", "Berries", "Pomegranate", "Grapes"],
      exercises: ["Low-impact exercises", "Swimming", "Walking", "Gentle yoga", "Range of motion exercises"],
      precautions: ["Maintain healthy weight", "Avoid high-impact activities", "Apply heat/cold therapy", "Take regular breaks", "Eat anti-inflammatory foods"]
    },
    "Skin Infection": {
      symptoms: ["redness", "itching", "rash", "swelling", "pain", "pus or discharge", "blisters", "dryness", "skin peeling"],
      allopathic: [
        { name: "Clotrimazole cream", dosage: "Apply twice daily", duration: "7-14 days" },
        { name: "Miconazole cream", dosage: "Apply twice daily", duration: "7-14 days" },
        { name: "Fluconazole 150mg", dosage: "1 tablet once weekly", duration: "2-4 weeks" },
        { name: "Antihistamine", dosage: "For itching", duration: "As needed" }
      ],
      ayurvedic: [
        { name: "Neem paste", dosage: "Apply on affected area", duration: "Twice daily" },
        { name: "Turmeric paste", dosage: "Apply with water", duration: "Twice daily" },
        { name: "Aloe vera gel", dosage: "Apply fresh gel", duration: "As needed" },
        { name: "Coconut oil with turmeric", dosage: "Apply on skin", duration: "Twice daily" }
      ],
      fruits: ["Orange", "Lemon", "Papaya", "Apple", "Berries"],
      exercises: ["Light exercise", "Avoid sweating heavily", "Yoga", "Walking", "No swimming until healed"],
      precautions: ["Keep area clean and dry", "Avoid scratching", "Use mild soap", "Wear loose cotton clothes", "Avoid sharing towels"]
    },
    "Allergic Rhinitis": {
      symptoms: ["sneezing", "runny nose", "itchy eyes", "nasal congestion", "headache", "fatigue", "postnasal drip", "cough"],
      allopathic: [
        { name: "Cetirizine 10mg", dosage: "1 tablet daily", duration: "As needed" },
        { name: "Loratadine 10mg", dosage: "1 tablet daily", duration: "As needed" },
        { name: "Fluticasone nasal spray", dosage: "2 sprays each nostril daily", duration: "As prescribed" },
        { name: "Montelukast 10mg", dosage: "1 tablet at night", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Tulsi leaves", dosage: "Chew 5-6 leaves daily", duration: "Long term" },
        { name: "Ginger tea", dosage: "1 cup twice daily", duration: "Long term" },
        { name: "Steam inhalation with ajwain", dosage: "Once daily", duration: "As needed" },
        { name: "Nasal drops (anjana)", dosage: "As per Ayurvedic doctor", duration: "As prescribed" }
      ],
      fruits: ["Apple", "Orange", "Kiwi", "Pomegranate", "Grapes"],
      exercises: ["Breathing exercises", "Running (outdoors when pollen count is low)", "Yoga", "Swimming", "Cycling"],
      precautions: ["Avoid allergens", "Keep windows closed during high pollen", "Use air purifier", "Wash hands frequently", "Avoid dust"]
    },
    "Heart Disease": {
      symptoms: ["chest pain", "shortness of breath", "fatigue", "irregular heartbeat", "swelling in legs", "dizziness", "nausea", "cold sweats"],
      allopathic: [
        { name: "Aspirin 75mg", dosage: "1 tablet daily", duration: "Long term" },
        { name: "Atorvastatin 20mg", dosage: "1 tablet at night", duration: "Long term" },
        { name: "Metoprolol 25mg", dosage: "As prescribed", duration: "Long term" },
        { name: "Clopidogrel 75mg", dosage: "As prescribed", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Arjuna bark decoction", dosage: "1 cup twice daily", duration: "Long term" },
        { name: "Garlic (1 clove) daily", dosage: "Morning empty stomach", duration: "Long term" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" },
        { name: "Pomegranate juice", dosage: "1 glass daily", duration: "Long term" }
      ],
      fruits: ["Apple", "Banana", "Orange", "Avocado", "Berries"],
      exercises: ["Cardiac rehabilitation exercises", "Walking", "Light cycling", "Swimming (with approval)", "Yoga (under supervision)"],
      precautions: ["Low-sodium diet", "Avoid fatty foods", "Regular monitoring", "Take medicines regularly", "Avoid stress", "Quit smoking"]
    },
    "Anemia": {
      symptoms: ["fatigue", "weakness", "pale skin", "shortness of breath", "dizziness", "headache", "cold hands/feet", "brittle nails", "rapid heartbeat"],
      allopathic: [
        { name: "Ferrous sulfate tablets", dosage: "1 tablet twice daily", duration: "3-6 months" },
        { name: "Folic acid 5mg", dosage: "1 tablet daily", duration: "3 months" },
        { name: "Vitamin B12 supplements", dosage: "1 tablet daily", duration: "3 months" },
        { name: "Vitamin C 500mg", dosage: "1 tablet daily", duration: "3 months" }
      ],
      ayurvedic: [
        { name: "Beetroot juice", dosage: "1 glass daily", duration: "30 days" },
        { name: "Pomegranate juice", dosage: "1 glass twice daily", duration: "30 days" },
        { name: "Dates and raisins", dosage: "5-6 daily", duration: "Long term" },
        { name: "Giloy juice", dosage: "2 tablespoons daily", duration: "30 days" }
      ],
      fruits: ["Pomegranate", "Apple", "Banana", "Orange", "Grapes"],
      exercises: ["Light exercises", "Walking", "Yoga", "Breathing exercises", "Avoid intense exercise until iron levels improve"],
      precautions: ["Eat iron-rich foods", "Take iron supplements with vitamin C", "Avoid tea/coffee with meals", "Cook in iron utensils", "Regular blood tests"]
    },
    "Thyroid (Hypothyroidism)": {
      symptoms: ["fatigue", "weight gain", "cold intolerance", "dry skin", "hair loss", "constipation", "depression", "memory problems", "slowed heart rate"],
      allopathic: [
        { name: "Levothyroxine 50mcg", dosage: "1 tablet daily morning", duration: "Long term" },
        { name: "Vitamin D3 2000IU", dosage: "1 tablet daily", duration: "Long term" },
        { name: "Selenium 100mcg", dosage: "1 tablet daily", duration: "Long term" },
        { name: "Iron supplements (if needed)", dosage: "As prescribed", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Kelp/Seaweed", dosage: "As per Ayurvedic doctor", duration: "As prescribed" },
        { name: "Guggulu", dosage: "As prescribed", duration: "Long term" },
        { name: "Ashwagandha", dosage: "1 tsp with milk", duration: "Long term" },
        { name: "Triphala", dosage: "1 tsp at bedtime", duration: "Long term" }
      ],
      fruits: ["Apple", "Berries", "Banana", "Citrus fruits", "Papaya"],
      exercises: ["Moderate exercise", "Walking", "Yoga", "Swimming", "Cycling"],
      precautions: ["Take thyroid medicine on empty stomach", "Avoid soy products", "Regular thyroid tests", "Adequate sleep", "Manage stress"]
    },
    "Anxiety Disorder": {
      symptoms: ["excessive worry", "restlessness", "fast heartbeat", "shortness of breath", "sweating", "trembling", "difficulty concentrating", "sleep problems", "irritability"],
      allopathic: [
        { name: "Sertraline 50mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Escitalopram 10mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Clonazepam 0.5mg", dosage: "As prescribed (short term)", duration: "As prescribed" },
        { name: "Propranolol 20mg", dosage: "For physical symptoms", duration: "As needed" }
      ],
      ayurvedic: [
        { name: "Brahmi", dosage: "1 tsp with milk", duration: "30 days" },
        { name: "Ashwagandha", dosage: "1 tsp with water", duration: "30 days" },
        { name: "Shankhapushpi", dosage: "1 tsp with water", duration: "30 days" },
        { name: "Meditation and yoga", dosage: "Daily practice", duration: "Long term" }
      ],
      fruits: ["Banana", "Blueberries", "Avocado", "Orange", "Mango"],
      exercises: ["Regular exercise", "Yoga", "Meditation", "Walking", "Swimming", "Deep breathing"],
      precautions: ["Practice mindfulness", "Avoid caffeine", "Get adequate sleep", "Maintain routine", "Seek therapy", "Avoid alcohol"]
    },
    "Depression": {
      symptoms: ["persistent sadness", "loss of interest", "fatigue", "sleep problems", "appetite changes", "feelings of guilt", "difficulty concentrating", "thoughts of death"],
      allopathic: [
        { name: "Fluoxetine 20mg", dosage: "1 capsule daily", duration: "As prescribed" },
        { name: "Sertraline 50mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Escitalopram 10mg", dosage: "1 tablet daily", duration: "As prescribed" },
        { name: "Clonazepam 0.5mg", dosage: "For anxiety (short term)", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Ashwagandha", dosage: "1 tsp with milk", duration: "30 days" },
        { name: "Brahmi juice", dosage: "1 tablespoon daily", duration: "30 days" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" },
        { name: "Yoga and meditation", dosage: "Daily practice", duration: "Long term" }
      ],
      fruits: ["Banana", "Blueberries", "Apple", "Orange", "Berries"],
      exercises: ["Regular aerobic exercise", "Walking", "Running", "Yoga", "Dancing", "Swimming"],
      precautions: ["Seek professional help", "Stay connected with people", "Regular routine", "Avoid isolation", "Healthy diet", "Adequate sleep"]
    },
    "Pneumonia": {
      symptoms: ["cough with phlegm", "high fever", "chills", "shortness of breath", "chest pain", "fatigue", "confusion", "loss of appetite", "sweating"],
      allopathic: [
        { name: "Amoxicillin 500mg", dosage: "3 times daily", duration: "7-10 days" },
        { name: "Azithromycin 500mg", dosage: "Once daily", duration: "5 days" },
        { name: "Paracetamol 500mg", dosage: "For fever", duration: "As needed" },
        { name: "Bronchodilator syrup", dosage: "2 teaspoons thrice daily", duration: "7 days" }
      ],
      ayurvedic: [
        { name: "Tulsi-Ginger decoction", dosage: "2 tablespoons twice daily", duration: "10 days" },
        { name: "Giloy juice", dosage: "2 tablespoons morning", duration: "14 days" },
        { name: "Pippali (Long pepper)", dosage: "With honey", duration: "7 days" },
        { name: "Steam inhalation", dosage: "2-3 times daily", duration: "7 days" }
      ],
      fruits: ["Pomegranate", "Orange", "Papaya", "Kiwi", "Coconut water"],
      exercises: ["Complete rest during illness", "Deep breathing exercises after recovery", "Light walking when fever subsides", "Pursed-lip breathing"],
      precautions: ["Complete antibiotic course", "Get plenty of rest", "Stay hydrated", "Use humidifier", "Avoid smoking", "Follow-up with doctor"]
    },
    "Appendicitis": {
      symptoms: ["abdominal pain (starting near navel)", "loss of appetite", "nausea", "vomiting", "fever", "abdominal swelling", "tenderness", "painful cough/sneeze"],
      allopathic: [
        { name: "Pain relievers (as prescribed)", dosage: "As prescribed", duration: "Before surgery" },
        { name: "Antibiotics (IV)", dosage: "As prescribed", duration: "Before surgery" },
        { name: "Appendectomy", dosage: "Surgical removal", duration: "Definitive treatment" },
        { name: "Laparoscopic surgery preferred", dosage: "Minimal invasion", duration: "Procedure" }
      ],
      ayurvedic: [
        { name: "Consult doctor immediately", dosage: "Not for self-treatment", duration: "Emergency" },
        { name: "Herbal teas for comfort", dosage: "Warm ginger/mint tea", duration: "Before medical care" },
        { name: "Rest", dosage: "Complete bed rest", duration: "Until medical attention" },
        { name: "Hydration", dosage: "Clear fluids only", duration: "Before medical care" }
      ],
      fruits: ["Apple (grated)", "Banana", "Papaya", "Coconut water", "Watermelon"],
      exercises: ["No exercise if appendicitis suspected", "Complete rest", "Light walking after surgery (as advised)", "No strenuous activity"],
      precautions: ["Seek immediate medical attention", "Don't apply heat to abdomen", "Don't take laxatives", "Don't ignore abdominal pain", "Fast before surgery if advised"]
    },
    "Kidney Stone": {
      symptoms: ["severe flank pain", "blood in urine", "frequent urination", "painful urination", "nausea", "vomiting", "fever", "urinary urgency"],
      allopathic: [
        { name: "Tamsulosin 0.4mg", dosage: "1 capsule daily", duration: "As prescribed" },
        { name: "Diclofenac 50mg", dosage: "For pain", duration: "As needed" },
        { name: "Potassium citrate", dosage: "As prescribed", duration: "As prescribed" },
        { name: "Extracorporeal Shock Wave Lithotripsy", dosage: "Procedure", duration: "As per doctor" }
      ],
      ayurvedic: [
        { name: "Gokshura (Tribulus)", dosage: "1 tsp powder", duration: "30 days" },
        { name: "Pashanabheda", dosage: "As prescribed", duration: "30 days" },
        { name: "Varuna bark decoction", dosage: "As prescribed", duration: "30 days" },
        { name: "Lemon juice with olive oil", dosage: "As suggested", duration: "As suggested" }
      ],
      fruits: ["Watermelon", "Lemon", "Orange", "Apple", "Grapes"],
      exercises: ["Light exercises", "Walking", "Yoga (not strenuous)", "Avoid intense jumping", "Regular movement to pass stones"],
      precautions: ["Drink 3-4 liters water daily", "Reduce sodium", "Limit oxalate-rich foods", "Don't hold urine", "Follow-up with urologist"]
    },
    "Liver Disease": {
      symptoms: ["jaundice (yellow skin/eyes)", "abdominal pain", "swelling in legs", "dark urine", "pale stool", "fatigue", "nausea", "loss of appetite", "easy bruising"],
      allopathic: [
        { name: "Liver protectants (UDCA)", dosage: "As prescribed", duration: "As prescribed" },
        { name: "Antiviral (if viral)", dosage: "As prescribed", duration: "As prescribed" },
        { name: "Lactulose", dosage: "For encephalopathy", duration: "As prescribed" },
        { name: "Vitamin K injection", dosage: "If bleeding", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Kalmegh (Andrographis)", dosage: "As prescribed", duration: "30 days" },
        { name: "BhringrajAs prescribed", duration: "30 days", dosage: "" },
        { name: "Amla juice", dosage: "2 tablespoons daily", duration: "Long term" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" }
      ],
      fruits: ["Papaya", "Apple", "Banana", "Orange", "Grapes"],
      exercises: ["Light exercise", "Walking", "Yoga", "Avoid heavy lifting", "Gentle swimming"],
      precautions: ["Avoid alcohol completely", "Low-fat diet", "Avoid self-medications", "Regular liver function tests", "Hepatitis vaccination", "Don't share needles"]
    },
    "COPD": {
      symptoms: ["chronic cough", "shortness of breath", "wheezing", "chest tightness", "excess mucus", "fatigue", "frequent respiratory infections", "blue lips/fingernails"],
      allopathic: [
        { name: "Salmeterol/Fluticasone inhaler", dosage: "2 puffs twice daily", duration: "Long term" },
        { name: "Tiotropium bromide", dosage: "1 puff daily", duration: "Long term" },
        { name: "Roflumilast 500mcg", dosage: "1 tablet daily", duration: "Long term" },
        { name: "Mucolytics", dosage: "As prescribed", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Vasa (Adhatoda) juice", dosage: "As prescribed", duration: "30 days" },
        { name: "Licorice tea", dosage: "1 cup daily", duration: "Long term" },
        { name: "Turmeric milk", dosage: "1 glass at night", duration: "Long term" },
        { name: "Pranayama (Breathing exercises)", dosage: "Daily practice", duration: "Long term" }
      ],
      fruits: ["Apple", "Banana", "Orange", "Papaya", "Kiwi"],
      exercises: ["Pulmonary rehabilitation", "Walking", "Light cycling", "Breathing exercises", "Gentle yoga"],
      precautions: ["Quit smoking", "Avoid pollutants", "Get vaccinated (flu/pneumonia)", "Use oxygen if prescribed", "Avoid cold air", "Regular check-ups"]
    },
    "Osteoporosis": {
      symptoms: ["back pain", "stooped posture", "bone fractures", "loss of height", "weak nails", "weak grip strength"],
      allopathic: [
        { name: "Alendronate 70mg", dosage: "1 tablet weekly", duration: "Long term" },
        { name: "Calcium carbonate 500mg", dosage: "1 tablet twice daily", duration: "Long term" },
        { name: "Vitamin D3 2000IU", dosage: "1 tablet daily", duration: "Long term" },
        { name: "Denosumab injection", dosage: "Every 6 months", duration: "As prescribed" }
      ],
      ayurvedic: [
        { name: "Ashwagandha", dosage: "1 tsp with milk", duration: "Long term" },
        { name: "Lakshadi Guggulu", dosage: "2 tablets twice daily", duration: "30 days" },
        { name: "Abhyanga (oil massage)", dosage: "With sesame oil", duration: "Regular" },
        { name: "Chewable amla", dosage: "Daily", duration: "Long term" }
      ],
      fruits: ["Orange", "Banana", "Papaya", "Berries", "Apple"],
      exercises: ["Weight-bearing exercises", "Walking", "Resistance training", "Balance exercises", "Tai Chi"],
      precautions: ["Adequate calcium intake", "Get enough Vitamin D", "Avoid smoking", "Limit alcohol", "Fall prevention", "Regular bone density tests"]
    },
    "Urinary Tract Infection": {
      symptoms: ["burning urination", "frequent urination", "cloudy urine", "blood in urine", "strong odor", "pelvic pain", "fever", "fatigue"],
      allopathic: [
        { name: "Nitrofurantoin 100mg", dosage: "Twice daily", duration: "5-7 days" },
        { name: "Ciprofloxacin 250mg", dosage: "Twice daily", duration: "3-7 days" },
        { name: "Phenazopyridine", dosage: "For pain relief", duration: "2 days" },
        { name: "Cranberry extract", dosage: "As supplement", duration: "Prevention" }
      ],
      ayurvedic: [
        { name: "Coriander water", dosage: "1 glass twice daily", duration: "7 days" },
        { name: "Cumin water", dosage: "1 glass twice daily", duration: "7 days" },
        { name: "Gokshura decoction", dosage: "1 cup twice daily", duration: "7 days" },
        { name: "Tulsi tea", dosage: "1 cup thrice daily", duration: "7 days" }
      ],
      fruits: ["Cranberry", "Blueberries", "Apple", "Banana", "Watermelon"],
      exercises: ["Light exercise", "Walking", "Avoid intense workouts until recovered", "Kegel exercises", "Yoga"],
      precautions: ["Drink plenty of water", "Urinate after intercourse", "Wipe front to back", "Avoid irritants", "Don't hold urine", "Wear cotton underwear"]
    },
    "Thyroid (Hyperthyroidism)": {
      symptoms: ["weight loss", "rapid heartbeat", "nervousness", "tremor", "increased appetite", "sweating", "heat intolerance", "sleep problems", "bulging eyes"],
      allopathic: [
        { name: "Methimazole 10mg", dosage: "As prescribed", duration: "As prescribed" },
        { name: "Propranolol 20mg", dosage: "For symptoms", duration: "As prescribed" },
        { name: "Radioactive iodine therapy", dosage: "As prescribed", duration: "As prescribed" },
        { name: "Thyroidectomy (surgery)", dosage: "In severe cases", duration: "As per doctor" }
      ],
      ayurvedic: [
        { name: "Kapha-reducing diet", dosage: "As per constitution", duration: "Long term" },
        { name: "Turmeric with ghee", dosage: "Small amount", duration: "Long term" },
        { name: "Coconut water", dosage: "Daily", duration: "Long term" },
        { name: "Brahmri (Brahmi)", dosage: "As prescribed", duration: "Long term" }
      ],
      fruits: ["Banana", "Berries", "Peaches", "Grapes", "Mango"],
      exercises: ["Light exercise", "Yoga", "Walking", "Meditation", "Avoid strenuous exercise"],
      precautions: ["Avoid iodine excess", "Regular thyroid tests", "Take medicines regularly", "Manage stress", "Adequate sleep", "Avoid caffeine"]
    }
  },

  // Common symptoms for quick selection
  commonSymptoms: [
    "Fever", "Cough", "Headache", "Fatigue", "Body Ache", "Sore Throat", 
    "Nausea", "Vomiting", "Diarrhea", "Constipation", "Runny Nose", "Sneezing",
    "Chest Pain", "Shortness of Breath", "Dizziness", "Abdominal Pain",
    "Loss of Appetite", "Weight Loss", "Weight Gain", "Skin Rash",
    "Itching", "Joint Pain", "Muscle Pain", "Back Pain", "Swelling",
    "Eye Irritation", "Ear Pain", "Sleep Problems", "Anxiety", "Depression"
  ],

  // Additional symptom keywords for better matching
  symptomKeywords: {
    "fever": ["high temperature", "febrile", "chills", "sweating", "hot"],
    "cough": ["coughing", "dry cough", "wet cough", "phlegm", "mucus"],
    "headache": ["head pain", "migraine", "head ache", "pressure in head"],
    "fatigue": ["tired", "exhausted", "weakness", "lethargy", "no energy"],
    "nausea": ["feeling sick", "queasy", "upset stomach", "sick"],
    "vomiting": ["throwing up", "being sick", "puking"],
    "diarrhea": ["loose stools", "watery stool", "frequent bowel"],
    "shortness of breath": ["breathless", "difficulty breathing", "can't breathe", "breathing difficulty"],
    "chest pain": ["chest tightness", "pain in chest", "heart pain"],
    "dizziness": ["lightheaded", "vertigo", "spinning", "dizzy"],
    "abdominal pain": ["stomach pain", "belly pain", "tummy ache", "stomach ache"],
    "skin rash": ["red skin", "bumps on skin", "skin irritation", "hives"],
    "joint pain": ["ache in joints", "arthralgia", "joint ache"],
    "muscle pain": ["muscle ache", "myalgia", "sore muscles"],
    "runny nose": ["nasal discharge", "snot", "dripping nose"],
    "sore throat": ["throat pain", "painful swallow", "scratchy throat"],
    "loss of appetite": ["no hunger", "don't feel like eating", "reduced hunger"],
    "weight loss": ["losing weight", "slimming", "thin"],
    "swelling": ["edema", "puffy", "inflamed", "enlarged"],
    "itching": ["pruritus", "scratchy", "irritated skin"],
    "sleep problems": ["insomnia", "can't sleep", "no sleep", "sleepless"],
    "anxiety": ["worried", "nervous", "panic", "stress"],
    "depression": ["sad", "hopeless", "unhappy", "low mood"],
    "eye irritation": ["red eyes", "itchy eyes", "watery eyes", "eye pain"],
    "ear pain": ["earache", "pain in ear", "throbbing ear"]
  }
};

// ML-based disease prediction using symptom matching
export const predictDisease = (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return { error: "Please enter or select at least one symptom" };
  }

  // Normalize symptoms
  const normalizedInput = symptoms.map(s => s.toLowerCase().trim());
  
  // Add keyword matching
  let allSymptoms = [...normalizedInput];
  normalizedInput.forEach(input => {
    if (medicalDatabase.symptomKeywords[input]) {
      allSymptoms = [...allSymptoms, ...medicalDatabase.symptomKeywords[input]];
    }
  });

  // Calculate scores for each disease
  const diseaseScores = [];
  
  Object.entries(medicalDatabase.diseases).forEach(([diseaseName, diseaseData]) => {
    const diseaseSymptoms = diseaseData.symptoms.map(s => s.toLowerCase());
    
    // Count matching symptoms
    let matches = 0;
    allSymptoms.forEach(inputSymptom => {
      if (diseaseSymptoms.some(ds => ds.includes(inputSymptom) || inputSymptom.includes(ds))) {
        matches++;
      }
    });

    // Calculate confidence score
    const confidence = (matches / diseaseSymptoms.length) * 100;
    
    if (matches > 0) {
      diseaseScores.push({
        name: diseaseName,
        confidence: Math.min(confidence, 95),
        matches: matches,
        totalSymptoms: diseaseSymptoms.length,
        data: diseaseData
      });
    }
  });

  // Sort by confidence
  diseaseScores.sort((a, b) => b.confidence - a.confidence);

  if (diseaseScores.length === 0) {
    return { 
      error: "Could not identify a specific disease. Please consult a doctor for proper diagnosis.",
      suggestions: ["Common Cold", "Flu (Influenza)", "Viral Fever"]
    };
  }

  // Get top prediction
  const topPrediction = diseaseScores[0];
  
  return {
    predictions: diseaseScores.slice(0, 3),
    primaryPrediction: {
      disease: topPrediction.name,
      confidence: Math.round(topPrediction.confidence),
      ...topPrediction.data
    }
  };
};

export default medicalDatabase;
