import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { SelectOption } from '../types';

// --- Simple Select ---
interface SingleSelectProps {
    label: string;
    options: SelectOption[];
    value: SelectOption | null;
    onChange: (option: SelectOption) => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
}

export const SingleSelect: React.FC<SingleSelectProps> = ({ 
    label, options, value, onChange, disabled, loading, placeholder = "Выбрать..." 
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
            <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md shadow-sm text-left transition-colors
                    ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'hover:border-blue-400 border-slate-300 text-slate-900'}
                    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className="block truncate">
                    {value ? value.label : <span className="text-slate-400">{placeholder}</span>}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Загрузка вариантов...</div>
                    ) : options.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">Нет доступных вариантов</div>
                    ) : (
                        <ul className="py-1">
                            {options.map((opt) => (
                                <li 
                                    key={opt.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value?.id === opt.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
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
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ 
    label, options, selected, onChange, loading 
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
            <div 
                className={`w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm cursor-pointer hover:border-blue-400 transition-colors ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className="flex flex-wrap gap-1.5">
                    {selected.length === 0 && (
                        <span className="text-slate-400 py-0.5">Выберите факторы...</span>
                    )}
                    {selected.map(item => (
                        <span key={item.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {item.label}
                            <button 
                                onClick={(e) => removeOption(e, item.id)}
                                className="ml-1.5 hover:text-blue-900 focus:outline-none"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="Поиск факторов..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-auto custom-scrollbar py-1">
                        {loading ? (
                            <li className="p-3 text-center text-sm text-slate-500">Загрузка...</li>
                        ) : filteredOptions.length === 0 ? (
                            <li className="p-3 text-center text-sm text-slate-500">Факторы не найдены</li>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = selected.some(s => s.id === opt.id);
                                return (
                                    <li 
                                        key={opt.id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${isSelected ? 'bg-blue-50' : ''}`}
                                        onClick={() => toggleOption(opt)}
                                    >
                                        <span className={isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
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
                    ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                    {checked && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700 select-none group-hover:text-slate-900">{label}</span>
        </label>
    );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, variant = 'primary', isLoading, icon, className = '', ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
        outline: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-blue-500"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Обработка...
                </>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};