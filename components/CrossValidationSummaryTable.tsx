import React, { useState, useMemo } from 'react';
import { SavedCrossValidation } from '../types';
import { useApp } from '../contexts/AppContext';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CrossValidationSummaryTableProps {
    savedResults: SavedCrossValidation[];
    onDelete?: (savedId: string) => void;
}

/**
 * Format date from ISO string to Moscow timezone with (МСК) suffix
 */
const formatDate = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        const formatter = new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Moscow',
        });
        const formatted = formatter.format(date);
        return `${formatted} (МСК)`;
    } catch {
        return isoString;
    }
};

const formatR2 = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return '—';
    return (value * 100).toFixed(1) + '%';
};

const formatStat = (value: number | undefined | null, decimals: number = 2): string => {
    if (value === null || value === undefined) return '—';
    return value.toFixed(decimals);
};

const getCompanyName = (dbName: string): string => 'Таврос';

const getMaskingDescription = (
    result: SavedCrossValidation,
    t: { sex: string; farm: string; year: string; monthYear: string; randomSample: string }
): { mode: string; value: string } => {
    const modeLabels: Record<string, string> = {
        sex: t.sex,
        farm: t.farm,
        year: t.year,
        month_year: t.monthYear,
        random: t.randomSample,
    };

    const mode = modeLabels[result.masking.mode] || result.masking.mode;

    if (result.masking.mode === 'random' && result.masking.fraction) {
        return { mode, value: `${(result.masking.fraction * 100).toFixed(0)}%` };
    }

    return { mode, value: result.masking.value || '—' };
};

