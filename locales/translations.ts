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
    recommendedFactorsHint: string;

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
}

export const translations: Record<Language, Translations> = {
    ru: {
        // Header
        appTitle: 'Анализ факторов среды и кросс-валидация',
        appSubtitle: 'Анализ факторов среды и кросс-валидация',
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
        recommendedFactorsHint: 'Список составлен по одному из двух критериев: 1) исключен один из пары признаков с взаимной корреляцией > 0.7 и оставлены только статистически значимые факторы, 2) дисперсия описанной модели максимальна.',

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
        count: 'Количество',
        mean: 'Среднее',
        stdDev: 'Ст. откл.',
        min: 'Мин',
        max: 'Макс',
        r2EbvTrait: 'R² (EBV vs Признак)',
        r2EbvTraitDesc: 'Корреляция между EBV и измеренным признаком для замаскированных животных',
        r2PhenotypeTrait: 'R² (Фенотип vs Признак)',
        r2PhenotypeTraitDesc: 'Корреляция между предсказанным фенотипом и измеренным признаком',
        warnings: 'Предупреждения',
        savedFactorResults: 'Сохранённые результаты факторного анализа',
        noSavedResults: 'Сохранённых результатов не найдено. Сначала запустите факторный анализ и сохраните рекомендуемые факторы.',
        close: 'Закрыть',
        selectValue: 'Выберите значение...',
        fractionToMask: 'Доля для маскирования',
        pleaseSelectMaskingStrategy: 'Пожалуйста, выберите стратегию маскирования',
        pleaseSelectMaskingValue: 'Пожалуйста, выберите значение для маскирования',
        sex: 'Пол',
        farm: 'Ферма',
        year: 'Год',
        monthYear: 'Месяц.Год',
        randomSample: 'Случайная выборка',
    },
    en: {
        // Header
        appTitle: 'Environmental Factor Analysis & Cross-Validation',
        appSubtitle: 'Environmental Factor Analysis & Cross-Validation',
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
        recommendedFactorsHint: 'List compiled according to one of two criteria: 1) one of a pair of traits with mutual correlation > 0.7 is excluded and only statistically significant factors are left, 2) variance of the described model is maximal.',

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
        count: 'Count',
        mean: 'Mean',
        stdDev: 'Std Dev',
        min: 'Min',
        max: 'Max',
        r2EbvTrait: 'R² (EBV vs Trait)',
        r2EbvTraitDesc: 'Correlation between EBV and measured trait for masked animals',
        r2PhenotypeTrait: 'R² (Phenotype vs Trait)',
        r2PhenotypeTraitDesc: 'Correlation between predicted phenotype and measured trait',
        warnings: 'Warnings',
        savedFactorResults: 'Saved Factor Analysis Results',
        noSavedResults: 'No saved results found. Run factor analysis and save the recommended factors first.',
        close: 'Close',
        selectValue: 'Select value...',
        fractionToMask: 'Fraction to Mask',
        pleaseSelectMaskingStrategy: 'Please select a masking strategy',
        pleaseSelectMaskingValue: 'Please select a value to mask',
        sex: 'Sex',
        farm: 'Farm',
        year: 'Year',
        monthYear: 'Month.Year',
        randomSample: 'Random Sample',
    },
};
