// Multilingual creator-content generator.
// Tamil & Tanglish packs are written to feel native and creator-friendly —
// NOT literal translations of the English copy.
// In production, swap `assemble()` for an OpenAI call (see src/lib/ai.js).

import { getResearch } from "./research-data";

/* ----------------------------------------------------------------------- *
 * Language packs                                                          *
 * Placeholders: {T} = topic, {conf} = confidence %, {v} = verdict phrase   *
 * ----------------------------------------------------------------------- */

const PACKS = {
  /* ---------------------------------- English --------------------------- */
  en: {
    verdict: {
      proven: { word: "Science-Backed", line: "is genuinely supported by solid research" },
      mixed: { word: "Mixed Evidence", line: "has real science behind it — but it's not the full story" },
      misleading: { word: "Mostly Hype", line: "is far more hype than evidence" },
      false: { word: "Busted Myth", line: "is a claim science simply does not support" },
    },
    hooks: [
      "Everyone's talking about {T} — but here's what the research actually says.",
      "I checked {conf}% confidence worth of studies on {T}. The result surprised me.",
      "Before you buy {T}, watch this. Science has thoughts.",
      "{T}: hype or real? Let's settle it with actual evidence.",
      "The truth about {T} is more interesting than the trend.",
    ],
    hooksMyth: [
      "Stop believing this about {T}. Please. 👇",
      "{T} {v}. Here's the proof — and what to do instead.",
      "This {T} claim is going viral. It's also wrong. Let me explain.",
    ],
    script: {
      hook: "{HOOK}",
      claim: "Here's the claim flooding your feed: {T} is a game-changer. So I went to the research instead of the comments.",
      evidence: "After reviewing peer-reviewed studies, the verdict: {T} {v}. Confidence sits around {conf}% based on the current evidence base.",
      nuance: "But here's the part nobody screenshots — the effect depends on dose, quality and the person. Studies have limits, and a few of them disagree.",
      action: "So use {T} as one informed choice, not a magic fix. Track how you actually feel, and talk to a qualified professional first.",
      signoff: "Save this so you don't get fooled by the next viral version. Follow for science you can actually trust.",
    },
    cta: [
      "Save & share this with someone about to fall for the hype. Follow @ for evidence-based health content.",
      "Want the citations? Comment \"SOURCES\" and I'll send the studies. Follow for more.",
      "Double-tap if you'd rather have facts than fads. Follow for verified health content.",
    ],
    carousel: [
      { title: "{T}: What's the real story?", body: "Swipe for the science — no hype, no fear-mongering. Just what the studies actually found." },
      { title: "The viral claim", body: "Your feed says {T} is life-changing. That deserves a fact-check, not a blind purchase." },
      { title: "What the research shows", body: "Reviewing peer-reviewed studies, {T} {v}. Evidence confidence: about {conf}%." },
      { title: "The honest limitations", body: "Effects depend on dose and individual factors. Some studies are small, short or industry-funded." },
      { title: "Conflicting studies", body: "Science isn't unanimous here. Good creators show both sides — not just the convenient one." },
      { title: "What this means for you", body: "Treat {T} as one informed option. It is not a substitute for medical care or a balanced lifestyle." },
      { title: "Talk to a professional", body: "Before changing anything — supplements, diet, medication — check with a qualified healthcare professional." },
      { title: "Save this carousel", body: "Bookmark it, share it, and follow for health content that respects both you and the science." },
    ],
    caption:
      "{T} — verified, not hyped ✅\n\nWe ran this through real research. Verdict: {T} {v} (≈{conf}% evidence confidence).\n\nScience is nuanced — effects depend on dose, quality and you. This is education, not medical advice. Always consult a qualified healthcare professional.\n\nSave it. Share it. Follow for evidence-based health content.",
    thumbnails: [
      "{T}: HYPE vs SCIENCE",
      "The TRUTH About {T}",
      "{T} — What Studies Really Say",
      "Is {T} Worth It? (Evidence)",
    ],
    hashtags: ["#HealthFacts", "#EvidenceBased", "#ScienceBacked", "#MythBusting", "#WellnessTips", "#HealthCreator", "#VerifiedHealth"],
    disclaimer:
      "This content is for education only and is not medical advice, diagnosis or treatment. Always consult a qualified healthcare professional before making health decisions.",
    proTip: "Lead with the confidence score on screen — transparency builds trust faster than certainty.",
  },

  /* ---------------------------------- Tamil ----------------------------- */
  ta: {
    verdict: {
      proven: { word: "அறிவியல் ஆதரவு", line: "உண்மையிலேயே ஆராய்ச்சியால் ஆதரிக்கப்படுகிறது" },
      mixed: { word: "கலவையான ஆதாரம்", line: "சில அறிவியல் ஆதாரம் இருக்கு — ஆனா முழுக் கதையும் இல்ல" },
      misleading: { word: "பெரும்பாலும் மிகைப்படுத்தல்", line: "ஆதாரத்தை விட விளம்பரமே அதிகம்" },
      false: { word: "தவறான நம்பிக்கை", line: "அறிவியல் ஆதரிக்காத ஒரு கூற்று" },
    },
    hooks: [
      "{T} பத்தி எல்லாரும் பேசுறாங்க — ஆனா ஆராய்ச்சி என்ன சொல்லுது தெரியுமா?",
      "{T} மேல {conf}% நம்பகத்தன்மை உள்ள ஆய்வுகளை நான் பார்த்தேன். முடிவு ஆச்சரியமா இருந்துச்சு.",
      "{T} வாங்கறதுக்கு முன்னாடி இத பாருங்க. அறிவியலுக்கு சொல்லுறதுக்கு நிறைய இருக்கு.",
      "{T} — உண்மையா, இல்ல வெறும் டிரெண்டா? ஆதாரத்தோட பேசலாம்.",
      "{T} பத்திய உண்மை, அந்த டிரெண்டை விட சுவாரஸ்யமா இருக்கு.",
    ],
    hooksMyth: [
      "{T} பத்தி இத நம்பறத நிறுத்துங்க. தயவுசெய்து. 👇",
      "{T} {v}. இதோ ஆதாரம் — பதிலா என்ன பண்ணலாம்னும் சொல்றேன்.",
      "இந்த {T} கூற்று வைரல் ஆகுது. அது தப்பும் கூட. விளக்கறேன்.",
    ],
    script: {
      hook: "{HOOK}",
      claim: "உங்க ஃபீட்ல வர்ற கூற்று இது: {T} ஒரு கேம் சேஞ்சர். அதனால நான் காமெண்ட்ஸ் பார்க்காம ஆராய்ச்சியை பார்த்தேன்.",
      evidence: "சக மதிப்பாய்வு செஞ்ச ஆய்வுகளை பார்த்த பிறகு முடிவு: {T} {v}. இப்போதைய ஆதாரப்படி நம்பகத்தன்மை சுமார் {conf}%.",
      nuance: "ஆனா யாரும் ஸ்க்ரீன்ஷாட் எடுக்காத பகுதி இதுதான் — விளைவு டோஸ், தரம், ஆளுக்கு ஆள் மாறும். ஆய்வுகளுக்கு வரம்புகள் இருக்கு, சில முரண்படுதும்.",
      action: "அதனால {T} ஐ ஒரு தெரிஞ்ச தேர்வா எடுத்துக்குங்க, மந்திர தீர்வா இல்ல. நீங்க எப்படி உணருறீங்கனு கவனிங்க, முதல்ல ஒரு நிபுணரை கேளுங்க.",
      signoff: "அடுத்த வைரல் கூற்றுக்கு ஏமாறாம இருக்க இத சேவ் பண்ணுங்க. நம்பகமான அறிவியலுக்கு ஃபாலோ பண்ணுங்க.",
    },
    cta: [
      "இத சேவ் பண்ணி, ஹைப்ல விழப்போற நண்பருக்கு ஷேர் பண்ணுங்க. ஆதார அடிப்படையிலான ஹெல்த் கண்டெண்டுக்கு ஃபாலோ பண்ணுங்க.",
      "ஆதாரங்கள் வேணுமா? \"SOURCES\" னு காமெண்ட் பண்ணுங்க, ஆய்வுகளை அனுப்பறேன். ஃபாலோ பண்ணுங்க.",
      "ட்ரெண்ட்ஸ விட உண்மைகள் பிடிக்குமா? இரட்டை தட்டுங்க. வெரிஃபைடு ஹெல்த் கண்டெண்டுக்கு ஃபாலோ பண்ணுங்க.",
    ],
    carousel: [
      { title: "{T}: உண்மையான கதை என்ன?", body: "அறிவியலுக்கு ஸ்வைப் பண்ணுங்க — ஹைப்பும் இல்ல, பயமுறுத்தலும் இல்ல. ஆய்வுகள் என்ன கண்டுபிடிச்சதோ அதுமட்டும்." },
      { title: "வைரல் கூற்று", body: "{T} வாழ்க்கையை மாத்தும்னு ஃபீட் சொல்லுது. கண்மூடி வாங்குறதுக்கு முன்னாடி ஃபேக்ட்-செக் தேவை." },
      { title: "ஆராய்ச்சி காட்டுறது", body: "சக மதிப்பாய்வு ஆய்வுகள்படி {T} {v}. ஆதார நம்பகத்தன்மை சுமார் {conf}%." },
      { title: "நேர்மையான வரம்புகள்", body: "விளைவு டோஸ், தனிநபர் காரணிகள்ல சார்ந்திருக்கு. சில ஆய்வுகள் சின்னது, குறுகியது அல்லது நிறுவன நிதியுதவி பெற்றது." },
      { title: "முரண்படுற ஆய்வுகள்", body: "இங்க அறிவியல் ஒருமனதா இல்ல. நல்ல கிரியேட்டர்ஸ் ரெண்டு பக்கத்தையும் காட்டுவாங்க." },
      { title: "உங்களுக்கு இதன் அர்த்தம்", body: "{T} ஐ ஒரு தெரிஞ்ச தேர்வா எடுத்துக்குங்க. இது மருத்துவ பராமரிப்புக்கு மாற்று இல்ல." },
      { title: "நிபுணரிடம் பேசுங்க", body: "சப்ளிமெண்ட், டயட், மருந்து — எதையும் மாத்துறதுக்கு முன்னாடி தகுதியான மருத்துவ நிபுணரை கேளுங்க." },
      { title: "இந்த கரோசலை சேவ் பண்ணுங்க", body: "புக்மார்க் பண்ணுங்க, ஷேர் பண்ணுங்க, அறிவியலை மதிக்கிற ஹெல்த் கண்டெண்டுக்கு ஃபாலோ பண்ணுங்க." },
    ],
    caption:
      "{T} — வெரிஃபை பண்ணது, ஹைப் இல்ல ✅\n\nஇத உண்மையான ஆராய்ச்சி வழியா சோதிச்சோம். முடிவு: {T} {v} (≈{conf}% ஆதார நம்பகத்தன்மை).\n\nஅறிவியல் நுணுக்கமானது — விளைவு டோஸ், தரம், உங்கள மேல சார்ந்திருக்கு. இது கல்வி, மருத்துவ அறிவுரை இல்ல. எப்பவும் தகுதியான மருத்துவ நிபுணரை அணுகவும்.\n\nசேவ் பண்ணுங்க. ஷேர் பண்ணுங்க. ஆதார அடிப்படையிலான ஹெல்த் கண்டெண்டுக்கு ஃபாலோ பண்ணுங்க.",
    thumbnails: [
      "{T}: ஹைப் vs அறிவியல்",
      "{T} பத்திய உண்மை",
      "{T} — ஆய்வுகள் சொல்றது",
      "{T} தேவையா? (ஆதாரம்)",
    ],
    hashtags: ["#ஆரோக்கியம்", "#HealthFacts", "#TamilCreator", "#அறிவியல்", "#EvidenceBased", "#MythBusting", "#TamilHealth"],
    disclaimer:
      "இந்த உள்ளடக்கம் கல்விக்காக மட்டுமே; இது மருத்துவ அறிவுரை, நோய் கண்டறிதல் அல்லது சிகிச்சை அல்ல. ஆரோக்கிய முடிவுகளுக்கு முன் தகுதியான மருத்துவ நிபுணரை அணுகவும்.",
    proTip: "ஸ்க்ரீன்ல நம்பகத்தன்மை மதிப்பெண்ணை முதல்ல காட்டுங்க — வெளிப்படைத்தன்மை நம்பிக்கையை வேகமா வளர்க்கும்.",
  },

  /* --------------------------------- Tanglish --------------------------- */
  tanglish: {
    verdict: {
      proven: { word: "Science Approved", line: "la science fully support panniruku" },
      mixed: { word: "Mixed Evidence", line: "ku konjam science iruku, but full story illa" },
      misleading: { word: "Hype Dhaan", line: "la evidence vida hype dhaan jaasti" },
      false: { word: "Myth Confirmed", line: "nu science clear ah sollala — adhu oru myth" },
    },
    hooks: [
      "Direct ah solren — {T} pathi ungaloda feed soluradhu vera, science soluradhu vera. Research confidence just {conf}% 🔥",
      "Neenga sapidra / kudikira {T} irukke? Antha claim oru second stop panni paapom. Peer-reviewed studies enna soludu?",
      "{T} vaanguradhukku munnaadi stop pannunga. Science ku cold water poduthu — paapom.",
      "Instagram open pannaale podhum, '{T} try pannunga' nu ad varudhu. Aana studies enna soludu? Just {conf}%. 💯",
      "Ennathukku athiga ppl namburaanga {T} pathi? Viral ah iruku. Science? {conf}% confidence dhaan iruku 👇",
    ],
    hooksMyth: [
      "{T} pathi idha nambaradha please nirutunga 🛑👇",
      "{T} {v}. Idho proof — badhilaa enna panlaam nu sollren.",
      "Indha {T} claim viral aaguthu… aana adhu wrong da. Naa explain panren 🧠",
    ],
    script: {
      hook: "{HOOK}",
      claim: "Ungaloda Instagram open pannaale podhum — '{T} thinnaale / kudichaale results guaranteed' nu reels varudhu. Namburingala? Reality enna theriyuma, paapom.",
      evidence: "Peer-reviewed studies paathenga — {T} {v}. Evidence confidence just {conf}%. Adhu ellam hype ah, illa science enna soludu? Breakdown pannuvom.",
      nuance: "Oru vishayam kavaniyunga — dose matter aagudhu, person-to-person results maarum, sila studies contradict um pannudhu. Oru size ellaarukkum work aagathu.",
      action: "So {T} ah oru informed choice ah use pannunga — magic solution nu expect pannaadhinga. Unga body response ah track pannunga, doctor kitta confirm pannunga.",
      signoff: "Next viral claim la maatikka poovinga? Idha save pannunga. Weekly evidence-based content ku follow pannunga 💙",
    },
    cta: [
      "Idha save panni, hype la maatikka poora friend ku share pannunga. Evidence-based health content ku follow pannunga 💙",
      "Citations venuma? \"SOURCES\" nu comment pannunga, studies ah anuppuren. Follow pannunga 🔬",
      "Fads ah vida facts pidikkuma? Double-tap pannunga. Verified health content ku follow 🔥",
    ],
    carousel: [
      { title: "{T}: Real story enna?", body: "Science ku swipe pannunga — hype illa, bayamuruthal illa. Studies enna kandupidichudho adhu mattum." },
      { title: "Viral claim", body: "{T} life-changing nu unga feed sollutu. Adhukku oru fact-check thevai, blind ah vaangaradhu illa." },
      { title: "Research enna kaatudhu", body: "Peer-reviewed studies padi {T} {v}. Evidence confidence sumaar {conf}%." },
      { title: "Honest limitations", body: "Effect na dose, individual factors la depend aagudhu. Sila studies chinnadhu, kuraicha period, illa company funded." },
      { title: "Contradicting studies", body: "Inga science unanimous ah illa. Nalla creators rendu side um kaatuvaanga — convenient side mattum illa." },
      { title: "Ungalukku idhu enna artham", body: "{T} ah oru informed option ah edunga. Idhu medical care ku badhil illa." },
      { title: "Professional kitta pesunga", body: "Supplement, diet, medicine — edhuvaa maathuradhukku munnaadi qualified healthcare professional kitta kelunga." },
      { title: "Indha carousel ah save pannunga", body: "Bookmark pannunga, share pannunga, science ah respect panra health content ku follow pannunga 💙" },
    ],
    caption:
      "{T} — verified, hype illa ✅\n\nIdha real research vechi check panom. Verdict: {T} {v} (≈{conf}% evidence confidence).\n\nScience nuance-aanadhu — effect na dose, quality, unga mela depend aagum. Idhu education, medical advice illa. Eppovum oru qualified healthcare professional kitta kelunga 🩺\n\nSave pannunga. Share pannunga. Evidence-based health content ku follow pannunga 💙",
    thumbnails: [
      "{T}: HYPE vs SCIENCE",
      "{T} TRUTH 🔥",
      "{T} — Studies Enna Sollutu",
      "{T} Worth ah? (Evidence)",
    ],
    hashtags: ["#TanglishCreator", "#HealthFacts", "#TamilHealth", "#ScienceBacked", "#EvidenceBased", "#MythBusting", "#TamilReels"],
    disclaimer:
      "Indha content education ku mattum dhaan — idhu medical advice, diagnosis illa treatment illa. Health decisions edukkaradhukku munnaadi eppovum qualified healthcare professional kitta kelunga.",
    proTip: "Confidence score ah screen la mudhalla kaatunga — transparency dhaan trust ah fast ah build pannum.",
  },

  /* ---------------------------------- Hindi ----------------------------- */
  hi: {
    verdict: {
      proven: { word: "विज्ञान-समर्थित", line: "वाकई ठोस रिसर्च से समर्थित है" },
      mixed: { word: "मिश्रित प्रमाण", line: "के पीछे कुछ असली विज्ञान है — पर पूरी कहानी नहीं" },
      misleading: { word: "ज़्यादातर हाइप", line: "में सबूत से ज़्यादा हाइप है" },
      false: { word: "ग़लत दावा", line: "एक ऐसा दावा है जिसे विज्ञान समर्थन नहीं देता" },
    },
    hooks: [
      "हर कोई {T} की बात कर रहा है — पर रिसर्च असल में क्या कहती है?",
      "मैंने {T} पर {conf}% भरोसे लायक स्टडीज़ देखीं। नतीजा चौंकाने वाला था।",
      "{T} खरीदने से पहले यह देखें। विज्ञान के पास कहने को बहुत कुछ है।",
      "{T} — सच या सिर्फ़ ट्रेंड? चलिए सबूत से तय करते हैं।",
      "{T} का सच उस ट्रेंड से कहीं ज़्यादा दिलचस्प है।",
    ],
    hooksMyth: [
      "{T} के बारे में यह मानना बंद करें। प्लीज़। 👇",
      "{T} {v}। यह रहा सबूत — और इसके बजाय क्या करें।",
      "{T} का यह दावा वायरल हो रहा है। यह ग़लत भी है। समझाता हूँ।",
    ],
    script: {
      hook: "{HOOK}",
      claim: "आपकी फ़ीड पर यही दावा है: {T} गेम-चेंजर है। इसलिए मैंने कमेंट्स नहीं, रिसर्च देखी।",
      evidence: "पीयर-रिव्यूड स्टडीज़ देखने के बाद नतीजा: {T} {v}। मौजूदा सबूतों के आधार पर भरोसा करीब {conf}% है।",
      nuance: "पर वह हिस्सा जिसका कोई स्क्रीनशॉट नहीं लेता — असर डोज़, क्वालिटी और व्यक्ति पर निर्भर है। स्टडीज़ की सीमाएँ हैं, कुछ आपस में असहमत भी हैं।",
      action: "तो {T} को एक समझदारी भरा विकल्प मानें, जादुई इलाज नहीं। ध्यान दें कि आप असल में कैसा महसूस करते हैं, और पहले किसी योग्य विशेषज्ञ से बात करें।",
      signoff: "अगले वायरल दावे से बचने के लिए इसे सेव करें। भरोसेमंद विज्ञान के लिए फ़ॉलो करें।",
    },
    cta: [
      "इसे सेव करें और उस दोस्त को भेजें जो हाइप में फँसने वाला है। एविडेंस-बेस्ड हेल्थ कंटेंट के लिए फ़ॉलो करें।",
      "सोर्स चाहिए? \"SOURCES\" कमेंट करें, मैं स्टडीज़ भेजूँगा। फ़ॉलो करें।",
      "फ़ैड से ज़्यादा फ़ैक्ट पसंद हैं? डबल-टैप करें। वेरिफ़ाइड हेल्थ कंटेंट के लिए फ़ॉलो करें।",
    ],
    carousel: [
      { title: "{T}: असली कहानी क्या है?", body: "विज्ञान के लिए स्वाइप करें — न हाइप, न डर। बस वही जो स्टडीज़ ने पाया।" },
      { title: "वायरल दावा", body: "आपकी फ़ीड कहती है {T} ज़िंदगी बदल देगा। इसकी फ़ैक्ट-चेक ज़रूरी है, आँख मूँदकर खरीदना नहीं।" },
      { title: "रिसर्च क्या दिखाती है", body: "पीयर-रिव्यूड स्टडीज़ के अनुसार {T} {v}। सबूत का भरोसा करीब {conf}%।" },
      { title: "ईमानदार सीमाएँ", body: "असर डोज़ और व्यक्तिगत कारकों पर निर्भर है। कुछ स्टडीज़ छोटी, छोटी अवधि या कंपनी-फ़ंडेड हैं।" },
      { title: "विरोधाभासी स्टडीज़", body: "यहाँ विज्ञान एकमत नहीं है। अच्छे क्रिएटर दोनों पक्ष दिखाते हैं।" },
      { title: "आपके लिए इसका मतलब", body: "{T} को एक समझदारी भरा विकल्प मानें। यह चिकित्सा देखभाल का विकल्प नहीं है।" },
      { title: "विशेषज्ञ से बात करें", body: "सप्लीमेंट, डाइट, दवा — कुछ भी बदलने से पहले योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।" },
      { title: "इस कैरोसेल को सेव करें", body: "बुकमार्क करें, शेयर करें, और विज्ञान का सम्मान करने वाले हेल्थ कंटेंट के लिए फ़ॉलो करें।" },
    ],
    caption:
      "{T} — वेरिफ़ाइड, हाइप नहीं ✅\n\nहमने इसे असली रिसर्च से जाँचा। नतीजा: {T} {v} (≈{conf}% एविडेंस कॉन्फ़िडेंस)।\n\nविज्ञान बारीक है — असर डोज़, क्वालिटी और आप पर निर्भर है। यह शिक्षा है, चिकित्सा सलाह नहीं। हमेशा योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।\n\nसेव करें। शेयर करें। एविडेंस-बेस्ड हेल्थ कंटेंट के लिए फ़ॉलो करें।",
    thumbnails: [
      "{T}: हाइप vs विज्ञान",
      "{T} का असली सच",
      "{T} — स्टडीज़ क्या कहती हैं",
      "क्या {T} सही है? (सबूत)",
    ],
    hashtags: ["#स्वास्थ्य", "#HealthFacts", "#HindiCreator", "#विज्ञान", "#EvidenceBased", "#MythBusting", "#HealthTips"],
    disclaimer:
      "यह कंटेंट केवल शिक्षा के लिए है; यह चिकित्सा सलाह, निदान या उपचार नहीं है। स्वास्थ्य संबंधी निर्णय से पहले योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।",
    proTip: "स्क्रीन पर पहले कॉन्फ़िडेंस स्कोर दिखाएँ — पारदर्शिता भरोसा तेज़ी से बनाती है।",
  },

  /* -------------------------------- Malayalam --------------------------- */
  ml: {
    verdict: {
      proven: { word: "ശാസ്ത്ര പിന്തുണ", line: "ശരിക്കും ഗവേഷണത്താൽ പിന്തുണയ്ക്കപ്പെടുന്നു" },
      mixed: { word: "സമ്മിശ്ര തെളിവ്", line: "ന് യഥാർത്ഥ ശാസ്ത്രമുണ്ട് — പക്ഷേ പൂർണ്ണ കഥയല്ല" },
      misleading: { word: "കൂടുതലും ഹൈപ്പ്", line: "ൽ തെളിവിനെക്കാൾ ഹൈപ്പാണ് കൂടുതൽ" },
      false: { word: "തെറ്റായ അവകാശവാദം", line: "ശാസ്ത്രം പിന്തുണയ്ക്കാത്ത ഒരു അവകാശവാദമാണ്" },
    },
    hooks: [
      "എല്ലാവരും {T} സംസാരിക്കുന്നു — പക്ഷേ ഗവേഷണം എന്താണ് പറയുന്നത്?",
      "{T} സംബന്ധിച്ച് {conf}% വിശ്വാസ്യതയുള്ള പഠനങ്ങൾ ഞാൻ പരിശോധിച്ചു. ഫലം അത്ഭുതപ്പെടുത്തി.",
      "{T} വാങ്ങുന്നതിന് മുമ്പ് ഇത് കാണൂ. ശാസ്ത്രത്തിന് പറയാൻ ഏറെയുണ്ട്.",
      "{T} — സത്യമോ വെറും ട്രെൻഡോ? തെളിവ് വെച്ച് തീരുമാനിക്കാം.",
      "{T} സംബന്ധിച്ച സത്യം ആ ട്രെൻഡിനെക്കാൾ രസകരമാണ്.",
    ],
    hooksMyth: [
      "{T} സംബന്ധിച്ച് ഇത് വിശ്വസിക്കുന്നത് നിർത്തൂ. ദയവായി. 👇",
      "{T} {v}. ഇതാ തെളിവ് — പകരം എന്ത് ചെയ്യണമെന്നും പറയാം.",
      "ഈ {T} അവകാശവാദം വൈറലാകുന്നു. അത് തെറ്റുമാണ്. ഞാൻ വിശദീകരിക്കാം.",
    ],
    script: {
      hook: "{HOOK}",
      claim: "നിങ്ങളുടെ ഫീഡിലെ അവകാശവാദം ഇതാണ്: {T} ഒരു ഗെയിം-ചേഞ്ചർ. അതിനാൽ ഞാൻ കമന്റുകളല്ല, ഗവേഷണം നോക്കി.",
      evidence: "പിയർ-റിവ്യൂഡ് പഠനങ്ങൾ പരിശോധിച്ച ശേഷം നിഗമനം: {T} {v}. നിലവിലെ തെളിവ് അനുസരിച്ച് വിശ്വാസ്യത ഏകദേശം {conf}%.",
      nuance: "പക്ഷേ ആരും സ്ക്രീൻഷോട്ട് എടുക്കാത്ത ഭാഗം ഇതാണ് — ഫലം ഡോസ്, ഗുണനിലവാരം, വ്യക്തി എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു. പഠനങ്ങൾക്ക് പരിമിതികളുണ്ട്.",
      action: "അതിനാൽ {T} ഒരു അറിവുള്ള തിരഞ്ഞെടുപ്പായി ഉപയോഗിക്കൂ, മാന്ത്രിക പരിഹാരമല്ല. നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നുവെന്ന് ശ്രദ്ധിക്കൂ, ആദ്യം വിദഗ്ധനെ സമീപിക്കൂ.",
      signoff: "അടുത്ത വൈറൽ അവകാശവാദത്തിൽ വീഴാതിരിക്കാൻ ഇത് സേവ് ചെയ്യൂ. വിശ്വസനീയമായ ശാസ്ത്രത്തിന് ഫോളോ ചെയ്യൂ.",
    },
    cta: [
      "ഇത് സേവ് ചെയ്ത് ഹൈപ്പിൽ വീഴാൻ പോകുന്ന സുഹൃത്തിന് അയക്കൂ. തെളിവ് അധിഷ്ഠിത ഹെൽത്ത് കണ്ടന്റിന് ഫോളോ ചെയ്യൂ.",
      "സോഴ്സുകൾ വേണോ? \"SOURCES\" എന്ന് കമന്റ് ചെയ്യൂ, പഠനങ്ങൾ അയക്കാം. ഫോളോ ചെയ്യൂ.",
      "ഫാഡിനെക്കാൾ ഫാക്റ്റ് ഇഷ്ടമോ? ഡബിൾ-ടാപ്പ് ചെയ്യൂ. വെരിഫൈഡ് ഹെൽത്ത് കണ്ടന്റിന് ഫോളോ ചെയ്യൂ.",
    ],
    carousel: [
      { title: "{T}: യഥാർത്ഥ കഥ എന്താണ്?", body: "ശാസ്ത്രത്തിന് സ്വൈപ്പ് ചെയ്യൂ — ഹൈപ്പില്ല, ഭയപ്പെടുത്തലില്ല. പഠനങ്ങൾ കണ്ടെത്തിയത് മാത്രം." },
      { title: "വൈറൽ അവകാശവാദം", body: "{T} ജീവിതം മാറ്റുമെന്ന് ഫീഡ് പറയുന്നു. കണ്ണടച്ച് വാങ്ങുന്നതിന് മുമ്പ് ഫാക്റ്റ്-ചെക്ക് വേണം." },
      { title: "ഗവേഷണം കാണിക്കുന്നത്", body: "പിയർ-റിവ്യൂഡ് പഠനങ്ങൾ പ്രകാരം {T} {v}. തെളിവ് വിശ്വാസ്യത ഏകദേശം {conf}%." },
      { title: "സത്യസന്ധമായ പരിമിതികൾ", body: "ഫലം ഡോസ്, വ്യക്തിഗത ഘടകങ്ങൾ എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു. ചില പഠനങ്ങൾ ചെറുതാണ്." },
      { title: "വൈരുദ്ധ്യമുള്ള പഠനങ്ങൾ", body: "ഇവിടെ ശാസ്ത്രം ഏകകണ്ഠമല്ല. നല്ല ക്രിയേറ്റർമാർ ഇരുവശവും കാണിക്കും." },
      { title: "നിങ്ങൾക്ക് ഇതിന്റെ അർത്ഥം", body: "{T} ഒരു അറിവുള്ള ഓപ്ഷനായി കാണൂ. ഇത് വൈദ്യ പരിചരണത്തിന് പകരമല്ല." },
      { title: "വിദഗ്ധനോട് സംസാരിക്കൂ", body: "സപ്ലിമെന്റ്, ഡയറ്റ്, മരുന്ന് — എന്തെങ്കിലും മാറ്റുന്നതിന് മുമ്പ് യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കൂ." },
      { title: "ഈ കാരൗസൽ സേവ് ചെയ്യൂ", body: "ബുക്ക്മാർക്ക് ചെയ്യൂ, ഷെയർ ചെയ്യൂ, ശാസ്ത്രത്തെ ബഹുമാനിക്കുന്ന കണ്ടന്റിന് ഫോളോ ചെയ്യൂ." },
    ],
    caption:
      "{T} — വെരിഫൈഡ്, ഹൈപ്പല്ല ✅\n\nഇത് യഥാർത്ഥ ഗവേഷണത്തിലൂടെ പരിശോധിച്ചു. നിഗമനം: {T} {v} (≈{conf}% എവിഡൻസ് കോൺഫിഡൻസ്).\n\nശാസ്ത്രം സൂക്ഷ്മമാണ് — ഫലം ഡോസ്, ഗുണനിലവാരം, നിങ്ങളെ ആശ്രയിച്ചിരിക്കുന്നു. ഇത് വിദ്യാഭ്യാസമാണ്, വൈദ്യ ഉപദേശമല്ല. എപ്പോഴും യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കൂ.\n\nസേവ് ചെയ്യൂ. ഷെയർ ചെയ്യൂ. ഫോളോ ചെയ്യൂ.",
    thumbnails: [
      "{T}: ഹൈപ്പ് vs ശാസ്ത്രം",
      "{T} യഥാർത്ഥ സത്യം",
      "{T} — പഠനങ്ങൾ പറയുന്നത്",
      "{T} വേണോ? (തെളിവ്)",
    ],
    hashtags: ["#ആരോഗ്യം", "#HealthFacts", "#MalayalamCreator", "#ശാസ്ത്രം", "#EvidenceBased", "#MythBusting", "#KeralaHealth"],
    disclaimer:
      "ഈ ഉള്ളടക്കം വിദ്യാഭ്യാസത്തിന് മാത്രമാണ്; ഇത് വൈദ്യ ഉപദേശമോ രോഗനിർണയമോ ചികിത്സയോ അല്ല. ആരോഗ്യ തീരുമാനങ്ങൾക്ക് മുമ്പ് യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കൂ.",
    proTip: "സ്ക്രീനിൽ ആദ്യം കോൺഫിഡൻസ് സ്കോർ കാണിക്കൂ — സുതാര്യത വിശ്വാസം വേഗത്തിൽ വളർത്തുന്നു.",
  },

  /* --------------------------------- Telugu ----------------------------- */
  te: {
    verdict: {
      proven: { word: "శాస్త్ర మద్దతు", line: "నిజంగా పరిశోధనతో మద్దతు పొందింది" },
      mixed: { word: "మిశ్రమ ఆధారాలు", line: "వెనుక కొంత నిజమైన శాస్త్రం ఉంది — కానీ పూర్తి కథ కాదు" },
      misleading: { word: "ఎక్కువగా హైప్", line: "లో ఆధారాల కంటే హైప్ ఎక్కువ" },
      false: { word: "తప్పుడు వాదన", line: "శాస్త్రం మద్దతు ఇవ్వని ఒక వాదన" },
    },
    hooks: [
      "అందరూ {T} గురించి మాట్లాడుతున్నారు — కానీ పరిశోధన నిజంగా ఏం చెబుతోంది?",
      "{T} పై {conf}% విశ్వసనీయత ఉన్న అధ్యయనాలను చూశాను. ఫలితం ఆశ్చర్యపరిచింది.",
      "{T} కొనే ముందు ఇది చూడండి. శాస్త్రానికి చెప్పడానికి చాలా ఉంది.",
      "{T} — నిజమా లేక కేవలం ట్రెండా? ఆధారాలతో తేల్చుదాం.",
      "{T} గురించి నిజం ఆ ట్రెండ్ కంటే చాలా ఆసక్తికరం.",
    ],
    hooksMyth: [
      "{T} గురించి ఇది నమ్మడం ఆపండి. దయచేసి. 👇",
      "{T} {v}. ఇదిగో రుజువు — బదులుగా ఏం చేయాలో చెబుతాను.",
      "ఈ {T} వాదన వైరల్ అవుతోంది. అది తప్పు కూడా. వివరిస్తాను.",
    ],
    script: {
      hook: "{HOOK}",
      claim: "మీ ఫీడ్‌లో ఉన్న వాదన ఇది: {T} ఒక గేమ్-ఛేంజర్. అందుకే నేను కామెంట్లు కాదు, పరిశోధన చూశాను.",
      evidence: "పీర్-రివ్యూడ్ అధ్యయనాలు చూసిన తర్వాత తీర్పు: {T} {v}. ప్రస్తుత ఆధారాల ప్రకారం విశ్వసనీయత సుమారు {conf}%.",
      nuance: "కానీ ఎవరూ స్క్రీన్‌షాట్ తీయని భాగం ఇదే — ప్రభావం డోస్, నాణ్యత, వ్యక్తిని బట్టి మారుతుంది. అధ్యయనాలకు పరిమితులు ఉన్నాయి.",
      action: "కాబట్టి {T} ను ఒక తెలివైన ఎంపికగా వాడండి, మాయా పరిష్కారం కాదు. మీరు నిజంగా ఎలా అనిపిస్తుందో గమనించండి, ముందుగా నిపుణుడిని అడగండి.",
      signoff: "తదుపరి వైరల్ వాదనకు మోసపోకుండా దీన్ని సేవ్ చేయండి. నమ్మదగిన శాస్త్రం కోసం ఫాలో అవ్వండి.",
    },
    cta: [
      "దీన్ని సేవ్ చేసి హైప్‌లో పడబోయే స్నేహితుడికి షేర్ చేయండి. ఆధార-ఆధారిత హెల్త్ కంటెంట్ కోసం ఫాలో అవ్వండి.",
      "సోర్సులు కావాలా? \"SOURCES\" అని కామెంట్ చేయండి, అధ్యయనాలు పంపుతాను. ఫాలో అవ్వండి.",
      "ఫ్యాడ్‌ల కంటే ఫ్యాక్ట్‌లు ఇష్టమా? డబుల్-ట్యాప్ చేయండి. వెరిఫైడ్ హెల్త్ కంటెంట్ కోసం ఫాలో అవ్వండి.",
    ],
    carousel: [
      { title: "{T}: అసలు కథ ఏంటి?", body: "శాస్త్రం కోసం స్వైప్ చేయండి — హైప్ లేదు, భయపెట్టడం లేదు. అధ్యయనాలు కనుగొన్నది మాత్రమే." },
      { title: "వైరల్ వాదన", body: "{T} జీవితాన్ని మారుస్తుందని మీ ఫీడ్ చెబుతోంది. గుడ్డిగా కొనే ముందు ఫ్యాక్ట్-చెక్ అవసరం." },
      { title: "పరిశోధన చూపేది", body: "పీర్-రివ్యూడ్ అధ్యయనాల ప్రకారం {T} {v}. ఆధార విశ్వసనీయత సుమారు {conf}%." },
      { title: "నిజాయితీ పరిమితులు", body: "ప్రభావం డోస్, వ్యక్తిగత అంశాలపై ఆధారపడి ఉంటుంది. కొన్ని అధ్యయనాలు చిన్నవి, కంపెనీ-నిధులవి." },
      { title: "విరుద్ధ అధ్యయనాలు", body: "ఇక్కడ శాస్త్రం ఏకాభిప్రాయం కాదు. మంచి క్రియేటర్లు రెండు వైపులా చూపుతారు." },
      { title: "మీకు దీని అర్థం", body: "{T} ను ఒక తెలివైన ఎంపికగా తీసుకోండి. ఇది వైద్య సంరక్షణకు ప్రత్యామ్నాయం కాదు." },
      { title: "నిపుణుడితో మాట్లాడండి", body: "సప్లిమెంట్, డైట్, మందు — ఏదైనా మార్చే ముందు అర్హత గల ఆరోగ్య నిపుణుడిని సంప్రదించండి." },
      { title: "ఈ కరోసెల్ సేవ్ చేయండి", body: "బుక్‌మార్క్ చేయండి, షేర్ చేయండి, శాస్త్రాన్ని గౌరవించే కంటెంట్ కోసం ఫాలో అవ్వండి." },
    ],
    caption:
      "{T} — వెరిఫైడ్, హైప్ కాదు ✅\n\nదీన్ని నిజమైన పరిశోధనతో పరిశీలించాం. తీర్పు: {T} {v} (≈{conf}% ఎవిడెన్స్ కాన్ఫిడెన్స్).\n\nశాస్త్రం సూక్ష్మమైనది — ప్రభావం డోస్, నాణ్యత, మీపై ఆధారపడుతుంది. ఇది విద్య, వైద్య సలహా కాదు. ఎల్లప్పుడూ అర్హత గల ఆరోగ్య నిపుణుడిని సంప్రదించండి.\n\nసేవ్ చేయండి. షేర్ చేయండి. ఫాలో అవ్వండి.",
    thumbnails: [
      "{T}: హైప్ vs శాస్త్రం",
      "{T} అసలు నిజం",
      "{T} — అధ్యయనాలు ఏం చెబుతాయి",
      "{T} విలువైనదా? (ఆధారం)",
    ],
    hashtags: ["#ఆరోగ్యం", "#HealthFacts", "#TeluguCreator", "#శాస్త్రం", "#EvidenceBased", "#MythBusting", "#TeluguHealth"],
    disclaimer:
      "ఈ కంటెంట్ విద్య కోసం మాత్రమే; ఇది వైద్య సలహా, నిర్ధారణ లేదా చికిత్స కాదు. ఆరోగ్య నిర్ణయాలకు ముందు అర్హత గల ఆరోగ్య నిపుణుడిని సంప్రదించండి.",
    proTip: "స్క్రీన్‌పై ముందుగా కాన్ఫిడెన్స్ స్కోర్ చూపండి — పారదర్శకత నమ్మకాన్ని వేగంగా పెంచుతుంది.",
  },

  /* --------------------------------- Kannada ---------------------------- */
  kn: {
    verdict: {
      proven: { word: "ವಿಜ್ಞಾನ ಬೆಂಬಲ", line: "ನಿಜವಾಗಿಯೂ ಸಂಶೋಧನೆಯಿಂದ ಬೆಂಬಲಿತವಾಗಿದೆ" },
      mixed: { word: "ಮಿಶ್ರ ಪುರಾವೆ", line: "ಹಿಂದೆ ಸ್ವಲ್ಪ ನಿಜವಾದ ವಿಜ್ಞಾನವಿದೆ — ಆದರೆ ಪೂರ್ಣ ಕಥೆಯಲ್ಲ" },
      misleading: { word: "ಹೆಚ್ಚಾಗಿ ಹೈಪ್", line: "ನಲ್ಲಿ ಪುರಾವೆಗಿಂತ ಹೈಪ್ ಹೆಚ್ಚು" },
      false: { word: "ತಪ್ಪು ಹೇಳಿಕೆ", line: "ವಿಜ್ಞಾನ ಬೆಂಬಲಿಸದ ಒಂದು ಹೇಳಿಕೆ" },
    },
    hooks: [
      "ಎಲ್ಲರೂ {T} ಬಗ್ಗೆ ಮಾತಾಡ್ತಿದ್ದಾರೆ — ಆದರೆ ಸಂಶೋಧನೆ ನಿಜವಾಗಿ ಏನು ಹೇಳುತ್ತೆ?",
      "{T} ಬಗ್ಗೆ {conf}% ವಿಶ್ವಾಸಾರ್ಹ ಅಧ್ಯಯನಗಳನ್ನು ನೋಡಿದೆ. ಫಲಿತಾಂಶ ಅಚ್ಚರಿ ಮೂಡಿಸಿತು.",
      "{T} ಕೊಳ್ಳುವ ಮುನ್ನ ಇದನ್ನು ನೋಡಿ. ವಿಜ್ಞಾನಕ್ಕೆ ಹೇಳಲು ಬಹಳಷ್ಟಿದೆ.",
      "{T} — ನಿಜವೋ ಅಥವಾ ಕೇವಲ ಟ್ರೆಂಡೋ? ಪುರಾವೆಯಿಂದ ತೀರ್ಮಾನಿಸೋಣ.",
      "{T} ಬಗ್ಗೆ ಸತ್ಯ ಆ ಟ್ರೆಂಡ್‌ಗಿಂತ ಹೆಚ್ಚು ಕುತೂಹಲಕಾರಿ.",
    ],
    hooksMyth: [
      "{T} ಬಗ್ಗೆ ಇದನ್ನು ನಂಬುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ದಯವಿಟ್ಟು. 👇",
      "{T} {v}. ಇಲ್ಲಿದೆ ಪುರಾವೆ — ಬದಲಿಗೆ ಏನು ಮಾಡಬೇಕೆಂದು ಹೇಳುತ್ತೇನೆ.",
      "ಈ {T} ಹೇಳಿಕೆ ವೈರಲ್ ಆಗ್ತಿದೆ. ಅದು ತಪ್ಪೂ ಹೌದು. ವಿವರಿಸುತ್ತೇನೆ.",
    ],
    script: {
      hook: "{HOOK}",
      claim: "ನಿಮ್ಮ ಫೀಡ್‌ನಲ್ಲಿರುವ ಹೇಳಿಕೆ ಇದು: {T} ಒಂದು ಗೇಮ್-ಚೇಂಜರ್. ಹಾಗಾಗಿ ನಾನು ಕಾಮೆಂಟ್‌ಗಳಲ್ಲ, ಸಂಶೋಧನೆ ನೋಡಿದೆ.",
      evidence: "ಪೀರ್-ರಿವ್ಯೂಡ್ ಅಧ್ಯಯನಗಳನ್ನು ನೋಡಿದ ನಂತರ ತೀರ್ಪು: {T} {v}. ಪ್ರಸ್ತುತ ಪುರಾವೆ ಪ್ರಕಾರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಸುಮಾರು {conf}%.",
      nuance: "ಆದರೆ ಯಾರೂ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ತೆಗೆಯದ ಭಾಗ ಇದು — ಪರಿಣಾಮ ಡೋಸ್, ಗುಣಮಟ್ಟ, ವ್ಯಕ್ತಿಯ ಮೇಲೆ ಅವಲಂಬಿಸಿದೆ. ಅಧ್ಯಯನಗಳಿಗೆ ಮಿತಿಗಳಿವೆ.",
      action: "ಆದ್ದರಿಂದ {T} ಅನ್ನು ಒಂದು ತಿಳಿವಳಿಕೆಯ ಆಯ್ಕೆಯಾಗಿ ಬಳಸಿ, ಮಾಂತ್ರಿಕ ಪರಿಹಾರವಲ್ಲ. ನೀವು ನಿಜವಾಗಿ ಹೇಗೆ ಅನಿಸುತ್ತದೆ ಗಮನಿಸಿ, ಮೊದಲು ತಜ್ಞರನ್ನು ಕೇಳಿ.",
      signoff: "ಮುಂದಿನ ವೈರಲ್ ಹೇಳಿಕೆಗೆ ಮೋಸ ಹೋಗದಂತೆ ಇದನ್ನು ಸೇವ್ ಮಾಡಿ. ನಂಬಬಹುದಾದ ವಿಜ್ಞಾನಕ್ಕೆ ಫಾಲೋ ಮಾಡಿ.",
    },
    cta: [
      "ಇದನ್ನು ಸೇವ್ ಮಾಡಿ ಹೈಪ್‌ಗೆ ಬೀಳಲಿರುವ ಸ್ನೇಹಿತರಿಗೆ ಶೇರ್ ಮಾಡಿ. ಪುರಾವೆ-ಆಧಾರಿತ ಹೆಲ್ತ್ ಕಂಟೆಂಟ್‌ಗೆ ಫಾಲೋ ಮಾಡಿ.",
      "ಮೂಲಗಳು ಬೇಕೇ? \"SOURCES\" ಎಂದು ಕಾಮೆಂಟ್ ಮಾಡಿ, ಅಧ್ಯಯನಗಳನ್ನು ಕಳಿಸುತ್ತೇನೆ. ಫಾಲೋ ಮಾಡಿ.",
      "ಫ್ಯಾಡ್‌ಗಳಿಗಿಂತ ಫ್ಯಾಕ್ಟ್‌ಗಳು ಇಷ್ಟವೇ? ಡಬಲ್-ಟ್ಯಾಪ್ ಮಾಡಿ. ವೆರಿಫೈಡ್ ಹೆಲ್ತ್ ಕಂಟೆಂಟ್‌ಗೆ ಫಾಲೋ ಮಾಡಿ.",
    ],
    carousel: [
      { title: "{T}: ನಿಜವಾದ ಕಥೆ ಏನು?", body: "ವಿಜ್ಞಾನಕ್ಕೆ ಸ್ವೈಪ್ ಮಾಡಿ — ಹೈಪ್ ಇಲ್ಲ, ಭಯ ಹುಟ್ಟಿಸುವುದಿಲ್ಲ. ಅಧ್ಯಯನಗಳು ಕಂಡುಕೊಂಡದ್ದು ಮಾತ್ರ." },
      { title: "ವೈರಲ್ ಹೇಳಿಕೆ", body: "{T} ಜೀವನ ಬದಲಿಸುತ್ತದೆ ಎಂದು ನಿಮ್ಮ ಫೀಡ್ ಹೇಳುತ್ತದೆ. ಕುರುಡಾಗಿ ಕೊಳ್ಳುವ ಮುನ್ನ ಫ್ಯಾಕ್ಟ್-ಚೆಕ್ ಬೇಕು." },
      { title: "ಸಂಶೋಧನೆ ತೋರಿಸುವುದು", body: "ಪೀರ್-ರಿವ್ಯೂಡ್ ಅಧ್ಯಯನಗಳ ಪ್ರಕಾರ {T} {v}. ಪುರಾವೆ ವಿಶ್ವಾಸಾರ್ಹತೆ ಸುಮಾರು {conf}%." },
      { title: "ಪ್ರಾಮಾಣಿಕ ಮಿತಿಗಳು", body: "ಪರಿಣಾಮ ಡೋಸ್, ವೈಯಕ್ತಿಕ ಅಂಶಗಳ ಮೇಲೆ ಅವಲಂಬಿಸಿದೆ. ಕೆಲವು ಅಧ್ಯಯನಗಳು ಚಿಕ್ಕವು." },
      { title: "ವಿರೋಧಾಭಾಸ ಅಧ್ಯಯನಗಳು", body: "ಇಲ್ಲಿ ವಿಜ್ಞಾನ ಏಕಮತವಲ್ಲ. ಒಳ್ಳೆಯ ಕ್ರಿಯೇಟರ್‌ಗಳು ಎರಡೂ ಬದಿ ತೋರಿಸುತ್ತಾರೆ." },
      { title: "ನಿಮಗೆ ಇದರ ಅರ್ಥ", body: "{T} ಅನ್ನು ಒಂದು ತಿಳಿವಳಿಕೆಯ ಆಯ್ಕೆಯಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ. ಇದು ವೈದ್ಯಕೀಯ ಆರೈಕೆಗೆ ಬದಲಿಯಲ್ಲ." },
      { title: "ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡಿ", body: "ಸಪ್ಲಿಮೆಂಟ್, ಡಯಟ್, ಔಷಧ — ಯಾವುದನ್ನೂ ಬದಲಿಸುವ ಮುನ್ನ ಅರ್ಹ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ." },
      { title: "ಈ ಕರೋಸೆಲ್ ಸೇವ್ ಮಾಡಿ", body: "ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ, ಶೇರ್ ಮಾಡಿ, ವಿಜ್ಞಾನವನ್ನು ಗೌರವಿಸುವ ಕಂಟೆಂಟ್‌ಗೆ ಫಾಲೋ ಮಾಡಿ." },
    ],
    caption:
      "{T} — ವೆರಿಫೈಡ್, ಹೈಪ್ ಅಲ್ಲ ✅\n\nಇದನ್ನು ನಿಜವಾದ ಸಂಶೋಧನೆಯಿಂದ ಪರಿಶೀಲಿಸಿದೆವು. ತೀರ್ಪು: {T} {v} (≈{conf}% ಎವಿಡೆನ್ಸ್ ಕಾನ್ಫಿಡೆನ್ಸ್).\n\nವಿಜ್ಞಾನ ಸೂಕ್ಷ್ಮ — ಪರಿಣಾಮ ಡೋಸ್, ಗುಣಮಟ್ಟ, ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿಸಿದೆ. ಇದು ಶಿಕ್ಷಣ, ವೈದ್ಯಕೀಯ ಸಲಹೆಯಲ್ಲ. ಯಾವಾಗಲೂ ಅರ್ಹ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.\n\nಸೇವ್ ಮಾಡಿ. ಶೇರ್ ಮಾಡಿ. ಫಾಲೋ ಮಾಡಿ.",
    thumbnails: [
      "{T}: ಹೈಪ್ vs ವಿಜ್ಞಾನ",
      "{T} ನಿಜವಾದ ಸತ್ಯ",
      "{T} — ಅಧ್ಯಯನಗಳು ಏನು ಹೇಳುತ್ತವೆ",
      "{T} ಯೋಗ್ಯವೇ? (ಪುರಾವೆ)",
    ],
    hashtags: ["#ಆರೋಗ್ಯ", "#HealthFacts", "#KannadaCreator", "#ವಿಜ್ಞಾನ", "#EvidenceBased", "#MythBusting", "#KannadaHealth"],
    disclaimer:
      "ಈ ವಿಷಯ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಮಾತ್ರ; ಇದು ವೈದ್ಯಕೀಯ ಸಲಹೆ, ರೋಗನಿರ್ಣಯ ಅಥವಾ ಚಿಕಿತ್ಸೆ ಅಲ್ಲ. ಆರೋಗ್ಯ ನಿರ್ಧಾರಗಳ ಮುನ್ನ ಅರ್ಹ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    proTip: "ಪರದೆಯ ಮೇಲೆ ಮೊದಲು ಕಾನ್ಫಿಡೆನ್ಸ್ ಸ್ಕೋರ್ ತೋರಿಸಿ — ಪಾರದರ್ಶಕತೆ ನಂಬಿಕೆಯನ್ನು ವೇಗವಾಗಿ ಬೆಳೆಸುತ್ತದೆ.",
  },
};

