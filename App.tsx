import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dna, Activity, FlaskConical } from 'lucide-react';
import FactorAnalysis from './pages/FactorAnalysis';
import CrossValidation from './pages/CrossValidation';
import MaxDataTest from './pages/MaxDataTest';
import { SelectOption, AnalysisResults, CrossValidationResults } from './types';
import { SettingsDropdown } from './components/SettingsDropdown';
import { useApp } from './contexts/AppContext';
import { ApiService } from './services/api';

type TabType = 'factor-analysis' | 'cross-validation';
type RouteType = 'main' | 'test-max-data';

// Processing state for tasks that survive tab switches
interface ProcessingState {
    taskId: string | null;
    isProcessing: boolean;
    error: string | null;
}

const App: React.FC = () => {
    const { t } = useApp();
    const [activeTab, setActiveTab] = useState<TabType>('factor-analysis');
    const [recommendedFactors, setRecommendedFactors] = useState<string[]>([]);
    const [currentRoute, setCurrentRoute] = useState<RouteType>('main');

    // Simple URL-based routing
    useEffect(() => {
        const checkRoute = () => {
            const path = window.location.pathname;
            if (path === '/test/max_data') {
                setCurrentRoute('test-max-data');
            } else {
                setCurrentRoute('main');
            }
        };

        checkRoute();
        window.addEventListener('popstate', checkRoute);
        return () => window.removeEventListener('popstate', checkRoute);
    }, []);

    // Separate state for Factor Analysis tab
    const [faSelectedDb, setFaSelectedDb] = useState<SelectOption | null>(null);
    const [faSelectedBreed, setFaSelectedBreed] = useState<SelectOption | null>(null);
    const [faSelectedTrait, setFaSelectedTrait] = useState<SelectOption | null>(null);
    const [faSelectedFactors, setFaSelectedFactors] = useState<SelectOption[]>([]);
    const [faResults, setFaResults] = useState<AnalysisResults | null>(null);
    const [faAvailableFactors, setFaAvailableFactors] = useState<SelectOption[]>([]); // For factor name mapping

    // Separate state for Cross-Validation tab
    const [cvSelectedDb, setCvSelectedDb] = useState<SelectOption | null>(null);
    const [cvSelectedBreed, setCvSelectedBreed] = useState<SelectOption | null>(null);
    const [cvSelectedTrait, setCvSelectedTrait] = useState<SelectOption | null>(null);
    const [cvSelectedFactors, setCvSelectedFactors] = useState<SelectOption[]>([]);
    const [cvResults, setCvResults] = useState<CrossValidationResults | null>(null);

    // Processing state that survives tab switches
    const [faProcessing, setFaProcessing] = useState<ProcessingState>({
        taskId: null,
        isProcessing: false,
        error: null,
    });
    const [cvProcessing, setCvProcessing] = useState<ProcessingState>({
        taskId: null,
        isProcessing: false,
        error: null,
    });

    // Helper function to transform raw results with factor name mapping
    const transformFaResults = useCallback((rawResult: any, taskId: string, allFactors: SelectOption[]): AnalysisResults => {
        // Build code-to-name mapping for factors
        const factorCodeToName: Record<string, string> = {};
        allFactors.forEach((f) => {
            const code = (f.code || f.label).toLowerCase();
            factorCodeToName[code] = f.label;
        });

        // Helper function to get factor name from code
        const getFactorName = (code: string): string => {
            const lowerCode = code.toLowerCase();
            return factorCodeToName[lowerCode] || code;
        };

        return {
            id: taskId,
            status: 'success',
            factorEffects: rawResult.factor_effect?.map((e: any) => ({
                factor: getFactorName(e.factor),
                effect: e.effect,
                r2: e.r2 || 0,
                pValue: e.p_value,
                significant: e.significant,
                isCategorical: e.is_categorical,
            })) || [],
            correlations: rawResult.factor_corr?.map((c: any) => ({
                factor1: getFactorName(c.factor_1),
                factor2: getFactorName(c.factor_2),
                correlation: c.corr,
                pValue: c.p_value,
                highCorr: c.high_corr,
            })) || [],
            modelAccuracy: rawResult.model_scores?.map((m: any) => ({
                factors: m.factors.map((f: string) => getFactorName(f)),
                r2: m.r2,
            })) || [],
            recommendedFactors: (rawResult.recommended_factors || []).map((f: string) => getFactorName(f)),
            artifacts: rawResult.artifacts,
            warnings: rawResult.warnings,
        };
    }, []);

    // Poll for Factor Analysis task completion
    useEffect(() => {
        if (!faProcessing.taskId || !faProcessing.isProcessing) return;

        let cancelled = false;
        const pollTask = async () => {
            try {
                const status = await ApiService.pollTaskUntilComplete(faProcessing.taskId!);
                if (cancelled) return;

                if (status.status === 'error') {
                    setFaProcessing(prev => ({
                        ...prev,
                        isProcessing: false,
                        error: status.msg || 'Analysis failed',
                    }));
                    return;
                }

                // Get results
                const rawResult = await ApiService.getTaskResult(faProcessing.taskId!);
                if (cancelled) return;

                // Transform results with factor name mapping
                const transformedResults = transformFaResults(rawResult, faProcessing.taskId!, faAvailableFactors);
                setFaResults(transformedResults);

                setFaProcessing({
                    taskId: null,
                    isProcessing: false,
                    error: null,
                });
            } catch (err: any) {
                if (cancelled) return;
                setFaProcessing(prev => ({
                    ...prev,
                    isProcessing: false,
                    error: err.message || 'Analysis failed',
                }));
            }
        };

        pollTask();
        return () => { cancelled = true; };
    }, [faProcessing.taskId, faProcessing.isProcessing, faAvailableFactors, transformFaResults]);

    // Auto-scroll to results when FA results arrive
    useEffect(() => {
        if (faResults && activeTab === 'factor-analysis') {
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [faResults, activeTab]);

    // Poll for Cross-Validation task completion
    useEffect(() => {
        if (!cvProcessing.taskId || !cvProcessing.isProcessing) return;

        let cancelled = false;
        const pollTask = async () => {
            try {
                const status = await ApiService.pollTaskUntilComplete(cvProcessing.taskId!);
                if (cancelled) return;

                if (status.status === 'error') {
                    setCvProcessing(prev => ({
                        ...prev,
                        isProcessing: false,
                        error: status.msg || 'Cross-validation failed',
                    }));
                    return;
                }

                // Get results
                const result = await ApiService.getTaskResult(cvProcessing.taskId!) as CrossValidationResults;
                if (cancelled) return;

                setCvResults(result);
                setCvProcessing({
                    taskId: null,
                    isProcessing: false,
                    error: null,
                });
            } catch (err: any) {
                if (cancelled) return;
                setCvProcessing(prev => ({
                    ...prev,
                    isProcessing: false,
                    error: err.message || 'Cross-validation failed',
                }));
            }
        };

        pollTask();
        return () => { cancelled = true; };
    }, [cvProcessing.taskId, cvProcessing.isProcessing]);

    // Start Factor Analysis task
    const startFaTask = useCallback((taskId: string, availableFactors: SelectOption[]) => {
        setFaAvailableFactors(availableFactors);
        setFaResults(null);
        setFaProcessing({
            taskId,
            isProcessing: true,
            error: null,
        });
    }, []);

    // Start Cross-Validation task
    const startCvTask = useCallback((taskId: string) => {
        setCvResults(null);
        setCvProcessing({
            taskId,
            isProcessing: true,
            error: null,
        });
    }, []);

    // Clear FA error
    const clearFaError = useCallback(() => {
        setFaProcessing(prev => ({ ...prev, error: null }));
    }, []);

    // Clear CV error
    const clearCvError = useCallback(() => {
        setCvProcessing(prev => ({ ...prev, error: null }));
    }, []);

    const handleNavigateToCrossVal = (factors: string[]) => {
        setRecommendedFactors(factors);
        setActiveTab('cross-validation');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const tabs = [
        {
            id: 'factor-analysis' as const,
            label: t.factorAnalysis,
            icon: Activity,
        },
        {
            id: 'cross-validation' as const,
            label: t.crossValidation,
            icon: FlaskConical,
        },
    ];

    // Render test page if on /test/max_data route
    if (currentRoute === 'test-max-data') {
        return (
            <div className="min-h-screen bg-page pb-20">
                {/* Header */}
                <header className="bg-surface/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="bg-interactive p-2.5 rounded-lg text-white dark:text-[#1a1a1a]">
                                        <Dna size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-h4 text-text-primary">
                                            {t.appTitle}
                                        </h1>
                                        <p className="text-caption text-text-secondary mt-0.5">
                                            UI Stress Test
                                        </p>
                                    </div>
                                </a>
                            </div>

                            {/* Settings */}
                            <SettingsDropdown />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <MaxDataTest />
                </main>

                {/* Footer */}
                <footer className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-caption text-text-tertiary">
                        <span>{t.footerCopyright}</span>
                        <span>{t.footerPlatformName}</span>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page pb-20">
            {/* Header */}
            <header className="bg-surface/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-interactive p-2.5 rounded-lg text-white dark:text-[#1a1a1a]">
                                <Dna size={24} />
                            </div>
                            <div>
                                <h1 className="text-h4 text-text-primary">
                                    {t.appTitle}
                                </h1>
                                <p className="text-caption text-text-secondary mt-0.5">
                                    {t.appSubtitle}
                                </p>
                            </div>
                        </div>

                        {/* Settings */}
                        <SettingsDropdown />
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex gap-1 -mb-px" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group relative flex items-center gap-2 px-4 py-3 text-body-md transition-all ${
                                        isActive
                                            ? 'text-text-primary'
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-text-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
                                    <span>{tab.label}</span>

                                    {/* Active indicator */}
                                    <span
                                        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all ${
                                            isActive
                                                ? 'bg-text-primary'
                                                : 'bg-transparent group-hover:bg-border'
                                        }`}
                                    />
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'factor-analysis' && (
                    <FactorAnalysis
                        onNavigateToCrossVal={handleNavigateToCrossVal}
                        selectedDb={faSelectedDb}
                        setSelectedDb={setFaSelectedDb}
                        selectedBreed={faSelectedBreed}
                        setSelectedBreed={setFaSelectedBreed}
                        selectedTrait={faSelectedTrait}
                        setSelectedTrait={setFaSelectedTrait}
                        selectedFactors={faSelectedFactors}
                        setSelectedFactors={setFaSelectedFactors}
                        results={faResults}
                        setResults={setFaResults}
                        isProcessing={faProcessing.isProcessing}
                        processingError={faProcessing.error}
                        onStartTask={startFaTask}
                        onClearError={clearFaError}
                    />
                )}
                {activeTab === 'cross-validation' && (
                    <CrossValidation
                        initialFactors={recommendedFactors}
                        selectedDb={cvSelectedDb}
                        setSelectedDb={setCvSelectedDb}
                        selectedBreed={cvSelectedBreed}
                        setSelectedBreed={setCvSelectedBreed}
                        selectedTrait={cvSelectedTrait}
                        setSelectedTrait={setCvSelectedTrait}
                        selectedFactors={cvSelectedFactors}
                        setSelectedFactors={setCvSelectedFactors}
                        results={cvResults}
                        setResults={setCvResults}
                        isProcessing={cvProcessing.isProcessing}
                        processingError={cvProcessing.error}
                        onStartTask={startCvTask}
                        onClearError={clearCvError}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-caption text-text-tertiary">
                    <span>{t.footerCopyright}</span>
                    <span>{t.footerPlatformName}</span>
                </div>
            </footer>
        </div>
    );
};

export default App;
