"use client";

import { useState, useEffect, useCallback } from "react";
import TsicManagement from "./tsic/TsicManagement";
import TsicSelection from "./TsicSelection";
import { preloadTsicCodes } from "./api";

export default function TsicCodeManager({
  memberCode,
  language = "th",
  memberType = "",
  memberGroupCode = "",
  typeCode = "",
}) {
  const [mode, setMode] = useState("view"); // 'view', 'add'
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [cooldownMinutesLeft, setCooldownMinutesLeft] = useState(0);

  // Helper function to get text based on current language
  const getText = (thText, enText) => {
    return language === "th" ? thText : enText || thText;
  };

  // ฟังก์ชันสำหรับตรวจสอบและจัดการกับ cooldown
  const checkCooldown = useCallback(() => {
    const cooldownKey = `tsic_cooldown_${memberCode}`;
    const cooldownData = localStorage.getItem(cooldownKey);

    if (cooldownData) {
      const { endTime } = JSON.parse(cooldownData);
      const now = new Date().getTime();
      const endTimeDate = new Date(endTime).getTime();

      if (now < endTimeDate) {
        // ยังอยู่ในช่วง cooldown
        setCooldownActive(true);
        setCooldownEndTime(endTimeDate);

        // คำนวณเวลาที่เหลือในหน่วยนาที
        const minutesLeft = Math.ceil((endTimeDate - now) / (1000 * 60));
        setCooldownMinutesLeft(minutesLeft);
        return true;
      } else {
        // พ้นช่วง cooldown แล้ว
        localStorage.removeItem(cooldownKey);
      }
    }

    setCooldownActive(false);
    setCooldownEndTime(null);
    setCooldownMinutesLeft(0);
    return false;
  }, [memberCode]);

  // ฟังก์ชันสำหรับตั้งค่า cooldown
  const setCooldown = useCallback(() => {
    const cooldownKey = `tsic_cooldown_${memberCode}`;
    const now = new Date().getTime();

    // ตั้งเวลา cooldown เป็น 5 วินาทีสำหรับการพัฒนา
    const cooldownSeconds = 5; // 5 วินาทีสำหรับการพัฒนา
    const cooldownMs = cooldownSeconds * 1000;
    const endTime = new Date(now + cooldownMs);

    localStorage.setItem(
      cooldownKey,
      JSON.stringify({
        endTime: endTime.toISOString(),
        memberCode,
      }),
    );

    setCooldownActive(true);
    setCooldownEndTime(endTime);
    setCooldownMinutesLeft(cooldownMinutes);
  }, [memberCode]);

  // Handle add TSIC code
  const handleAdd = () => {
    if (checkCooldown()) {
      alert(
        getText(
          "ท่านได้ส่งคำขอแก้ไขข้อมูลแล้ว หากต้องการเพิ่ม/แก้ไข ข้อมูล กรุณารอ 5 วินาที ขออภัยในความไม่สะดวก",
          "You have already submitted a request. If you want to add/edit data, please wait 5 seconds. We apologize for the inconvenience.",
        ),
      );
      return;
    }
    setIsLoading(true);
    setMode("add");
  };

  // Handle operation success
  const handleSuccess = () => {
    setMode("view");
  };

  return (
    <div className="space-y-6">
      {mode === "view" && (
        <TsicManagement
          memberCode={memberCode}
          onAdd={handleAdd}
          language={language}
          memberType={memberType}
          memberGroupCode={memberGroupCode}
          typeCode={typeCode}
        />
      )}

      {mode === "add" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-blue-600">
              {getText("เลือกรหัสที่ต้องการ", "Select Codes")}
            </h3>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isLoading}
            >
              {getText("ยกเลิก", "Cancel")}
            </button>
          </div>

          {isLoading && (
            <div className="bg-white p-6 rounded-lg shadow mb-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="text-gray-700">
                  {getText(
                    "ระบบกำลังค้นหารหัส TSIC ที่มีอยู่แล้ว...กรุณารอสักครู่",
                    "Searching for existing TSIC codes... Please wait",
                  )}
                </p>
              </div>
            </div>
          )}

          <TsicSelection
            onSuccess={handleSuccess}
            memberCode={memberCode}
            language={language}
            onDataLoaded={() => setIsLoading(false)}
          />
        </div>
      )}
    </div>
  );
}
