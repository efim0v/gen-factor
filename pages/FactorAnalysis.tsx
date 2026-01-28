import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ApiService } from '../services/api';
import { SelectOption, AnalysisResults } from '../types';
import { SingleSelect, MultiSelect, Checkbox, Button } from '../components/UI';
import { ResultsView } from '../components/ResultsView';
import { Activity, Save, X, FlaskConical } from 'lucide-react';
import { isHiddenFactor, resolveTableName } from '../utils/tableResolver';
import { useApp } from '../contexts/AppContext';

interface FactorAnalysisProps {
    onNavigateToCrossVal?: (recommendedFactors: string[]) => void;
    // Shared state from App.tsx
    selectedDb: SelectOption | null;
    setSelectedDb: (value: SelectOption | null) => void;
    selectedBreed: SelectOption | null;
    setSelectedBreed: (value: SelectOption | null) => void;
    selectedTrait: SelectOption | null;
    setSelectedTrait: (value: SelectOption | null) => void;
    selectedFactors: SelectOption[];
    setSelectedFactors: (value: SelectOption[]) => void;
    results: AnalysisResults | null;
    setResults: (value: AnalysisResults | null) => void;
    // Processing state from App.tsx (survives tab switches)
    isProcessing: boolean;
    processingError: string | null;
    onStartTask: (taskId: string, availableFactors: SelectOption[]) => void;
    onClearError: () => void;
}

