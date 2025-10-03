import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, User } from "lucide-react";

const ContactPersonSection = ({
  contactPersons = [],
  onContactPersonsChange,
  errors = {},
  membershipType = "OC",
}) => {
  const [contactTypes, setContactTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [expandedContacts, setExpandedContacts] = useState([0]); // Main contact expanded by default

  // Initialize with main contact person if empty
  useEffect(() => {
    if (contactPersons.length === 0) {
      const mainContact = {
        id: Date.now(),
        prenameTh: "",
        prenameEn: "",
        prenameOther: "",
        prenameOtherEn: "",
        firstNameTh: "",
        lastNameTh: "",
        firstNameEn: "",
        lastNameEn: "",
        position: "",
        email: "",
        phone: "",
        typeContactId: null,
        typeContactName: "ผู้ประสานงานหลัก",
        typeContactOtherDetail: "",
        isMain: true,
      };
      onContactPersonsChange([mainContact]);
    }
  }, []);

  // Load contact types from API
  useEffect(() => {
    let active = true;
    async function loadTypes() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/member/contact-person-types", { method: "GET" });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.error || "โหลดประเภทผู้ติดต่อไม่สำเร็จ");
        }
        if (active) {
          setContactTypes(Array.isArray(json.data) ? json.data : []);
        }
      } catch (e) {
        if (active) setLoadError(e.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTypes();
    return () => {
      active = false;
    };
  }, []);

  // Set main contact type when contact types are loaded
  useEffect(() => {
    if (contactTypes.length > 0 && contactPersons.length > 0 && !contactPersons[0].typeContactId) {
      const mainType = contactTypes.find((type) => type.type_code === "MAIN");
      if (mainType) {
        const updatedContacts = [...contactPersons];
        updatedContacts[0] = {
          ...updatedContacts[0],
          typeContactId: mainType.id,
          typeContactName: mainType.type_name_th,
        };
        onContactPersonsChange(updatedContacts);
      }
    }
  }, [contactTypes, contactPersons, onContactPersonsChange]);

  const toggleContactExpansion = (index) => {
    setExpandedContacts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contactPersons];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    };

    // Handle contact type selection
    if (field === "typeContactId") {
      const selectedType = contactTypes.find((type) => type.id === parseInt(value));
      if (selectedType) {
        updatedContacts[index].typeContactName = selectedType.type_name_th;
        // Clear other detail if not "Other" type
        if (selectedType.type_code !== "OTHER") {
          updatedContacts[index].typeContactOtherDetail = "";
        }
      }
    }

    // Auto-select matching prename in the other language
    if (field === "prenameTh") {
      // Map Thai prenames to English equivalents
      const thaiToEnglishMap = {
        นาย: "Mr",
        นาง: "Mrs",
        นางสาว: "Ms",
        อื่นๆ: "Other",
      };

      // If English prename is empty or doesn't match the Thai selection, update it
      if (
        !updatedContacts[index].prenameEn ||
        thaiToEnglishMap[value] !== updatedContacts[index].prenameEn
      ) {
        updatedContacts[index].prenameEn = thaiToEnglishMap[value] || "";
      }
    } else if (field === "prenameEn") {
      // Map English prenames to Thai equivalents
      const englishToThaiMap = {
        Mr: "นาย",
        Mrs: "นาง",
        Ms: "นางสาว",
        Other: "อื่นๆ",
      };

      // If Thai prename is empty or doesn't match the English selection, update it
      if (
        !updatedContacts[index].prenameTh ||
        englishToThaiMap[value] !== updatedContacts[index].prenameTh
      ) {
        updatedContacts[index].prenameTh = englishToThaiMap[value] || "";
      }
    }

    onContactPersonsChange(updatedContacts);
  };

  const addContactPerson = () => {
    if (contactPersons.length < 4) {
      // 1 main + 3 additional
      const newContact = {
        id: Date.now(),
        prenameTh: "",
        prenameEn: "",
        prenameOther: "",
        prenameOtherEn: "",
        firstNameTh: "",
        lastNameTh: "",
        firstNameEn: "",
        lastNameEn: "",
        position: "",
        email: "",
        phone: "",
        typeContactId: null,
        typeContactName: "",
        typeContactOtherDetail: "",
        isMain: false,
      };
      const newIndex = contactPersons.length;
      onContactPersonsChange([...contactPersons, newContact]);
      // Auto expand new contact
      setExpandedContacts((prev) => [...prev, newIndex]);
    }
  };

  const removeContactPerson = (index) => {
    if (index > 0) {
      // Can't remove main contact
      const updatedContacts = contactPersons.filter((_, i) => i !== index);
      onContactPersonsChange(updatedContacts);
      // Remove from expanded list and adjust indices
      setExpandedContacts((prev) =>
        prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
      );
    }
  };

  const validateThaiName = (value) => {
    const thaiRegex = /^[ก-๙\s]+$/;
    return thaiRegex.test(value) || value === "";
  };

  const validateEnglishName = (value) => {
    const englishRegex = /^[a-zA-Z\s]+$/;
    return englishRegex.test(value) || value === "";
  };

  const getContactSummary = (contact, index) => {
    const namePrefix = contact.prenameTh || contact.prenameEn || contact.prenameOther || "";
    const name =
      (namePrefix ? namePrefix + " " : "") +
      (contact.firstNameTh || contact.firstNameEn || "ยังไม่ระบุชื่อ");
    const lastName = contact.lastNameTh || contact.lastNameEn || "";
    const position = contact.position || "ยังไม่ระบุตำแหน่ง";
    return `${name} ${lastName} - ${position}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        ไม่สามารถโหลดประเภทผู้ติดต่อได้: {loadError}
      </div>
    );
  }

  return (
    <div
      data-section="contact-person"
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <User className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">ข้อมูลผู้ติดต่อ</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {contactPersons.length}/4
          </span>
        </div>
        {contactPersons.length < 4 && (
          <button
            type="button"
            onClick={addContactPerson}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มผู้ติดต่อ
          </button>
        )}
      </div>

      {/* Contact List */}
      <div className="divide-y divide-gray-200">
        {contactPersons.map((contact, index) => {
          const isExpanded = expandedContacts.includes(index);
          const isMain = index === 0;

          return (
            <div key={contact.id} className="bg-white">
              {/* Contact Header */}
              <div
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => toggleContactExpansion(index)}
              >
                <div className="flex items-center flex-1">
                  <div className="flex items-center mr-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        isMain ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">
                          {isMain ? "ผู้ประสานงานหลัก" : `ผู้ติดต่อคนที่ ${index + 1}`}
                        </h4>
                        {/* removed required asterisk */}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {getContactSummary(contact, index)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      contact.firstNameTh && contact.email && contact.phone
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  ></div>

                  {!isMain && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContactPerson(index);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              {isExpanded && (
                <div className="px-4 pb-6 bg-gray-50">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Contact Type */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ประเภทผู้ติดต่อ
                        </label>
                        <select
                          id={`contactPerson${index}TypeContactId`}
                          name={`contactPerson${index}TypeContactId`}
                          value={
                            isMain
                              ? contactTypes.find((t) => t.type_code === "MAIN")?.id || ""
                              : contact.typeContactId || ""
                          }
                          onChange={(e) => {
                            if (!isMain) {
                              handleContactChange(index, "typeContactId", e.target.value);
                            }
                          }}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isMain ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                          }`}
                          required={isMain}
                          disabled={isMain}
                        >
                          {isMain ? (
                            <option
                              value={contactTypes.find((t) => t.type_code === "MAIN")?.id || ""}
                            >
                              {contactTypes.find((t) => t.type_code === "MAIN")?.type_name_th ||
                                "ผู้ประสานงานหลัก"}
                            </option>
                          ) : (
                            <>
                              <option value="">เลือกประเภทผู้ติดต่อ</option>
                              {contactTypes
                                .filter((type) => type.type_code !== "MAIN") // กรองไม่ให้เลือก "ผู้ประสานงานหลัก"
                                .map((type) => (
                                  <option key={type.id} value={type.id}>
                                    {type.type_name_th}
                                  </option>
                                ))}
                            </>
                          )}
                        </select>
                        {errors[`contactPerson${index}TypeContactId`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}TypeContactId`]}
                          </p>
                        )}
                      </div>

                      {/* Other Detail */}
                      {contact.typeContactId &&
                        contactTypes.find((t) => t.id === parseInt(contact.typeContactId))
                          ?.type_code === "OTHER" && (
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              รายละเอียดประเภทอื่นๆ
                            </label>
                            <input
                              type="text"
                              id={`contactPerson${index}TypeContactOtherDetail`}
                              name={`contactPerson${index}TypeContactOtherDetail`}
                              value={contact.typeContactOtherDetail || ""}
                              onChange={(e) =>
                                handleContactChange(index, "typeContactOtherDetail", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ระบุรายละเอียดประเภทผู้ติดต่อ"
                              required
                            />
                          </div>
                        )}

                      {/* Thai Names with Prename */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อ-นามสกุล (ภาษาไทย)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {/* Prename Thai */}
                          <div>
                            <div className="text-xs text-gray-700 mb-1">
                              คำนำหน้า {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <select
                              value={contact.prenameTh || ""}
                              onChange={(e) =>
                                handleContactChange(index, "prenameTh", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required={isMain}
                            >
                              <option value="">คำนำหน้า</option>
                              <option value="นาย">นาย</option>
                              <option value="นาง">นาง</option>
                              <option value="นางสาว">นางสาว</option>
                              <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                            {/* Other Prename Thai - shown immediately below */}
                            {contact.prenameTh === "อื่นๆ" && (
                              <input
                                type="text"
                                id={`contactPerson${index}PrenameOther`}
                                name={`contactPerson${index}PrenameOther`}
                                value={contact.prenameOther || ""}
                                onChange={(e) => {
                                  const thaiOnly = e.target.value.replace(/[^ก-๙\.\s]/g, "");
                                  handleContactChange(index, "prenameOther", thaiOnly);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                                placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                                required
                              />
                            )}
                          </div>
                          {/* First Name Thai */}
                          <div>
                            <div className="text-xs text-gray-700 mb-1">
                              ชื่อ {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <input
                              type="text"
                              id={`contactPerson${index}FirstNameTh`}
                              name={`contactPerson${index}FirstNameTh`}
                              value={contact.firstNameTh}
                              onChange={(e) => {
                                if (validateThaiName(e.target.value)) {
                                  handleContactChange(index, "firstNameTh", e.target.value);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ชื่อ"
                              required={isMain}
                            />
                          </div>
                          {/* Last Name Thai */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-700 mb-1">
                              นามสกุล {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <input
                              type="text"
                              id={`contactPerson${index}LastNameTh`}
                              name={`contactPerson${index}LastNameTh`}
                              value={contact.lastNameTh}
                              onChange={(e) => {
                                if (validateThaiName(e.target.value)) {
                                  handleContactChange(index, "lastNameTh", e.target.value);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="นามสกุล"
                              required={isMain}
                            />
                          </div>
                        </div>
                        {errors[`contactPerson${index}FirstNameTh`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}FirstNameTh`]}
                          </p>
                        )}
                        {errors[`contactPerson${index}LastNameTh`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}LastNameTh`]}
                          </p>
                        )}
                      </div>

                      {/* English Names with Prename (required) */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name (English)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {/* Prename English */}
                          <div>
                            <div className="text-xs text-gray-700 mb-1">
                              Prename {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <select
                              value={contact.prenameEn || ""}
                              onChange={(e) =>
                                handleContactChange(index, "prenameEn", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Prename</option>
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Other">Other</option>
                            </select>
                            {/* Other Prename English - shown immediately below */}
                            {contact.prenameEn === "Other" && (
                              <input
                                type="text"
                                id={`contactPerson${index}PrenameOtherEn`}
                                name={`contactPerson${index}PrenameOtherEn`}
                                value={contact.prenameOtherEn || ""}
                                onChange={(e) => {
                                  const enOnly = e.target.value.replace(/[^a-zA-Z\.\s]/g, "");
                                  handleContactChange(index, "prenameOtherEn", enOnly);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                                placeholder="e.g., Assoc. Prof., Dr."
                                required
                              />
                            )}
                          </div>
                          {/* First Name English */}
                          <div>
                            <div className="text-xs text-gray-700 mb-1">
                              First Name {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <input
                              type="text"
                              value={contact.firstNameEn}
                              onChange={(e) => {
                                if (validateEnglishName(e.target.value)) {
                                  handleContactChange(index, "firstNameEn", e.target.value);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="First Name"
                              required
                            />
                          </div>
                          {/* Last Name English */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-700 mb-1">
                              Last Name {isMain && <span className="text-red-500">*</span>}
                            </div>
                            <input
                              type="text"
                              value={contact.lastNameEn}
                              onChange={(e) => {
                                if (validateEnglishName(e.target.value)) {
                                  handleContactChange(index, "lastNameEn", e.target.value);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Last Name"
                              required
                            />
                          </div>
                        </div>
                        {errors[`contactPerson${index}FirstNameEn`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}FirstNameEn`]}
                          </p>
                        )}
                        {errors[`contactPerson${index}LastNameEn`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}LastNameEn`]}
                          </p>
                        )}
                      </div>

                      {/* Position and Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ตำแหน่ง
                        </label>
                        <input
                          type="text"
                          id={`contactPerson${index}Position`}
                          name={`contactPerson${index}Position`}
                          value={contact.position}
                          onChange={(e) => handleContactChange(index, "position", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ตำแหน่งงาน"
                          required={isMain}
                        />
                        {errors[`contactPerson${index}Position`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}Position`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          อีเมล
                        </label>
                        <input
                          type="email"
                          id={`contactPerson${index}Email`}
                          name={`contactPerson${index}Email`}
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, "email", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="อีเมล"
                          required={isMain}
                        />
                        {errors[`contactPerson${index}Email`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}Email`]}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          หมายเลขโทรศัพท์
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2">
                            <input
                              type="tel"
                              id={`contactPerson${index}Phone`}
                              name={`contactPerson${index}Phone`}
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="02-123-4567"
                              required={isMain}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={contact.phoneExtension || ""}
                              onChange={(e) =>
                                handleContactChange(index, "phoneExtension", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ต่อ (ถ้ามี)"
                            />
                          </div>
                        </div>
                        {errors[`contactPerson${index}Phone`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`contactPerson${index}Phone`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Contact Button (Bottom) */}
      {contactPersons.length < 4 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={addContactPerson}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            เพิ่มผู้ติดต่อ (เพิ่มได้อีก {4 - contactPersons.length} ท่าน)
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactPersonSection;
