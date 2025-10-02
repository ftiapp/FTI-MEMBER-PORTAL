"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function RequestList({ requests, selectedRequestId, onViewRequest }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm น.", { locale: th });
  };

  // Map member type code to readable text
  const getMemberTypeName = (typeCode) => {
    const memberTypeMap = {
      "000": "สภาอุตสาหกรรม",
      100: "กลุ่มอุตสาหกรรม",
      200: "สภาอุตสาหกรรมจังหวัด",
    };
    return memberTypeMap[typeCode] || typeCode;
  };

  // Map address code to readable text
  const getAddressTypeName = (addrCode) => {
    const addressTypeMap = {
      "001": "ที่อยู่สำหรับติดต่อ (ทะเบียน)",
      "002": "ที่อยู่สำหรับจัดส่งเอกสาร",
      "003": "ที่อยู่สำหรับออกใบกำกับภาษี",
    };
    return addressTypeMap[addrCode] || `ที่อยู่รหัส ${addrCode}`;
  };

  // Get language label
  const getLanguageLabel = (addrLang) => {
    if (!addrLang) return "ไม่ระบุภาษา";
    return addrLang.toLowerCase() === "en" ? "ภาษาอังกฤษ (EN)" : "ภาษาไทย (TH)";
  };

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
            รอการอนุมัติ
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            อนุมัติแล้ว
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
            ปฏิเสธแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lg:col-span-1 space-y-4">
      {requests.map((request, index) => {
        // Parse old address JSON if needed
        let oldAddress = {};
        try {
          oldAddress =
            typeof request.old_address === "string"
              ? JSON.parse(request.old_address)
              : request.old_address;
        } catch (e) {
          console.error("Error parsing old address:", e);
        }

        // Format name
        const fullName =
          request.firstname && request.lastname
            ? `${request.firstname} ${request.lastname}`
            : request.name || oldAddress?.MEMBER_NAME || "ไม่ระบุ";

        return (
          <motion.div
            key={`${request.id}-${request.addr_code}-${request.addr_lang}-${index}`}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
              selectedRequestId === request.id ? "border-l-4 border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => onViewRequest(request)}
            whileHover={{ x: 3, backgroundColor: "#EBF5FF" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-black">
                  {request.member_code}
                  {request.comp_person_code && (
                    <span className="ml-2 text-sm text-gray-600">({request.comp_person_code})</span>
                  )}
                </h3>
                <p className="text-sm text-black font-medium">{fullName}</p>
              </div>
              {getStatusBadge(request.status)}
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                <span className="font-medium">ประเภทสมาชิก:</span>{" "}
                {getMemberTypeName(request.member_type)}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">ประเภทที่อยู่:</span>{" "}
                {getAddressTypeName(request.addr_code)}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">ภาษา:</span> {getLanguageLabel(request.addr_lang)}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              วันที่ขอแก้ไข: {formatDate(request.request_date)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
