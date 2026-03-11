const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "nav.brand": "KrishiConnect",
        "nav.brand_agri": "Agri Bazaar",
        "nav.buyer_acc": "Buyer Account",
        "nav.farmer_acc": "Farmer Account",

        "mktcomp.tot_crops": "Total Crops",
        "mktcomp.high_price": "Highest Price",
        "mktcomp.low_price": "Lowest Price",
        "mktcomp.avg_price": "Avg Price",
        "mktcomp.per_q": "per quintal",
        "mktcomp.loading": "Loading market data...",
        "mktcomp.col_crop": "Crop",
        "mktcomp.col_mandi": "Market",
        "mktcomp.col_price": "Price",
        "mktcomp.filter": "Market",
        "mktcomp.sort": "Sort By",

        "access.title": "Accessibility",
        "access.text_size": "Text size",
        "access.high_const": "High Contrast",
        "access.zoom": "Zoom & Pinch support",
        "access.lang": "Language",
        "access.done": "Done"
    },
    hi: {
        "nav.brand": "कृषि कनेक्ट",
        "nav.brand_agri": "एग्री बाज़ार",
        "nav.buyer_acc": "खरीदार खाता",
        "nav.farmer_acc": "किसान खाता",

        "mktcomp.tot_crops": "कुल फसलें",
        "mktcomp.high_price": "उच्चतम मूल्य",
        "mktcomp.low_price": "न्यूनतम मूल्य",
        "mktcomp.avg_price": "औसत मूल्य",
        "mktcomp.per_q": "प्रति क्विंटल",
        "mktcomp.loading": "बाजार का डेटा लोड हो रहा है...",
        "mktcomp.col_crop": "फसल",
        "mktcomp.col_mandi": "मंडी",
        "mktcomp.col_price": "मूल्य",
        "mktcomp.filter": "मंडी",
        "mktcomp.sort": "क्रमबद्ध करें",

        "access.title": "एक्सेसिबिलिटी",
        "access.text_size": "टेक्स्ट का आकार",
        "access.high_const": "उच्च कंट्रास्ट",
        "access.zoom": "ज़ूम और पिंच सपोर्ट",
        "access.lang": "भाषा",
        "access.done": "पूर्ण"
    },
    ta: {
        "nav.brand": "கிரிஷி கனெக்ட்",
        "nav.brand_agri": "அக்ரி பஜார்",
        "nav.buyer_acc": "வாங்குபவர் கணக்கு",
        "nav.farmer_acc": "விவசாயி கணக்கு",

        "mktcomp.tot_crops": "மொத்த பயிர்கள்",
        "mktcomp.high_price": "அதிகபட்ச விலை",
        "mktcomp.low_price": "குறைந்தபட்ச விலை",
        "mktcomp.avg_price": "சராசரி விலை",
        "mktcomp.per_q": "ஒரு குவிண்டாலுக்கு",
        "mktcomp.loading": "சந்தை தரவு ஏற்றப்படுகிறது...",
        "mktcomp.col_crop": "பயிர்",
        "mktcomp.col_mandi": "சந்தை",
        "mktcomp.col_price": "விலை",
        "mktcomp.filter": "சந்தை",
        "mktcomp.sort": "வரிசைப்படுத்து",

        "access.title": "அணுகல்தன்மை",
        "access.text_size": "உரை அளவு",
        "access.high_const": "அதிக மாறுபாடு",
        "access.zoom": "பெரிதாக்குதல் ஆதரவு",
        "access.lang": "மொழி",
        "access.done": "முடிந்தது"
    },
    te: {
        "nav.brand": "కృషి కనెక్ట్",
        "nav.brand_agri": "అగ్రి బజార్",
        "nav.buyer_acc": "కొనుగోలుదారు ఖాతా",
        "nav.farmer_acc": "రైతు ఖాతా",

        "mktcomp.tot_crops": "మొత్తం పంటలు",
        "mktcomp.high_price": "అత్యధిక ధర",
        "mktcomp.low_price": "అత్యల్ప ధర",
        "mktcomp.avg_price": "సగటు ధర",
        "mktcomp.per_q": "క్వింటాల్‌కు",
        "mktcomp.loading": "మార్కెట్ డేటా లోడ్ అవుతోంది...",
        "mktcomp.col_crop": "పంట",
        "mktcomp.col_mandi": "మార్కెట్",
        "mktcomp.col_price": "ధర",
        "mktcomp.filter": "మార్కెట్",
        "mktcomp.sort": "క్రమబద్ధీకరించు",

        "access.title": "ప్రాప్యత",
        "access.text_size": "టెక్స్ట్ పరిమాణం",
        "access.high_const": "అధిక కాంట్రాస్ట్",
        "access.zoom": "జూమ్ మరియు పించ్ సపోర్ట్",
        "access.lang": "భాష",
        "access.done": "పూర్తయింది"
    },
    ml: {
        "nav.brand": "കൃഷി കണക്റ്റ്",
        "nav.brand_agri": "അഗ്രി ബസാർ",
        "nav.buyer_acc": "വാങ്ങുന്നയാളുടെ അക്കൗണ്ട്",
        "nav.farmer_acc": "കർഷകന്റെ അക്കൗണ്ട്",

        "mktcomp.tot_crops": "മൊത്തം വിളകൾ",
        "mktcomp.high_price": "ഏറ്റവും ഉയർന്ന വില",
        "mktcomp.low_price": "ഏറ്റവും കുറഞ്ഞ വില",
        "mktcomp.avg_price": "ശരാശരി വില",
        "mktcomp.per_q": "ഒരു ക്വിന്റലിന്",
        "mktcomp.loading": "വിപണി ഡാറ്റ ലോഡ് ചെയ്യുന്നു...",
        "mktcomp.col_crop": "വിള",
        "mktcomp.col_mandi": "വിപണി",
        "mktcomp.col_price": "വില",
        "mktcomp.filter": "വിപണി",
        "mktcomp.sort": "തരംതിരിക്കുക",

        "access.title": "ആക്സസിബിലിറ്റി",
        "access.text_size": "ടെക്സ്റ്റ് വലുപ്പം",
        "access.high_const": "ഹൈ കോൺട്രാസ്റ്റ്",
        "access.zoom": "സൂം ചെയ്യാനുള്ള സൗകര്യം",
        "access.lang": "ഭാഷ",
        "access.done": "പൂർത്തിയായി"
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
