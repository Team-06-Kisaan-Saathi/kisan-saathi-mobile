import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeContextType = {
    colorScheme: ColorSchemeName;
    setColorScheme: (scheme: ColorSchemeName) => void;
    toggleTheme: () => void;
    highContrast: boolean;
    setHighContrast: (v: boolean) => void;
    fontScale: number;
    setFontScale: (v: number) => void;
    zoomEnabled: boolean;
    setZoomEnabled: (v: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorScheme, setScheme] = useState<ColorSchemeName>('light');
    const [highContrast, setHighContrastState] = useState(false);
    const [fontScale, setFontScaleState] = useState(1);
    const [zoomEnabled, setZoomEnabledState] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') setScheme(savedTheme);

            const savedContrast = await AsyncStorage.getItem('highContrast');
            if (savedContrast === 'true') setHighContrastState(true);

            const savedFontScale = await AsyncStorage.getItem('fontScale');
            if (savedFontScale) setFontScaleState(parseFloat(savedFontScale));

            const savedZoom = await AsyncStorage.getItem('zoomEnabled');
            if (savedZoom === 'true') setZoomEnabledState(true);
        };
        loadSettings();
    }, []);

    const setColorScheme = async (scheme: ColorSchemeName) => {
        setScheme(scheme);
        if (scheme) await AsyncStorage.setItem('theme', scheme);
    };

    const toggleTheme = () => {
        const next = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(next);
    };

    const setHighContrast = async (v: boolean) => {
        setHighContrastState(v);
        await AsyncStorage.setItem('highContrast', v ? 'true' : 'false');
    };

    const setFontScale = async (v: number) => {
        setFontScaleState(v);
        await AsyncStorage.setItem('fontScale', v.toString());
    };

    const setZoomEnabled = async (v: boolean) => {
        setZoomEnabledState(v);
        await AsyncStorage.setItem('zoomEnabled', v ? 'true' : 'false');
    };

    return (
        <ThemeContext.Provider value={{
            colorScheme, setColorScheme, toggleTheme,
            highContrast, setHighContrast,
            fontScale, setFontScale,
            zoomEnabled, setZoomEnabled
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
