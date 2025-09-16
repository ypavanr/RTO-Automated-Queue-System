CREATE EXTENSION IF NOT EXISTS pgcrypto;  
CREATE TABLE IF NOT EXISTS app_user (
  id                    BIGSERIAL PRIMARY KEY,
  full_name             TEXT NOT NULL CHECK (length(trim(full_name)) >= 3),
  aadhar_number         CHAR(12) NOT NULL CHECK (aadhar_number ~ '^[0-9]{12}$'),
  ll_application_number TEXT NOT NULL,
  phone                 TEXT,
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aadhar_number),
  UNIQUE (ll_application_number)
);

CREATE TABLE IF NOT EXISTS disabilities (
  id            BIGSERIAL PRIMARY KEY,
  applicant_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  disability    TEXT   NOT NULL,          
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (applicant_id, disability)
);

CREATE TABLE IF NOT EXISTS user_vehicle_class (
  id            BIGSERIAL PRIMARY KEY,
  applicant_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  vehicle_class TEXT   NOT NULL,         
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (applicant_id, vehicle_class)
);


CREATE TABLE IF NOT EXISTS slot_selection (
  id           BIGSERIAL PRIMARY KEY,
  applicant_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  slot_ts      TIMESTAMPTZ NOT NULL,       
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),  
  updated_at   TIMESTAMPTZ,
  UNIQUE (applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_slot_selection_slot_ts ON slot_selection(slot_ts);
CREATE INDEX IF NOT EXISTS idx_slot_selection_slot_ts_created ON slot_selection(slot_ts, created_at);

CREATE OR REPLACE FUNCTION trg_enforce_slot_capacity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  cap CONSTANT INT := 5;  
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM slot_selection
  WHERE slot_ts = NEW.slot_ts
    AND (TG_OP = 'INSERT' OR applicant_id <> NEW.applicant_id);

  IF cnt >= cap THEN
    RAISE EXCEPTION 'Slot % is full (capacity %)', NEW.slot_ts, cap USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS slot_selection_capacity_guard ON slot_selection;
CREATE TRIGGER slot_selection_capacity_guard
BEFORE INSERT OR UPDATE OF slot_ts ON slot_selection
FOR EACH ROW EXECUTE FUNCTION trg_enforce_slot_capacity();

CREATE TABLE IF NOT EXISTS token (
  id             BIGSERIAL PRIMARY KEY,
  applicant_id   BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  token_no       TEXT   NOT NULL,                                 
  status         TEXT   NOT NULL CHECK (status IN ('ACTIVE','CANCELLED','FINISHED')),
  slot_ts        TIMESTAMPTZ NOT NULL,                          
  is_priority    BOOLEAN NOT NULL DEFAULT FALSE,                
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  finish_requested_at TIMESTAMPTZ,
  otp_code_hash       TEXT,           
  otp_sent_at         TIMESTAMPTZ,
  otp_expires_at      TIMESTAMPTZ,
  otp_verified_at     TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_token_per_applicant_slot
  ON token(applicant_id, slot_ts)
  WHERE status = 'ACTIVE';

-- Ensure only one ACTIVE token per user globally (any slot)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_token_per_applicant
  ON token(applicant_id)
  WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_tokenno_per_slot
  ON token(slot_ts, token_no);

CREATE INDEX IF NOT EXISTS idx_token_queue
  ON token(is_priority, slot_ts, created_at);

CREATE INDEX IF NOT EXISTS idx_token_applicant ON token(applicant_id);
CREATE INDEX IF NOT EXISTS idx_token_slot_ts   ON token(slot_ts);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'finished_requires_otp'
  ) THEN
    ALTER TABLE token
      ADD CONSTRAINT finished_requires_otp
      CHECK (status <> 'FINISHED' OR otp_verified_at IS NOT NULL);
  END IF;
END$$;

ALTER TABLE token
  ADD COLUMN IF NOT EXISTS slot_local_date DATE
  GENERATED ALWAYS AS ((slot_ts AT TIME ZONE 'Asia/Kolkata')::date) STORED;

ALTER TABLE token
  ADD COLUMN IF NOT EXISTS cutoff_ts TIMESTAMPTZ
  GENERATED ALWAYS AS (
    ( ((slot_ts AT TIME ZONE 'Asia/Kolkata')::date + time '17:00') AT TIME ZONE 'Asia/Kolkata' )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_token_cutoff_active
  ON token(cutoff_ts)
  WHERE status = 'ACTIVE';
