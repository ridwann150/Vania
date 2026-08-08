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
- Project manage list never shows "Failed to load"; falls back to dummy projects if no stored/API data
- Project edit/delete fully functional from localStorage (works offline on Live Server)
- Removed all horizontal border separators (border-top/border-bottom) on .section & .site-footer
- Section headers (h2.section-title): ABOUT/EXPERIENCE/PROJECTS/CONTACT — hidden on desktop, shown on mobile
- Footer centered (`text-align:center; width:100%; margin:3rem auto 1rem;`) on all pages
- **Persistent Admin Navigation**: Floating "⚙️ Back to Dashboard" badge on index.html (pink accent, dark) — shows only when `isLoggedIn==='true'` or `adminToken` exists in localStorage; hidden for public visitors. Clicking opens project-form.html (session preserved via localStorage)
- Admin "Preview Web" button opens index.html normally (localStorage auth persists across tabs)
