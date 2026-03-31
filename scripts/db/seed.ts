import bcrypt from "bcryptjs";
import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function seed() {
  await connectPostgres();

  const employees = [
    {
      id: "emp_001",
      employeeNo: "E-1001",
      name: "일반 사용자",
      department: "영업부",
      jobTitle: "부품 판매 담당",
      contact: "010-1000-1001",
      workStatus: "상담 진행",
      assignedWorkCount: 4,
    },
    {
      id: "emp_002",
      employeeNo: "E-1000",
      name: "관리자",
      department: "관리부",
      jobTitle: "운영 관리자",
      contact: "010-1000-1000",
      workStatus: "운영 점검",
      assignedWorkCount: 1,
    },
    {
      id: "emp_003",
      employeeNo: "E-2001",
      name: "박민수",
      department: "정비부",
      jobTitle: "정비 팀장",
      contact: "010-1000-2001",
      workStatus: "현장 작업",
      assignedWorkCount: 6,
    },
    {
      id: "emp_004",
      employeeNo: "E-3001",
      name: "이현우",
      department: "영업부",
      jobTitle: "영업 지원",
      contact: "010-1000-3001",
      workStatus: "견적 준비",
      assignedWorkCount: 3,
    },
  ];

  for (const employee of employees) {
    await query(
      `insert into identity.employees (
         id,
         employee_no,
         name,
         department,
         job_title,
         contact,
         work_status,
         assigned_work_count
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update
       set employee_no = excluded.employee_no,
           name = excluded.name,
           department = excluded.department,
           job_title = excluded.job_title,
           contact = excluded.contact,
           work_status = excluded.work_status,
           assigned_work_count = excluded.assigned_work_count,
           updated_at = now()`,
      [
        employee.id,
        employee.employeeNo,
        employee.name,
        employee.department,
        employee.jobTitle,
        employee.contact,
        employee.workStatus,
        employee.assignedWorkCount,
      ],
    );
  }

  const users = [
    {
      id: "usr_user_001",
      employeeId: "emp_001",
      username: "ha",
      password: "1234",
      name: "일반 사용자",
      department: "영업부",
      roles: ["CUSTOMER_MANAGE", "ORDER_MANAGE", "PARTS_SALES", "INVENTORY_VIEW"],
    },
    {
      id: "usr_admin_001",
      employeeId: "emp_002",
      username: "admin.ha",
      password: "dudrhkd2026!",
      name: "관리자",
      department: "관리부",
      roles: ["SYSTEM_ADMIN"],
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await query(
      `insert into identity.users (
         id,
         employee_id,
         username,
         password_hash,
         name,
         department,
         roles,
         status,
         failed_password_attempts,
         locked_until,
         last_failed_password_at
       ) values ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 0, null, null)
       on conflict (username) do update
       set employee_id = excluded.employee_id,
           password_hash = excluded.password_hash,
           name = excluded.name,
           department = excluded.department,
           roles = excluded.roles,
           status = 'ACTIVE',
           failed_password_attempts = 0,
           locked_until = null,
           last_failed_password_at = null,
           updated_at = now()`,
      [user.id, user.employeeId, user.username, passwordHash, user.name, user.department, user.roles],
    );
  }

  const engineModels = [
    {
      id: "eng_model_001",
      manufacturer: "CAT",
      modelName: "C18",
      engineType: "Marine Diesel",
      fuelType: "Diesel",
      powerRating: "447kW",
      notes: "주요 선박 엔진 모델",
    },
    {
      id: "eng_model_002",
      manufacturer: "Cummins",
      modelName: "KTA38",
      engineType: "Industrial Diesel",
      fuelType: "Diesel",
      powerRating: "746kW",
      notes: "일반 설비용 엔진",
    },
  ];

  for (const model of engineModels) {
    await query(
      `insert into master.engine_models (
         id, manufacturer, model_name, engine_type, fuel_type, power_rating, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       on conflict (id) do update
       set manufacturer = excluded.manufacturer,
           model_name = excluded.model_name,
           engine_type = excluded.engine_type,
           fuel_type = excluded.fuel_type,
           power_rating = excluded.power_rating,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [model.id, model.manufacturer, model.modelName, model.engineType, model.fuelType, model.powerRating, model.notes, "usr_admin_001"],
    );
  }

  const gearboxModels = [
    {
      id: "gear_model_001",
      manufacturer: "ZF",
      modelName: "ZF305-2",
      gearType: "Marine Gearbox",
      gearRatio: "4.045:1",
      torqueRating: "3000Nm",
      notes: "선박용 감속기",
    },
    {
      id: "gear_model_002",
      manufacturer: "Twin Disc",
      modelName: "MGX-5114A",
      gearType: "Reduction Gear",
      gearRatio: "3.00:1",
      torqueRating: "2400Nm",
      notes: "현장 설비 겸용",
    },
  ];

  for (const model of gearboxModels) {
    await query(
      `insert into master.gearbox_models (
         id, manufacturer, model_name, gear_type, gear_ratio, torque_rating, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       on conflict (id) do update
       set manufacturer = excluded.manufacturer,
           model_name = excluded.model_name,
           gear_type = excluded.gear_type,
           gear_ratio = excluded.gear_ratio,
           torque_rating = excluded.torque_rating,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [model.id, model.manufacturer, model.modelName, model.gearType, model.gearRatio, model.torqueRating, model.notes, "usr_admin_001"],
    );
  }

  const customers = [
    {
      id: "cust_001",
      customerNo: "CUST-2026-0001",
      customerName: "태성해운",
      customerType: "SHIP_OWNER",
      registrationNo: "214-81-99881",
      representativeName: "김태성",
      companyPhone: "051-741-2001",
      companyEmail: "ops@taesung-marine.co.kr",
      businessCategory: "선박 운송업",
      businessItem: "연안 화물 운송",
      openingDate: "2019-02-11",
      notes: "주요 선사 고객",
    },
    {
      id: "cust_002",
      customerNo: "CUST-2026-0002",
      customerName: "남해플랜트서비스",
      customerType: "GENERAL",
      registrationNo: "608-86-11223",
      representativeName: "박경수",
      companyPhone: "055-644-7788",
      companyEmail: "plant@namhae-service.kr",
      businessCategory: "산업설비 유지보수",
      businessItem: "발전기 및 현장장비 운영",
      openingDate: "2020-07-03",
      notes: "일반 고객 장비 보유",
    },
  ];

  for (const customer of customers) {
    await query(
      `insert into master.customers (
         id, customer_no, customer_name, customer_type, status, business_registration_no, representative_name,
         company_phone, company_email, business_category, business_item, opening_date, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
       on conflict (id) do update
       set customer_no = excluded.customer_no,
           customer_name = excluded.customer_name,
           customer_type = excluded.customer_type,
           business_registration_no = excluded.business_registration_no,
           representative_name = excluded.representative_name,
           company_phone = excluded.company_phone,
           company_email = excluded.company_email,
           business_category = excluded.business_category,
           business_item = excluded.business_item,
           opening_date = excluded.opening_date,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [
        customer.id,
        customer.customerNo,
        customer.customerName,
        customer.customerType,
        customer.registrationNo,
        customer.representativeName,
        customer.companyPhone,
        customer.companyEmail,
        customer.businessCategory,
        customer.businessItem,
        customer.openingDate,
        customer.notes,
        "usr_user_001",
      ],
    );
  }

  const contacts = [
    ["cust_contact_001", "cust_001", "김태성", "OWNER", "대표", "대표이사", "010-2200-1001", "051-741-2001", "ceo@taesung-marine.co.kr", true, "대표 연락처"],
    ["cust_contact_002", "cust_001", "이서연", "STAFF", "정비팀", "운항 엔지니어", "010-2200-1002", "051-741-2002", "engine@taesung-marine.co.kr", false, "엔진 담당"],
    ["cust_contact_003", "cust_002", "박경수", "OWNER", "경영지원", "대표", "010-3300-2001", "055-644-7788", "ceo@namhae-service.kr", true, "대표 연락처"],
    ["cust_contact_004", "cust_002", "최민호", "STAFF", "운영팀", "설비 관리자", "010-3300-2002", "055-644-7790", "site@namhae-service.kr", false, "현장 장비 담당"],
  ];

  for (const contact of contacts) {
    await query(
      `insert into master.customer_contacts (
         id, customer_id, contact_name, contact_role, department_name, job_title, mobile_phone, office_phone, email,
         is_primary, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
       on conflict (id) do update
       set contact_name = excluded.contact_name,
           contact_role = excluded.contact_role,
           department_name = excluded.department_name,
           job_title = excluded.job_title,
           mobile_phone = excluded.mobile_phone,
           office_phone = excluded.office_phone,
           email = excluded.email,
           is_primary = excluded.is_primary,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [...contact, "usr_user_001"],
    );
  }

  const addresses = [
    ["cust_addr_001", "cust_001", "BUSINESS", "48058", "부산광역시 해운대구 센텀중앙로 100", "8층", "본사"],
    ["cust_addr_002", "cust_002", "BUSINESS", "53065", "경상남도 통영시 광도면 조선로 55", "2층", "주사업장"],
  ];

  for (const address of addresses) {
    await query(
      `insert into master.customer_addresses (
         id, customer_id, address_type, postal_code, address_line_1, address_line_2, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       on conflict (id) do update
       set address_type = excluded.address_type,
           postal_code = excluded.postal_code,
           address_line_1 = excluded.address_line_1,
           address_line_2 = excluded.address_line_2,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [...address, "usr_user_001"],
    );
  }

  const assets = [
    ["asset_001", "cust_001", "TS Pioneer", "VESSEL", "VSL-001", "ACTIVE", "REG-TS-001", "IMO9788111", "부산항", "주력 운항 선박"],
    ["asset_002", "cust_002", "현장 발전 시스템 A", "SITE_EQUIPMENT", "SITE-001", "ACTIVE", "SITE-REG-77", "", "통영 플랜트 현장", "발전 설비"],
  ];

  for (const asset of assets) {
    await query(
      `insert into master.customer_assets (
         id, customer_id, asset_name, asset_type, asset_code, status, registration_no, imo_no, location_description, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
       on conflict (id) do update
       set asset_name = excluded.asset_name,
           asset_type = excluded.asset_type,
           asset_code = excluded.asset_code,
           status = excluded.status,
           registration_no = excluded.registration_no,
           imo_no = excluded.imo_no,
           location_description = excluded.location_description,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [...asset, "usr_user_001"],
    );
  }

  const equipments = [
    ["equip_001", "asset_001", "cust_001", "주기관 1번", "ENGINE", "ACTIVE", "ENG-TS-1001", "기관실 좌현", "eng_model_001", null, "CAT", "C18", "선박 주기관"],
    ["equip_002", "asset_001", "cust_001", "감속기 1번", "GEARBOX", "ACTIVE", "GB-TS-1001", "기관실 좌현", null, "gear_model_001", "ZF", "ZF305-2", "주기관 연결 감속기"],
    ["equip_003", "asset_002", "cust_002", "발전기 엔진", "ENGINE", "ACTIVE", "GEN-NH-2001", "발전실", "eng_model_002", null, "Cummins", "KTA38", "현장 발전 엔진"],
  ];

  for (const equipment of equipments) {
    await query(
      `insert into master.customer_equipments (
         id, asset_id, customer_id, equipment_name, equipment_type, status, serial_no, installation_position,
         engine_model_id, gearbox_model_id, manufacturer, model_name, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
       on conflict (id) do update
       set equipment_name = excluded.equipment_name,
           equipment_type = excluded.equipment_type,
           status = excluded.status,
           serial_no = excluded.serial_no,
           installation_position = excluded.installation_position,
           engine_model_id = excluded.engine_model_id,
           gearbox_model_id = excluded.gearbox_model_id,
           manufacturer = excluded.manufacturer,
           model_name = excluded.model_name,
           notes = excluded.notes,
           updated_at = now(),
           updated_by = excluded.updated_by`,
      [...equipments.find((item) => item[0] === equipment[0])!, "usr_user_001"],
    );
  }

  await query(
    `insert into files.file_objects (
       id, domain, entity_type, entity_id, original_name, stored_path, mime_type, size_bytes, sha256,
       latest_version, scan_status, retention_class, metadata_json, uploaded_by
     ) values (
       'file_001', 'customer', 'business_license', 'cust_001', 'taesung-license.txt',
       'customer/2026/03/file_001-taesung-license.txt', 'text/plain', 128, 'demo-sha-file-001',
       1, 'CLEAN', 'STANDARD',
       jsonb_build_object('ocr_source_text', '사업자등록번호 214-81-99881 상호 태성해운 성명 김태성 사업장 부산광역시 해운대구 센텀중앙로 100 업태 선박 운송업 종목 연안 화물 운송 개업연월일 2019-02-11'),
       'usr_user_001'
     )
     on conflict (id) do update
     set entity_id = excluded.entity_id,
         metadata_json = excluded.metadata_json,
         uploaded_at = now()`,
  );

  await query(
    `insert into files.file_versions (
       id, file_id, version, original_name, mime_type, size_bytes, sha256, stored_path, content_text, uploaded_by
     ) values (
       'file_ver_001', 'file_001', 1, 'taesung-license.txt', 'text/plain', 128, 'demo-sha-file-001',
       'customer/2026/03/file_001-taesung-license.txt',
       '사업자등록번호 214-81-99881 상호 태성해운 성명 김태성 사업장 부산광역시 해운대구 센텀중앙로 100 업태 선박 운송업 종목 연안 화물 운송 개업연월일 2019-02-11',
       'usr_user_001'
     )
     on conflict (id) do update
     set content_text = excluded.content_text,
         uploaded_at = now()`,
  );

  await query(
    `insert into files.file_links (
       id, file_id, domain, entity_type, entity_id, created_by
     ) values ('file_link_001', 'file_001', 'customer', 'customer', 'cust_001', 'usr_user_001')
     on conflict (id) do update
     set entity_id = excluded.entity_id,
         created_at = now()`,
  );

  await query(
    `insert into master.customer_registration_extractions (
       id, customer_id, file_id, status, extractor_name, extracted_registration_no, extracted_company_name,
       extracted_representative_name, extracted_address, extracted_business_category, extracted_business_item,
       extracted_opening_date, confirmed_snapshot, created_by
     ) values (
       'extract_001', 'cust_001', 'file_001', 'READY', 'mock-business-license-ocr', '214-81-99881', '태성해운',
       '김태성', '부산광역시 해운대구 센텀중앙로 100', '선박 운송업', '연안 화물 운송', '2019-02-11',
       jsonb_build_object('customer_name', '태성해운', 'business_registration_no', '214-81-99881', 'representative_name', '김태성'),
       'usr_user_001'
     )
     on conflict (id) do update
     set confirmed_snapshot = excluded.confirmed_snapshot,
         created_at = now()`,
  );

  console.log("Database seed completed.");
}

seed().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exitCode = 1;
});
