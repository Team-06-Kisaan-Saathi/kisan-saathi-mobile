const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "not_avail.title": "Feature Not Available",
        "not_avail.sub": "This feature is not available in the current build of Agri Bazaar.",
        "not_avail.back": "Go Back",
        "verif.title_appr": "You are Verified!",
        "verif.title_req": "Verification Request",
        "verif.sub_appr": "Your account is verified. You can now list crops and close deals with buyers.",
        "verif.sub_req": "Verifying your identity helps build trust with buyers and allows you to sell faster.",
        "verif.success": "Verified Seller Account",
        "verif.pending": "Verification Pending Audit",
        "verif.aadhaar_label": "Aadhaar Number (12 digits)",
        "verif.aadhaar_ph": "0000 0000 0000",
        "verif.pan_label": "PAN Number (10 characters)",
        "verif.pan_ph": "ABCDE1234F",
        "verif.submit": "Submit Documents",
        "verif.err_aadhaar": "Please enter a valid 12-digit Aadhaar number.",
        "verif.err_pan": "Please enter a valid 10-character PAN number.",
        "verif.invalid_aadhaar": "Invalid Aadhaar",
        "verif.invalid_pan": "Invalid PAN",
        "verif.success_msg": "Verification request submitted successfully.",
        "verif.success_title": "Success",
        "verif.err_title": "Error",
        "verif.err_submit": "Submission failed.",
        "verif.err_generic": "Something went wrong. Please try again.",
        "verif.screen_title": "Verify Account"
    },
    hi: {
        "not_avail.title": "सुविधा उपलब्ध नहीं है",
        "not_avail.sub": "यह सुविधा एग्री बाज़ार के वर्तमान संस्करण में उपलब्ध नहीं है।",
        "not_avail.back": "वापस जाएँ",
        "verif.title_appr": "आप सत्यापित हैं!",
        "verif.title_req": "सत्यापन अनुरोध",
        "verif.sub_appr": "आपका खाता सत्यापित है। अब आप फसलें सूचीबद्ध कर सकते हैं और खरीदारों के साथ सौदे पक्के कर सकते हैं।",
        "verif.sub_req": "आपकी पहचान सत्यापित करने से खरीदारों के साथ विश्वास बनाने में मदद मिलती है और आप तेजी से बेच पाते हैं।",
        "verif.success": "सत्यापित विक्रेता खाता",
        "verif.pending": "सत्यापन लंबित",
        "verif.aadhaar_label": "आधार संख्या (12 अंक)",
        "verif.aadhaar_ph": "0000 0000 0000",
        "verif.pan_label": "पैन संख्या (10 वर्ण)",
        "verif.pan_ph": "ABCDE1234F",
        "verif.submit": "दस्तावेज़ जमा करें",
        "verif.err_aadhaar": "कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।",
        "verif.err_pan": "कृपया 10 अक्षरों का वैध पैन नंबर दर्ज करें।",
        "verif.invalid_aadhaar": "अमान्य आधार",
        "verif.invalid_pan": "अमान्य पैन",
        "verif.success_msg": "सत्यापन अनुरोध सफलतापूर्वक सबमिट किया गया।",
        "verif.success_title": "सफलता",
        "verif.err_title": "त्रुटि",
        "verif.err_submit": "सबमिशन विफल।",
        "verif.err_generic": "कुछ गलत हो गया। कृपया पुन: प्रयास करें।",
        "verif.screen_title": "खाता सत्यापित करें"
    },
    ta: {
        "not_avail.title": "அம்சம் கிடைக்கவில்லை",
        "not_avail.sub": "அக்ரி பஜாரின் தற்போதைய பதிப்பில் இந்த அம்சம் கிடைக்கவில்லை.",
        "not_avail.back": "திரும்பிச் செல்",
        "verif.title_appr": "நீங்கள் சரிபார்க்கப்பட்டீர்கள்!",
        "verif.title_req": "சரிபார்ப்பு கோரிக்கை",
        "verif.sub_appr": "உங்கள் கணக்கு சரிபார்க்கப்பட்டது. நீங்கள் இப்போது பயிர்களைப் பட்டியலிடலாம் மற்றும் வாங்குபவர்களுடன் ஒப்பந்தங்களைச் செய்யலாம்.",
        "verif.sub_req": "உங்கள் அடையாளத்தைச் சரிபார்ப்பது வாங்குபவர்களிடம் நம்பிக்கையை வளர்க்க உதவுகிறது, மேலும் வேகமாக விற்கவும் அனுமதிக்கிறது.",
        "verif.success": "சரிபார்க்கப்பட்ட விற்பனையாளர் கணக்கு",
        "verif.pending": "சரிபார்ப்பு நிலுவையில் உள்ளது",
        "verif.aadhaar_label": "ஆதார் எண் (12 எண்கள்)",
        "verif.aadhaar_ph": "0000 0000 0000",
        "verif.pan_label": "பான் எண் (10 எழுத்துக்கள்)",
        "verif.pan_ph": "ABCDE1234F",
        "verif.submit": "ஆவணங்களை சமர்ப்பி",
        "verif.err_aadhaar": "சரியான 12-இலக்க ஆதார் எண்ணை உள்ளிடவும்.",
        "verif.err_pan": "சரியான 10-எழுத்து பான் எண்ணை உள்ளிடவும்.",
        "verif.invalid_aadhaar": "தவறான ஆதார்",
        "verif.invalid_pan": "தவறான பான்",
        "verif.success_msg": "சரிபார்ப்பு கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",
        "verif.success_title": "வெற்றி",
        "verif.err_title": "பிழை",
        "verif.err_submit": "சமர்ப்பித்தல் தோல்வியடைந்தது.",
        "verif.err_generic": "ஏதோ தவறு நடந்துவிட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        "verif.screen_title": "கணக்கை சரிபார்க்கவும்"
    },
    te: {
        "not_avail.title": "ఫీచర్ అందుబాటులో లేదు",
        "not_avail.sub": "అగ్రి బజార్ యొక్క ప్రస్తుత నిర్మాణంలో ఈ ఫీచర్ అందుబాటులో లేదు.",
        "not_avail.back": "వెనక్కి వెళ్ళు",
        "verif.title_appr": "మీరు ధృవీకరించబడ్డారు!",
        "verif.title_req": "ధృవీకరణ అభ్యర్థన",
        "verif.sub_appr": "మీ ఖాతా ధృవీకరించబడింది. మీరు ఇప్పుడు పంటలను జాబితా చేయవచ్చు మరియు కొనుగోలుదారులతో ఒప్పందాలు చేసుకోవచ్చు.",
        "verif.sub_req": "మీ గుర్తింపును ధృవీకరించడం కొనుగోలుదారులతో నమ్మకాన్ని పెంచడంలో సహాయపడుతుంది మరియు మీరు వేగంగా విక్రయించడానికి అనుమతిస్తుంది.",
        "verif.success": "ధృవీకరించబడిన విక్రేత ఖాతా",
        "verif.pending": "ధృవీకరణ పెండింగ్‌లో ఉంది",
        "verif.aadhaar_label": "ఆధార్ సంఖ్య (12 అంకెలు)",
        "verif.aadhaar_ph": "0000 0000 0000",
        "verif.pan_label": "పాన్ సంఖ్య (10 అక్షరాలు)",
        "verif.pan_ph": "ABCDE1234F",
        "verif.submit": "పత్రాలను సమర్పించండి",
        "verif.err_aadhaar": "దయచేసి చెల్లుబాటు అయ్యే 12-అంకెల ఆధార్ నంబర్‌ను నమోదు చేయండి.",
        "verif.err_pan": "దయచేసి చెల్లుబాటు అయ్యే 10-అక్షరాల పాన్ నంబర్‌ను నమోదు చేయండి.",
        "verif.invalid_aadhaar": "చెల్లని ఆధార్",
        "verif.invalid_pan": "చెల్లని పాన్",
        "verif.success_msg": "ధృవీకరణ అభ్యర్థన విజయవంతంగా సమర్పించబడింది.",
        "verif.success_title": "విజయం",
        "verif.err_title": "లోపం",
        "verif.err_submit": "సమర్పణ విఫలమైంది.",
        "verif.err_generic": "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        "verif.screen_title": "ఖాతాను ధృవీకరించండి"
    },
    ml: {
        "not_avail.title": "സവിശേഷത ലഭ്യമല്ല",
        "not_avail.sub": "അഗ്രി ബസാറിന്റെ നിലവിലെ പതിപ്പിൽ ഈ സവിശേഷത ലഭ്യമല്ല.",
        "not_avail.back": "മടങ്ങുക",
        "verif.title_appr": "നിങ്ങൾ പരിശോധിക്കപ്പെട്ടു!",
        "verif.title_req": "പരിശോധന അഭ്യർത്ഥന",
        "verif.sub_appr": "നിങ്ങളുടെ അക്കൗണ്ട് പരിശോധിച്ചു. നിങ്ങൾക്ക് ഇപ്പോൾ വിളകൾ പട്ടികപ്പെടുത്താനും വാങ്ങുന്നവരുമായി കരാറുകൾ ഉറപ്പിക്കാനും കഴിയും.",
        "verif.sub_req": "നിങ്ങളുടെ വ്യക്തിത്വം പരിശോധിക്കുന്നത് വാങ്ങുന്നവരുമായി വിശ്വാസം വളർത്താൻ സഹായിക്കുകയും നിങ്ങളെ വേഗത്തിൽ വിൽക്കാൻ അനുവദിക്കുകയും ചെയ്യുന്നു.",
        "verif.success": "സ്ഥിരീകരിച്ച വിൽപ്പനക്കാരന്റെ അക്കൗണ്ട്",
        "verif.pending": "പരിശോധന തീർപ്പുകൽപ്പിച്ചിട്ടില്ല",
        "verif.aadhaar_label": "ആധാർ നമ്പർ (12 അക്കങ്ങൾ)",
        "verif.aadhaar_ph": "0000 0000 0000",
        "verif.pan_label": "പാൻ നമ്പർ (10 അക്ഷരങ്ങൾ)",
        "verif.pan_ph": "ABCDE1234F",
        "verif.submit": "രേഖകൾ സമർപ്പിക്കുക",
        "verif.err_aadhaar": "ദയവായി സാധുവായ 12 അക്ക ആധാർ നമ്പർ നൽകുക.",
        "verif.err_pan": "ദയവായി സാധുവായ 10 അക്ക പാൻ നമ്പർ നൽകുക.",
        "verif.invalid_aadhaar": "അസാധുവായ ആധാർ",
        "verif.invalid_pan": "അസാധുവായ പാൻ",
        "verif.success_msg": "പരിശോധനാ അഭ്യർത്ഥന വിജയകരമായി സമർപ്പിച്ചു.",
        "verif.success_title": "വിജയം",
        "verif.err_title": "പിശക്",
        "verif.err_submit": "സമർപ്പിക്കൽ പരാജയപ്പെട്ടു.",
        "verif.err_generic": "എന്തോ കുഴപ്പമുണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
        "verif.screen_title": "അക്കൗണ്ട് പരിശോധിക്കുക"
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
