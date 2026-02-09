import React, { createContext, ReactNode, useContext, useState } from "react";

type AccessibilityContextType = {
    fontScale: number;
    setFontScale: (scale: number) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [fontScale, setFontScale] = useState(1);

    return (
        <AccessibilityContext.Provider value={{ fontScale, setFontScale }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}
