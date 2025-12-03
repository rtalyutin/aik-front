# AIK Frontend Tooling

[![CI](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml)

This project uses Vite with React 18, ESLint, Prettier, and Node's built-in test runner.

## Содержание

- [Available Commands](#available-commands)
- [Deployment](#deployment)
- [Quality Gates](#quality-gates)
- [Karaoke Playlist Data](#karaoke-playlist-data)
- [API сценарии караоке-треков](#api-сценарии-караоке-треков)

## Available Commands

- `npm run dev` – start the Vite development server.
- `npm run build` – build the production bundle with Vite.
- `npm run preview` – preview the production build locally.
- `npm run check:env` – validate that all required `VITE_` variables are present before building.
- `npm run lint` – run ESLint with the React, Hooks, and a11y presets.
- `npm run format` – format the codebase with Prettier (single quotes, semicolons, 80 character width).
- `npm run test` – execute the Node.js test runner (`node --test`).
- `npm run deploy` – build the app and publish the contents of `dist/` to the configured server via `rsync`.

## Deployment

Run `npm run deploy` with the `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_PATH` environment variables set. The script builds the project and uploads the optimized bundle from `dist/` instead of the raw `src/` files. Example:

```bash
DEPLOY_HOST=my.server.local \
DEPLOY_USER=deploy \
DEPLOY_PATH=/var/www/aik-front \
npm run deploy
```

When serving the UI on the same domain as the API (for example, `aik.bar`), configure the Nginx template in `deploy/nginx.conf` to proxy `/api` requests to `https://api.aik.bar`. This keeps the browser on a single origin and removes the need for CORS settings while preserving the SPA `try_files` routing. The Vite dev server mirrors this behavior via a proxy, so `npm run dev` also routes `/api` and `/karaoke/api` calls through the frontend origin instead of making cross-origin requests.

### API endpoints via deployment variables

Frontend API URLs are read **only** from deployment-time environment variables. Configure them in `.env` files or via CI/CD so that the built bundle has the correct addresses baked in:

| Variable | Purpose | Required |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Optional base URL that prefixes all relative endpoints. Trailing slashes are trimmed. Leave empty (recommended) or set to the frontend origin to keep requests same-origin. | No |
| `VITE_AUTH_SIGN_IN_ENDPOINT` | Auth sign-in endpoint. | Yes |
| `VITE_READY_TRACKS_ENDPOINT` | Catalog of ready karaoke tracks. | Yes |
| `VITE_JOB_STATUS_ENDPOINT` | Task status polling endpoint. | Yes |
| `VITE_CREATE_TASK_URL` | Create karaoke task from URL. | Yes |
| `VITE_CREATE_TASK_FILE` | Create karaoke task from file upload. | Yes |

If `VITE_API_BASE_URL` is set to a different host (for example, `https://api.aik.bar`), it is automatically prepended to all relative endpoints above. To avoid CORS and redirects, prefer leaving `VITE_API_BASE_URL` empty so the app generates `/api/...` URLs that your reverse proxy forwards to `https://api.aik.bar`. Missing required variables will stop the app from starting, making misconfigured deploys immediately visible.

Use `npm run check:env` (or run `VITE_…=value npm run build` in CI) to fail fast during the pipeline if any variable is absent or empty. In runtime the application renders a dedicated error screen listing all missing keys instead of crashing with a generic exception.

Keep individual endpoint values relative (for example, `/api/karaoke-tracks`) when relying on the Nginx proxy so that requests are routed through the same origin. Only set full URLs if you intentionally need cross-origin calls.

When configuring cross-origin deployments, `VITE_CREATE_TASK_FILE` **must be a full HTTPS URL** that accepts `POST` requests with file uploads and exposes CORS headers for the frontend domain. If `VITE_API_BASE_URL` is also set, it must be an HTTPS origin and return CORS responses (including `Access-Control-Allow-Origin`) that list the UI host. Example configuration for a UI on `https://ui.aik.bar` and API on `https://api.aik.bar`:

```bash
VITE_API_BASE_URL=https://api.aik.bar
VITE_CREATE_TASK_URL=https://api.aik.bar/api/karaoke-tracks/create-task-from-url
VITE_CREATE_TASK_FILE=https://api.aik.bar/api/karaoke-tracks/create-task-from-file
```

For Nginx/CDN setups, ensure client-side routing falls back to the built index. The `deploy/nginx.conf` template configures `try_files` so that any unknown route resolves to `dist/index.html` while assets continue to be served directly from the `dist` folder.

## Quality Gates

All pull requests should pass the lint, format, and test commands before merging. Run the commands above locally or in CI to ensure compliance with the project's quality standards.

## Чеклист перед релизом AI-караоке

- Переменные `VITE_CREATE_TASK_FILE` и, если используется, `VITE_API_BASE_URL` указывают на **полные HTTPS-адреса** без смешанного контента.
- Эндпоинты создания задач (по ссылке и по файлу) и проверки статуса доступны из сети фронтенда и возвращают успешные ответы (`2xx`).
- CORS настроен для домена UI: на `OPTIONS` и основных запросах возвращаются заголовки `Access-Control-Allow-Origin` с адресом фронтенда, а также методы (`POST`, `OPTIONS`, `GET`) и необходимые заголовки для загрузки файлов.
- `VITE_CREATE_TASK_FILE` направлен на `/api/karaoke-tracks/create-task-from-file`; эндпоинты `/api/basic-tracks/...` не поддерживаются и приведут к ошибкам загрузки.

## Karaoke Playlist Data

The `/karaoke` page now ships with a bundled playlist located at `src/features/karaoke/text.json`. The feature configuration (`src/features/karaoke/config.js`) exposes this array through the `localTracks` field, and the `useKaraokeTracks` hook consumes it via the `staticTracks` option to avoid HTTP calls when the JSON is present. A remote endpoint can still be configured through `VITE_READY_TRACKS_ENDPOINT`, which acts as a fallback if the local data is empty.

## API сценарии караоке-треков

Этот раздел фиксирует последовательность запросов и используемые эндпоинты для пользовательских сценариев создания и мониторинга задач караоке-треков.

### Обзор потоков

- При загрузке интерфейса приложение запрашивает список задач `GET /api/karaoke-tracks/tasks` и каталог треков `GET /api/karaoke-tracks`. Ответы объединяются, чтобы восстановить историю и текущий статус каждой задачи.
- Для контроля прогресса любых активных задач выполняется периодический опрос `GET /api/karaoke-tracks/tasks/{task_id}` с интервалом 5 секунд (до 120 попыток по умолчанию). Поллинг прекращается при получении финального статуса (`complete` или `error`).

### Создание задачи по ссылке

1. Отправьте `POST /api/karaoke-tracks/create-task-from-url` с JSON-телом `{ "url": "https://example.com/media" }`.
2. Клиент ожидает успешный ответ `2xx` с JSON-объектом задачи. Идентификатор ищется по ключам `uuid`, `jobId`, `task_id` и т.д.; источник — по `sourceUrl`, `url`, `mediaUrl`.
3. После получения ID задача добавляется в список, а UI запускает поллинг `GET /api/karaoke-tracks/tasks/{task_id}` до финального состояния.
4. При ошибке (любая HTTP-ошибка или пустой идентификатор) пользователю показывается сообщение «Не удалось создать задачу …», и поллинг не стартует.

### Создание задачи по файлу

1. Отправьте `POST /api/karaoke-tracks/create-task-from-file` с заголовком `Authorization: Bearer <access_token>` и `multipart/form-data`, где поле `file` содержит аудио или видео. Допустимые типы: `audio/*`, `video/*`, максимальный размер — 512 МБ.
2. На успешный ответ `2xx` приложение извлекает ID задачи из JSON так же, как и при создании по ссылке, и начинает поллинг `GET /api/karaoke-tracks/tasks/{task_id}`.
3. Если сервер не поддерживает загрузку файлов или возвращает ошибку, пользователь видит сообщение «Не удалось создать задачу из файла», а задача не добавляется.

### Опрос `/api/karaoke-tracks/tasks/{task_id}`

- Запрос выполняется с заголовком `Accept: application/json`. Ручное обновление использует тот же эндпоинт и временно помечает задачу как «обновляется вручную».
- Клиент ожидает, что ответ содержит актуальный статус (`uploading`, `splitting`, `transcribing`, `complete`, `error` или `unknown`), историю этапов и метки времени. Любая неуспешная попытка завершает текущий поллинг и показывает ошибку в карточке задачи.
- После финального статуса поллинг останавливается, таймеры очищаются.

### Получение каталога `/api/karaoke-tracks`

- Вызывается `GET /api/karaoke-tracks` с заголовком `Accept: application/json` при загрузке приложения и когда необходимо объединить метаданные треков.
- Ответ может быть как массивом (`tasks`, `items`, `tracks`, `results`, `entities`), так и объектом `task`/`track`; клиент извлекает все возможные сущности и объединяет их с текущими задачами.
- Если запрос завершается ошибкой или возвращает пустой ответ, приложение продолжает работу без каталога, сохраняя существующий список задач.

Automated checks run in the **CI** workflow for every push and pull request via GitHub Actions. The pipeline installs dependencies with `npm ci` and executes `npm run lint` followed by `npm run test`. Ensure these commands pass locally before opening a pull request to keep the main branch healthy.