const FactorAnalysis: React.FC<FactorAnalysisProps> = ({
    onNavigateToCrossVal,
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
    const [analyzeAll, setAnalyzeAll] = useState(false);

    // Loading States
    const [loadingDb, setLoadingDb] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [loadingTraits, setLoadingTraits] = useState(false);
    const [loadingFactors, setLoadingFactors] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [localError, setLocalError] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [analysisName, setAnalysisName] = useState('');

    // Track previous breed to detect actual changes vs remounts
    const prevBreedRef = useRef<string | null>(null);

    // Combined error from processing or local validation
    const error = processingError || localError;
    const setError = (err: string | null) => {
        if (processingError) onClearError();
        setLocalError(err);
    };

    // --- Effects (Data Fetching Chain) ---

    // 1. Initial Load: Companies (hardcoded list for UI)
    useEffect(() => {
        setLoadingDb(true);
        ApiService.getCompanies()
            .then(setDatabases)
            .catch((err) => setError(err.message))
            .finally(() => setLoadingDb(false));
    }, []);

    // 2. When DB selected -> Fetch all breeds
    useEffect(() => {
        if (selectedDb && breeds.length === 0 && !loadingBreeds) {
            setError(null);

            setLoadingBreeds(true);
            ApiService.getAllBreeds()
                .then(setBreeds)
                .finally(() => setLoadingBreeds(false));
        }
    }, [selectedDb]);

    // 3. When breed changes -> Reset dependent state and fetch new data
    useEffect(() => {
        if (selectedBreed && selectedBreed.code) {
            const breedDbName = selectedBreed.code;
            const breedActuallyChanged = prevBreedRef.current !== null && prevBreedRef.current !== selectedBreed.id;

            // Only reset selections when breed actually changes (not on remount)
            if (breedActuallyChanged) {
                setSelectedTrait(null);
                setSelectedFactors([]);
                setError(null);
            }

            // Always update prevBreedRef
            prevBreedRef.current = selectedBreed.id;

            // Only fetch if we don't have data yet or breed changed
            if (traits.length === 0 || breedActuallyChanged) {
                setTraits([]);
                setLoadingTraits(true);
                ApiService.getTraits(breedDbName)
                    .then(setTraits)
                    .catch((err) => {
                        console.warn(`Failed to load traits from ${breedDbName}:`, err);
                        setTraits([]);
                    })
                    .finally(() => setLoadingTraits(false));
            }

            if (availableFactors.length === 0 || breedActuallyChanged) {
                setAvailableFactors([]);
                setLoadingFactors(true);
                ApiService.getFactors(breedDbName)
                    .then(setAvailableFactors)
                    .catch((err) => {
                        console.warn(`Failed to load factors from ${breedDbName}:`, err);
                        setAvailableFactors([]);
                    })
                    .finally(() => setLoadingFactors(false));
            }
        }
    }, [selectedBreed]);


    // --- Handlers ---

    const validateInputs = (): string | null => {
        if (!selectedBreed) return t.pleaseSelectBreed;
        if (!selectedTrait) return t.pleaseSelectTrait;
        if (selectedFactors.length === 0) return t.pleaseSelectFactor;
        return null;
    };

    // Get list of missing parameters for tooltip
    const getMissingParams = (): string[] => {
        const missing: string[] = [];
        if (!selectedDb) missing.push(t.database);
        if (!selectedBreed) missing.push(t.breed);
        if (!selectedTrait) missing.push(t.trait);
        if (selectedFactors.length === 0) missing.push(t.factors);
        return missing;
    };

    const missingParams = getMissingParams();
    const canRunAnalysis = missingParams.length === 0;
    const disabledTooltip = missingParams.length > 0
        ? `${t.pleaseSelect}: ${missingParams.join(', ')}`
        : undefined;

    const handleRunAnalysis = async () => {
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        try {
            // Use the database code from selected breed
            const breedDbName = selectedBreed?.code || 'bmk_yy';

            // Prepare factors with table resolution
            const factors = selectedFactors.map(f => ({
                code: f.code || f.label,
                type: 'cross',
                table: resolveTableName(f),
                label: f.label,
                factor_type: f.factorType,  // categorical or continual from DB
            }));

            const traitWithTable = {
                code: selectedTrait?.code || selectedTrait?.label || '',
                table: resolveTableName(selectedTrait),
                label: selectedTrait?.label,
            };

            // Submit task to API
            const taskId = await ApiService.runFactorAnalysis(
                breedDbName,
                selectedBreed?.id || '',
                traitWithTable,
                factors,
                { analyzeAllCombinations: analyzeAll }
            );

            // Start polling in App.tsx - pass availableFactors for result transformation
            onStartTask(taskId, availableFactors);
        } catch (err: any) {
            console.error("Analysis failed", err);
            setError(err.message || 'Analysis failed. Please try again.');
        }
    };

    const handleDownload = async () => {
        if (!results?.id) return;
        
        setIsDownloading(true);
        try {
            const blob = await ApiService.downloadResults(results.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factor_analysis_${results.id}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error("Download failed", err);
            setError(err.message || 'Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleOpenSaveModal = () => {
        if (!results?.id) return;
        setAnalysisName('');
        setShowSaveModal(true);
    };

    const handleSaveRecommended = async () => {
        if (!results?.id) return;

        setIsSaving(true);
        try {
            await ApiService.saveFactorAnalysis(results.id, analysisName.trim() || undefined);
            setShowSaveModal(false);
            setAnalysisName('');
            alert(t.savedSuccessfully);
        } catch (err: any) {
            console.error("Save failed", err);
            setError(err.message || 'Failed to save results');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNavigateToCrossVal = () => {
        if (results?.recommendedFactors && onNavigateToCrossVal) {
            onNavigateToCrossVal(results.recommendedFactors);
        }
    };

    // --- Render Helpers ---
    const showFactorsBlock = !!selectedDb;
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

            {/* Section 1: Core Selection */}
            <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-elevated border border-border text-text-primary text-xs font-bold">1</span>
                    {t.dataSelection}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </section>

            {/* Section 2: Factors Configuration */}
            {showFactorsBlock && (
                <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-elevated border border-border text-text-primary text-xs font-bold">2</span>
                        {t.factorSelection}
                    </h2>

                    <div className="space-y-6">
                        {/* Factor Selection - Full Width */}
                        <div>
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
                        </div>

                        {/* Analysis Options */}
                        <div className="pt-4 border-t border-border">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div className="p-4 bg-elevated rounded-lg border border-border flex-1">
                                    <Checkbox
                                        label={t.analyzeAllCombinations}
                                        checked={analyzeAll}
                                        onChange={setAnalyzeAll}
                                    />
                                    <p className="text-xs text-text-tertiary mt-2 ml-8">
                                        {t.analyzeAllCombinationsHint}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleRunAnalysis}
                                    isLoading={isProcessing}
                                    disabled={!canRunAnalysis}
                                    tooltip={disabledTooltip}
                                    className="md:w-auto w-full h-12 text-base shadow-md md:px-8"
                                    icon={<Activity className="w-5 h-5" />}
                                    loadingText={t.processing}
                                >
                                    {t.startAnalysis}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Section 3: Results */}
            {results && (
                <section id="results-section" className="pt-4 border-t-2 border-border">
                    <ResultsView
                        results={results}
                        onDownload={handleDownload}
                        isDownloading={isDownloading}
                    />

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex gap-4">
                            <Button
                                onClick={handleDownload}
                                isLoading={isDownloading}
                                variant="secondary"
                                icon={<Activity className="w-4 h-4" />}
                                loadingText={t.processing}
                            >
                                {t.downloadResults}
                            </Button>
                            <Button
                                onClick={handleOpenSaveModal}
                                variant="secondary"
                                icon={<Save className="w-4 h-4" />}
                            >
                                {t.saveRecommendedFactors}
                            </Button>
                        </div>
                        {onNavigateToCrossVal && results.recommendedFactors.length > 0 && (
                            <Button
                                onClick={handleNavigateToCrossVal}
                                icon={<FlaskConical className="w-4 h-4" />}
                            >
                                {t.goToCrossValidation}
                            </Button>
                        )}
                    </div>
                </section>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-border shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">
                                {t.enterAnalysisName}
                            </h3>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                {t.analysisName}
                            </label>
                            <input
                                type="text"
                                value={analysisName}
                                onChange={(e) => setAnalysisName(e.target.value)}
                                placeholder={t.analysisNamePlaceholder}
                                className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveRecommended();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={() => setShowSaveModal(false)}
                                variant="secondary"
                            >
                                {t.cancel}
                            </Button>
                            <Button
                                onClick={handleSaveRecommended}
                                isLoading={isSaving}
                                loadingText={t.processing}
                                icon={<Save className="w-4 h-4" />}
                            >
                                {t.save}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FactorAnalysis;
