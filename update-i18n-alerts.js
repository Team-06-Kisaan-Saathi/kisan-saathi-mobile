const fs = require('fs');
const path = require('path');

const translations = {
    en: {
        "alerts.title": "Alerts",
        "alerts.placeholder": "Important notifications and market alerts will be shown here."
    },
    hi: {
        "alerts.title": "अलर्ट",
        "alerts.placeholder": "महत्वपूर्ण सूचनाएं और बाज़ार अलर्ट यहां दिखाए जाएंगे।"
    },
    ta: {
        "alerts.title": "விழிப்பூட்டல்கள்",
        "alerts.placeholder": "முக்கியமான அறிவிப்புகள் மற்றும் சந்தை விழிப்பூட்டல்கள் இங்கே காட்டப்படும்."
    },
    te: {
        "alerts.title": "హెచ్చరికలు",
        "alerts.placeholder": "ముఖ్యమైన నోటిఫికేషన్‌లు మరియు మార్కెట్ హెచ్చరికలు ఇక్కడ చూపబడతాయి."
    },
    ml: {
        "alerts.title": "അലേർട്ടുകൾ",
        "alerts.placeholder": "പ്രധാന അറിയിപ്പുകളും മാർക്കറ്റ് അലേർട്ടുകളും ഇവിടെ കാണിക്കും."
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
