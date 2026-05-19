"""
Disease Knowledge Base: Food, Medicine, Ayurvedic & Yoga recommendations
"""

DISEASE_KNOWLEDGE = {
    # === RESPIRATORY ===
    "common cold": {
        "foods": ["Tulsi tea", "Ginger honey lemon tea", "Warm soups", "Garlic", "Oranges", "Turmeric milk", "Chicken broth"],
        "medicines": ["Paracetamol (500mg)", "Cetirizine", "Phenylephrine nasal drops", "Vitamin C tablets"],
        "ayurvedic": ["Tulsi leaves (chew 4-5 fresh leaves daily)", "Ginger + honey + lemon juice", "Chyawanprash", "Steam with Eucalyptus oil", "Sitopaladi Churna"],
        "yoga": ["Pranayama (Anulom Vilom)", "Kapalbhati", "Bhastrika", "Neti (nasal cleanse)", "Surya Namaskar"],
        "description": "A viral infection of the upper respiratory tract causing runny nose, cough, and sore throat."
    },
    "flu": {
        "foods": ["Warm broths", "Ginger tea", "Honey", "Garlic", "Turmeric milk", "Citrus fruits", "Green vegetables"],
        "medicines": ["Oseltamivir (Tamiflu)", "Paracetamol", "ORS (Oral Rehydration Salts)", "Ibuprofen"],
        "ayurvedic": ["Tulsi + ginger decoction", "Giloy juice", "Ashwagandha", "Trikatu churna", "Amla juice"],
        "yoga": ["Rest + gentle Pranayama", "Anulom Vilom", "Nadi Shodhana", "Yoga Nidra for recovery"],
        "description": "Influenza is a contagious respiratory illness caused by influenza viruses."
    },
    "asthma": {
        "foods": ["Ginger", "Turmeric", "Honey", "Garlic", "Spinach", "Avocado", "Apples", "Omega-3 rich foods"],
        "medicines": ["Salbutamol inhaler", "Budesonide", "Montelukast", "Ipratropium bromide"],
        "ayurvedic": ["Sitopaladi Churna", "Vasavaleha", "Kantakari + ginger decoction", "Turmeric + honey mixture"],
        "yoga": ["Pranayama (Anulom Vilom)", "Bhramari", "Diaphragmatic breathing", "Sukhasana", "Setubandhasana"],
        "description": "A condition where airways narrow and swell, causing breathing difficulty."
    },
    "pneumonia": {
        "foods": ["Warm soups", "Honey + ginger tea", "Citrus fruits", "Leafy greens", "Probiotics (yogurt)", "Warm water"],
        "medicines": ["Amoxicillin", "Azithromycin", "Paracetamol", "Expectorants", "Oxygen therapy if severe"],
        "ayurvedic": ["Vasavaleha syrup", "Sitopaladi Churna", "Tulsi + pepper decoction", "Pippali churna with honey"],
        "yoga": ["Gentle Pranayama", "Pursed lip breathing", "Deep breathing exercises", "Yoga Nidra"],
        "description": "Lung infection causing inflammation of air sacs, which may fill with fluid."
    },
    "bronchitis": {
        "foods": ["Warm ginger tea", "Honey", "Turmeric milk", "Garlic soup", "Pineapple (bromelain)", "Citrus fruits"],
        "medicines": ["Salbutamol", "Bromhexine", "Paracetamol", "Ipratropium inhaler"],
        "ayurvedic": ["Vasaka (Malabar nut) leaves tea", "Trikatu churna", "Tulsi + ginger + honey", "Pushkarmool churna"],
        "yoga": ["Kapalbhati (gentle)", "Anulom Vilom", "Bhastrika (slow)", "Chest expansion exercises"],
        "description": "Inflammation of the bronchial tubes causing cough, mucus, and breathing difficulty."
    },

    # === DIGESTIVE ===
    "diabetes": {
        "foods": ["Bitter gourd (karela)", "Fenugreek seeds", "Cinnamon water", "Leafy greens", "Berries", "Whole grains", "Nuts"],
        "medicines": ["Metformin", "Glipizide", "Insulin (if required)", "Sitagliptin"],
        "ayurvedic": ["Jamun seed powder", "Karela juice (bitter gourd)", "Fenugreek seeds soaked in water", "Gurmar (Gymnema sylvestre)", "Vijayasar bark water"],
        "yoga": ["Mandukasana (Frog Pose)", "Paschimottanasana", "Dhanurasana", "Kapalbhati", "Surya Namaskar"],
        "description": "A metabolic disease causing high blood sugar due to insufficient insulin."
    },
    "gastritis": {
        "foods": ["Ginger tea", "Yogurt/probiotics", "Green vegetables", "Oatmeal", "Coconut water", "Banana"],
        "medicines": ["Omeprazole", "Pantoprazole", "Antacids (Gelusil/Digene)", "Sucralfate"],
        "ayurvedic": ["Amla powder + honey", "Shatavari churna", "Triphala churna", "Licorice (Yashtimadhu) root tea"],
        "yoga": ["Vajrasana (after meals)", "Pavanamuktasana", "Paschimottanasana", "Bhujangasana"],
        "description": "Inflammation of the stomach lining causing pain, nausea, and indigestion."
    },
    "irritable bowel syndrome": {
        "foods": ["Low-FODMAP foods", "Ginger tea", "Probiotics", "Rice", "Boiled vegetables", "Peppermint tea"],
        "medicines": ["Mebeverine", "Loperamide", "Antispasmodics", "Fiber supplements"],
        "ayurvedic": ["Bilwa churna", "Kutajghan vati", "Nagarmotha (Cyperus rotundus) tea", "Triphala churna (mild)"],
        "yoga": ["Pawanmuktasana", "Trikonasana", "Balasana", "Supta Matsyendrasana", "Yoga Nidra"],
        "description": "A common disorder affecting the large intestine causing cramping and bowel changes."
    },
    "constipation": {
        "foods": ["Papaya", "Prunes", "Figs", "High-fiber foods", "Warm water with lemon", "Flaxseeds", "Castor oil"],
        "medicines": ["Lactulose syrup", "Bisacodyl", "Isabgol (Psyllium husk)", "Senna"],
        "ayurvedic": ["Triphala churna (with warm water at night)", "Haritaki", "Castor oil with warm milk", "Abhayarishta"],
        "yoga": ["Pawanmuktasana", "Malasana (squat)", "Trikonasana", "Dhanurasana", "Kapalbhati"],
        "description": "Difficulty in passing stools, usually associated with hard, dry stools."
    },
    "diarrhea": {
        "foods": ["ORS (oral rehydration)", "Banana", "White rice", "Toast", "Boiled potatoes", "Yogurt", "Coconut water"],
        "medicines": ["ORS sachets", "Loperamide", "Metronidazole (if bacterial)", "Zinc supplements"],
        "ayurvedic": ["Bilwa fruit powder", "Kutajghan vati", "Pomegranate peel decoction", "Coriander seed water"],
        "yoga": ["Gentle Pranayama (rest mostly)", "Anulom Vilom", "Yoga Nidra for recovery"],
        "description": "Loose, watery stools occurring more frequently than usual."
    },

    # === HEART/CARDIOVASCULAR ===
    "hypertension": {
        "foods": ["Banana", "Leafy greens", "Berries", "Beets", "Oats", "Low-sodium foods", "Pomegranate juice", "Garlic"],
        "medicines": ["Amlodipine", "Losartan", "Atenolol", "Hydrochlorothiazide"],
        "ayurvedic": ["Arjuna bark decoction", "Sarpagandha", "Brahmi", "Ashwagandha", "Punarnava"],
        "yoga": ["Shavasana", "Anulom Vilom", "Bhramari Pranayama", "Sheetali Pranayama", "Yoga Nidra"],
        "description": "High blood pressure that can damage arteries and lead to heart disease."
    },
    "heart attack": {
        "foods": ["Omega-3 (fish, flaxseed)", "Fruits & vegetables", "Whole grains", "Low-fat dairy", "Nuts", "Olive oil"],
        "medicines": ["Aspirin", "Clopidogrel", "Statins (Atorvastatin)", "Beta-blockers", "ACE inhibitors"],
        "ayurvedic": ["Arjuna bark (Terminalia arjuna) decoction", "Pushkarmool", "Guggulu", "Brahmi"],
        "yoga": ["Gentle walking", "Anulom Vilom", "Shavasana", "Yoga Nidra", "Slow Surya Namaskar (post-recovery)"],
        "description": "Blockage of blood flow to heart muscle causing heart tissue damage."
    },
    "anemia": {
        "foods": ["Spinach", "Beets", "Pomegranate", "Dates", "Jaggery", "Lentils", "Red meat", "Vitamin C foods"],
        "medicines": ["Iron tablets (Ferrous sulfate)", "Folic acid", "Vitamin B12 injections"],
        "ayurvedic": ["Lohasava", "Dhatri Loha", "Pomegranate juice with jaggery", "Ashwagandha", "Shatavari"],
        "yoga": ["Sarvangasana", "Matsyasana", "Vrikshasana", "Virabhadrasana", "Surya Namaskar"],
        "description": "Low red blood cell count causing fatigue and weakness."
    },

    # === MENTAL HEALTH ===
    "panic disorder": {
        "foods": ["Magnesium-rich foods (nuts, seeds)", "Chamomile tea", "Green tea (L-theanine)", "Blueberries", "Dark chocolate", "Omega-3 foods"],
        "medicines": ["SSRIs (Sertraline, Escitalopram)", "Benzodiazepines (short-term)", "Beta-blockers", "Cognitive therapy"],
        "ayurvedic": ["Brahmi (Bacopa monnieri)", "Ashwagandha", "Jatamansi", "Shankhpushpi", "Tagara (Valerian)"],
        "yoga": ["Pranayama (4-7-8 breathing)", "Yoga Nidra", "Shavasana", "Bhramari", "Anulom Vilom", "Meditation"],
        "description": "Recurring unexpected panic attacks causing intense fear and physical symptoms."
    },
    "depression": {
        "foods": ["Omega-3 fatty acids", "Whole grains", "Dark chocolate", "Berries", "Green tea", "Walnuts", "Fermented foods"],
        "medicines": ["SSRIs (Fluoxetine, Sertraline)", "SNRIs", "Psychotherapy", "Vitamin D supplements"],
        "ayurvedic": ["Brahmi ghee", "Ashwagandha", "Saffron (Kesar) in milk", "Shankhpushpi syrup", "Jatamansi"],
        "yoga": ["Surya Namaskar", "Ustrasana", "Bhujangasana", "Setu Bandhasana", "Anulom Vilom", "Meditation"],
        "description": "A mental health disorder causing persistent sadness and loss of interest."
    },
    "anxiety": {
        "foods": ["Magnesium-rich foods", "Chamomile tea", "Green tea", "Blueberries", "Yogurt", "Turmeric", "Dark chocolate"],
        "medicines": ["SSRIs (Escitalopram)", "Buspirone", "Benzodiazepines (short-term)", "Therapy"],
        "ayurvedic": ["Brahmi + Ashwagandha", "Jatamansi powder", "Shankhpushpi syrup", "Tagara (Valerian root)"],
        "yoga": ["Anulom Vilom", "Bhramari Pranayama", "Yoga Nidra", "Balasana", "Viparita Karani", "Meditation"],
        "description": "Excessive worry and fear that interferes with daily activities."
    },

    # === INFECTIONS ===
    "typhoid fever": {
        "foods": ["ORS", "Banana", "Cooked vegetables", "Coconut water", "Boiled rice", "Yogurt", "Soft foods"],
        "medicines": ["Azithromycin", "Ceftriaxone", "Ciprofloxacin", "Paracetamol for fever"],
        "ayurvedic": ["Giloy (Tinospora cordifolia) juice", "Turmeric milk", "Neem leaves decoction", "Amla juice"],
        "yoga": ["Rest during acute phase", "Gentle Pranayama (recovery)", "Yoga Nidra"],
        "description": "Bacterial infection caused by Salmonella typhi affecting the digestive system."
    },
    "malaria": {
        "foods": ["Papaya leaf juice", "Grapefruit", "Citrus fruits", "Ginger tea", "Turmeric milk", "Warm soups"],
        "medicines": ["Artemisinin-based therapy (ACT)", "Chloroquine", "Paracetamol", "Quinine (severe cases)"],
        "ayurvedic": ["Giloy juice", "Neem bark decoction", "Chirata (Swertia chirayita)", "Guduchi"],
        "yoga": ["Rest mostly", "Gentle Pranayama during recovery", "Yoga Nidra"],
        "description": "A mosquito-borne disease caused by Plasmodium parasites."
    },
    "dengue fever": {
        "foods": ["Papaya leaf juice", "Pomegranate juice", "Coconut water", "Kiwi", "Turmeric milk", "Spinach"],
        "medicines": ["Paracetamol (NOT ibuprofen/aspirin)", "ORS", "Platelet transfusion if needed"],
        "ayurvedic": ["Papaya leaf extract (proven to increase platelets)", "Giloy juice", "Amla juice", "Tulsi decoction"],
        "yoga": ["Complete rest during fever", "Yoga Nidra during recovery"],
        "description": "A mosquito-borne viral disease causing high fever and severe body pain."
    },
    "chickenpox": {
        "foods": ["Soft, non-spicy foods", "Yogurt", "Coconut water", "Soups", "Citrus fruits", "Green leafy vegetables"],
        "medicines": ["Acyclovir", "Calamine lotion", "Antihistamines (Cetirizine)", "Paracetamol"],
        "ayurvedic": ["Neem paste on rashes", "Neem leaves bath", "Turmeric paste (topical)", "Giloy + amla juice"],
        "yoga": ["Complete rest", "Gentle Pranayama when recovering"],
        "description": "A highly contagious viral infection causing itchy rash and blisters."
    },

    # === JOINTS/BONE ===
    "arthritis": {
        "foods": ["Turmeric", "Ginger", "Omega-3 (fish)", "Cherries", "Berries", "Leafy greens", "Nuts"],
        "medicines": ["NSAIDs (Ibuprofen)", "Methotrexate", "Hydroxychloroquine", "Corticosteroids"],
        "ayurvedic": ["Shallaki (Boswellia)", "Guggulu", "Ashwagandha", "Nirgundi oil massage", "Castor oil"],
        "yoga": ["Virabhadrasana", "Trikonasana", "Surya Namaskar (gentle)", "Tadasana", "Setu Bandhasana"],
        "description": "Inflammation of joints causing pain and stiffness."
    },
    "back pain": {
        "foods": ["Anti-inflammatory foods", "Turmeric", "Ginger", "Omega-3", "Magnesium-rich foods"],
        "medicines": ["Ibuprofen", "Diclofenac", "Muscle relaxants (Thiocolchicoside)", "Topical pain gels"],
        "ayurvedic": ["Mahanarayan oil massage", "Shallaki churna", "Ashwagandha", "Guggulu", "Kati Basti therapy"],
        "yoga": ["Bhujangasana (Cobra Pose)", "Balasana", "Cat-Cow stretch", "Tadasana", "Setu Bandhasana"],
        "description": "Pain or discomfort in the lower, middle, or upper back."
    },

    # === SKIN ===
    "eczema": {
        "foods": ["Anti-inflammatory diet", "Probiotics", "Omega-3 fatty acids", "Fruits", "Vegetables", "Avoid dairy/gluten"],
        "medicines": ["Topical corticosteroids", "Antihistamines", "Moisturizers", "Tacrolimus ointment"],
        "ayurvedic": ["Neem oil (topical)", "Coconut oil", "Aloe vera gel", "Turmeric + neem paste", "Triphala"],
        "yoga": ["Pranayama", "Meditation", "Stress-reducing yoga", "Yoga Nidra"],
        "description": "A condition that makes skin red, itchy, and inflamed."
    },
    "acne": {
        "foods": ["Low-glycemic diet", "Zinc-rich foods", "Green tea", "Probiotics", "Omega-3", "Avoid dairy/sugar"],
        "medicines": ["Benzoyl peroxide", "Retinoids", "Tetracycline", "Clindamycin gel"],
        "ayurvedic": ["Neem face pack", "Turmeric + sandalwood paste", "Aloe vera gel", "Manjistha powder", "Rose water"],
        "yoga": ["Sarvangasana", "Ustrasana", "Bhujangasana", "Pranayama (detox)"],
        "description": "Skin condition when hair follicles plug with oil and dead skin cells."
    },
    "psoriasis": {
        "foods": ["Anti-inflammatory foods", "Fish (omega-3)", "Olive oil", "Vegetables", "Fruits", "Avoid alcohol/smoking"],
        "medicines": ["Topical corticosteroids", "Methotrexate", "Biologics", "Vitamin D analogues"],
        "ayurvedic": ["Neem oil massage", "Panchatikta ghee", "Mahamanjisthadi kwath", "Turmeric + coconut oil"],
        "yoga": ["Pranayama", "Yoga Nidra", "Meditation", "Stress-relieving asanas"],
        "description": "A skin disease causing scaly patches and itching."
    },

    # === URINARY ===
    "urinary tract infection": {
        "foods": ["Cranberry juice", "Water (2+ liters)", "Probiotics", "Garlic", "Vitamin C foods", "Cucumber"],
        "medicines": ["Nitrofurantoin", "Trimethoprim", "Fosfomycin", "Ciprofloxacin"],
        "ayurvedic": ["Gokshura (Tribulus terrestris)", "Chandan (Sandalwood) water", "Coriander seed water", "Varunadi kwath"],
        "yoga": ["Utkatasana", "Baddha Konasana", "Butterfly pose", "Pranayama"],
        "description": "Infection in the urinary tract, commonly caused by bacteria."
    },
    "kidney stone": {
        "foods": ["Lots of water", "Lemon juice", "Low-salt diet", "Avoid oxalate foods", "Citrate-rich foods"],
        "medicines": ["Tamsulosin", "NSAIDs (for pain)", "Potassium citrate", "Lithotripsy if large"],
        "ayurvedic": ["Pattharchata (Bryophyllum pinnatum)", "Gokshura", "Punarnava", "Varunadi kwath"],
        "yoga": ["Utkatasana", "Baddha Konasana", "Pawanmuktasana", "Surya Namaskar"],
        "description": "Hard deposits made of minerals and salts that form inside kidneys."
    },

    # === OTHER COMMON ===
    "migraine": {
        "foods": ["Magnesium-rich foods", "Ginger tea", "Omega-3", "Avoid tyramine foods (aged cheese, wine)", "Stay hydrated"],
        "medicines": ["Sumatriptan", "Propranolol (preventive)", "Topiramate", "Paracetamol", "Ibuprofen"],
        "ayurvedic": ["Brahmi + Shankhpushpi oil head massage", "Peppermint oil (temples)", "Ginger + honey", "Shirodhara therapy"],
        "yoga": ["Hastapadangusthasana", "Shavasana", "Anulom Vilom", "Bhramari", "Yoga Nidra"],
        "description": "A headache disorder causing intense pulsing pain, often with nausea."
    },
    "thyroid": {
        "foods": ["Iodine-rich foods", "Selenium foods (Brazil nuts)", "Zinc foods", "Leafy greens", "Avoid excess soy"],
        "medicines": ["Levothyroxine (hypothyroid)", "Methimazole (hyperthyroid)", "Regular TSH monitoring"],
        "ayurvedic": ["Ashwagandha", "Guggulu", "Kanchanar Guggulu", "Brahmi", "Jalkumbhi"],
        "yoga": ["Sarvangasana (Shoulder Stand)", "Matsyasana", "Halasana", "Ujjayi Pranayama", "Viparita Karani"],
        "description": "Disorder of the thyroid gland affecting metabolism and energy levels."
    },
    "glaucoma": {
        "foods": ["Leafy greens", "Omega-3 fatty acids", "Vitamin C & E foods", "Carrots", "Nuts"],
        "medicines": ["Timolol eye drops", "Latanoprost", "Dorzolamide", "Surgery if severe"],
        "ayurvedic": ["Triphala eye wash", "Amla juice (Vitamin C)", "Punarnava", "Saptamrita Loha"],
        "yoga": ["Palming exercise", "Eye rotation exercises", "Shavasana", "Yoga Nidra (reduce IOP stress)"],
        "description": "Condition damaging optic nerve, often due to high intraocular pressure."
    },
    "insomnia": {
        "foods": ["Warm milk with honey", "Chamomile tea", "Tart cherry juice", "Almonds", "Kiwi", "Banana"],
        "medicines": ["Melatonin", "Zolpidem (short-term)", "Cognitive Behavioral Therapy for Insomnia (CBT-I)"],
        "ayurvedic": ["Ashwagandha milk at bedtime", "Brahmi + Jatamansi", "Tagara (Valerian)", "Sarpagandha"],
        "yoga": ["Yoga Nidra", "Shavasana", "4-7-8 breathing", "Viparita Karani", "Balasana (Child's Pose)"],
        "description": "Difficulty falling or staying asleep, affecting daily functioning."
    },
    "obesity": {
        "foods": ["High fiber vegetables", "Lean proteins", "Whole grains", "Green tea", "Cucumber", "Low-calorie fruits"],
        "medicines": ["Orlistat", "Metformin (for metabolic syndrome)", "Bariatric surgery (severe cases)"],
        "ayurvedic": ["Triphala churna", "Guggulu", "Garcinia cambogia", "Vijaysar water", "Fenugreek water"],
        "yoga": ["Surya Namaskar (12 rounds)", "Trikonasana", "Virabhadrasana", "Kapalbhati", "Navasana"],
        "description": "Excess body fat accumulation that increases health risk."
    },
    "fever": {
        "foods": ["ORS/Electrolytes", "Coconut water", "Warm soups", "Citrus fruits", "Ginger tea", "Plenty of water"],
        "medicines": ["Paracetamol", "Ibuprofen", "Antipyretics", "Antibiotics (if bacterial)"],
        "ayurvedic": ["Giloy (Guduchi) juice", "Tulsi + black pepper + ginger decoction", "Amla juice", "Neem leaves decoction"],
        "yoga": ["Complete rest", "Gentle Pranayama when improving", "Yoga Nidra"],
        "description": "Elevated body temperature, usually a sign of infection or illness."
    },
    "jaundice": {
        "foods": ["Sugarcane juice", "Lemon water", "Coconut water", "Papaya", "Beets", "Carrots", "Avoid fatty/oily foods"],
        "medicines": ["Ursodeoxycholic acid", "Supportive care", "Treat underlying cause"],
        "ayurvedic": ["Bhumi amla (Phyllanthus niruri)", "Arogyavardhini vati", "Punarnava mandur", "Kalmegh"],
        "yoga": ["Kapalbhati", "Sarvangasana", "Bhujangasana", "Pawanmuktasana", "Avoid inverted poses initially"],
        "description": "Yellowing of skin and eyes due to excess bilirubin."
    },
}

