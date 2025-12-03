# Copilot / AI Agent Instructions for Bar Union School Website

This file gives focused, actionable guidance so an AI coding agent can be immediately productive in this repository.

**Big Picture**:
- **Stack**: Node.js + Express server rendering static HTML pages and serving static assets. Entry: `server.js`.
- **Data & Sessions**: Session storage uses SQLite (`connect-sqlite3`) with the DB at `database/sessions.db`. There is also a `sessions/` folder containing JSON session artifacts in the repo — prefer the SQLite store used in `server.js`.
- **Routing**: Route modules live in `routes/` and are mounted in `server.js` (`/auth`, `/portal`, `/api`). Static pages are under `static/` and served directly via `res.sendFile`.

**Where to look first (key files/dirs)**:
- `server.js` — startup, session config, static paths list, page routes, SPA fallback.
- `routes/` — add or update API and page routes here (`auth.js`, `portal.js`, `api.js`).
- `middleware/` — `authMiddleware.js`, `errorHandler.js`, `logger.js` show request lifecycle and error patterns.
- `validators/` — use existing validation patterns when adding form handlers (`authValidator.js`, `portalValidator.js`).
- `static/`, `includes/` — site HTML pages and reusable partials (`header.html`, `footer.html`) are plain HTML files.
- `css/`, `js/`, `assets/` — front-end assets. Note there are parallel `static/` and `user/` subfolders — mirror the repository's current organization.

**Project-specific conventions & patterns**:
- Static pages are plain HTML in `static/` and served by `server.js` with `res.sendFile`. When editing a page, update the file directly.
- Reusable HTML fragments are in `includes/`. Edits to header/footer affect many pages immediately (no template engine used).
- Assets are grouped by type and feature. Use the same `css/<scope>/` and `js/<scope>/` conventions when adding files.
- Validators follow express-validator patterns and live in `validators/`. Reuse existing validator functions and return the same error shape.
- Session handling: the app ensures `database/` exists at runtime — do not remove `database/` or change the session DB name without updating `server.js`.

**Common developer workflows**:
- Run dev server with auto-reload: `npm run dev` (nodemon).
- Run production server: `npm start`.
- Create or update environment variables in a `.env` file (optional). Common vars: `PORT`, `NODE_ENV`, `SESSION_SECRET`.
- No build step is required — this is server-side served static content. Editing assets or HTML files is reflected on the next server restart or immediately in dev with `npm run dev`.

**How to add a route (example)**:
1. Create or update `routes/myRoute.js` and export an Express `Router`.
2. Mount it in `server.js` (follow existing pattern): `app.use('/myroute', myRoute);`.
3. If serving a static HTML page, place it in `static/` and add a route to the `pages` array in `server.js` or add an explicit `app.get`.

**Integration points & external deps**:
- `connect-sqlite3` for sessions (see `server.js` session config). DB file path: `database/sessions.db`.
- `multer` is used for file uploads (search for usages in `routes/` or `admin/`).
- Deployed on Render.com in the past — deploy settings: `npm install` then `npm start`. Keep `PORT` and `SESSION_SECRET` set in the environment.

**Testing & debugging tips (repo-specific)**:
- There are no unit tests present. Use `npm run dev` and manual verification of routes.
- Logs: `middleware/logger.js` is used for request logs. Use the console output or run under `pm2` in production for persistent logs.
- Common runtime problem sources: incorrect `SESSION_SECRET`, missing `database/` folder, or file permission issues on `database/sessions.db`.

**What to avoid changing without careful coordination**:
- The SQLite session configuration block in `server.js` (changing store/db name requires migration and updating running deployments).
- The `staticPaths` array in `server.js`: the app exposes many top-level folders as static; renaming them will break URLs.

**Examples from the codebase**:
- Static pages list in `server.js` (`pages` array) — add entries to this array to expose new top-level pages.
- Static assets mounting: `app.use('/css', express.static(path.join(__dirname, 'css')));` — follow this pattern for new asset folders.

If anything here is unclear or you'd like the agent to also add small helper scripts (e.g., a `make-route` generator or test harness), tell me which you'd prefer and I will iterate.
