import React, { useEffect, useMemo, useState } from 'react';
import { ApiService } from '../services/api';
import { SelectOption, CrossValidationResults, SavedFactorAnalysis } from '../types';
import { SingleSelect, MultiSelect, Button } from '../components/UI';
import { FlaskConical, BookOpen, TrendingUp } from 'lucide-react';
import { isHiddenFactor } from '../utils/tableResolver';
import { useApp } from '../contexts/AppContext';

// Masking modes: farm (from allowed farms CSV), year (month.year only), sex, random
type MaskingMode = 'sex' | 'farm' | 'year' | 'random';

// Safe number formatting helper - handles undefined/null values
const safeToFixed = (value: number | undefined | null, decimals: number = 3, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return fallback;
    }
    return value.toFixed(decimals);
};

// Safe percentage formatting helper
const safePercent = (value: number | undefined | null, decimals: number = 1, fallback: string = 'N/A'): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return fallback;
    }
    return (value * 100).toFixed(decimals) + '%';
};

interface CrossValidationProps {
    initialFactors?: string[];
    // Shared state from App.tsx
    selectedDb: SelectOption | null;
    setSelectedDb: (value: SelectOption | null) => void;
    selectedBreed: SelectOption | null;
    setSelectedBreed: (value: SelectOption | null) => void;
    selectedTrait: SelectOption | null;
    setSelectedTrait: (value: SelectOption | null) => void;
    selectedFactors: SelectOption[];
    setSelectedFactors: (value: SelectOption[]) => void;
    results: CrossValidationResults | null;
    setResults: (value: CrossValidationResults | null) => void;
    // Processing state from App.tsx (survives tab switches)
    isProcessing: boolean;
    processingError: string | null;
    onStartTask: (taskId: string) => void;
    onClearError: () => void;
}

