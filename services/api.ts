import {
  SelectOption,
  AnalysisResults,
  DatabaseOut,
  BreedOut,
  TraitOut,
  FactorOut,
} from '../types';

import { apiGet } from './httpClient';

export const ApiService = {
  // Databases
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

  // Traits
  async getTraits(dbCode: string): Promise<SelectOption[]> {
    const traits = await apiGet<TraitOut[]>(`/meta/traits?db=${dbCode}`);

    return traits.map((trait) => ({
      id: String(trait.id),
      label: trait.name,
    }));
  },

  // Factors
  async getFactors(dbCode: string): Promise<SelectOption[]> {
    const factors = await apiGet<FactorOut[]>(`/meta/factors?db=${dbCode}`);

    return factors.map((factor) => ({
      id: String(factor.id),
      label: factor.name,
    }));
  },

  // Mock analysis
  async runAnalysis(
    factors: string[],
    analyzeAll: boolean
  ): Promise<AnalysisResults> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      factorEffects: factors.map((f, i) => ({
        factor: `Фактор ${f}`,
        effect: Math.random() > 0.5 ? +Math.random().toFixed(2) : 0,
        pValue: i % 2 === 0 ? 0.04 : 0.12,
      })),
      correlations: [
        {
          factor1: 'Фактор 1',
          factor2: 'Фактор 2',
          correlation: 0.85,
          pValue: 0.01,
        },
        {
          factor1: 'Фактор 2',
          factor2: 'Фактор 3',
          correlation: 0.12,
          pValue: 0.45,
        },
        {
          factor1: 'Фактор 1',
          factor2: 'Фактор 3',
          correlation: -0.65,
          pValue: 0.03,
        },
      ],
      modelAccuracy: [
        { factors: ['1', '2', '3'], r2: 0.45 },
        { factors: ['1', '2'], r2: 0.38 },
        { factors: ['1'], r2: 0.22 },
      ],
      recommendedFactors: ['Фактор 1', 'Фактор 3', 'Фактор 4'],
    };
  },

  // Mock download
  async downloadResults(): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return new Blob(['Mock ZIP content'], {
      type: 'application/zip',
    });
  },
};
