import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, translations, Translations } from '../locales/translations';

export type Theme = 'light' | 'dark';

interface AppContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    t: Translations;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

const STORAGE_KEYS = {
    LANGUAGE: 'app_language',
    THEME: 'app_theme',
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        return (stored === 'en' || stored === 'ru') ? stored : 'ru';
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        return (stored === 'light' || stored === 'dark') ? stored : 'light';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    };

    // Apply theme to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Update HTML lang attribute when language changes
    useEffect(() => {
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    const t = translations[language];

    return (
        <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