const escapeCsvField = (field: string): string => {
    if (field.includes(';') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
};

export const downloadCrossValidationCsv = (savedResults: SavedCrossValidation[], t: any) => {
    if (savedResults.length === 0) return;

    const maxFactors = Math.max(...savedResults.map((r) => r.factors.length));
    const sep = ';';

    type CsvRow = { label: string; getValue: (r: SavedCrossValidation) => string };
    const rows: CsvRow[] = [
        { label: t.analysisDate, getValue: (r) => formatDate(r.created_at) },
        { label: t.company, getValue: (r) => getCompanyName(r.db_name) },
        { label: t.breed, getValue: (r) => r.breed_name || r.breed_id },
        { label: t.trait, getValue: (r) => r.trait_name || r.trait_code },
        ...Array.from({ length: maxFactors }, (_, i) => ({
            label: i === 0 ? t.factors : '',
            getValue: (r: SavedCrossValidation) => r.factors[i] || '',
        })),
        { label: t.maskingStrategy, getValue: (r) => getMaskingDescription(r, t).mode },
        { label: t.maskingValue, getValue: (r) => getMaskingDescription(r, t).value },
        { label: t.maskedPhenotypeCount, getValue: (r) => r.stats_masked?.count?.toString() || '—' },
        { label: t.maskedAnimalCount, getValue: (r) => r.stats_masked?.animal_count?.toString() || '—' },
        { label: t.maskedMean, getValue: (r) => formatStat(r.stats_masked?.mean) },
        { label: t.maskedStdDev, getValue: (r) => formatStat(r.stats_masked?.std) },
        { label: t.maskedMin, getValue: (r) => formatStat(r.stats_masked?.min) },
        { label: t.maskedMax, getValue: (r) => formatStat(r.stats_masked?.max) },
        { label: t.unmaskedPhenotypeCount, getValue: (r) => r.stats_unmasked?.count?.toString() || '—' },
        { label: t.unmaskedAnimalCount, getValue: (r) => r.stats_unmasked?.animal_count?.toString() || '—' },
        { label: t.unmaskedMean, getValue: (r) => formatStat(r.stats_unmasked?.mean) },
        { label: t.unmaskedStdDev, getValue: (r) => formatStat(r.stats_unmasked?.std) },
        { label: t.unmaskedMin, getValue: (r) => formatStat(r.stats_unmasked?.min) },
        { label: t.unmaskedMax, getValue: (r) => formatStat(r.stats_unmasked?.max) },
        { label: t.r2EbvTrait, getValue: (r) => formatR2(r.r2_ebv_trait) },
        { label: t.r2PhenotypeTrait, getValue: (r) => formatR2(r.r2_pred_trait) },
    ];

    const csvRows: string[] = [];
    const header = [
        t.characteristic,
        ...savedResults.map((r, i) => r.name || `${t.variant} ${i + 1}`),
    ];
    csvRows.push(header.map(escapeCsvField).join(sep));

    for (const row of rows) {
        const cells = [row.label, ...savedResults.map((r) => row.getValue(r))];
        csvRows.push(cells.map(escapeCsvField).join(sep));
    }

    const bom = '\uFEFF';
    const csvContent = bom + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'сводная-таблица-кросс-валидации.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

type SortDirection = 'asc' | 'desc' | null;

// Row group types for coloring
type RowGroup = 'info' | 'factors' | 'masking' | 'masked' | 'unmasked' | 'results';

// Group colors (subtle transparency for gentle visual separation)
const groupColors: Record<RowGroup, { bg: string; bgSticky: string }> = {
    info: { bg: 'bg-surface', bgSticky: 'bg-surface' },
    factors: { bg: 'bg-blue-500/5 dark:bg-blue-400/5', bgSticky: 'bg-blue-500/5 dark:bg-blue-400/5' },
    masking: { bg: 'bg-surface', bgSticky: 'bg-surface' },
    masked: { bg: 'bg-amber-500/5 dark:bg-amber-400/5', bgSticky: 'bg-amber-500/5 dark:bg-amber-400/5' },
    unmasked: { bg: 'bg-emerald-500/5 dark:bg-emerald-400/5', bgSticky: 'bg-emerald-500/5 dark:bg-emerald-400/5' },
    results: { bg: 'bg-purple-500/5 dark:bg-purple-400/5', bgSticky: 'bg-purple-500/5 dark:bg-purple-400/5' },
};

interface RowDef {
    key: string;
    label: string;
    group: RowGroup;
    sortable: boolean;
    getValue: (result: SavedCrossValidation) => React.ReactNode;
    getSortValue: (result: SavedCrossValidation) => string | number;
}

export const CrossValidationSummaryTable: React.FC<CrossValidationSummaryTableProps> = ({
    savedResults,
    onDelete,
}) => {
    const { t } = useApp();

    // Sorting state: which row key is being sorted and direction
    const [sortKey, setSortKey] = useState<string | null>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Find the maximum number of factors across all results (0 if empty)
    const maxFactors = savedResults.length > 0
        ? Math.max(...savedResults.map((r) => r.factors.length))
        : 0;

    // Define all rows with their groups
    const rows: RowDef[] = [
        // Info group
        {
            key: 'date',
            label: t.analysisDate,
            group: 'info',
            sortable: true,
            getValue: (r) => formatDate(r.created_at),
            getSortValue: (r) => new Date(r.created_at).getTime(),
        },
        {
            key: 'company',
            label: t.company,
            group: 'info',
            sortable: true,
            getValue: (r) => getCompanyName(r.db_name),
            getSortValue: (r) => getCompanyName(r.db_name),
        },
        {
            key: 'breed',
            label: t.breed,
            group: 'info',
            sortable: true,
            getValue: (r) => r.breed_name || r.breed_id,
            getSortValue: (r) => r.breed_name || r.breed_id,
        },
        {
            key: 'trait',
            label: t.trait,
            group: 'info',
            sortable: true,
            getValue: (r) => r.trait_name || r.trait_code,
            getSortValue: (r) => r.trait_name || r.trait_code,
        },
        // Factors group
        ...Array.from({ length: maxFactors }, (_, i) => ({
            key: `factor_${i}`,
            label: i === 0 ? t.factors : '',
            group: 'factors' as RowGroup,
            sortable: i === 0, // Only first factor row is sortable
            getValue: (r: SavedCrossValidation) => r.factors[i] || '',
            getSortValue: (r: SavedCrossValidation) => r.factors.length,
        })),
        // Masking group
        {
            key: 'masking_mode',
            label: t.maskingStrategy,
            group: 'masking',
            sortable: true,
            getValue: (r) => getMaskingDescription(r, t).mode,
            getSortValue: (r) => r.masking.mode,
        },
        {
            key: 'masking_value',
            label: t.maskingValue,
            group: 'masking',
            sortable: true,
            getValue: (r) => getMaskingDescription(r, t).value,
            getSortValue: (r) => r.masking.value || r.masking.fraction?.toString() || '',
        },
        // Masked stats group
        {
            key: 'phenotype_count_masked',
            label: t.maskedPhenotypeCount,
            group: 'masked',
            sortable: true,
            getValue: (r) => r.stats_masked?.count?.toString() || '—',
            getSortValue: (r) => r.stats_masked?.count ?? -1,
        },
        {
            key: 'animal_count_masked',
            label: t.maskedAnimalCount,
            group: 'masked',
            sortable: true,
            getValue: (r) => r.stats_masked?.animal_count?.toString() || '—',
            getSortValue: (r) => r.stats_masked?.animal_count ?? -1,
        },
        {
            key: 'masked_mean',
            label: t.maskedMean,
            group: 'masked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_masked?.mean),
            getSortValue: (r) => r.stats_masked?.mean ?? -Infinity,
        },
        {
            key: 'masked_std',
            label: t.maskedStdDev,
            group: 'masked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_masked?.std),
            getSortValue: (r) => r.stats_masked?.std ?? -Infinity,
        },
        {
            key: 'masked_min',
            label: t.maskedMin,
            group: 'masked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_masked?.min),
            getSortValue: (r) => r.stats_masked?.min ?? -Infinity,
        },
        {
            key: 'masked_max',
            label: t.maskedMax,
            group: 'masked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_masked?.max),
            getSortValue: (r) => r.stats_masked?.max ?? -Infinity,
        },
        // Unmasked stats group
        {
            key: 'phenotype_count_unmasked',
            label: t.unmaskedPhenotypeCount,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => r.stats_unmasked?.count?.toString() || '—',
            getSortValue: (r) => r.stats_unmasked?.count ?? -1,
        },
        {
            key: 'animal_count_unmasked',
            label: t.unmaskedAnimalCount,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => r.stats_unmasked?.animal_count?.toString() || '—',
            getSortValue: (r) => r.stats_unmasked?.animal_count ?? -1,
        },
        {
            key: 'unmasked_mean',
            label: t.unmaskedMean,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_unmasked?.mean),
            getSortValue: (r) => r.stats_unmasked?.mean ?? -Infinity,
        },
        {
            key: 'unmasked_std',
            label: t.unmaskedStdDev,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_unmasked?.std),
            getSortValue: (r) => r.stats_unmasked?.std ?? -Infinity,
        },
        {
            key: 'unmasked_min',
            label: t.unmaskedMin,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_unmasked?.min),
            getSortValue: (r) => r.stats_unmasked?.min ?? -Infinity,
        },
        {
            key: 'unmasked_max',
            label: t.unmaskedMax,
            group: 'unmasked',
            sortable: true,
            getValue: (r) => formatStat(r.stats_unmasked?.max),
            getSortValue: (r) => r.stats_unmasked?.max ?? -Infinity,
        },
        // Results group
        {
            key: 'r2_ebv',
            label: t.r2EbvTrait,
            group: 'results',
            sortable: true,
            getValue: (r) => formatR2(r.r2_ebv_trait),
            getSortValue: (r) => r.r2_ebv_trait ?? -Infinity,
        },
        {
            key: 'r2_pred',
            label: t.r2PhenotypeTrait,
            group: 'results',
            sortable: true,
            getValue: (r) => formatR2(r.r2_pred_trait),
            getSortValue: (r) => r.r2_pred_trait ?? -Infinity,
        },
    ];

    // Sort results based on selected row
    const sortedResults = useMemo(() => {
        if (!sortKey || !sortDirection) return savedResults;

        const sortRow = rows.find(r => r.key === sortKey);
        if (!sortRow) return savedResults;

        return [...savedResults].sort((a, b) => {
            const valA = sortRow.getSortValue(a);
            const valB = sortRow.getSortValue(b);

            let comparison = 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else {
                comparison = String(valA).localeCompare(String(valB), 'ru');
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [savedResults, sortKey, sortDirection, rows]);

    // Handle sort click on a row
    const handleSort = (key: string) => {
        if (sortKey === key) {
            // Toggle direction or clear
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else {
                setSortDirection('desc');
            }
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const handleDelete = (savedId: string) => {
        if (onDelete && window.confirm(t.confirmDelete)) {
            onDelete(savedId);
        }
    };

    // Get sort icon for a row (white color for visibility on dark header background)
    const getSortIcon = (key: string) => {
        if (sortKey !== key) return null;
        return sortDirection === 'asc' ? (
            <ArrowUp size={12} className="text-white/70 dark:text-[#1a1a1a]/70" />
        ) : (
            <ArrowDown size={12} className="text-white/70 dark:text-[#1a1a1a]/70" />
        );
    };

    // Early return for empty state - MUST be after all hooks
    if (savedResults.length === 0) {
        return (
            <div className="text-text-secondary text-center py-8">
                {t.noSavedCrossValidations}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr>
                        <th className="sticky left-0 z-20 px-3 py-2 text-left type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border border-border min-w-[220px]">
                            {t.characteristic}
                        </th>
                        {sortedResults.map((result, idx) => (
                            <th
                                key={result.id}
                                className="px-3 py-2 text-center type-label text-white dark:text-[#1a1a1a] bg-interactive-subtle border border-border min-w-[140px]"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span>
                                        {result.name || `${t.variant} ${idx + 1}`}
                                    </span>
                                    {onDelete && (
                                        <button
                                            onClick={() => handleDelete(result.id)}
                                            className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                            title={t.deleteResult}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const colors = groupColors[row.group];
                        return (
                            <tr key={row.key} className={colors.bg}>
                                {/* First column styled as legend/header */}
                                <td
                                    className="sticky left-0 z-10 px-3 py-2 text-body font-medium text-white dark:text-[#1a1a1a] bg-interactive-subtle border border-border"
                                >
                                    {row.sortable ? (
                                        <button
                                            onClick={() => handleSort(row.key)}
                                            className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full text-left"
                                            title={t.sortNewestFirst}
                                        >
                                            <span>{row.label}</span>
                                            {getSortIcon(row.key)}
                                        </button>
                                    ) : (
                                        row.label
                                    )}
                                </td>
                                {sortedResults.map((result) => (
                                    <td
                                        key={`${row.key}-${result.id}`}
                                        className={`px-3 py-2 text-body text-text-primary border border-border text-center ${colors.bg}`}
                                    >
                                        {row.getValue(result)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
