const fs = require('fs');
const path = require('path');

const newTranslations = {
    en: {
        "dashboard.market_forecast": "Market Forecast",
        "auth.logout": "Logout",
        "nav.farmer_acc": "Farmer Account",
        "nav.buyer_acc": "Buyer Account"
    },
    hi: {
        "dashboard.market_forecast": "बाज़ार पूर्वानुमान",
        "auth.logout": "लॉग आउट",
        "nav.farmer_acc": "किसान खाता",
        "nav.buyer_acc": "खरीदार खाता"
    },
    ta: {
        "dashboard.market_forecast": "சந்தை முன்னறிவிப்பு",
        "auth.logout": "வெளியேறு",
        "nav.farmer_acc": "விவசாயி கணக்கு",
        "nav.buyer_acc": "வாங்குபவர் கணக்கு"
    },
    te: {
        "dashboard.market_forecast": "మార్కెట్ సూచన",
        "auth.logout": "లాగ్ అవుట్",
        "nav.farmer_acc": "రైతు ఖాతా",
        "nav.buyer_acc": "కొనుగోలుదారు ఖాతా"
    },
    ml: {
        "dashboard.market_forecast": "വിപണി പ്രവചനം",
        "auth.logout": "ലോഗ് ഔട്ട്",
        "nav.farmer_acc": "കർഷക അക്കൗണ്ട്",
        "nav.buyer_acc": "വാങ്ങുന്നയാളുടെ അക്കൗണ്ട്"
    }
};

const i18nDir = path.join(__dirname, 'i18n');

['en', 'hi', 'ta', 'te', 'ml'].forEach(lang => {
    const filePath = path.join(i18nDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const [keyPath, value] of Object.entries(newTranslations[lang])) {
        const parts = keyPath.split('.');
        if (!data[parts[0]]) data[parts[0]] = {};
        data[parts[0]][parts[1]] = value;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log('Translations updated successfully');
