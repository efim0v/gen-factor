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
}

// Helper for table headers
const TableHeader: React.FC<TableHeaderProps> = ({ children, tooltip = false }) => (
    <th className="px-6 py-3 text-left type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border-r border-border last:border-r-0">
        {tooltip && typeof children === 'string' ? (
            <TooltipText text={children} maxWidth="max-w-[120px]" className="text-white dark:text-[#1a1a1a]" />
        ) : (
            children
        )}
    </th>
);

interface TableCellProps {
    children: React.ReactNode;
    highlight?: boolean;
    tooltip?: boolean;
}

// Helper for table cells
const TableCell: React.FC<TableCellProps> = ({ children, highlight = false, tooltip = false }) => (
    <td className={`px-6 py-4 text-body text-text-primary border-b border-border ${highlight ? 'font-semibold' : ''}`}>
        {tooltip && typeof children === 'string' ? (
            <TooltipText text={children} maxWidth="max-w-[150px]" />
        ) : (
            <span className="whitespace-nowrap">{children}</span>
        )}
    </td>
);

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

    // Sort model accuracy by number of factors (ascending)
    const sortedModelAccuracy = React.useMemo(() => {
        return [...results.modelAccuracy].sort((a, b) => a.factors.length - b.factors.length);
    }, [results.modelAccuracy]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-h2 text-text-primary text-center mb-8">{t.analysisResults}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Table 1: Factor Effect */}
                <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
                    <h3 className="px-6 py-4 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.factorEffects}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <TableHeader>{t.factor}</TableHeader>
                                    <TableHeader>{t.effect}</TableHeader>
                                    <TableHeader>{t.pValue}</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {results.factorEffects.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        <TableCell highlight tooltip>{row.factor}</TableCell>
                                        <TableCell>{row.effect}</TableCell>
                                        <TableCell>
                                            {row.pValue}
                                            {row.pValue < 0.05 && <span className="font-bold ml-1">*</span>}
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: Correlation */}
                <div className="bg-surface shadow rounded-lg overflow-hidden border border-border">
                    <h3 className="px-6 py-4 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.correlations}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <TableHeader>{t.factor1}</TableHeader>
                                    <TableHeader>{t.factor2}</TableHeader>
                                    <TableHeader>{t.correlation}</TableHeader>
                                    <TableHeader>{t.pValue}</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {results.correlations.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}>
                                        <TableCell tooltip>{row.factor1}</TableCell>
                                        <TableCell tooltip>{row.factor2}</TableCell>
                                        <TableCell>{row.correlation}</TableCell>
                                        <TableCell>
                                            {row.pValue}
                                            {row.pValue < 0.05 && <span className="font-bold ml-1">*</span>}
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Table 3: Model Accuracy */}
                 <div className="bg-surface shadow rounded-lg overflow-hidden border border-border h-fit">
                    <h3 className="px-6 py-4 text-h4 text-text-primary bg-elevated border-b border-border">
                        {t.modelAccuracy}
                    </h3>
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    {allFactors.map(factor => (
                                        <TableHeader key={factor} tooltip>{factor}</TableHeader>
                                    ))}
                                    <th className="sticky right-0 px-6 py-3 text-left type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border-l-2 border-border-strong">
                                        R²
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {sortedModelAccuracy.map((row, idx) => {
                                    const rowBg = idx % 2 === 0 ? 'bg-elevated' : 'bg-surface';
                                    return (
                                        <tr key={idx}>
                                            {allFactors.map(factor => {
                                                const hasFactor = row.factors.includes(factor);
                                                return (
                                                    <td
                                                        key={factor}
                                                        className={`px-6 py-4 text-body border-b border-border text-center ${
                                                            hasFactor
                                                                ? `${rowBg} text-text-primary font-medium`
                                                                : 'bg-page'
                                                        }`}
                                                    >
                                                        {hasFactor ? (
                                                            <TooltipText text={factor} maxWidth="max-w-[100px]" className="mx-auto" />
                                                        ) : ''}
                                                    </td>
                                                );
                                            })}
                                            <td className={`sticky right-0 px-6 py-4 whitespace-nowrap text-body-lg font-extrabold text-text-primary border-b border-border border-l-2 border-border-strong ${rowBg}`}>
                                                {row.r2}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recommended Factors */}
                <div className="bg-surface shadow rounded-lg p-6 border border-border">
                    <h3 className="text-h4 text-text-primary mb-4">{t.recommendedFactors}**</h3>

                    {/* Factors as Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {results.recommendedFactors.map((factor, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-4 py-2 rounded-lg text-body-lg bg-elevated text-text-primary border border-border max-w-[250px]"
                            >
                                <TooltipText text={factor} maxWidth="max-w-[220px]" />
                            </span>
                        ))}
                    </div>

                    {/* Hints */}
                    <p className="text-caption text-text-secondary leading-relaxed">
                        * {t.pValueHint}<br/>
                        ** {t.recommendedFactorsHint}
                    </p>
                </div>
            </div>
        </div>
    );
};