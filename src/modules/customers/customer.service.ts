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
    const result = await executor.query<{
      id: string;
      customer_no: string;
      customer_name: string;
      customer_type: "SHIP_OWNER" | "GENERAL";
      status: "ACTIVE" | "INACTIVE";
      business_registration_no: string | null;
      representative_name: string | null;
      company_phone: string;
      company_email: string;
      primary_contact_name: string | null;
      primary_contact_phone: string | null;
      asset_count: number;
      equipment_count: number;
      updated_at: Date;
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
         (
           select count(*)::int
           from master.customer_assets a
           where a.customer_id = c.id
         ) as asset_count,
         (
           select count(*)::int
           from master.customer_equipments e
           where e.customer_id = c.id
         ) as equipment_count,
         c.updated_at
       from master.customers c
       where (
         $1::text is null
         or c.customer_name ilike $1
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
       limit 100`,
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
           company_phone, company_email, business_category, business_item, opening_date, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
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
           id, customer_id, asset_name, asset_type, asset_code, status, registration_no, imo_no, location_description, notes, created_by, updated_by
         ) values ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7, $8, $9, $10, $10)`,
        [
          assetId,
          customerId,
          text(input.asset_name),
          text(input.asset_type, "SITE_EQUIPMENT"),
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
