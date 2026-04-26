import crypto from "node:crypto";
import type { DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import { query, withTransaction } from "../../shared/infrastructure/persistence/postgres.js";
import type {
  BusinessLicenseExtraction,
  CustomerAddress,
  CustomerAsset,
  CustomerContact,
  CustomerDetail,
  CustomerEquipment,
  EquipmentMasterOption,
  CustomerSummary,
  EngineModel,
  FileRecord,
  GearboxModel,
} from "./customer.types.js";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function nullableText(value: unknown) {
  const normalized = text(value);
  return normalized || null;
}

function booleanValue(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

function hasInput(input: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function mapCustomerSummary(row: {
  id: string;
  customer_no: string;
  customer_name: string;
  customer_type: "SHIP_OWNER" | "GENERAL";
  status: "ACTIVE" | "INACTIVE";
  business_registration_no: string | null;
  representative_name: string | null;
  company_phone: string;
  company_email: string;
  tax_category: string;
  bank_account: string;
  invoice_email: string;
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  asset_count: number;
  equipment_count: number;
  updated_at: Date;
}) {
  return {
    id: row.id,
    customerNo: row.customer_no,
    customerName: row.customer_name,
    customerType: row.customer_type,
    status: row.status,
    businessRegistrationNo: row.business_registration_no,
    representativeName: row.representative_name,
    companyPhone: row.company_phone,
    companyEmail: row.company_email,
    taxCategory: row.tax_category,
    bankAccount: row.bank_account,
    invoiceEmail: row.invoice_email,
    primaryContactName: row.primary_contact_name,
    primaryContactPhone: row.primary_contact_phone,
    assetCount: row.asset_count,
    equipmentCount: row.equipment_count,
    duplicateHints: row.business_registration_no ? [`사업자번호 ${row.business_registration_no}`] : [],
    updatedAt: row.updated_at.toISOString(),
  } satisfies CustomerSummary;
}

function mapContact(row: {
  id: string;
  customer_id: string;
  contact_name: string;
  contact_role: "OWNER" | "STAFF" | "MANAGER" | "ACCOUNTING" | "OTHER";
  department_name: string;
  job_title: string;
  mobile_phone: string;
  office_phone: string;
  email: string;
  is_primary: boolean;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    customerId: row.customer_id,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    departmentName: row.department_name,
    jobTitle: row.job_title,
    mobilePhone: row.mobile_phone,
    officePhone: row.office_phone,
    email: row.email,
    isPrimary: row.is_primary,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies CustomerContact;
}

function mapAddress(row: {
  id: string;
  customer_id: string;
  address_type: "BUSINESS" | "BILLING" | "SITE" | "VESSEL_MANAGEMENT";
  postal_code: string;
  address_line_1: string;
  address_line_2: string;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    customerId: row.customer_id,
    addressType: row.address_type,
    postalCode: row.postal_code,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies CustomerAddress;
}

function mapAsset(row: {
  id: string;
  customer_id: string;
  asset_name: string;
  asset_type: "VESSEL" | "SITE_EQUIPMENT";
  vessel_type: string;
  asset_code: string;
  status: string;
  registration_no: string;
  imo_no: string;
  location_description: string;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    customerId: row.customer_id,
    assetName: row.asset_name,
    assetType: row.asset_type,
    vesselType: row.vessel_type,
    assetCode: row.asset_code,
    status: row.status,
    registrationNo: row.registration_no,
    imoNo: row.imo_no,
    locationDescription: row.location_description,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies CustomerAsset;
}

function mapEquipment(row: {
  id: string;
  asset_id: string;
  customer_id: string;
  equipment_name: string;
  equipment_type: "ENGINE" | "GEARBOX" | "OTHER";
  status: string;
  serial_no: string;
  installation_position: string;
  engine_model_id: string | null;
  gearbox_model_id: string | null;
  manufacturer: string;
  model_name: string;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    assetId: row.asset_id,
    customerId: row.customer_id,
    equipmentName: row.equipment_name,
    equipmentType: row.equipment_type,
    status: row.status,
    serialNo: row.serial_no,
    installationPosition: row.installation_position,
    engineModelId: row.engine_model_id,
    gearboxModelId: row.gearbox_model_id,
    manufacturer: row.manufacturer,
    modelName: row.model_name,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies CustomerEquipment;
}

function mapEngineModel(row: {
  id: string;
  manufacturer: string;
  model_name: string;
  engine_type: string;
  fuel_type: string;
  power_rating: string;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    manufacturer: row.manufacturer,
    modelName: row.model_name,
    engineType: row.engine_type,
    fuelType: row.fuel_type,
    powerRating: row.power_rating,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies EngineModel;
}

function mapGearboxModel(row: {
  id: string;
  manufacturer: string;
  model_name: string;
  gear_type: string;
  gear_ratio: string;
  torque_rating: string;
  notes: string;
  updated_at: Date;
}) {
  return {
    id: row.id,
    manufacturer: row.manufacturer,
    modelName: row.model_name,
    gearType: row.gear_type,
    gearRatio: row.gear_ratio,
    torqueRating: row.torque_rating,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  } satisfies GearboxModel;
}

function mapEquipmentMasterOption(row: {
  id: string;
  option_type: string;
  option_value: string;
}) {
  return {
    id: row.id,
    optionType: row.option_type,
    optionValue: row.option_value,
  } satisfies EquipmentMasterOption;
}

function mapFile(row: {
  id: string;
  domain: string;
  entity_type: string;
  entity_id: string | null;
  original_name: string;
  stored_path: string;
  mime_type: string;
  size_bytes: string | number;
  scan_status: string;
  retention_class: string;
  metadata_json: Record<string, unknown>;
  uploaded_at: Date;
}) {
  return {
    id: row.id,
    domain: row.domain,
    entityType: row.entity_type,
    entityId: row.entity_id,
    originalName: row.original_name,
    storedPath: row.stored_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes || 0),
    scanStatus: row.scan_status,
    retentionClass: row.retention_class,
    metadata: row.metadata_json || {},
    uploadedAt: row.uploaded_at.toISOString(),
  } satisfies FileRecord;
}

function mapExtraction(row: {
  id: string;
  customer_id: string;
  file_id: string | null;
  status: string;
  extractor_name: string;
  extracted_registration_no: string;
  extracted_company_name: string;
  extracted_representative_name: string;
  extracted_address: string;
  extracted_business_category: string;
  extracted_business_item: string;
  extracted_opening_date: string;
  confirmed_snapshot: Record<string, unknown>;
  created_at: Date;
}) {
  return {
    id: row.id,
    customerId: row.customer_id,
    fileId: row.file_id,
    status: row.status,
    extractorName: row.extractor_name,
    extractedRegistrationNo: row.extracted_registration_no,
    extractedCompanyName: row.extracted_company_name,
    extractedRepresentativeName: row.extracted_representative_name,
    extractedAddress: row.extracted_address,
    extractedBusinessCategory: row.extracted_business_category,
    extractedBusinessItem: row.extracted_business_item,
    extractedOpeningDate: row.extracted_opening_date,
    confirmedSnapshot: row.confirmed_snapshot || {},
    createdAt: row.created_at.toISOString(),
  } satisfies BusinessLicenseExtraction;
}

function extractBusinessLicenseFields(source: string) {
  const value = source.replace(/\s+/g, " ").trim();
  const pick = (patterns: RegExp[]) => {
    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
    return "";
  };

  return {
    registrationNo: pick([/사업자등록번호[:\s]*([0-9-]{10,14})/i, /등록번호[:\s]*([0-9-]{10,14})/i]),
    companyName: pick([/상호[:\s]*([^\s].*?)(?:\s(?:성명|대표자|사업장|업태|종목|개업|$))/i]),
    representativeName: pick([/(?:성명|대표자)[:\s]*([^\s].*?)(?:\s(?:사업장|업태|종목|개업|$))/i]),
    address: pick([/사업장(?:소재지)?[:\s]*([^\s].*?)(?:\s(?:업태|종목|개업|$))/i, /주소[:\s]*([^\s].*?)(?:\s(?:업태|종목|개업|$))/i]),
    businessCategory: pick([/업태[:\s]*([^\s].*?)(?:\s(?:종목|개업|$))/i]),
    businessItem: pick([/종목[:\s]*([^\s].*?)(?:\s(?:개업|$))/i]),
    openingDate: pick([/개업(?:연월일)?[:\s]*([0-9]{4}[-./][0-9]{2}[-./][0-9]{2})/i]),
  };
}

export class CustomerService {
  async listCustomers(search?: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const normalizedSearch = text(search);
    const searchValue = normalizedSearch ? `%${normalizedSearch}%` : null;
    type CustomerListRow = {
      id: string;
      customer_no: string;
      customer_name: string;
      customer_type: "SHIP_OWNER" | "GENERAL";
      status: "ACTIVE" | "INACTIVE";
      business_registration_no: string | null;
      representative_name: string | null;
      company_phone: string;
      company_email: string;
      tax_category: string;
      bank_account: string;
      invoice_email: string;
      primary_contact_name: string | null;
      primary_contact_phone: string | null;
      asset_count: number;
      equipment_count: number;
      updated_at: Date;
    };

    if (!searchValue) {
      const result = await executor.query<CustomerListRow>(
        `select
           c.id,
           c.customer_no,
           c.customer_name,
           c.customer_type,
           c.status,
           c.business_registration_no,
           c.representative_name,
           c.company_phone,
           c.company_email,
           c.tax_category,
           c.bank_account,
           c.invoice_email,
           pc.contact_name as primary_contact_name,
           nullif(coalesce(pc.mobile_phone, pc.office_phone), '') as primary_contact_phone,
           coalesce(ac.asset_count, 0)::int as asset_count,
           coalesce(ec.equipment_count, 0)::int as equipment_count,
           c.updated_at
         from master.customers c
         left join (
           select distinct on (customer_id)
             customer_id,
             contact_name,
             mobile_phone,
             office_phone
           from master.customer_contacts
           order by customer_id, is_primary desc, updated_at desc
         ) pc on pc.customer_id = c.id
         left join (
           select customer_id, count(*)::int as asset_count
           from master.customer_assets
           group by customer_id
         ) ac on ac.customer_id = c.id
         left join (
           select customer_id, count(*)::int as equipment_count
           from master.customer_equipments
           group by customer_id
         ) ec on ec.customer_id = c.id
         order by c.updated_at desc, c.customer_name asc`,
      );

      return result.rows.map(mapCustomerSummary);
    }

    const result = await executor.query<CustomerListRow>(
      `select
         matched.id,
         matched.customer_no,
         matched.customer_name,
         matched.customer_type,
         matched.status,
         matched.business_registration_no,
         matched.representative_name,
         matched.company_phone,
         matched.company_email,
         matched.tax_category,
         matched.bank_account,
         matched.invoice_email,
         pc.contact_name as primary_contact_name,
         nullif(coalesce(pc.mobile_phone, pc.office_phone), '') as primary_contact_phone,
         coalesce(ac.asset_count, 0)::int as asset_count,
         coalesce(ec.equipment_count, 0)::int as equipment_count,
         matched.updated_at
       from (
         select
           c.id,
           c.customer_no,
           c.customer_name,
           c.customer_type,
           c.status,
           c.business_registration_no,
           c.representative_name,
           c.company_phone,
           c.company_email,
           c.tax_category,
           c.bank_account,
           c.invoice_email,
           c.updated_at
         from master.customers c
         where (
           c.customer_name ilike $1
           or coalesce(c.business_registration_no, '') ilike $1
           or exists (
             select 1
             from master.customer_contacts cc
             where cc.customer_id = c.id
               and (
                 cc.contact_name ilike $1
                 or cc.mobile_phone ilike $1
                 or cc.office_phone ilike $1
               )
           )
           or exists (
             select 1
             from master.customer_assets a
             where a.customer_id = c.id
               and a.asset_name ilike $1
           )
           or exists (
             select 1
             from master.customer_equipments e
             where e.customer_id = c.id
               and (
                 e.serial_no ilike $1
                 or e.equipment_name ilike $1
               )
           )
         )
         order by c.updated_at desc, c.customer_name asc
         limit 100
       ) matched
       left join lateral (
         select
           cc.contact_name,
           cc.mobile_phone,
           cc.office_phone
         from master.customer_contacts cc
         where cc.customer_id = matched.id
         order by cc.is_primary desc, cc.updated_at desc
         limit 1
       ) pc on true
       left join lateral (
         select count(*)::int as asset_count
         from master.customer_assets a
         where a.customer_id = matched.id
       ) ac on true
       left join lateral (
         select count(*)::int as equipment_count
         from master.customer_equipments e
         where e.customer_id = matched.id
       ) ec on true
       order by matched.updated_at desc, matched.customer_name asc`,
      [searchValue],
    );

    return result.rows.map(mapCustomerSummary);
  }

  async getCustomerById(customerId: string, client?: DbExecutor): Promise<CustomerDetail | null> {
    const executor: DbExecutor = client ?? { query };
    const customerResult = await executor.query<{
      id: string;
      customer_no: string;
      customer_name: string;
      customer_type: "SHIP_OWNER" | "GENERAL";
      status: "ACTIVE" | "INACTIVE";
      business_registration_no: string | null;
      representative_name: string | null;
      company_phone: string;
      company_email: string;
      tax_category: string;
      bank_account: string;
      invoice_email: string;
      business_category: string;
      business_item: string;
      opening_date: Date | null;
      notes: string;
      updated_at: Date;
      primary_contact_name: string | null;
      primary_contact_phone: string | null;
      asset_count: number;
      equipment_count: number;
    }>(
      `select
         c.id,
         c.customer_no,
         c.customer_name,
         c.customer_type,
         c.status,
         c.business_registration_no,
         c.representative_name,
         c.company_phone,
         c.company_email,
         c.tax_category,
         c.bank_account,
         c.invoice_email,
         c.business_category,
         c.business_item,
         c.opening_date,
         c.notes,
         c.updated_at,
         (
           select cc.contact_name
           from master.customer_contacts cc
           where cc.customer_id = c.id
           order by cc.is_primary desc, cc.updated_at desc
           limit 1
         ) as primary_contact_name,
         (
           select nullif(coalesce(cc.mobile_phone, cc.office_phone), '')
           from master.customer_contacts cc
           where cc.customer_id = c.id
           order by cc.is_primary desc, cc.updated_at desc
           limit 1
         ) as primary_contact_phone,
         (select count(*)::int from master.customer_assets a where a.customer_id = c.id) as asset_count,
         (select count(*)::int from master.customer_equipments e where e.customer_id = c.id) as equipment_count
       from master.customers c
       where c.id = $1`,
      [customerId],
    );
    const customer = customerResult.rows[0];
    if (!customer) {
      return null;
    }

    const [contactsResult, addressesResult, assetsResult, equipmentsResult, filesResult, extractionResult] = await Promise.all([
      executor.query<{
        id: string;
        customer_id: string;
        contact_name: string;
        contact_role: "OWNER" | "STAFF" | "MANAGER" | "ACCOUNTING" | "OTHER";
        department_name: string;
        job_title: string;
        mobile_phone: string;
        office_phone: string;
        email: string;
        is_primary: boolean;
        notes: string;
        updated_at: Date;
      }>(
        `select *
         from master.customer_contacts
         where customer_id = $1
         order by is_primary desc, updated_at desc, contact_name asc`,
        [customerId],
      ),
      executor.query<{
        id: string;
        customer_id: string;
        address_type: "BUSINESS" | "BILLING" | "SITE" | "VESSEL_MANAGEMENT";
        postal_code: string;
        address_line_1: string;
        address_line_2: string;
        notes: string;
        updated_at: Date;
      }>(
        `select *
         from master.customer_addresses
         where customer_id = $1
         order by updated_at desc, address_type asc`,
        [customerId],
      ),
      executor.query<{
        id: string;
        customer_id: string;
        asset_name: string;
        asset_type: "VESSEL" | "SITE_EQUIPMENT";
        vessel_type: string;
        asset_code: string;
        status: string;
        registration_no: string;
        imo_no: string;
        location_description: string;
        notes: string;
        updated_at: Date;
      }>(
        `select *
         from master.customer_assets
         where customer_id = $1
         order by updated_at desc, asset_name asc`,
        [customerId],
      ),
      executor.query<{
        id: string;
        asset_id: string;
        customer_id: string;
        equipment_name: string;
        equipment_type: "ENGINE" | "GEARBOX" | "OTHER";
        status: string;
        serial_no: string;
        installation_position: string;
        engine_model_id: string | null;
        gearbox_model_id: string | null;
        manufacturer: string;
        model_name: string;
        notes: string;
        updated_at: Date;
      }>(
        `select *
         from master.customer_equipments
         where customer_id = $1
         order by updated_at desc, equipment_name asc`,
        [customerId],
      ),
      executor.query<{
        id: string;
        domain: string;
        entity_type: string;
        entity_id: string | null;
        original_name: string;
        stored_path: string;
        mime_type: string;
        size_bytes: string | number;
        scan_status: string;
        retention_class: string;
        metadata_json: Record<string, unknown>;
        uploaded_at: Date;
      }>(
        `select f.*
         from files.file_objects f
         join files.file_links l on l.file_id = f.id
         where l.entity_type = 'customer'
           and l.entity_id = $1
         order by f.uploaded_at desc`,
        [customerId],
      ),
      executor.query<{
        id: string;
        customer_id: string;
        file_id: string | null;
        status: string;
        extractor_name: string;
        extracted_registration_no: string;
        extracted_company_name: string;
        extracted_representative_name: string;
        extracted_address: string;
        extracted_business_category: string;
        extracted_business_item: string;
        extracted_opening_date: string;
        confirmed_snapshot: Record<string, unknown>;
        created_at: Date;
      }>(
        `select *
         from master.customer_registration_extractions
         where customer_id = $1
         order by created_at desc
         limit 1`,
        [customerId],
      ),
    ]);

    const equipments = equipmentsResult.rows.map(mapEquipment);
    const assets = assetsResult.rows.map(mapAsset).map((asset) => ({
      ...asset,
      equipments: equipments.filter((equipment) => equipment.assetId === asset.id),
    }));

    return {
      customer: {
        ...mapCustomerSummary(customer),
        businessCategory: customer.business_category,
        businessItem: customer.business_item,
        taxCategory: customer.tax_category,
        bankAccount: customer.bank_account,
        invoiceEmail: customer.invoice_email,
        openingDate: customer.opening_date?.toISOString().slice(0, 10) || null,
        notes: customer.notes,
      },
      contacts: contactsResult.rows.map(mapContact),
      addresses: addressesResult.rows.map(mapAddress),
      assets,
      files: filesResult.rows.map(mapFile),
      latestExtraction: extractionResult.rows[0] ? mapExtraction(extractionResult.rows[0]) : null,
    };
  }

  async createCustomer(input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const duplicateResult = await client.query<{ id: string; customer_name: string }>(
        `select id, customer_name
         from master.customers
         where business_registration_no is not null
           and business_registration_no = $1
         limit 5`,
        [nullableText(input.business_registration_no)],
      );

      const customerId = crypto.randomUUID();
      const customerNoResult = await client.query<{ count: string }>(`select count(*)::text as count from master.customers`);
      const customerNo = `CUST-${new Date().getFullYear()}-${String(Number(customerNoResult.rows[0]?.count || "0") + 1).padStart(4, "0")}`;

      await client.query(
        `insert into master.customers (
           id, customer_no, customer_name, customer_type, status, business_registration_no, representative_name,
           company_phone, company_email, business_category, business_item, tax_category, bank_account, invoice_email,
           opening_date, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)`,
        [
          customerId,
          customerNo,
          text(input.customer_name),
          text(input.customer_type, "GENERAL"),
          nullableText(input.business_registration_no),
          nullableText(input.representative_name),
          text(input.company_phone),
          text(input.company_email),
          text(input.business_category),
          text(input.business_item),
          text(input.tax_category),
          text(input.bank_account),
          text(input.invoice_email),
          nullableText(input.opening_date),
          text(input.notes),
          actorUserId,
        ],
      );

      const businessLicenseFileId = nullableText(input.business_license_file_id);
      if (businessLicenseFileId) {
        await this.linkFile(
          {
            fileId: businessLicenseFileId,
            domain: "customer",
            entityType: "customer",
            entityId: customerId,
          },
          actorUserId,
          client,
        );
      }

      const detail = await this.getCustomerById(customerId, client);
      return {
        customer: detail,
        duplicates: duplicateResult.rows,
      };
    });
  }

  async updateCustomerMemo(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      await client.query(
        `update master.customers
         set notes = $2,
             updated_at = now(),
             updated_by = $3
         where id = $1`,
        [customerId, text(input.notes), actorUserId],
      );

      return this.getCustomerById(customerId, client);
    });
  }

  async updateCustomer(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const customerResult = await client.query<{ id: string }>(`select id from master.customers where id = $1`, [customerId]);
      if (!customerResult.rows[0]) {
        return null;
      }

      const customerFields: Array<[string, string, (value: unknown) => string | null]> = [
        ["customer_name", "customer_name", (value) => text(value)],
        ["customer_type", "customer_type", (value) => (text(value) === "SHIP_OWNER" ? "SHIP_OWNER" : "GENERAL")],
        ["business_registration_no", "business_registration_no", nullableText],
        ["representative_name", "representative_name", (value) => text(value)],
        ["company_phone", "company_phone", (value) => text(value)],
        ["company_email", "company_email", (value) => text(value)],
        ["business_category", "business_category", (value) => text(value)],
        ["business_item", "business_item", (value) => text(value)],
        ["tax_category", "tax_category", (value) => text(value)],
        ["bank_account", "bank_account", (value) => text(value)],
        ["invoice_email", "invoice_email", (value) => text(value)],
        ["opening_date", "opening_date", nullableText],
        ["notes", "notes", (value) => text(value)],
      ];
      const assignments: string[] = [];
      const values: unknown[] = [customerId];
      for (const [key, column, normalize] of customerFields) {
        if (hasInput(input, key)) {
          values.push(normalize(input[key]));
          assignments.push(`${column} = $${values.length}`);
        }
      }

      if (assignments.length) {
        values.push(actorUserId);
        await client.query(
          `update master.customers
           set ${assignments.join(", ")},
               updated_at = now(),
               updated_by = $${values.length}
           where id = $1`,
          values,
        );
      }

      if (hasInput(input, "postal_code") || hasInput(input, "address_line_1") || hasInput(input, "address_line_2")) {
        const addressResult = await client.query<{ id: string }>(
          `select id
           from master.customer_addresses
           where customer_id = $1
           order by case when address_type = 'BUSINESS' then 0 else 1 end, updated_at desc
           limit 1`,
          [customerId],
        );
        const address = addressResult.rows[0];
        if (address) {
          const addressAssignments: string[] = [];
          const addressValues: unknown[] = [address.id];
          for (const [key, column] of [
            ["postal_code", "postal_code"],
            ["address_line_1", "address_line_1"],
            ["address_line_2", "address_line_2"],
          ] as const) {
            if (hasInput(input, key)) {
              addressValues.push(text(input[key]));
              addressAssignments.push(`${column} = $${addressValues.length}`);
            }
          }
          addressValues.push(actorUserId);
          await client.query(
            `update master.customer_addresses
             set ${addressAssignments.join(", ")},
                 updated_at = now(),
                 updated_by = $${addressValues.length}
             where id = $1`,
            addressValues,
          );
        } else {
          await client.query(
            `insert into master.customer_addresses (
               id, customer_id, address_type, postal_code, address_line_1, address_line_2, notes, created_by, updated_by
             ) values ($1, $2, 'BUSINESS', $3, $4, $5, '', $6, $6)`,
            [
              crypto.randomUUID(),
              customerId,
              text(input.postal_code),
              text(input.address_line_1),
              text(input.address_line_2),
              actorUserId,
            ],
          );
        }
      }

      if (hasInput(input, "contact_name") || hasInput(input, "contact_phone")) {
        const contactResult = await client.query<{ id: string }>(
          `select id
           from master.customer_contacts
           where customer_id = $1
           order by is_primary desc, updated_at desc
           limit 1`,
          [customerId],
        );
        const contact = contactResult.rows[0];
        if (contact) {
          const contactAssignments: string[] = [];
          const contactValues: unknown[] = [contact.id];
          if (hasInput(input, "contact_name")) {
            contactValues.push(text(input.contact_name));
            contactAssignments.push(`contact_name = $${contactValues.length}`);
          }
          if (hasInput(input, "contact_phone")) {
            contactValues.push(text(input.contact_phone));
            contactAssignments.push(`mobile_phone = $${contactValues.length}`);
          }
          contactValues.push(actorUserId);
          await client.query(
            `update master.customer_contacts
             set ${contactAssignments.join(", ")},
                 updated_at = now(),
                 updated_by = $${contactValues.length}
             where id = $1`,
            contactValues,
          );
        } else {
          await client.query(
            `insert into master.customer_contacts (
               id, customer_id, contact_name, contact_role, department_name, job_title, mobile_phone, office_phone, email,
               is_primary, notes, created_by, updated_by
             ) values ($1, $2, $3, 'STAFF', '', '', $4, '', '', true, '', $5, $5)`,
            [crypto.randomUUID(), customerId, text(input.contact_name), text(input.contact_phone), actorUserId],
          );
        }
      }

      return this.getCustomerById(customerId, client);
    });
  }

  async addContact(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      if (booleanValue(input.is_primary)) {
        await client.query(`update master.customer_contacts set is_primary = false, updated_at = now(), updated_by = $2 where customer_id = $1`, [customerId, actorUserId]);
      }

      const contactId = crypto.randomUUID();
      await client.query(
        `insert into master.customer_contacts (
           id, customer_id, contact_name, contact_role, department_name, job_title, mobile_phone, office_phone, email,
           is_primary, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
        [
          contactId,
          customerId,
          text(input.contact_name),
          text(input.contact_role, "STAFF"),
          text(input.department_name),
          text(input.job_title),
          text(input.mobile_phone),
          text(input.office_phone),
          text(input.email),
          booleanValue(input.is_primary),
          text(input.notes),
          actorUserId,
        ],
      );

      return this.getCustomerById(customerId, client);
    });
  }

  async updateContact(contactId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const contactResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_contacts where id = $1`,
        [contactId],
      );
      const contact = contactResult.rows[0];
      if (!contact) {
        return null;
      }

      const contactFields: Array<[string, string, (value: unknown) => string | boolean]> = [
        ["contact_name", "contact_name", (value) => text(value)],
        ["contact_role", "contact_role", (value) => text(value, "STAFF")],
        ["department_name", "department_name", (value) => text(value)],
        ["job_title", "job_title", (value) => text(value)],
        ["mobile_phone", "mobile_phone", (value) => text(value)],
        ["office_phone", "office_phone", (value) => text(value)],
        ["email", "email", (value) => text(value)],
        ["is_primary", "is_primary", booleanValue],
        ["notes", "notes", (value) => text(value)],
      ];
      const assignments: string[] = [];
      const values: unknown[] = [contactId];
      for (const [key, column, normalize] of contactFields) {
        if (hasInput(input, key)) {
          values.push(normalize(input[key]));
          assignments.push(`${column} = $${values.length}`);
        }
      }

      if (assignments.length) {
        values.push(actorUserId);
        if (booleanValue(input.is_primary)) {
          await client.query(`update master.customer_contacts set is_primary = false, updated_at = now(), updated_by = $2 where customer_id = $1`, [
            contact.customer_id,
            actorUserId,
          ]);
        }
        await client.query(
          `update master.customer_contacts
           set ${assignments.join(", ")},
               updated_by = $${values.length},
               updated_at = now()
           where id = $1`,
          values,
        );
      }

      return this.getCustomerById(contact.customer_id, client);
    });
  }

  async addAddress(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const addressId = crypto.randomUUID();
      await client.query(
        `insert into master.customer_addresses (
           id, customer_id, address_type, postal_code, address_line_1, address_line_2, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [
          addressId,
          customerId,
          text(input.address_type, "BUSINESS"),
          text(input.postal_code),
          text(input.address_line_1),
          text(input.address_line_2),
          text(input.notes),
          actorUserId,
        ],
      );

      return this.getCustomerById(customerId, client);
    });
  }

  async addAsset(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const assetId = crypto.randomUUID();
      await client.query(
        `insert into master.customer_assets (
           id, customer_id, asset_name, asset_type, vessel_type, asset_code, status, registration_no, imo_no, location_description, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, $8, $9, $10, $11, $11)`,
        [
          assetId,
          customerId,
          text(input.asset_name),
          text(input.asset_type, "SITE_EQUIPMENT"),
          text(input.vessel_type),
          text(input.asset_code),
          text(input.registration_no),
          text(input.imo_no),
          text(input.location_description),
          text(input.notes),
          actorUserId,
        ],
      );

      return this.getCustomerById(customerId, client);
    });
  }

  async updateAsset(assetId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const assetResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_assets where id = $1`,
        [assetId],
      );
      const asset = assetResult.rows[0];
      if (!asset) {
        return null;
      }

      const assetFields: Array<[string, string, (value: unknown) => string]> = [
        ["asset_name", "asset_name", (value) => text(value)],
        ["asset_type", "asset_type", (value) => text(value, "SITE_EQUIPMENT")],
        ["vessel_type", "vessel_type", (value) => text(value)],
        ["asset_code", "asset_code", (value) => text(value)],
        ["registration_no", "registration_no", (value) => text(value)],
        ["imo_no", "imo_no", (value) => text(value)],
        ["location_description", "location_description", (value) => text(value)],
        ["notes", "notes", (value) => text(value)],
      ];
      const assignments: string[] = [];
      const values: unknown[] = [assetId];
      for (const [key, column, normalize] of assetFields) {
        if (hasInput(input, key)) {
          values.push(normalize(input[key]));
          assignments.push(`${column} = $${values.length}`);
        }
      }

      if (assignments.length) {
        values.push(actorUserId);
        await client.query(
          `update master.customer_assets
           set ${assignments.join(", ")},
               updated_by = $${values.length},
               updated_at = now()
           where id = $1`,
          values,
        );
      }

      return this.getCustomerById(asset.customer_id, client);
    });
  }

  async deleteAsset(assetId: string) {
    return withTransaction(async (client) => {
      const assetResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_assets where id = $1`,
        [assetId],
      );
      const asset = assetResult.rows[0];
      if (!asset) {
        return null;
      }

      await client.query(`delete from master.customer_equipments where asset_id = $1`, [assetId]);
      await client.query(`delete from master.customer_assets where id = $1`, [assetId]);

      return this.getCustomerById(asset.customer_id, client);
    });
  }

  async addEquipment(assetId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const assetResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_assets where id = $1`,
        [assetId],
      );
      const asset = assetResult.rows[0];
      if (!asset) {
        return null;
      }

      const equipmentId = crypto.randomUUID();
      await client.query(
        `insert into master.customer_equipments (
           id, asset_id, customer_id, equipment_name, equipment_type, status, serial_no, installation_position,
           engine_model_id, gearbox_model_id, manufacturer, model_name, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
        [
          equipmentId,
          assetId,
          asset.customer_id,
          text(input.equipment_name),
          text(input.equipment_type, "OTHER"),
          text(input.serial_no),
          text(input.installation_position),
          nullableText(input.engine_model_id),
          nullableText(input.gearbox_model_id),
          text(input.manufacturer),
          text(input.model_name),
          text(input.notes),
          actorUserId,
        ],
      );

      return this.getCustomerById(asset.customer_id, client);
    });
  }

  async updateEquipment(equipmentId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const equipmentResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_equipments where id = $1`,
        [equipmentId],
      );
      const equipment = equipmentResult.rows[0];
      if (!equipment) {
        return null;
      }

      const equipmentFields: Array<[string, string, (value: unknown) => string | null]> = [
        ["equipment_name", "equipment_name", (value) => text(value)],
        ["equipment_type", "equipment_type", (value) => text(value, "OTHER")],
        ["serial_no", "serial_no", (value) => text(value)],
        ["installation_position", "installation_position", (value) => text(value)],
        ["engine_model_id", "engine_model_id", nullableText],
        ["gearbox_model_id", "gearbox_model_id", nullableText],
        ["manufacturer", "manufacturer", (value) => text(value)],
        ["model_name", "model_name", (value) => text(value)],
        ["notes", "notes", (value) => text(value)],
      ];
      const assignments: string[] = [];
      const values: unknown[] = [equipmentId];
      for (const [key, column, normalize] of equipmentFields) {
        if (hasInput(input, key)) {
          values.push(normalize(input[key]));
          assignments.push(`${column} = $${values.length}`);
        }
      }

      if (assignments.length) {
        values.push(actorUserId);
        await client.query(
          `update master.customer_equipments
           set ${assignments.join(", ")},
               updated_by = $${values.length},
               updated_at = now()
           where id = $1`,
          values,
        );
      }

      return this.getCustomerById(equipment.customer_id, client);
    });
  }

  async deleteEquipment(equipmentId: string) {
    return withTransaction(async (client) => {
      const equipmentResult = await client.query<{ id: string; customer_id: string }>(
        `select id, customer_id from master.customer_equipments where id = $1`,
        [equipmentId],
      );
      const equipment = equipmentResult.rows[0];
      if (!equipment) {
        return null;
      }

      await client.query(`delete from master.customer_equipments where id = $1`, [equipmentId]);

      return this.getCustomerById(equipment.customer_id, client);
    });
  }

  async listEngineModels(search?: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const searchValue = text(search) ? `%${text(search)}%` : null;
    const result = await executor.query<{
      id: string;
      manufacturer: string;
      model_name: string;
      engine_type: string;
      fuel_type: string;
      power_rating: string;
      notes: string;
      updated_at: Date;
    }>(
      `select *
       from master.engine_models
       where $1::text is null
          or manufacturer ilike $1
          or model_name ilike $1
          or engine_type ilike $1
       order by manufacturer asc, model_name asc
       limit 100`,
      [searchValue],
    );
    return result.rows.map(mapEngineModel);
  }

  async createEngineModel(input: Record<string, unknown>, actorUserId: string) {
    const id = crypto.randomUUID();
    await query(
      `insert into master.engine_models (
         id, manufacturer, model_name, engine_type, fuel_type, power_rating, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      [
        id,
        text(input.manufacturer),
        text(input.model_name),
        text(input.engine_type),
        text(input.fuel_type),
        text(input.power_rating),
        text(input.notes),
        actorUserId,
      ],
    );
    const models = await this.listEngineModels(text(input.model_name));
    return models.find((item) => item.id === id) || null;
  }

  async listGearboxModels(search?: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const searchValue = text(search) ? `%${text(search)}%` : null;
    const result = await executor.query<{
      id: string;
      manufacturer: string;
      model_name: string;
      gear_type: string;
      gear_ratio: string;
      torque_rating: string;
      notes: string;
      updated_at: Date;
    }>(
      `select *
       from master.gearbox_models
       where $1::text is null
          or manufacturer ilike $1
          or model_name ilike $1
          or gear_type ilike $1
       order by manufacturer asc, model_name asc
       limit 100`,
      [searchValue],
    );
    return result.rows.map(mapGearboxModel);
  }

  async createGearboxModel(input: Record<string, unknown>, actorUserId: string) {
    const id = crypto.randomUUID();
    await query(
      `insert into master.gearbox_models (
         id, manufacturer, model_name, gear_type, gear_ratio, torque_rating, notes, created_by, updated_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      [
        id,
        text(input.manufacturer),
        text(input.model_name),
        text(input.gear_type),
        text(input.gear_ratio),
        text(input.torque_rating),
        text(input.notes),
        actorUserId,
      ],
    );
    const models = await this.listGearboxModels(text(input.model_name));
    return models.find((item) => item.id === id) || null;
  }

  async listEquipmentMasterOptions(optionType?: string) {
    const type = text(optionType);
    const result = await query<{
      id: string;
      option_type: string;
      option_value: string;
    }>(
      `select id, option_type, option_value
       from master.equipment_master_options
       where status = 'ACTIVE'
         and ($1::text = '' or option_type = $1)
       order by option_type asc, option_value asc`,
      [type],
    );
    return result.rows.map(mapEquipmentMasterOption);
  }

  async createFile(input: Record<string, unknown>, actorUserId: string) {
    const fileId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const contentText = text(input.ocr_source_text) || Buffer.from(text(input.content_base64), "base64").toString("utf8");
    const originalName = text(input.original_name, `file-${fileId}.txt`);
    const storedPath = `customer/${new Date().toISOString().slice(0, 7).replace("-", "/")}/${fileId}-${originalName}`;

    await query(
      `insert into files.file_objects (
         id, domain, entity_type, entity_id, original_name, stored_path, mime_type, size_bytes, sha256, latest_version,
         scan_status, retention_class, metadata_json, uploaded_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, 'PENDING', 'STANDARD', $10::jsonb, $11)`,
      [
        fileId,
        text(input.domain, "customer"),
        text(input.entity_type, "business_license"),
        nullableText(input.entity_id),
        originalName,
        storedPath,
        text(input.mime_type, "text/plain"),
        Number(input.size_bytes || Buffer.byteLength(contentText || "", "utf8")),
        text(input.sha256, `mock-${fileId}`),
        JSON.stringify({
          ocr_source_text: contentText,
          upload_note: text(input.upload_note),
        }),
        actorUserId,
      ],
    );

    await query(
      `insert into files.file_versions (
         id, file_id, version, original_name, mime_type, size_bytes, sha256, stored_path, content_text, uploaded_by
       ) values ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9)`,
      [
        versionId,
        fileId,
        originalName,
        text(input.mime_type, "text/plain"),
        Number(input.size_bytes || Buffer.byteLength(contentText || "", "utf8")),
        text(input.sha256, `mock-${fileId}`),
        storedPath,
        contentText,
        actorUserId,
      ],
    );

    const result = await query<{
      id: string;
      domain: string;
      entity_type: string;
      entity_id: string | null;
      original_name: string;
      stored_path: string;
      mime_type: string;
      size_bytes: string | number;
      scan_status: string;
      retention_class: string;
      metadata_json: Record<string, unknown>;
      uploaded_at: Date;
    }>(`select * from files.file_objects where id = $1`, [fileId]);
    return mapFile(result.rows[0]);
  }

  async linkFile(
    input: { fileId: string; domain: string; entityType: string; entityId: string },
    actorUserId: string,
    client?: DbExecutor,
  ) {
    const executor: DbExecutor = client ?? { query };
    const linkId = crypto.randomUUID();

    await executor.query(
      `insert into files.file_links (
         id, file_id, domain, entity_type, entity_id, created_by
       ) values ($1, $2, $3, $4, $5, $6)`,
      [linkId, input.fileId, input.domain, input.entityType, input.entityId, actorUserId],
    );

    await executor.query(
      `update files.file_objects
       set entity_id = $2
       where id = $1`,
      [input.fileId, input.entityId],
    );

    return {
      id: linkId,
      fileId: input.fileId,
      entityType: input.entityType,
      entityId: input.entityId,
    };
  }

  async extractBusinessLicense(customerId: string, input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      const fileId = nullableText(input.file_id);
      const fileQuery = fileId
        ? await client.query<{
            id: string;
            metadata_json: Record<string, unknown>;
            content_text: string;
          }>(
            `select f.id, f.metadata_json, coalesce(v.content_text, '') as content_text
             from files.file_objects f
             left join files.file_versions v on v.file_id = f.id and v.version = f.latest_version
             where f.id = $1`,
            [fileId],
          )
        : await client.query<{
            id: string;
            metadata_json: Record<string, unknown>;
            content_text: string;
          }>(
            `select f.id, f.metadata_json, coalesce(v.content_text, '') as content_text
             from files.file_objects f
             join files.file_links l on l.file_id = f.id
             left join files.file_versions v on v.file_id = f.id and v.version = f.latest_version
             where l.entity_type = 'customer'
               and l.entity_id = $1
             order by f.uploaded_at desc
             limit 1`,
            [customerId],
          );

      const file = fileQuery.rows[0];
      const ocrSourceText = text(input.ocr_source_text) || text(file?.metadata_json?.ocr_source_text) || text(file?.content_text);
      const extracted = extractBusinessLicenseFields(ocrSourceText);
      const customer = await this.getCustomerById(customerId, client);

      const extractionId = crypto.randomUUID();
      await client.query(
        `insert into master.customer_registration_extractions (
           id, customer_id, file_id, status, extractor_name, extracted_registration_no, extracted_company_name,
           extracted_representative_name, extracted_address, extracted_business_category, extracted_business_item,
           extracted_opening_date, confirmed_snapshot, created_by
         ) values ($1, $2, $3, $4, 'mock-business-license-ocr', $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)`,
        [
          extractionId,
          customerId,
          file?.id || null,
          ocrSourceText ? "READY" : "NO_TEXT",
          extracted.registrationNo,
          extracted.companyName,
          extracted.representativeName,
          extracted.address,
          extracted.businessCategory,
          extracted.businessItem,
          extracted.openingDate,
          JSON.stringify({
            customer_name: customer?.customer.customerName || "",
            business_registration_no: customer?.customer.businessRegistrationNo || "",
            representative_name: customer?.customer.representativeName || "",
            company_email: customer?.customer.companyEmail || "",
          }),
          actorUserId,
        ],
      );

      const result = await client.query(
        `select *
         from master.customer_registration_extractions
         where id = $1`,
        [extractionId],
      );

      return mapExtraction(result.rows[0]);
    });
  }
}

export const customerService = new CustomerService();
