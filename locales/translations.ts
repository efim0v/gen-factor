export type Language = 'ru' | 'en';

export interface Translations {
    // Header
    appTitle: string;
    appSubtitle: string;
    factorAnalysis: string;
    crossValidation: string;

    // Settings
    settings: string;
    language: string;
    theme: string;
    lightTheme: string;
    darkTheme: string;

    // Data Selection
    dataSelection: string;
    database: string;
    breed: string;
    trait: string;
    selectDatabase: string;
    firstSelectDatabase: string;
    selectBreed: string;
    selectTrait: string;

    // Factor Selection
    factorSelection: string;
    factors: string;
    analyzeAllCombinations: string;
    analyzeAllCombinationsHint: string;
    selectFactors: string;
    searchFactors: string;
    factorsNotFound: string;

    // Actions
    analyze: string;
    save: string;
    download: string;
    saveRecommendedFactors: string;
    downloadResults: string;
    downloadTable: string;
    startAnalysis: string;
    processing: string;

    // Results
    analysisResults: string;
    factorEffects: string;
    correlations: string;
    modelAccuracy: string;
    recommendedFactors: string;

    // Table Headers
    factor: string;
    effect: string;
    pValue: string;
    factor1: string;
    factor2: string;
    correlation: string;

    // Messages
    loading: string;
    analyzing: string;
    noDataAvailable: string;
    error: string;
    success: string;
    loadingOptions: string;
    noOptionsAvailable: string;
    savedSuccessfully: string;

    // Validation messages
    pleaseSelect: string;
    pleaseSelectBreed: string;
    pleaseSelectTrait: string;
    pleaseSelectFactor: string;

    // Save dialog
    enterAnalysisName: string;
    analysisName: string;
    analysisNamePlaceholder: string;
    cancel: string;

    // Footer
    footerCopyright: string;
    footerPlatformName: string;

    // Hints
    pValueHint: string;
    recommendedFactorsHintIntro: string;
    recommendedFactorsHintCriteria1: string;
    recommendedFactorsHintCriteria2: string;
    recommendedFactorsHintFallback: string;
    recommendedFactorsHintCorrelation: string;

    // Cross-Validation
    maskingStrategy: string;
    selectRecommendedFactors: string;
    startCrossValidation: string;
    crossValidationResults: string;
    groupStatistics: string;
    predictionAccuracy: string;
    masked: string;
    unmasked: string;
    group: string;
    count: string;
    animalCount: string;
    mean: string;
    stdDev: string;
    min: string;
    max: string;
    r2EbvTrait: string;
    r2EbvTraitDesc: string;
    r2PhenotypeTrait: string;
    r2PhenotypeTraitDesc: string;
    warnings: string;
    savedFactorResults: string;
    noSavedResults: string;
    close: string;
    selectValue: string;
    fractionToMask: string;
    pleaseSelectMaskingStrategy: string;
    pleaseSelectMaskingValue: string;
    sex: string;
    farm: string;
    year: string;
    monthYear: string;
    randomSample: string;
    goToCrossValidation: string;
    customPercentage: string;

    // Saved Cross-Validations
    saveCrossValidationResult: string;
    savedCrossValidationResults: string;
    characteristic: string;
    variant: string;
    analysisDate: string;
    percentMasked: string;
    noSavedCrossValidations: string;
    cvSavedSuccessfully: string;
    deleteResult: string;
    confirmDelete: string;
    company: string;
    maskingValue: string;
    maskedPhenotypeCount: string;
    unmaskedPhenotypeCount: string;
    maskedAnimalCount: string;
    unmaskedAnimalCount: string;
    maskedMean: string;
    maskedStdDev: string;
    maskedMin: string;
    maskedMax: string;
    unmaskedMean: string;
    unmaskedStdDev: string;
    unmaskedMin: string;
    unmaskedMax: string;
    sortNewestFirst: string;
    sortOldestFirst: string;
}

