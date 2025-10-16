import React, { useEffect, useState } from "react";

const RepresentativesSection = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reps, setReps] = useState(Array.isArray(application?.representatives) ? application.representatives : []);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { index, name }

  useEffect(() => {
    if (!isEditing) {
      setReps(Array.isArray(application?.representatives) ? application.representatives : []);
    }
  }, [application, isEditing]);

  const addRep = () => {
    setReps((prev) => [
      ...prev,
      {
        isPrimary: prev.length === 0, // first one primary
        order: prev.length + 1,
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
        phoneExtension: "",
      },
    ]);
  };

  const requestDeleteRep = (idx) => {
    const rep = reps[idx];
    const name = `${rep.firstNameTh || rep.first_name_th || ""} ${rep.lastNameTh || rep.last_name_th || ""}`.trim() || "ผู้แทน";
    setDeleteTarget({ index: idx, name });
    setShowDeleteModal(true);
  };

  const performDeleteRep = () => {
    if (deleteTarget?.index === undefined) return;
    setReps((prev) => {
      const next = prev.filter((_, i) => i !== deleteTarget.index).map((r, i) => ({ ...r, order: i + 1, isPrimary: i === 0 ? r.isPrimary ?? true : r.isPrimary ?? false }));
      // Ensure only first is primary
      return next.map((r, i) => ({ ...r, isPrimary: i === 0 }));
    });
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const updateRep = (idx, field, value) => {
    setReps((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const togglePrimary = (idx) => {
    setReps((prev) => prev.map((r, i) => ({ ...r, isPrimary: i === idx })));
  };

  const handleSave = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }
    await onUpdate("representatives", reps);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setReps(Array.isArray(application?.representatives) ? application.representatives : []);
  };

  const hasAny = Array.isArray(application?.representatives) && application.representatives.length > 0;

  if (!hasAny && !isEditing) {
    // Show empty state with add button
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-blue-900">ข้อมูลผู้แทน</h3>
          <button onClick={() => { setIsEditing(true); addRep(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">เพิ่มผู้แทน</button>
        </div>
        <p className="text-gray-500">ยังไม่มีผู้แทน กด "เพิ่มผู้แทน" เพื่อเพิ่มรายการแรก</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ข้อมูลผู้แทน</h3>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            แก้ไข/เพิ่มผู้แทน
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">บันทึก</button>
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">ยกเลิก</button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reps.map((rep, index) => {
          const repType = rep.isPrimary
            ? "ผู้แทน 1 (หลัก)"
            : `ผู้แทน ${rep.order || index + 1} (รอง)`;
          const resolvePrename = (th, en, other, lang = "th") => {
            const normTh = (th || "").trim();
            const normEn = (en || "").trim();
            const normOther = (other || "").trim();
            if (lang === "th") {
              if (!normTh && !normOther) return "";
              if (/^อื่นๆ$/i.test(normTh) || /^other$/i.test(normEn)) return normOther || "";
              return normTh || normOther || "";
            }
            if (!normEn && !normOther) return "";
            if (/^other$/i.test(normEn) || /^อื่นๆ$/i.test(normTh)) return normOther || "";
            return normEn || normOther || "";
          };

          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-blue-900">{repType}</h4>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    rep.isPrimary ? "bg-blue-600 text-white" : "bg-gray-500 text-white"
                  }`}
                >
                  {rep.isPrimary ? "หลัก" : "รอง"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                    <p className="text-sm text-gray-900">
                      {[
                        resolvePrename(
                          rep.prename_th || rep.prenameTh,
                          rep.prename_en || rep.prenameEn,
                          rep.prename_other || rep.prenameOther,
                          "th",
                        ),
                        rep.firstNameTh || rep.first_name_th,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                    <p className="text-sm text-gray-900">{rep.lastNameTh || rep.last_name_th || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">
                      {[
                        resolvePrename(
                          rep.prename_th || rep.prenameTh,
                          rep.prename_en || rep.prenameEn,
                          rep.prename_other || rep.prenameOther,
                          "en",
                        ),
                        rep.firstNameEn || rep.first_name_en,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                    <p className="text-sm text-gray-900">{rep.lastNameEn || rep.last_name_en || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                  <p className="text-sm text-gray-900">{rep.position || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                    <p className="text-sm text-gray-900">
                      {rep.phone || "-"}
                      {(rep.phoneExtension || rep.phone_extension) && ` ต่อ ${rep.phoneExtension || rep.phone_extension}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                    <p className="text-sm text-gray-900 break-all">{rep.email || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="space-y-4">
          {reps.map((rep, idx) => (
            <div key={idx} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="primaryRep"
                    checked={rep.isPrimary}
                    onChange={() => togglePrimary(idx)}
                  />
                  <span className="text-sm text-gray-700">กำหนดเป็นผู้แทนหลัก</span>
                </div>
                <button onClick={() => requestDeleteRep(idx)} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">ลบ</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">คำนำหน้า (ไทย)</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg" 
                    value={rep.prenameTh || rep.prename_th || ""} 
                    onChange={(e) => {
                      updateRep(idx, "prenameTh", e.target.value);
                      if (e.target.value !== "อื่นๆ") {
                        updateRep(idx, "prenameOther", "");
                      }
                    }}
                  >
                    <option value="">-- เลือกคำนำหน้า --</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {(rep.prenameTh === "อื่นๆ" || rep.prename_th === "อื่นๆ") && (
                    <input 
                      className="w-full px-3 py-2 border rounded-lg mt-2" 
                      value={rep.prenameOther || rep.prename_other || ""} 
                      onChange={(e) => updateRep(idx, "prenameOther", e.target.value)}
                      placeholder="ระบุคำนำหน้าอื่นๆ (เช่น ดร., ศ., ผศ.)"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">คำนำหน้า (อังกฤษ)</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg" 
                    value={rep.prenameEn || rep.prename_en || ""} 
                    onChange={(e) => {
                      updateRep(idx, "prenameEn", e.target.value);
                      if (e.target.value !== "Other") {
                        updateRep(idx, "prenameOtherEn", "");
                      }
                    }}
                  >
                    <option value="">-- Select Title --</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Other">Other</option>
                  </select>
                  {(rep.prenameEn === "Other" || rep.prename_en === "Other") && (
                    <input 
                      className="w-full px-3 py-2 border rounded-lg mt-2" 
                      value={rep.prenameOtherEn || rep.prename_other_en || ""} 
                      onChange={(e) => updateRep(idx, "prenameOtherEn", e.target.value)}
                      placeholder="Specify other title (e.g., Dr., Prof.)"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ชื่อต้น (TH)</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.firstNameTh || ""} onChange={(e) => updateRep(idx, "firstNameTh", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">นามสกุล (TH)</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.lastNameTh || ""} onChange={(e) => updateRep(idx, "lastNameTh", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ชื่อ (EN)</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.firstNameEn || ""} onChange={(e) => updateRep(idx, "firstNameEn", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">นามสกุล (EN)</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.lastNameEn || ""} onChange={(e) => updateRep(idx, "lastNameEn", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ตำแหน่ง</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.position || ""} onChange={(e) => updateRep(idx, "position", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">อีเมล</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" value={rep.email || ""} onChange={(e) => updateRep(idx, "email", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">เบอร์โทรศัพท์</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.phone || ""} onChange={(e) => updateRep(idx, "phone", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">เบอร์ต่อ (ถ้ามี)</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={rep.phoneExtension || ""} onChange={(e) => updateRep(idx, "phoneExtension", e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addRep} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">เพิ่มผู้แทน</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[75] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบผู้แทน</h3>
            <p className="text-sm text-gray-600 mb-4">คุณต้องการลบผู้แทนนี้หรือไม่?</p>
            {deleteTarget && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-sm text-gray-800 font-medium">
                  {deleteTarget.name}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  ผู้แทน #{deleteTarget.index + 1}
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
                onClick={performDeleteRep}
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

export default RepresentativesSection;
