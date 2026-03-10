const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "auth.verify_required": "VERIFICATION REQUIRED",
        "auth.verify_identity": "Verify Identity",
        "auth.verify_subtitle_phone": "We've sent a 6-digit code to",
        "auth.verify_continue": "Verify & Continue",
        "auth.resend_code": "Resend Code",
        "auth.session_missing": "Required session details missing. Please restart.",
        "auth.pin_mismatch": "PINs do not match",
        "auth.security_config": "SECURITY CONFIGURATION",
        "auth.create_pin_title": "Create Access PIN",
        "auth.create_pin_desc": "Establish a secure PIN to protect your account and transactions.",
        "auth.new_pin": "New PIN",
        "auth.verify_pin_label": "Verify PIN",
        "auth.secure_account": "Secure Account"
    },
    hi: {
        "auth.verify_required": "सत्यापन आवश्यक",
        "auth.verify_identity": "पहचान सत्यापित करें",
        "auth.verify_subtitle_phone": "हमने आपके नंबर पर 6-अंकीय कोड भेजा है",
        "auth.verify_continue": "सत्यापित करें और आगे बढ़ें",
        "auth.resend_code": "कोड पुनः भेजें",
        "auth.session_missing": "आवश्यक सत्र विवरण गायब हैं। कृपया पुनरारंभ करें।",
        "auth.pin_mismatch": "PIN मेल नहीं खाते",
        "auth.security_config": "सुरक्षा विन्यास",
        "auth.create_pin_title": "एक्सेस PIN बनाएं",
        "auth.create_pin_desc": "अपने खाते और लेनदेन की सुरक्षा के लिए एक सुरक्षित PIN स्थापित करें।",
        "auth.new_pin": "नया PIN",
        "auth.verify_pin_label": "PIN सत्यापित करें",
        "auth.secure_account": "सुरक्षित खाता"
    },
    ta: {
        "auth.verify_required": "சரிபார்த்தல் அவசியம்",
        "auth.verify_identity": "அடையாளத்தை சரிபார்க்கவும்",
        "auth.verify_subtitle_phone": "உங்கள் எண்ணுக்கு 6 இலக்க குறியீட்டை அனுப்பியுள்ளோம்",
        "auth.verify_continue": "சரிபார்த்து தொடரவும்",
        "auth.resend_code": "குறியீட்டை மீண்டும் அனுப்பு",
        "auth.session_missing": "தேவையான அமர்வு விவரங்கள் விடுபட்டுள்ளன. தயவுசெய்து மறுதொடக்கம் செய்யவும்.",
        "auth.pin_mismatch": "PIN பொருந்தவில்லை",
        "auth.security_config": "பாதுகாப்பு கட்டமைப்பு",
        "auth.create_pin_title": "அணுகல் PIN ஐ உருவாக்கவும்",
        "auth.create_pin_desc": "உங்கள் கணக்கு மற்றும் பரிவர்த்தனைகளைப் பாதுகாக்க பாதுகாப்பான PIN ஐ நிறுவவும்.",
        "auth.new_pin": "புதிய PIN",
        "auth.verify_pin_label": "PIN ஐ சரிபார்க்கவும்",
        "auth.secure_account": "கணக்கைப் பாதுகாக்கவும்"
    },
    te: {
        "auth.verify_required": "ధృవీకరణ అవసరం",
        "auth.verify_identity": "గుర్తింపును ధృవీకరించండి",
        "auth.verify_subtitle_phone": "మేము ఒక 6-అంకెల కోడ్‌ని పంపాము",
        "auth.verify_continue": "ధృవీకరించి కొనసాగండి",
        "auth.resend_code": "కోడ్‌ను మళ్లీ పంపండి",
        "auth.session_missing": "అవసరమైన సెషన్ వివరాలు లేవు. దయచేసి పునఃప్రారంభించండి.",
        "auth.pin_mismatch": "PIN లు సరిపోలడం లేదు",
        "auth.security_config": "భద్రతా కాన్ఫిగరేషన్",
        "auth.create_pin_title": "యాక్సెస్ PIN ను సృష్టించండి",
        "auth.create_pin_desc": "మీ ఖాతా మరియు లావాదేవీలను రక్షించడానికి సురక్షితమైన PIN ని ఏర్పాటు చేయండి.",
        "auth.new_pin": "కొత్త PIN",
        "auth.verify_pin_label": "PIN ని ధృవీకరించండి",
        "auth.secure_account": "సురక్షిత ఖాతా"
    },
    ml: {
        "auth.verify_required": "സ്ഥിരീകരണം ആവശ്യമാണ്",
        "auth.verify_identity": "തിരിച്ചറിയൽ സ്ഥിരീകരിക്കുക",
        "auth.verify_subtitle_phone": "ഞങ്ങൾ ഒരു 6-അക്ക കോഡ് അയച്ചിട്ടുണ്ട്",
        "auth.verify_continue": "സ്ഥിരീകരിച്ച് തുടരുക",
        "auth.resend_code": "കോഡ് വീണ്ടും അയയ്‌ക്കുക",
        "auth.session_missing": "ആവശ്യമായ സെഷൻ വിവരങ്ങൾ കാണുന്നില്ല. ദയവായി പുനരാരംഭിക്കുക.",
        "auth.pin_mismatch": "PIN-കൾ പൊരുത്തപ്പെടുന്നില്ല",
        "auth.security_config": "സുരക്ഷാ കോൺഫിഗറേഷൻ",
        "auth.create_pin_title": "ആക്സസ് PIN സൃഷ്ടിക്കുക",
        "auth.create_pin_desc": "നിങ്ങളുടെ അക്കൗണ്ടും ഇടപാടുകളും പരിരക്ഷിക്കുന്നതിന് ഒരു സുരക്ഷിത PIN സ്ഥാപിക്കുക.",
        "auth.new_pin": "പുതിയ PIN",
        "auth.verify_pin_label": "PIN സ്ഥിരീകരിക്കുക",
        "auth.secure_account": "സുരക്ഷിത അക്കൗണ്ട്"
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
