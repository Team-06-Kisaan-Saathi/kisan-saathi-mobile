const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "invoices.title": "Invoices",
        "invoices.no_inv": "No Invoices",
        "invoices.no_inv_sub": "Accepted deals will appear here for invoice download.",
        "invoices.success": "Invoice downloaded successfully.",
        "invoices.fail": "Failed to download invoice.",
        "invoices.err": "Could not download invoice.",
        "farmer.profile": "Farmer Profile",
        "farmer.no_profile": "No profile saved on this device",
        "farmer.go_login": "Go to Login",
        "farmer.farm_tools": "Farm Tools",
        "farmer.my_crops": "My Crops",
        "farmer.add_crop": "Add Crop",
        "farmer.chg_loc": "Change Location",
        "farmer.reload": "Reload Profile",
        "farmer.logout": "Logout",
        "farmer.name": "Name",
        "farmer.phone": "Phone",
        "farmer.location": "Location",
        "farmer.not_set": "Not set",
        "setup.step": "STEP 1 OF 2",
        "setup.sel_lang": "Select Language",
        "setup.choose_lang": "Choose the language you want to use in the app",
        "setup.continue": "Continue"
    },
    hi: {
        "invoices.title": "चालान (Invoices)",
        "invoices.no_inv": "कोई चालान नहीं",
        "invoices.no_inv_sub": "चालान डाउनलोड के लिए स्वीकृत सौदे यहां दिखाई देंगे।",
        "invoices.success": "चालान सफलतापूर्वक डाउनलोड किया गया।",
        "invoices.fail": "चालान डाउनलोड करने में विफल।",
        "invoices.err": "चालान डाउनलोड नहीं कर सका।",
        "farmer.profile": "किसान प्रोफ़ाइल",
        "farmer.no_profile": "इस डिवाइस पर कोई प्रोफ़ाइल सहेजी नहीं गई है",
        "farmer.go_login": "लॉगिन पर जाएं",
        "farmer.farm_tools": "कृषि उपकरण",
        "farmer.my_crops": "मेरी फसलें",
        "farmer.add_crop": "फसल जोड़ें",
        "farmer.chg_loc": "स्थान बदलें",
        "farmer.reload": "प्रोफ़ाइल पुनः लोड करें",
        "farmer.logout": "लॉग आउट",
        "farmer.name": "नाम",
        "farmer.phone": "फ़ोन",
        "farmer.location": "स्थान",
        "farmer.not_set": "सेट नहीं है",
        "setup.step": "चरण 1 (कुल 2 में से)",
        "setup.sel_lang": "भाषा चुनें",
        "setup.choose_lang": "वह भाषा चुनें जिसे आप ऐप में उपयोग करना चाहते हैं",
        "setup.continue": "जारी रखें"
    },
    ta: {
        "invoices.title": "விலைப்பட்டியல்கள்",
        "invoices.no_inv": "விலைப்பட்டியல்கள் இல்லை",
        "invoices.no_inv_sub": "ஏற்றுக்கொள்ளப்பட்ட ஒப்பந்தங்கள் விலைப்பட்டியல் பதிவிறக்கத்திற்காக இங்கே தோன்றும்.",
        "invoices.success": "விலைப்பட்டியல் வெற்றிகரமாக பதிவிறக்கப்பட்டது.",
        "invoices.fail": "விலைப்பட்டியலை பதிவிறக்க முடியவில்லை.",
        "invoices.err": "விலைப்பட்டியலை பதிவிறக்க முடியவில்லை.",
        "farmer.profile": "விவசாயி சுயவிவரம்",
        "farmer.no_profile": "இந்த சாதனத்தில் சுயவிவரம் சேமிக்கப்படவில்லை",
        "farmer.go_login": "உள்நுழைவுக்குச் செல்லவும்",
        "farmer.farm_tools": "விவசாய கருவிகள்",
        "farmer.my_crops": "எனது பயிர்கள்",
        "farmer.add_crop": "பயிரைச் சேர்",
        "farmer.chg_loc": "இடத்தை மாற்று",
        "farmer.reload": "சுயவிவரத்தை மீண்டும் ஏற்றவும்",
        "farmer.logout": "வெளியேறு",
        "farmer.name": "பெயர்",
        "farmer.phone": "தொலைபேசி",
        "farmer.location": "இடம்",
        "farmer.not_set": "அமைக்கப்படவில்லை",
        "setup.step": "படி 1 (மொத்தம் 2)",
        "setup.sel_lang": "மொழியைத் தேர்ந்தெடுக்கவும்",
        "setup.choose_lang": "பயன்பாட்டில் நீங்கள் பயன்படுத்த விரும்பும் மொழியைத் தேர்வுசெய்க",
        "setup.continue": "தொடரவும்"
    },
    te: {
        "invoices.title": "ఇన్‌వాయిస్‌లు",
        "invoices.no_inv": "ఇన్‌వాయిస్‌లు లేవు",
        "invoices.no_inv_sub": "అంగీకరించబడిన ఒప్పందాలు ఇన్‌వాయిస్ డౌన్‌లోడ్ కోసం ఇక్కడ కనిపిస్తాయి.",
        "invoices.success": "ఇన్‌వాయిస్ విజయవంతంగా డౌన్‌లోడ్ చేయబడింది.",
        "invoices.fail": "ఇన్‌వాయిస్ డౌన్‌లోడ్ విఫలమైంది.",
        "invoices.err": "ఇన్‌వాయిస్‌ను డౌన్‌లోడ్ చేయడం సాధ్యం కాలేదు.",
        "farmer.profile": "రైతు ప్రొఫైల్",
        "farmer.no_profile": "ఈ పరికరంలో ప్రొఫైల్ ఏదీ సేవ్ చేయబడలేదు",
        "farmer.go_login": "లాగిన్‌కి వెళ్లండి",
        "farmer.farm_tools": "వ్యవసాయ సాధనాలు",
        "farmer.my_crops": "నా పంటలు",
        "farmer.add_crop": "పంటను జోడించండి",
        "farmer.chg_loc": "స్థానాన్ని మార్చండి",
        "farmer.reload": "ప్రొఫైల్‌ను మళ్లీ లోడ్ చేయండి",
        "farmer.logout": "లాగ్ అవుట్",
        "farmer.name": "పేరు",
        "farmer.phone": "ఫోన్",
        "farmer.location": "స్థానం",
        "farmer.not_set": "సెట్ చేయబడలేదు",
        "setup.step": "దశ 1 (మొత్తం 2)",
        "setup.sel_lang": "భాషను ఎంచుకోండి",
        "setup.choose_lang": "మీరు యాప్‌లో ఉపయోగించాలనుకుంటున్న భాషను ఎంచుకోండి",
        "setup.continue": "కొనసాగించండి"
    },
    ml: {
        "invoices.title": "ഇൻവോയ്‌സുകൾ",
        "invoices.no_inv": "ഇൻവോയ്‌സുകളൊന്നുമില്ല",
        "invoices.no_inv_sub": "ഇൻവോയ്‌സ് ഡൗൺലോഡിനായി അംഗീകരിച്ച ഡീലുകൾ ഇവിടെ ദൃശ്യമാകും.",
        "invoices.success": "ഇൻവോയ്‌സ് വിജയകരമായി ഡൗൺലോഡ് ചെയ്‌തു.",
        "invoices.fail": "ഇൻവോയ്‌സ് ഡൗൺലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.",
        "invoices.err": "ഇൻവോയ്‌സ് ഡൗൺലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",
        "farmer.profile": "കർഷകൻ്റെ പ്രൊഫൈൽ",
        "farmer.no_profile": "ഈ ഉപകരണത്തിൽ പ്രൊഫൈലുകളൊന്നും സേവ് ചെയ്തിട്ടില്ല",
        "farmer.go_login": "ലോഗിനിലേക്ക് പോകുക",
        "farmer.farm_tools": "കാർഷിക ഉപകരണങ്ങൾ",
        "farmer.my_crops": "എന്റെ വിളകൾ",
        "farmer.add_crop": "വിള ചേർക്കുക",
        "farmer.chg_loc": "സ്ഥലം മാറ്റുക",
        "farmer.reload": "പ്രൊഫൈൽ വീണ്ടും ലോഡുചെയ്യുക",
        "farmer.logout": "ലോഗ് ഔട്ട്",
        "farmer.name": "പേര്",
        "farmer.phone": "ഫോൺ",
        "farmer.location": "സ്ഥലം",
        "farmer.not_set": "സജ്ജമാക്കിയിട്ടില്ല",
        "setup.step": "ഘട്ടം 1 (ആകെ 2)",
        "setup.sel_lang": "ഭാഷ തിരഞ്ഞെടുക്കുക",
        "setup.choose_lang": "ആപ്പിൽ നിങ്ങൾ ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്ന ഭാഷ തിരഞ്ഞെടുക്കുക",
        "setup.continue": "തുടരുക"
    }
};

const i18nDir = path.join(__dirname, 'i18n');

for (const [lang, tData] of Object.entries(translations)) {
    const filePath = path.join(i18nDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) continue;

    let currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const [keyPath, value] of Object.entries(tData)) {
        const parts = keyPath.split('.');
        if (!currentData[parts[0]]) {
            currentData[parts[0]] = {};
        }
        currentData[parts[0]][parts[1]] = value;
    }

    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`Updated ${filePath}`);
}
