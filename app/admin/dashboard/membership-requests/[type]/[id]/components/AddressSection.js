import React from "react";

const AddressSection = ({ application }) => {
  if (!application) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลที่อยู่
      </h3>

      {/* Check if multi-address data exists */}
      {application.addresses && application.addresses.length > 0 ? (
        <div className="space-y-8">
          {[...application.addresses]
            .sort((a, b) => {
              // Priority: 2 (document delivery) first, then 1 (office), then 3 (tax)
              const pri = (x) => {
                const t = String(x?.address_type ?? "").toString();
                if (t === "2") return 0;
                if (t === "1") return 1;
                if (t === "3") return 2;
                return 3; // unknown types after
              };
              return pri(a) - pri(b);
            })
            .map((address, index) => {
              const addressTypes = {
                1: { label: "ที่อยู่สำนักงาน", color: "blue" },
                2: { label: "ที่อยู่จัดส่งเอกสาร", color: "green" },
                3: { label: "ที่อยู่ใบกำกับภาษี", color: "purple" },
              };
              const key = String(address.address_type);
              const addressType = addressTypes[key] || {
                label: `ที่อยู่ประเภท ${key}`,
                color: "gray",
              };

              return (
                <div
                  key={index}
                  className={`border-2 border-${addressType.color}-200 rounded-lg p-6 bg-${addressType.color}-50`}
                >
                  <h4
                    className={`text-lg font-bold text-${addressType.color}-900 mb-4 border-b border-${addressType.color}-200 pb-2`}
                  >
                    {addressType.label}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        บ้านเลขที่
                      </p>
                      <p className="text-sm text-gray-900">{address.address_number || "-"}</p>
                    </div>
                    {address.building && (
                      <div>
                        <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                          อาคาร/หมู่บ้าน
                        </p>
                        <p className="text-sm text-gray-900">{address.building}</p>
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        หมู่
                      </p>
                      <p className="text-sm text-gray-900">{address.moo || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        ซอย
                      </p>
                      <p className="text-sm text-gray-900">{address.soi || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        ถนน
                      </p>
                      <p className="text-sm text-gray-900">{address.street || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        ตำบล/แขวง
                      </p>
                      <p className="text-sm text-gray-900">{address.sub_district || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        อำเภอ/เขต
                      </p>
                      <p className="text-sm text-gray-900">{address.district || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        จังหวัด
                      </p>
                      <p className="text-sm text-gray-900">{address.province || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        รหัสไปรษณีย์
                      </p>
                      <p className="text-sm text-gray-900 font-mono">
                        {address.postal_code || "-"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        เบอร์โทรศัพท์
                      </p>
                      <p className="text-sm text-gray-900">{address.phone || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        อีเมล
                      </p>
                      <p className="text-sm text-gray-900 break-all">{address.email || "-"}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-${addressType.color}-700 mb-1`}>
                        เว็บไซต์
                      </p>
                      <p className="text-sm text-gray-900 break-all">{address.website || "-"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        // Fallback for old single address format
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
            <p className="text-lg text-gray-900">{application.address_number || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
            <p className="text-lg text-gray-900">{application.moo || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
            <p className="text-lg text-gray-900">{application.soi || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
            <p className="text-lg text-gray-900">{application.street || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
            <p className="text-lg text-gray-900">{application.sub_district || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
            <p className="text-lg text-gray-900">{application.district || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
            <p className="text-lg text-gray-900">{application.province || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
            <p className="text-lg text-gray-900 font-mono">{application.postal_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
            <p className="text-lg text-gray-900">
              {application.company_phone || application.companyPhone || application.phone || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
            <p className="text-lg text-gray-900 break-all">
              {application.company_email || application.companyEmail || application.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            <p className="text-lg text-gray-900 break-all">
              {application.company_website ||
                application.companyWebsite ||
                application.website ||
                "-"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