const CrossValidation: React.FC<CrossValidationProps> = ({
    initialFactors = [],
    selectedDb,
    setSelectedDb,
    selectedBreed,
    setSelectedBreed,
    selectedTrait,
    setSelectedTrait,
    selectedFactors,
    setSelectedFactors,
    results,
    setResults,
    isProcessing,
    processingError,
    onStartTask,
    onClearError,
}) => {
    const { t } = useApp();

    // --- Local State (non-shared) ---
    const [databases, setDatabases] = useState<SelectOption[]>([]);
    const [breeds, setBreeds] = useState<SelectOption[]>([]);
    const [traits, setTraits] = useState<SelectOption[]>([]);
    const [availableFactors, setAvailableFactors] = useState<SelectOption[]>([]);

    // Masking State
    const [maskingMode, setMaskingMode] = useState<MaskingMode | null>(null);
    const [maskingValue, setMaskingValue] = useState<string>('');
    const [maskingFraction, setMaskingFraction] = useState<number>(0.1);
    const [maskingOptions, setMaskingOptions] = useState<string[]>([]);

    // Saved Results
    const [savedResults, setSavedResults] = useState<SavedFactorAnalysis[]>([]);
    const [showSavedModal, setShowSavedModal] = useState(false);

    // Loading States
    const [loadingDb, setLoadingDb] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [loadingTraits, setLoadingTraits] = useState(false);
    const [loadingFactors, setLoadingFactors] = useState(false);
    const [loadingMaskOptions, setLoadingMaskOptions] = useState(false);

    const [localError, setLocalError] = useState<string | null>(null);

    // Combined error from processing or local validation
    const error = processingError || localError;
    const setError = (err: string | null) => {
        if (processingError) onClearError();
        setLocalError(err);
    };

    // --- Effects ---

    // Initial Load: Companies (hardcoded list for UI)
    useEffect(() => {
        setLoadingDb(true);
        ApiService.getCompanies()
            .then(setDatabases)
            .catch((err) => setError(err.message))
            .finally(() => setLoadingDb(false));
    }, []);

    // When DB selected -> Fetch all breeds
    useEffect(() => {
        if (selectedDb && breeds.length === 0 && !loadingBreeds) {
            setError(null);

            setLoadingBreeds(true);
            ApiService.getAllBreeds()
                .then(setBreeds)
                .finally(() => setLoadingBreeds(false));
        }
    }, [selectedDb]);

    // When breed selected -> Fetch traits and factors from breed's database
    useEffect(() => {
        if (selectedBreed && selectedBreed.code && traits.length === 0 && !loadingTraits) {
            setError(null);
            const breedDbName = selectedBreed.code;

            setLoadingTraits(true);
            ApiService.getTraits(breedDbName)
                .then(setTraits)
                .catch((err) => {
                    console.warn(`Failed to load traits from ${breedDbName}:`, err);
                    setTraits([]);
                })
                .finally(() => setLoadingTraits(false));

            setLoadingFactors(true);
            ApiService.getFactors(breedDbName)
                .then((factors) => {
                    setAvailableFactors(factors);
                    // Apply initial factors if provided
                    if (initialFactors.length > 0) {
                        const matching = factors.filter(f =>
                            initialFactors.includes(f.label) ||
                            initialFactors.includes(f.code || '')
                        );
                        setSelectedFactors(matching);
                    }
                })
                .catch((err) => {
                    console.warn(`Failed to load factors from ${breedDbName}:`, err);
                    setAvailableFactors([]);
                })
                .finally(() => setLoadingFactors(false));
        }
    }, [selectedBreed, initialFactors]);

    // Auto-scroll to results when they arrive
    useEffect(() => {
        if (results) {
            setTimeout(() => {
                document.getElementById('cv-results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [results]);

    // When masking mode changes, load options
    // - 'farm' mode: load allowed farm names from CSV
    // - 'year' mode: load unique month_year values (e.g., "01.2018")
    // - 'sex' mode: load sex values
    useEffect(() => {
        if (selectedBreed && selectedBreed.code && maskingMode && ['sex', 'farm', 'year'].includes(maskingMode)) {
            setLoadingMaskOptions(true);
            setMaskingOptions([]);
            setMaskingValue('');

            const breedDbName = selectedBreed.code;
            // Map maskingMode to API field parameter
            const field = maskingMode === 'year' ? 'month_year' : maskingMode === 'farm' ? 'farm' : maskingMode;
            ApiService.getMaskValues(breedDbName, selectedBreed.id, field as any)
                .then(setMaskingOptions)
                .catch((err) => console.error('Failed to load mask values:', err))
                .finally(() => setLoadingMaskOptions(false));
        }
    }, [selectedBreed, maskingMode]);

    // --- Handlers ---

    const handleSelectRecommended = async () => {
        if (!selectedBreed || !selectedTrait || !selectedBreed.code) {
            setError(`${t.pleaseSelectBreed}, ${t.pleaseSelectTrait}`);
            return;
        }

        try {
            const breedDbName = selectedBreed.code;
            const saved = await ApiService.getSavedResults(
                breedDbName,
                selectedBreed.id,
                selectedTrait.code || selectedTrait.label
            );
            setSavedResults(saved);
            setShowSavedModal(true);
        } catch (err: any) {
            setError(err.message || 'Failed to load saved results');
        }
    };

    const handleApplySavedResult = (saved: SavedFactorAnalysis) => {
        const matching = availableFactors.filter(f => 
            saved.recommended_factors.includes(f.label) || 
            saved.recommended_factors.includes(f.code || '')
        );
        setSelectedFactors(matching);
        setShowSavedModal(false);
    };

    const validateInputs = (): string | null => {
        if (!selectedBreed) return t.pleaseSelectBreed;
        if (!selectedTrait) return t.pleaseSelectTrait;
        if (selectedFactors.length === 0) return t.pleaseSelectFactor;
        if (!maskingMode) return t.pleaseSelectMaskingStrategy;
        if (['sex', 'farm', 'year'].includes(maskingMode) && !maskingValue) {
            return t.pleaseSelectMaskingValue;
        }
        return null;
    };

    const handleRunValidation = async () => {
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        try {
            const factors = selectedFactors.map(f => ({
                code: f.code || f.label,
                type: 'cross',
            }));

            const criteria = {
                mode: maskingMode!,
                value: ['sex', 'farm', 'year'].includes(maskingMode!) ? maskingValue : undefined,
                fraction: maskingMode === 'random' ? maskingFraction : undefined,
                seed: 42,
            };

            const breedDbName = selectedBreed?.code || 'bmk_yy';

            // Submit task and get taskId
            const taskId = await ApiService.runCrossValidation(
                breedDbName,
                selectedBreed?.id || '',
                { code: selectedTrait?.code || selectedTrait?.label || '' },
                factors,
                criteria
            );

            // Start polling in App.tsx - results will be set automatically when ready
            onStartTask(taskId);
        } catch (err: any) {
            console.error('Cross-validation failed:', err);
            setError(err.message || 'Cross-validation failed');
        }
    };

    // --- Render ---

    // Masking modes: farm (allowed farms only), month_year (date only), sex, random
    const maskingModes: { value: MaskingMode; labelKey: keyof typeof t; icon: string }[] = [
        { value: 'sex', labelKey: 'sex', icon: '♂♀' },
        { value: 'farm', labelKey: 'farm', icon: '🏭' },
        { value: 'year', labelKey: 'monthYear', icon: '📅' },
        { value: 'random', labelKey: 'randomSample', icon: '🎲' },
    ];
    const filteredFactors = useMemo(() => {
        // Filter out hidden factors (like "farm")
        return availableFactors.filter((factor) =>
            !isHiddenFactor(factor.code || factor.label)
        );
    }, [availableFactors]);

    return (
        <div className="space-y-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-elevated border border-border-strong text-text-primary px-4 py-3 rounded-lg">
                    {error}
                    <button
                        className="float-right text-text-secondary hover:text-text-primary"
                        onClick={() => setError(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Section 1: Data Selection */}
            <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-elevated border border-border text-text-primary text-xs font-bold">1</span>
                        {t.dataSelection}
                    </h2>
                    <Button
                        onClick={handleSelectRecommended}
                        variant="secondary"
                        size="sm"
                        icon={<BookOpen className="w-4 h-4" />}
                        disabled={!selectedDb || !selectedBreed || !selectedTrait}
                    >
                        {t.selectRecommendedFactors}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <SingleSelect
                        label={t.database}
                        options={databases}
                        value={selectedDb}
                        onChange={setSelectedDb}
                        loading={loadingDb}
                        placeholder={t.selectDatabase}
                        loadingText={t.loadingOptions}
                        emptyText={t.noOptionsAvailable}
                    />
                    <SingleSelect
                        label={t.breed}
                        options={breeds}
                        value={selectedBreed}
                        onChange={setSelectedBreed}
                        disabled={!selectedDb}
                        loading={loadingBreeds}
                        placeholder={selectedDb ? t.selectBreed : t.firstSelectDatabase}
                        loadingText={t.loadingOptions}
                        emptyText={t.noOptionsAvailable}
                    />
                    <SingleSelect
                        label={t.trait}
                        options={traits}
                        value={selectedTrait}
                        onChange={setSelectedTrait}
                        disabled={!selectedDb}
                        loading={loadingTraits}
                        placeholder={selectedDb ? t.selectTrait : t.firstSelectDatabase}
                        loadingText={t.loadingOptions}
                        emptyText={t.noOptionsAvailable}
                    />
                </div>

                <MultiSelect
                    label={t.factors}
                    options={filteredFactors}
                    selected={selectedFactors}
                    onChange={setSelectedFactors}
                    loading={loadingFactors}
                    placeholder={t.selectFactors}
                    searchPlaceholder={t.searchFactors}
                    loadingText={t.loading}
                    emptyText={t.factorsNotFound}
                />
            </section>

            {/* Section 2: Masking Strategy */}
            <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-elevated border border-border text-text-primary text-xs font-bold">2</span>
                    {t.maskingStrategy}
                </h2>

                {/* Strategy Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {maskingModes.map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setMaskingMode(mode.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                maskingMode === mode.value
                                    ? 'border-border-strong bg-elevated text-text-primary'
                                    : 'border-border hover:border-border-strong text-text-secondary'
                            }`}
                        >
                            <div className="text-2xl mb-2">{mode.icon}</div>
                            <div className="font-medium">{t[mode.labelKey]}</div>
                        </button>
                    ))}
                </div>

                {/* Strategy Parameters */}
                {maskingMode && (
                    <div className="bg-elevated p-4 rounded-lg">
                        {['sex', 'farm', 'year'].includes(maskingMode) && (
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {maskingMode === 'year' ? t.monthYear : maskingMode === 'farm' ? t.farm : t[maskingMode as 'sex']}
                                </label>
                                <select
                                    value={maskingValue}
                                    onChange={(e) => setMaskingValue(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg focus:border-border-strong"
                                    disabled={loadingMaskOptions}
                                >
                                    <option value="">
                                        {loadingMaskOptions ? t.loading : t.selectValue}
                                    </option>
                                    {maskingOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {maskingMode === 'random' && (
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {t.fractionToMask}: {(maskingFraction * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="0.5"
                                    step="0.05"
                                    value={maskingFraction}
                                    onChange={(e) => setMaskingFraction(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>5%</span>
                                    <span>50%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Run Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleRunValidation}
                    isLoading={isProcessing}
                    className="px-8 py-3 text-base"
                    icon={<FlaskConical className="w-5 h-5" />}
                    loadingText={t.processing}
                >
                    {t.startCrossValidation}
                </Button>
            </div>

            {/* Results */}
            {results && (
                <section id="cv-results" className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {t.crossValidationResults}
                    </h2>

                    {/* Statistics Table */}
                    <div className="mb-8">
                        <h3 className="text-md font-medium text-text-primary mb-4">{t.groupStatistics}</h3>
                        <div className="overflow-x-auto border border-border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-border">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle border-r border-border">{t.group}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle border-r border-border">{t.count}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle border-r border-border">{t.mean}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle border-r border-border">{t.stdDev}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle border-r border-border">{t.min}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white dark:text-[#1a1a1a] uppercase bg-interactive-subtle">{t.max}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="bg-elevated">
                                        <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{t.masked}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{results.stats.masked?.count ?? 'N/A'}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.masked?.mean)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.masked?.std)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.masked?.min)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{safeToFixed(results.stats.masked?.max)}</td>
                                    </tr>
                                    <tr className="bg-surface">
                                        <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{t.unmasked}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{results.stats.unmasked?.count ?? 'N/A'}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.unmasked?.mean)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.unmasked?.std)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary border-r border-border">{safeToFixed(results.stats.unmasked?.min)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{safeToFixed(results.stats.unmasked?.max)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* R² Metrics */}
                    <div>
                        <h3 className="text-md font-medium text-text-primary mb-4">{t.predictionAccuracy}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-elevated p-6 rounded-xl border border-border">
                                <div className="text-sm text-text-secondary font-medium mb-2">{t.r2EbvTrait}</div>
                                <div className="text-4xl font-bold text-text-primary">
                                    {safePercent(results.metrics?.r2_corr_ebv_trait_masked)}
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    {t.r2EbvTraitDesc}
                                </div>
                            </div>
                            <div className="bg-elevated p-6 rounded-xl border border-border">
                                <div className="text-sm text-text-secondary font-medium mb-2">{t.r2PhenotypeTrait}</div>
                                <div className="text-4xl font-bold text-text-primary">
                                    {safePercent(results.metrics?.r2_corr_pred_trait_masked)}
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    {t.r2PhenotypeTraitDesc}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {results.warnings && results.warnings.length > 0 && (
                        <div className="mt-6 p-4 bg-elevated border border-border-strong rounded-lg">
                            <div className="text-sm font-medium text-text-primary mb-2">{t.warnings}:</div>
                            <ul className="list-disc list-inside text-sm text-text-secondary">
                                {results.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Saved Results Modal */}
            {showSavedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto border border-border">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">{t.savedFactorResults}</h3>

                        {savedResults.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">
                                {t.noSavedResults}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {savedResults.map(saved => (
                                    <button
                                        key={saved.id}
                                        onClick={() => handleApplySavedResult(saved)}
                                        className="w-full text-left p-4 border border-border rounded-lg hover:border-border-strong hover:bg-elevated transition-all"
                                    >
                                        <div className="font-medium text-text-primary">
                                            {saved.name || `Analysis from ${new Date(saved.created_at).toLocaleDateString()}`}
                                        </div>
                                        <div className="text-sm text-text-secondary mt-1">
                                            {t.factors}: {saved.recommended_factors.join(', ')}
                                        </div>
                                        <div className="text-xs text-text-tertiary mt-1">
                                            {new Date(saved.created_at).toLocaleString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowSavedModal(false)}
                            >
                                {t.close}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrossValidation;
