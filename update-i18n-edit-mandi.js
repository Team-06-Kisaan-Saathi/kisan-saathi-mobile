const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "edit_profile.title": "Edit Profile",
        "edit_profile.full_name": "Full Name",
        "edit_profile.name_ph": "Enter your name",
        "edit_profile.phone": "Phone Number",
        "edit_profile.phone_ph": "10-digit mobile number",
        "edit_profile.phone_hint": "Changing phone requires OTP verification",
        "edit_profile.enter_otp": "Enter OTP",
        "edit_profile.otp_ph": "Enter 6-digit OTP",
        "edit_profile.resend": "Didn't get code? Resend",
        "edit_profile.pref_lang": "Preferred Language",
        "edit_profile.btn_verify_save": "Verify & Save",
        "edit_profile.btn_send_otp": "Send OTP",
        "edit_profile.btn_save": "Save Changes",
        "mandi.title": "Market Explorer",
        "mandi.page_title": "Mandi Prices",
        "mandi.last_synced": "Last synced:"
    },
    hi: {
        "edit_profile.title": "प्रोफ़ाइल संपादित करें",
        "edit_profile.full_name": "पूरा नाम",
        "edit_profile.name_ph": "अपना नाम दर्ज करें",
        "edit_profile.phone": "फ़ोन नंबर",
        "edit_profile.phone_ph": "10 अंकों का मोबाइल नंबर",
        "edit_profile.phone_hint": "फ़ोन नंबर बदलने के लिए OTP सत्यापन की आवश्यकता है",
        "edit_profile.enter_otp": "OTP दर्ज करें",
        "edit_profile.otp_ph": "6 अंकों का OTP दर्ज करें",
        "edit_profile.resend": "कोड नहीं मिला? पुनः भेजें",
        "edit_profile.pref_lang": "पसंदीदा भाषा",
        "edit_profile.btn_verify_save": "सत्यापित करें और सहेजें",
        "edit_profile.btn_send_otp": "OTP भेजें",
        "edit_profile.btn_save": "परिवर्तन सहेजें",
        "mandi.title": "मार्केट एक्सप्लोरर",
        "mandi.page_title": "मंडी भाव",
        "mandi.last_synced": "अंतिम बार सिंक किया गया:"
    },
    ta: {
        "edit_profile.title": "சுயவிவரத்தை திருத்து",
        "edit_profile.full_name": "முழு பெயர்",
        "edit_profile.name_ph": "உங்கள் பெயரை உள்ளிடவும்",
        "edit_profile.phone": "தொலைபேசி எண்",
        "edit_profile.phone_ph": "10 இலக்க மொபைல் எண்",
        "edit_profile.phone_hint": "தொலைபேசி எண்ணை மாற்ற OTP சரிபார்ப்பு தேவை",
        "edit_profile.enter_otp": "OTP ஐ உள்ளிடவும்",
        "edit_profile.otp_ph": "6 இலக்க OTP ஐ உள்ளிடவும்",
        "edit_profile.resend": "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
        "edit_profile.pref_lang": "விருப்பமான மொழி",
        "edit_profile.btn_verify_save": "சரிபார்த்து சேமி",
        "edit_profile.btn_send_otp": "OTP ஐ அனுப்பு",
        "edit_profile.btn_save": "மாற்றங்களை சேமி",
        "mandi.title": "சந்தை எக்ஸ்ப்ளோரர்",
        "mandi.page_title": "மண்டி விலைகள்",
        "mandi.last_synced": "கடைசியாக ஒத்திசைக்கப்பட்டது:"
    },
    te: {
        "edit_profile.title": "ప్రొఫైల్‌ను సవరించండి",
        "edit_profile.full_name": "పూర్తి పేరు",
        "edit_profile.name_ph": "మీ పేరును నమోదు చేయండి",
        "edit_profile.phone": "ఫోన్ నంబర్",
        "edit_profile.phone_ph": "10 అంకెల మొబైల్ నంబర్",
        "edit_profile.phone_hint": "ఫోన్ నంబర్ మార్చడానికి OTP ధృవీకరణ అవసరం",
        "edit_profile.enter_otp": "OTP ని నమోదు చేయండి",
        "edit_profile.otp_ph": "6 అంకెల OTP ని నమోదు చేయండి",
        "edit_profile.resend": "కోడ్ అందలేదా? మళ్లీ పంపండి",
        "edit_profile.pref_lang": "ప్రాధాన్య భాష",
        "edit_profile.btn_verify_save": "ధృవీకరించండి మరియు భద్రపరుచు",
        "edit_profile.btn_send_otp": "OTP పంపండి",
        "edit_profile.btn_save": "మార్పులను సేవ్ చేయండి",
        "mandi.title": "మార్కెట్ ఎక్స్‌ప్లోరర్",
        "mandi.page_title": "మండి ధరలు",
        "mandi.last_synced": "చివరిగా సమకాలీకరించబడింది:"
    },
    ml: {
        "edit_profile.title": "പ്രൊഫൈൽ എഡിറ്റുചെയ്യുക",
        "edit_profile.full_name": "പൂർണ്ണമായ പേര്",
        "edit_profile.name_ph": "നിങ്ങളുടെ പേര് നൽകുക",
        "edit_profile.phone": "ഫോൺ നമ്പർ",
        "edit_profile.phone_ph": "10 അക്ക മൊബൈൽ നമ്പർ",
        "edit_profile.phone_hint": "ഫോൺ നമ്പർ മാറ്റുന്നതിന് OTP പരിശോധന ആവശ്യമാണ്",
        "edit_profile.enter_otp": "OTP നൽകുക",
        "edit_profile.otp_ph": "6 അക്ക OTP നൽകുക",
        "edit_profile.resend": "കോഡ് ലഭിച്ചില്ലേ? വീണ്ടും അയയ്ക്കുക",
        "edit_profile.pref_lang": "തിരഞ്ഞെടുത്ത ഭാഷ",
        "edit_profile.btn_verify_save": "പരിശോധിച്ച് സംരക്ഷിക്കുക",
        "edit_profile.btn_send_otp": "OTP അയയ്ക്കുക",
        "edit_profile.btn_save": "മാറ്റങ്ങൾ സംരക്ഷിക്കുക",
        "mandi.title": "മാർക്കറ്റ് എക്സ്പ്ലോറർ",
        "mandi.page_title": "മണ്ടി വിലകൾ",
        "mandi.last_synced": "അവസാനം സമന്വയിപ്പിച്ചത്:"
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
