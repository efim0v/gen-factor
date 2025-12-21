import { SelectOption, AnalysisResults, DatabaseOut, BreedOut, TraitOut, FactorOut } from '../types';
import { apiGet } from './httpClient';

export const ApiService = {
    // Get list of available databases
    getDatabases: async (): Promise<SelectOption[]> => {
        try {
            const databases = await apiGet<DatabaseOut[]>('/meta/databases?group=bmk');
            return databases.map(db => ({
                id: db.code, // Use code as id for subsequent requests
                label: db.name
            }));
        } catch (error) {
            console.error('Failed to fetch databases:', error);
            throw error;
        }
    },

    // Get breeds for selected database
    getBreeds: async (dbCode: string): Promise<SelectOption[]> => {
        try {
            const breeds = await apiGet<BreedOut[]>(`/meta/breeds?db=${dbCode}`);
            return breeds.map(breed => ({
                id: breed.id,
                label: breed.name
            }));
        } catch (error) {
            console.error('Failed to fetch breeds:', error);
            throw error;
        }
    },

    // Get traits for selected database
    getTraits: async (dbCode: string): Promise<SelectOption[]> => {
        try {
            const traits = await apiGet<TraitOut[]>(`/meta/traits?db=${dbCode}`);
            return traits.map(trait => ({
                id: String(trait.id),
                label: trait.name
            }));
        } catch (error) {
            console.error('Failed to fetch traits:', error);
            throw error;
        }
    },

    // Get environmental factors for selected database
    getFactors: async (dbCode: string): Promise<SelectOption[]> => {
        try {
            const factors = await apiGet<FactorOut[]>(`/meta/factors?db=${dbCode}`);
            return factors.map(factor => ({
                id: String(factor.id),
                label: factor.name
            }));
        } catch (error) {
            console.error('Failed to fetch factors:', error);
            throw error;
        }
    },

    // Run analysis (placeholder for future implementation)
    runAnalysis: async (
        factors: string[],
        analyzeAll: boolean
    ): Promise<AnalysisResults> => {
        // TODO: Implement real analysis endpoint when available
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            factorEffects: factors.map((f, i) => ({
                factor: `Фактор ${f}`,
                effect: Math.random() > 0.5 ? Number(Math.random().toFixed(2)) : 0,
                pValue: i % 2 === 0 ? 0.04 : 0.12,
            })),
            correlations: [
                { factor1: 'Фактор 1', factor2: 'Фактор 2', correlation: 0.85, pValue: 0.01 },
                { factor1: 'Фактор 2', factor2: 'Фактор 3', correlation: 0.12, pValue: 0.45 },
                { factor1: 'Фактор 1', factor2: 'Фактор 3', correlation: -0.65, pValue: 0.03 },
            ],
            modelAccuracy: [
                { factors: ['1', '2', '3'], r2: 0.45 },
                { factors: ['1', '2'], r2: 0.38 },
                { factors: ['1'], r2: 0.22 },
            ],
            recommendedFactors: ['Фактор 1', 'Фактор 3', 'Фактор 4']
        };
    },

    // Download results (placeholder for future implementation)
    downloadResults: async (): Promise<Blob> => {
        // TODO: Implement real download endpoint when available
        await new Promise(resolve => setTimeout(resolve, 1500));
        const content = "Mock ZIP content";
        return new Blob([content], { type: 'application/zip' });
    }
};