export const translations: Record<Language, Translations> = {
    ru: {
        // Header
        appTitle: 'Анализ факторов среды и кросс-валидация',
        appSubtitle: 'Пульс.ЦСС',
        factorAnalysis: 'Факторный анализ',
        crossValidation: 'Кросс-валидация',

        // Settings
        settings: 'Настройки',
        language: 'Язык',
        theme: 'Тема',
        lightTheme: 'Светлая',
        darkTheme: 'Темная',

        // Data Selection
        dataSelection: 'Выбор данных',
        database: 'База данных',
        breed: 'Порода',
        trait: 'Признак',
        selectDatabase: 'Выберите базу данных...',
        firstSelectDatabase: 'Сначала выберите базу данных',
        selectBreed: 'Выберите породу...',
        selectTrait: 'Выберите признак...',

        // Factor Selection
        factorSelection: 'Выбор факторов',
        factors: 'Факторы',
        analyzeAllCombinations: 'Анализировать все комбинации факторов',
        analyzeAllCombinationsHint: 'Анализ займёт больше времени, но покажет оптимальную комбинацию',
        selectFactors: 'Выберите факторы...',
        searchFactors: 'Поиск факторов...',
        factorsNotFound: 'Факторы не найдены',

        // Actions
        analyze: 'Анализировать',
        save: 'Сохранить',
        download: 'Скачать',
        saveRecommendedFactors: 'Сохранить рекомендуемые факторы',
        downloadResults: 'Скачать результаты (ZIP)',
        downloadTable: 'Скачать таблицу',
        startAnalysis: 'Начать анализ',
        processing: 'Обработка...',

        // Results
        analysisResults: 'Результаты анализа',
        factorEffects: 'Влияние факторов на признак',
        correlations: 'Корреляция между факторами',
        modelAccuracy: 'Точность прогнозной модели',
        recommendedFactors: 'Рекомендуемые факторы',

        // Table Headers
        factor: 'Фактор',
        effect: 'Эффект',
        pValue: 'p-value',
        factor1: 'Фактор 1',
        factor2: 'Фактор 2',
        correlation: 'Корреляция',

        // Messages
        loading: 'Загрузка...',
        analyzing: 'Анализ...',
        noDataAvailable: 'Нет доступных данных',
        error: 'Ошибка',
        success: 'Успешно',
        loadingOptions: 'Загрузка вариантов...',
        noOptionsAvailable: 'Нет доступных вариантов',
        savedSuccessfully: 'Рекомендуемые факторы успешно сохранены!',

        // Validation messages
        pleaseSelect: 'Пожалуйста, выберите',
        pleaseSelectBreed: 'Пожалуйста, выберите породу',
        pleaseSelectTrait: 'Пожалуйста, выберите признак',
        pleaseSelectFactor: 'Пожалуйста, выберите хотя бы один фактор',

        // Save dialog
        enterAnalysisName: 'Введите название анализа',
        analysisName: 'Название анализа',
        analysisNamePlaceholder: 'Например: Анализ молочных признаков 2026',
        cancel: 'Отмена',

        // Footer
        footerCopyright: 'ComputeBio 2026',
        footerPlatformName: 'BLUP/ssgBLUP Analysis Platform',

        // Hints
        pValueHint: 'p-value < 0.05 считается статистически значимым влиянием на признак.',
        recommendedFactorsHintIntro: 'Список составлен по двум критериям:',
        recommendedFactorsHintCriteria1: '1) при наличии высокой корреляции между факторами (> 0.7) из пары исключается тот, у которого меньше влияние на признак (выше p-value);',
        recommendedFactorsHintCriteria2: '2) среди оставшихся факторов выбирается комбинация с максимальной объяснённой дисперсией (R²).',
        recommendedFactorsHintFallback: 'Если ни один фактор не является статистически значимым (p ≥ 0.05), выбираются 3 фактора с наименьшими p-value.',
        recommendedFactorsHintCorrelation: 'Методы расчёта корреляции: V Крамера — между категориальными признаками; R² регрессионной модели (категориальный признак — независимая переменная, количественный — зависимая) — между категориальным и количественным признаком; коэффициент корреляции Пирсона — между количественными признаками.',

        // Cross-Validation
        maskingStrategy: 'Стратегия маскирования',
        selectRecommendedFactors: 'Выбрать рекомендуемые факторы',
        startCrossValidation: 'Запустить кросс-валидацию',
        crossValidationResults: 'Результаты кросс-валидации',
        groupStatistics: 'Статистика групп',
        predictionAccuracy: 'Точность прогноза (R²)',
        masked: 'Замаскированные',
        unmasked: 'Незамаскированные',
        group: 'Группа',
        count: 'Количество фенотипов',
        animalCount: 'Количество животных',
        mean: 'Среднее',
        stdDev: 'Ст. откл.',
        min: 'Мин',
        max: 'Макс',
        r2EbvTrait: 'R² (EBV vs Признак)',
        r2EbvTraitDesc: 'Квадрат коэффициента корреляции между EBV и измеренным признаком для замаскированных животных',
        r2PhenotypeTrait: 'R² (Предсказанный vs Измеренный признак)',
        r2PhenotypeTraitDesc: 'Квадрат коэффициента корреляции между предсказанным и измеренным признаком для замаскированных животных',
        warnings: 'Предупреждения',
        savedFactorResults: 'Сохранённые результаты факторного анализа',
        noSavedResults: 'Сохранённых результатов не найдено. Сначала запустите факторный анализ и сохраните рекомендуемые факторы.',
        close: 'Закрыть',
        selectValue: 'Выберите значение...',
        fractionToMask: 'Доля животных для маскирования',
        pleaseSelectMaskingStrategy: 'Пожалуйста, выберите стратегию маскирования',
        pleaseSelectMaskingValue: 'Пожалуйста, выберите значение для маскирования',
        sex: 'Пол',
        farm: 'Ферма',
        year: 'Год',
        monthYear: 'Месяц.Год',
        randomSample: 'Случайная выборка',
        goToCrossValidation: 'Перейти к кросс-валидации',
        customPercentage: 'Введите процент вручную',

        // Saved Cross-Validations
        saveCrossValidationResult: 'Сохранить результат',
        savedCrossValidationResults: 'Сохранённые результаты кросс-валидации',
        characteristic: 'Характеристика',
        variant: 'Вариант',
        analysisDate: 'Дата анализа',
        percentMasked: '% замаскированных животных',
        noSavedCrossValidations: 'Нет сохранённых результатов кросс-валидации для этого признака.',
        cvSavedSuccessfully: 'Результат кросс-валидации успешно сохранён!',
        deleteResult: 'Удалить',
        confirmDelete: 'Вы уверены, что хотите удалить этот результат?',
        company: 'База данных',
        maskingValue: 'Значение маскирования',
        maskedPhenotypeCount: 'Замаскированное количество фенотипов',
        unmaskedPhenotypeCount: 'Незамаскированное количество фенотипов',
        maskedAnimalCount: 'Замаскированное количество животных',
        unmaskedAnimalCount: 'Незамаскированное количество животных',
        maskedMean: 'Среднее (замаск.)',
        maskedStdDev: 'Ст. откл. (замаск.)',
        maskedMin: 'Мин. (замаск.)',
        maskedMax: 'Макс. (замаск.)',
        unmaskedMean: 'Среднее (незамаск.)',
        unmaskedStdDev: 'Ст. откл. (незамаск.)',
        unmaskedMin: 'Мин. (незамаск.)',
        unmaskedMax: 'Макс. (незамаск.)',
        sortNewestFirst: 'Сортировать: сначала новые',
        sortOldestFirst: 'Сортировать: сначала старые',
    },
    en: {
        // Header
        appTitle: 'Environmental Factor Analysis & Cross-Validation',
        appSubtitle: 'Пульс.ЦСС',
        factorAnalysis: 'Factor Analysis',
        crossValidation: 'Cross-Validation',

        // Settings
        settings: 'Settings',
        language: 'Language',
        theme: 'Theme',
        lightTheme: 'Light',
        darkTheme: 'Dark',

        // Data Selection
        dataSelection: 'Data Selection',
        database: 'Database',
        breed: 'Breed',
        trait: 'Trait',
        selectDatabase: 'Select database...',
        firstSelectDatabase: 'First select database',
        selectBreed: 'Select breed...',
        selectTrait: 'Select trait...',

        // Factor Selection
        factorSelection: 'Factor Selection',
        factors: 'Factors',
        analyzeAllCombinations: 'Analyze all factor combinations',
        analyzeAllCombinationsHint: 'Analysis will take longer but will show optimal combination',
        selectFactors: 'Select factors...',
        searchFactors: 'Search factors...',
        factorsNotFound: 'Factors not found',

        // Actions
        analyze: 'Analyze',
        save: 'Save',
        download: 'Download',
        saveRecommendedFactors: 'Save Recommended Factors',
        downloadResults: 'Download Results (ZIP)',
        downloadTable: 'Download Table',
        startAnalysis: 'Start Analysis',
        processing: 'Processing...',

        // Results
        analysisResults: 'Analysis Results',
        factorEffects: 'Factor Effects on Trait',
        correlations: 'Factor Correlations',
        modelAccuracy: 'Predictive Model Accuracy',
        recommendedFactors: 'Recommended Factors',

        // Table Headers
        factor: 'Factor',
        effect: 'Effect',
        pValue: 'p-value',
        factor1: 'Factor 1',
        factor2: 'Factor 2',
        correlation: 'Correlation',

        // Messages
        loading: 'Loading...',
        analyzing: 'Analyzing...',
        noDataAvailable: 'No data available',
        error: 'Error',
        success: 'Success',
        loadingOptions: 'Loading options...',
        noOptionsAvailable: 'No options available',
        savedSuccessfully: 'Recommended factors saved successfully!',

        // Validation messages
        pleaseSelect: 'Please select',
        pleaseSelectBreed: 'Please select a breed',
        pleaseSelectTrait: 'Please select a trait',
        pleaseSelectFactor: 'Please select at least one factor',

        // Save dialog
        enterAnalysisName: 'Enter analysis name',
        analysisName: 'Analysis name',
        analysisNamePlaceholder: 'e.g., Milk traits analysis 2026',
        cancel: 'Cancel',

        // Footer
        footerCopyright: 'ComputeBio 2026',
        footerPlatformName: 'BLUP/ssgBLUP Analysis Platform',

        // Hints
        pValueHint: 'p-value < 0.05 is considered statistically significant effect on trait.',
        recommendedFactorsHintIntro: 'List compiled using two criteria:',
        recommendedFactorsHintCriteria1: '1) when factors are highly correlated (> 0.7), the one with less influence on the trait (higher p-value) is excluded from the pair;',
        recommendedFactorsHintCriteria2: '2) among the remaining factors, the combination with maximum explained variance (R²) is selected.',
        recommendedFactorsHintFallback: 'If no factor is statistically significant (p ≥ 0.05), the top 3 factors with the lowest p-values are selected.',
        recommendedFactorsHintCorrelation: 'Correlation methods: Cramér\'s V — between categorical variables; R² of regression model (categorical as independent variable, continuous as dependent) — between categorical and continuous variables; Pearson correlation coefficient — between continuous variables.',

        // Cross-Validation
        maskingStrategy: 'Masking Strategy',
        selectRecommendedFactors: 'Select Recommended Factors',
        startCrossValidation: 'Start Cross-Validation',
        crossValidationResults: 'Cross-Validation Results',
        groupStatistics: 'Group Statistics',
        predictionAccuracy: 'Prediction Accuracy (R²)',
        masked: 'Masked',
        unmasked: 'Unmasked',
        group: 'Group',
        count: 'Phenotype Count',
        animalCount: 'Animal Count',
        mean: 'Mean',
        stdDev: 'Std Dev',
        min: 'Min',
        max: 'Max',
        r2EbvTrait: 'R² (EBV vs Trait)',
        r2EbvTraitDesc: 'Squared correlation coefficient between EBV and measured trait for masked animals',
        r2PhenotypeTrait: 'R² (Predicted vs Measured Trait)',
        r2PhenotypeTraitDesc: 'Squared correlation coefficient between predicted and measured trait for masked animals',
        warnings: 'Warnings',
        savedFactorResults: 'Saved Factor Analysis Results',
        noSavedResults: 'No saved results found. Run factor analysis and save the recommended factors first.',
        close: 'Close',
        selectValue: 'Select value...',
        fractionToMask: 'Fraction of Animals to Mask',
        pleaseSelectMaskingStrategy: 'Please select a masking strategy',
        pleaseSelectMaskingValue: 'Please select a value to mask',
        sex: 'Sex',
        farm: 'Farm',
        year: 'Year',
        monthYear: 'Month.Year',
        randomSample: 'Random Sample',
        goToCrossValidation: 'Go to Cross-Validation',
        customPercentage: 'Enter custom percentage',

        // Saved Cross-Validations
        saveCrossValidationResult: 'Save Result',
        savedCrossValidationResults: 'Saved Cross-Validation Results',
        characteristic: 'Characteristic',
        variant: 'Variant',
        analysisDate: 'Analysis Date',
        percentMasked: '% Masked Animals',
        noSavedCrossValidations: 'No saved cross-validation results for this trait.',
        cvSavedSuccessfully: 'Cross-validation result saved successfully!',
        deleteResult: 'Delete',
        confirmDelete: 'Are you sure you want to delete this result?',
        company: 'Database',
        maskingValue: 'Masking Value',
        maskedPhenotypeCount: 'Masked Phenotype Count',
        unmaskedPhenotypeCount: 'Unmasked Phenotype Count',
        maskedAnimalCount: 'Masked Animal Count',
        unmaskedAnimalCount: 'Unmasked Animal Count',
        maskedMean: 'Mean (masked)',
        maskedStdDev: 'Std Dev (masked)',
        maskedMin: 'Min (masked)',
        maskedMax: 'Max (masked)',
        unmaskedMean: 'Mean (unmasked)',
        unmaskedStdDev: 'Std Dev (unmasked)',
        unmaskedMin: 'Min (unmasked)',
        unmaskedMax: 'Max (unmasked)',
        sortNewestFirst: 'Sort: newest first',
        sortOldestFirst: 'Sort: oldest first',
    },
};
