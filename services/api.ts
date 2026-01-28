import {
  SelectOption,
  AnalysisResults,
  DatabaseOut,
  BreedOut,
  TraitOut,
  FactorOut,
  TaskStatus,
  CrossValidationResults,
  SavedFactorAnalysis,
  FactorAnalysisPayload,
  CrossValidationPayload,
} from '../types';

import { apiGet, apiPost, authenticatedFetch } from './httpClient';
import { resolveTableName } from '../utils/tableResolver';

// Default database name (since DB selection is not implemented)
const DEFAULT_DB_NAME = 'bmk_yy';

// Generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ApiService = {
  // ========== Meta Endpoints ==========

  // Companies (for UI display - hardcoded list)
  async getCompanies(): Promise<SelectOption[]> {
    const companies = await apiGet<DatabaseOut[]>('/meta/companies');
    return companies.map((db) => ({
      id: db.code,
      label: db.name,
    }));
  },

  // Databases (real MySQL databases - for internal use)
  async getDatabases(): Promise<SelectOption[]> {
    const databases = await apiGet<DatabaseOut[]>('/meta/databases?group=bmk');
    return databases.map((db) => ({
      id: db.code,
      label: db.name,
    }));
  },

  // Breeds
  async getBreeds(dbCode: string): Promise<SelectOption[]> {
    const breeds = await apiGet<BreedOut[]>(`/meta/breeds?db=${dbCode}`);
    return breeds.map((breed) => ({
      id: breed.id,
      label: breed.name,
    }));
  },

  // Get all breeds from all databases (bmk_yy, bmk_dd, bmk_ll)
  async getAllBreeds(): Promise<SelectOption[]> {
    const breeds = await apiGet<BreedOut[]>('/meta/breeds_all');
    return breeds.map((breed) => ({
      id: breed.id,
      label: breed.name,
      code: breed.db_name, // Store db_name in code field for later use
    }));
  },

  // Traits
  async getTraits(dbCode: string): Promise<SelectOption[]> {
    const traits = await apiGet<TraitOut[]>(`/meta/traits?db=${dbCode}`);
    return traits.map((trait) => ({
      id: String(trait.id),
      label: trait.name,
      code: trait.code,
      type: trait.type,
    }));
  },

  // Factors
  async getFactors(dbCode: string): Promise<SelectOption[]> {
    const factors = await apiGet<FactorOut[]>(`/meta/factors?db=${dbCode}`);
    return factors.map((factor) => ({
      id: String(factor.id),
      label: factor.name,
      code: factor.code,
      type: factor.type,
      factorType: factor.factor_type,  // categorical or continual from DB
    }));
  },

  // Mask Values (for cross-validation dropdowns)
  // 'farm' returns allowed farm names from CSV config
  // 'month_year' returns unique month.year values (e.g., "01.2018")
  // 'sex' returns unique sex values
  async getMaskValues(
    dbCode: string,
    breedId: string,
    field: 'sex' | 'farm' | 'month_year'
  ): Promise<string[]> {
    return apiGet<string[]>(
      `/meta/mask_values?db=${dbCode}&breed_id=${breedId}&field=${field}`
    );
  },

  // ========== Task Endpoints ==========

  // Get task status
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return apiGet<TaskStatus>(`/tasks/${taskId}/status`);
  },

  // Get task result
  async getTaskResult(taskId: string): Promise<AnalysisResults | CrossValidationResults> {
    return apiGet(`/tasks/${taskId}/result`);
  },

  // Poll for task completion
  async pollTaskUntilComplete(
    taskId: string,
    maxAttempts: number = 150,
    intervalMs: number = 2000
  ): Promise<TaskStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTaskStatus(taskId);
      if (status.status === 'success' || status.status === 'error') {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error('Task polling timeout');
  },

  // Download artifact
  async downloadArtifact(taskId: string, filename: string): Promise<Blob> {
    const isDevelopment = import.meta.env.DEV;
    const isDockerDeployment = typeof window !== 'undefined' && 
      window.location.hostname.includes('testserver.tech');
    const endpoint = `/tasks/${taskId}/download?file=${encodeURIComponent(filename)}`;
    
    let url: string;
    if (isDevelopment || isDockerDeployment) {
      url = `/api${endpoint}`;
    } else {
      url = `/api/blup?path=${encodeURIComponent(endpoint)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return response.blob();
  },

  // ========== Factor Analysis ==========

  // Run factor analysis
  async runFactorAnalysis(
    dbName: string,
    breedId: string,
    trait: { code: string; table?: string; label?: string },
    factors: Array<{ code: string; type: string; table?: string; label?: string; factor_type?: string }>,
    settings: {
      analyzeAllCombinations: boolean;
      pValueThreshold?: number;
      corrThreshold?: number;
    }
  ): Promise<string> {
    const taskId = generateUUID();

    const payload: FactorAnalysisPayload = {
      id: taskId,
      type: 'factor_analysis',
      db_name: dbName,
      callBack: { url: '', login: '', password: '' },
      breed_id: breedId,
      trait: {
        table: resolveTableName(trait),
        name: trait.code,
        label: trait.label,  // Russian display name for reports
      },
      factors: factors.map((f) => ({
        table: resolveTableName(f),
        name: f.code,
        type: 'cross',
        label: f.label,  // Russian display name for reports
        factor_type: f.factor_type,  // categorical or continual from DB
      })),
      settings: {
        analyze_all_combinations: settings.analyzeAllCombinations,
        p_value_threshold: settings.pValueThreshold || 0.05,
        corr_threshold: settings.corrThreshold || 0.7,
        max_combinations: 32768,
      },
    };

    await apiPost('/send_task', payload);
    return taskId;
  },

  // Complete factor analysis flow
  async runAnalysis(
    factorIds: string[],
    analyzeAll: boolean,
    dbName: string = DEFAULT_DB_NAME,
    breedId: string = '',
    trait: { code: string; type?: string; table?: string; name?: string } = { code: 'liveborn' },
    allFactors: SelectOption[] = []
  ): Promise<AnalysisResults> {
    const selectedFactors = allFactors
      .filter((f) => factorIds.includes(f.id))
      .map((f) => ({
        code: f.code || f.label,
        type: 'cross',
        table: resolveTableName(f),
        label: f.label,  // Russian display name for reports
        factor_type: f.factorType,  // categorical or continual from DB
      }));

    const traitWithTable = {
      code: trait.code,
      table: resolveTableName(trait),
      label: trait.name,  // Russian display name for reports (name field contains label)
    };

    // Submit task
    const taskId = await this.runFactorAnalysis(
      dbName,
      breedId,
      traitWithTable,
      selectedFactors,
      { analyzeAllCombinations: analyzeAll }
    );

    // Poll for completion
    const status = await this.pollTaskUntilComplete(taskId);

    if (status.status === 'error') {
      throw new Error(status.msg || 'Analysis failed');
    }

    // Get results
    const result = await this.getTaskResult(taskId) as AnalysisResults;

    // Build code-to-name mapping for factors
    // Factor codes come from backend as lowercase, so we need case-insensitive lookup
    const factorCodeToName: Record<string, string> = {};
    allFactors.forEach((f) => {
      const code = (f.code || f.label).toLowerCase();
      factorCodeToName[code] = f.label; // Use the display name from allFactors
    });

    // Helper function to get factor name from code
    const getFactorName = (code: string): string => {
      const lowerCode = code.toLowerCase();
      return factorCodeToName[lowerCode] || code;
    };

    // Transform to frontend format with names instead of codes
    return {
      id: taskId,
      status: 'success',
      factorEffects: (result as any).factor_effect?.map((e: any) => ({
        factor: getFactorName(e.factor),
        effect: e.effect,
        r2: e.r2 || 0,
        pValue: e.p_value,
        significant: e.significant,
        isCategorical: e.is_categorical,
      })) || [],
      correlations: (result as any).factor_corr?.map((c: any) => ({
        factor1: getFactorName(c.factor_1),
        factor2: getFactorName(c.factor_2),
        correlation: c.corr,
        pValue: c.p_value,
        highCorr: c.high_corr,
      })) || [],
      modelAccuracy: (result as any).model_scores?.map((m: any) => ({
        factors: m.factors.map((f: string) => getFactorName(f)),
        r2: m.r2,
      })) || [],
      recommendedFactors: ((result as any).recommended_factors || []).map((f: string) => getFactorName(f)),
      artifacts: (result as any).artifacts,
      warnings: (result as any).warnings,
    };
  },

  // Download results - uses /report endpoint for complete ZIP with all files
  async downloadResults(taskId?: string): Promise<Blob> {
    if (!taskId) {
      throw new Error('Task ID required');
    }

    const isDevelopment = import.meta.env.DEV;
    const isDockerDeployment = typeof window !== 'undefined' &&
      window.location.hostname.includes('testserver.tech');
    const endpoint = `/tasks/${taskId}/report`;

    let url: string;
    if (isDevelopment || isDockerDeployment) {
      // Direct /api/ path - nginx proxies to blup_api
      url = `/api${endpoint}`;
    } else {
      // Vercel/Netlify - use serverless function
      url = `/api/blup?path=${encodeURIComponent(endpoint)}`;
    }

    // Use native fetch since authenticatedFetch returns JSON, but we need blob
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/zip',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download failed: ${response.status} - ${errorText}`);
    }

    // Verify content type is zip
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/zip')) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    return response.blob();
  },

  // ========== Saved Results ==========

  // Save factor analysis result
  async saveFactorAnalysis(taskId: string, name?: string): Promise<SavedFactorAnalysis> {
    return apiPost<SavedFactorAnalysis>(`/factor_analysis/${taskId}/save`, { name });
  },

  // List saved results
  async getSavedResults(
    dbName: string,
    breedId: string,
    traitCode: string
  ): Promise<SavedFactorAnalysis[]> {
    return apiGet<SavedFactorAnalysis[]>(
      `/factor_analysis/saved?db=${dbName}&breed_id=${breedId}&trait_code=${traitCode}`
    );
  },

  // ========== Cross-Validation ==========

  // Run cross-validation
  async runCrossValidation(
    dbName: string,
    breedId: string,
    trait: { code: string; table?: string; type?: string },
    factors: Array<{ code: string; type: string; table?: string }>,
    criteria: {
      mode: 'sex' | 'year' | 'random';  // 'farm' removed - use month_year
      value?: string;
      fraction?: number;
      seed?: number;
    }
  ): Promise<string> {
    const taskId = generateUUID();
    const modelId = generateUUID();

    const traitTable = resolveTableName(trait);

    const payload: CrossValidationPayload = {
      id: taskId,
      type: 'cross_validation',
      db_name: dbName,
      callBack: { url: '', login: '', password: '' },
      breed_id: breedId,
      trait: {
        table: traitTable,
        name: trait.code,
      },
      factors: factors.map((f) => ({
        table: resolveTableName(f),
        name: f.code,
        type: 'cross',
      })),
      models: [
        {
          id: modelId,
          method: 'blup',
          factors: factors.map((f) => ({
            table: resolveTableName(f),
            name: f.code,
            type: 'cross',
          })),
          table: traitTable,
          trait: trait.code,
          variance: { varA: 0.3, varE: 0.7 },
        },
      ],
      cross_val_criteria: criteria,
    };

    await apiPost('/send_task', payload);
    return taskId;
  },

  // Complete cross-validation flow
  async runCrossValidationComplete(
    dbName: string,
    breedId: string,
    trait: { code: string; table?: string; type?: string },
    factors: Array<{ code: string; type: string; table?: string }>,
    criteria: {
      mode: 'sex' | 'year' | 'farm' | 'random';
      value?: string;
      fraction?: number;
    }
  ): Promise<CrossValidationResults> {
    const taskId = await this.runCrossValidation(
      dbName,
      breedId,
      trait,
      factors,
      { ...criteria, seed: 42 }
    );

    const status = await this.pollTaskUntilComplete(taskId);
    
    if (status.status === 'error') {
      throw new Error(status.msg || 'Cross-validation failed');
    }

    return this.getTaskResult(taskId) as Promise<CrossValidationResults>;
  },
};
