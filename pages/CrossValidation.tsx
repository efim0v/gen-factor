import React, { useEffect, useMemo, useState } from 'react';
import { ApiService } from '../services/api';
import { SelectOption, CrossValidationResults, SavedFactorAnalysis } from '../types';
import { SingleSelect, MultiSelect, Button } from '../components/UI';
import { FlaskConical, BookOpen, TrendingUp } from 'lucide-react';
import { resolveTableName, isReproductionFactorDisallowed } from '../utils/tableResolver';
import { useApp } from '../contexts/AppContext';

type MaskingMode = 'sex' | 'year' | 'farm' | 'random';

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
    const [isValidating, setIsValidating] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const traitTable = selectedTrait ? resolveTableName(selectedTrait) : null;

    // --- Effects ---

    // Initial Load
    useEffect(() => {
        setLoadingDb(true);
        ApiService.getDatabases()
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

    useEffect(() => {
        if (!traitTable || traitTable === 'reproduction') {
            return;
        }
        setSelectedFactors((current) => {
            const next = current.filter(
                (factor) => !isReproductionFactorDisallowed(traitTable, resolveTableName(factor))
            );
            return next.length === current.length ? current : next;
        });
    }, [availableFactors, traitTable]);

    // When masking mode changes, load options
    useEffect(() => {
        if (selectedBreed && selectedBreed.code && maskingMode && ['sex', 'year', 'farm'].includes(maskingMode)) {
            setLoadingMaskOptions(true);
            setMaskingOptions([]);
            setMaskingValue('');

            const breedDbName = selectedBreed.code;
            const field = maskingMode === 'year' ? 'farm_year' : maskingMode;
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
        if (['sex', 'year', 'farm'].includes(maskingMode) && !maskingValue) {
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

        setIsValidating(true);
        setResults(null);
        setError(null);

        try {
            const factors = selectedFactors.map(f => ({
                code: f.code || f.label,
                type: 'cross',
            }));

            const criteria = {
                mode: maskingMode!,
                value: ['sex', 'year', 'farm'].includes(maskingMode!) ? maskingValue : undefined,
                fraction: maskingMode === 'random' ? maskingFraction : undefined,
            };

            const breedDbName = selectedBreed?.code || 'bmk_yy';

            const data = await ApiService.runCrossValidationComplete(
                breedDbName,
                selectedBreed?.id || '',
                { code: selectedTrait?.code || selectedTrait?.label || '' },
                factors,
                criteria
            );

            setResults(data);

            setTimeout(() => {
                document.getElementById('cv-results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err: any) {
            console.error('Cross-validation failed:', err);
            setError(err.message || 'Cross-validation failed');
        } finally {
            setIsValidating(false);
        }
    };

    // --- Render ---

    const maskingModes: { value: MaskingMode; labelKey: keyof typeof t; icon: string }[] = [
        { value: 'sex', labelKey: 'sex', icon: '♂♀' },
        { value: 'year', labelKey: 'year', icon: '📅' },
        { value: 'farm', labelKey: 'farm', icon: '🏠' },
        { value: 'random', labelKey: 'randomSample', icon: '🎲' },
    ];
    const filteredFactors = useMemo(() => {
        if (!traitTable || traitTable === 'reproduction') {
            return availableFactors;
        }
        return availableFactors.filter((factor) =>
            !isReproductionFactorDisallowed(traitTable, resolveTableName(factor))
        );
    }, [availableFactors, traitTable]);
    const hiddenReproductionCount = useMemo(() => {
        if (!traitTable || traitTable === 'reproduction') {
            return 0;
        }
        return availableFactors.filter((factor) =>
            isReproductionFactorDisallowed(traitTable, resolveTableName(factor))
        ).length;
    }, [availableFactors, traitTable]);

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
                {hiddenReproductionCount > 0 && (
                    <p className="mt-2 text-caption text-text-secondary">
                        {hiddenReproductionCount} {t.hiddenReproductionFactors}
                    </p>
                )}
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
                        {['sex', 'year', 'farm'].includes(maskingMode) && (
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {t[maskingMode as 'sex' | 'year' | 'farm']}
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
                    isLoading={isValidating}
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-elevated">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">{t.group}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">{t.count}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">{t.mean}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">{t.stdDev}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">{t.min}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">{t.max}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="bg-elevated">
                                        <td className="px-4 py-3 font-medium text-text-primary">{t.masked}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.masked.count}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.masked.mean.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.masked.std.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.masked.min.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.masked.max.toFixed(3)}</td>
                                    </tr>
                                    <tr className="bg-surface">
                                        <td className="px-4 py-3 font-medium text-text-primary">{t.unmasked}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.unmasked.count}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.unmasked.mean.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.unmasked.std.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.unmasked.min.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary">{results.stats.unmasked.max.toFixed(3)}</td>
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
                                    {(results.metrics.r2_corr_ebv_trait_masked * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    {t.r2EbvTraitDesc}
                                </div>
                            </div>
                            <div className="bg-elevated p-6 rounded-xl border border-border">
                                <div className="text-sm text-text-secondary font-medium mb-2">{t.r2PhenotypeTrait}</div>
                                <div className="text-4xl font-bold text-text-primary">
                                    {(results.metrics.r2_corr_pred_trait_masked * 100).toFixed(1)}%
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