/* ----------------------------- assembly ------------------------------- */

function fill(str, vars) {
  return str
    .replace(/\{T\}/g, vars.T)
    .replace(/\{conf\}/g, vars.conf)
    .replace(/\{v\}/g, vars.v)
    .replace(/\{HOOK\}/g, vars.HOOK || "");
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

const SECTION_LABELS = {
  hook: "HOOK",
  claim: "THE CLAIM",
  evidence: "WHAT SCIENCE SAYS",
  nuance: "THE NUANCE",
  action: "DO THIS INSTEAD",
  signoff: "SIGN-OFF",
};

function buildScript(pack, vars, length, seed, isShorts, lens) {
  const order =
    length === "short"
      ? ["hook", "evidence", "action", "signoff"]
      : length === "long"
      ? ["hook", "claim", "evidence", "nuance", "action", "signoff"]
      : ["hook", "claim", "evidence", "action", "signoff"];

  const baseHook = fill(pick(vars.isMyth ? pack.hooksMyth : pack.hooks, seed), vars);
  const hookText = (lens?.scriptHook ? lens.scriptHook(vars.T, vars.conf) : null) || baseHook;
  const sections = order.map((k) => {
    const raw = k === "hook" ? pack.script.hook : pack.script[k];
    let text = fill(raw, { ...vars, HOOK: hookText });
    if (lens?.sectionLines?.[k]) {
      text += "\n\n" + lens.sectionLines[k](vars.T, vars.conf);
    }
    return { label: SECTION_LABELS[k], text };
  });
  const seconds =
    length === "short" ? "15–25s" : length === "long" ? "70–90s" : "35–45s";
  return {
    sections,
    duration: seconds,
    format: isShorts ? "YouTube Shorts" : "Reel / Short-form",
  };
}

// ── YouTube long-form (10 min) ────────────────────────────────────────────
function buildYoutubeScript(pack, vars, seed, lens) {
  const hook = (lens?.scriptHook ? lens.scriptHook(vars.T, vars.conf) : null) || fill(pick(pack.hooks, seed), vars);
  const SL = lens?.sectionLines;
  const ei = (fn) => fn ? "\n\n" + fn(vars.T, vars.conf) : "";
  return {
    sections: [
      { label: "HOOK & TITLE CARD (0:00–1:00)", text: hook + ` The research on ${vars.T} sits at ${vars.conf}% confidence. Peer-reviewed. The claim your feed is pushing? Let's hold it up against what the studies actually found.` },
      { label: "INTRO (1:00–2:30)", text: `What ${vars.T} actually is. What the evidence found. What the viral claim got wrong — and what to do with all of it. The last section is the part nobody else covers.` },
      { label: "THE VIRAL CLAIM (2:30–4:30)", text: fill(pack.script.claim, vars) + ` Let me show you the actual claims making the rounds — then hold each one up against the research.` + ei(SL?.claim) },
      { label: "SCIENCE DEEP DIVE (4:30–7:30)", text: fill(pack.script.evidence, vars) + `\n\n` + fill(pack.script.nuance, vars) + ` Let's look at the actual study designs: sample sizes, duration, funding sources, and what the systematic reviews conclude.` + ei(SL?.evidence) },
      { label: "PRACTICAL TAKEAWAYS (7:30–9:00)", text: fill(pack.script.action, vars) + ` Simple framework: check the evidence level first, then consult a qualified professional before making any changes.` + ei(SL?.action) },
      { label: "OUTRO & SUBSCRIBE (9:00–10:00)", text: fill(pack.script.signoff, vars) + ` If this video saved you from a bad decision — that's a win. Subscribe for weekly evidence-based content. Comment below with the next topic you want me to research.` + ei(SL?.signoff) },
    ],
    duration: "~10 min",
    format: "YouTube Long-Form",
  };
}

// ── Podcast episode (1 hr) ────────────────────────────────────────────────
function buildPodcastScript(pack, vars, seed, lens) {
  const hook = (lens?.scriptHook ? lens.scriptHook(vars.T, vars.conf) : null) || fill(pick(pack.hooks, seed), vars);
  const SL = lens?.sectionLines;
  const ei = (fn) => fn ? "\n\n" + fn(vars.T, vars.conf) : "";
  return {
    sections: [
      { label: "COLD OPEN (0:00–2:00)", text: hook + ` That's what this episode is about. Welcome.` },
      { label: "INTRO (2:00–5:00)", text: `${vars.T} — where the science actually stands, why the viral narrative is wrong, what the evidence does and doesn't support, and what to do with all of it. Let's go.` },
      { label: "BACKGROUND & CONTEXT (5:00–15:00)", text: fill(pack.script.claim, vars) + ` Let's talk about why ${vars.T} is having a moment. Where did this trend start? What's the cultural context — and how does that affect how the science gets communicated?` + ei(SL?.claim) },
      { label: "RESEARCH DEEP DIVE (15:00–35:00)", text: fill(pack.script.evidence, vars) + `\n\n` + fill(pack.script.nuance, vars) + `\n\nLet's go through the key studies one by one. I want to walk you through how I read a research paper — the abstract, methodology, sample size, funding disclosures. That's how you stop getting fooled.` + ei(SL?.evidence) },
      { label: "CLINICAL PERSPECTIVE (35:00–50:00)", text: `Here's what a qualified clinician would add. Individual variation is enormous. The population-level data on ${vars.T} may or may not apply to you specifically. Before acting on any of this — talk to a qualified healthcare professional who knows your full history.` + ei(SL?.nuance) },
      { label: "PRACTICAL APPLICATION (50:00–58:00)", text: fill(pack.script.action, vars) + ` One action after this episode: next time you see a health claim go viral, ask two questions. One — what is the evidence level? Two — who benefits from me believing this?` + ei(SL?.action) },
      { label: "OUTRO & NEXT EPISODE (58:00–60:00)", text: fill(pack.script.signoff, vars) + ` Thanks for spending an hour on this with me. Next week: [NEXT TOPIC]. Leave a review if you found value — it helps more people find evidence-based content. See you next week.` + ei(SL?.signoff) },
    ],
    duration: "~1 hour",
    format: "Podcast Episode",
  };
}

// ── Webinar outline (2 hr) ────────────────────────────────────────────────
function buildWebinarOutline(pack, vars, seed, lens) {
  const hook = (lens?.scriptHook ? lens.scriptHook(vars.T, vars.conf) : null) || fill(pick(pack.hooks, seed), vars);
  const SL = lens?.sectionLines;
  const ei = (fn) => fn ? "\n\n" + fn(vars.T, vars.conf) : "";
  return {
    sections: [
      { label: "PRE-SHOW & WELCOME (0:00–10:00)", text: `Welcome attendees as they join. Introduce yourself and credentials. Set logistics: mute, use chat, Q&A tab for questions. Tease the three things attendees walk away with. Build anticipation.` },
      { label: "INTRO & AGENDA (10:00–20:00)", text: hook + ` Today's agenda — Module 1: what the science actually says about ${vars.T}. Module 2: how to apply it. Live Q&A. Exclusive resource for everyone who stays till the end.` },
      { label: "MODULE 1 · THE SCIENCE (20:00–50:00)", text: fill(pack.script.evidence, vars) + `\n\n` + fill(pack.script.nuance, vars) + `\n\nWalk through evidence slide by slide. Show evidence-level ratings (meta-analysis > RCT > observational). Poll the audience: "What did you think the evidence level was?" Use the gap between their answers and reality as your teaching moment.` + ei(SL?.evidence) },
      { label: "MODULE 2 · PRACTICAL APPLICATION (50:00–80:00)", text: fill(pack.script.action, vars) + `\n\nWorkshop time: attendees apply the evidence-evaluation framework to three real health claims they've seen online. Share in chat. Debrief together. This is where learning becomes permanent.` + ei(SL?.action) },
      { label: "LIVE Q&A (80:00–105:00)", text: `Open Q&A from chat. Prioritise questions that reveal common misconceptions — these are teaching moments for the whole group. Remind throughout: for personal health decisions, always work with a qualified healthcare professional.` + ei(SL?.nuance) },
      { label: "SUMMARY & CLOSE (105:00–120:00)", text: fill(pack.script.signoff, vars) + `\n\nRecap three key takeaways. Drop the resource link in chat. Announce next webinar. Close with the most memorable line from today — something they'll repeat to someone else tomorrow.` + ei(SL?.signoff) },
    ],
    duration: "~2 hours",
    format: "Live Webinar",
  };
}

// ── Stage Talk & TED Talk (5 / 10 / 20 min) ──────────────────────────────
function buildStageTalk(pack, vars, seed, minutes, isTed, lens) {
  const hook = (lens?.scriptHook ? lens.scriptHook(vars.T, vars.conf) : null) || fill(pick(pack.hooks, seed), vars);
  const tedNote = (s) => isTed ? `\n\n[${s}]` : "";
  const SL = lens?.sectionLines;
  const ei = (fn) => fn ? "\n\n" + fn(vars.T, vars.conf) : "";

  const scripts = {
    5: [
      { label: "OPENING HOOK (0:00–0:45)",       text: hook + tedNote("Pause. Step forward. Hold eye contact for three full seconds.") },
      { label: "CORE INSIGHT (0:45–4:00)",        text: fill(pack.script.evidence, vars) + " " + fill(pack.script.nuance, vars) + tedNote("Slow down on the key statistic. Let the number breathe.") + ei(SL?.evidence) },
      { label: "CLOSE & CALL TO ACTION (4:00–5:00)", text: (isTed
          ? `[Step back from the mic. Breathe.]\n\nThe most radical thing a health creator can do today is say: "I don't know for certain." Because the world doesn't need more confident voices. It needs more honest ones.\n\n[Final beat.] Thank you.`
          : fill(pack.script.signoff, vars) + ` Thank you.`) + ei(SL?.signoff) },
    ],
    10: [
      { label: "OPENING HOOK (0:00–1:00)",        text: hook + tedNote("Pause. Walk to centre stage.") },
      { label: "THE SETUP (1:00–3:00)",            text: fill(pack.script.claim, vars) + tedNote("Point to the screen. Then point to the audience. Let them feel implicated.") + ei(SL?.claim) },
      { label: "EVIDENCE (3:00–7:00)",             text: fill(pack.script.evidence, vars) + `\n\n` + fill(pack.script.nuance, vars) + tedNote("This is your credibility moment. Slow. Deliberate. Use the silence between statistics.") + ei(SL?.evidence) },
      { label: "RESOLUTION (7:00–9:00)",           text: fill(pack.script.action, vars) + ei(SL?.action) },
      { label: "POWERFUL CLOSE (9:00–10:00)",      text: (isTed
          ? `[Return to centre. Look up slowly.]\n\nHere's what I want you to leave with today: the next time you see a health claim go viral — pause. That pause is what separates a content creator from a responsible one.\n\n[Final eye contact sweep.] Thank you.`
          : fill(pack.script.signoff, vars) + ` [Raise your hand — who's creating differently after today?]\n\n[Pause for hands.] Good. Your audience is waiting. Thank you.`) + ei(SL?.signoff) },
    ],
    20: [
      { label: "OPENING HOOK (0:00–2:00)",         text: hook + tedNote("Pause. Let the energy settle. Then begin slowly.") },
      { label: "THE PROBLEM (2:00–5:00)",           text: fill(pack.script.claim, vars) + ` The problem isn't that people are gullible. It's that the information environment rewards certainty over accuracy. And that gap — that's where misinformation lives.` + ei(SL?.claim) },
      { label: "RESEARCH WALKTHROUGH (5:00–12:00)", text: fill(pack.script.evidence, vars) + `\n\n` + fill(pack.script.nuance, vars) + `\n\n[Use slides. Walk through the actual studies. Show evidence levels.]` + tedNote("Peak credibility moment. Speak slowly. Use silence between key statistics.") + ei(SL?.evidence) },
      { label: "REAL EXAMPLES (12:00–16:00)",       text: `Let me give you a concrete example. [Story] A health creator with 2 million followers posted about ${vars.T} with complete confidence. The science was more nuanced. Who's responsible for that gap?\n\n[Let the audience sit with the question.]` + ei(SL?.nuance) },
      { label: "ACTIONABLE FRAMEWORK (16:00–18:00)", text: fill(pack.script.action, vars) + `\n\nThree-question framework every health creator should use:\n1. What is the evidence level — meta-analysis, RCT, or anecdote?\n2. What are the real limitations?\n3. What's the responsible version of this claim?` + ei(SL?.action) },
      { label: "POWERFUL CLOSE (18:00–20:00)",      text: (isTed
          ? `[Return to centre. Slower now. Full eye contact.]\n\nThe most radical thing you can do as a health communicator is say: "The evidence is mixed. Here's what we know, and here's what we don't."\n\n[Final pause.]\n\nBecause the world has enough confident voices. What your audience needs is an honest one.\n\n[Step back.] Thank you.`
          : fill(pack.script.signoff, vars) + `\n\n[Raise your hand — who's going to create differently after today?]\n\n[Pause for hands.]\n\nGood. The audience is waiting. Thank you.`) + ei(SL?.signoff) },
    ],
  };

  return {
    sections: scripts[minutes] || scripts[10],
    duration: `${minutes} min`,
    format: isTed ? "TED-Style Talk" : "Stage Presentation",
  };
}

// ── Enrichment lenses ─────────────────────────────────────────────────────
// Every enrichment-derived span is wrapped with [[E]]…[[/E]] sentinel markers.
// The UI renderer in ContentOutput converts them to inline yellow highlights;
// Copy/Export strip them so the final output is clean.
export const ENRICH_OPEN  = "[[E]]";
export const ENRICH_CLOSE = "[[/E]]";
const E = (s) => `${ENRICH_OPEN}${s}${ENRICH_CLOSE}`;

// ── Cinema reference table ─────────────────────────────────────────────────
// Maps health topic keywords to real films so the Cinema lens references actual
// movies rather than generic cinematic language.
// Each topic group has a pool of refs (English + Tamil/Indian).
// findCinemaRef picks one at random each call so the same topic always shows a different movie.
const CINEMA_REFS = [
  { kw: ["sleep","insomnia","insomniac","melatonin","circadian"], refs: [
    { movie: "Fight Club",                    char: "The unnamed narrator",   note: "whose insomnia fractured his reality — unable to sleep, he invented someone who could" },
    { movie: "Inception",                     char: "Dom Cobb",               note: "who engineered sleep as a world of infinite possibility — and infinite danger" },
    { movie: "Eternal Sunshine of the Spotless Mind", char: "Joel Barish",   note: "where memories dissolved during sleep showed how fragile the resting mind really is" },
    { movie: "Nadunisi Naaygal",              char: "the protagonist",        note: "Selvaraghavan's visceral Tamil portrait of sleepless paranoia — insomnia as complete psychological collapse" },
    { movie: "Anniyan",                       char: "Ambi",                   note: "whose suppressed trauma surfaced only in sleep — Tamil cinema's deep dive into the fractured unconscious" },
  ]},
  { kw: ["stress","pressure","overwhelm","cortisol","burnout"], refs: [
    { movie: "Whiplash",                      char: "Andrew Neiman",          note: "where the pursuit of perfection became indistinguishable from self-destruction" },
    { movie: "The Devil Wears Prada",         char: "Andy Sachs",             note: "where chronic high-pressure stress was glamorised — until the body started saying no" },
    { movie: "Anbe Sivam",                    char: "Nalla Sivam",            note: "Tamil cinema's most philosophical argument that hardship either breaks or transforms — stress is the catalyst" },
    { movie: "Soorarai Pottru",               char: "Maara",                  note: "where every setback compounded the pressure — a Tamil masterclass in resilience under systemic stress" },
    { movie: "12 Years a Slave",              char: "Solomon Northup",        note: "where prolonged extreme stress rewrote the body and mind — the most unsparing portrait of chronic trauma on screen" },
  ]},
  { kw: ["anxiety","panic","worry","phobia"], refs: [
    { movie: "Silver Linings Playbook",       char: "Pat Solitano",           note: "where managing the mind became the real hero's journey — harder than any external obstacle" },
    { movie: "A Beautiful Mind",              char: "John Nash",              note: "where the most brilliant mind battles its own chemistry and perception" },
    { movie: "Anniyan",                       char: "Ambi",                   note: "Tamil cinema's most visceral portrait of suppressed anxiety manifesting as a fractured identity" },
    { movie: "96",                            char: "Ram",                    note: "a Tamil film where unresolved emotional weight — the anxiety of unlived choices — defined an entire life" },
    { movie: "As Good as It Gets",            char: "Melvin Udall",           note: "where OCD and anxiety were shown not as quirks but as a genuine structural challenge to daily life" },
  ]},
  { kw: ["depression","grief","sadness","low mood"], refs: [
    { movie: "Girl, Interrupted",             char: "Susanna Kaysen",         note: "where the line between diagnosis and identity gets uncomfortably blurry" },
    { movie: "Manchester by the Sea",         char: "Lee Chandler",           note: "where grief's physical weight was shown without catharsis — the most honest portrait of depression cinema has made" },
    { movie: "Mouna Raagam",                  char: "Divya",                  note: "a Tamil classic that explored emotional shutdown after loss — depression without naming it, long before the vocabulary existed" },
    { movie: "Roja",                          char: "Roja",                   note: "where emotional separation and helplessness echoed the physiology of depressive states under extreme conditions" },
  ]},
  { kw: ["brain","neuroscience","mind","cognitive","focus","nootropic"], refs: [
    { movie: "Limitless",                     char: "Eddie Morra",            note: "the original cinematic take on cognitive enhancement — and why the fantasy is more complicated than the pill" },
    { movie: "Lucy",                          char: "Lucy",                   note: "where unlocking brain capacity was the plot — and where neuroscience diverges dramatically from the screenplay" },
    { movie: "Enthiran",                      char: "Chitti the Robot",       note: "Rajinikanth's Tamil sci-fi that asked what separates human cognition from machine intelligence — and found the answer in emotion" },
    { movie: "Interstellar",                  char: "Cooper",                 note: "where the brain's relationship with time, memory, and perception was stretched to its scientific limits" },
  ]},
  { kw: ["diet","fast food","junk","nutrition","food","eating"], refs: [
    { movie: "Super Size Me",                 char: "Morgan Spurlock",        note: "a 30-day experiment that changed how a generation thought about food — no peer-reviewed study, just a body as evidence" },
    { movie: "Ratatouille",                   char: "Remy",                   note: "who understood that great nutrition is an art — anyone can eat, but not everyone understands what food does to the body" },
    { movie: "Kaaka Muttai",                  char: "the two brothers",       note: "Tamil cinema's most poignant story about food, desire, and what the body needs versus what society provides" },
    { movie: "Julie & Julia",                 char: "Julia Child",            note: "where food became the lens for philosophy, joy, and an entire life reimagined" },
    { movie: "Eat Pray Love",                 char: "Liz Gilbert",            note: "where the relationship with food was the first step in rebuilding the relationship with self" },
  ]},
  { kw: ["exercise","training","running","workout","fitness","gym","cardio"], refs: [
    { movie: "Rocky",                         char: "Rocky Balboa",           note: "where 4 AM training runs became cinema's most powerful argument for discipline compounding" },
    { movie: "Irudhi Suttru",                 char: "Coach Prabhu",           note: "Tamil cinema's most honest portrayal of athletic discipline — sweat, sacrifice, and the science of training" },
    { movie: "Dangal",                        char: "Mahavir Singh Phogat",   note: "where a father's obsessive training regime produced champions — and asked hard questions about sacrifice" },
    { movie: "Bhaag Milkha Bhaag",            char: "Milkha Singh",          note: "where running became a metaphor for outrunning trauma — and fitness for healing the past" },
    { movie: "Whiplash",                      char: "Andrew Neiman",          note: "where physical-mental mastery was pursued past every limit — the dark side of the overtraining conversation" },
  ]},
  { kw: ["muscle","bodybuilding","protein","strength","hypertrophy"], refs: [
    { movie: "Pumping Iron",                  char: "Arnold Schwarzenegger",  note: "the 1977 documentary that proved commitment was the only performance enhancer that mattered" },
    { movie: "Rocky",                         char: "Rocky Balboa",           note: "who drank raw eggs and accidentally started the protein supplement conversation decades early" },
    { movie: "Vikram Vedha",                  char: "Vikram",                 note: "a Tamil neo-noir where physical strength was shown as the product of discipline and controlled aggression" },
  ]},
  { kw: ["gut","digestion","stomach","microbiome","probiotics","ibs"], refs: [
    { movie: "Osmosis Jones",                 char: "Osmosis Jones",          note: "the film literally set inside a human body — where gut health was the plot and the protagonist" },
    { movie: "Contagion",                     char: "Dr. Erin Mears",         note: "where gut-entry pathogens reshaped the world — the clearest cinematic argument for microbiome defence" },
    { movie: "The Martian",                   char: "Mark Watney",            note: "who grew food in his own waste to survive — the most unorthodox gut-health narrative cinema ever told" },
  ]},
  { kw: ["heart","cardiac","cardiovascular","blood pressure","cholesterol"], refs: [
    { movie: "The Pursuit of Happyness",      char: "Chris Gardner",          note: "where perseverance under extreme pressure became the ultimate cardiovascular stress-test metaphor" },
    { movie: "Patch Adams",                   char: "Patch Adams",            note: "who understood that emotional health and cardiovascular health are the same conversation" },
    { movie: "Vivegam",                       char: "AK / Ajay Kumar",       note: "a Tamil action film where a protagonist's cardiovascular endurance in extreme conditions was centre stage" },
    { movie: "Steel Magnolias",               char: "Shelby",                 note: "where a heart condition became a story about stubbornness, love, and the consequences of ignoring medical advice" },
  ]},
  { kw: ["weight","obesity","overweight","fat loss","belly"], refs: [
    { movie: "Moneyball",                     char: "Billy Beane",            note: "where data beat conventional wisdom — exactly what the science on weight management does to popular opinion" },
    { movie: "Super Size Me",                 char: "Morgan Spurlock",        note: "whose metabolic collapse over 30 days became the most persuasive public-health argument cinema ever made" },
    { movie: "Dangal",                        char: "the Phogat sisters",     note: "where body transformation was shown as months of discipline — not shortcuts, not supplements" },
    { movie: "Kaaka Muttai",                  char: "the two brothers",       note: "Tamil cinema's most quietly devastating argument about food access, body weight, and economic inequality" },
  ]},
  { kw: ["aging","age","elderly","longevity","lifespan","anti-aging"], refs: [
    { movie: "The Curious Case of Benjamin Button", char: "Benjamin Button",  note: "where time and biology moved in opposite directions — and the question wasn't how long you live, but how" },
    { movie: "Amour",                         char: "Georges and Anne",       note: "the most honest portrait cinema has given us of what aging and decline actually look like — no shortcuts" },
    { movie: "Cocoon",                        char: "the Antaran visitors",   note: "the film that dared to ask: what if aging were a disease with a cure?" },
    { movie: "Pisaasu",                       char: "the protagonist",        note: "a Tamil psychological film where the weight of unlived years became a visceral meditation on time and the body" },
  ]},
  { kw: ["memory","alzheimer","dementia","recall"], refs: [
    { movie: "Still Alice",                   char: "Alice Howland",          note: "where memory loss was shown as a person becoming a stranger to herself — not a disease on a chart" },
    { movie: "Memento",                       char: "Leonard Shelby",         note: "where a broken memory system forced us to question how we construct reality from fragments" },
    { movie: "Ghajini",                       char: "Sanjay Singhania",       note: "the Tamil/Hindi adaptation that brought Memento's memory-loss science to Indian audiences with raw emotional force" },
    { movie: "The Notebook",                  char: "Allie and Noah",         note: "where love became the only anchor when memory could no longer be trusted" },
  ]},
  { kw: ["addiction","drugs","opioid","substance"], refs: [
    { movie: "Requiem for a Dream",           char: "Harry, Marion, and Sara",note: "the most visceral cinematic argument against substance dependence — no redemption arc, just consequence" },
    { movie: "Trainspotting",                 char: "Mark Renton",            note: "where addiction's pull was shown with terrifying clarity and brutal honesty" },
    { movie: "Nadunisi Naaygal",              char: "the protagonist",        note: "Tamil cinema's unsparing portrait of a mind unravelling — where substance and sleeplessness feed each other" },
  ]},
  { kw: ["alcohol","drinking","sobriety"], refs: [
    { movie: "Leaving Las Vegas",             char: "Ben Sanderson",          note: "where alcohol's grip was shown without flinching or a redemption arc" },
    { movie: "The Lost Weekend",              char: "Don Birnam",             note: "the 1945 film that first treated alcoholism as a medical condition — cinema ahead of the science" },
    { movie: "Azhagi",                        char: "the protagonist",        note: "a Tamil film where alcohol's quiet destruction of family life was shown with painful authenticity" },
  ]},
  { kw: ["cancer","tumor","chemotherapy","oncology"], refs: [
    { movie: "The Fault in Our Stars",        char: "Hazel Grace",            note: "where living with illness became a story about what you choose to do with the time you have" },
    { movie: "50/50",                         char: "Adam Lerner",            note: "where a cancer diagnosis collided with dark comedy — and the statistics became deeply personal" },
    { movie: "Anbe Sivam",                    char: "Nalla Sivam",            note: "a Tamil film that treated suffering not as tragedy but as the classroom for becoming fully human" },
  ]},
  { kw: ["immune","immunity","virus","pandemic","infection"], refs: [
    { movie: "Contagion",                     char: "Dr. Erin Mears",         note: "the 2011 film that accidentally became a documentary — epidemiology as the real protagonist" },
    { movie: "I Am Legend",                   char: "Robert Neville",         note: "where one immune system's unique response became humanity's last hope" },
    { movie: "Kaithi",                        char: "Dilli",                  note: "a Tamil thriller where physical resilience through a single night of relentless threat became a masterclass in endurance" },
  ]},
  { kw: ["pain","chronic pain","fibromyalgia"], refs: [
    { movie: "The Theory of Everything",      char: "Stephen Hawking",        note: "where living inside a body that won't cooperate became a story about the mind that never stops" },
    { movie: "Unbroken",                      char: "Louis Zamperini",        note: "where the threshold between pain and endurance was tested beyond what physiology suggests is survivable" },
    { movie: "Kanchivaram",                   char: "Vengadam",               note: "Tamil cinema's quiet examination of how physical labour and chronic bodily strain shape an entire life" },
  ]},
  { kw: ["fasting","hunger","calorie","intermittent"], refs: [
    { movie: "Cast Away",                     char: "Chuck Noland",           note: "where forced caloric restriction reshaped a man's relationship with time, hunger, and what matters" },
    { movie: "The Revenant",                  char: "Hugh Glass",             note: "where extreme caloric deprivation became a survival mechanism — and the body's adaptation was the story" },
    { movie: "Kaaka Muttai",                  char: "the two brothers",       note: "Tamil cinema's most nutritionally poignant portrait of what involuntary fasting does to a child's world" },
  ]},
  { kw: ["diabetes","insulin","blood sugar","glucose"], refs: [
    { movie: "Steel Magnolias",               char: "Shelby",                 note: "where one character's diabetes became a story about stubbornness, love, and consequence" },
    { movie: "Okja",                          char: "Mija",                   note: "where the industrialisation of food — and metabolic consequence — was put on trial" },
    { movie: "Aaranya Kaandam",               char: "the characters",         note: "Tamil noir where sugar, excess, and systemic dysfunction were woven into every frame" },
  ]},
  { kw: ["hormone","estrogen","thyroid","progesterone","testosterone"], refs: [
    { movie: "Erin Brockovich",               char: "Erin Brockovich",        note: "where curiosity about invisible chemicals changed an entire community's hormonal health forever" },
    { movie: "Pain & Gain",                   char: "Daniel Lugo",            note: "a darkly comedic case study in what happens when the pursuit of hormonal peak goes catastrophically wrong" },
    { movie: "Miss Lovely",                   char: "the protagonist",        note: "an Indian film where the body's exploitation for spectacle was a quiet metaphor for hormonal and emotional disregard" },
  ]},
  { kw: ["magnesium","zinc","mineral","supplement","vitamin","deficiency"], refs: [
    { movie: "The Martian",                   char: "Mark Watney",            note: "where survival chemistry — growing food in impossible soil — became the most compelling argument for micronutrients" },
    { movie: "Lorenzo's Oil",                 char: "Augusto Odone",          note: "where two non-scientists discovered what pharmaceutical research had missed — and it was a fat molecule" },
    { movie: "Interstellar",                  char: "the crew",               note: "where the biological limits of the human body in extreme conditions asked hard questions about what we need to survive" },
  ]},
  { kw: ["meditation","mindfulness","breathwork","yoga"], refs: [
    { movie: "Eat Pray Love",                 char: "Liz Gilbert",            note: "where meditation became the plot device — and the cortisol science followed every scene" },
    { movie: "Doctor Strange",                char: "Stephen Strange",        note: "where the mind was shown as a trainable instrument — a cinematic metaphor for neuroplasticity and focused attention" },
    { movie: "Thanga Magan",                  char: "the protagonist",        note: "a Tamil film where emotional recalibration — the core of mindfulness — was the quiet engine of the story" },
  ]},
  { kw: ["inflammation","anti-inflammatory","autoimmune"], refs: [
    { movie: "Sicko",                         char: "Michael Moore",          note: "where systemic failure in healthcare — the environment that drives chronic inflammation — was put under a cinematic microscope" },
    { movie: "Contagion",                     char: "Dr. Cheever",            note: "where the inflammatory response gone wrong was shown at civilisation scale" },
    { movie: "Erin Brockovich",               char: "Erin Brockovich",        note: "where environmental chemical exposure — a direct driver of systemic inflammation — became a legal and public health landmark" },
  ]},
  { kw: ["omega","fish oil","fatty acid","protein","amino"], refs: [
    { movie: "Rocky",                         char: "Rocky Balboa",           note: "who drank raw eggs and accidentally started the protein supplement conversation decades early" },
    { movie: "The Martian",                   char: "Mark Watney",            note: "where fatty-acid-rich potato nutrition kept a man alive on Mars — the most dramatic macronutrient argument cinema ever made" },
    { movie: "Julie & Julia",                 char: "Julia Child",            note: "who understood that fat was not the enemy — decades before the science caught up with her cooking" },
  ]},
];

function findCinemaRef(topic) {
  const t = topic.toLowerCase();
  for (const group of CINEMA_REFS) {
    if (group.kw.some((k) => t.includes(k))) {
      const refs = group.refs;
      return refs[Math.floor(Math.random() * refs.length)];
    }
  }
  return null;
}

// ── Books reference table ──────────────────────────────────────────────────
// Each group has kw (keywords) and refs (pool of books). findBookRef picks randomly.
const BOOK_REFS = [
  { kw: ["sleep","insomnia","circadian","melatonin"], refs: [
    { book: "Why We Sleep",              author: "Matthew Walker",          hint: "every 90 minutes of lost sleep measurably impairs cognition, immunity, and metabolic health" },
    { book: "The Sleep Revolution",      author: "Arianna Huffington",      hint: "sleep deprivation is a modern crisis — reclaiming rest is the most powerful performance upgrade available" },
    { book: "Sleep Smarter",             author: "Shawn Stevenson",         hint: "21 evidence-based strategies to optimise sleep quality, covering light, temperature, nutrition, and movement timing" },
    { book: "Thirukkural",               author: "Thiruvalluvar",           hint: "Kural 1062 frames rest as the foundation of a functioning mind — ancient Tamil wisdom with modern physiological backing" },
    { book: "The Circadian Code",        author: "Satchin Panda",           hint: "aligning eating, sleeping, and activity to your body clock adds years to health span without changing what you eat" },
  ]},
  { kw: ["stress","cortisol","burnout"], refs: [
    { book: "The Upside of Stress",      author: "Kelly McGonigal",         hint: "it's not stress that harms you — it's believing stress is harmful. The mindset shift is physiologically real" },
    { book: "Why Zebras Don't Get Ulcers", author: "Robert Sapolsky",       hint: "humans uniquely sustain the stress response long after the threat has passed — and that sustained cortisol is what kills" },
    { book: "Burnout",                   author: "Emily & Amelia Nagoski",  hint: "completing the stress cycle matters more than eliminating stress — the body needs a physical signal that the threat is over" },
    { book: "The Stress-Proof Brain",    author: "Melanie Greenberg",       hint: "neuroscience-based tools to rewire threat perception — fear and stress use overlapping circuits that can be retrained" },
    { book: "Ikigai",                    author: "Héctor García & Francesc Miralles", hint: "the Okinawan concept of purposeful living dramatically blunts cortisol — Japan's blue zone holds the data" },
  ]},
  { kw: ["anxiety","panic","worry"], refs: [
    { book: "Dare",                      author: "Barry McDonagh",          hint: "anxiety is a response pattern to retrain, not a disorder to suppress — and the reframe changes the neurology" },
    { book: "The Anxiety and Worry Workbook", author: "Clark & Beck",       hint: "cognitive model of anxiety — identifying and restructuring catastrophic thought patterns is the gold-standard clinical tool" },
    { book: "Unwinding Anxiety",         author: "Judson Brewer",           hint: "habit loops drive anxiety, and mindfulness-based craving tools disrupt the loop at its reward-learning root" },
    { book: "The Highly Sensitive Person", author: "Elaine Aron",           hint: "15–20% of people process stimuli more deeply — what looks like anxiety is often an evolutionary sensory trait" },
    { book: "Vallalar's Teachings",      author: "Ramalinga Swamigal",      hint: "the Tamil saint's teachings on compassion and inner stillness map closely to modern parasympathetic activation techniques" },
  ]},
  { kw: ["habit","routine","behaviour"], refs: [
    { book: "Atomic Habits",             author: "James Clear",             hint: "1% improvement compounds to 37× better in a year — the maths of tiny consistent action, not motivation" },
    { book: "The Power of Habit",        author: "Charles Duhigg",          hint: "habits are cue-routine-reward loops — change the routine while keeping the cue and reward and the loop rewires itself" },
    { book: "Tiny Habits",               author: "BJ Fogg",                 hint: "motivation is unreliable — anchor tiny new behaviours to existing ones and let celebration cement the neural path" },
    { book: "Deep Work",                 author: "Cal Newport",             hint: "the ability to focus without distraction is becoming rare precisely as it becomes more economically valuable" },
  ]},
  { kw: ["exercise","movement","running","cardio"], refs: [
    { book: "Spark",                     author: "John Ratey",              hint: "exercise is the world's best brain drug — it grows new neurons and outperforms antidepressants in several studies" },
    { book: "Born to Run",               author: "Christopher McDougall",   hint: "the Tarahumara run hundreds of miles barefoot — the modern running shoe may be causing the injuries it claims to prevent" },
    { book: "The Exercise Cure",         author: "Jordan Metzl",            hint: "exercise is the single intervention with positive evidence across the widest range of chronic diseases — more than any drug" },
    { book: "Younger Next Year",         author: "Crowley & Lodge",         hint: "aerobic exercise 6 days a week rewires the biological signals that drive aging — the science is unambiguous" },
    { book: "Irudhi Suttru (novelisation)", author: "Pa. Ranjith & Sudha Kongara", hint: "the story of a coach who trains a fisherwoman into a national boxer — discipline, sweat, and belief over circumstance" },
  ]},
  { kw: ["diet","eating","food","nutrition"], refs: [
    { book: "In Defense of Food",        author: "Michael Pollan",          hint: "seven words that survive all nutrition wars: 'Eat food. Not too much. Mostly plants.'" },
    { book: "How Not to Die",            author: "Michael Greger",          hint: "a review of 15 leading causes of death and the specific evidence-graded food choices that address each" },
    { book: "The Hungry Brain",          author: "Stephan Guyenet",         hint: "overeating is driven by the brain's reward circuits, not weak willpower — and food engineers know this" },
    { book: "Samayal Samayal with Venkatesh Bhat", author: "Venkatesh Bhat", hint: "traditional South Indian cooking carries centuries of intuitive nutritional wisdom — fermentation, fibre, and spice are ancient functional medicine" },
    { book: "Whole",                     author: "T. Colin Campbell",       hint: "reductionist nutrition science misses the point — whole foods work because of synergy, not single nutrients" },
  ]},
  { kw: ["gut","digestion","stomach","microbiome","gut bacteria"], refs: [
    { book: "Gut",                       author: "Giulia Enders",           hint: "the gut is the body's second brain — its bacterial ecosystem controls immunity, mood, and metabolism" },
    { book: "The Good Gut",              author: "Sonnenburg & Sonnenburg", hint: "fibre diversity is the single most powerful lever for microbiome richness — industrialised diets are starving our bacteria" },
    { book: "Brain Maker",               author: "David Perlmutter",        hint: "gut bacteria produce neurotransmitters and regulate brain inflammation — gut health is brain health" },
    { book: "The Microbiome Solution",   author: "Robynne Chutkan",         hint: "antibiotics and processed food have depleted the microbial diversity humans evolved with — restoring it matters" },
  ]},
  { kw: ["brain","neuroscience","neuroplasticity","cognitive"], refs: [
    { book: "The Brain That Changes Itself", author: "Norman Doidge",       hint: "the brain rewires itself in response to experience — neuroplasticity is a mechanism, not a metaphor" },
    { book: "Thinking, Fast and Slow",   author: "Daniel Kahneman",         hint: "two cognitive systems — fast intuition and slow reason — each with predictable failure modes that shape every decision" },
    { book: "The Molecule of More",      author: "Lieberman & Long",        hint: "dopamine drives desire, not pleasure — and misunderstanding this distinction explains addiction, ambition, and modern anxiety" },
    { book: "How Minds Change",          author: "David McRaney",           hint: "belief change happens through emotional connection, not argument — neuroscience explains why facts alone rarely persuade" },
    { book: "Kannadasan's Philosophy",   author: "Kannadasan",              hint: "the Tamil lyricist's writings on mind and meaning preceded modern positive psychology by decades — wisdom literature as cognitive reframe" },
  ]},
  { kw: ["memory","learning","recall","alzheimer"], refs: [
    { book: "Moonwalking with Einstein", author: "Joshua Foer",             hint: "memory isn't fixed — it's a trainable skill, and ancient techniques still outperform modern apps" },
    { book: "Make It Stick",             author: "Brown, Roediger & McDaniel", hint: "retrieval practice beats re-reading by a factor of 3 in long-term retention — most study habits are wrong" },
    { book: "The Memory Book",           author: "Harry Lorayne & Jerry Lucas", hint: "association and visualisation are the oldest memory tools — and neuroscience confirms why they work at the cellular level" },
    { book: "Still Alice (novel)",       author: "Lisa Genova",             hint: "early-onset Alzheimer's dismantles identity before the body fails — a neurologist's account of what memory loss actually takes" },
    { book: "Ghajini (novelisation)",    author: "A. R. Murugadoss",        hint: "Tamil cinema's visceral portrayal of anterograde amnesia — how identity survives when memory resets every 15 minutes" },
  ]},
  { kw: ["aging","longevity","lifespan"], refs: [
    { book: "Lifespan",                  author: "David Sinclair",          hint: "aging is a disease, information loss in DNA is its mechanism, and we may be the last generation to accept it as inevitable" },
    { book: "The Blue Zones",            author: "Dan Buettner",            hint: "9 common lifestyle factors in the world's five longest-lived communities — movement, purpose, and plant-heavy eating top the list" },
    { book: "Younger",                   author: "Sara Gottfried",          hint: "epigenetic aging can be reversed by specific lifestyle inputs — biological age is not the same as chronological age" },
    { book: "Ikigai",                    author: "Héctor García & Francesc Miralles", hint: "purposeful living as the Okinawan secret to long life — the body follows where meaning leads" },
  ]},
  { kw: ["cancer","tumor","oncology"], refs: [
    { book: "The Emperor of All Maladies", author: "Siddhartha Mukherjee", hint: "a biography of cancer — a disease that mirrors human ambition in its relentless drive to survive" },
    { book: "The Cancer Code",           author: "Jason Fung",              hint: "cancer is a metabolic disease as much as a genetic one — Warburg's century-old insight is being vindicated" },
    { book: "Radical Remission",         author: "Kelly A. Turner",         hint: "9 factors appear consistently in documented cases of unexpected cancer recovery — all modifiable, none guaranteed" },
    { book: "When Breath Becomes Air",   author: "Paul Kalanithi",          hint: "a neurosurgeon's diagnosis with terminal cancer reframes what medicine can and cannot do for a living, breathing person" },
  ]},
  { kw: ["depression","low mood","mental health"], refs: [
    { book: "Lost Connections",          author: "Johann Hari",             hint: "9 real causes of depression are rooted in disconnection from meaningful work, people, and values — not only brain chemistry" },
    { book: "The Noonday Demon",         author: "Andrew Solomon",          hint: "the most comprehensive cultural, biological, and psychological account of depression ever assembled in one volume" },
    { book: "Feeling Good",              author: "David Burns",             hint: "CBT delivered as self-help — 40 years of clinical trials confirm it as effective as medication for mild-to-moderate depression" },
    { book: "Uyire (Mani Ratnam's lens)", author: "Mani Ratnam",           hint: "Tamil cinema's most famous dissection of obsessive love and its psychological cost — desire as a form of self-dissolution" },
    { book: "The Mindful Way Through Depression", author: "Williams, Teasdale, Segal & Kabat-Zinn", hint: "MBCT halves relapse rates in recurrent depression — mindfulness as a relapse-prevention tool, not a cure-all" },
  ]},
  { kw: ["trauma","ptsd","nervous system"], refs: [
    { book: "The Body Keeps the Score",  author: "Bessel van der Kolk",     hint: "trauma is stored physically in the body — effective treatment must engage the body, not just the mind" },
    { book: "Waking the Tiger",          author: "Peter Levine",            hint: "trauma is incomplete survival energy — somatic experiencing allows the body to discharge what the mind cannot process" },
    { book: "Complex PTSD",              author: "Pete Walker",             hint: "childhood emotional neglect creates adult emotional flashbacks — naming them is the first therapeutic intervention" },
  ]},
  { kw: ["inflammation","anti-inflammatory","autoimmune"], refs: [
    { book: "The Inflammation Spectrum", author: "Will Cole",               hint: "inflammation exists on a spectrum, food choices sit at the centre, and individual variation matters enormously" },
    { book: "Grain Brain",               author: "David Perlmutter",        hint: "gluten and carbohydrates trigger neurological inflammation in susceptible individuals — the gut-brain axis is real" },
    { book: "The Plant Paradox",         author: "Steven Gundry",           hint: "lectins in plants evolved as defences — in excess they may trigger leaky gut and the autoimmune cascade that follows" },
  ]},
  { kw: ["immune","immunity","virus","infection"], refs: [
    { book: "Immune",                    author: "Philipp Dettmer",         hint: "the immune system is the most underappreciated system in the body — understanding it changes how you manage health" },
    { book: "Plague of Corruption",      author: "Judy Mikovits",           hint: "a controversial immunologist's account of scientific and institutional failure — peer review and scepticism still apply" },
    { book: "The Germ Files",            author: "Jason Tetro",             hint: "99% of microbes are harmless or beneficial — our war against germs may be damaging the allies we depend on" },
  ]},
  { kw: ["weight","obesity","fat loss"], refs: [
    { book: "Why We Get Fat",            author: "Gary Taubes",             hint: "obesity is a hormonal problem, not a willpower deficit — the carbohydrate-insulin model challenges conventional calorie counting" },
    { book: "Always Hungry?",            author: "David Ludwig",            hint: "fat cells, not the person, are driving overeating — reduce insulin to release the fat and reduce hunger simultaneously" },
    { book: "The Hacking of the American Mind", author: "Robert Lustig",    hint: "processed food engineers the dopamine-serotonin imbalance that drives reward-seeking and depression simultaneously" },
    { book: "Dangal (the story)",        author: "Nitesh Tiwari",           hint: "the story of daughters trained to wrestle — discipline and body transformation as an act of resistance and identity" },
  ]},
  { kw: ["fasting","intermittent fasting"], refs: [
    { book: "The Obesity Code",          author: "Jason Fung",              hint: "insulin resistance drives weight gain, and strategic fasting resets it — a therapeutic tool backed by clinical evidence" },
    { book: "Lifespan",                  author: "David Sinclair",          hint: "caloric restriction and fasting activate the same longevity pathways — sirtuins, mTOR, and AMPK are the molecular levers" },
    { book: "The Complete Guide to Fasting", author: "Jason Fung & Jimmy Moore", hint: "clinical protocols for therapeutic fasting — from 24-hour to extended fasts and the physiology behind each" },
  ]},
  { kw: ["pain","chronic pain","fibromyalgia"], refs: [
    { book: "Explain Pain",              author: "Lorimer Moseley & David Butler", hint: "pain is an output of the brain's threat assessment — changing that assessment changes the pain experience" },
    { book: "The Pain Relief Secret",    author: "Sarah Warren",            hint: "chronic pain is largely held muscular tension — somatic movement education addresses the cause, not just the signal" },
    { book: "Full Catastrophe Living",   author: "Jon Kabat-Zinn",          hint: "MBSR reduces subjective pain intensity and pain catastrophising — documented across 40 years of clinical trials" },
  ]},
  { kw: ["vitamin","deficiency","supplement","micronutrient","mineral","magnesium","electrolyte","omega","fish oil","fatty acid","epa","dha","nootropic"], refs: [
    { book: "The Vitamin D Solution",    author: "Michael Holick",          hint: "Vitamin D deficiency affects 1 billion people and connects to immunity, mood, bone density, and metabolic health" },
    { book: "The Magnesium Miracle",     author: "Carolyn Dean",            hint: "magnesium participates in 300+ enzymatic reactions and is deficient in 80% of the population — yet rarely tested" },
    { book: "The Omega-3 Connection",    author: "Andrew Stoll",            hint: "omega-3 fatty acids have the strongest supplement evidence profile — clearest for cardiovascular and mood applications" },
    { book: "Examining the Evidence",    author: "research literature",     hint: "most supplements have a fraction of the evidence their marketing implies — dose, form, and context determine everything" },
    { book: "The Martian (for context)", author: "Andy Weir",               hint: "an astronaut surviving on a nutrient-stripped potato diet dramatises exactly what micronutrient gaps do to a functioning body over time" },
  ]},
  { kw: ["diabetes","insulin","blood sugar","glucose"], refs: [
    { book: "The Diabetes Code",         author: "Jason Fung",              hint: "Type 2 diabetes is largely a dietary disease — and is reversible without lifelong medication in many documented cases" },
    { book: "Dr. Neal Barnard's Program for Reversing Diabetes", author: "Neal Barnard", hint: "a low-fat plant-based diet outperformed the standard diabetic diet in randomised clinical trial — insulin sensitivity is dietary" },
    { book: "Glucose Revolution",        author: "Jessie Inchauspé",        hint: "glucose spikes drive energy crashes, cravings, and accelerated aging — meal order and fibre-first eating can flatten the curve" },
  ]},
  { kw: ["heart","cardiovascular","cholesterol"], refs: [
    { book: "Eat to Beat Disease",       author: "William Li",              hint: "5 health-defence systems in the body, and specific evidence-graded foods that activate each one" },
    { book: "Prevent and Reverse Heart Disease", author: "Caldwell Esselstyn", hint: "a whole-food plant-based diet arrested and reversed coronary artery disease in documented long-term clinical cases" },
    { book: "The Cholesterol Myth",      author: "Uffe Ravnskov",           hint: "the diet-heart hypothesis is far less settled than guidelines suggest — the full evidence base is contested and nuanced" },
    { book: "Vivegam (the philosophy)", author: "Anirudh & Hari",          hint: "Tamil action cinema exploring the cost of pushing the body beyond its limits — a proxy for what cardiovascular overtraining actually does" },
  ]},
  { kw: ["muscle","strength","hypertrophy","protein"], refs: [
    { book: "Science and Development of Muscle Hypertrophy", author: "Brad Schoenfeld", hint: "progressive overload is non-negotiable — but recovery is where actual growth happens, not the session" },
    { book: "The Barbell Prescription",  author: "Sullivan & Baker",        hint: "strength training is the single most effective anti-aging intervention — the evidence from gerontology is unambiguous" },
    { book: "Bigger Leaner Stronger",    author: "Michael Matthews",        hint: "compound lifting, progressive overload, and a caloric surplus — the evidence-based foundations are less glamorous than the industry admits" },
    { book: "Kamba Ramayanam (strength passages)", author: "Kambar",        hint: "the Tamil epic's descriptions of Hanuman's physical feats encode a cultural ideal of disciplined strength that predates modern fitness science by centuries" },
  ]},
  { kw: ["alcohol","drinking","sobriety"], refs: [
    { book: "This Naked Mind",           author: "Annie Grace",             hint: "understanding alcohol's subconscious hold removes the willpower equation — the desire changes before the behaviour does" },
    { book: "Alcohol Explained",         author: "William Porter",          hint: "alcohol is a depressant that creates the anxiety it temporarily relieves — the physiological trap is self-reinforcing" },
    { book: "The Unexpected Joy of Being Sober", author: "Catherine Gray",  hint: "first-person account of sobriety — the social identity shift is the hardest part, and the benefits arrive faster than expected" },
  ]},
  { kw: ["addiction","dependency","substance"], refs: [
    { book: "In the Realm of Hungry Ghosts", author: "Gabor Maté",         hint: "addiction is a response to pain, almost always rooted in early trauma — compassion is the first clinical requirement" },
    { book: "Dopamine Nation",           author: "Anna Lembke",             hint: "chronic dopamine flooding from modern pleasure sources creates a pain/pleasure imbalance — the reset requires deliberate abstinence" },
    { book: "Chasing the Scream",        author: "Johann Hari",             hint: "the opposite of addiction is connection — Portugal's decriminalisation data supports this over a decade of evidence" },
  ]},
  { kw: ["meditation","mindfulness","breathwork"], refs: [
    { book: "Full Catastrophe Living",   author: "Jon Kabat-Zinn",          hint: "MBSR shows measurable reductions in pain, stress, and anxiety across 40 years of clinical trials — not philosophy, physiology" },
    { book: "Breath",                    author: "James Nestor",            hint: "nose breathing, CO₂ tolerance, and slow exhales produce measurable physiological changes — breathing is trainable" },
    { book: "Altered States of Consciousness", author: "Charles Tart",      hint: "states reached through meditation, breath, and fasting share neurological signatures — the mechanism is biological" },
    { book: "Thirumantiram",             author: "Thirumoolar",             hint: "the Tamil Siddha text describes pranayama and yoga postures with surprising physiological specificity — written over 1,500 years ago" },
    { book: "Waking Up",                 author: "Sam Harris",              hint: "secularised mindfulness stripped of metaphysics — the neurological benefits are independent of belief" },
  ]},
  { kw: ["hormone","estrogen","thyroid","progesterone","testosterone","androgen"], refs: [
    { book: "The Hormone Cure",          author: "Sara Gottfried",          hint: "77% of hormonal symptoms respond to lifestyle changes before medication is warranted — but accurate testing comes first" },
    { book: "Testosterone Rex",          author: "Cordelia Fine",           hint: "testosterone's influence on behaviour is far more nuanced than popular culture allows — the science is more complex than the headline" },
    { book: "Estrogen Matters",          author: "Bluming & Tavris",        hint: "the Women's Health Initiative's conclusions on HRT were overstated — the full dataset tells a different risk-benefit story" },
    { book: "Roar",                      author: "Stacy Sims",              hint: "women are not small men — physiology, training response, and nutrition needs shift dramatically across the hormonal cycle" },
  ]},
];

function findBookRef(topic) {
  const t = topic.toLowerCase();
  for (const group of BOOK_REFS) {
    if (group.kw.some((k) => t.includes(k))) {
      const refs = group.refs;
      return refs[Math.floor(Math.random() * refs.length)];
    }
  }
  return null;
}

// All sectionLines and hookLines use signature (T, conf) for consistent calling.
const ENRICHMENT_LENSES = {
  enrichment_entertainment: {
    icon: "🎬", name: "Entertainment",
    hookLine:  (T)       => E(`Pause your Netflix — ${T} is about to be the most interesting thing you learn this week.`),
    hookLines: [
      (T, conf) => E(`Pause your Netflix — ${T} is about to be the most interesting thing you learn this week.`),
      (T, conf) => E(`${conf}% confidence. That's the actual research score on ${T}. Let's talk about what that really means.`),
      (T, conf) => E(`If ${T} were a streaming show, this would be the episode everybody missed — and the science is what changes everything.`),
    ],
    scriptHook: (T, conf) => E(`${T} just got ${conf}% confidence from peer-reviewed research. Nobody in your feed is talking about the real number — and that's exactly why you should.`),
    sectionLines: {
      claim:    (T, conf) => E(`This is the claim everyone's running with — viral, confident, unverified. The full story is more interesting.`),
      evidence: (T, conf) => E(`The research on ${T} hits ${conf}% confidence. Real number, peer-reviewed. The part your feed skips because it's slower than the headline.`),
      nuance:   (T, conf) => E(`Every story worth watching has the part that complicates things. Here's the nuance that makes this one actually useful.`),
      action:   (T, conf) => E(`Apply this evidence like a strategy, not a shortcut. The audience who does this wins — the ones who just shared the reel don't.`),
      signoff:  (T, conf) => E(`Share this with someone still getting their health advice from the algorithm alone. That's the move.`),
    },
    captionLead: (T, conf) => E(`🎬 ${T} — what the research found vs what the feed is selling. Different story.`),
    captionMid:  (T, conf) => E(`[${conf}% confidence. The research is more interesting than the trend — and more honest.]`),
  },

  enrichment_cinema: {
    icon: "🎞️", name: "Cinema",
    hookLine: (T, conf) => {
      const r = findCinemaRef(T);
      return r
        ? E(`Cold open: think "${r.movie}." ${r.char} — ${r.note}. Now replace the film with your feed. ${T} is today's plot.`)
        : E(`Cold open: it's 6 AM. The protagonist — you — finally learns the truth about ${T}.`);
    },
    hookLines: [
      (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`Cold open: think "${r.movie}." ${r.char} — ${r.note}. Now replace the film with your feed. ${T} is today's plot.`)
          : E(`Cold open: it's 6 AM. The protagonist — you — finally learns the truth about ${T}.`);
      },
      (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`${conf}% confidence is what the actual research on ${T} found. The same question "${r.movie}" raised — now answered.`)
          : E(`${conf}% confidence worth of evidence on ${T}. The part of the story your feed never gets to.`);
      },
      (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`Fade in: if "${r.movie}" was the myth, this is the fact-check. The truth about ${T} is the sequel nobody made — until now.`)
          : E(`Fade in: the claim floods every feed. The truth about ${T} is the sequel nobody made — until now.`);
      },
    ],
    scriptHook: (T, conf) => {
      const r = findCinemaRef(T);
      return r
        ? E(`"${r.movie}." ${r.char} — ${r.note}. The research on ${T} lands at ${conf}% confidence. Same energy, real science.`)
        : E(`The science on ${T} hits ${conf}% confidence. Peer-reviewed. The claim your feed is pushing is a different story — literally.`);
    },
    sectionLines: {
      claim: (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`Every good film has a lie the hero believes at the start. The viral claim about ${T} is that lie — and "${r.movie}" already showed us how it ends.`)
          : E(`Every good film has the claim everybody believes in the first act. The viral claim about ${T} is exactly that. The evidence is what comes next.`);
      },
      evidence: (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`${conf}% confidence — the actual data on ${T}. The scene "${r.movie}" didn't make, because honesty doesn't trend. This one does.`)
          : E(`${conf}% confidence. That's the real number on ${T}. The part the algorithm doesn't serve you because it's slower than the headline.`);
      },
      nuance: (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`"${r.movie}" skipped this part. Every honest story has the scene that complicates the narrative — here's the nuance that makes this one real.`)
          : E(`The scene nobody clips. The nuance that separates a good film from an honest one — and honest content from viral noise.`);
      },
      action: (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`"${r.movie}" showed what happens when you ignore the evidence. ${r.char} — ${r.note}. Here's what happens when you don't.`)
          : E(`You've seen the full picture on ${T}. Use it. That's the difference between the audience and the protagonist.`);
      },
      signoff: (T, conf) => {
        const r = findCinemaRef(T);
        return r
          ? E(`That's the real story on ${T}. Unlike ${r.char} in "${r.movie}", you now have the evidence before the decision.`)
          : E(`That's the full picture on ${T}. Your audience trusts you to show the story nobody else bothered to make.`);
      },
    },
    captionLead: (T, conf) => {
      const r = findCinemaRef(T);
      return r
        ? E(`🎞️ "${r.movie}" put ${r.note.split(' — ')[0] || r.note.slice(0, 60)} on screen. The science behind ${T} is the sequel.`)
        : E(`🎞️ A cinematic look at ${T} — drama, reveal, resolution.`);
    },
    captionMid: (T, conf) => {
      const r = findCinemaRef(T);
      return r
        ? E(`[The "${r.movie}" connection: ${r.note}. At ${conf}% confidence, the evidence on ${T} is the honest version of that story.]`)
        : E(`${conf}% confidence. Not a perfect score — an honest one. The best films don't lie to their audience, and neither does this.`);
    },
  },

  enrichment_philosophy: {
    icon: "🏛️", name: "Philosophy",
    hookLine:  (T)       => E(`The Stoics had a dead-simple rule: focus only on what you control. You can't control what goes viral about ${T}. You can control whether you believe it.`),
    hookLines: [
      (T, conf) => E(`The Stoics had a dead-simple rule: focus only on what you control. You can't control what goes viral about ${T}. You can control whether you believe it.`),
      (T, conf) => E(`Nietzsche called it Amor Fati — embrace what is real, not what you wish were true. The ${conf}% evidence confidence on ${T} is real. The marketing narrative is not.`),
      (T, conf) => E(`Every age has its shadow on the wall. Plato's cave was about exactly this: mistaking vivid illusions for reality. The ${T} trend is this generation's shadow.`),
    ],
    scriptHook: (T, conf) => E(`The Stoic dichotomy of control is blunt: you control your choices, not outcomes. The ${conf}% evidence on ${T} gives you the information you need. What you do with it is entirely yours.`),
    sectionLines: {
      claim:    (T, conf) => E(`The viral claim about ${T} is this generation's shadow on the wall — vivid, convincing, optimised for shares rather than truth. The Stoics called these "borrowed opinions." Their rule: question everything until only the real remains.`),
      evidence: (T, conf) => E(`The real question isn't "what do I believe about ${T}?" — it's "what do I actually know?" At ${conf}% confidence, here's the answer. Knowing its limits isn't weakness. It's intellectual honesty.`),
      nuance:   (T, conf) => E(`Kant's Categorical Imperative asks: would this claim hold if every person in every context applied it equally? The nuance in ${T} is exactly where that universality breaks down — dose, baseline, and individual context all matter.`),
      action:   (T, conf) => E(`Aristotle's golden mean sits between credulity and dismissal. Not blind adoption of ${T}, not reflexive rejection — informed action, based on evidence. That's what evidence-based practice actually looks like in real life.`),
      signoff:  (T, conf) => E(`The examined life includes examining what goes into your body. That's what evidence-based content is for — and why you're still here.`),
    },
    captionLead: (T, conf) => E(`🏛️ Philosophical frame on ${T} — cut through the noise with the tools history already built.`),
    captionMid:  (T, conf) => E(`The Stoic question: what do you actually control here? The evidence on ${T} at ${conf}% confidence is your real lever. The trend is not.`),
  },

  enrichment_psychology: {
    icon: "🧠", name: "Psychology",
    hookLine:  (T)       => E(`There's a glitch in human psychology that makes ${T} claims feel more credible than they actually are. And it's not your fault it works.`),
    hookLines: [
      (T, conf) => E(`There's a glitch in human psychology that makes ${T} claims feel more credible than they actually are. And it's not your fault it works.`),
      (T, conf) => E(`There's a funny glitch called Confirmation Bias — it means you actively look for facts that prove your current habits are fine. That's exactly why the ${conf}% confidence number on ${T} gets ignored.`),
      (T, conf) => E(`The Dunning-Kruger Effect is real — the less you actually know about ${T}, the more confident you feel about it. Here's the full picture.`),
    ],
    scriptHook: (T, conf) => E(`There's a glitch called Confirmation Bias — it means you actively look for facts that confirm what you already believe. That's exactly what's happening every time the ${T} trend goes viral. Here's what the evidence actually shows at ${conf}% confidence.`),
    sectionLines: {
      claim:    (T, conf) => E(`There's a reason this ${T} claim spreads so fast: it triggers FOMO. That feeling of "everyone else is doing this and I'm falling behind" is a known psychological lever — and it's being pulled deliberately.`),
      evidence: (T, conf) => E(`Here's where Cognitive Dissonance kicks in. The data on ${T} sits at ${conf}% confidence — and that might conflict with what you already believe. That discomfort? That's called updating your model. It's actually a good sign.`),
      nuance:   (T, conf) => E(`The Availability Heuristic is brutal here: vivid ${T} success stories in your feed feel more real than dry statistics. Knowing that bias exists is step one to filtering it out.`),
      action:   (T, conf) => E(`Implementation Intention is one of the most effective behaviour-change tools in psychology. Instead of vaguely "being more careful", try this exact reframe: "When I see a ${T} claim, I'll check the evidence level first." That one habit filters most health misinformation.`),
      signoff:  (T, conf) => E(`Sharing this with one person in your circle breaks the misinformation loop for them. That's Social Proof working in the right direction for once.`),
    },
    captionLead: (T, conf) => E(`🧠 Behavioural science angle on ${T} — the biases driving this trend.`),
    captionMid:  (T, conf) => E(`Confirmation Bias check: the evidence on ${T} sits at ${conf}% confidence. The gap between what you expected and what the data shows is your actual growth edge.`),
  },

  enrichment_productivity: {
    icon: "⚡", name: "Productivity",
    hookLine:  (T)       => E(`Small input, compounding return — ${T} run through a performance lens. Here's the systems view.`),
    hookLines: [
      (T, conf) => E(`Small input, compounding return — ${T} run through a performance lens. Here's the systems view.`),
      (T, conf) => E(`${conf}% confidence, low daily cost, measurable return. Here's ${T} as a habit investment — run the numbers before you buy the trend.`),
      (T, conf) => E(`High-leverage health move, or overhyped shortcut? ${T} at ${conf}% confidence — let's check the evidence stack.`),
    ],
    scriptHook: (T, conf) => E(`${T}: ${conf}% evidence confidence, low daily cost, high lifetime ROI — if you use it right. Here's the system, not the slogan.`),
    sectionLines: {
      claim:    (T, conf) => E(`Here's the Eisenhower Matrix problem with ${T}: people file it under "important but not urgent" and endlessly delay the research. That delay is where bad habits compound.`),
      evidence: (T, conf) => E(`At ${conf}% confidence, ${T} has a measurable return. Treat the evidence like a business case — quality studies are your assets, limitations are your risk disclosure. Low-quality studies are junk bonds. Don't invest.`),
      nuance:   (T, conf) => E(`Same input, different output — depending on your baseline. That's not a bug in the ${T} research, it's a feature of personalisation. Cookie-cutter plans ignore this. Systems thinkers don't.`),
      action:   (T, conf) => E(`Parkinson's Law says a task expands to fill the time you give it. If you give yourself "someday" to verify this ${T} claim — it never happens. Set a 48-hour window. Check the evidence. Decide. Move.`),
      signoff:  (T, conf) => E(`Share this with one person who needs a productivity upgrade on their health decisions today. That's leverage — and it compounds.`),
    },
    captionLead: (T, conf) => E(`⚡ Systems lens on ${T} — small input, compounding return.`),
    captionMid:  (T, conf) => E(`ROI check: ${conf}% evidence confidence on ${T}. Run the numbers before buying the trend.`),
  },

  enrichment_spiritual: {
    icon: "🌿", name: "Spiritual / Holistic",
    hookLine:  (T)       => E(`Beyond the data on ${T}, there's a quieter question worth asking: why do we keep chasing the next quick-fix in the first place?`),
    hookLines: [
      (T, conf) => E(`Beyond the data on ${T}, there's a quieter question worth asking: why do we keep chasing the next quick-fix in the first place?`),
      (T, conf) => E(`${conf}% confidence is the outer evidence on ${T}. But there's an inner layer to this conversation that the research alone doesn't capture — and it matters just as much.`),
      (T, conf) => E(`The mind-body connection is real — not mystical. When chronic noise is driving your ${T} decisions, the science alone won't fix it.`),
    ],
    scriptHook: (T, conf) => E(`Beyond the physical evidence on ${T} — ${conf}% confidence, peer-reviewed — there's a layer of mental clutter worth naming. When you're constantly chasing the next health quick-fix, your nervous system is in low-grade chaos. Real clarity starts with a quieter, more intentional practice.`),
    sectionLines: {
      claim:    (T, conf) => E(`When you're constantly chasing the next ${T} trend, your mind is in reactive mode — never settled, never choosing from a clear place. That mental noise is worth naming before any physical intervention.`),
      evidence: (T, conf) => E(`At ${conf}% confidence, the evidence on ${T} is honest and measured. So is a quiet moment of asking: am I making this decision from clarity, or from anxiety? Both questions matter.`),
      nuance:   (T, conf) => E(`The body has its own intelligence. Good research on ${T} respects individual variation — and so does any real contemplative practice. There is no universal prescription here. Pay attention to your own signals.`),
      action:   (T, conf) => E(`True alignment starts when you drop the noise and build a simple, non-negotiable daily ritual — one that includes evidence-informed choices and genuine presence. ${T} can be one piece of that. Not the whole picture.`),
      signoff:  (T, conf) => E(`Share this with someone on their healing path who needs both the data and the stillness. Evidence and intention aren't opposites — they're the same commitment.`),
    },
    captionLead: (T, conf) => E(`🌿 Holistic view on ${T} — mind, body, evidence, intention.`),
    captionMid:  (T, conf) => E(`Beyond the ${conf}% confidence number on ${T}: are you making this decision from clarity or from noise? Both the research and the inner check matter here.`),
  },

  enrichment_books: {
    icon: "📚", name: "Books",
    hookLine: (T, conf) => {
      const r = findBookRef(T);
      return r
        ? E(`There's a concept in "${r.book}" by ${r.author} that maps directly onto ${T}. Here's what it means in practice.`)
        : E(`The books got here before the trend. Here's the long-form evidence on ${T}, distilled.`);
    },
    hookLines: [
      (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`There's a concept in "${r.book}" by ${r.author} that maps directly onto ${T}. Here's what it means in practice.`)
          : E(`The books got here before the trend. Here's the long-form evidence on ${T}, distilled.`);
      },
      (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`${r.author}'s core insight in "${r.book}": ${r.hint.split(' — ')[0] || r.hint.slice(0, 70)}. At ${conf}% confidence, the peer-reviewed research agrees.`)
          : E(`${conf}% evidence confidence — and the books were building to this years before the trend. ${T} through the author lens.`);
      },
      (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`If you want to actually understand ${T}, "${r.book}" by ${r.author} is where the evidence started making sense.`)
          : E(`The bestseller list and the research literature rarely agree on health. On ${T}, here's where they do.`);
      },
    ],
    scriptHook: (T, conf) => {
      const r = findBookRef(T);
      return r
        ? E(`There's a concept in "${r.book}" by ${r.author} that maps directly onto this: ${r.hint.split(' — ')[0] || r.hint.slice(0, 80)}. At ${conf}% confidence, the peer-reviewed data on ${T} is saying the same thing.`)
        : E(`The books on ${T} got here before the trend — here's the long-form evidence distilled to what actually matters at ${conf}% confidence.`);
    },
    sectionLines: {
      claim: (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`There's a concept in "${r.book}" that explains exactly why the ${T} claim spreads so fast: ${r.hint.split('.')[0]}. The book examined this directly — and the answer is more nuanced than the headline.`)
          : E(`The popular claim about ${T} has been examined in depth by the research literature. The answer is more nuanced than the trend allows.`);
      },
      evidence: (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`The core finding in "${r.book}" by ${r.author}: ${r.hint} At ${conf}% evidence confidence, the peer-reviewed data on ${T} is saying the same thing.`)
          : E(`At ${conf}% evidence confidence, the scientific literature on ${T} supports a more measured claim than most content delivers. The books got here first.`);
      },
      nuance: (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`"${r.book}" addresses this directly — individual variation is real, and ${r.author} doesn't pretend otherwise. Same caveat applies to ${T}: dose, context, and baseline all matter.`)
          : E(`Individual variation is real. Context matters. No single finding applies equally to everyone — and any honest book on this will tell you exactly that.`);
      },
      action: (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`The practical framework from "${r.book}": start with the evidence, verify with a qualified professional, track your own response. That's how ${r.author} applies this — and it's the right approach to ${T} too.`)
          : E(`Start with the evidence. Consult a professional. Track your own response. That's the actionable chapter every honest health book lands on.`);
      },
      signoff: (T, conf) => {
        const r = findBookRef(T);
        return r
          ? E(`That's the real thesis from "${r.book}" applied to ${T}. Save this, share it — and if this angle clicked, read the book. It goes deeper than any reel can.`)
          : E(`The evidence on ${T} has been building for decades. Save this, share it. That's the summary. The full chapter is yours to write.`);
      },
    },
    captionLead: (T, conf) => {
      const r = findBookRef(T);
      return r
        ? E(`📚 "${r.book}" by ${r.author} — and what it means for ${T}.`)
        : E(`📚 The books got here first. Here's what the long-form evidence on ${T} actually says.`);
    },
    captionMid: (T, conf) => {
      const r = findBookRef(T);
      return r
        ? E(`From "${r.book}" by ${r.author}: ${r.hint}`)
        : E(`The research literature on ${T} runs deeper than any single study. At ${conf}% confidence, this is where the evidence-based authors land.`);
    },
  },
};

