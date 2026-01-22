import React from 'react';
import { AnalysisResults } from '../types';
import { Download } from 'lucide-react';
import { Button, TooltipText } from './UI';
import { useApp } from '../contexts/AppContext';

interface ResultsViewProps {
    results: AnalysisResults;
    onDownload: () => void;
    isDownloading: boolean;
}

interface TableHeaderProps {
    children: React.ReactNode;
    tooltip?: boolean;
    className?: string;
}

// Helper for table headers - reduced padding for compactness
const TableHeader: React.FC<TableHeaderProps> = ({ children, tooltip = false, className = '' }) => {
    return (
        <th className={`px-1.5 py-2 text-left type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border-r border-border last:border-r-0 ${className}`}>
            {tooltip && typeof children === 'string' ? (
                <TooltipText text={children} maxWidth="max-w-[120px]" className="text-white dark:text-[#1a1a1a]" />
            ) : (
                children
            )}
        </th>
    );
};

interface TableCellProps {
    children: React.ReactNode;
    highlight?: boolean;
    tooltip?: boolean;
    className?: string;
    wrap?: boolean;
}

// Helper for table cells - reduced padding, adaptive width, with vertical dividers
const TableCell: React.FC<TableCellProps> = ({ children, highlight = false, tooltip = false, className = '', wrap = false }) => (
    <td className={`px-1.5 py-2 text-body text-text-primary border-b border-r border-border last:border-r-0 ${highlight ? 'font-semibold' : ''} ${className}`}>
        {tooltip && typeof children === 'string' ? (
            <TooltipText text={children} maxWidth="max-w-[150px]" />
        ) : (
            <span className={wrap ? 'break-words' : 'whitespace-nowrap'}>{children}</span>
        )}
    </td>
);

/**
 * Format p-value preserving full precision for scientific comparison.
 * Shows actual values like 1.23e-17 vs 4.56e-20 so users can see the difference.
 */
const formatPValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value !== 'number' || isNaN(value)) return '—';

    // For zero (underflow from extremely small values like < 1e-324), show "< 1e-300"
    if (value === 0) {
        return '< 1e-300';
    }

    // For exactly 1.0 (factor has no effect), show "1.0"
    if (value === 1.0) {
        return '1.0';
    }

    // For very small values, use scientific notation with full precision
    // This preserves the difference between 1e-17 and 1e-20
    if (value < 0.0001) {
        // Use toExponential with enough precision to show meaningful differences
        // Get the natural precision of the number
        const exp = Math.floor(Math.log10(Math.abs(value)));
        const mantissa = value / Math.pow(10, exp);

        // Show 2 decimal places in mantissa (e.g., 1.23e-17)
        return `${mantissa.toFixed(2)}e${exp}`;
    }

    // For values close to 1, show with 4 decimal places
    if (value >= 0.9999) {
        return value.toFixed(4);
    }

    // For regular values, use 4 decimal places
    return value.toFixed(4);
};

/**
 * Format general numeric values (effect, correlation) - legacy function
 */
const formatScientific = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value !== 'number' || isNaN(value)) return '—';

    // For very small values, use scientific notation
    if (Math.abs(value) < 0.0001 && value !== 0) {
        return value.toExponential(2);
    }

    // For regular values, use 4 decimal places
    return value.toFixed(4);
};

/**
 * Format R² value as percentage or decimal
 */
