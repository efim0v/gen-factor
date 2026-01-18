import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AnalysisResults, CrossValidationResults } from '../types';
import { ResultsView } from '../components/ResultsView';
import { TooltipText } from '../components/UI';
import { TrendingUp, FlaskConical, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

// Generate extremely long factor names to test text overflow
const generateLongFactorName = (base: string, length: number = 50) => {
    const suffix = '_with_very_long_description_that_might_overflow';
    return (base + suffix).slice(0, length);
};

// Generate mock data for stress testing
const generateMaxFactorEffects = (count: number) => {
    const factors = [];
    for (let i = 1; i <= count; i++) {
        factors.push({
            factor: generateLongFactorName(`Factor_${i}_extremely_long_name`),
            effect: parseFloat((Math.random() * 200 - 100).toFixed(6)),
            pValue: parseFloat((Math.random()).toFixed(8)),
            significant: Math.random() > 0.5,
        });
    }
    return factors;
};

const generateMaxCorrelations = (factorCount: number) => {
    const correlations = [];
    const factors = Array.from({ length: factorCount }, (_, i) =>
        generateLongFactorName(`Factor_${i + 1}_very_long`)
    );

    for (let i = 0; i < factors.length; i++) {
        for (let j = i + 1; j < factors.length; j++) {
            correlations.push({
                factor1: factors[i],
                factor2: factors[j],
                correlation: parseFloat((Math.random() * 2 - 1).toFixed(8)),
                pValue: parseFloat((Math.random()).toFixed(8)),
                highCorr: Math.random() > 0.7,
            });
        }
    }
    return correlations;
};

const generateMaxModelAccuracy = (factorCount: number) => {
    const factors = Array.from({ length: factorCount }, (_, i) =>
        generateLongFactorName(`Factor_${i + 1}`)
    );

    const models = [];
    // Generate many different combinations
    for (let size = 1; size <= Math.min(factorCount, 8); size++) {
        for (let combo = 0; combo < Math.min(20, Math.pow(factorCount, size)); combo++) {
            const selectedFactors = [];
            for (let i = 0; i < size; i++) {
                const idx = (combo * (i + 1)) % factorCount;
                if (!selectedFactors.includes(factors[idx])) {
                    selectedFactors.push(factors[idx]);
                }
            }
            if (selectedFactors.length === size) {
                models.push({
                    factors: selectedFactors,
                    r2: parseFloat((Math.random() * 0.99 + 0.01).toFixed(6)),
                });
            }
        }
    }
    return models;
};

// Mock data for maximum stress testing
const createMaxAnalysisResults = (): AnalysisResults => {
    const factorCount = 25; // 25 factors
    return {
        id: 'max-test-001',
        status: 'success',
        factorEffects: generateMaxFactorEffects(factorCount),
        correlations: generateMaxCorrelations(factorCount),
        modelAccuracy: generateMaxModelAccuracy(factorCount),
        recommendedFactors: Array.from({ length: 12 }, (_, i) =>
            generateLongFactorName(`Recommended_Factor_${i + 1}_with_very_long_name`)
        ),
        warnings: [
            'This is a very long warning message that tests how the UI handles extremely long text content that might need to wrap to multiple lines or be truncated depending on the design decisions made for the warning display area.',
            'Warning 2: Another long warning to test multiple warnings display.',
            'Warning 3: Testing vertical stacking of multiple warnings.',
        ],
    };
};

const createMaxCrossValidationResults = (): CrossValidationResults => ({
    id: 'cv-max-test-001',
    status: 'success',
    stats: {
        masked: {
            count: 999999999,
            mean: 12345.67890123,
            std: 9876.54321098,
            min: -99999.99999,
            max: 999999.99999,
        },
        unmasked: {
            count: 888888888,
            mean: 98765.43210987,
            std: 1234.56789012,
            min: -88888.88888,
            max: 888888.88888,
        },
    },
    metrics: {
        r2_corr_ebv_trait_masked: 0.999999,
        r2_corr_pred_trait_masked: 0.888888,
    },
    warnings: [
        'Cross-validation warning: This is a very long warning that tests the cross-validation results warning display area with extremely long text.',
        'Warning 2: Additional warning message.',
        'Warning 3: Third warning for testing.',
        'Warning 4: Fourth warning to test scrolling.',
        'Warning 5: Fifth warning for extreme case.',
    ],
});

// Extreme dropdown options for testing
const createMaxSelectOptions = (count: number, prefix: string) =>
    Array.from({ length: count }, (_, i) => ({
        id: `${prefix}-${i + 1}`,
        label: `${prefix}_${i + 1}_with_extremely_long_name_that_should_test_dropdown_overflow_behavior_in_select_components`,
        code: `${prefix.toUpperCase()}_CODE_${i + 1}`,
    }));

const MaxDataTest: React.FC = () => {
    const { t } = useApp();
    const [activeSection, setActiveSection] = useState<'factor' | 'crossval' | 'selects' | 'all'>('all');

    const analysisResults = createMaxAnalysisResults();
    const cvResults = createMaxCrossValidationResults();
    const maxDatabases = createMaxSelectOptions(50, 'Database');
    const maxBreeds = createMaxSelectOptions(100, 'Breed');
    const maxTraits = createMaxSelectOptions(200, 'Trait');
    const maxFactors = createMaxSelectOptions(150, 'Factor');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            UI Stress Test - Maximum Data
                        </h1>
                        <p className="text-text-secondary">
                            Testing interface stability with extreme data volumes
                        </p>
                    </div>
                </div>

                {/* Section Toggle */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {[
                        { id: 'all', label: 'All Sections', icon: CheckCircle },
                        { id: 'factor', label: 'Factor Analysis Results', icon: Activity },
                        { id: 'crossval', label: 'Cross-Validation Results', icon: FlaskConical },
                        { id: 'selects', label: 'Select Dropdowns', icon: TrendingUp },
                    ].map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as typeof activeSection)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                activeSection === section.id
                                    ? 'border-border-strong bg-elevated text-text-primary'
                                    : 'border-border hover:border-border-strong text-text-secondary'
                            }`}
                        >
                            <section.icon className="w-4 h-4" />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface p-4 rounded-lg border border-border text-center">
                    <div className="text-3xl font-bold text-text-primary">{analysisResults.factorEffects.length}</div>
                    <div className="text-sm text-text-secondary">Factor Effects</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border text-center">
                    <div className="text-3xl font-bold text-text-primary">{analysisResults.correlations.length}</div>
                    <div className="text-sm text-text-secondary">Correlations</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border text-center">
                    <div className="text-3xl font-bold text-text-primary">{analysisResults.modelAccuracy.length}</div>
                    <div className="text-sm text-text-secondary">Model Combinations</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border text-center">
                    <div className="text-3xl font-bold text-text-primary">{analysisResults.recommendedFactors.length}</div>
                    <div className="text-sm text-text-secondary">Recommended Factors</div>
                </div>
            </div>

            {/* Factor Analysis Results */}
            {(activeSection === 'all' || activeSection === 'factor') && (
                <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Factor Analysis Results (Stress Test)
                    </h2>
                    <ResultsView
                        results={analysisResults}
                        onDownload={() => alert('Download clicked')}
                        isDownloading={false}
                    />
                </section>
            )}

            {/* Cross-Validation Results */}
            {(activeSection === 'all' || activeSection === 'crossval') && (
                <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5" />
                        {t.crossValidationResults} (Stress Test)
                    </h2>

                    {/* Statistics Table with extreme numbers */}
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
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.masked.count.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.masked.mean.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.masked.std.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.masked.min.toFixed(5)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.masked.max.toFixed(5)}</td>
                                    </tr>
                                    <tr className="bg-surface">
                                        <td className="px-4 py-3 font-medium text-text-primary">{t.unmasked}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.unmasked.count.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.unmasked.mean.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.unmasked.std.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.unmasked.min.toFixed(5)}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-mono">{cvResults.stats.unmasked.max.toFixed(5)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* R² Metrics */}
                    <div className="mb-8">
                        <h3 className="text-md font-medium text-text-primary mb-4">{t.predictionAccuracy}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-elevated p-6 rounded-xl border border-border">
                                <div className="text-sm text-text-secondary font-medium mb-2">{t.r2EbvTrait}</div>
                                <div className="text-4xl font-bold text-text-primary">
                                    {(cvResults.metrics.r2_corr_ebv_trait_masked * 100).toFixed(4)}%
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    {t.r2EbvTraitDesc}
                                </div>
                            </div>
                            <div className="bg-elevated p-6 rounded-xl border border-border">
                                <div className="text-sm text-text-secondary font-medium mb-2">{t.r2PhenotypeTrait}</div>
                                <div className="text-4xl font-bold text-text-primary">
                                    {(cvResults.metrics.r2_corr_pred_trait_masked * 100).toFixed(4)}%
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    {t.r2PhenotypeTraitDesc}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {cvResults.warnings && cvResults.warnings.length > 0 && (
                        <div className="p-4 bg-elevated border border-border-strong rounded-lg">
                            <div className="text-sm font-medium text-text-primary mb-2">{t.warnings}:</div>
                            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                                {cvResults.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Select Dropdowns Test */}
            {(activeSection === 'all' || activeSection === 'selects') && (
                <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Select Dropdowns (Max Options Test)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Database Select */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t.database} ({maxDatabases.length} options)
                            </label>
                            <select className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg focus:border-border-strong overflow-hidden text-ellipsis">
                                <option value="">{t.selectDatabase}</option>
                                {maxDatabases.map(db => (
                                    <option key={db.id} value={db.id}>{db.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Breed Select */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t.breed} ({maxBreeds.length} options)
                            </label>
                            <select className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg focus:border-border-strong overflow-hidden text-ellipsis">
                                <option value="">{t.selectBreed}</option>
                                {maxBreeds.map(breed => (
                                    <option key={breed.id} value={breed.id}>{breed.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Trait Select */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t.trait} ({maxTraits.length} options)
                            </label>
                            <select className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-lg focus:border-border-strong overflow-hidden text-ellipsis">
                                <option value="">{t.selectTrait}</option>
                                {maxTraits.map(trait => (
                                    <option key={trait.id} value={trait.id}>{trait.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Factors Multi-select simulation */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t.factors} ({maxFactors.length} options)
                            </label>
                            <select multiple className="w-full h-40 px-3 py-2 bg-surface text-text-primary border border-border rounded-lg focus:border-border-strong overflow-hidden">
                                {maxFactors.map(factor => (
                                    <option key={factor.id} value={factor.id}>{factor.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Selected factors tags simulation */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Selected Factors Tags (Max Display Test - 30 tags)
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-elevated rounded-lg border border-border max-h-40 overflow-y-auto">
                            {maxFactors.slice(0, 30).map(factor => (
                                <span
                                    key={factor.id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-surface text-text-primary border border-border max-w-[200px]"
                                >
                                    <TooltipText text={factor.label} maxWidth="max-w-[180px]" />
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Extreme Table Test */}
            {(activeSection === 'all') && (
                <section className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">
                        Extreme Wide Table Test
                    </h2>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-elevated sticky top-0 z-10">
                                <tr>
                                    {Array.from({ length: 20 }, (_, i) => (
                                        <th key={i} className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase whitespace-nowrap bg-elevated">
                                            Column {i + 1} Long Header
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {Array.from({ length: 10 }, (_, rowIdx) => (
                                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        {Array.from({ length: 20 }, (_, colIdx) => (
                                            <td key={colIdx} className="px-4 py-3 text-text-primary whitespace-nowrap font-mono text-sm">
                                                {(Math.random() * 100000).toFixed(6)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default MaxDataTest;
