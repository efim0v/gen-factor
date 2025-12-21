import React from 'react';
import { AnalysisResults } from '../types';
import { Download } from 'lucide-react';
import { Button } from './UI';

interface ResultsViewProps {
    results: AnalysisResults;
    onDownload: () => void;
    isDownloading: boolean;
}

interface TableHeaderProps {
    children: React.ReactNode;
}

// Helper for table headers
const TableHeader: React.FC<TableHeaderProps> = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-500 border-r border-blue-400 last:border-r-0">
        {children}
    </th>
);

interface TableCellProps {
    children: React.ReactNode;
    highlight?: boolean;
}

// Helper for table cells
const TableCell: React.FC<TableCellProps> = ({ children, highlight = false }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 border-b border-slate-200 ${highlight ? 'font-semibold' : ''}`}>
        {children}
    </td>
);

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onDownload, isDownloading }) => {

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Результаты анализа</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Table 1: Factor Effect */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                    <h3 className="px-6 py-4 text-lg font-semibold text-slate-800 bg-slate-50 border-b border-slate-200">
                        Влияние факторов на признак
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Фактор</TableHeader>
                                    <TableHeader>Эффект</TableHeader>
                                    <TableHeader>p-значение</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {results.factorEffects.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                                        <TableCell highlight>{row.factor}</TableCell>
                                        <TableCell>{row.effect}</TableCell>
                                        <TableCell>
                                            {row.pValue}
                                            {row.pValue < 0.05 && <span className="text-blue-600 font-bold ml-1">*</span>}
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: Correlation */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                    <h3 className="px-6 py-4 text-lg font-semibold text-slate-800 bg-slate-50 border-b border-slate-200">
                        Корреляция между факторами
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Фактор 1</TableHeader>
                                    <TableHeader>Фактор 2</TableHeader>
                                    <TableHeader>Корреляция</TableHeader>
                                    <TableHeader>p-значение</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {results.correlations.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                                        <TableCell>{row.factor1}</TableCell>
                                        <TableCell>{row.factor2}</TableCell>
                                        <TableCell>{row.correlation}</TableCell>
                                        <TableCell>
                                            {row.pValue}
                                            {row.pValue < 0.05 && <span className="text-blue-600 font-bold ml-1">*</span>}
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
                 <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200 h-fit">
                    <h3 className="px-6 py-4 text-lg font-semibold text-slate-800 bg-slate-50 border-b border-slate-200">
                        Точность прогнозной модели
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Список факторов</TableHeader>
                                    <TableHeader>R2</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {results.modelAccuracy.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                                        <TableCell>{row.factors.join(', ')}</TableCell>
                                        <TableCell>{row.r2}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recommended Factors List */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Рекомендуемые факторы**</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {results.recommendedFactors.map((factor, idx) => (
                                <li key={idx} className="text-slate-700 font-medium">{factor}</li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Download Action */}
                    <div className="pt-4">
                        <Button 
                            onClick={onDownload} 
                            isLoading={isDownloading} 
                            icon={<Download className="w-5 h-5" />}
                            className="w-full sm:w-auto"
                        >
                            Скачать результаты (ZIP)
                        </Button>
                        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                            * p-значение &lt; 0.05 считается статистически значимым влиянием на признак.<br/>
                            ** Список составлен по одному из двух критериев: 1) исключен один из пары признаков с взаимной корреляцией &gt; 0.7 и оставлены только статистически значимые факторы, 2) дисперсия описанной модели максимальна.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};