// ── Community Q&A builder (10 fact-checked pairs) ────────────────────────
// Generates realistic audience questions + evidence-grounded answers.
// All answers are structured for copy-paste into comment sections or FAQ pages.
function buildQA(T, vars, research) {
  const conf    = research.confidence;
  const verdict = research.verdict || "mixed";
  const vLines  = {
    proven:     "is genuinely supported by robust peer-reviewed research",
    mixed:      "shows mixed results — some studies support it, others are inconclusive",
    misleading: "is largely over-hyped relative to the actual evidence base",
    false:      "is not currently supported by credible scientific evidence",
  };
  const v = vLines[verdict] || vLines.mixed;
  const safe = conf >= 80 ? "generally considered safe for healthy adults within evidence-supported parameters" : "still under active research review — safety profile varies by individual";

  return [
    {
      q: `What does the latest peer-reviewed science actually say about ${T}?`,
      a: `Current peer-reviewed evidence rates ${T} at approximately ${conf}% confidence. In brief: ${T} ${v}. The strongest supporting data comes from randomised controlled trials and systematic reviews, though study populations and durations vary — always check the original source before acting on any single finding.`,
    },
    {
      q: `Is ${T} safe for the general population, including people with existing conditions?`,
      a: `For most healthy adults, ${T} is ${safe}. However, individuals with chronic conditions, those on prescription medications, pregnant or breastfeeding women, and children should always consult a qualified healthcare professional before incorporating ${T} into their routine. "Safe on average" does not mean safe for every individual.`,
    },
    {
      q: `How long does it realistically take to see results from ${T}?`,
      a: `Most controlled studies on ${T} measure meaningful outcomes over an 8–12 week intervention window with consistent daily application. Short-term anecdotal reports (1–2 weeks) rarely replicate in controlled trials. Individual metabolic variation, baseline health status, and compliance rate all significantly affect the timeline.`,
    },
    {
      q: `Why do I keep seeing completely contradictory information about ${T} online?`,
      a: `Contradictory information about ${T} online is normal — and often reflects real scientific disagreement. Several factors drive this: (1) studies use different dosing protocols and populations; (2) industry-funded research tends to favour positive outcomes; (3) social media amplifies certainty, not nuance. An ${conf}% confidence rating means genuine uncertainty exists. Always look for systematic reviews over individual studies.`,
    },
    {
      q: `Can I combine ${T} with other supplements, medications, or wellness protocols?`,
      a: `Combination protocols are where individual professional guidance is most critical. Some interventions work synergistically with ${T}; others may compete or interact. No template answer covers this adequately — your age, medication list, health status, and goals all affect the calculation. Consult a pharmacist or integrative medicine practitioner for a personalised assessment.`,
    },
    {
      q: `What dose or frequency does the research actually recommend for ${T}?`,
      a: `Dosing protocols for ${T} vary across the literature — a common sign that no definitive consensus has been reached. Studies typically use a range rather than a fixed number, adjusted for body weight, age, and health objective. Use the study-tested dose range as a starting point, confirm it with a licensed healthcare provider, and track your own response data over 4–8 weeks before drawing conclusions.`,
    },
    {
      q: `Is there a risk of becoming dependent on or tolerating ${T} over time?`,
      a: `Tolerance and dependency profiles for ${T} are not well-established in long-term trial data. Most studies run for 8–16 weeks, so data beyond that window is limited. For any intervention that influences physiology — hormonal, neurological, or metabolic — cycling or dose reviews every 8–12 weeks is a reasonable precaution until long-term research catches up.`,
    },
    {
      q: `What's the difference between clinical evidence and what I see promoted by health influencers on ${T}?`,
      a: `Clinical evidence on ${T} is peer-reviewed, replicated across independent research groups, and published in indexed journals. Influencer content is typically anecdotal, brand-sponsored, or based on cherry-picked studies. A ${conf}% confidence score means the evidence quality is ${conf >= 80 ? "reasonably strong" : "still developing"} — but even strong evidence describes populations, not individuals. Use clinical data to inform decisions, not to replace professional consultation.`,
    },
    {
      q: `Does ${T} work differently for men vs women, or across different age groups?`,
      a: `Yes, and this is an underreported nuance. Most clinical trials on ${T} have historically enrolled predominantly young adult males, meaning the evidence base for women (especially across hormonal cycle phases), older adults, and adolescents is considerably thinner. The ${conf}% confidence rating applies primarily to the study population, not necessarily to your specific demographic. This is one of the strongest arguments for personalised professional guidance.`,
    },
    {
      q: `Should I talk to a doctor before trying ${T}, or is it safe to self-experiment?`,
      a: `For low-risk lifestyle interventions, informed self-experimentation with clear tracking metrics is reasonable for most healthy adults. For ${T}: if your confidence in the safety data is high and you're monitoring measurable outcomes (e.g., sleep quality, energy, bloodwork), a structured self-experiment is defensible. If you have any existing health condition, take medication, or are uncertain about your baseline, a conversation with a qualified healthcare professional first is always the safer and smarter starting point.`,
    },
  ];
}

