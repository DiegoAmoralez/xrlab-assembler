# XRlab Assembler

Внутренний таск-трекер для монтажа печатных плат и сборки прототипов.

## Команды

```bash
npm i          # установить зависимости
npm run dev    # запустить локально → http://localhost:3000
npm run build  # собрать продакшен-билд
npm start      # запустить продакшен-сервер
npm run db:seed # создать исполнителя в базе
```

## Локальная разработка

```bash
npm i
cp .env.example .env.local
# заполните SESSION_SECRET и EXECUTOR_DEFAULT_PASSWORD в .env.local
npm run dev
```

База и исполнители создаются автоматически при первом запросе.

**Исполнители:**
- `max.malukalo@gmail.com`
- `al.vasilyeve@atomgroup.io`

Пароль задаётся в `EXECUTOR_DEFAULT_PASSWORD` (не хранится в коде).

## Деплой на Vercel

SQLite-файл на Vercel не сохраняется, поэтому для продакшена нужна облачная БД **Turso** (бесплатно, тот же SQL).

### 1. Turso

1. Зарегистрируйтесь на [turso.tech](https://turso.tech)
2. Создайте database (например `xrlab-assembler`)
3. Скопируйте **Database URL** и **Auth Token**

### 2. Vercel

1. Импортируйте репозиторий на [vercel.com](https://vercel.com)
2. В **Settings → Environment Variables** добавьте:

| Переменная | Значение |
|------------|----------|
| `SESSION_SECRET` | случайная строка ≥ 32 символов |
| `EXECUTOR_DEFAULT_PASSWORD` | общий пароль исполнителей |
| `TURSO_DATABASE_URL` | `libsql://...` из Turso |
| `TURSO_AUTH_TOKEN` | токен из Turso |

3. Deploy — после первого открытия сайта исполнители создадутся сами.

### 3. Исполнители (автоматически)

При первом запросе к API создаются:

- `max.malukalo@gmail.com`
- `al.vasilyeve@atomgroup.io`

Пароль — значение `EXECUTOR_DEFAULT_PASSWORD` из Vercel.

Ручной seed (если нужно):

```bash
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
export EXECUTOR_DEFAULT_PASSWORD="ваш-пароль"
npm run db:seed
```

Или через Turso CLI: `turso db shell <db-name>` и вставьте SQL вручную.

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Публичная форма заявки |
| `/login` | Вход исполнителя |
| `/dashboard` | Панель задач |
| `/tasks/[id]` | Детали задачи |

## Стек

- Next.js 15 + React 19 + Tailwind CSS 4
- libSQL / Turso (облако) или файл `data/app.db` (локально)
- iron-session
