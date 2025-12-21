// Common Option Type for Selects
export interface SelectOption {
    id: string;
    label: string;
}

// API Response Models from BLUP API
export interface DatabaseOut {
    id: number;
    code: string;
    name: string;
    description: string | null;
}

export interface BreedOut {
    id: string;
    name: string;
}

export interface TraitOut {
    id: number;
    code: string;
    name: string;
    type: string;
    description: string | null;
}

export interface FactorOut {
    id: number;
    code: string;
    name: string;
    type: string;
}

// Analysis Results Models (for future implementation)
export interface FactorEffect {
    factor: string;
    effect: number;
    pValue: number;
}

export interface Correlation {
    factor1: string;
    factor2: string;
    correlation: number;
    pValue: number;
}

export interface ModelAccuracy {
    factors: string[];
    r2: number;
}

export interface AnalysisResults {
    factorEffects: FactorEffect[];
    correlations: Correlation[];
    modelAccuracy: ModelAccuracy[];
    recommendedFactors: string[];
}

// Application State Interface
export interface AppState {
    databases: SelectOption[];
    breeds: SelectOption[];
    traits: SelectOption[];
    availableFactors: SelectOption[];
    
    selectedDb: SelectOption | null;
    selectedBreed: SelectOption | null;
    selectedTrait: SelectOption | null;
    selectedFactors: SelectOption[];
    analyzeAllCombinations: boolean;

    isLoading: boolean;
    isAnalyzing: boolean;
    isDownloading: boolean;
    
    results: AnalysisResults | null;
    error: string | null;
}