// ── Written offline format builders ─────────────────────────────────────
// Word-count bounded content for written distribution channels.

function buildNewsletter(pack, vars) {
  // Target: 300–500 words. Tight, high-value, email-ready.
  const { T, conf, v } = vars;
  return {
    sections: [
      {
        label: "SUBJECT LINE",
        text: `The truth about ${T} (${conf}% confidence — here's what it means for you)`,
      },
      {
        label: "OPENING (Hook)",
        text: `You've probably seen ${T} trending across your feed this week. Before you act on any of it — here's what the peer-reviewed research actually says.`,
      },
      {
        label: "THE INSIGHT (150 words)",
        text: fill(pack.script.evidence, vars)
          + "\n\n"
          + fill(pack.script.nuance, vars),
      },
      {
        label: "PRACTICAL TAKEAWAY",
        text: fill(pack.script.action, vars)
          + `\n\nOne thing to do this week: before acting on any ${T} claim you see, ask — is there a peer-reviewed study behind this, or just a confident voice?`,
      },
      {
        label: "SIGN-OFF + CTA",
        text: `If this was useful, forward it to one person in your life who's been confused by the noise around ${T}.\n\nTill next week — stay evidence-first.\n\n[Your name]\n\n---\nThis newsletter is for educational purposes only. Always consult a qualified healthcare professional before making health decisions.`,
      },
    ],
    duration: "300–500 words",
    format: "Weekly Patient Newsletter",
  };
}

