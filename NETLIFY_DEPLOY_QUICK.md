# Быстрый деплой на Netlify

## Проблема которую решили

❌ **Было:**
```
https://heartfelt-custard-8773f4.netlify.app/api/meta/databases
↓ (Mixed Content Error - HTTPS → HTTP blocked)
❌ FAILED
```

✅ **Стало:**
```
https://heartfelt-custard-8773f4.netlify.app
↓
/.netlify/functions/api (Netlify Function - HTTPS)
↓
http://92.50.154.150:45501/blup/api
✅ SUCCESS
```

## Что было сделано

### 1. Создана Netlify Function
**Файл:** `netlify/functions/api.js`
- Прокси-сервер между фронтендом и API
- Работает на стороне сервера Netlify
- Добавляет Basic Auth автоматически

### 2. Обновлён HTTP клиент
**Файл:** `services/httpClient.ts`
- Development: использует `/api` (Vite proxy)
- Production: использует `/.netlify/functions/api` (Netlify Function)

### 3. Настроен Netlify
**Файл:** `netlify.toml`
- Указан путь к функциям
- Настроены redirects для SPA

### 4. Добавлены типы Vite
**Файл:** `vite-env.d.ts`
- Типы для `import.meta.env.DEV`

## Деплой - 3 простых шага

### Вариант 1: Через Git (лучший способ)

```bash
# 1. Коммит и пуш
git add .
git commit -m "Add Netlify deployment"
git push

# 2. Зайдите на https://app.netlify.com
# 3. New site → Import from Git → Выберите репозиторий
```

### Вариант 2: Через Netlify CLI

```bash
# 1. Установите CLI
npm install -g netlify-cli

# 2. Войдите
netlify login

# 3. Деплой
netlify deploy --prod
```

### Вариант 3: Manual Deploy

```bash
# 1. Соберите проект
npm run build

# 2. Зайдите на https://app.netlify.com
# 3. Перетащите папку dist

# ⚠️ ВАЖНО: После деплоя настройте Functions:
# Site settings → Build & deploy → Functions directory: netlify/functions
```

## Проверка после деплоя

1. Откройте сайт на Netlify
2. Откройте DevTools (F12) → Network
3. Выберите базу данных в приложении
4. Проверьте запросы:
   - ✅ URL: `/.netlify/functions/api?path=%2Fmeta%2Fdatabases%3Fgroup%3Dbmk`
   - ✅ Status: 200
   - ✅ Response: JSON с данными

## Если что-то не работает

### 404 на /.netlify/functions/api
```bash
# Убедитесь что файл существует:
ls netlify/functions/api.js

# Проверьте netlify.toml:
cat netlify.toml | grep functions
```

### Mixed Content ошибки всё ещё есть
```bash
# Проверьте что в production не используется прямой HTTP URL
# Откройте DevTools → Sources → services/httpClient.ts
# Должно быть: /.netlify/functions/api
```

### Функция работает, но возвращает ошибку
```bash
# Проверьте логи в Netlify Dashboard:
# Functions → api → Logs
```

## Файлы для деплоя

Убедитесь что эти файлы есть в репозитории:
- ✅ `netlify/functions/api.js`
- ✅ `netlify.toml`
- ✅ `vite-env.d.ts`
- ✅ `services/httpClient.ts` (обновлённый)

## Готово! 🎉

После деплоя приложение будет:
- ✅ Работать по HTTPS
- ✅ Делать запросы к HTTP API без ошибок
- ✅ Автоматически добавлять Basic Auth
- ✅ Обходить CORS и Mixed Content ограничения
