# AfroHR Hub — In-Progress Task Tracker

**Last updated:** 2026-06-15  
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

### Session 8 — Attendance & Leave ✅ DONE (2026-06-13)
- [x] Attendance dashboard (`/attendance`) — today's sheet per employee, status badges (present/absent/leave/assignment), check-in/out, capture method (GPS 📍 / site supervisor 👷 / manual ✍️) + verified location, late & overtime minutes; KPI cards (present, on-leave, absent, on-assignment, pending exceptions)
- [x] Exception review — pending overtime / unjustified-absence exceptions approved or rejected inline by the direct manager; approved items flow to Payroll Stage 5 as documented adjustments (Policies 4 & 7)
- [x] Monthly attendance summary → Payroll feed — per-employee worked / absent / leave / assignment days, approved overtime (+) and deduction (−) columns, totals row labelled "To Payroll Stage 5"
- [x] Leave types management (`/leave`) — Egyptian Labor Law catalog (annual, casual, sick 75%, maternity 4mo, hajj, unpaid) with entitlement, pay rule and notes
- [x] Leave request + approval flow — request table with manager→HR routing, approve/reject inline, status badges (pending/manager_approved/approved/rejected/cancelled)
- [x] Leave balance tracking — per-employee per-type entitled / used / pending / remaining; annual band (15/21/30) reflected per service length; unused balance noted as flowing to Offboarding final settlement
- [x] New types: `AttendanceRecord`, `AttendanceMonthSummary` (+ `AttendanceMethod` / `AttendanceStatus` / `ExceptionStatus` enums), `LeaveType`, `LeaveBalance`, `LeaveRequest`
- [x] Mock data: `attendance.ts`, `leave.ts`
- [x] Nav items enabled: attendance 📍, leave 🏖
- [x] Full `ar` + `en` catalogs; build/lint/typecheck pass

### Session 9 — Offboarding Module ✅ DONE (2026-06-13)
- [x] Offboarding tracker (`/offboarding`) — open exits with a 6-stage progress bar, last-working-day SLA chip, reason badges, KPI cards (open, in clearance, pending settlement, archived)
- [x] 6-stage workflow (per the manual) — Initiation → Access Deactivation → Handover → Clearance → Legal & Financial Closure → File Closure & Archiving; live stepper derived from case flags + clearance state
- [x] Clearance matrix (`/offboarding/[id]`) — department sign-off (IT / Operations & Admin / Finance / Direct Manager) generated from the manual's table, click-to-clear, blocked-item state (a held advance blocks payout)
- [x] Final settlement — last salary (prorated to LWD) + unused annual-leave encashment (fed from the Leave module) + dues − deductions; Finance approval gate (Policy 13) blocked until clearance is complete
- [x] Access & handover panel — mandatory access-deactivation-by-LWD rule, direct-manager handover approval
- [x] Closure & archiving — exit interview, Social Insurance Form (6), original-document return; Archive action gated on approved settlement + returned originals, sets status → Archived (Policy 14, HR code retained for rehire detection)
- [x] New types: `OffboardingCase`, `ClearanceItem`, `FinalSettlement` (+ `OffboardingReason` / `OffboardingStatus` / `OffboardingStage` / `ClearanceDept` / `ClearanceStatus` enums)
- [x] Mock data: `offboarding.ts` (3 cases — resignation/settlement, contract-end/clearance, project-end/archived); emp-005 annual balance added to Leave as the encashment source
- [x] Nav item enabled: offboarding 📦; full `ar` + `en` catalogs; build/lint/typecheck pass