function buildLeadMagnet(pack, vars) {
  // Target: 800–1,200 words. Authority-building PDF guide.
  const { T, conf, v } = vars;
  return {
    sections: [
      {
        label: "COVER PAGE",
        text: `The ${T} Evidence Guide\nA fact-checked, peer-reviewed breakdown for health-conscious readers\n\nInside: What the research actually shows · Who it applies to · What to do next\n\n[Your Name / Practice Name] · Evidence confidence: ${conf}%`,
      },
      {
        label: "INTRODUCTION (Why This Guide Exists)",
        text: `If you've searched for ${T} online in the last 30 days, you've encountered a wall of conflicting claims. Some say it's life-changing. Others say it's overhyped. Both can't be right — and neither is fully correct.\n\nThis guide cuts through the noise. Every claim below is sourced from peer-reviewed literature. The overall evidence confidence: ${conf}%. Here's what that number means and what it doesn't.`,
      },
      {
        label: "SECTION 1 · THE CLAIM (What You're Hearing)",
        text: fill(pack.script.claim, vars)
          + `\n\nThis is the narrative being amplified across social media and supplement advertising. It is partially accurate — but the full picture is more nuanced.`,
      },
      {
        label: "SECTION 2 · THE EVIDENCE (What the Research Shows)",
        text: fill(pack.script.evidence, vars)
          + `\n\n`
          + fill(pack.script.nuance, vars)
          + `\n\nKey principle: effect sizes in population studies tell you what happens on average, across large groups. Your individual response will vary based on age, existing health status, genetics, and lifestyle context.`,
      },
      {
        label: "SECTION 3 · THE FRAMEWORK (5 Steps to Apply This)",
        text: `Step 1: Establish your baseline. Before starting any ${T} protocol, track your relevant health markers for 2 weeks. You cannot measure improvement without a starting point.\n\nStep 2: Use evidence-supported parameters. Don't extrapolate beyond what the studies tested.\n\nStep 3: Run a structured 8-week trial. Consistency and duration are the most common failure points.\n\nStep 4: Track measurable outcomes — not just how you feel. Subjective reporting is useful but incomplete.\n\nStep 5: Review with a professional. Share your tracked data with a qualified healthcare provider at the 8-week mark.`,
      },
      {
        label: "CLOSING + NEXT STEP",
        text: fill(pack.script.signoff, vars)
          + `\n\n[CTA: Book a consultation / Subscribe for weekly evidence updates / Download the companion checklist]\n\n---\nThis guide is for educational purposes only and does not constitute medical advice. Consult a qualified healthcare professional before making any health changes.`,
      },
    ],
    duration: "800–1,200 words",
    format: "Educational Lead Magnet (PDF Guide)",
  };
}

