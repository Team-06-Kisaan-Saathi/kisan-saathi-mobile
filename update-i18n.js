const fs = require('fs');
const path = require('path');

const translations = {
    hi: {
        "signup.provide_all_details": "कृपया सभी विवरण सही ढंग से प्रदान करें",
        "signup.simulated_otp_title": "नकली OTP",
        "signup.simulated_otp_msg": "आपका सत्यापन कोड है: ",
        "signup.tagline": "कृषि समुदाय का हिस्सा बनें",
        "signup.registration": "पंजीकरण",
        "signup.full_name": "पूरा नाम",
        "signup.name_placeholder": "उदा: राजेश कुमार",
        "signup.primary_role": "प्राथमिक भूमिका",
        "signup.farmer_producer": "किसान / उत्पादक",
        "signup.buyer_trader": "खरीदार / व्यापारी",
        "signup.mobile_number": "मोबाइल नंबर",
        "signup.mobile_placeholder": "10-अंकों का नंबर",
        "signup.proceed_verify": "सत्यापन के लिए आगे बढ़ें",
        "auth.pin_length_error": "PIN 4 से 6 अंकों का होना चाहिए",
        "auth.invalid_server_response": "अवैध सर्वर प्रतिक्रिया प्रारूप",
        "auth.connection_failed": "कनेक्शन विफल. बैकएंड की जांच करें.",
        "auth.enter_pin": "PIN दर्ज करें",
        "auth.logging_in": "लॉग इन किया जा रहा है..."
    },
    ta: {
        "signup.provide_all_details": "அனைத்து விவரங்களையும் சரியாக வழங்கவும்",
        "signup.simulated_otp_title": "உருவாக்கப்பட்ட OTP",
        "signup.simulated_otp_msg": "உங்கள் சரிபார்ப்புக் குறியீடு: ",
        "signup.tagline": "விவசாய சமூகத்தின் ஒரு பகுதியாகுங்கள்",
        "signup.registration": "பதிவு",
        "signup.full_name": "முழு பெயர்",
        "signup.name_placeholder": "எ.கா: ராஜேஷ் குமார்",
        "signup.primary_role": "முதன்மை பங்கு",
        "signup.farmer_producer": "விவசாயி / உற்பத்தியாளர்",
        "signup.buyer_trader": "வாங்குபவர் / வியாபாரி",
        "signup.mobile_number": "அலைபேசி எண்",
        "signup.mobile_placeholder": "10-இலக்க எண்",
        "signup.proceed_verify": "சரிபார்க்க தொடரவும்",
        "auth.pin_length_error": "PIN 4 முதல் 6 இலக்கங்களாக இருக்க வேண்டும்",
        "auth.invalid_server_response": "தவறான சேவையக பதில்",
        "auth.connection_failed": "இணைப்பு தோல்வியடைந்தது. பின்தளத்தை சரிபார்க்கவும்.",
        "auth.enter_pin": "PIN ஐ உள்ளிடவும்",
        "auth.logging_in": "உள்நுழைகிறது..."
    },
    te: {
        "signup.provide_all_details": "దయచేసి అన్ని వివరాలను సరిగ్గా అందించండి",
        "signup.simulated_otp_title": "సృష్టించిన OTP",
        "signup.simulated_otp_msg": "మీ ధృవీకరణ కోడ్: ",
        "signup.tagline": "వ్యవసాయ సంఘంలో భాగం కండి",
        "signup.registration": "నమోదు",
        "signup.full_name": "పూర్తి పేరు",
        "signup.name_placeholder": "ఉదా: రాజేష్ కుమార్",
        "signup.primary_role": "ప్రాథమిక పాత్ర",
        "signup.farmer_producer": "రైతు / ఉత్పత్తిదారు",
        "signup.buyer_trader": "కొనుగోలుదారు / వర్తకుడు",
        "signup.mobile_number": "మొబైల్ నంబర్",
        "signup.mobile_placeholder": "10-అంకెల సంఖ్య",
        "signup.proceed_verify": "ధృవీకరించడానికి కొనసాగండి",
        "auth.pin_length_error": "PIN 4 నుండి 6 అంకెలు ఉండాలి",
        "auth.invalid_server_response": "చెల్లని సర్వర్ ప్రతిస్పందన ఫార్మాట్",
        "auth.connection_failed": "కనెక్షన్ విఫలమైంది. బ్యాకెండ్‌ను తనిఖీ చేయండి.",
        "auth.enter_pin": "PIN నమోదు చేయండి",
        "auth.logging_in": "లాగిన్ అవుతోంది..."
    },
    ml: {
        "signup.provide_all_details": "എല്ലാ വിവരങ്ങളും കൃത്യമായി നൽകുക",
        "signup.simulated_otp_title": "സൃഷ്ടിച്ച OTP",
        "signup.simulated_otp_msg": "നിങ്ങളുടെ സ്ഥിരീകരണ കോഡ്: ",
        "signup.tagline": "കർഷക സമൂഹത്തിന്റെ ഭാഗമാകുക",
        "signup.registration": "രജിസ്ട്രേഷൻ",
        "signup.full_name": "മുഴുവൻ പേര്",
        "signup.name_placeholder": "ഉദാ: രാജேஷ் കുമാർ",
        "signup.primary_role": "പ്രധാന പങ്ക്",
        "signup.farmer_producer": "കർഷകൻ / നിർമ്മാതാവ്",
        "signup.buyer_trader": "വാങ്ങുന്നയാൾ / വ്യാപാരി",
        "signup.mobile_number": "മൊബൈൽ നമ്പർ",
        "signup.mobile_placeholder": "10-അക്ക നമ്പർ",
        "signup.proceed_verify": "സ്ഥിരീകരിക്കുന്നതിന് തുടരുക",
        "auth.pin_length_error": "PIN 4 മുതൽ 6 അക്കങ്ങൾ ആയിരിക്കണം",
        "auth.invalid_server_response": "അസാധുവായ സെർവർ പ്രതികരണം",
        "auth.connection_failed": "കണക്ഷൻ പരാജയപ്പെട്ടു. ബാക്കെൻഡ് പരിശോധിക്കുക.",
        "auth.enter_pin": "PIN നൽകുക",
        "auth.logging_in": "ലോഗിൻ ചെയ്യുന്നു..."
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
