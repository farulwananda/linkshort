# Linkshort

Linkshort adalah prototype personal shortlink manager dengan konsep workspace seperti Notion dan sentuhan polished SaaS. Project ini dibuat untuk mengelola shortlink pribadi di domain sendiri, dimulai dari login mock, dashboard, manajemen link, tags, analytics, dan pengaturan domain.

Project ini juga menjadi bahan uji coba model AI **GLM 5.2** untuk melihat kemampuan model dalam membangun frontend app modern, menyusun struktur project, memperbaiki bug UI, dan mengembangkan fitur bertahap.

## Status Project

Saat ini Linkshort adalah **frontend-only prototype**. Data belum disimpan ke database/backend, melainkan ke `localStorage` browser.

Yang sudah dikerjakan:

- Scaffold awal memakai TanStack CLI.
- Halaman login mock.
- Protected dashboard dengan session sederhana via `localStorage`.
- Layout workspace ala Notion: sidebar, topbar, page header, dan area konten.
- CRUD shortlink lokal.
- Search, filter, sort, table view, list/card view.
- Archive, restore, activate, deactivate, duplicate, dan delete link.
- Bulk actions untuk beberapa link.
- Import/export data JSON dan CSV.
- Tags page untuk melihat, rename, dan delete tag.
- Analytics page dengan metric cards, top links, top tags, insights, dan click trend mock.
- Settings page untuk domain display dan theme mode.
- Dark mode dengan class-based Tailwind variant.
- Smooth animation memakai Motion.
- Reserved route `/link/$slug` untuk future redirect.
- Fix logout agar session benar-benar terhapus sebelum kembali ke login.
- Fix contrast button di dark mode.
- Fix click trend agar tidak tampil datar semua.

## Tech Stack

- React 19
- TanStack Start
- TanStack Router file-based routing
- Vite
- TypeScript
- Tailwind CSS v4
- Motion untuk animasi
- Lucide React untuk icon
- Vitest untuk test runner
- npm dengan `package-lock.json`

## Struktur Project

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

File penting:

- `src/routes/__root.tsx`: root document shell dan theme no-flash script.
- `src/routes/app.tsx`: app layout dan route guard dashboard.
- `src/hooks/useSession.ts`: mock login/logout state.
- `src/hooks/useLinks.ts`: CRUD shortlink di localStorage.
- `src/lib/storage.ts`: localStorage adapter.
- `src/lib/analytics.ts`: summary, insight, tags, dan click trend mock.
- `src/styles.css`: Tailwind import, Notion-like color tokens, dan dark mode.

## Cara Menjalankan

Install dependencies:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Default dev server:

```text
http://localhost:3000
```

Build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run test:

```bash
npm run test
```

Regenerate TanStack route tree:

```bash
npm run generate-routes
```

## Penyimpanan Data

Karena masih prototype frontend-only, data disimpan di browser:

- `linkshort.session`: status login mock.
- `linkshort.links`: daftar shortlink.
- `linkshort.settings`: domain dan theme setting.
- `linkshort.analyticsSeed`: seed deterministic untuk click trend mock.
- `linkshort.ui`: preferensi UI ringan.

Logout hanya menghapus session. Data links dan settings tetap dipertahankan.

## Catatan Routing

- `/login`: halaman login mock.
- `/app`: dashboard link manager.
- `/app/analytics`: analytics dashboard.
- `/app/tags`: tag management.
- `/app/archive`: archived links.
- `/app/settings`: domain dan theme settings.
- `/link/$slug`: reserved route untuk shortlink redirect di versi berikutnya.

Untuk saat ini `/link/$slug` belum melakukan redirect production. Route ini hanya menampilkan placeholder dan detail link jika slug ditemukan di localStorage.

## Rencana Berikutnya

- Tambahkan backend dan database sungguhan.
- Tambahkan auth single-admin yang lebih aman.
- Jadikan `/link/$slug` benar-benar melakukan redirect.
- Tambahkan real click tracking.
- Tambahkan custom domain deployment flow.
- Tambahkan QR code untuk setiap shortlink.
- Tambahkan validasi import/export yang lebih ketat.
- Tambahkan test komponen dan test flow utama.

## Catatan Eksperimen AI

Project ini dikerjakan sebagai uji coba model AI **GLM 5.2** dalam konteks pengembangan frontend modern. Fokus eksperimen:

- Membuat desain workspace seperti Notion.
- Mengembangkan fitur bertahap berdasarkan feedback.
- Menjaga struktur React/TanStack tetap rapi.
- Memperbaiki bug UI seperti dark mode contrast dan chart trend.
- Mendokumentasikan progress project secara jelas.
