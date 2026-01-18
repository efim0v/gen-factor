export type TableName = 'animals' | 'classification' | 'reproduction';

const KNOWN_TABLES: TableName[] = ['animals', 'classification', 'reproduction'];
const REPRODUCTION_FIELDS = ['liveborn', 'cycle', 'nest_weight', 'fertility'];
const CLASSIFICATION_FIELDS = ['nipples', 'daily_growth', 'backfat1', 'weight'];

const normalizeTable = (value?: string): TableName | null => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return null;
    }
    return (KNOWN_TABLES as string[]).includes(normalized)
        ? (normalized as TableName)
        : null;
};

export const resolveTableName = (input?: {
    table?: string;
    type?: string;
    code?: string;
    label?: string;
}): TableName => {
    const explicitTable = normalizeTable(input?.table) || normalizeTable(input?.type);
    if (explicitTable) {
        return explicitTable;
    }

    const code = (input?.code || input?.label || '').toLowerCase();
    if (REPRODUCTION_FIELDS.includes(code)) {
        return 'reproduction';
    }
    if (CLASSIFICATION_FIELDS.includes(code)) {
        return 'classification';
    }
    return 'animals';
};

export const isReproductionFactorDisallowed = (
    traitTable: TableName,
    factorTable: TableName
): boolean => traitTable !== 'reproduction' && factorTable === 'reproduction';
