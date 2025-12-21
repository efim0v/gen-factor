# Анализ генетических факторов

Веб-приложение для анализа факторов окружающей среды, корреляций и прогностических моделей генетических признаков.

## Возможности

- ✅ Подключение к BLUP API
- ✅ Выбор баз данных, пород, признаков
- ✅ Множественный выбор факторов среды
- ✅ Анализ корреляций и построение прогнозных моделей
- ✅ Экспорт результатов

## Быстрый старт

**Требования:** Node.js 16+

```bash
# 1. Установите зависимости
npm install

# 2. Запустите приложение
npm run dev

# 3. Откройте браузер
http://localhost:3000
```

## API Интеграция

Приложение подключено к BLUP API:
- **URL:** http://92.50.154.150:45501/blup/api
- **Аутентификация:** Basic Auth (настроена автоматически через Vite proxy)
- **Документация API:** http://92.50.154.150:45501/blup/docs

### CORS решён через Vite proxy
Все запросы проксируются через dev сервер, что обходит CORS ограничения.
См. [CORS_FIX.md](CORS_FIX.md) для деталей.

## Deployment

Приложение готово к деплою на Netlify. См. [DEPLOYMENT.md](DEPLOYMENT.md) для инструкций.

**Важно:** Используется Netlify Functions для обхода Mixed Content (HTTPS → HTTP API).

## Документация

- [DEPLOYMENT.md](DEPLOYMENT.md) - Инструкции по деплою на Netlify
- [API_INTEGRATION.md](API_INTEGRATION.md) - Полная документация по интеграции с API
- [CORS_FIX.md](CORS_FIX.md) - Решение проблемы CORS
- [TEST_RESULTS.md](TEST_RESULTS.md) - Результаты тестирования API

## Структура проекта

```
├── components/
│   ├── UI.tsx              # Переиспользуемые UI компоненты
│   └── ResultsView.tsx     # Отображение результатов анализа
├── services/
│   ├── httpClient.ts       # HTTP клиент
│   └── api.ts              # API методы
├── App.tsx                 # Главный компонент
├── types.ts                # TypeScript типы
└── vite.config.ts          # Конфигурация Vite + proxy
```

## Технологии

- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS
- Lucide React (иконки)
# gen-factor
