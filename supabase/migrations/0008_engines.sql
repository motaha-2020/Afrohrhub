-- ============================================================================
-- 0008 — Cross-cutting engines: Approvals, SLA, Notifications
-- Implements docs/02-data-model.md §8, docs/04-sla-engine.md,
-- docs/05-approval-engine.md, docs/modules/09-notifications.md
-- ============================================================================

CREATE TYPE approver_type           AS ENUM ('role', 'specific_user', 'manager_chain', 'dynamic');
CREATE TYPE approval_step_mode      AS ENUM ('sequential', 'parallel_all', 'parallel_any');
CREATE TYPE approval_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE approval_decision       AS ENUM ('approve', 'reject', 'return_for_edit');
CREATE TYPE sla_target_unit         AS ENUM ('working_hours', 'working_days', 'calendar_days', 'fixed_date', 'on_joining_date');
CREATE TYPE sla_state               AS ENUM ('green', 'yellow', 'red');
CREATE TYPE notification_channel    AS ENUM ('in_app', 'email', 'whatsapp', 'sms');
CREATE TYPE notification_status     AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- ----------------------------------------------------------------------------
-- Approval engine (docs/05) — one configurable engine for every approval in
-- the manual: hiring requests, offers, activation, payroll adjustments
-- (Policy 7), payouts (Policy 13), settlements, leave, delay justifications
-- (Policy 15).
-- ----------------------------------------------------------------------------
CREATE TABLE approval_workflows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  entity_type  text NOT NULL,   -- hiring_request / job_offer / payroll_adjustment / final_settlement / leave_request / ...
  name         text NOT NULL,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz
);
COMMENT ON TABLE approval_workflows IS
  'Workflow definition per entity type + tenant (docs/05).';
CREATE INDEX idx_approval_workflows_tenant ON approval_workflows (tenant_id, entity_type);

CREATE TABLE approval_steps (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  workflow_id    uuid NOT NULL REFERENCES approval_workflows(id),
  step_order     integer NOT NULL,
  approver_type  approver_type NOT NULL,
  approver_role  text,            -- when approver_type = 'role'
  approver_user  uuid,            -- when approver_type = 'specific_user'
  mode           approval_step_mode NOT NULL DEFAULT 'sequential',
  condition      jsonb,           -- conditional activation, e.g. {"salary_gt": 50000} → extra Company Admin step
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid,
  archived_at    timestamptz,
  UNIQUE (workflow_id, step_order)
);
COMMENT ON TABLE approval_steps IS
  'Ordered workflow steps (docs/05): role / specific_user / manager_chain / dynamic; sequential / parallel_all / parallel_any; conditional via jsonb.';

CREATE TABLE approval_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  workflow_id       uuid REFERENCES approval_workflows(id),
  entity_type       text NOT NULL,
  entity_id         uuid NOT NULL,
  current_step      integer NOT NULL DEFAULT 1,
  status            approval_request_status NOT NULL DEFAULT 'pending',
  requested_by      uuid,
  payload_snapshot  jsonb NOT NULL DEFAULT '{}'::jsonb, -- frozen content being approved
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz
);
COMMENT ON TABLE approval_requests IS
  'Runtime approval instance (docs/05). Entity is frozen (pending_approval) while this is pending; payload_snapshot is immutable.';
CREATE INDEX idx_approval_requests_entity ON approval_requests (tenant_id, entity_type, entity_id);
CREATE INDEX idx_approval_requests_status ON approval_requests (tenant_id, status);

CREATE TABLE approval_actions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  request_id  uuid NOT NULL REFERENCES approval_requests(id),
  step_order  integer NOT NULL,
  actor_id    uuid NOT NULL,
  decision    approval_decision NOT NULL,
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  archived_at timestamptz
);
COMMENT ON TABLE approval_actions IS
  'Decision log — who approved/rejected, when, with which comment (docs/05; Policies 4 + 16: no verbal approvals).';
CREATE INDEX idx_approval_actions_request ON approval_actions (tenant_id, request_id);

-- Retro-wire approval_request_id FKs declared as plain uuid in 0003–0007
-- (approval_requests did not exist yet at that point).
ALTER TABLE employee_events     ADD CONSTRAINT fk_employee_events_approval
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE hiring_requests     ADD CONSTRAINT fk_hiring_requests_approval
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE payroll_adjustments ADD CONSTRAINT fk_payroll_adjustments_approval
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE advances_loans      ADD CONSTRAINT fk_advances_loans_approval
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE leave_requests      ADD CONSTRAINT fk_leave_requests_approval
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);

