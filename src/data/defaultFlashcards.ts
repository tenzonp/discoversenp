export interface DefaultFlashcard {
  front: string;
  back: string;
  category: string;
}

export const defaultFlashcards: DefaultFlashcard[] = [
  // संविधान (Constitution)
  { front: "नेपालको संविधान कहिले जारी भयो?", back: "२०७२ असोज ३ गते (2015 September 20)", category: "संविधान" },
  { front: "नेपालको संविधान अनुसार कति मौलिक हक छन्?", back: "३१ मौलिक हक", category: "संविधान" },
  { front: "नेपालको राष्ट्रपतिको कार्यकाल कति वर्ष हो?", back: "५ वर्ष", category: "संविधान" },
  { front: "संघीय संसदमा कति सदस्य छन्?", back: "प्रतिनिधि सभामा २७५ र राष्ट्रिय सभामा ५९", category: "संविधान" },
  { front: "नेपालको राष्ट्रिय भाषा के हो?", back: "नेपाली (देवनागरी लिपिमा)", category: "संविधान" },
  
  // भूगोल (Geography)
  { front: "नेपालमा कति प्रदेश छन्?", back: "७ प्रदेश", category: "भूगोल" },
  { front: "नेपालको सबैभन्दा अग्लो हिमाल कुन हो?", back: "सगरमाथा (8,848.86 मिटर)", category: "भूगोल" },
  { front: "नेपालको सबैभन्दा लामो नदी कुन हो?", back: "कर्णाली नदी (507 किमी)", category: "भूगोल" },
  { front: "नेपालको क्षेत्रफल कति हो?", back: "1,47,516 वर्ग किलोमिटर", category: "भूगोल" },
  { front: "नेपालको राजधानी कहाँ हो?", back: "काठमाडौं", category: "भूगोल" },
  { front: "नेपालको सबैभन्दा ठूलो ताल कुन हो?", back: "रारा ताल", category: "भूगोल" },
  
  // सामान्य ज्ञान (General Knowledge)
  { front: "नेपालको राष्ट्रिय खेल के हो?", back: "भलिबल", category: "सामान्य ज्ञान" },
  { front: "नेपालको राष्ट्रिय फूल के हो?", back: "लालीगुराँस (Rhododendron)", category: "सामान्य ज्ञान" },
  { front: "नेपालको राष्ट्रिय पशु के हो?", back: "गाई", category: "सामान्य ज्ञान" },
  { front: "नेपालको राष्ट्रिय पक्षी के हो?", back: "डाँफे (Himalayan Monal)", category: "सामान्य ज्ञान" },
  { front: "नेपालको राष्ट्रिय रङ कुन हो?", back: "क्रिमसन रातो (Crimson Red)", category: "सामान्य ज्ञान" },
  
  // अर्थतन्त्र (Economy)
  { front: "नेपालको मौद्रिक नीति कसले तय गर्छ?", back: "नेपाल राष्ट्र बैंक", category: "अर्थतन्त्र" },
  { front: "नेपालको मुद्रा के हो?", back: "नेपाली रुपैयाँ (NPR)", category: "अर्थतन्त्र" },
  { front: "नेपाल राष्ट्र बैंक कहिले स्थापना भयो?", back: "२०१३ बैशाख १४ गते (1956 April 26)", category: "अर्थतन्त्र" },
  
  // इतिहास (History)
  { front: "नेपाल गणतन्त्र कहिले घोषणा भयो?", back: "२०६५ जेठ १५ गते (2008 May 28)", category: "इतिहास" },
  { front: "नेपालको एकीकरण कसले गरे?", back: "पृथ्वीनारायण शाह", category: "इतिहास" },
  { front: "नेपालमा लोकतन्त्र कहिले आयो?", back: "२००७ साल (1951)", category: "इतिहास" },
  { front: "जनआन्दोलन २ कहिले भयो?", back: "२०६२/६३ (2006)", category: "इतिहास" },
  
  // IELTS Vocabulary
  { front: "Ubiquitous", back: "Present everywhere (सर्वव्यापी)", category: "IELTS" },
  { front: "Pragmatic", back: "Dealing with things sensibly and realistically (व्यावहारिक)", category: "IELTS" },
  { front: "Inevitable", back: "Certain to happen (अपरिहार्य)", category: "IELTS" },
  { front: "Comprehensive", back: "Complete and including everything (व्यापक)", category: "IELTS" },
  { front: "Unprecedented", back: "Never done or known before (अभूतपूर्व)", category: "IELTS" },
];