const formatR2 = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value !== 'number' || isNaN(value)) return '—';
    return (value * 100).toFixed(1) + '%';
};

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onDownload, isDownloading }) => {
    const { t } = useApp();

    // Extract all unique factors from modelAccuracy
    const allFactors = React.useMemo(() => {
        const factorSet = new Set<string>();
        results.modelAccuracy.forEach(model => {
            model.factors.forEach(factor => factorSet.add(factor));
        });
        return Array.from(factorSet).sort();
    }, [results.modelAccuracy]);

    // Sort model accuracy in "staircase" pattern:
    // 1. Sort by number of factors (ascending)
    // 2. Within same count, sort by R² (descending)
    // 3. Arrange factors to create visual staircase pattern
    const sortedModelAccuracy = React.useMemo(() => {
        const sorted = [...results.modelAccuracy].sort((a, b) => {
            // First by number of factors (ascending)
            if (a.factors.length !== b.factors.length) {
                return a.factors.length - b.factors.length;
            }
            // Then by R² (descending)
            return (b.r2 || 0) - (a.r2 || 0);
        });
        return sorted;
    }, [results.modelAccuracy]);

    // Determine factor order for staircase display
    const orderedFactors = React.useMemo(() => {
        // Build factor order based on first appearance in sorted results
        const factorOrder: string[] = [];
        sortedModelAccuracy.forEach(model => {
            model.factors.forEach(factor => {
                if (!factorOrder.includes(factor)) {
                    factorOrder.push(factor);
                }
            });
        });
        return factorOrder;
    }, [sortedModelAccuracy]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-h2 text-text-primary text-center mb-6">{t.analysisResults}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table 1: Factor Effect - now with R² column */}
                <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
                    <h3 className="px-4 py-3 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.factorEffects}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full table-auto">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <TableHeader className="min-w-[100px]">{t.factor}</TableHeader>
                                    <TableHeader className="w-20">{t.effect}</TableHeader>
                                    <TableHeader className="w-20 text-center">R²</TableHeader>
                                    <TableHeader className="w-24">{t.pValue}</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {results.factorEffects.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        <TableCell highlight wrap>{row.factor}</TableCell>
                                        <TableCell>{row.effect !== null && row.effect !== undefined ? formatScientific(row.effect) : '—'}</TableCell>
                                        <TableCell className="font-medium text-center">{formatR2(row.r2)}</TableCell>
                                        <TableCell>
                                            {formatPValue(row.pValue)}
                                            {row.pValue < 0.05 && <span className="font-bold ml-1 text-green-600">*</span>}
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: Correlation */}
                <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
                    <h3 className="px-4 py-3 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.correlations}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full table-auto">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <TableHeader className="min-w-[80px]">{t.factor1}</TableHeader>
                                    <TableHeader className="min-w-[80px]">{t.factor2}</TableHeader>
                                    <TableHeader className="w-20">{t.correlation}</TableHeader>
                                    <TableHeader className="w-24">{t.pValue}</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {results.correlations.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        <TableCell wrap>{row.factor1}</TableCell>
                                        <TableCell wrap>{row.factor2}</TableCell>
                                        <TableCell>{formatScientific(row.correlation)}</TableCell>
                                        <TableCell>
                                            {formatPValue(row.pValue)}
                                            {row.pValue < 0.05 && <span className="font-bold ml-1 text-green-600">*</span>}
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table 3: Model Accuracy */}
                <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
                    <h3 className="px-4 py-3 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.modelAccuracy}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full table-auto">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    {orderedFactors.map((factor) => {
                                        // Split factor name by spaces to put each word on a new line
                                        const words = factor.split(' ');
                                        return (
                                            <th key={factor} className="px-1.5 py-2 text-center type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border-r border-border last:border-r-0 min-w-[80px]">
                                                {words.map((word, idx) => (
                                                    <div key={idx} className="whitespace-nowrap">
                                                        {word}
                                                    </div>
                                                ))}
                                            </th>
                                        );
                                    })}
                                    <TableHeader className="w-20 text-center">R²</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {sortedModelAccuracy.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        {orderedFactors.map(factor => {
                                            const hasFactor = row.factors.includes(factor);
                                            return (
                                                <TableCell key={factor} className={`text-center ${!hasFactor ? 'opacity-30' : ''}`}>
                                                    {hasFactor ? '✓' : ''}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="font-medium text-center">{formatR2(row.r2)}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recommended Factors */}
                <div className="bg-surface shadow rounded-lg p-4 border border-border">
                    <h3 className="text-h4 text-text-primary mb-3">{t.recommendedFactors}<span className="text-green-600">**</span></h3>

                    {/* Factors as Tags - compact layout */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {results.recommendedFactors.map((factor, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-body bg-elevated text-text-primary border border-border"
                            >
                                {factor}
                            </span>
                        ))}
                    </div>

                    {/* Hints - compact */}
                    <p className="text-xs text-text-secondary leading-relaxed">
                        <span className="text-green-600 font-bold">*</span> {t.pValueHint}<br/>
                        <span className="text-green-600 font-bold">**</span> {t.recommendedFactorsHint}
                    </p>
                </div>
            </div>
        </div>
    );
};