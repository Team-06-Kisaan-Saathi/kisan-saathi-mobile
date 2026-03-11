const fs = require('fs');
const path = require('path');

const newTranslations = {
    en: {
        "auth.agri": "AGRI",
        "auth.bazaar": "BAZAAR",
        "auth.enter_pin": "Enter PIN"
    },
    hi: {
        "auth.agri": "एग्री",
        "auth.bazaar": "बाज़ार",
        "auth.enter_pin": "पिन दर्ज करें"
    },
    ta: {
        "auth.agri": "அக்ரி",
        "auth.bazaar": "பஜார்",
        "auth.enter_pin": "பின் ஐ உள்ளிடவும்"
    },
    te: {
        "auth.agri": "అగ్రి",
        "auth.bazaar": "బజార్",
        "auth.enter_pin": "పిన్ నమోదు చేయండి"
    },
    ml: {
        "auth.agri": "അഗ്രി",
        "auth.bazaar": "ബസാർ",
        "auth.enter_pin": "പിൻ നൽകുക"
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