-- ----------------------------------------------------------------------------
-- SLA engine (docs/04) — definitions seeded with the manual's literal numbers
-- (0010), timers opened by stage/status transitions, refreshed by a 15-min
-- pg_cron job on the hosted project (see note in 0001).
-- ----------------------------------------------------------------------------
CREATE TABLE sla_definitions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              uuid NOT NULL REFERENCES tenants(id),
  module                 text NOT NULL,   -- recruitment / onboarding / offboarding / payroll / allowance / kpi
  stage_key              text NOT NULL,
  priority               priority_level,  -- NULL for fixed-date financial calendars (Part IV)
  target_value           numeric(6, 2),   -- hours/days, or day-of-month for fixed_date; NULL for on_joining_date
  target_unit            sla_target_unit NOT NULL,
  warning_threshold_pct  smallint NOT NULL DEFAULT 75, -- ranged SLAs: min of range = yellow, max = red
  escalate_to_role       text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  created_by             uuid,
  archived_at            timestamptz
);
COMMENT ON TABLE sla_definitions IS
  'SLA targets per (module, stage, priority) — seeded with the manual''s literal numbers (docs/04), editable per tenant. For ranged targets the range max is the target and warning_threshold_pct encodes the range min.';
-- one definition per (tenant, module, stage, priority); priority NULL is the
-- fixed-date financial calendar variant (two partial indexes because an
-- enum::text cast is not IMMUTABLE and NULLs never collide in plain UNIQUE)
CREATE UNIQUE INDEX uq_sla_definitions_priority
  ON sla_definitions (tenant_id, module, stage_key, priority)
  WHERE priority IS NOT NULL;
CREATE UNIQUE INDEX uq_sla_definitions_no_priority
  ON sla_definitions (tenant_id, module, stage_key)
  WHERE priority IS NULL;

CREATE TABLE sla_timers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  entity_type    text NOT NULL,
  entity_id      uuid NOT NULL,
  definition_id  uuid NOT NULL REFERENCES sla_definitions(id),
  started_at     timestamptz NOT NULL DEFAULT now(),
  due_at         timestamptz,     -- computed in working time (fn_add_working_time + holidays)
  stopped_at     timestamptz,
  state          sla_state NOT NULL DEFAULT 'green',
  escalated_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid,
  archived_at    timestamptz
);
COMMENT ON TABLE sla_timers IS
  'Live SLA counters (docs/04): green within time, yellow past warning threshold (notify owner), red past due (escalate to escalate_to_role).';
CREATE INDEX idx_sla_timers_open ON sla_timers (tenant_id, state) WHERE stopped_at IS NULL;
CREATE INDEX idx_sla_timers_entity ON sla_timers (tenant_id, entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- Notifications (module 09) — bilingual multi-channel templates, send log,
-- proactive scheduled alerts (60/30/7 days before document/contract/
-- certificate expiry).
-- ----------------------------------------------------------------------------
CREATE TABLE notification_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  event_key    text NOT NULL,    -- e.g. offer_sent, document_expiring, sla_escalation, payroll_paid
  channel      notification_channel NOT NULL,
  locale       text NOT NULL DEFAULT 'ar',
  subject      text,
  body         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, event_key, channel, locale)
);
COMMENT ON TABLE notification_templates IS
  'Bilingual multi-channel notification templates (module 09).';

CREATE TABLE notifications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  recipient_user_id  uuid REFERENCES users(id),
  channel            notification_channel NOT NULL,
  template_id        uuid REFERENCES notification_templates(id),
  payload            jsonb NOT NULL DEFAULT '{}'::jsonb,
  status             notification_status NOT NULL DEFAULT 'queued',
  attempts           smallint NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  archived_at        timestamptz
);
COMMENT ON TABLE notifications IS
  'Notification send log with delivery status & retry attempts (module 09).';
CREATE INDEX idx_notifications_recipient ON notifications (tenant_id, recipient_user_id, status);

CREATE TABLE scheduled_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  entity_type  text NOT NULL,    -- employee_document / hse_record / contract / ...
  entity_id    uuid NOT NULL,
  alert_key    text NOT NULL,    -- expiry_60 / expiry_30 / expiry_7 / ...
  due_on       date NOT NULL,
  sent_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, entity_type, entity_id, alert_key)
);
COMMENT ON TABLE scheduled_alerts IS
  'Proactive alerts queue — 60/30/7 days before expiry of documents/contracts/certificates (module 01 + 09).';
CREATE INDEX idx_scheduled_alerts_due ON scheduled_alerts (tenant_id, due_on) WHERE sent_at IS NULL;

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['approval_workflows','approval_steps','approval_requests','approval_actions',
                           'sla_definitions','sla_timers','notification_templates','notifications',
                           'scheduled_alerts'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
