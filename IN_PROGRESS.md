# AfroHR Hub — In-Progress Task Tracker

**Last updated:** 2026-06-12  
**Project:** Multi-Tenant HR SaaS for construction & engineering companies (Egypt)  
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Claude API · Vercel

---

## COMPLETED

### Phase 0 — Design & Documentation
- [x] Vision & positioning document (`docs/00-vision-and-positioning.md`)
- [x] Architecture document — tech stack, multi-tenancy, scaling to 5,000 employees, AI layer, i18n/RTL (`docs/01-architecture.md`)
- [x] Full data model — ERD + schema definitions for all MVP modules (`docs/02-data-model.md`)
- [x] RBAC permissions matrix — 13 roles + field-level access policy (`docs/03-rbac-permissions.md`)
- [x] SLA engine spec — P0/P1 definitions, working hours, coloring, auto-escalation (`docs/04-sla-engine.md`)
- [x] Approval engine spec — configurable chains (sequential / parallel / conditional) (`docs/05-approval-engine.md`)
- [x] Screens map — all screens + navigation per role (`docs/06-screens-map.md`)
- [x] Implementation roadmap — 12 sessions, dependencies, open risks (`docs/07-roadmap.md`)
- [x] 9 MVP module specs under `docs/modules/` (Core HR, Recruitment, Onboarding, Offboarding, Payroll/Allowances/KPI, Attendance, Leave, ESS, Notifications)

### Phase 0 — Interactive Demo
- [x] Single-file HTML demo — 13 screens, Arabic RTL (`demo/afrohrhub-demo.html`)
- [x] English LTR version of the same demo
- [x] "View as" RBAC role switcher — 8 personas, scope banner, Policy 9 compensation gate

### Session 1 — Database Schema (verified on PostgreSQL 16)
- [x] `0001_extensions_and_helpers.sql` — pgcrypto, uuid-ossp, helper functions
- [x] `0002_core_tenancy.sql` — tenants, tenant_users, org structure tables
- [x] `0003_core_hr.sql` — employees, documents, employee_timeline, status engine
- [x] `0004_recruitment.sql` — jobs, candidates, pipeline (8 stages), talent pool, offers
- [x] `0005_onboarding_offboarding.sql` — onboarding tasks (9 stages), clearance, offboarding (6 stages)
- [x] `0006_payroll.sql` — payroll cycles, payslips, deductions, advances, tax/insurance tables
- [x] `0007_attendance_leave.sql` — attendance records, leave types (Egyptian law), leave balances, requests
- [x] `0008_engines.sql` — SLA definitions (53 entries from manual), approval chains, notification queue
- [x] `0009_rls.sql` — Row Level Security on every table (tenant_id from JWT), field-level policies
- [x] `0010_seed.sql` — 12 document types, SLA seeds, demo employees, Egyptian leave types
- [x] Egyptian compliance: national ID validator trigger, audit triggers, append-only event log
- [x] Hard policy triggers: no payroll for non-active (Policy 1), bank verification gate (Policy 6), adjustment approval (Policies 4 & 7), activation gate `fn_can_activate()` (6 conditions)

### Session 2 — Frontend Foundation (Next.js 15 App)
- [x] Next.js 15 App Router scaffold — TypeScript, Tailwind CSS, ESLint, PostCSS
- [x] Bilingual i18n — Arabic RTL (default) / English LTR via `next-intl`, full message catalogs, locale routing
- [x] Locale switcher in topbar
- [x] RBAC foundation — 13-role TypeScript type, role-driven sidebar nav config (`lib/rbac/`)
- [x] Mock session with dev-only "View as" persona switcher — 8 personas (`lib/auth/personas.ts`)
- [x] Typed data layer — TypeScript types matching SQL schema, repository interfaces, mock implementations (`lib/data/`)
- [x] App shell — `Sidebar.tsx`, `Topbar.tsx`, `LocaleSwitcher.tsx`, `ViewAsSwitcher.tsx`
- [x] **Dashboard screen** — KPI cards, pending approvals widget, headcount-by-project chart
- [x] **Employee Directory screen** — filters, sortable table, status badges (`app/[locale]/(app)/employees/`)
- [x] **Employee Profile 360 screen** — tabbed layout with:
  - [x] Documents tab (checklist, expiry alerts) — `DocumentsTab.tsx`
  - [x] Timeline tab (event log) — `TimelineTab.tsx`
  - [x] Compensation tab (role-gated, Policy 9 denied state with audit toast) — `CompensationTab.tsx`
  - [x] Projects / Allocations tab — `ProjectsTab.tsx`
  - [x] HSE tab (certifications, safety records) — `HseTab.tsx`
- [x] Build verified clean: `npm run build`, `lint`, `tsc --noEmit` all pass

---

## REMAINING

### Session 3 — Engines & Notifications UI ✅ DONE (2026-06-12)
- [x] Approval Engine UI — inbox with tabs (Pending/Completed/Delegated), approve/reject modal with comment, SLA countdown per item
- [x] SLA Engine UI — `SlaCountdown` badge (P0/P1, color-coded by hours remaining), SLA Dashboard with KPI cards + sortable table
- [x] Notifications center — In-App bell drawer, real unread count, mark-all-read, click-to-navigate
- [ ] Email notification templates (Supabase Edge Functions) — Phase 2
- [x] Supabase Auth scaffold — `lib/supabase/client.ts` + `server.ts`, login page (email + OTP UI), Supabase packages installed
- [ ] Wire real Supabase Auth (replace mock session) — needs `.env.local` with Supabase project URL + anon key

