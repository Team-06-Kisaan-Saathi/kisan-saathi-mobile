const fs = require('fs');
const path = require('path');

const newTranslations = {
    en: {
        "nav.notifications": "Notifications",
        "dashboard.wheat": "Wheat",
        "dashboard.azadpur": "Azadpur Mandi",
        "dashboard.this_week_trend": "+4.2% this week"
    },
    hi: {
        "nav.notifications": "सूचनाएं",
        "dashboard.wheat": "गेहूँ",
        "dashboard.azadpur": "आजादपुर मंडी",
        "dashboard.this_week_trend": "इस सप्ताह +4.2%"
    },
    ta: {
        "nav.notifications": "அறிவிப்புகள்",
        "dashboard.wheat": "கோதுமை",
        "dashboard.azadpur": "ஆசாத்ரபூர் மண்டி",
        "dashboard.this_week_trend": "இந்த வாரம் +4.2%"
    },
    te: {
        "nav.notifications": "నోటిఫికేషన్‌లు",
        "dashboard.wheat": "గోధుమ",
        "dashboard.azadpur": "ఆజాద్‌పూర్ మండి",
        "dashboard.this_week_trend": "ఈ వారం +4.2%"
    },
    ml: {
        "nav.notifications": "അറിയിപ്പുകൾ",
        "dashboard.wheat": "ഗോതമ്പ്",
        "dashboard.azadpur": "ആസാദ്പൂർ മണ്ഡി",
        "dashboard.this_week_trend": "ഈ ആഴ്‌ച +4.2%"
    }
};

const i18nDir = path.join(__dirname, 'i18n');

['en', 'hi', 'ta', 'te', 'ml'].forEach(lang => {
    const filePath = path.join(i18nDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Ensure nav object exists
    if (!data.nav) data.nav = {};
    data.nav.notifications = newTranslations[lang]["nav.notifications"];

    // Ensure dashboard object exists
    if (!data.dashboard) data.dashboard = {};
    data.dashboard.wheat = newTranslations[lang]["dashboard.wheat"];
    data.dashboard.azadpur = newTranslations[lang]["dashboard.azadpur"];
    data.dashboard.this_week_trend = newTranslations[lang]["dashboard.this_week_trend"];

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log('Translations for notifications and buyer dashboard updated successfully');
