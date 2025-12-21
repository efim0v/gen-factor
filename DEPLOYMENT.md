# Deployment на Netlify

## Проблема Mixed Content

При деплое на Netlify возникает проблема **Mixed Content**:
- Netlify хостит сайт по **HTTPS** (например, https://heartfelt-custard-8773f4.netlify.app)
- BLUP API работает по **HTTP** (http://92.50.154.150:45501/blup/api)
- Современные браузеры **блокируют** запросы с HTTPS сайта к HTTP API

## Решение: Netlify Functions

Используем **Netlify Functions** как прокси-сервер между фронтендом и API.

### Схема работы

```
HTTPS Frontend (Netlify)
    ↓
/.netlify/functions/api (Netlify Function - HTTPS)
    ↓
http://92.50.154.150:45501/blup/api (External API - HTTP)
```

Netlify Function работает на сервере, поэтому может делать HTTP запросы без ограничений.

## Файлы конфигурации

### 1. `netlify/functions/api.js`
Серверная функция, которая проксирует запросы к API:
- Принимает запросы от фронтенда
- Добавляет Basic Authentication
- Пересылает запрос к реальному API
- Возвращает результат фронтенду

### 2. `netlify.toml`
Конфигурация Netlify:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. `services/httpClient.ts`
HTTP клиент автоматически определяет окружение:
- **Development** (`npm run dev`): использует Vite proxy `/api`
- **Production** (Netlify): использует Netlify Function `/.netlify/functions/api`

## Деплой на Netlify

### Вариант 1: Через Git (рекомендуется)

1. Запушьте код в GitHub:
```bash
git add .
git commit -m "Add Netlify deployment support"
git push
```

2. Зайдите на https://app.netlify.com
3. Нажмите "Add new site" → "Import an existing project"
4. Выберите ваш GitHub репозиторий
5. Настройки сборки заполнятся автоматически из `netlify.toml`
6. Нажмите "Deploy site"

### Вариант 2: Через Netlify CLI

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Войдите в аккаунт
netlify login

# Инициализируйте проект
netlify init

# Деплой
netlify deploy --prod
```

### Вариант 3: Drag & Drop

1. Соберите проект:
```bash
npm run build
```

2. Зайдите на https://app.netlify.com
3. Перетащите папку `dist` в область "Drop your site folder here"
4. **Важно:** После первого деплоя нужно настроить Functions:
   - В настройках сайта → Build & deploy → Functions
   - Functions directory: `netlify/functions`

## Проверка работы

После деплоя проверьте:

1. Откройте консоль браузера (F12)
2. Перейдите на вкладку Network
3. Выберите базу данных в приложении
4. Проверьте запросы:
   - ✅ Должны идти к `/.netlify/functions/api?path=...`
   - ✅ Не должно быть ошибок CORS
   - ✅ Не должно быть ошибок Mixed Content

## Тестирование локально

Можно протестировать Netlify Functions локально:

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Запустите dev сервер с Functions
netlify dev
```

Это запустит приложение с Netlify Functions на localhost.

## Альтернативное решение (не рекомендуется)

Если по какой-то причине Netlify Functions не подходят, можно:

1. Настроить HTTPS на стороне BLUP API сервера
2. Использовать CORS proxy сервис (не рекомендуется для production)
3. Развернуть приложение на HTTP хостинге (не рекомендуется)

## Мониторинг

После деплоя следите за логами Functions:
1. Netlify Dashboard → Functions
2. Выберите функцию `api`
3. Просмотрите логи вызовов

## Troubleshooting

### Функция не найдена (404)
- Убедитесь, что в `netlify.toml` указано `functions = "netlify/functions"`
- Проверьте, что файл `netlify/functions/api.js` существует
- Пересоберите проект

### Mixed Content ошибки
- Убедитесь, что в production используется `/.netlify/functions/api`
- Проверьте в коде, что `import.meta.env.DEV` работает корректно

### CORS ошибки
- Проверьте заголовки в `netlify/functions/api.js`
- Убедитесь, что `Access-Control-Allow-Origin: *` установлен

## Переменные окружения (опционально)

Для большей безопасности можно вынести credentials в переменные окружения:

1. В Netlify Dashboard → Site settings → Environment variables
2. Добавьте:
   - `API_USERNAME=blup_user`
   - `API_PASSWORD=1AMoVtyg`

3. Обновите `netlify/functions/api.js`:
```javascript
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
```

## Итого

✅ **Решение готово к деплою**
- Mixed Content проблема решена через Netlify Functions
- Работает в dev и production режимах
- Basic Auth сохранён
- Безопасно для production использования
