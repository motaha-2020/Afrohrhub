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

### Session 4 — Recruitment Module ✅ DONE (2026-06-12)
- [x] Hiring requests listing + KPI cards (`/recruitment`) — request code, project, openings filled/total, approved salary range, priority/SLA, status
- [x] New Hiring Request form (`/recruitment/new`) — all Stage-1 mandatory fields from the manual; Replacement type validates the departing employee's HR code against Core HR (must exist + be offboarding/archived); P0/P1 priority picker; dashboard button wired
- [x] Candidate pipeline board (`/recruitment/pipeline`) — 8-stage Kanban per the manual (Hiring Request → Sourcing & Screening → Requester Review → Interviews → Final Selection → Offer Issuance → Offer Acceptance → Handover), per-stage SLA countdowns (P0/P1 matrix), match %, above-salary-range flag, evaluation stars (Tech/HSE/HR), advance/reject (mandatory reason) actions, filter by request
- [x] Offer generation modal — salary vs approved range warning, proposed start date, auto-included items (template letter, 13-document checklist, training requirements, 30-day acceptance link)
- [x] Public candidate acceptance page (`/offer/[token]`) — tokenized, no sign-in, mobile-first, AR/EN, 30-day countdown, accept (confirm start date) / decline / expired states
- [x] Talent pool (`/recruitment/talent-pool`) — search by name/title/skill, source filter, add-to-pipeline; semantic search marked for Session 11
- [x] Handover-to-Onboarding flow — handover action on stage 8 marks the candidate handed over (Onboarding module consumes this in Session 5)
- [x] Recruitment nav item enabled; full `ar` + `en` catalogs; build/lint/typecheck pass

### Session 5 — Onboarding Module ✅ DONE (2026-06-12)
- [x] Onboarding Tracker (`/onboarding`) — open cases × 9-stage progress bar, joining-date SLA chip, KPI cards (open, ready-to-activate, joining this week, activated), ready/in-progress/activated status
- [x] Onboarding case board (`/onboarding/[id]`) — 9-stage checklist generated from the template, per-task owner-role badges, click-to-complete task tracking; conditional tasks (medical exam / safety courses) only emitted for safety-sensitive / medical-required roles
- [x] Activation portal — the six conditions of `fn_can_activate()` computed live from task state (documents complete · contracts signed · HSE requirements · medical exam · systems ready · certificates valid); Activate button gated until all six met, missing-items list shows the owner of each, Policy 1 enforced (activation = only entry into Payroll)
- [x] Hiring Email card — the 14 mandatory fields auto-rendered from the case (Stage 1 artifact)
- [x] Candidate-to-Active promotion flow — activation sets status Active (mock); demo case `onb-001` is one click from activation, `onb-004` already activated
- [x] Onboarding nav item enabled; full `ar` + `en` catalogs; build/lint/typecheck pass
- [ ] Contract / hiring-email *generation* via Claude API — deferred to Session 11 (AI layer); fields are assembled deterministically for now

### Session 6 — Payroll Module ✅ DONE (2026-06-13)
- [x] Monthly payroll cycle UI — 9-step stepper with mandatory calendar (days 18/19/23/25/28/10), current-stage highlighting, deadline display
- [x] KPI cards — active employees, total gross, total net, next deadline
- [x] Payroll register table — per-employee gross / income-tax / social-insurance / net columns, click row to open payslip side panel
- [x] Egyptian tax engine (`lib/utils/payroll.ts`) — Law 91/2005 marginal brackets (0–25%), EGP 15k personal exemption, SI at 11% capped at EGP 11,800/month
- [x] Payslip breakdown — basic salary + itemised allowances = gross, then income tax + SI + adjustments = deductions, net pay highlighted
- [x] Adjustments & Deductions section — loan installment (emp-002, −1,000) + medical deduction (emp-006, −450), each with doc-path + approval ref
- [x] Stage advancement button — advances cycle to next stage (local state), banner confirmation
- [x] Payroll run history — past cycles with status badges + view links
- [x] Policy 1 enforced — only `active` + `bank_verified` employees in register (emp-004 pending, emp-005 offboarding excluded)
- [x] Added comp-007 (Walid El-Gendy, gross 52,000, NBE •••• 2210, bank_verified)
- [x] Payroll nav item enabled; full `ar` + `en` catalogs; typecheck passes

