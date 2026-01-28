// Common Option Type for Selects
export interface SelectOption {
    id: string;
    label: string;
    code?: string;
    type?: string;  // Table type (animals/classification/reproduction)
    table?: string;
    factorType?: string;  // Factor classification: "categorical" or "continual"
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
    db_name?: string; // Имя БД, из которой взята порода (bmk_yy, bmk_dd, bmk_ll)
}

export interface TraitOut {
    id: number;
    code: string;
    name: string;
    type: string;
    description?: string | null;
}

export interface FactorOut {
    id: number;
    code: string;
    name: string;
    type: string;  // Table type (animals/classification/reproduction)
    factor_type?: string;  // Factor classification: "categorical" or "continual"
}

// Analysis Results Models
export interface FactorEffect {
    factor: string;
    effect: number | null;  // null for categorical factors (shown as "—")
    r2: number;             // R² for individual factor
    pValue: number;
    significant?: boolean;
    isCategorical?: boolean;
}

export interface Correlation {
    factor1: string;
    factor2: string;
    correlation: number;
    pValue: number;
    highCorr?: boolean;
}

export interface ModelAccuracy {
    factors: string[];
    r2: number;
}

export interface AnalysisResults {
    id?: string;
    status?: string;
    factorEffects: FactorEffect[];
    correlations: Correlation[];
    modelAccuracy: ModelAccuracy[];
    recommendedFactors: string[];
    artifacts?: {
        zip_file?: string;
    };
    warnings?: string[];
}

// Cross-Validation Types
export interface CrossValCriteria {
    mode: 'sex' | 'farm' | 'year' | 'random';
    value?: string;
    fraction?: number;
    seed?: number;
}

export interface StatsResult {
    count?: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
}

export interface CrossValidationMetrics {
    r2_corr_ebv_trait_masked?: number;
    r2_corr_pred_trait_masked?: number;
}

export interface CrossValidationResults {
    id: string;
    status: string;
    stats: {
        masked?: StatsResult;
        unmasked?: StatsResult;
    };
    metrics?: CrossValidationMetrics;
    warnings?: string[];
}

// Task Status
export interface TaskStatus {
    id: string;
    status: 'queued' | 'running' | 'success' | 'error';
    msg?: string;
}

// Saved Factor Analysis
export interface SavedFactorAnalysis {
    id: string;
    task_id: string;
    db_name: string;
    breed_id: string;
    trait_code: string;
    recommended_factors: string[];
    created_at: string;
    name?: string;
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

// Factor Analysis Task Payload
export interface FactorAnalysisPayload {
    id: string;
    type: 'factor_analysis';
    db_name: string;
    callBack: {
        url: string;
        login: string;
        password: string;
    };
    breed_id: string;
    trait: {
        table: string;
        name: string;
        label?: string;  // Russian display name for reports
    };
    factors: Array<{
        table: string;
        name: string;
        type: string;
        label?: string;  // Russian display name for reports
        factor_type?: string;  // Factor classification: "categorical" or "continual"
    }>;
    settings: {
        analyze_all_combinations: boolean;
        p_value_threshold: number;
        corr_threshold: number;
        max_combinations: number;
    };
}

// Cross-Validation Task Payload
export interface CrossValidationPayload {
    id: string;
    type: 'cross_validation';
    db_name: string;
    callBack: {
        url: string;
        login: string;
        password: string;
    };
    breed_id: string;
    trait: {
        table: string;
        name: string;
    };
    factors: Array<{
        table: string;
        name: string;
        type: string;
    }>;
    models: Array<{
        id: string;
        method: string;
        factors: Array<{
            table: string;
            name: string;
            type: string;
        }>;
        table: string;
        trait: string;
        variance: {
            varA: number;
            varE: number;
        };
    }>;
    cross_val_criteria: CrossValCriteria;
}
