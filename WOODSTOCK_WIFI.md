# Woodstock & Wifi Media Manager

Internal social-content management tool for **Woodstock & Wifi** (https://www.woodstockwifi.com/),
forked from the open-source [Postiz](https://github.com/gitroomhq/postiz-app) project.

> This fork preserves Postiz's AGPL-3.0 license and all required attribution
> (`LICENSE`, `CCLA.md`, `ICLA.md`, `SECURITY.md`, and the open-source link in the
> in-app FAQ). Only the **visible product branding** has been changed.

---

## Brand reference (from woodstockwifi.com)

| Token           | Value       | Use                                                             |
| --------------- | ----------- | --------------------------------------------------------------- |
| Coral (primary) | `#FF2364`   | buttons, active nav, accents — replaces Postiz purple `#612BD3` |
| Coral (dark)    | `#D81B52`   | hover/active states                                             |
| Coral (light)   | `#FF4D7E`   | hover/selection tints                                           |
| Turquoise       | `#00D2C8`   | secondary accent (logo mark)                                    |
| Near-black      | `#0A0A0A`   | dark background (app default mode)                              |
| Typeface        | Avenir Next | falls back to system sans                                       |

Brand name is always written **Woodstock & Wifi** (ampersand, not "and").
Tone: confident, human, storytelling-first ("Mensen kopen geen producten, ze kopen verhalen.").

---

## Running the frontend only (for branding/UI work)

The frontend is a **Next.js (app-router)** app that serves on **port 4200**. For pure
branding/layout work you do **not** need the backend, Redis, Temporal, or Postgres —
the auth screens, layout shell, theme, and most components render standalone (data-backed
pages will show loading/empty states without the API, which is fine for visual work).

```bash
# from the repo root
pnpm install                       # first time only
pnpm dev:frontend                  # next dev on http://localhost:4200

# or directly
pnpm -C apps/frontend run dev
```

The dev script loads env from the repo-root `.env` (`dotenv -e ../../.env`).
Open http://localhost:4200/auth/login to see the rebranded sign-in screen.

## Running the full stack

Requires:

- **Node 22** (`>=22.12.0 <23.0.0`). Note: Node 24 triggers a pnpm "Unsupported engine"
  warning and is not guaranteed — use `nvm use 22` / `fnm use 22`.
- **pnpm 10.6.1** (`packageManager` pinned).
- **OrbStack/Docker** for Redis + Temporal (+ Temporal Postgres/Elasticsearch):
  ```bash
  pnpm dev:docker          # docker compose -f docker-compose.dev.yaml up -d
  ```
  Brings up Redis `:6379`, Temporal `:7233`, Temporal UI `:8080`, pgAdmin `:8081`,
  RedisInsight `:5540` (and a Postgres `:5432` you can ignore if using Homebrew PG).
- **PostgreSQL 16** — currently Homebrew PG on **port 5434**. Point `DATABASE_URL`
  in `.env` at it, e.g. `postgresql://<user>:<pass>@localhost:5434/postiz-db-local`,
  then `pnpm prisma-db-push`.

```bash
pnpm dev                 # extension + orchestrator + backend + frontend in parallel
pnpm dev-backend         # backend + frontend only
```

Backend serves on `:3000` (`NEXT_PUBLIC_BACKEND_URL`), frontend on `:4200` (`FRONTEND_URL`).

> There is no seeded login — the first email/password you register on `/auth`
> becomes the account (auto-activated when no `RESEND_API_KEY` is set in `.env`).
> Without the backend running, the authenticated pages (`/launches`, `/media`,
> `/analytics`, `/settings`) render blank; use `/auth/login` for frontend-only
> branding review.

## Known dev-environment notes

- **"compiling…" slowness:** Next.js dev compiles routes on first hit, and this repo
  is large. The biggest factor here is that the repo currently lives on an **external
  volume** (`/Volumes/KC_MASTER/...`). Next's filesystem cache (`.next/cache`), pnpm,
  and node module resolution are all I/O-heavy — moving the repo to the **internal SSD**
  (e.g. `~/Code/woodstock-wifi-media-manager`) typically cuts first-compile and HMR
  times dramatically. If you keep it on the external drive, expect multi-minute cold
  compiles.
- The Node 24 engine warning above is harmless for the frontend but install on Node 22
  for the full stack.

---

## Phase 3 — Agency command-center UI (first layer)

Frontend-only changes that reframe the Postiz planner as the "Woodstock & Wifi
Social Content Command Center", without touching auth/backend/routes.

What changed:

- **Sidebar nav relabeled** (routes unchanged) in `components/layout/top.menu.tsx`:
  Calendar/Launches → **Command**, Agent → **AI Ideas**, Analytics → **Performance**,
  Media → **Assets**, Integrations → **Connections** (Plugs / Settings kept). The top-bar
  page title follows the nav label automatically.
- **Hidden from nav** (routes still reachable directly), each marked `hide: true`:
  Billing, Affiliate, and the commercial UGC / AgentMedia item.
- **`/launches` command-center header** — new
  `components/launches/command.center.header.tsx`, rendered above the calendar filters.
  Compact and operational (no marketing hero): a W&W eyebrow + "Social Content Command
  Center" title and 4 live status widgets computed from data already in
  `CalendarWeekProvider` (no new backend calls) — Active accounts (enabled/total),
  Scheduled (QUEUE posts in view), Drafts (DRAFT posts), Needs attention (channels needing
  reconnect + errored posts, highlighted coral). The quick action reuses the existing
  `<NewPost />` button.
- **Agency language**: launches sidebar "Channels" → **Accounts**; customer selector
  "Customers" / "Select Customer" → **Clients** / "Select client". New i18n keys were added
  to `libraries/react-shared-libraries/src/translation/locales/en/translation.json`; the
  functional `customer` field and the original keys are untouched (new keys used so
  nothing global is renamed).
- Colors use the existing W&W tokens (coral `#FF2364`, turquoise `#00D2C8`) and the app's
  Tailwind class patterns.

Intentionally NOT changed yet:

- Calendar, drag/drop, post editor, integrations, filters, and list/month/week/day views
  are untouched and fully functional.
- Internal page _bodies_ beyond the header (the calendar grid itself, and the /media,
  /analytics, /settings page contents) are still stock Postiz components — only
  nav/title/theme/header were reframed.
- No routes renamed; auth, backend, Prisma, Temporal, Docker untouched.

## Phase 3.2 — Bespoke agency language on core pages

Copy/label-only reframe (no layout, logic, data-fetching, uploads, or routes changed) so the
core pages read as a Woodstock & Wifi agency tool. Most edits are English-locale **value**
changes in `libraries/react-shared-libraries/src/translation/locales/en/translation.json`
(page-specific keys, low blast radius); a few are inline `t()` defaults where the key
isn't in the locale.

What changed:

- **/media → Assets**: empty state "You don't have any media yet" → "No assets yet";
  "Search by file name" → "Search assets by name"; "No media matches your search" →
  "No assets match your search"; "Select or upload pictures…" → "Select or upload assets…";
  modal/button titles Media Library / Editor / Settings, Insert Media, "Add selected media"
  → Asset Library / Editor / Settings, Insert Asset, "Add selected assets". Upload and
  selection logic untouched.
- **/analytics → Performance**: empty state "Can't show analytics yet" → "No performance
  data yet"; "You have to add Social Media channels" → "Connect social accounts to start
  tracking performance"; CTA "Go to the calendar to add channels" → "Go to Command to
  connect accounts"; sidebar "Channels" heading → "Accounts". Analytics data fetching
  untouched.
- **/launches → Command**: left-panel empty state "No channels yet" → "No accounts yet"
  (the Phase 3 command-center header is unchanged).

Intentionally NOT changed:

- No keys renamed — only English display **values** of page-specific keys plus a few inline
  defaults. Generic keys (`media`, `channels`, `next`, `cancel`, `select`, `upload`, …) left
  intact.
- Calendar, post editor, uploads, media selection, and analytics fetching all unchanged.
- Settings sweep found no new Postiz / commercial-SaaS copy beyond the already-deferred
  public-api MCP/CLI prose.
- No backend / auth / Prisma / Temporal / Docker / deployment changes.

## Phase 4 — Client workspaces (agency layer)

First functional agency layer for managing multiple client companies inside one W&W
workspace. This uses Postiz's existing `Customer` relation instead of renaming core
identifiers.

What changed:

- The W&W logo slot in the left sidebar is now a **client workspace switcher**. It opens a
  dropdown with "All clients", existing clients, and "Add client".
- New clients can be created with a **name** and optional **logo URL/upload**. Logos are
  stored on `Customer.picture`; if no logo is set, the switcher shows initials.
- Selecting a client navigates to `/launches?customer=<id>`, so the command calendar and
  posts use the existing customer-aware filters.
- The accounts sidebar on `/launches` is scoped to the selected client, so each client feels
  like a clean workspace with its own connected accounts.
- "Add Channel" carries the selected client through OAuth/custom-field/Web3/browser-extension
  flows and assigns the resulting integration to that client.
- Backend customer assignment now checks that the customer belongs to the current org before
  connecting an integration.
- New i18n strings were added for en/nl/de/es/fr/it/pt.

Runtime note:

- The Prisma schema adds `Customer.picture String?`. After pulling this phase into a running
  environment, run `pnpm prisma-generate` and `pnpm prisma-db-push` against the intended
  database before starting the backend, otherwise customer list queries can fail on the
  missing column.
- Local logo/media uploads use `UPLOAD_DIRECTORY` when configured. In local development,
  missing `UPLOAD_DIRECTORY` falls back to a repo-level `.uploads` directory, which is ignored
  by Git and served through the existing `/uploads/...` route.

Intentionally NOT changed yet:

- Media library and analytics are not fully client-isolated yet. The first isolation layer is
  Command/schedule/accounts; Assets and Performance should be scoped in a follow-up pass.
- Client logo upload supports safe raster image types (PNG/JPG/WebP/GIF/AVIF/BMP/TIFF).
  SVG upload is intentionally blocked by the shared upload validator until sanitizing is
  added.

## Branding follow-ups (intentionally deferred)

These are **left as-is** because they point at real, still-Postiz external artifacts or
backend-coupled values — changing only the visible label would create a mismatch. Revisit
when/if Woodstock & Wifi publishes its own equivalents:

- **Favicon** (`apps/frontend/public/favicon.ico`) — still the Postiz icon; needs a real
  `.ico` export of the W&W mark (binary asset, not generatable from source here).
- **Browser-extension prose** (`add.provider.component.tsx`) + Chrome Web Store URL +
  `postiz://` deep link — tied to the published Postiz extension.
- **Onboarding tutorial video** (`onboarding.modal.tsx`) — still embeds the upstream Postiz
  tutorial video; replace with a short W&W walkthrough when available.
- **Public API / MCP / CLI** (`public.component.tsx`) — the MCP server key `postiz`, the
  `npm i -g postiz` CLI, and the `gitroomhq/postiz-agent` skill are real package names.
- **TikTok default hashtag** `#Postiz` (`tiktok.provider.tsx`) — must match the backend's
  injected default; change in lockstep with the backend.
- **Analytics domains** (`(app)/layout.tsx`: `postiz.com`/`gitroom.com` for DataFast &
  Plausible) and `dubAnalytics.tsx` `postiz.pro` — repoint when W&W analytics exist.
- **OAuth display name** is env-driven: set `NEXT_PUBLIC_POSTIZ_OAUTH_DISPLAY_NAME`
  (keep the env var _key_ name — it is read by auth code).
- **Support link** `NEXT_PUBLIC_DISCORD_SUPPORT` — repoint to a W&W channel via env.

Functional identifiers that must **never** be renamed: `@gitroom/*` / `@postiz/*` import
paths, package names (`postiz-frontend`, root `gitroom`), `agent="postiz"`, `POSTIZ_*`
env var keys, and i18n key ids (only the English default strings were rebranded).