### Session 7 — Allowances + KPI + Cost Reports ✅ DONE (2026-06-13)
- [x] Monthly Allowance Cycle (`/allowances`) — 6-stage stepper with calendar (10–15/15–17/≤17/20–25/≤10), KPI cards, stage advancement, cycle history
- [x] Allowance cycle detail (`/allowances/[cycleId]`) — entries grouped by project, per-employee site/transport/meal breakdown, validated/draft status, Policy 6 bank-verified gate
- [x] Quarterly KPI Bonus Cycle (`/kpi`) — 6-stage stepper, quarter KPI cards, history
- [x] KPI cycle detail (`/kpi/[cycleId]`) — evaluation scores table, color-coded score (≥90 green / ≥75 blue / ≥60 yellow / red), bonus amounts, evaluated-by, stage advancement
- [x] Project Cost Reports (`/cost-reports`) — payroll + allowances + KPI distributed by project per `employee_project_allocations` (Policy 12), share %, totals row, past reports list
- [x] New types: `AllowanceCycle`, `AllowanceEntry`, `KpiCycle`, `KpiScore`, `ProjectCostLine`, `CostReport`
- [x] Mock data: `allowances.ts`, `kpi.ts`, `cost-reports.ts`
- [x] Nav items enabled: allowances 🏗, kpi 📈, costReports 📋
- [x] Full `ar` + `en` catalogs; build/lint/typecheck pass

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

**Next up → Session 8: Attendance & Leave**

Session 7 is complete. The three financial cycles from Part IV of the manual are now live:
- **Monthly Allowance Cycle** — 6 stages (calendar 10–15/15–17/≤17/20–25/≤10), per-project per-employee breakdown, Policy 6 bank-verified gate
- **Quarterly KPI Bonus Cycle** — 6 stages, PMO evaluations → bonus computation → Finance payment
- **Project Cost Reports** — payroll + allowances + KPI totals distributed by project (Policy 12)

Session 8 builds the Attendance & Leave module:
1. **Attendance** — GPS check-in/out, supervisor manual sheet, monthly summary → Payroll feed
2. **Leave types** (Egyptian Labor Law: annual, sick, Hajj, unpaid, etc.) — leave request + approval flow, balance tracking & carry-over, deduction wired to Payroll

---

## SESSION HISTORY

| Session | Date | Deliverable | Status |
|---|---|---|---|
| Design & Docs | 2026-06-12 | 8 design docs + 9 module specs + interactive demo | Done |
| DB Schema | 2026-06-12 | 10 migrations, 52 tables, RLS, seeds (PostgreSQL 16 verified) | Done |
| Frontend Foundation | 2026-06-12 | App shell, i18n, RBAC, 3 screens, mock data layer (build passes) | Done |
| Engines & Notifications | 2026-06-12 | Approval Engine UI, SLA Dashboard, Notifications Drawer, Supabase Auth scaffold | Done |
| Recruitment | 2026-06-12 | 8-stage pipeline, offers + public acceptance page, talent pool, handover | Done |
| Onboarding | 2026-06-12 | 9-stage tracker, activation gate (6 conditions), hiring email | Done |
| Payroll | 2026-06-13 | 9-stage cycle, Egyptian tax engine, payslip breakdown, Policy 1 gate | Done |
| Allowances + KPI | 2026-06-13 | 6-stage allowance cycle, 6-stage KPI cycle, project cost reports (Policy 12) | Done |
| Attendance + Leave | — | GPS attendance, leave requests & balances | Pending |
| Attendance + Leave | — | GPS attendance, leave requests & balances | Pending |
| Offboarding | — | 6 stages, clearance, final settlement | Pending |
| ESS + Messaging | — | PWA, WhatsApp, SMS | Pending |
| AI Layer | — | OCR, CV parsing, matching, semantic search | Pending |
| Pilot Launch | — | Import, security audit, Vercel deploy | Pending |
