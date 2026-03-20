import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function migrate() {
  await connectPostgres();

  await query(`create schema if not exists identity`);
  await query(`create schema if not exists security`);
  await query(`create schema if not exists audit`);

  await query(`
    create table if not exists identity.users (
      id text primary key,
      username text not null unique,
      password_hash text not null,
      name text not null,
      roles text[] not null default '{}',
      status text not null default 'ACTIVE',
      failed_password_attempts integer not null default 0,
      locked_until timestamptz null,
      last_failed_password_at timestamptz null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists identity.user_mfa_secrets (
      id text primary key,
      user_id text not null references identity.users(id) on delete cascade,
      secret_base32 text not null,
      status text not null,
      created_at timestamptz not null default now(),
      verified_at timestamptz null,
      last_used_at timestamptz null
    )
  `);

  await query(`
    create table if not exists security.sessions (
      id text primary key,
      user_id text not null references identity.users(id) on delete cascade,
      status text not null default 'ACTIVE',
      access_scope text not null,
      device_id text not null,
      mtls_verified boolean not null default false,
      certificate_fingerprint text not null,
      client_ip text not null,
      user_agent text not null,
      issued_at timestamptz not null default now(),
      idle_expires_at timestamptz not null,
      expires_at timestamptz not null,
      revoked_at timestamptz null
    )
  `);

  await query(`
    create table if not exists security.mfa_challenges (
      id text primary key,
      session_id text not null,
      user_id text not null references identity.users(id) on delete cascade,
      challenge_kind text not null,
      status text not null,
      access_scope text not null,
      device_id text not null,
      mtls_verified boolean not null default false,
      certificate_fingerprint text not null,
      client_ip text not null,
      user_agent text not null,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null,
      verified_at timestamptz null
    )
  `);

  await query(`
    create table if not exists audit.auth_events (
      event_id text primary key,
      user_id text null references identity.users(id) on delete set null,
      username_snapshot text null,
      event_type text not null,
      access_scope text not null,
      device_id text not null,
      client_ip text not null,
      certificate_fingerprint text not null,
      success boolean not null,
      reason_code text null,
      created_at timestamptz not null default now()
    )
  `);

  await query(`create index if not exists idx_users_username on identity.users(username)`);
  await query(`create index if not exists idx_mfa_secrets_user_status on identity.user_mfa_secrets(user_id, status)`);
  await query(`create index if not exists idx_sessions_user_status on security.sessions(user_id, status)`);
  await query(`create index if not exists idx_mfa_challenges_session on security.mfa_challenges(session_id, status)`);
  await query(`create index if not exists idx_auth_events_user_created_at on audit.auth_events(user_id, created_at desc)`);

  console.log("Database migration completed.");
}

migrate().catch((error) => {
  console.error("Database migration failed.");
  console.error(error);
  process.exitCode = 1;
});
