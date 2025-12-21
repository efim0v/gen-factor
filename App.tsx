import React, { useEffect, useState } from 'react';
import { ApiService } from './services/api';
import { SelectOption, AnalysisResults } from './types';
import { SingleSelect, MultiSelect, Checkbox, Button } from './components/UI';
import { ResultsView } from './components/ResultsView';
import { Dna, Activity } from 'lucide-react';

const App: React.FC = () => {
    // --- State ---
    const [databases, setDatabases] = useState<SelectOption[]>([]);
    const [breeds, setBreeds] = useState<SelectOption[]>([]);
    const [traits, setTraits] = useState<SelectOption[]>([]);
    const [availableFactors, setAvailableFactors] = useState<SelectOption[]>([]);

    const [selectedDb, setSelectedDb] = useState<SelectOption | null>(null);
    const [selectedBreed, setSelectedBreed] = useState<SelectOption | null>(null);
    const [selectedTrait, setSelectedTrait] = useState<SelectOption | null>(null);
    const [selectedFactors, setSelectedFactors] = useState<SelectOption[]>([]);
    const [analyzeAll, setAnalyzeAll] = useState(false);

    // Loading States
    const [loadingDb, setLoadingDb] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [loadingTraits, setLoadingTraits] = useState(false);
    const [loadingFactors, setLoadingFactors] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const [results, setResults] = useState<AnalysisResults | null>(null);

    // --- Effects (Data Fetching Chain) ---

    // 1. Initial Load: Databases
    useEffect(() => {
        setLoadingDb(true);
        ApiService.getDatabases().then(setDatabases).finally(() => setLoadingDb(false));
    }, []);

    // 2. When DB selected -> Fetch Breeds, Traits, and Factors
    useEffect(() => {
        if (selectedDb) {
            // Fetch breeds
            setLoadingBreeds(true);
            setBreeds([]);
            setSelectedBreed(null);
            ApiService.getBreeds(selectedDb.id).then(setBreeds).finally(() => setLoadingBreeds(false));

            // Fetch traits
            setLoadingTraits(true);
            setTraits([]);
            setSelectedTrait(null);
            ApiService.getTraits(selectedDb.id).then(setTraits).finally(() => setLoadingTraits(false));

            // Fetch factors
            setLoadingFactors(true);
            setAvailableFactors([]);
            setSelectedFactors([]);
            setResults(null);
            ApiService.getFactors(selectedDb.id).then(setAvailableFactors).finally(() => setLoadingFactors(false));
        }
    }, [selectedDb]);

    // --- Handlers ---

    const handleRunAnalysis = async () => {
        if (selectedFactors.length === 0 && !analyzeAll) {
            alert("Пожалуйста, выберите хотя бы один фактор или отметьте 'Анализировать все возможные комбинации'.");
            return;
        }

        setIsAnalyzing(true);
        setResults(null); // Clear previous results to show loading state effectively if needed
        
        try {
            const factorIds = selectedFactors.map(f => f.id);
            const data = await ApiService.runAnalysis(factorIds, analyzeAll);
            setResults(data);
            
            // Scroll to results
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Ошибка анализа. Пожалуйста, попробуйте снова.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const blob = await ApiService.downloadResults();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analysis_results_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            alert("Ошибка загрузки.");
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Render Helpers ---
    const showFactorsBlock = !!selectedDb;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Dna size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">Генетический Анализ</h1>
                        <p className="text-xs text-slate-500 mt-1">Анализ корреляции факторов среды</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Section 1: Core Selection */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                        Выбор данных
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SingleSelect 
                            label="База данных" 
                            options={databases} 
                            value={selectedDb} 
                            onChange={setSelectedDb}
                            loading={loadingDb}
                            placeholder="Выберите базу данных..."
                        />
                        <SingleSelect
                            label="Порода"
                            options={breeds}
                            value={selectedBreed}
                            onChange={setSelectedBreed}
                            disabled={!selectedDb}
                            loading={loadingBreeds}
                            placeholder={selectedDb ? "Выберите породу..." : "Сначала выберите базу данных"}
                        />
                        <SingleSelect
                            label="Признак"
                            options={traits}
                            value={selectedTrait}
                            onChange={setSelectedTrait}
                            disabled={!selectedDb}
                            loading={loadingTraits}
                            placeholder={selectedDb ? "Выберите признак..." : "Сначала выберите базу данных"}
                        />
                    </div>
                </section>

                {/* Section 2: Factors Configuration (Conditional) */}
                {showFactorsBlock && (
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                            Настройка факторов
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* MultiSelect takes up more space */}
                            <div className="md:col-span-7 lg:col-span-8">
                                <MultiSelect 
                                    label="Факторы среды"
                                    options={availableFactors}
                                    selected={selectedFactors}
                                    onChange={setSelectedFactors}
                                    loading={loadingFactors}
                                />
                            </div>

                            {/* Options and Action */}
                            <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-end h-full pt-6 space-y-6">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <Checkbox 
                                        label="Анализировать все возможные комбинации" 
                                        checked={analyzeAll}
                                        onChange={setAnalyzeAll}
                                    />
                                    <p className="text-xs text-slate-400 mt-2 ml-8">
                                        Примечание: Это может значительно увеличить время обработки.
                                    </p>
                                </div>
                                
                                <Button 
                                    onClick={handleRunAnalysis} 
                                    isLoading={isAnalyzing}
                                    className="w-full h-12 text-base shadow-md"
                                    icon={<Activity className="w-5 h-5" />}
                                >
                                    Начать анализ
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 3: Results (Conditional) */}
                {results && (
                    <section id="results-section" className="pt-4 border-t-2 border-slate-100">
                        <ResultsView 
                            results={results} 
                            onDownload={handleDownload}
                            isDownloading={isDownloading}
                        />
                    </section>
                )}
            </main>
        </div>
    );
};

export default App;