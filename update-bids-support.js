const fs = require('fs');
const path = require('path');

const newTranslations = {
    en: {
        "support.btn_call": "Call Now",
        "support.em_help": "Emergency Helpline",
        "support.em_desc": "For urgent issues related to payments or fraud, contact our 24/7 dedicated helpline.",
        "support.call_em_now": "Call Emergency Now",
        "my_bids.title": "My Bids",
        "my_bids.participated": "auctions participated",
        "my_bids.no_bids": "You haven't placed any bids yet",
        "my_bids.browse": "Browse Live Auctions",
        "my_bids.my_bid": "MY BID",
        "my_bids.cur_high": "CURRENT HIGHEST",
        "my_bids.status": "STATUS",
        "my_bids.st_closed": "Closed",
        "my_bids.st_live": "Live",
        "my_bids.won_msg": "You won this auction! Final price:"
    },
    hi: {
        "support.btn_call": "अभी कॉल करें",
        "support.em_help": "आपातकालीन हेल्पलाइन",
        "support.em_desc": "भुगतान या धोखाधड़ी से संबंधित तत्काल समस्याओं के लिए, हमारी 24/7 समर्पित हेल्पलाइन से संपर्क करें।",
        "support.call_em_now": "अभी आपातकालीन कॉल करें",
        "my_bids.title": "मेरी बोलियां",
        "my_bids.participated": "नीलामी में भाग लिया",
        "my_bids.no_bids": "आपने अभी तक कोई बोली नहीं लगाई है",
        "my_bids.browse": "लाइव नीलामी ब्राउज़ करें",
        "my_bids.my_bid": "मेरी बोली",
        "my_bids.cur_high": "वर्तमान उच्चतम",
        "my_bids.status": "स्थिति",
        "my_bids.st_closed": "बंद",
        "my_bids.st_live": "लाइव",
        "my_bids.won_msg": "आपने यह नीलामी जीत ली है! अंतिम मूल्य:"
    },
    ta: {
        "support.btn_call": "இப்போது அழைக்கவும்",
        "support.em_help": "அவசரகால உதவி எண்",
        "support.em_desc": "கட்டணங்கள் அல்லது மோசடி தொடர்பான அவசர சிக்கல்களுக்கு, எங்கள் 24/7 பிரத்யேக உதவி எண்ணைத் தொடர்புகொள்ளவும்.",
        "support.call_em_now": "இப்போது அவசரநிலையை அழைக்கவும்",
        "my_bids.title": "என் ஏலங்கள்",
        "my_bids.participated": "ஏலங்களில் பங்கேற்றது",
        "my_bids.no_bids": "நீங்கள் இதுவரை எந்த ஏலத்தையும் வைக்கவில்லை",
        "my_bids.browse": "நேரடி ஏலங்களை உலாவுக",
        "my_bids.my_bid": "என் ஏலம்",
        "my_bids.cur_high": "தற்போதைய உயர்ந்தது",
        "my_bids.status": "நிலை",
        "my_bids.st_closed": "மூடப்பட்டது",
        "my_bids.st_live": "நேரலை",
        "my_bids.won_msg": "இந்த ஏலத்தை நீங்கள் வென்றுவிட்டீர்கள்! இறுதி விலை:"
    },
    te: {
        "support.btn_call": "ఇప్పుడే కాల్ చేయండి",
        "support.em_help": "అత్యవసర హెల్ప్‌లైన్",
        "support.em_desc": "చెల్లింపులు లేదా మోసాలకు సంబంధించిన అత్యవసర సమస్యల కోసం, మా 24/7 అంకితమైన హెల్ప్‌లైన్‌ను సంప్రదించండి.",
        "support.call_em_now": "ఇప్పుడే ఎమర్జెన్సీకి కాల్ చేయండి",
        "my_bids.title": "నా బిడ్‌లు",
        "my_bids.participated": "వేలంలలో పాల్గొన్నారు",
        "my_bids.no_bids": "మీరు ఇంకా ఎలాంటి బిడ్‌లు వేయలేదు",
        "my_bids.browse": "లైవ్ వేలంలను బ్రౌజ్ చేయండి",
        "my_bids.my_bid": "నా బిడ్",
        "my_bids.cur_high": "ప్రస్తుత అత్యధికం",
        "my_bids.status": "స్థితి",
        "my_bids.st_closed": "మూసివేయబడింది",
        "my_bids.st_live": "లైవ్",
        "my_bids.won_msg": "మీరు ఈ వేలంలో గెలిచారు! తుది ధర:"
    },
    ml: {
        "support.btn_call": "ഇപ്പോൾ വിളിക്കുക",
        "support.em_help": "അടിന്തര ഹെൽപ്പ് ലൈൻ",
        "support.em_desc": "പേയ്‌മെന്റുകളുമായോ വഞ്ചനയുമായോ ബന്ധപ്പെട്ട അടിയന്തിര പ്രശ്‌നങ്ങൾക്കായി, ഞങ്ങളുടെ 24/7 സമർപ്പിത ഹെൽപ്പ് ലൈനുമായി ബന്ധപ്പെടുക.",
        "support.call_em_now": "ഇപ്പോൾ എമർജൻസി കോൾ ചെയ്യുക",
        "my_bids.title": "എന്റെ ബിഡുകൾ",
        "my_bids.participated": "ലേലങ്ങളിൽ പങ്കെടുത്തു",
        "my_bids.no_bids": "നിങ്ങൾ ഇതുവരെ ലേലങ്ങളൊന്നും വെച്ചിട്ടില്ല",
        "my_bids.browse": "തത്സമയ ലേലങ്ങൾ ബ്രൗസ് ചെയ്യുക",
        "my_bids.my_bid": "എന്റെ ബിഡ്",
        "my_bids.cur_high": "നിലവിലെ ഏറ്റവും ഉയർന്നത്",
        "my_bids.status": "സ്റ്റാറ്റസ്",
        "my_bids.st_closed": "അടച്ചു",
        "my_bids.st_live": "തത്സമയം",
        "my_bids.won_msg": "നിങ്ങൾ ഈ ലേലത്തിൽ വിജയിച്ചു! അവസാന വില:"
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

console.log('Translations updated for Support Center and My Bids successfully');
