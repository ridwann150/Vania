# Current Status

## Active Phase
- Phase 2: Local/Live-Server Integration & Full Admin Workflow

## Completed
- Phase 1: Brittany Chiang layout (sticky sidebar, scrollable main)
- Dark/Light mode toggle with localStorage persistence
- Mouse-tracking spotlight effect
- Mobile hamburger responsive menu
- Fallback placeholder projects (no API error shown)
- ATS CV PDF generator (html2pdf.js via CDN)
- Login page redesign (clean centered card, no nav header)
- Login credentials: vania / vaniacantik15
- Admin Dashboard — 3-tab CRUD (About, Experience, Projects)
- Admin navbar (Preview Web + Logout → login.html)
- Section headers (ABOUT/EXPERIENCE/PROJECTS — hidden desktop, visible mobile)
- Footer centered on index.html, login.html, project-form.html
- Section spacing (padding: 5rem 0;)
- Local data pipeline: admin saves sync to localStorage (va_about, va_experiences, va_projects)
- index.html dynamically loads About/Experience/Projects from localStorage with API fallback
- Footer text: "© 2026 MHD Ridwan Maulana. All rights reserved."
- **Local-only persistence**: All admin saves now store to localStorage (va_about, va_experiences, va_projects) and display "Data Berhasil Disimpan!" message (auto-clears 3s)
- index.html loads About (sidebar + body), Experience list, and Projects from localStorage first, then syncs with Vercel API if online
- Project manage list shows real data (localStorage first, then API); shows empty state if no data (no dummy fallback)
- Project edit/delete fully functional from localStorage (works offline on Live Server)
- Removed all horizontal border separators (border-top/border-bottom) on .section & .site-footer
- Section headers (h2.section-title): ABOUT/EXPERIENCE/PROJECTS/CONTACT — hidden on desktop, shown on mobile
- Footer centered (`text-align:center; width:100%; margin:3rem auto 1rem;`) on all pages
- **Persistent Admin Navigation**: Floating "⚙️ Back to Dashboard" badge on index.html (pink accent, dark) — shows only when `isLoggedIn==='true'` or `adminToken` exists in localStorage; hidden for public visitors. Clicking opens project-form.html (session preserved via localStorage)
- Admin "Preview Web" button opens index.html normally (localStorage auth persists across tabs)
- **Admin dashboard logic moved to `project-form.js`** (loaded after `script.js` on project-form.html); script.js kept only public + shared helpers (theme, spotlight, hamburger, lightbox, auth, public profile/projects, CV, login, logout)
- **Mobile hero (Brittany Chiang style)**: `.mobile-hero` block (name, title, short bio, `.social-links` Instagram + Email) rendered statically at top of main content on mobile; sidebar-top/sidebar-socials hidden from hamburger sidebar on mobile
- **`.social-links` tap-friendly styling**: `position:relative; z-index:10; pointer-events:auto; display:flex; gap:1.25rem; margin:1.5rem 0 2rem` with 1.6rem icons
- **Admin floating badge**: z-index 9999 + `pointer-events:auto` so it stays clickable above hamburger overlay on mobile
- **Light mode re-themed** (Slate Soft / Cyan): bg `#f8fafc`, primary text `#0f172a`, card/container `#ffffff`, primary accent `#0284c7`, tag secondary accent `#ec4899`
- **No more dummy/fallback data**: `renderFallbackProjects` replaced with `renderEmptyProjects`; admin project list shows empty state instead of dummy projects
- **Full sync DELETE**: Delete button sends HTTP DELETE to `DELETE /api/experiences/:id` and `/api/projects/:id`, removes item from localStorage, clears frontend memory, and re-renders list
- **Backend Experience CRUD**: Added `Experience` model to `prisma/schema.prisma` (type, role_title, organization, period, start_date, end_date, description, technologies, is_current, tags); `prisma db push` applied to Supabase. Added `/api/experiences` GET/POST/PUT/DELETE + UUID guard in `server.js` (normalizes frontend `role`/`org`/`period`/`tags` payload). CRUD verified end-to-end against local dev server.
- **Tap-friendly social links**: Sidebar (`#sidebarSocialLinks`) and mobile hero `.social-links` both use `.social-icon-link` anchors (Instagram + Email). Added `@media (max-width: 768px)` block with `!important` rules (relative, z-index 9999, auto pointer-events, inline-flex, 10px padding, 1.75rem icons, `touch-action: manipulation`). Sidebar `.social-links` margin scoped (`margin:0; width:fit-content`); dead `.sidebar-socials` CSS removed
- **Single source of truth (no cache)**: All public fetches now use `{ cache: "no-store" }` — `/profile`, `/experiences`, `/projects`. On successful API response localStorage is overwritten (stale cleared via `lsRemove`), then `applyProfile`/`renderExperienceList` re-render both desktop sidebar AND mobile hero from the same fresh data. localStorage is only an instant placeholder with offline fallback
- **Anti-cache meta tags**: Added `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />`, `Pragma: no-cache`, `Expires: 0` to the `<head>` of index.html
- **Admin inside mobile hamburger**: On mobile (≤1024px) the floating `.admin-floating-badge` is hidden and an "Admin" link (`#adminNavLink` → project-form.html) appears inside the sidebar drawer (hamburger), shown only for logged-in admins; desktop keeps the floating badge. Resolves the mobile top-right badge/hamburger collision
- **Mobile re-sync on return**: Extracted public projects loading into `loadPublicProjects()`; added a `pageshow` listener that re-runs `loadPublicProfile()` + `loadPublicProjects()` (both `cache:'no-store'`) when the page is restored from bfcache, so admin edits to About/Experience/Projects also reflect on mobile immediately
- **Admin link in hamburger (toggle login/dashboard)**: `#adminNavLink` in the sidebar drawer now always shows on mobile (≤1024px) and switches via `syncAdminBadge()`: "🔒 Admin Login" → `login.html` when logged out, "⚙️ Admin Dashboard" → `project-form.html` when logged in. Floating `.admin-floating-badge` hidden on mobile (≤768px + ≤1024px); desktop keeps the floating badge
- **Profile text sync desktop+mobile**: Mobile hero + sidebar elements share classes `profile-name`/`profile-tagline`/`profile-bio` (+ `data-profile-*` attrs); `applyProfile()` updates all of them via `querySelectorAll` in one pass so Nama, Tagline, dan Short Bio selalu sinkron desktop vs mobile
- **Social links mobile tap fix**: `.mobile-hero .social-links` forced `position:relative; z-index:99; pointer-events:auto` and its anchors `display:inline-flex; padding:12px; font-size:1.8rem; cursor:pointer; pointer-events:auto` (≤768px) so no layer blocks taps
