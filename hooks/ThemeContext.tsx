import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeContextType = {
    colorScheme: ColorSchemeName;
    setColorScheme: (scheme: ColorSchemeName) => void;
    toggleTheme: () => void;
    highContrast: boolean;
    setHighContrast: (v: boolean) => void;
    fontScale: number;
    setFontScale: (v: number) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorScheme, setScheme] = useState<ColorSchemeName>('light');
    const [highContrast, setHC] = useState(false);
    const [fontScale, setFS] = useState(1);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedHC = await AsyncStorage.getItem('highContrast');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setScheme(savedTheme);
            }
            if (savedHC === 'true') {
                setHC(true);
            }
            const savedFS = await AsyncStorage.getItem('fontScale');
            if (savedFS) {
                setFS(parseFloat(savedFS));
            }
        };
        loadTheme();
    }, []);

    const setColorScheme = async (scheme: ColorSchemeName) => {
        setScheme(scheme);
        if (scheme) {
            await AsyncStorage.setItem('theme', scheme);
        } else {
            await AsyncStorage.removeItem('theme');
        }
    };

    const setHighContrast = async (v: boolean) => {
        setHC(v);
        await AsyncStorage.setItem('highContrast', String(v));
    };

    const setFontScale = async (v: number) => {
        setFS(v);
        await AsyncStorage.setItem('fontScale', String(v));
    };

    const toggleTheme = () => {
        const next = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(next);
    };

    return (
        <ThemeContext.Provider value={{ colorScheme, setColorScheme, toggleTheme, highContrast, setHighContrast, fontScale, setFontScale }}>
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
