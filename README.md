# Linkshort

Linkshort is a personal shortlink manager prototype with a Notion-like workspace experience and polished SaaS details. It is designed for managing personal shortlinks on a custom domain, starting with a mock login flow, dashboard, link management, tags, analytics, and domain settings.

This project is also an experiment using the **GLM 5.2 AI model** to evaluate how well the model can help build a modern frontend app, structure a project, fix UI issues, and evolve features through iterative feedback.

## Project Status

Linkshort is currently a **frontend-only prototype**. There is no backend or database yet. Data is persisted in the browser with `localStorage`.

Completed work:

- Initial scaffold with the TanStack CLI.
- Mock login page.
- Protected dashboard with a simple `localStorage` session.
- Notion-like workspace layout with sidebar, topbar, page header, and content area.
- Local shortlink CRUD.
- Search, filter, sort, table view, and list/card view.
- Archive, restore, activate, deactivate, duplicate, and delete link actions.
- Bulk actions for selected links.
- JSON and CSV import/export.
- Tags page for viewing, renaming, and deleting tags.
- Analytics page with metric cards, top links, top tags, insights, and mock click trend.
- Settings page for display domain and theme mode.
- Dark mode using a class-based Tailwind variant.
- Smooth animations with Motion.
- Reserved `/link/$slug` route for a future redirect implementation.
- Logout fix so the session is cleared before returning to login.
- Dark mode button contrast fix.
- Click trend fix so the chart no longer appears completely flat.

## Tech Stack

- React 19
- TanStack Start
- TanStack Router file-based routing
- Vite
- TypeScript
- Tailwind CSS v4
- Motion for animation
- Lucide React for icons
- Vitest as the test runner
- npm with `package-lock.json`

## Project Structure

```text
src/
  components/
    analytics/     Analytics dashboard UI
    layout/        App shell, sidebar, topbar, page header
    links/         Link manager, table, cards, drawer, bulk actions, import modal
    motion/        Shared animation helpers
    tags/          Tags management UI
    ui/            Reusable UI primitives
  hooks/
    useLinks.ts
    useSession.ts
    useSettings.ts
    useKeyboardShortcuts.ts
  lib/
    analytics.ts
    importExport.ts
    seed.ts
    storage.ts
    types.ts
    utils.ts
  routes/
    __root.tsx
    index.tsx
    login.tsx
    app.tsx
    app/
      index.tsx
      analytics.tsx
      archive.tsx
      settings.tsx
      tags.tsx
    link/
      $slug.tsx
```

Important files:

- `src/routes/__root.tsx`: root document shell and no-flash theme script.
- `src/routes/app.tsx`: app layout and dashboard route guard.
- `src/hooks/useSession.ts`: mock login/logout state.
- `src/hooks/useLinks.ts`: shortlink CRUD backed by localStorage.
- `src/lib/storage.ts`: localStorage adapter.
- `src/lib/analytics.ts`: summaries, insights, tags, and mock click trend.
- `src/styles.css`: Tailwind import, Notion-like color tokens, and dark mode.

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Default development URL:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm run test
```

Regenerate the TanStack route tree:

```bash
npm run generate-routes
```

## Data Storage

Because this is still a frontend-only prototype, data is stored in the browser:

- `linkshort.session`: mock login state.
- `linkshort.links`: shortlink list.
- `linkshort.settings`: domain and theme settings.
- `linkshort.analyticsSeed`: deterministic seed for the mock click trend.
- `linkshort.ui`: lightweight UI preferences.

Logging out only clears the session. Links and settings are intentionally preserved.

## Routing Notes

- `/login`: mock login page.
- `/app`: link manager dashboard.
- `/app/analytics`: analytics dashboard.
- `/app/tags`: tag management.
- `/app/archive`: archived links.
- `/app/settings`: domain and theme settings.
- `/link/$slug`: reserved route for a future shortlink redirect.

For now, `/link/$slug` does not perform a production redirect. It only displays a placeholder and link details when a matching slug exists in localStorage.

## Next Steps

- Add a real backend and database.
- Add a safer single-admin authentication flow.
- Make `/link/$slug` perform real redirects.
- Add real click tracking.
- Add a custom-domain deployment flow.
- Add QR codes for shortlinks.
- Improve import/export validation.
- Add component tests and main flow tests.

## AI Experiment Note

This project is being developed as an experiment with the **GLM 5.2 AI model** in a modern frontend development context. The experiment focuses on:

- Creating a Notion-like workspace design.
- Evolving features through iterative feedback.
- Keeping the React/TanStack project structure clean.
- Fixing UI issues such as dark mode contrast and chart trend rendering.
- Documenting project progress clearly.
