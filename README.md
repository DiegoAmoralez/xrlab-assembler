# XRlab Assembler

Внутренний таск-трекер для монтажа печатных плат и сборки прототипов.

## Команды

```bash
npm i          # установить зависимости
npm run dev    # запустить локально → http://localhost:3000
npm run build  # собрать продакшен-билд
npm run db:seed # создать исполнителей в Supabase
```

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Откройте **SQL Editor** и выполните `supabase/schema.sql`
3. В **Settings → API** скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (только сервер, не публикуйте!)

## Локальная разработка

```bash
npm i
cp .env.example .env.local
# заполните все переменные в .env.local
npm run db:seed
npm run dev
```

**Исполнители:**
- `max.malukalo@gmail.com`
- `al.vasilyeve@atomgroup.io`

Пароль — `EXECUTOR_DEFAULT_PASSWORD`

## Деплой на Vercel

1. Импортируйте [репозиторий](https://github.com/DiegoAmoralez/xrlab-assembler)
2. **Settings → Environment Variables:**

| Переменная | Значение |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL из Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `SESSION_SECRET` | строка ≥ 32 символов |
| `EXECUTOR_DEFAULT_PASSWORD` | пароль исполнителей |

3. Deploy — исполнители создадутся при первом входе

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Публичная форма заявки |
| `/login` | Вход исполнителя |
| `/dashboard` | Панель задач |
