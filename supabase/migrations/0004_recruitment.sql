-- ============================================================================
-- 0004 — Recruitment (Part I of the manual)
-- Implements docs/02-data-model.md §3 and docs/modules/02-recruitment.md
-- Stages: 1 Hiring Request → 2 Sourcing & Screening → 3 Requester Review →
-- 4 Assessment & Interviews → 5 Final Selection → 6 Job Offer →
-- 7 Offer Acceptance (30 calendar days) → 8 Handover to Personnel.
-- ============================================================================

CREATE TYPE priority_level        AS ENUM ('P0', 'P1');
CREATE TYPE hiring_type           AS ENUM ('new', 'replacement');
CREATE TYPE hiring_request_status AS ENUM
  ('draft', 'pending_approval', 'approved', 'sourcing', 'screening',
   'interviewing', 'offer', 'fulfilled', 'closed', 'cancelled');
CREATE TYPE application_stage     AS ENUM
  ('screening', 'requester_review', 'assessment', 'final_selection',
   'offer', 'hired', 'rejected');
CREATE TYPE interview_type        AS ENUM ('technical', 'hse', 'hr');
CREATE TYPE interview_status      AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE recommendation_type   AS ENUM ('pass', 'fail', 'hold');
CREATE TYPE offer_status          AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- ----------------------------------------------------------------------------
-- hiring_requests — Stage 1, all mandatory fields from the manual
-- ----------------------------------------------------------------------------
CREATE TABLE hiring_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                uuid NOT NULL REFERENCES tenants(id),
  position_title           text,                          -- free text, or:
  job_title_id             uuid REFERENCES job_titles(id),
  vacancies_count          integer NOT NULL DEFAULT 1 CHECK (vacancies_count > 0),
  project_id               uuid NOT NULL REFERENCES projects(id),  -- project code is mandatory in the manual
  direct_manager_id        uuid REFERENCES employees(id),
  location_id              uuid REFERENCES work_locations(id),
  salary_range_min         numeric(12, 2),                -- visible to limited roles only
  salary_range_max         numeric(12, 2),
  required_qualifications  text,
  priority                 priority_level NOT NULL DEFAULT 'P1',
  hiring_type              hiring_type NOT NULL DEFAULT 'new',
  replaced_employee_id     uuid REFERENCES employees(id), -- mandatory when replacement (validated below)
  status                   hiring_request_status NOT NULL DEFAULT 'draft',
  approval_request_id      uuid,                          -- FK -> approval_requests added in 0008
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  created_by               uuid,
  archived_at              timestamptz,
  CHECK (hiring_type <> 'replacement' OR replaced_employee_id IS NOT NULL),
  CHECK (position_title IS NOT NULL OR job_title_id IS NOT NULL)
);

COMMENT ON TABLE hiring_requests IS
  'Recruitment Stage 1 (docs/02 §3). Replacement requests must reference the replaced employee (HR code & name auto-verified from Core HR).';
CREATE INDEX idx_hiring_requests_tenant_status ON hiring_requests (tenant_id, status);
CREATE INDEX idx_hiring_requests_project ON hiring_requests (tenant_id, project_id);

-- ----------------------------------------------------------------------------
-- candidates — the Talent Pool
-- ----------------------------------------------------------------------------
CREATE TABLE candidates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  name_ar          text NOT NULL,
  name_en          text,
  national_id      text,
  mobile           text,
  email            text,
  cv_path          text,
  parsed_profile   jsonb,            -- CV Parser output: experience, skills, certificates
  -- NOTE: `embedding vector(1536)` (pgvector, HNSW index) for semantic search
  -- (docs/02 §3) is added in a later migration once pgvector is enabled.
  expected_salary  numeric(12, 2),
  availability     text,             -- e.g. immediate / notice period
  source           text,             -- advertisement / database / referral
  blacklisted      boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid,
  archived_at      timestamptz
);