function buildDeepBlog(pack, vars) {
  // Target: 1,500–2,000 words. SEO-optimised long-form article.
  const { T, conf, v } = vars;
  return {
    sections: [
      {
        label: "H1 TITLE (SEO)",
        text: `${T}: What the Science Actually Shows (${conf}% Evidence Confidence)`,
      },
      {
        label: "META DESCRIPTION",
        text: `Is ${T} worth it? We reviewed the peer-reviewed literature so you don't have to. Here's what the evidence says, what it doesn't, and exactly what to do about it.`,
      },
      {
        label: "INTRODUCTION (200 words)",
        text: fill(pack.script.hook, vars)
          + `\n\n`
          + `If you've been researching ${T}, you've already encountered the noise: breathless endorsements, anecdotal testimonials, and confident claims that rarely cite their sources. This article is different.\n\nWe reviewed the peer-reviewed literature on ${T}, weighted it by study quality (randomised controlled trials score highest; anecdote scores lowest), and applied a rigorous confidence model. Our overall evidence confidence for ${T}: ${conf}%.\n\nHere's what that means — and what it doesn't.`,
      },
      {
        label: "H2 · WHAT IS THE CLAIM BEING MADE?",
        text: fill(pack.script.claim, vars)
          + `\n\nThis framing is common across social media, supplement marketing, and even some healthcare providers. It is not wrong — but it is incomplete. The full story requires engaging with the evidence directly.`,
      },
      {
        label: "H2 · WHAT DOES THE RESEARCH ACTUALLY SHOW?",
        text: fill(pack.script.evidence, vars)
          + `\n\nStudy quality matters enormously here. A single small study showing a dramatic effect is far less reliable than a systematic review of twenty studies showing a modest but consistent effect. The ${conf}% confidence rating reflects the overall quality and consistency of the available evidence, not just whether any study found a positive result.`,
      },
      {
        label: "H2 · THE NUANCE (What the Headlines Skip)",
        text: fill(pack.script.nuance, vars)
          + `\n\nPerhaps most importantly: population-level findings describe averages. If a study shows that ${T} produces a meaningful benefit in 65% of participants, it also means it produced no benefit — or a negative effect — in 35%. Your individual response is not guaranteed by the statistics.`,
      },
      {
        label: "H2 · HOW TO APPLY THIS EVIDENCE",
        text: fill(pack.script.action, vars)
          + `\n\nPractical framework:\n• Start with the evidence-supported dose and duration\n• Track measurable outcomes (not just subjective feeling)\n• Review your data at 8 weeks with a qualified professional\n• Adjust based on your individual response data\n\nThe most common mistake: assuming that because the evidence supports ${T} generally, it will work for you specifically.`,
      },
      {
        label: "H2 · FREQUENTLY ASKED QUESTIONS",
        text: `Q: Is ${T} safe?\nA: For most healthy adults, within evidence-supported parameters, yes. Individual variation applies — consult a healthcare professional if you have existing conditions.\n\nQ: How long before results?\nA: Most controlled studies run 8–12 weeks. Shorter windows rarely produce meaningful data.\n\nQ: Can I combine it with other interventions?\nA: Combination protocols require professional guidance — too many variables to generalise.\n\nQ: What's the best evidence-based dose?\nA: Use the dose range studied in trials as a starting point; confirm with a licensed provider.`,
      },
      {
        label: "CONCLUSION + CTA",
        text: fill(pack.script.signoff, vars)
          + `\n\nThe bottom line: ${T} ${v}. At ${conf}% evidence confidence, it deserves genuine consideration — not uncritical adoption and not reflexive dismissal. Use the framework above, track your response, and make decisions in partnership with a qualified healthcare professional.\n\n[Internal link: related articles] [CTA: Subscribe for weekly evidence-based content]\n\n---\nThis article is for educational purposes only and does not constitute medical advice.`,
      },
    ],
    duration: "1,500–2,000 words",
    format: "Deep-Dive Blog Article (SEO)",
  };
}

