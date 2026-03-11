const fs = require('fs');
const path = require('path');

const newTranslations = {
    en: {
        "create_auction.tap_add_photos": "Tap to add photos",
    },
    hi: {
        "create_auction.tap_add_photos": "तस्वीरें जोड़ने के लिए टैप करें",
    },
    ta: {
        "create_auction.tap_add_photos": "புகைப்படங்களைச் சேர்க்க தட்டவும்",
    },
    te: {
        "create_auction.tap_add_photos": "ఫోటోలను జోడించడానికి నొక్కండి",
    },
    ml: {
        "create_auction.tap_add_photos": "ഫോട്ടോകൾ ചേർക്കാൻ ടാപ്പ് ചെയ്യുക",
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
