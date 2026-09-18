CREATE TABLE IF NOT EXISTS classes (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY, class_id integer NOT NULL REFERENCES classes(id), username text UNIQUE NOT NULL,
 name text NOT NULL, password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('teacher','student')),
 active boolean NOT NULL DEFAULT true, avatar text NOT NULL DEFAULT '🐶', reduce_motion boolean NOT NULL DEFAULT false,
 score numeric(12,2) NOT NULL DEFAULT 0 CHECK(score>=0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, hits integer NOT NULL, reset_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS lessons (id text PRIMARY KEY, chapter integer NOT NULL, position integer NOT NULL, title text NOT NULL, published boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS releases (class_id integer NOT NULL REFERENCES classes(id),lesson_id text NOT NULL REFERENCES lessons(id),released boolean NOT NULL DEFAULT false,release_at timestamptz,updated_by uuid REFERENCES users(id),PRIMARY KEY(class_id,lesson_id));
CREATE TABLE IF NOT EXISTS progress (user_id uuid NOT NULL REFERENCES users(id),lesson_id text NOT NULL REFERENCES lessons(id),completed boolean NOT NULL DEFAULT false,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,lesson_id));
CREATE TABLE IF NOT EXISTS drafts (user_id uuid NOT NULL REFERENCES users(id),lesson_id text NOT NULL REFERENCES lessons(id),code text NOT NULL,stdin text NOT NULL DEFAULT '',version integer NOT NULL DEFAULT 1,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,lesson_id));
CREATE TABLE IF NOT EXISTS attempts (id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES users(id),lesson_id text NOT NULL REFERENCES lessons(id),activity_id text NOT NULL,answer jsonb NOT NULL,correct boolean NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS attempts_activity ON attempts(user_id,activity_id);
CREATE TABLE IF NOT EXISTS hints (user_id uuid NOT NULL REFERENCES users(id),activity_id text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,activity_id));
CREATE TABLE IF NOT EXISTS xp_events (id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES users(id),event_key text NOT NULL,amount numeric(12,2) NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,event_key));
CREATE TABLE IF NOT EXISTS submissions (id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES users(id),lesson_id text NOT NULL REFERENCES lessons(id),code text NOT NULL,stdin text NOT NULL,output text NOT NULL,request_id uuid NOT NULL,feedback text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed')),reviewed_by uuid REFERENCES users(id),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,request_id));
CREATE TABLE IF NOT EXISTS audit_events (id uuid PRIMARY KEY,actor_id uuid REFERENCES users(id),action text NOT NULL,target text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
