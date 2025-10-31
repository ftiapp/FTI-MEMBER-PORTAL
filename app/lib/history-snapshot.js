/**
 * History Snapshot Utility
 * Creates snapshots of membership applications in history tables
 */

/**
 * Create a complete snapshot of an OC application
 * @param {Object} connection - Database connection
 * @param {number} membershipId - ID of the OC application
 * @param {string} reason - Reason for snapshot (rejection, resubmission, manual)
 * @param {number} snapshotBy - User ID who triggered the snapshot
 * @returns {Promise<number>} - history_id of the created snapshot
 */
export async function createOCSnapshot(connection, membershipId, reason = "rejection", snapshotBy) {
  // Get main record
  const [mainRecords] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Main WHERE id = ?`,
    [membershipId],
  );

  if (!mainRecords.length) {
    throw new Error(`OC application ${membershipId} not found`);
  }

  const main = mainRecords[0];

  // Insert main history
  const [mainResult] = await connection.execute(
    `INSERT INTO MemberRegist_Reject_OC_Main_History (
      original_id, user_id, member_code, company_name_th, company_name_en, tax_id,
      company_email, company_phone, company_phone_extension, status, factory_type,
      number_of_employees, registered_capital, production_capacity_value, production_capacity_unit,
      sales_domestic, sales_export, shareholder_thai_percent, shareholder_foreign_percent,
      revenue_last_year, revenue_previous_year, rejection_reason, admin_note,
      admin_note_by, admin_note_at, snapshot_reason, snapshot_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      main.id,
      main.user_id,
      main.member_code,
      main.company_name_th,
      main.company_name_en,
      main.tax_id,
      main.company_email,
      main.company_phone,
      main.company_phone_extension,
      main.status,
      main.factory_type,
      main.number_of_employees,
      main.registered_capital,
      main.production_capacity_value,
      main.production_capacity_unit,
      main.sales_domestic,
      main.sales_export,
      main.shareholder_thai_percent,
      main.shareholder_foreign_percent,
      main.revenue_last_year,
      main.revenue_previous_year,
      main.rejection_reason,
      main.admin_note,
      main.admin_note_by,
      main.admin_note_at,
      reason,
      snapshotBy,
    ],
  );

  const historyId = mainResult.insertId;

  // Copy representatives
  const [representatives] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?`,
    [membershipId],
  );

  for (const rep of representatives) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_Representatives_History (
        main_history_id, original_main_id, prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        rep.prename_th,
        rep.prename_en,
        rep.prename_other,
        rep.prename_other_en,
        rep.first_name_th,
        rep.last_name_th,
        rep.first_name_en,
        rep.last_name_en,
        rep.position,
        rep.email,
        rep.phone,
      ],
    );
  }

  // Copy products
  const [products] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?`,
    [membershipId],
  );

  for (const product of products) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_Products_History (
        main_history_id, original_main_id, name_th, name_en
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, product.name_th || null, product.name_en || null],
    );
  }

  // Copy business types
  const [businessTypes] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?`,
    [membershipId],
  );

  for (const bt of businessTypes) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_BusinessTypes_History (
        main_history_id, original_main_id, business_type
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, bt.business_type],
    );
  }

  // Copy business type other
  const [businessTypeOther] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?`,
    [membershipId],
  );

  if (businessTypeOther.length > 0) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_BusinessTypeOther_History (
        main_history_id, original_main_id, detail
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, businessTypeOther[0].detail || null],
    );
  }

  // Copy industry groups
  const [industryGroups] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?`,
    [membershipId],
  );

  for (const ig of industryGroups) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_IndustryGroups_History (
        main_history_id, original_main_id, industry_group_id, industry_group_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, ig.industry_group_id || null, ig.industry_group_name || null],
    );
  }

  // Copy addresses
  const [addresses] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Address WHERE main_id = ?`,
    [membershipId],
  );

  for (const addr of addresses) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_Address_History (
        main_history_id, original_main_id, building, address_type, address_number, moo, soi, street,
        sub_district, district, province, postal_code, phone, phone_extension, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        addr.building || null,
        addr.address_type || null,
        addr.address_number || null,
        addr.moo || null,
        addr.soi || null,
        addr.street || null,
        addr.sub_district || null,
        addr.district || null,
        addr.province || null,
        addr.postal_code || null,
        addr.phone || null,
        addr.phone_extension || null,
        addr.email || null,
        addr.website || null,
      ],
    );
  }

  // Copy province chapters
  const [provinceChapters] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?`,
    [membershipId],
  );

  for (const pc of provinceChapters) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_ProvinceChapters_History (
        main_history_id, original_main_id, province_chapter_id, province_chapter_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, pc.province_chapter_id || null, pc.province_chapter_name || null],
    );
  }

  // Copy contact persons
  const [contactPersons] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ?`,
    [membershipId],
  );

  for (const cp of contactPersons) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_ContactPerson_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone,
        type_contact_id, type_contact_name, type_contact_other_detail,
        phone_extension
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        cp.prename_th || null,
        cp.prename_en || null,
        cp.prename_other || null,
        cp.prename_other_en || null,
        cp.first_name_th || null,
        cp.last_name_th || null,
        cp.first_name_en || null,
        cp.last_name_en || null,
        cp.position || null,
        cp.email || null,
        cp.phone || null,
        cp.type_contact_id || null,
        cp.type_contact_name || null,
        cp.type_contact_other_detail || null,
        cp.phone_extension || null,
      ],
    );
  }

  // Copy documents
  const [documents] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?`,
    [membershipId],
  );

  for (const doc of documents) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_Documents_History (
        main_history_id, original_main_id,
        document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        doc.document_type || null,
        doc.file_name || null,
        doc.file_path || null,
        doc.file_size || null,
        doc.mime_type || null,
        doc.cloudinary_id || null,
        doc.cloudinary_url || null,
      ],
    );
  }

  // Copy signature names
  const [signatures] = await connection.execute(
    `SELECT * FROM MemberRegist_OC_Signature_Name WHERE main_id = ?`,
    [membershipId],
  );

  for (const sig of signatures) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_OC_Signature_Name_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position_th, position_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        sig.prename_th || null,
        sig.prename_en || null,
        sig.prename_other || null,
        sig.prename_other_en || null,
        sig.first_name_th || null,
        sig.last_name_th || null,
        sig.first_name_en || null,
        sig.last_name_en || null,
        sig.position_th || null,
        sig.position_en || null,
      ],
    );
  }

  return historyId;
}

/**
 * Create a complete snapshot of an AC application
 */
export async function createACSnapshot(connection, membershipId, reason = "rejection", snapshotBy) {
  const [mainRecords] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Main WHERE id = ?`,
    [membershipId],
  );

  if (!mainRecords.length) {
    throw new Error(`AC application ${membershipId} not found`);
  }

  const main = mainRecords[0];

  const [mainResult] = await connection.execute(
    `INSERT INTO MemberRegist_Reject_AC_Main_History (
      original_id, user_id, member_code, company_name_th, company_name_en, tax_id,
      company_email, company_phone, company_phone_extension, status, number_of_employees,
      registered_capital, sales_domestic, sales_export, shareholder_thai_percent,
      shareholder_foreign_percent, revenue_last_year, revenue_previous_year,
      rejection_reason, admin_note, snapshot_reason, snapshot_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      main.id,
      main.user_id,
      main.member_code,
      main.company_name_th,
      main.company_name_en,
      main.tax_id,
      main.company_email,
      main.company_phone,
      main.company_phone_extension,
      main.status,
      main.number_of_employees,
      main.registered_capital,
      main.sales_domestic,
      main.sales_export,
      main.shareholder_thai_percent,
      main.shareholder_foreign_percent,
      main.revenue_last_year,
      main.revenue_previous_year,
      main.rejection_reason,
      main.admin_note,
      reason,
      snapshotBy,
    ],
  );

  const historyId = mainResult.insertId;

  // Copy child tables (similar pattern as OC)
  const [representatives] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Representatives WHERE main_id = ?`,
    [membershipId],
  );

  for (const rep of representatives) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_Representatives_History (
        main_history_id, original_main_id, prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        rep.prename_th,
        rep.prename_en,
        rep.prename_other,
        rep.prename_other_en,
        rep.first_name_th,
        rep.last_name_th,
        rep.first_name_en,
        rep.last_name_en,
        rep.position,
        rep.email,
        rep.phone,
      ],
    );
  }

  // Copy products, business types, etc. (similar pattern)
  const [products] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Products WHERE main_id = ?`,
    [membershipId],
  );

  for (const product of products) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_Products_History (
        main_history_id, original_main_id, name_th, name_en
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, product.name_th || null, product.name_en || null],
    );
  }

  const [businessTypes] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?`,
    [membershipId],
  );

  for (const bt of businessTypes) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_BusinessTypes_History (
        main_history_id, original_main_id, business_type
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, bt.business_type],
    );
  }

  const [businessTypeOther] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?`,
    [membershipId],
  );

  if (businessTypeOther.length > 0) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_BusinessTypeOther_History (
        main_history_id, original_main_id, detail
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, businessTypeOther[0].detail || null],
    );
  }

  const [industryGroups] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?`,
    [membershipId],
  );

  for (const ig of industryGroups) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_IndustryGroups_History (
        main_history_id, original_main_id, industry_group_id, industry_group_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, ig.industry_group_id || null, ig.industry_group_name || null],
    );
  }

  // Copy addresses
  const [acAddresses] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Address WHERE main_id = ?`,
    [membershipId],
  );

  for (const addr of acAddresses) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_Address_History (
        main_history_id, original_main_id, building, address_type, address_number, moo, soi, street,
        sub_district, district, province, postal_code, phone, phone_extension, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        addr.building || null,
        addr.address_type || null,
        addr.address_number || null,
        addr.moo || null,
        addr.soi || null,
        addr.street || null,
        addr.sub_district || null,
        addr.district || null,
        addr.province || null,
        addr.postal_code || null,
        addr.phone || null,
        addr.phone_extension || null,
        addr.email || null,
        addr.website || null,
      ],
    );
  }

  const [provinceChapters] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?`,
    [membershipId],
  );

  for (const pc of provinceChapters) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_ProvinceChapters_History (
        main_history_id, original_main_id, province_chapter_id, province_chapter_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, pc.province_chapter_id || null, pc.province_chapter_name || null],
    );
  }

  // Copy contact persons
  const [contactPersons] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_ContactPerson WHERE main_id = ?`,
    [membershipId],
  );

  for (const cp of contactPersons) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_ContactPerson_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone,
        type_contact_id, type_contact_name, type_contact_other_detail,
        phone_extension
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        cp.prename_th || null,
        cp.prename_en || null,
        cp.prename_other || null,
        cp.prename_other_en || null,
        cp.first_name_th || null,
        cp.last_name_th || null,
        cp.first_name_en || null,
        cp.last_name_en || null,
        cp.position || null,
        cp.email || null,
        cp.phone || null,
        cp.type_contact_id || null,
        cp.type_contact_name || null,
        cp.type_contact_other_detail || null,
        cp.phone_extension || null,
      ],
    );
  }

  // Copy documents
  const [documents] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Documents WHERE main_id = ?`,
    [membershipId],
  );

  for (const doc of documents) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_Documents_History (
        main_history_id, original_main_id,
        document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        doc.document_type || null,
        doc.file_name || null,
        doc.file_path || null,
        doc.file_size || null,
        doc.mime_type || null,
        doc.cloudinary_id || null,
        doc.cloudinary_url || null,
      ],
    );
  }

  // Copy signature names
  const [signatures] = await connection.execute(
    `SELECT * FROM MemberRegist_AC_Signature_Name WHERE main_id = ?`,
    [membershipId],
  );

  for (const sig of signatures) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AC_Signature_Name_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position_th, position_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        sig.prename_th || null,
        sig.prename_en || null,
        sig.prename_other || null,
        sig.prename_other_en || null,
        sig.first_name_th || null,
        sig.last_name_th || null,
        sig.first_name_en || null,
        sig.last_name_en || null,
        sig.position_th || null,
        sig.position_en || null,
      ],
    );
  }

  return historyId;
}