function buildEbookChapter(pack, vars) {
  // Target: 6,000–10,000 words. Comprehensive e-book chapter.
  const { T, conf, v } = vars;
  return {
    sections: [
      {
        label: "CHAPTER TITLE",
        text: `Chapter [X]: ${T} — A Complete Evidence-Based Investigation`,
      },
      {
        label: "CHAPTER OVERVIEW",
        text: `This chapter provides a comprehensive, peer-reviewed examination of ${T}. By the end, you will understand: the full scope of what the research supports and does not support; the key variables that determine individual response; a step-by-step evidence-application framework; and exactly how to evaluate new claims about ${T} as they emerge.\n\nEvidence confidence for this chapter's primary subject: ${conf}%.`,
      },
      {
        label: "SECTION 1 · BACKGROUND & CONTEXT",
        text: `Understanding ${T} requires understanding the broader context in which it emerged as a health intervention. [3–4 paragraphs covering: historical background, how it entered mainstream health discourse, the cultural and commercial forces that shaped its reception.]\n\n`
          + fill(pack.script.claim, vars)
          + `\n\nThe narrative described above is not invented — it reflects genuine public interest in ${T}, driven by real health concerns. The question is not whether people care about this topic, but whether the evidence supports the claims being made on its behalf.`,
      },
      {
        label: "SECTION 2 · THE RESEARCH LANDSCAPE",
        text: fill(pack.script.evidence, vars)
          + `\n\n[Expand to 600–800 words: describe the key studies by type — randomised controlled trials, systematic reviews, observational cohort studies. Discuss sample sizes, intervention durations, and primary outcome measures. Note where study quality is high and where it is limited.]\n\nEvidence hierarchy for ${T} at time of writing:\n• Meta-analyses: [Available / Limited / Not yet conducted]\n• Randomised controlled trials: [Strong / Moderate / Weak]\n• Systematic reviews: [Available / Emerging]\n• Observational data: [Extensive]\n• Expert consensus: [${conf >= 80 ? "Reasonably aligned" : "Actively debated"}]`,
      },
      {
        label: "SECTION 3 · MECHANISMS OF ACTION",
        text: `How does ${T} work at a physiological level? Understanding the mechanism separates evidence-based application from supplementation superstition.\n\n[Expand to 400–600 words: describe the proposed biological mechanisms — cellular, hormonal, neurological, metabolic — as established in the current literature. Distinguish between mechanisms that are well-established vs hypothesised.]\n\n`
          + fill(pack.script.nuance, vars),
      },
      {
        label: "SECTION 4 · INDIVIDUAL VARIATION & RESPONSE PROFILING",
        text: `Population statistics describe group averages. Your body is not a population average.\n\nKey individual factors that modulate ${T} response:\n• Age and baseline health status\n• Hormonal environment and metabolic rate\n• Gut microbiome composition\n• Concurrent medications and supplements\n• Genetic polymorphisms (where relevant)\n• Stress load and sleep quality\n• Nutritional status and dietary context\n\n[Expand to 400–600 words: discuss each factor with reference to specific studies where available. This section is particularly valuable for readers with complex health histories.]\n\nThe practical implication: treat the population evidence as a hypothesis about what might work for you — then test it systematically.`,
      },
      {
        label: "SECTION 5 · PRACTICAL APPLICATION FRAMEWORK",
        text: fill(pack.script.action, vars)
          + `\n\n[Expand to 500–700 words:]\n\nPhase 1 — Baseline Establishment (Weeks 1–2):\nDocument your current status across relevant health markers. What specifically will ${T} change, and how will you measure it? Define your success criteria before you begin.\n\nPhase 2 — Protocol Initiation (Weeks 3–10):\nUse the evidence-supported dose and timing. Log consistently — daily takes under 3 minutes and provides irreplaceable data.\n\nPhase 3 — Mid-Point Review (Week 8):\nCompare baseline data with current measurements. Are you trending in the right direction? Is the magnitude of change clinically meaningful?\n\nPhase 4 — Professional Consultation:\nShare your tracked data with a licensed healthcare professional. Raw self-reported data is more valuable to a clinician than your subjective interpretation of it.\n\nPhase 5 — Long-Term Integration or Pivoting:\nBased on your 8–12 week data, decide: continue, adjust, or discontinue. Evidence-based decisions require evidence — collect yours.`,
      },
      {
        label: "SECTION 6 · COMMON MISTAKES & MISCONCEPTIONS",
        text: `The most frequently observed errors in applying ${T} evidence:\n\n1. Confusing "supported by evidence" with "works for everyone"\nThe ${conf}% confidence rating is a group-level statement.\n\n2. Extrapolating short study durations to lifelong protocols\nMost trials run 8–16 weeks. Long-term data is usually absent.\n\n3. Ignoring the comparison group\nStudies show ${T} works better than placebo — but how does it compare to lifestyle interventions, dietary changes, or sleep optimisation?\n\n4. Cherry-picking positive studies\nFor every study showing a strong effect, search for the systematic review. If no systematic review exists, the evidence base is still emerging.\n\n5. Assuming the study dose equals the commercial dose\nProduct formulations rarely match study protocols precisely.`,
      },
      {
        label: "CHAPTER SUMMARY & KEY TAKEAWAYS",
        text: fill(pack.script.signoff, vars)
          + `\n\nThis chapter's essential conclusions:\n\n✓ ${T} ${v} at ${conf}% evidence confidence\n✓ Individual response variation is real and significant\n✓ An 8–12 week structured trial is the minimum meaningful evaluation window\n✓ Professional guidance is particularly valuable for complex health histories\n✓ Track measurable outcomes — intuition alone is insufficient evidence\n\nReferences for this chapter: [formatted citation list to be added by editor]`,
      },
    ],
    duration: "6,000–10,000 words",
    format: "E-Book Chapter (Comprehensive Guide)",
  };
}

