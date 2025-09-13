
CREATE TABLE IF NOT EXISTS app_user (
  id                    BIGSERIAL PRIMARY KEY,
  full_name             TEXT NOT NULL CHECK (length(trim(full_name)) >= 3),
  aadhar_number         CHAR(12) NOT NULL CHECK (aadhar_number ~ '^[0-9]{12}$'),
  ll_application_number TEXT NOT NULL,
  phone                 TEXT,                       
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aadhar_number),
  UNIQUE (ll_application_number)
);

CREATE TABLE IF NOT EXISTS token (
  id           BIGSERIAL PRIMARY KEY,
  applicant_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  token_no     text NOT NULL,             
  status       TEXT NOT NULL CHECK (status IN ('ACTIVE','CANCELLED','FINISHED')),
  slot_ts      TIMESTAMPTZ NOT NULL,       
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (applicant_id, slot_ts, status) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE IF NOT EXISTS user_vehicle_class (
  id            BIGSERIAL PRIMARY KEY,
  applicant_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  vehicle_class TEXT   NOT NULL ,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (applicant_id, vehicle_class)
);

CREATE TABLE IF NOT EXISTS disabilities (
  id            BIGSERIAL PRIMARY KEY,
  applicant_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  disability    TEXT   NOT NULL,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (applicant_id, disability)
);
CREATE TABLE IF NOT EXISTS slot_selection (
  id           BIGSERIAL PRIMARY KEY,
  applicant_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  slot_ts      TIMESTAMPTZ NOT NULL,    
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (applicant_id)                  
);

ALTER TABLE token
  ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_token_priority ON token(is_priority, slot_ts, created_at);

CREATE INDEX IF NOT EXISTS idx_slot_selection_slot_ts ON slot_selection(slot_ts);

CREATE INDEX IF NOT EXISTS idx_token_applicant ON token(applicant_id);
CREATE INDEX IF NOT EXISTS idx_token_slot_ts   ON token(slot_ts);
