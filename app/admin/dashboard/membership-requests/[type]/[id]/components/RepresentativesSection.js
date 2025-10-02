import React from "react";

const RepresentativesSection = ({ representatives }) => {
  // Normalize input to array
  const repsArray = Array.isArray(representatives)
    ? representatives
    : representatives
      ? [representatives]
      : [];

  if (!repsArray || repsArray.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้แทน</h3>
      <div className="space-y-4">
        {repsArray.map((rep, index) => {
          // Determine representative primary/order across variants
          const isPrimary =
            rep.is_primary === 1 ||
            rep.is_primary === true ||
            rep.rep_order === 1 ||
            rep.repOrder === 1 ||
            rep.isPrimary === true ||
            rep.order === 1;
          const isSecondary =
            rep.is_primary === 0 ||
            rep.is_primary === false ||
            rep.rep_order === 2 ||
            rep.repOrder === 2 ||
            rep.order === 2;

          const repType = isPrimary
            ? "ผู้แทน 1 (หลัก)"
            : isSecondary
              ? "ผู้แทน 2 (รอง)"
              : `ผู้แทน ${index + 1}`;

          // Resolve names with fallbacks (snake_case and camelCase)
          const firstNameTh = rep.first_name_th || rep.firstNameTh || "";
          const lastNameTh = rep.last_name_th || rep.lastNameTh || "";
          const firstNameEn = rep.first_name_en || rep.firstNameEn || "";
          const lastNameEn = rep.last_name_en || rep.lastNameEn || "";

          // Position and optional other-detail
          const position = rep.position || "";
          const positionOther = rep.position_other || rep.positionOther;

          // Phone and extension
          const phone = rep.phone || "";
          const phoneExtension = rep.phone_extension || rep.phoneExtension || "";

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-600">{repType}</h4>
                {isPrimary && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    หลัก
                  </span>
                )}
                {!isPrimary && isSecondary && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    รอง
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
                  <p className="font-medium">{firstNameTh || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
                  <p className="font-medium">{lastNameTh || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
                  <p className="font-medium">{firstNameEn || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
                  <p className="font-medium">{lastNameEn || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                  <p className="font-medium">
                    {position || "-"}
                    {positionOther && String(positionOther).trim() && (
                      <span className="text-gray-600 ml-2">(อื่นๆ: {positionOther})</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                  <p className="font-medium">
                    {phone || "-"}
                    {phoneExtension && String(phoneExtension).trim() && (
                      <span className="text-gray-600 ml-1">ต่อ {phoneExtension}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">อีเมล</p>
                  <p className="font-medium">{rep.email || "-"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepresentativesSection;