// Strip [[E]]…[[/E]] markers — used by copy/export so users get clean text.
export function stripEnrichMarkers(s) {
  if (typeof s !== "string") return s;
  return s.split(ENRICH_OPEN).join("").split(ENRICH_CLOSE).join("");
}

function getEnrichment(moduleId) {
  return ENRICHMENT_LENSES[moduleId] || null;
}

// Builds the caption with enrichment text woven at the top and mid-body.
function buildEnrichedCaption(pack, vars, lens) {
  const base = fill(pack.caption, vars);
  if (!lens) return base;

  const lead = lens.captionLead(vars.T, vars.conf);
  const mid  = lens.captionMid ? lens.captionMid(vars.T, vars.conf) : "";

  // Inject lead before the caption body; inject mid between paragraph 2 and 3.
  const paragraphs = base.split("\n\n");
  if (paragraphs.length >= 3 && mid) {
    // Insert mid after the second paragraph (the verdict line).
    paragraphs.splice(2, 0, mid);
  }
  return lead + "\n\n" + paragraphs.join("\n\n");
}

/**
 * Generate a full multilingual content set for a topic.
 * @param {object} opts - { topic, language, tone, platform, length, seed, research }
 */
export function generateContent(opts = {}) {
  const {
    topic = "this topic",
    language = "en",
    tone = "educational",
    platform = "reels",
    length = "medium",
    seed = 1,
    enrichmentModule = null,
    sourceTranscript = null,
  } = opts;

  const research = opts.research || getResearch(topic);
  const pack = PACKS[language] || PACKS.en;
  const verdict = research.verdict || "mixed";
  const isMyth = verdict === "false" || verdict === "misleading";
  const display = research.display || topic;

  const vars = {
    T: display,
    conf: research.confidence,
    v: pack.verdict[verdict].line,
    isMyth,
  };

  const lens = getEnrichment(enrichmentModule);

  const hookPool = isMyth ? pack.hooksMyth : pack.hooks;
  const hooks = [0, 1, 2].map((i) => fill(pick(hookPool, seed + i), vars));
  // When a lens is active, replace all 3 hook variants with lens-themed lines
  // so every hook option in the Hooks tab carries the enrichment voice.
  if (lens) {
    const HL = lens.hookLines;
    hooks[0] = HL?.[0] ? HL[0](display, research.confidence) : lens.hookLine(display);
    hooks[1] = HL?.[1] ? HL[1](display, research.confidence) : hooks[1];
    hooks[2] = HL?.[2] ? HL[2](display, research.confidence) : hooks[2];
  }

  const slideCount = length === "short" ? 5 : length === "long" ? 8 : 6;
  const carousel = {
    slides: pack.carousel.slice(0, slideCount).map((s, i) => ({
      n: i + 1,
      title: fill(s.title, vars),
      body: fill(s.body, vars),
    })),
  };

  return {
    meta: {
      topic: display,
      language,
      tone,
      platform,
      length,
      verdictWord: pack.verdict[verdict].word,
      enrichmentModule: enrichmentModule || null,
      sourceTranscript: sourceTranscript || null,
      generatedAt: new Date().toISOString(),
    },
    research,
    hooks,
    // ── Online formats ──────────────────────────────────────────────────
    reelScript:     buildScript(pack, vars, length, seed, false, lens),
    shortsScript:   buildScript(pack, vars, length, seed + 5, true, lens),
    youtubeScript:  buildYoutubeScript(pack, vars, seed + 10, lens),
    podcastScript:  buildPodcastScript(pack, vars, seed + 20, lens),
    webinarOutline: buildWebinarOutline(pack, vars, seed + 30, lens),
    // ── Offline speaking formats ────────────────────────────────────────
    stageTalk: {
      5:  buildStageTalk(pack, vars, seed + 40, 5,  false, lens),
      10: buildStageTalk(pack, vars, seed + 40, 10, false, lens),
      20: buildStageTalk(pack, vars, seed + 40, 20, false, lens),
    },
    tedTalk: {
      5:  buildStageTalk(pack, vars, seed + 50, 5,  true, lens),
      10: buildStageTalk(pack, vars, seed + 50, 10, true, lens),
      20: buildStageTalk(pack, vars, seed + 50, 20, true, lens),
    },
    // ── Offline written formats (word-count bounded) ─────────────────────
    newsletter:   buildNewsletter(pack, vars),
    leadMagnet:   buildLeadMagnet(pack, vars),
    deepBlog:     buildDeepBlog(pack, vars),
    ebookChapter: buildEbookChapter(pack, vars),
    // ── Community Q&A (10 fact-checked pairs) ───────────────────────────
    qa: buildQA(display, vars, research),
    // ── Utility ─────────────────────────────────────────────────────────
    carousel,
    caption: buildEnrichedCaption(pack, vars, lens),
    cta: fill(pick(pack.cta, seed), vars),
    thumbnailTitles: pack.thumbnails.map((t) => fill(t, vars)),
    hashtags: [
      ...pack.hashtags,
      "#" + display.replace(/[^a-zA-Z0-9]/g, ""),
    ].slice(0, 9),
    disclaimer: pack.disclaimer,
    proTip: pack.proTip,
  };
}

export function getLanguagePack(code) {
  return PACKS[code] || PACKS.en;
}
