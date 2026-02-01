import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en.json";
import hi from "./hi.json";
import ml from "./ml.json";
import ta from "./ta.json";
import te from "./te.json";

const LANGUAGE_KEY = "lang";

const getSavedLanguage = async () => {
  const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  return savedLang || "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ml: { translation: ml },
    ta: { translation: ta },
    te: { translation: te },
  },
  lng: "en",            // temporary default
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// 🔹 Load saved language after init
getSavedLanguage().then((lang) => {
  i18n.changeLanguage(lang);
});

export const setLanguage = async (lang) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;