# Default recommendation for unknown diseases
DEFAULT_KNOWLEDGE = {
    "foods": ["Balanced diet with fruits & vegetables", "Plenty of water (2-3 liters/day)", "Whole grains", "Lean proteins", "Avoid junk food"],
    "medicines": ["Consult your doctor for appropriate medication", "Do not self-medicate"],
    "ayurvedic": ["Tulsi tea (general immunity)", "Turmeric milk (Haldi doodh)", "Ashwagandha (general wellness)", "Amla (Vitamin C)", "Triphala (detox)"],
    "yoga": ["Surya Namaskar (12 rounds daily)", "Pranayama (Anulom Vilom)", "Kapalbhati", "Shavasana (relaxation)", "Meditation (20 mins)"],
    "description": "Please consult a qualified healthcare professional for accurate diagnosis and treatment."
}

IMMUNITY_YOGA = [
    {"name": "Surya Namaskar", "desc": "12-pose sun salutation — boosts immunity, metabolism & energy"},
    {"name": "Pranayama (Anulom Vilom)", "desc": "Alternate nostril breathing — balances nervous system"},
    {"name": "Kapalbhati", "desc": "Forceful exhalation — detoxifies lungs, strengthens abdominal organs"},
    {"name": "Bhujangasana (Cobra Pose)", "desc": "Opens chest, strengthens spine, stimulates immune organs"},
    {"name": "Setu Bandhasana (Bridge Pose)", "desc": "Stimulates thyroid, improves circulation"},
    {"name": "Viparita Karani (Legs-up-wall)", "desc": "Boosts lymphatic drainage, reduces stress"},
    {"name": "Yoga Nidra", "desc": "Yogic sleep — deep restoration and immune recovery"},
    {"name": "Bhramari Pranayama", "desc": "Humming bee breath — reduces stress hormones, boosts immunity"},
]

def get_disease_info(disease_name: str) -> dict:
    """Get knowledge base info for a disease, with fuzzy matching"""
    disease_lower = disease_name.lower().strip()
    
    # Direct match
    if disease_lower in DISEASE_KNOWLEDGE:
        return DISEASE_KNOWLEDGE[disease_lower]
    
    # Partial match
    for key in DISEASE_KNOWLEDGE:
        if key in disease_lower or disease_lower in key:
            return DISEASE_KNOWLEDGE[key]
    
    # Keyword match
    keywords = disease_lower.split()
    for key in DISEASE_KNOWLEDGE:
        if any(kw in key for kw in keywords if len(kw) > 3):
            return DISEASE_KNOWLEDGE[key]
    
    return DEFAULT_KNOWLEDGE