### Session 10 — ESS Portal & Messaging Channels ✅ DONE (2026-06-14)
- [x] Employee Self-Service PWA (`/ess`) — mobile-first phone-frame, bottom-tab nav, scoped to the persona's linked employee (RLS `employee_id = jwt.employee_id`); blue-collar friendly (big buttons, simple Arabic)
- [x] ESS screens — **Home** (one-tap GPS check-in/out, leave-balance + worked-days tiles, shortcuts), **Attendance** (monthly summary + today's in/out), **Leave** (balances + request form with over-balance guard + my-requests status), **Payslip** (PIN gate per Policy 9, full breakdown basic+allowances−tax−SI−adjustments), **Documents** (checklist with expiry alerts + camera-upload affordance)
- [x] Notification template builder (`/settings/notifications`) — bilingual templates per event × channel, editable body with `{{variable}}` chips + live sample preview, WhatsApp Meta-registration status, critical/active flags, grouped by module
- [x] Channel delivery monitor — per-channel delivery-rate cards (in-app / WhatsApp / SMS / email) with failed counts
- [x] New types: `NotificationTemplate`, `ChannelDeliveryStat` (+ `NotificationChannel` / `TemplateRegistrationStatus` / `NotificationDeliveryStatus` / `NotificationModule` enums)
- [x] Mock data: `notification-templates.ts` (8 templates across 7 modules, channel stats)
- [x] Nav items enabled: ess 📱, notificationTemplates 📨; full `ar` + `en` catalogs; build/lint/typecheck pass
- [ ] **WhatsApp Business API** live wiring (Meta Business account + approved templates) — Phase 2 (scaffolded: templates + registration status modelled)
- [ ] **SMS channel** live wiring (Egyptian provider TBD — contract early) — Phase 2 (scaffolded: SMS templates + fallback modelled)
- [ ] Supabase Phone Auth (OTP via SMS/WhatsApp) for ESS login — Phase 2 (login UI scaffolded in Session 3)

### Session 11 — AI Layer (Claude API) ✅ DONE (2026-06-15)
- [x] AI layer (`lib/ai/`) on **Claude Opus 4.8** (`claude-opus-4-8`) via `@anthropic-ai/sdk`, structured outputs (`output_config.format`) for typed results; key-gated mock fallback so the demo runs without `ANTHROPIC_API_KEY` (real call path is identical, like the Supabase Auth scaffold)
- [x] **Document OCR** (`extractIdFields`) — Claude vision reads a national ID / passport and extracts holder fields, deriving birth date + gender from the 14-digit national number → auto-fills the Core HR record
- [x] **Document classifier** (`classifyDocument`) — auto-tags an uploaded document against the 13-document checklist (vision or extracted text)
- [x] **CV parsing** (`parseCv`) — Arabic/English CV → structured talent-pool profile (title, years, skills, certifications, education)
- [x] **Candidate–job matching** (`matchCandidateToJob`) — explainable match % with strengths + gaps (fills `Candidate.match_pct` for real)
- [x] **Semantic search** (`semanticSearch`) — natural-language ranking across employee records + talent pool, matching on meaning
- [x] AI Studio screen (`/ai`) — 5-tool tabbed playground with live/demo badge, server actions (`actions.ts`) calling the AI layer
- [x] New types: `IdExtraction`, `DocClassification`, `ParsedCv`, `MatchResult`, `SearchHit` (+ `DocClass`)
- [x] `@anthropic-ai/sdk` installed; nav item ✦ AI Studio enabled; full `ar` + `en` catalogs; build/lint/typecheck pass

### Session 12 — Pilot Launch & Hardening ✅ DONE (2026-06-16)
- [x] Data Import Tool (`/import`) — 3-step CSV/Excel wizard: template preview (15 columns), file upload drop zone, dry-run validation (14-row preview with per-row status + field-level errors), commit gate (blocks on errors), success state
- [x] Security Audit Dashboard (`/audit`) — RLS coverage (18 tables, all enabled), 16-policy compliance checklist (14 live / 2 scaffolded), pen-test checklist (19 checks across 5 categories — 17 pass, 2 partial)
- [x] Settings & Deployment (`/settings`) — env-var status (8 vars, Phase 1/2 split, missing-required alert), pilot milestone board (10 milestones with owners + due dates)
- [x] Nav — enabled `settings` ⚙️ + `audit` 🧾; added `import` 📥 to system section
- [x] New types in `types.ts` — Import, Audit (RLS/Policy/PenTest), Deployment (EnvVar/PilotMilestone)
- [x] Mock data — `lib/data/mock/import.ts`, `audit.ts`, `deployment.ts`
- [x] i18n — `import`, `audit`, `settings` namespaces added to `en.json` + `ar.json`; `import` nav item added to both

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

**Session 12 is complete. All 12 MVP sessions are done.**

Session 12 delivered the pilot launch & hardening layer:
- **Data Import Tool** (`/import`) — 3-step wizard (template → validate → commit) for bulk employee upload from Excel/CSV; dry-run mode with per-row and per-field error reporting; duplicate detection; commit gate blocks if any errors remain
- **Security Audit Dashboard** (`/audit`) — tabbed: RLS coverage (18/18 tables enabled), 16-policy compliance (14 live, 2 scaffolded for Phase 2), OWASP pen-test checklist (17 pass, 2 partial)
- **Settings & Deployment** (`/settings`) — env-var status tracker (Phase 1 MVP + Phase 2 WhatsApp/SMS), pilot milestone board (10 milestones for the one-month parallel run alongside Excel)

**Next steps for go-live:**
1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` in Vercel
2. Run `supabase db push` to apply all 10 migrations to the production project
3. Use `/import` to bulk-upload the existing employee roster from Excel
4. Run the July 2026 payroll cycle in parallel with the existing Excel sheet to validate totals

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
| Attendance + Leave | 2026-06-13 | Daily attendance sheet, exception approval → Payroll feed, leave types/balances/requests | Done |
| Offboarding | 2026-06-13 | 6-stage exit workflow, department clearance matrix, final settlement + Finance gate (Policy 13), archiving (Policy 14) | Done |
| ESS + Messaging | 2026-06-14 | Mobile-first ESS PWA (attendance/leave/payslip/docs), notification template builder + delivery monitor (WhatsApp/SMS scaffold) | Done |
| AI Layer | 2026-06-15 | Claude Opus 4.8 — ID OCR, doc classifier, CV parsing, job matching, semantic search (key-gated mock fallback) | Done |
| Pilot Launch | 2026-06-16 | Import wizard, security audit dashboard, settings & deployment | Done |
