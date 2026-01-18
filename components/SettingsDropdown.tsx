import React, { useState, useRef, useEffect } from 'react';
import { Settings, Globe, Moon, Sun, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Language } from '../locales/translations';

export const SettingsDropdown: React.FC = () => {
    const { language, setLanguage, theme, setTheme, t } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const languages: { code: Language; label: string }[] = [
        { code: 'ru', label: 'Русский' },
        { code: 'en', label: 'English' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
                aria-label={t.settings}
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border py-2 z-50">
                    {/* Language Section */}
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            <Globe className="w-3.5 h-3.5" />
                            {t.language}
                        </div>
                        <div className="space-y-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                        language === lang.code
                                            ? 'bg-elevated text-text-primary font-medium'
                                            : 'text-text-secondary hover:bg-elevated'
                                    }`}
                                >
                                    <span>{lang.label}</span>
                                    {language === lang.code && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border my-2" />

                    {/* Theme Section */}
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            {theme === 'dark' ? (
                                <Moon className="w-3.5 h-3.5" />
                            ) : (
                                <Sun className="w-3.5 h-3.5" />
                            )}
                            {t.theme}
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    setTheme('light');
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                    theme === 'light'
                                        ? 'bg-elevated text-text-primary font-medium'
                                        : 'text-text-secondary hover:bg-elevated'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Sun className="w-4 h-4" />
                                    {t.lightTheme}
                                </span>
                                {theme === 'light' && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setTheme('dark');
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                    theme === 'dark'
                                        ? 'bg-elevated text-text-primary font-medium'
                                        : 'text-text-secondary hover:bg-elevated'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Moon className="w-4 h-4" />
                                    {t.darkTheme}
                                </span>
                                {theme === 'dark' && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
