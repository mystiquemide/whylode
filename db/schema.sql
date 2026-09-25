-- Whylode schema
-- Safe to run twice: all objects use IF NOT EXISTS.
-- questions_asked and lines_reused are computed in queries, not stored.

CREATE TABLE IF NOT EXISTS programs (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  source      TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT programs_name_unique UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS changes (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT        NOT NULL,
  source_file TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clauses (
  id        BIGSERIAL PRIMARY KEY,
  change_id BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  position  INT         NOT NULL,
  text      TEXT        NOT NULL
);

CREATE TABLE IF NOT EXISTS experts (
  id         BIGSERIAL PRIMARY KEY,
  change_id  BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  token      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT experts_token_unique UNIQUE (token)
);

CREATE TABLE IF NOT EXISTS questions (
  id          BIGSERIAL PRIMARY KEY,
  change_id   BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  expert_id   BIGINT      NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  program     TEXT        NOT NULL,
  line_start  INT         NOT NULL,
  line_end    INT         NOT NULL,
  excerpt     TEXT        NOT NULL DEFAULT '',
  question    TEXT        NOT NULL,
  state       TEXT        NOT NULL DEFAULT 'open'
                          CHECK (state IN ('open', 'answered', 'reassigned')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notes (
  id          BIGSERIAL PRIMARY KEY,
  program     TEXT        NOT NULL,
  line_start  INT         NOT NULL,
  line_end    INT         NOT NULL,
  text        TEXT        NOT NULL,
  author      TEXT        NOT NULL DEFAULT '',
  question_id BIGINT      REFERENCES questions(id) ON DELETE SET NULL,
  change_id   BIGINT      REFERENCES changes(id)   ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- one note per question
  CONSTRAINT notes_question_id_unique UNIQUE (question_id)
);

CREATE TABLE IF NOT EXISTS trace_lines (
  id           BIGSERIAL PRIMARY KEY,
  clause_id    BIGINT      NOT NULL REFERENCES clauses(id) ON DELETE CASCADE,
  program      TEXT        NOT NULL,
  line_no      INT         NOT NULL,
  code         TEXT        NOT NULL DEFAULT '',
  confidence   NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  state        TEXT        NOT NULL DEFAULT 'traced'
                           CHECK (state IN ('traced', 'asked', 'answered', 'known', 'conflict')),
  note_id      BIGINT      REFERENCES notes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conflicts (
  id         BIGSERIAL PRIMARY KEY,
  change_id  BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  note_id    BIGINT      REFERENCES notes(id) ON DELETE SET NULL,
  claim      TEXT        NOT NULL,
  code_fact  TEXT        NOT NULL,
  state      TEXT        NOT NULL DEFAULT 'open'
                         CHECK (state IN ('open', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drafts (
  id         BIGSERIAL PRIMARY KEY,
  change_id  BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  diff       TEXT        NOT NULL,
  state      TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (state IN ('pending', 'approved', 'changes_requested')),
  decided_by TEXT,
  decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS draft_reasons (
  id        BIGSERIAL PRIMARY KEY,
  draft_id  BIGINT NOT NULL REFERENCES drafts(id)    ON DELETE CASCADE,
  file      TEXT   NOT NULL,
  line_no   INT    NOT NULL,
  note_id   BIGINT REFERENCES notes(id)    ON DELETE SET NULL,
  clause_id BIGINT REFERENCES clauses(id)  ON DELETE SET NULL
);

-- 'changed' lines are edited by the diff, 'kept' lines were deliberately left alone.
ALTER TABLE draft_reasons ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'changed'
  CHECK (action IN ('changed', 'kept'));

CREATE TABLE IF NOT EXISTS events (
  id        BIGSERIAL PRIMARY KEY,
  change_id BIGINT      NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  kind      TEXT        NOT NULL,
  detail    JSONB       NOT NULL DEFAULT '{}',
  at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