### Session 4 — Recruitment Module
- [ ] Jobs listing & creation
- [ ] Candidate pipeline (8 stages: Sourcing → Screening → Interview 1 → Interview 2 → Offer → Background Check → Accepted → Handover)
- [ ] Talent pool management
- [ ] Offer letter generation & candidate acceptance page
- [ ] Handover-to-Onboarding flow

### Session 5 — Onboarding Module
- [ ] 9-stage onboarding task board (per the manual)
- [ ] Task assignment & completion tracking
- [ ] Activation portal (6 manual conditions check + `fn_can_activate()`)
- [ ] Hiring email & contract generation (Claude API)
- [ ] Candidate-to-Active-Employee promotion flow

### Session 6 — Payroll Module
- [ ] Monthly payroll cycle UI (9 steps per the manual calendar)
- [ ] Payslip builder — base salary, allowances, deductions, advances
- [ ] Egyptian tax brackets & social insurance calculation (configurable tables)
- [ ] Finance approval step
- [ ] Payroll run history & audit trail

### Session 7 — Allowances + KPI + Cost Reports
- [ ] Allowance definitions & monthly allocation cycle
- [ ] KPI targets, scoring & cycle management
- [ ] Project cost report — allowances & salaries distributed by project
- [ ] Integration with Payroll cycle

### Session 8 — Attendance & Leave
- [ ] Attendance module — GPS check-in/out + supervisor manual sheet
- [ ] Monthly attendance summary → Payroll feed
- [ ] Leave types management (Egyptian law: annual, sick, Hajj, unpaid, etc.)
- [ ] Leave request + approval flow
- [ ] Leave balance tracking & carry-over rules
- [ ] Leave-days deduction wired to Payroll

### Session 9 — Offboarding Module
- [ ] 6-stage offboarding workflow (per the manual)
- [ ] Clearance checklist per department
- [ ] Final settlement calculation (leave balance encashment + deductions)
- [ ] Document archiving & employee status → Archived

### Session 10 — ESS Portal & Messaging Channels
- [ ] Employee Self-Service PWA (mobile-first, Blue Collar optimized)
- [ ] ESS screens: attendance log, payslip viewer, leave request, document download
- [ ] WhatsApp Business API integration (Meta Business account + approved templates)
- [ ] SMS channel (Egyptian provider TBD — to be contracted early)
- [ ] Notification template builder

### Session 11 — AI Layer (Claude API)
- [ ] Document OCR — upload national ID / passport → auto-fill fields
- [ ] CV parsing — upload CV → structured candidate profile
- [ ] Document classifier (auto-tag document type on upload)
- [ ] Candidate–Job matching score
- [ ] Semantic search across employee records & documents

### Session 12 — Pilot Launch & Hardening
- [ ] Excel import / data migration tooling (bulk employee upload from existing sheets)
- [ ] SLA Dashboard — full view with drill-down per module
- [ ] Security audit — RLS verification per role & tenant, penetration-test checklist
- [ ] Performance optimization — query plans, edge caching, pagination tuning
- [ ] Vercel production deployment + environment config
- [ ] Parallel pilot run: real company data for one month alongside Excel

---

## OPEN RISKS (to resolve before the relevant session)

| # | Risk | Resolve Before |
|---|---|---|
| 1 | **SLA screening P1 SLA:** confirm "5 working days" officially | Session 3 |
| 2 | **WhatsApp Business API:** start Meta Business verification early (long approval cycle) | Session 10 |
| 3 | **Payroll tax & insurance tables:** updated annually by law — build as configurable DB tables, review with company accountant | Session 6 |
| 4 | **Egyptian SMS provider:** select & contract a local provider | Session 10 |
| 5 | **Payroll calendar:** confirm whether cycle dates (18/19/23/25/28/10) are global or per-tenant | Session 6 |

---

## CURRENT FOCUS

**Next up → Session 4: Recruitment Module**

Session 3 is complete. The approval/SLA UI and notification drawer are live. The Supabase Auth scaffold is in place — needs `.env.local` with a real Supabase project to activate.

Session 4 builds the Recruitment pipeline (8 stages) on top of the engines built in Session 3. Each pipeline stage transition will use the Approval Engine and SLA countdown components already built.

---

## SESSION HISTORY

| Session | Date | Deliverable | Status |
|---|---|---|---|
| Design & Docs | 2026-06-12 | 8 design docs + 9 module specs + interactive demo | Done |
| DB Schema | 2026-06-12 | 10 migrations, 52 tables, RLS, seeds (PostgreSQL 16 verified) | Done |
| Frontend Foundation | 2026-06-12 | App shell, i18n, RBAC, 3 screens, mock data layer (build passes) | Done |
| Engines & Notifications | 2026-06-12 | Approval Engine UI, SLA Dashboard, Notifications Drawer, Supabase Auth scaffold | Done |
| Recruitment | — | 8-stage pipeline, offers, talent pool | Pending |
| Onboarding | — | 9 stages, activation, contracts | Pending |
| Payroll | — | Monthly cycle, payslips, tax/insurance | Pending |
| Allowances + KPI | — | Allowance cycles, KPI scoring, cost reports | Pending |
| Attendance + Leave | — | GPS attendance, leave requests & balances | Pending |
| Offboarding | — | 6 stages, clearance, final settlement | Pending |
| ESS + Messaging | — | PWA, WhatsApp, SMS | Pending |
| AI Layer | — | OCR, CV parsing, matching, semantic search | Pending |
| Pilot Launch | — | Import, security audit, Vercel deploy | Pending |
