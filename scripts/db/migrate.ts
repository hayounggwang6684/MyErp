import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function migrate() {
  await connectPostgres();

  await query(`create schema if not exists identity`);
  await query(`create schema if not exists security`);
  await query(`create schema if not exists audit`);
  await query(`create schema if not exists master`);
  await query(`create schema if not exists files`);

  await query(`
    create table if not exists identity.employees (
      id text primary key,
      employee_no text not null unique,
      name text not null,
      department text not null default '운영부',
      job_title text not null default '미지정',
      contact text not null default '',
      work_status text not null default '근무 중',
      assigned_work_count integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists identity.users (
      id text primary key,
      employee_id text null references identity.employees(id) on delete set null,
      username text not null unique,
      password_hash text not null,
      name text not null,
      department text not null default '운영부',
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
    alter table identity.users
    add column if not exists department text not null default '운영부'
  `);

  await query(`
    alter table identity.users
    add column if not exists employee_id text null references identity.employees(id) on delete set null
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

  await query(`
    create table if not exists master.customers (
      id text primary key,
      customer_no text not null unique,
      customer_name text not null,
      customer_type text not null default 'SHIP_OWNER',
      status text not null default 'ACTIVE',
      business_registration_no text null,
      representative_name text null,
      company_phone text not null default '',
      company_email text not null default '',
      business_category text not null default '',
      business_item text not null default '',
      opening_date date null,
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.customer_contacts (
      id text primary key,
      customer_id text not null references master.customers(id) on delete cascade,
      contact_name text not null,
      contact_role text not null default 'STAFF',
      department_name text not null default '',
      job_title text not null default '',
      mobile_phone text not null default '',
      office_phone text not null default '',
      email text not null default '',
      is_primary boolean not null default false,
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.customer_addresses (
      id text primary key,
      customer_id text not null references master.customers(id) on delete cascade,
      address_type text not null default 'BUSINESS',
      postal_code text not null default '',
      address_line_1 text not null default '',
      address_line_2 text not null default '',
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.customer_assets (
      id text primary key,
      customer_id text not null references master.customers(id) on delete cascade,
      asset_name text not null,
      asset_type text not null,
      asset_code text not null default '',
      status text not null default 'ACTIVE',
      registration_no text not null default '',
      imo_no text not null default '',
      location_description text not null default '',
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.engine_models (
      id text primary key,
      manufacturer text not null,
      model_name text not null,
      engine_type text not null default '',
      fuel_type text not null default '',
      power_rating text not null default '',
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.gearbox_models (
      id text primary key,
      manufacturer text not null,
      model_name text not null,
      gear_type text not null default '',
      gear_ratio text not null default '',
      torque_rating text not null default '',
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.customer_equipments (
      id text primary key,
      asset_id text not null references master.customer_assets(id) on delete cascade,
      customer_id text not null references master.customers(id) on delete cascade,
      equipment_name text not null,
      equipment_type text not null,
      status text not null default 'ACTIVE',
      serial_no text not null default '',
      installation_position text not null default '',
      engine_model_id text null references master.engine_models(id) on delete set null,
      gearbox_model_id text null references master.gearbox_models(id) on delete set null,
      manufacturer text not null default '',
      model_name text not null default '',
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists files.file_objects (
      id text primary key,
      domain text not null,
      entity_type text not null,
      entity_id text null,
      original_name text not null,
      stored_path text not null,
      mime_type text not null,
      size_bytes bigint not null default 0,
      sha256 text not null default '',
      latest_version integer not null default 1,
      scan_status text not null default 'PENDING',
      retention_class text not null default 'STANDARD',
      metadata_json jsonb not null default '{}'::jsonb,
      uploaded_by text null references identity.users(id) on delete set null,
      uploaded_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists files.file_versions (
      id text primary key,
      file_id text not null references files.file_objects(id) on delete cascade,
      version integer not null,
      original_name text not null,
      mime_type text not null,
      size_bytes bigint not null default 0,
      sha256 text not null default '',
      stored_path text not null,
      content_text text not null default '',
      uploaded_by text null references identity.users(id) on delete set null,
      uploaded_at timestamptz not null default now(),
      unique (file_id, version)
    )
  `);

  await query(`
    create table if not exists files.file_links (
      id text primary key,
      file_id text not null references files.file_objects(id) on delete cascade,
      domain text not null,
      entity_type text not null,
      entity_id text not null,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists master.customer_registration_extractions (
      id text primary key,
      customer_id text not null references master.customers(id) on delete cascade,
      file_id text null references files.file_objects(id) on delete set null,
      status text not null default 'READY',
      extractor_name text not null default 'mock-business-license-ocr',
      extracted_registration_no text not null default '',
      extracted_company_name text not null default '',
      extracted_representative_name text not null default '',
      extracted_address text not null default '',
      extracted_business_category text not null default '',
      extracted_business_item text not null default '',
      extracted_opening_date text not null default '',
      confirmed_snapshot jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`create index if not exists idx_users_username on identity.users(username)`);
  await query(`create index if not exists idx_users_employee_id on identity.users(employee_id)`);
  await query(`create index if not exists idx_employees_employee_no on identity.employees(employee_no)`);
  await query(`create index if not exists idx_mfa_secrets_user_status on identity.user_mfa_secrets(user_id, status)`);
  await query(`create index if not exists idx_sessions_user_status on security.sessions(user_id, status)`);
  await query(`create index if not exists idx_mfa_challenges_session on security.mfa_challenges(session_id, status)`);
  await query(`create index if not exists idx_auth_events_user_created_at on audit.auth_events(user_id, created_at desc)`);
  await query(`create index if not exists idx_customers_customer_name on master.customers(customer_name)`);
  await query(`create index if not exists idx_customers_registration_no on master.customers(business_registration_no)`);
  await query(`create index if not exists idx_customer_contacts_customer on master.customer_contacts(customer_id, is_primary desc, created_at desc)`);
  await query(`create index if not exists idx_customer_addresses_customer on master.customer_addresses(customer_id, address_type)`);
  await query(`create index if not exists idx_customer_assets_customer on master.customer_assets(customer_id, asset_type, created_at desc)`);
  await query(`create index if not exists idx_customer_equipments_asset on master.customer_equipments(asset_id, equipment_type, created_at desc)`);
  await query(`create index if not exists idx_customer_equipments_serial on master.customer_equipments(serial_no)`);
  await query(`create index if not exists idx_file_links_entity on files.file_links(entity_type, entity_id, created_at desc)`);
  await query(`create index if not exists idx_customer_registration_extractions_customer on master.customer_registration_extractions(customer_id, created_at desc)`);

  console.log("Database migration completed.");
}

migrate().catch((error) => {
  console.error("Database migration failed.");
  console.error(error);
  process.exitCode = 1;
});
