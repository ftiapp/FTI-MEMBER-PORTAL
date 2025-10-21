import React, { useEffect, useState } from "react";

const TH_TO_EN_PRENAME = {
  นาย: "Mr.",
  นาง: "Mrs.",
  นางสาว: "Ms.",
  อื่นๆ: "Other",
};

const EN_TO_TH_PRENAME = {
  "Mr.": "นาย",
  "Mrs.": "นาง",
  "Ms.": "นางสาว",
  Other: "อื่นๆ",
};

const ContactPersonSection = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editData, setEditData] = useState({});

  // Handle both single contact person and array of contact persons
  const initialContacts = () => {
    // Use only the array form; do not auto-fallback from single contactPerson
    // to prevent UI from re-populating after deletion when table is empty
    return Array.isArray(application?.contactPersons) ? [...application.contactPersons] : [];
  };
  const [contacts, setContacts] = useState(initialContacts());
  const [contactTypes, setContactTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(null);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { index, name }

  useEffect(() => {
    if (!isEditing) {
      setContacts(initialContacts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application]);

  // Load contact types for dropdown
  useEffect(() => {
    let active = true;
    async function loadTypes() {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const res = await fetch("/api/member/contact-person-types");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "โหลดประเภทผู้ติดต่อไม่สำเร็จ");
        if (active) setContactTypes(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        if (active) setTypesError(e.message || "เกิดข้อผิดพลาดในการโหลดประเภทผู้ติดต่อ");
      } finally {
        if (active) setTypesLoading(false);
      }
    }
    loadTypes();
    return () => {
      active = false;
    };
  }, []);

  // Always show section, even if no contacts (allow adding)

  const handleEdit = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    const contact = contacts[index];
    // Normalize type_contact_id to string for dropdown matching
    const normalized = {
      ...contact,
      // support both snake_case and camelCase, normalize both to string
      type_contact_id:
        contact.type_contact_id != null && contact.type_contact_id !== ""
          ? String(contact.type_contact_id)
          : contact.typeContactId != null && contact.typeContactId !== ""
            ? String(contact.typeContactId)
            : "",
      typeContactId:
        contact.typeContactId != null && contact.typeContactId !== ""
          ? String(contact.typeContactId)
          : contact.type_contact_id != null && contact.type_contact_id !== ""
            ? String(contact.type_contact_id)
            : "",
    };
    setEditData(normalized);
  };

  // When contact types are loaded, backfill missing id or name in editData for correct dropdown display
  useEffect(() => {
    if (!isEditing || editingIndex < 0) return;
    if (!contactTypes || contactTypes.length === 0) return;
    const id = editData.type_contact_id ?? editData.typeContactId ?? "";
    const name = editData.type_contact_name ?? editData.typeContactName ?? "";
    // If id missing but we have a name, try to find the id
    if ((!id || String(id).trim() === "") && name) {
      const found = contactTypes.find(
        (t) => t.type_name_th === name || t.type_name_en === name || t.type_code === name,
      );
      if (found) {
        setEditData((prev) => ({
          ...prev,
          type_contact_id: String(found.id),
          typeContactId: String(found.id),
        }));
      }
    }
    // If id exists but name missing, derive name for display
    if (id && (!name || String(name).trim() === "")) {
      const found = contactTypes.find((t) => String(t.id) === String(id));
      if (found) {
        setEditData((prev) => ({
          ...prev,
          type_contact_name: found.type_name_th,
          typeContactName: found.type_name_th,
        }));
      }
    }
  }, [
    isEditing,
    editingIndex,
    contactTypes,
    editData.type_contact_id,
    editData.typeContactId,
    editData.type_contact_name,
    editData.typeContactName,
  ]);

  const handleAdd = () => {
    // Default blank contact structure (snake_case preferred for backend)
    const newContact = {
      prename_th: "",
      prename_en: "",
      prename_other: "",
      prename_other_en: "",
      first_name_th: "",
      last_name_th: "",
      first_name_en: "",
      last_name_en: "",
      position: "",
      email: "",
      phone: "",
      phone_extension: "",
      type_contact_id: "",
      type_contact_name: "",
      type_contact_other_detail: "",
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    setIsEditing(true);
    setEditingIndex(updated.length - 1);
    setEditData({ ...newContact });
  };

  const handleSave = async () => {
    try {
      // Create a copy of the contact persons array
      const updatedContactPersons = [...contacts];

      // Update the specific contact person being edited
      if (editingIndex >= 0 && editingIndex < updatedContactPersons.length) {
        // If type_contact_id set, populate type_contact_name from loaded types
        const draft = { ...editData };

        // Normalize and derive name from id if available
        const typeId = draft.type_contact_id ?? draft.typeContactId;
        if (typeId && contactTypes.length) {
          const found = contactTypes.find((t) => String(t.id) === String(typeId));
          if (found) {
            draft.type_contact_id = String(typeId);
            draft.type_contact_name = found.type_name_th;
            // If not OTHER, clear other detail
            if (found.type_code !== "OTHER") {
              draft.type_contact_other_detail = "";
            }
          }
        }
        updatedContactPersons[editingIndex] = draft;
      }

      // Transform to API expected keys (camelCase) before sending
      const payload = updatedContactPersons.map((cp) => ({
        prenameTh: cp.prename_th ?? cp.prenameTh ?? "",
        prenameEn: cp.prename_en ?? cp.prenameEn ?? "",
        prenameOther: cp.prename_other ?? cp.prenameOther ?? "",
        prenameOtherEn: cp.prename_other_en ?? cp.prenameOtherEn ?? "",
        firstNameTh: cp.first_name_th ?? cp.firstNameTh ?? "",
        lastNameTh: cp.last_name_th ?? cp.lastNameTh ?? "",
        firstNameEn: cp.first_name_en ?? cp.firstNameEn ?? "",
        lastNameEn: cp.last_name_en ?? cp.lastNameEn ?? "",
        position: cp.position ?? "",
        email: cp.email ?? "",
        phone: cp.phone ?? "",
        phoneExtension: cp.phone_extension ?? cp.phoneExtension ?? "",
        typeContactId:
          cp.type_contact_id != null && String(cp.type_contact_id).trim() !== ""
            ? String(cp.type_contact_id)
            : null,
        typeContactName: cp.type_contact_name ?? cp.typeContactName ?? "",
        typeContactOtherDetail: cp.type_contact_other_detail ?? cp.typeContactOtherDetail ?? "",
      }));

      // Send the entire updated array to the backend
      await onUpdate("contactPersons", payload);
      // Update local state so UI reflects immediately
      setContacts(updatedContactPersons);
      setIsEditing(false);
      setEditingIndex(-1);
    } catch (error) {
      console.error("Error updating contact person:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingIndex(-1);
    setEditData({});
  };

  const requestDelete = (index) => {
    const contact = contacts[index];
    const name =
      `${contact.first_name_th || contact.firstNameTh || ""} ${contact.last_name_th || contact.lastNameTh || ""}`.trim() ||
      "ผู้ติดต่อ";
    setDeleteTarget({ index, name });
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (deleteTarget?.index === undefined) return;
    try {
      const updated = contacts.filter((_, i) => i !== deleteTarget.index);
      await onUpdate("contactPersons", updated);
      setContacts(updated);
      if (editingIndex === deleteTarget.index) {
        setIsEditing(false);
        setEditingIndex(-1);
        setEditData({});
      }
    } catch (error) {
      console.error("Error deleting contact person:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const updateField = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Function to get contact type display name
  const getContactTypeName = (contact) => {
    // Prefer explicit name fields
    if (contact.type_contact_name) {
      return contact.type_contact_name;
    }
    if (contact.typeContactName) {
      return contact.typeContactName;
    }

    // Fallback: map by ID if provided
    const typeId =
      contact.type_contact_id !== undefined ? contact.type_contact_id : contact.typeContactId;
    if (typeId !== undefined && typeId !== null && typeId !== "") {
      const typeMapping = {
        1: "ผู้จัดการ",
        2: "เลขานุการ",
        3: "ผู้ประสานงาน",
        4: "อื่นๆ",
      };
      const display = typeMapping[typeId] || `ประเภท ${typeId}`;

      // If "อื่นๆ" and has other detail, append it
      const otherDetail = contact.type_contact_other_detail || contact.typeContactOtherDetail;
      if ((String(typeId) === "4" || display === "อื่นๆ") && otherDetail) {
        return `${display}: ${otherDetail}`;
      }
      return display;
    }

    // If no data available
    return "ไม่ระบุประเภท";
  };

  // Resolve prename (TH/EN) with support for separate Other fields (prename_other, prename_other_en)
  const resolvePrename = (th, en, otherTh, otherEn, lang = "th") => {
    const sanitize = (v) => {
      const s = (v || "").trim();
      // Ignore language tokens mistakenly stored as values
      if (/^(th|en)$/i.test(s)) return "";
      return s;
    };
    const normTh = sanitize(th);
    const normEn = sanitize(en);
    const normOtherTh = sanitize(otherTh);
    const normOtherEn = sanitize(otherEn);
    if (lang === "th") {
      // If explicitly marked as Other in TH/EN, use Thai other field
      if (/^อื่นๆ$/i.test(normTh) || /^other$/i.test(normEn)) return normOtherTh || normTh || "";
      // Normal preference: Thai prename, then Thai other, then EN prename
      return normTh || normOtherTh || normEn || normOtherEn || "";
    }
    // lang === 'en'
    // If explicitly marked Other, use English other field
    if (/^other$/i.test(normEn) || /^อื่นๆ$/i.test(normTh)) return normOtherEn || normEn || "";
    // Normal preference: EN prename, then EN other, then TH prename
    return normEn || normOtherEn || normTh || normOtherTh || "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ข้อมูลผู้ติดต่อ ({contacts.length} คน)</h3>
        {!isEditing && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            เพิ่มผู้ติดต่อ
          </button>
        )}
      </div>

      {contacts.map((contact, index) => (
        <div
          key={index}
          className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-blue-800">
              ผู้ติดต่อ #{index + 1} - {getContactTypeName(contact)}
            </h4>
            {!isEditing || editingIndex !== index ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="แก้ไขข้อมูลผู้ติดต่อ"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  แก้ไข
                </button>
                <button
                  onClick={() => requestDelete(index)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="ลบผู้ติดต่อ"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-3H10a1 1 0 00-1 1v1h8V5a1 1 0 00-1-1z"
                    />
                  </svg>
                  ลบ
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  ยกเลิก
                </button>
              </div>
            )}
          </div>

          {/* Full name display (TH/EN) with prename, like signup */}
          {!isEditing || editingIndex !== index ? (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
                <p className="text-lg text-gray-900">
                  {(() => {
                    const prenameTh = resolvePrename(
                      contact.prename_th || contact.prenameTh,
                      contact.prename_en || contact.prenameEn,
                      contact.prename_other || contact.prenameOther,
                      contact.prename_other_en || contact.prenameOtherEn,
                      "th",
                    );
                    const first = contact.first_name_th || contact.firstNameTh || "";
                    const last = contact.last_name_th || contact.lastNameTh || "";
                    const prefix = prenameTh ? prenameTh + " " : "";
                    const full = `${prefix}${first} ${last}`.trim();
                    return full || "-";
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
                <p className="text-lg text-gray-900">
                  {(() => {
                    const prenameEn = resolvePrename(
                      contact.prename_th || contact.prenameTh,
                      contact.prename_en || contact.prenameEn,
                      contact.prename_other || contact.prenameOther,
                      contact.prename_other_en || contact.prenameOtherEn,
                      "en",
                    );
                    const first = contact.first_name_en || contact.firstNameEn || "";
                    const last = contact.last_name_en || contact.lastNameEn || "";
                    const prefix = prenameEn ? prenameEn + " " : "";
                    const full = `${prefix}${first} ${last}`.trim();
                    return full || "-";
                  })()}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Type */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทผู้ติดต่อ</p>
              {isEditing && editingIndex === index ? (
                <div>
                  <select
                    value={String(editData.type_contact_id ?? editData.typeContactId ?? "")}
                    onChange={(e) => {
                      const v = String(e.target.value);
                      // update both snake_case and camelCase to keep consistency
                      updateField("type_contact_id", v);
                      updateField("typeContactId", v);
                      const found = contactTypes.find((t) => String(t.id) === v);
                      if (found) {
                        updateField("type_contact_name", found.type_name_th);
                        updateField("typeContactName", found.type_name_th);
                        // Clear other detail if not OTHER
                        if (found.type_code !== "OTHER") {
                          updateField("type_contact_other_detail", "");
                          updateField("typeContactOtherDetail", "");
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">เลือกประเภทผู้ติดต่อ</option>
                    {contactTypes.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.type_name_th}
                      </option>
                    ))}
                  </select>
                  {/* OTHER detail */}
                  {(() => {
                    const currentTypeId = editData.type_contact_id ?? editData.typeContactId;
                    const current = contactTypes.find(
                      (t) => String(t.id) === String(currentTypeId),
                    );
                    if (current && current.type_code === "OTHER") {
                      return (
                        <input
                          type="text"
                          value={
                            editData.type_contact_other_detail ||
                            editData.typeContactOtherDetail ||
                            ""
                          }
                          onChange={(e) => updateField("type_contact_other_detail", e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="รายละเอียดประเภทผู้ติดต่อ (อื่นๆ)"
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <p className="text-lg text-gray-900">{getContactTypeName(contact)}</p>
              )}
              {typesError && <p className="text-sm text-red-600 mt-1">{typesError}</p>}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">คำนำหน้า (ไทย)</p>
              {isEditing && editingIndex === index ? (
                <>
                  <select
                    value={
                      editData.prename_th ?? editData.prenameTh ?? ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("prename_th", value);
                      updateField("prenameTh", value);
                      if (value !== "อื่นๆ") {
                        updateField("prename_other", "");
                        updateField("prenameOther", "");
                      }
                      if (value === "") {
                        updateField("prename_en", "");
                        updateField("prenameEn", "");
                        updateField("prename_other_en", "");
                        updateField("prenameOtherEn", "");
                        return;
                      }
                      const mapped = TH_TO_EN_PRENAME[value];
                      if (mapped) {
                        updateField("prename_en", mapped);
                        updateField("prenameEn", mapped);
                        if (mapped !== "Other") {
                          updateField("prename_other_en", "");
                          updateField("prenameOtherEn", "");
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- เลือกคำนำหน้า --</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {(() => {
                    const thaiPrename = editData.prename_th ?? editData.prenameTh ?? "";
                    if (thaiPrename === "อื่นๆ") {
                      return (
                        <input
                          type="text"
                          value={
                            editData.prename_other ?? editData.prenameOther ?? ""
                          }
                          onChange={(e) => {
                            updateField("prename_other", e.target.value);
                            updateField("prenameOther", e.target.value);
                          }}
                          className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ระบุคำนำหน้าอื่นๆ (เช่น ดร., ศ., ผศ.)"
                        />
                      );
                    }
                    return null;
                  })()}
                </>
              ) : (
                <p className="text-lg text-gray-900">
                  {resolvePrename(
                    contact.prename_th || contact.prenameTh,
                    contact.prename_en || contact.prenameEn,
                    contact.prename_other || contact.prenameOther,
                    contact.prename_other_en || contact.prenameOtherEn,
                    "th",
                  ) || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">คำนำหน้า (อังกฤษ)</p>
              {isEditing && editingIndex === index ? (
                <>
                  <select
                    value={
                      editData.prename_en ?? editData.prenameEn ?? ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("prename_en", value);
                      updateField("prenameEn", value);
                      if (value !== "Other") {
                        updateField("prename_other_en", "");
                        updateField("prenameOtherEn", "");
                      }
                      if (value === "") {
                        updateField("prename_th", "");
                        updateField("prenameTh", "");
                        updateField("prename_other", "");
                        updateField("prenameOther", "");
                        return;
                      }
                      const mapped = EN_TO_TH_PRENAME[value];
                      if (mapped) {
                        updateField("prename_th", mapped);
                        updateField("prenameTh", mapped);
                        if (mapped !== "อื่นๆ") {
                          updateField("prename_other", "");
                          updateField("prenameOther", "");
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Select Title --</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Other">Other</option>
                  </select>
                  {(() => {
                    const enPrename = editData.prename_en ?? editData.prenameEn ?? "";
                    if (enPrename === "Other") {
                      return (
                        <input
                          type="text"
                          value={
                            editData.prename_other_en ?? editData.prenameOtherEn ?? ""
                          }
                          onChange={(e) => {
                            updateField("prename_other_en", e.target.value);
                            updateField("prenameOtherEn", e.target.value);
                          }}
                          className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Specify other title (e.g., Dr., Prof.)"
                        />
                      );
                    }
                    return null;
                  })()}
                </>
              ) : (
                <p className="text-lg text-gray-900">
                  {resolvePrename(
                    contact.prename_th || contact.prenameTh,
                    contact.prename_en || contact.prenameEn,
                    contact.prename_other || contact.prenameOther,
                    contact.prename_other_en || contact.prenameOtherEn,
                    "en",
                  ) || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={
                    editData.first_name_th ?? editData.firstNameTh ?? ""
                  }
                  onChange={(e) => {
                    updateField("first_name_th", e.target.value);
                    updateField("firstNameTh", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อ (ไทย)"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.first_name_th || contact.firstNameTh || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={
                    editData.last_name_th ?? editData.lastNameTh ?? ""
                  }
                  onChange={(e) => {
                    updateField("last_name_th", e.target.value);
                    updateField("lastNameTh", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="นามสกุล (ไทย)"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.last_name_th || contact.lastNameTh || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={
                    editData.first_name_en ?? editData.firstNameEn ?? ""
                  }
                  onChange={(e) => {
                    updateField("first_name_en", e.target.value);
                    updateField("firstNameEn", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อ (อังกฤษ)"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.first_name_en || contact.firstNameEn || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={
                    editData.last_name_en ?? editData.lastNameEn ?? ""
                  }
                  onChange={(e) => {
                    updateField("last_name_en", e.target.value);
                    updateField("lastNameEn", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="นามสกุล (อังกฤษ)"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.last_name_en || contact.lastNameEn || "-"}
                </p>
              )}
            </div>
            {/* First Name Thai */}

            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.position || ""}
                  onChange={(e) => updateField("position", e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ตำแหน่ง"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.position || "-"}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อีเมล"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.email || "-"}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              {isEditing && editingIndex === index ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เบอร์โทรศัพท์"
                  />
                  <input
                    type="text"
                    value={editData.phoneExtension || editData.phone_extension || ""}
                    onChange={(e) =>
                      updateField(
                        contact.phone_extension !== undefined
                          ? "phone_extension"
                          : "phoneExtension",
                        e.target.value,
                      )
                    }
                    className="w-24 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ต่อ"
                  />
                </div>
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.phone || "-"}
                  {(contact.phoneExtension || contact.phone_extension) &&
                    ` ต่อ ${contact.phoneExtension || contact.phone_extension}`}
                </p>
              )}
            </div>
            {/* Removed manual type text input; type is selected via dropdown above */}
            {(contact.typeContactOtherDetail || contact.type_contact_other_detail) && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">รายละเอียดเพิ่มเติม</p>
                {isEditing && editingIndex === index ? (
                  <textarea
                    value={
                      editData.typeContactOtherDetail || editData.type_contact_other_detail || ""
                    }
                    onChange={(e) =>
                      updateField(
                        contact.type_contact_other_detail !== undefined
                          ? "type_contact_other_detail"
                          : "typeContactOtherDetail",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="รายละเอียดเพิ่มเติม"
                    rows="3"
                  />
                ) : (
                  <p className="text-lg text-gray-900">
                    {contact.type_contact_other_detail || contact.typeContactOtherDetail || "-"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-dashed border-blue-300 rounded-xl p-8 bg-blue-50/50 text-center">
          <svg
            className="w-12 h-12 text-blue-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-blue-900 font-medium">ยังไม่มีข้อมูลผู้ติดต่อ</p>
          <p className="text-sm text-blue-700 mt-1">กดปุ่ม "เพิ่มผู้ติดต่อ" เพื่อเพิ่มข้อมูล</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[75] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบผู้ติดต่อ</h3>
            <p className="text-sm text-gray-600 mb-4">คุณต้องการลบผู้ติดต่อนี้หรือไม่?</p>
            {deleteTarget && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-sm text-gray-800 font-medium">{deleteTarget.name}</div>
                <div className="mt-1 text-xs text-gray-600">
                  ผู้ติดต่อ #{deleteTarget.index + 1}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={performDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPersonSection;
