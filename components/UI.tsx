import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { SelectOption } from '../types';

// --- Tooltip for truncated text ---
interface TooltipTextProps {
    text: string;
    className?: string;
    maxWidth?: string;
}

export const TooltipText: React.FC<TooltipTextProps> = ({ text, className = '', maxWidth = 'max-w-[200px]' }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const textRef = useRef<HTMLSpanElement>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        const el = textRef.current;
        // Only show tooltip if text is actually truncated
        if (el && el.scrollWidth > el.clientWidth) {
            setShowTooltip(true);
            setTooltipPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (showTooltip) {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <span
                ref={textRef}
                className={`block truncate ${maxWidth} ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {text}
            </span>
            {showTooltip && (
                <div
                    className="fixed z-[9999] px-3 py-2 text-sm bg-surface border border-border rounded-lg shadow-lg text-text-primary max-w-xs break-words pointer-events-none"
                    style={{
                        left: tooltipPosition.x + 12,
                        top: tooltipPosition.y + 12,
                    }}
                >
                    {text}
                </div>
            )}
        </>
    );
};

// --- Simple Select ---
interface SingleSelectProps {
    label: string;
    options: SelectOption[];
    value: SelectOption | null;
    onChange: (option: SelectOption) => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
    loadingText?: string;
    emptyText?: string;
}

export const SingleSelect: React.FC<SingleSelectProps> = ({
    label, options, value, onChange, disabled, loading,
    placeholder = "Выбрать...",
    loadingText = "Загрузка вариантов...",
    emptyText = "Нет доступных вариантов"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
            <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-elevated border rounded-md text-left transition-colors
                    ${disabled ? 'bg-elevated text-text-tertiary cursor-not-allowed border-border' : 'hover:border-border-strong border-border text-text-primary'}
                    ${isOpen ? 'border-border-strong' : ''}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className="block truncate">
                    {value ? value.label : <span className="text-text-tertiary">{placeholder}</span>}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-text-secondary">{loadingText}</div>
                    ) : options.length === 0 ? (
                        <div className="p-4 text-center text-sm text-text-secondary">{emptyText}</div>
                    ) : (
                        <ul className="py-1">
                            {options.map((opt) => (
                                <li
                                    key={opt.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-elevated ${value?.id === opt.id ? 'bg-elevated text-text-primary font-medium' : 'text-text-secondary'}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Multi Select ---
interface MultiSelectProps {
    label: string;
    options: SelectOption[];
    selected: SelectOption[];
    onChange: (options: SelectOption[]) => void;
    loading?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    loadingText?: string;
    emptyText?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label, options, selected, onChange, loading,
    placeholder = "Выберите факторы...",
    searchPlaceholder = "Поиск факторов...",
    loadingText = "Загрузка...",
    emptyText = "Факторы не найдены"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: SelectOption) => {
        const isSelected = selected.some(s => s.id === option.id);
        if (isSelected) {
            onChange(selected.filter(s => s.id !== option.id));
        } else {
            onChange([...selected, option]);
        }
    };

    const removeOption = (e: React.MouseEvent, optionId: string) => {
        e.stopPropagation();
        onChange(selected.filter(s => s.id !== optionId));
    };

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full relative" ref={containerRef}>
            <label className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
            <div
                className={`w-full min-h-[42px] px-3 py-2 bg-elevated border border-border rounded-md cursor-pointer hover:border-border-strong transition-colors ${isOpen ? 'border-border-strong' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className="flex flex-wrap gap-1.5">
                    {selected.length === 0 && (
                        <span className="text-text-tertiary py-0.5">{placeholder}</span>
                    )}
                    {selected.map(item => (
                        <span key={item.id} className="inline-flex items-center px-3 py-1.5 rounded-md text-base font-medium bg-surface border border-border text-text-primary max-w-[200px]">
                            <TooltipText text={item.label} maxWidth="max-w-[150px]" />
                            <button
                                onClick={(e) => removeOption(e, item.id)}
                                className="ml-2 hover:text-text-primary focus:outline-none flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 w-4 h-4 text-text-tertiary" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-elevated text-text-primary border border-border rounded focus:outline-none focus:border-border-strong placeholder-text-tertiary"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-auto custom-scrollbar py-1">
                        {loading ? (
                            <li className="p-3 text-center text-sm text-text-secondary">{loadingText}</li>
                        ) : filteredOptions.length === 0 ? (
                            <li className="p-3 text-center text-sm text-text-secondary">{emptyText}</li>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = selected.some(s => s.id === opt.id);
                                return (
                                    <li
                                        key={opt.id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-elevated flex items-center justify-between ${isSelected ? 'bg-elevated' : ''}`}
                                        onClick={() => toggleOption(opt)}
                                    >
                                        <span className={isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'}>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Checkbox ---
interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
    return (
        <label className="inline-flex items-center cursor-pointer group">
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`w-5 h-5 border-2 rounded transition-colors flex items-center justify-center
                    ${checked ? 'bg-interactive border-interactive' : 'bg-elevated border-border group-hover:border-border-strong'}`}>
                    {checked && <Check className="w-3.5 h-3.5 text-white dark:text-[#1a1a1a]" />}
                </div>
            </div>
            <span className="ml-3 text-sm font-medium text-text-primary select-none group-hover:text-text-primary">{label}</span>
        </label>
    );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', size = 'md', isLoading, icon, className = '', loadingText = 'Processing...', ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center border font-medium rounded-lg focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border-transparent text-white dark:text-[#1a1a1a] bg-interactive hover:bg-interactive-hover",
        secondary: "border-border text-text-primary bg-surface hover:bg-elevated",
        outline: "border-border text-text-primary bg-transparent hover:bg-elevated"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {loadingText}
                </>
            ) : (
                <>
                    {icon && <span className="mr-2 flex items-center">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};