/**
 * Create a complete snapshot of an AM application
 */
export async function createAMSnapshot(connection, membershipId, reason = "rejection", snapshotBy) {
  const [mainRecords] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Main WHERE id = ?`,
    [membershipId],
  );

  if (!mainRecords.length) {
    throw new Error(`AM application ${membershipId} not found`);
  }

  const main = mainRecords[0];

  const [mainResult] = await connection.execute(
    `INSERT INTO MemberRegist_Reject_AM_Main_History (
      original_id, user_id, member_code, company_name_th, company_name_en, tax_id,
      company_email, company_phone, company_phone_extension, status, number_of_employees,
      registered_capital, rejection_reason, admin_note, snapshot_reason, snapshot_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      main.id,
      main.user_id,
      main.member_code,
      main.company_name_th,
      main.company_name_en,
      main.tax_id,
      main.company_email,
      main.company_phone,
      main.company_phone_extension,
      main.status,
      main.number_of_employees,
      main.registered_capital,
      main.rejection_reason,
      main.admin_note,
      reason,
      snapshotBy,
    ],
  );

  const historyId = mainResult.insertId;

  // Copy child tables
  const [representatives] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?`,
    [membershipId],
  );

  for (const rep of representatives) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_Representatives_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        rep.prename_th || null,
        rep.prename_en || null,
        rep.prename_other || null,
        rep.prename_other_en || null,
        rep.first_name_th || null,
        rep.last_name_th || null,
        rep.first_name_en || null,
        rep.last_name_en || null,
        rep.position || null,
        rep.email || null,
        rep.phone || null,
      ],
    );
  }

  // Copy addresses
  const [amAddresses] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Address WHERE main_id = ?`,
    [membershipId],
  );

  for (const addr of amAddresses) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_Address_History (
        main_history_id, original_main_id, building, address_type, address_number, moo, soi, street,
        sub_district, district, province, postal_code, phone, phone_extension, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        addr.building || null,
        addr.address_type || null,
        addr.address_number || null,
        addr.moo || null,
        addr.soi || null,
        addr.street || null,
        addr.sub_district || null,
        addr.district || null,
        addr.province || null,
        addr.postal_code || null,
        addr.phone || null,
        addr.phone_extension || null,
        addr.email || null,
        addr.website || null,
      ],
    );
  }

  const [products] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`,
    [membershipId],
  );

  for (const product of products) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_Products_History (
        main_history_id, original_main_id, name_th, name_en
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, product.name_th || null, product.name_en || null],
    );
  }

  const [businessTypes] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`,
    [membershipId],
  );

  for (const bt of businessTypes) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_BusinessTypes_History (
        main_history_id, original_main_id, business_type
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, bt.business_type],
    );
  }

  const [businessTypeOther] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`,
    [membershipId],
  );

  if (businessTypeOther.length > 0) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_BusinessTypeOther_History (
        main_history_id, original_main_id, detail
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, businessTypeOther[0].detail || null],
    );
  }

  // Copy contact persons
  const [contactPersons] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ?`,
    [membershipId],
  );

  for (const cp of contactPersons) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_ContactPerson_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone,
        type_contact_id, type_contact_name, type_contact_other_detail,
        phone_extension
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        cp.prename_th || null,
        cp.prename_en || null,
        cp.prename_other || null,
        cp.prename_other_en || null,
        cp.first_name_th || null,
        cp.last_name_th || null,
        cp.first_name_en || null,
        cp.last_name_en || null,
        cp.position || null,
        cp.email || null,
        cp.phone || null,
        cp.type_contact_id || null,
        cp.type_contact_name || null,
        cp.type_contact_other_detail || null,
        cp.phone_extension || null,
      ],
    );
  }

  // Copy documents
  const [documents] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?`,
    [membershipId],
  );

  for (const doc of documents) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_Documents_History (
        main_history_id, original_main_id,
        document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        doc.document_type || null,
        doc.file_name || null,
        doc.file_path || null,
        doc.file_size || null,
        doc.mime_type || null,
        doc.cloudinary_id || null,
        doc.cloudinary_url || null,
      ],
    );
  }

  // Copy signature names
  const [signatures] = await connection.execute(
    `SELECT * FROM MemberRegist_AM_Signature_Name WHERE main_id = ?`,
    [membershipId],
  );

  for (const sig of signatures) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_AM_Signature_Name_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position_th, position_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        sig.prename_th || null,
        sig.prename_en || null,
        sig.prename_other || null,
        sig.prename_other_en || null,
        sig.first_name_th || null,
        sig.last_name_th || null,
        sig.first_name_en || null,
        sig.last_name_en || null,
        sig.position_th || null,
        sig.position_en || null,
      ],
    );
  }

  return historyId;
}

/**
 * Create a complete snapshot of an IC application
 */
export async function createICSnapshot(connection, membershipId, reason = "rejection", snapshotBy) {
  const [mainRecords] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Main WHERE id = ?`,
    [membershipId],
  );

  if (!mainRecords.length) {
    throw new Error(`IC application ${membershipId} not found`);
  }

  const main = mainRecords[0];

  const [mainResult] = await connection.execute(
    `INSERT INTO MemberRegist_Reject_IC_Main_History (
      original_id, user_id, member_code, prename_th, prename_en, prename_other,
      first_name_th, last_name_th, first_name_en, last_name_en, id_card_number,
      email, phone, status, rejection_reason, admin_note, snapshot_reason, snapshot_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      main.id,
      main.user_id,
      main.member_code,
      main.prename_th,
      main.prename_en,
      main.prename_other,
      main.first_name_th,
      main.last_name_th,
      main.first_name_en,
      main.last_name_en,
      main.id_card_number,
      main.email,
      main.phone,
      main.status,
      main.rejection_reason,
      main.admin_note,
      reason,
      snapshotBy,
    ],
  );

  const historyId = mainResult.insertId;

  // Copy addresses
  const [icAddresses] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Address WHERE main_id = ?`,
    [membershipId],
  );

  for (const addr of icAddresses) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_Address_History (
        main_history_id, original_main_id, building, address_type, address_number, moo, soi, street,
        sub_district, district, province, postal_code, phone, phone_extension, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        addr.building || null,
        addr.address_type || null,
        addr.address_number || null,
        addr.moo || null,
        addr.soi || null,
        addr.street || null,
        addr.sub_district || null,
        addr.district || null,
        addr.province || null,
        addr.postal_code || null,
        addr.phone || null,
        addr.phone_extension || null,
        addr.email || null,
        addr.website || null,
      ],
    );
  }

  // Copy products
  const [products] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Products WHERE main_id = ?`,
    [membershipId],
  );

  for (const product of products) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_Products_History (
        main_history_id, original_main_id, name_th, name_en
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, product.name_th || null, product.name_en || null],
    );
  }

  const [businessTypes] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_BusinessTypes WHERE main_id = ?`,
    [membershipId],
  );

  for (const bt of businessTypes) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_BusinessTypes_History (
        main_history_id, original_main_id, business_type
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, bt.business_type],
    );
  }

  const [businessTypeOther] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_BusinessTypeOther WHERE main_id = ?`,
    [membershipId],
  );

  if (businessTypeOther.length > 0) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_BusinessTypeOther_History (
        main_history_id, original_main_id, detail
      ) VALUES (?, ?, ?)`,
      [historyId, membershipId, businessTypeOther[0].other_type || null],
    );
  }

  // Copy representatives
  const [representatives] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Representatives WHERE main_id = ?`,
    [membershipId],
  );

  for (const rep of representatives) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_Representatives_History (
        main_history_id, original_main_id, prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        rep.prename_th || null,
        rep.prename_en || null,
        rep.prename_other || null,
        rep.prename_other_en || null,
        rep.first_name_th || null,
        rep.last_name_th || null,
        rep.first_name_en || null,
        rep.last_name_en || null,
        rep.position || null,
        rep.email || null,
        rep.phone || null,
      ],
    );
  }

  // Copy industry groups
  const [industryGroups] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_IndustryGroups WHERE main_id = ?`,
    [membershipId],
  );

  for (const ig of industryGroups) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_IndustryGroups_History (
        main_history_id, original_main_id, industry_group_id, industry_group_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, ig.industry_group_id || null, ig.industry_group_name || null],
    );
  }

  // Copy province chapters
  const [provinceChapters] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_ProvinceChapters WHERE main_id = ?`,
    [membershipId],
  );

  for (const pc of provinceChapters) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_ProvinceChapters_History (
        main_history_id, original_main_id, province_chapter_id, province_chapter_name
      ) VALUES (?, ?, ?, ?)`,
      [historyId, membershipId, pc.province_chapter_id || null, pc.province_chapter_name || null],
    );
  }

  // Copy documents
  const [documents] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Documents WHERE main_id = ?`,
    [membershipId],
  );

  for (const doc of documents) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_Documents_History (
        main_history_id, original_main_id,
        document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        doc.document_type || null,
        doc.file_name || null,
        doc.file_path || null,
        doc.file_size || null,
        doc.mime_type || null,
        doc.cloudinary_id || null,
        doc.cloudinary_url || null,
      ],
    );
  }

  // Copy signature names
  const [signatures] = await connection.execute(
    `SELECT * FROM MemberRegist_IC_Signature_Name WHERE main_id = ?`,
    [membershipId],
  );

  for (const sig of signatures) {
    await connection.execute(
      `INSERT INTO MemberRegist_Reject_IC_SignatureName_History (
        main_history_id, original_main_id,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th, first_name_en, last_name_en,
        position_th, position_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        membershipId,
        sig.prename_th || null,
        sig.prename_en || null,
        sig.prename_other || null,
        sig.prename_other_en || null,
        sig.first_name_th || null,
        sig.last_name_th || null,
        sig.first_name_en || null,
        sig.last_name_en || null,
        sig.position_th || null,
        sig.position_en || null,
      ],
    );
  }

  return historyId;
}

/**
 * Create snapshot based on membership type
 */
export async function createSnapshot(
  connection,
  membershipType,
  membershipId,
  reason = "rejection",
  snapshotBy,
) {
  switch (membershipType) {
    case "oc":
      return await createOCSnapshot(connection, membershipId, reason, snapshotBy);
    case "ac":
      return await createACSnapshot(connection, membershipId, reason, snapshotBy);
    case "am":
      return await createAMSnapshot(connection, membershipId, reason, snapshotBy);
    case "ic":
      return await createICSnapshot(connection, membershipId, reason, snapshotBy);
    default:
      throw new Error(`Unknown membership type: ${membershipType}`);
  }
}