COMMENT ON TABLE candidates IS
  'Talent Pool (docs/02 §3). pgvector embedding column deferred — see comment in table definition.';
CREATE INDEX idx_candidates_tenant ON candidates (tenant_id);
CREATE INDEX idx_candidates_national_id ON candidates (tenant_id, national_id);

-- ----------------------------------------------------------------------------
-- candidate_applications — candidate × hiring request (Stages 2–5)
-- ----------------------------------------------------------------------------
CREATE TABLE candidate_applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  candidate_id       uuid NOT NULL REFERENCES candidates(id),
  hiring_request_id  uuid NOT NULL REFERENCES hiring_requests(id),
  stage              application_stage NOT NULL DEFAULT 'screening',
  screening_notes    text,            -- phone screening result + salary expectation + readiness
  requester_decision text,            -- shortlist / reject per candidate (Stage 3)
  rejection_reason   text,
  match_score        numeric(5, 2),   -- AI match %
  rank               integer,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  archived_at        timestamptz,
  UNIQUE (tenant_id, candidate_id, hiring_request_id)
);

COMMENT ON TABLE candidate_applications IS
  'Candidate × hiring request pipeline (docs/02 §3) — stage drives SLA timers per recruitment stage.';
CREATE INDEX idx_applications_tenant_request ON candidate_applications (tenant_id, hiring_request_id, stage);

-- ----------------------------------------------------------------------------
-- interviews + interview_evaluations — Stage 4 (technical / HSE / HR)
-- ----------------------------------------------------------------------------
CREATE TABLE interviews (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  application_id     uuid NOT NULL REFERENCES candidate_applications(id),
  type               interview_type NOT NULL,
  scheduled_at       timestamptz,
  interviewer_id     uuid REFERENCES employees(id),
  status             interview_status NOT NULL DEFAULT 'scheduled',
  calendar_event_id  text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  archived_at        timestamptz
);

COMMENT ON TABLE interviews IS
  'Recruitment Stage 4 interviews: technical / hse / hr (docs/02 §3).';
CREATE INDEX idx_interviews_tenant_application ON interviews (tenant_id, application_id);

CREATE TABLE interview_evaluations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  interview_id    uuid NOT NULL REFERENCES interviews(id),
  scores          jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. HR: communication, culture fit, readiness, financial expectations (Stage 4)
  recommendation  recommendation_type,
  comments        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  archived_at     timestamptz
);

COMMENT ON TABLE interview_evaluations IS
  'Numeric evaluation form per interview type (docs/02 §3, manual Stage 4).';
CREATE INDEX idx_interview_evals_tenant ON interview_evaluations (tenant_id, interview_id);

-- ----------------------------------------------------------------------------
-- job_offers — Stages 6–7; expires_at = sent_at + 30 calendar days
-- ----------------------------------------------------------------------------
CREATE TABLE job_offers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               uuid NOT NULL REFERENCES tenants(id),
  application_id          uuid NOT NULL REFERENCES candidate_applications(id),
  offer_letter_path       text,                 -- generated from template
  net_salary              numeric(12, 2),
  allowances              jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_requirements   text,
  training_requirements   text,
  sent_at                 timestamptz,
  acceptance_token        text UNIQUE,          -- electronic accept/reject link
  expires_at              timestamptz,          -- sent_at + 30 calendar days (Stage 7)
  status                  offer_status NOT NULL DEFAULT 'draft',
  confirmed_joining_date  date,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  created_by              uuid,
  archived_at             timestamptz
);

COMMENT ON TABLE job_offers IS
  'Job offers, Stages 6–7 (docs/02 §3). expires_at = sent_at + 30 calendar days; acceptance creates an onboarding case.';
CREATE INDEX idx_job_offers_tenant_status ON job_offers (tenant_id, status);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['hiring_requests','candidates','candidate_applications',
                           'interviews','interview_evaluations','job_offers'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
