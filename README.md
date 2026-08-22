# VOIDX

**A private team workspace with a public landing page for recruitment.**

VOIDX is a dual-mode application: a polished public landing page to attract talent, and a private, authenticated workspace for team collaboration.

---

## Architecture

| Layer | Tech | Status |
|-------|------|--------|
| **Public Landing** | Vanilla HTML/CSS/JS (single file) | ✅ Done |
| **Private App** | React + TypeScript + Vite | 🚧 Planned |
| **API / Auth** | FastAPI (Python) | 🚧 Planned |
| **Database** | PostgreSQL | 🚧 Planned |
| **Realtime** | WebSockets / SSE | 🚧 Planned |
| **Deploy** | Docker + Render/Fly.io | 🚧 Planned |

---

## Public Landing Page (`frontend/index.html`)

A single-file, zero-dependency landing page featuring:

- **Hero section** — animated network background, clear value prop
- **Team showcase** — roles, culture, what we build
- **Join flow** — email capture → invite-only application
- **Private portal entry** — authenticated users click "Enter Workspace" to access the private app
- **Dark-first design system** — CSS custom properties, responsive, accessible

### Design Tokens (CSS Variables)

```css
--vx-bg-primary: #0a0a0c      /* Deep void background */
--vx-accent: #6b9fa8          /* Teal accent — trust, clarity */
--vx-void: #8b7ab8            /* Purple — private/internal */
--vx-member: #6b9fa8          /* Member role color */
--vx-admin: #b88a5b           /* Admin role color */
```

### Quick Start

```bash
# Serve locally
cd frontend
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080`

---

## Private Workspace (Coming Soon)

The private side is a **separate React application** (`/private` or `/app` route) that:

- Requires authentication (magic link / OAuth / email+password)
- Real-time chat, docs, tasks, announcements
- Role-based access: **Admin** / **Member** / **Guest**
- End-to-end encrypted DMs (planned)
- Offline-first with IndexedDB sync

### Planned Stack

```
private/
├── src/
│   ├── app/              # Routes, layout, providers
│   ├── features/
│   │   ├── auth/         # Login, session, roles
│   │   ├── chat/         # Real-time messaging
│   │   ├── docs/         # Collaborative editor
│   │   ├── tasks/        # Kanban / issue tracker
│   │   └── settings/     # User + workspace config
│   ├── shared/           # UI kit, hooks, utils
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Development

### Branching Strategy

```
main          → production (public landing only)
develop       → staging
feature/*     → private app features
hotfix/*      → urgent public fixes
```

### Commits

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

---

## Deployment

| Environment | URL | Branch |
|-------------|-----|--------|
| Production  | `voidx.dev` | `main` |
| Staging     | `staging.voidx.dev` | `develop` |
| Preview     | `pr-XXX.voidx.dev` | PR branches |

**Public landing** → Static hosting (Cloudflare Pages / Netlify / Vercel)  
**Private app** → Docker container on Render / Fly.io / Railway

---

## Security

- Public page: **No secrets, no API keys** — pure static HTML
- Private app: JWT in HttpOnly cookies, CSRF protection, rate limiting
- All private routes require valid session
- CORS locked to known domains
- Content Security Policy headers

---

## Contributing

1. Fork → branch → PR
2. Public changes: edit `frontend/index.html` only
3. Private changes: coming in `private/` directory
4. Run lint/format before push (TBD)

---

## License

MIT — see [LICENSE](LICENSE)

---

**VOIDX** — Built by the team, for the team.