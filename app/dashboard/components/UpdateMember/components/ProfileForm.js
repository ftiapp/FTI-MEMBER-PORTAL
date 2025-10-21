import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTimes, FaSpinner } from "react-icons/fa";

const ProfileForm = ({
  formData,
  originalData,
  editMode,
  toggleEditMode,
  handleInputChange,
  handleSubmit,
  submitting,
  requestsToday,
  maxRequests,
  updateStatus,
}) => {
  const isLimitReached = requestsToday >= maxRequests;
  const hasPendingRequest = updateStatus === "pending";

  useEffect(() => {
    console.log("ProfileForm received formData:", formData);
    console.log("ProfileForm received originalData:", originalData);
  }, [formData, originalData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow rounded-lg p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>

        {/* Edit button */}
        {!editMode && !hasPendingRequest && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleEditMode}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center text-sm w-full sm:w-auto"
            disabled={isLimitReached}
          >
            <FaEdit className="mr-1" /> แก้ไขข้อมูล
          </motion.button>
        )}
      </div>

      {/* Pending request notice inside form (in addition to banner) */}
      {hasPendingRequest && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            คุณมีคำขอแก้ไขข้อมูลที่กำลังรอการพิจารณาอยู่ ขณะนี้ไม่สามารถส่งคำขอใหม่ได้
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* ชื่อและนามสกุลอยู่บรรทัดเดียวกัน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`w-full px-3 py-2 border ${editMode ? "border-blue-300" : "border-gray-300"} rounded-md ${!editMode && "bg-gray-100"} text-gray-900 font-medium`}
              />
            </div>

            {/* Last name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`w-full px-3 py-2 border ${editMode ? "border-blue-300" : "border-gray-300"} rounded-md ${!editMode && "bg-gray-100"} text-gray-900 font-medium`}
              />
            </div>
          </div>

          {/* อีเมลและเบอร์โทรศัพท์อยู่บรรทัดเดียวกัน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 font-medium"
              />
              <p className="mt-1 text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
            </div>

            {/* Phone field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 font-medium"
              />
              <p className="mt-1 text-xs text-gray-500">ไม่สามารถแก้ไขเบอร์โทรศัพท์ได้</p>
            </div>
          </div>

          {/* Action buttons */}
          {editMode && !hasPendingRequest && (
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleEditMode}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center w-full sm:w-auto"
              >
                <FaTimes className="mr-2" /> ยกเลิก
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto ${isLimitReached ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={submitting || isLimitReached}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <FaSpinner />
                    </motion.span>
                    กำลังส่งข้อมูล...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaSave className="mr-2" /> บันทึกข้อมูล
                  </span>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </form>

      {/* Request limit warning */}
      {isLimitReached && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            คุณได้ส่งคำขอแก้ไขข้อมูลครบ {maxRequests} ครั้งต่อวันแล้ว กรุณารอจนถึงวันถัดไป
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileForm;
