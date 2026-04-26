import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function migrate() {
  await connectPostgres();

  await query(`create schema if not exists identity`);
  await query(`create schema if not exists security`);
  await query(`create schema if not exists audit`);
  await query(`create schema if not exists master`);
  await query(`create schema if not exists files`);
  await query(`create schema if not exists sales`);
  await query(`create schema if not exists project`);
  await query(`create schema if not exists asset`);
  await query(`create extension if not exists pg_trgm`);

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
    create table if not exists identity.user_preferences (
      user_id text primary key references identity.users(id) on delete cascade,
      default_dashboard_tab text not null default 'orders',
      dashboard_density text not null default 'COMFORTABLE',
      show_remembered_username boolean not null default true,
      test_access_scope text not null default 'AUTO',
      updated_at timestamptz not null default now()
    )
  `);

  await query(`alter table identity.user_preferences add column if not exists default_dashboard_tab text not null default 'orders'`);
  await query(`alter table identity.user_preferences add column if not exists dashboard_density text not null default 'COMFORTABLE'`);
  await query(`alter table identity.user_preferences add column if not exists show_remembered_username boolean not null default true`);
  await query(`alter table identity.user_preferences add column if not exists test_access_scope text not null default 'AUTO'`);
  await query(`alter table identity.user_preferences add column if not exists asset_physical_column_widths jsonb not null default '{}'::jsonb`);

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
      tax_category text not null default '',
      bank_account text not null default '',
      invoice_email text not null default '',
      opening_date date null,
      notes text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`alter table master.customers add column if not exists tax_category text not null default ''`);
  await query(`alter table master.customers add column if not exists bank_account text not null default ''`);
  await query(`alter table master.customers add column if not exists invoice_email text not null default ''`);

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
      vessel_type text not null default '',
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

  await query(`alter table master.customer_assets add column if not exists vessel_type text not null default ''`);

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
    create table if not exists master.equipment_master_options (
      id text primary key,
      option_type text not null,
      option_value text not null,
      status text not null default 'ACTIVE',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null,
      unique(option_type, option_value)
    )
  `);

  await query(`
    create table if not exists master.master_data_requests (
      id text primary key,
      field text not null,
      action text not null,
      value text not null default '',
      next_value text not null default '',
      reason text not null default '',
      requester_user_id text null references identity.users(id) on delete set null,
      status text not null default 'PENDING',
      created_at timestamptz not null default now(),
      approved_at timestamptz null,
      approved_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    insert into master.equipment_master_options (id, option_type, option_value)
    values
      ('equipment-type-generator-engine', 'equipment_type', 'GENERATOR_ENGINE'),
      ('equipment-type-main-engine', 'equipment_type', 'MAIN_ENGINE'),
      ('equipment-type-reduction-gear', 'equipment_type', 'REDUCTION_GEAR'),
      ('equipment-type-hpp-engine', 'equipment_type', 'HPP_ENGINE'),
      ('equipment-unit-no-1', 'equipment_unit', 'No.1'),
      ('equipment-unit-no-2', 'equipment_unit', 'No.2'),
      ('equipment-unit-no-3', 'equipment_unit', 'No.3'),
      ('equipment-unit-port-ko', 'equipment_unit', '좌현'),
      ('equipment-unit-stbd-ko', 'equipment_unit', '우현'),
      ('equipment-unit-port', 'equipment_unit', 'Port'),
      ('equipment-unit-stbd', 'equipment_unit', 'Stbd'),
      ('equipment-unit-emcy', 'equipment_unit', 'EMCY'),
      ('equipment-manufacturer-yanmar', 'manufacturer', 'YANMAR'),
      ('equipment-manufacturer-man', 'manufacturer', 'MAN'),
      ('equipment-manufacturer-wartsila', 'manufacturer', 'Wartsila'),
      ('equipment-manufacturer-daihatsu', 'manufacturer', 'Daihatsu'),
      ('equipment-manufacturer-hyundai-himsen', 'manufacturer', 'Hyundai Himsen'),
      ('equipment-manufacturer-caterpillar', 'manufacturer', 'Caterpillar'),
      ('equipment-manufacturer-mitsubishi', 'manufacturer', 'Mitsubishi'),
      ('equipment-manufacturer-cummins', 'manufacturer', 'Cummins'),
      ('equipment-manufacturer-volvo-penta', 'manufacturer', 'Volvo Penta'),
      ('equipment-manufacturer-doosan', 'manufacturer', 'Doosan')
    on conflict (option_type, option_value) do nothing
  `);

  await query(`
    delete from master.equipment_master_options
    where option_type = 'equipment_type'
      and option_value in ('ENGINE', 'GEARBOX', 'OTHER')
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

  await query(`
    create table if not exists sales.orders (
      id text primary key,
      request_date date not null default current_date,
      customer_id text null references master.customers(id) on delete set null,
      customer_name text not null default '',
      ship_owner text not null default '',
      manager text not null default '',
      buyer_type text not null default '국내',
      asset_id text null references master.customer_assets(id) on delete set null,
      vessel_name text not null default '',
      equipment_id text null references master.customer_equipments(id) on delete set null,
      equipment_name text not null default '',
      request_channel text not null default '이메일',
      request_type text not null default '공사',
      urgent boolean not null default false,
      description text not null default '',
      order_summary text null,
      notes text null,
      parts_quote boolean not null default false,
      repair_quote boolean not null default false,
      no_estimate boolean not null default false,
      confirmed boolean not null default false,
      confirmation_date date null,
      confirmation_basis text not null default '발주서',
      business_type text not null default '공사',
      status text not null default '견적',
      management_number text not null default '확정 후 발급',
      documents_json jsonb not null default '[]'::jsonb,
      merge_history_json jsonb not null default '[]'::jsonb,
      merged_order_records_json jsonb not null default '[]'::jsonb,
      merged_into_order_id text null references sales.orders(id) on delete set null,
      merged_at timestamptz null,
      merged_by text null references identity.users(id) on delete set null,
      deleted_at timestamptz null,
      deleted_by text null references identity.users(id) on delete set null,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`alter table sales.orders add column if not exists deleted_at timestamptz null`);
  await query(`alter table sales.orders add column if not exists deleted_by text null references identity.users(id) on delete set null`);
  await query(`alter table sales.orders add column if not exists order_summary text null`);
  await query(`alter table sales.orders add column if not exists notes text null`);

  await query(`
    create table if not exists project.projects (
      id text primary key,
      source_order_id text null unique references sales.orders(id) on delete set null,
      estimate_no text not null default '',
      management_no text not null default '',
      project_name text not null default '',
      customer_name text not null default '',
      vessel_name text not null default '',
      equipment_name text not null default '',
      status text not null default '견적 상태',
      manager text not null default '',
      quote_status text not null default '견적 작성',
      quote_date date null,
      quote_amount numeric(14, 2) not null default 0,
      quote_manager text not null default '',
      quote_document_id text not null default '',
      quote_document_name text not null default '',
      parts_quote boolean not null default false,
      repair_quote boolean not null default false,
      quote_note text not null default '',
      order_confirmed boolean not null default false,
      planned_start date null,
      planned_end date null,
      folder_created boolean not null default false,
      folder_created_at date null,
      folder_path text not null default '',
      checklist_json jsonb not null default '[]'::jsonb,
      progress_logs_json jsonb not null default '[]'::jsonb,
      reports_json jsonb not null default '[]'::jsonb,
      external_requests_json jsonb not null default '[]'::jsonb,
      completion_json jsonb not null default '{}'::jsonb,
      order_archived boolean not null default false,
      archived_reason text not null default '',
      merged_into_order_id text not null default '',
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists asset.physical_assets (
      id text primary key,
      purpose_code text not null,
      usage_name text not null default '',
      asset_name text not null default '',
      purchase_source text not null default '',
      purchase_price numeric(14, 2) not null default 0,
      audit_cycle text not null default '',
      deleted_at timestamptz null,
      deleted_by text null references identity.users(id) on delete set null,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists asset.asset_audit_history (
      id text primary key,
      asset_id text not null references asset.physical_assets(id) on delete cascade,
      sequence_no integer not null default 1,
      history_date date null,
      content text not null default '',
      cost_amount numeric(14, 2) not null default 0,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists asset.asset_repair_history (
      id text primary key,
      asset_id text not null references asset.physical_assets(id) on delete cascade,
      sequence_no integer not null default 1,
      history_date date null,
      content text not null default '',
      cost_amount numeric(14, 2) not null default 0,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
    )
  `);

  await query(`
    create table if not exists asset.knowledge_records (
      id text primary key,
      category text not null default '일반',
      content text not null default '',
      author text not null default '',
      deleted_at timestamptz null,
      deleted_by text null references identity.users(id) on delete set null,
      created_at timestamptz not null default now(),
      created_by text null references identity.users(id) on delete set null,
      updated_at timestamptz not null default now(),
      updated_by text null references identity.users(id) on delete set null
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
  await query(`create index if not exists idx_customers_customer_name_trgm on master.customers using gin (customer_name gin_trgm_ops)`);
  await query(`create index if not exists idx_customers_registration_no_trgm on master.customers using gin (business_registration_no gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_contacts_customer on master.customer_contacts(customer_id, is_primary desc, created_at desc)`);
  await query(`create index if not exists idx_customer_contacts_name_trgm on master.customer_contacts using gin (contact_name gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_contacts_mobile_trgm on master.customer_contacts using gin (mobile_phone gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_contacts_office_trgm on master.customer_contacts using gin (office_phone gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_addresses_customer on master.customer_addresses(customer_id, address_type)`);
  await query(`create index if not exists idx_customer_assets_customer on master.customer_assets(customer_id, asset_type, created_at desc)`);
  await query(`create index if not exists idx_customer_assets_name_trgm on master.customer_assets using gin (asset_name gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_equipments_asset on master.customer_equipments(asset_id, equipment_type, created_at desc)`);
  await query(`create index if not exists idx_customer_equipments_serial on master.customer_equipments(serial_no)`);
  await query(`create index if not exists idx_customer_equipments_serial_trgm on master.customer_equipments using gin (serial_no gin_trgm_ops)`);
  await query(`create index if not exists idx_customer_equipments_name_trgm on master.customer_equipments using gin (equipment_name gin_trgm_ops)`);
  await query(`create index if not exists idx_equipment_master_options_type_status on master.equipment_master_options(option_type, status, option_value)`);
  await query(`create index if not exists idx_master_data_requests_status_created on master.master_data_requests(status, created_at desc)`);
  await query(`create index if not exists idx_file_links_entity on files.file_links(entity_type, entity_id, created_at desc)`);
  await query(`create index if not exists idx_customer_registration_extractions_customer on master.customer_registration_extractions(customer_id, created_at desc)`);
  await query(`create index if not exists idx_sales_orders_request_date on sales.orders(request_date desc)`);
  await query(`create index if not exists idx_sales_orders_customer on sales.orders(customer_id, customer_name)`);
  await query(`create index if not exists idx_sales_orders_merged on sales.orders(merged_into_order_id)`);
  await query(`create index if not exists idx_project_projects_source_order on project.projects(source_order_id)`);
  await query(`create index if not exists idx_project_projects_status on project.projects(status, order_archived)`);
  await query(`create index if not exists idx_asset_physical_assets_deleted on asset.physical_assets(deleted_at, purpose_code, updated_at desc)`);
  await query(`create index if not exists idx_asset_audit_history_asset on asset.asset_audit_history(asset_id, sequence_no)`);
  await query(`create index if not exists idx_asset_repair_history_asset on asset.asset_repair_history(asset_id, sequence_no)`);
  await query(`create index if not exists idx_asset_knowledge_records_deleted on asset.knowledge_records(deleted_at, category, updated_at desc)`);

  console.log("Database migration completed.");
}

migrate().catch((error) => {
  console.error("Database migration failed.");
  console.error(error);
  process.exitCode = 1;
});
