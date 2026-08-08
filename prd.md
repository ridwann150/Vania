# Product Requirement Document (PRD)
## Dynamic Portfolio & Auto-ATS Resume Builder

### 1. Project Overview
A modern, responsive, dynamic personal portfolio website inspired by Brittany Chiang's layout design, integrated with an Admin Management System (CMS) via Supabase, and an automatic ATS Resume PDF Generator.

### 2. Core Features & Capabilities

#### A. Public View (Frontend)
- **Layout Inspiration:** Brittany Chiang design (Sticky left sidebar with navigation/bio/socials, scrollable right column for content).
- **Interactive Effects:** Mouse-tracking spotlight effect, smooth scrolling, active link indicator on scroll.
- **Theme Toggle:** Dark Mode / Light Mode switcher with local storage persistence.
- **Dynamic Content:** Fetches profile, experiences, education, and projects directly from Supabase.
- **ATS CV Download Button:** One-click button to automatically generate and download an ATS-compliant PDF resume from the latest database records.

#### B. Admin Dashboard (`/admin`)
- **Authentication:** Protected routes using Supabase Auth (Email/Password).
- **Profile Management:** Edit name, title, short bio, social links, and contact info.
- **Experience & Education Manager (CRUD):** Add, update, delete, and reorder work experience, organizational roles, or education history.
- **Project Manager (CRUD):** Add, update, delete projects with title, description, tech stack tags, and external links.
- **Auto-Sync:** Real-time updates reflected immediately on the public portfolio.

#### C. Auto-Generate ATS Resume
- Standard ATS single-column clean layout using `@react-pdf/renderer` or `jspdf/html2pdf.js`.
- Clean typography (Helvetica/Arial), properly categorized sections, no decorative elements on PDF output to ensure high ATS parsing rate.

### 3. Tech Stack
- **Framework:** Next.js (App Router) or HTML/React + Tailwind CSS.
- **Backend / Database:** Supabase (Auth, Postgres Database, Storage).
- **Icons:** Lucide React / FontAwesome.
- **PDF Generation:** `@react-pdf/renderer` or `jspdf` / `html2pdf.js`.

### 4. Database Schema (Supabase)
- `profile`: `id`, `full_name`, `title`, `bio`, `about_me`, `contact_email`, `social_links` (JSON)
- `experiences`: `id`, `type` (work/education), `role_title`, `organization`, `start_date`, `end_date`, `description`, `is_current`
- `projects`: `id`, `title`, `description`, `technologies` (Array/JSON), `github_url`, `live_url`, `featured`