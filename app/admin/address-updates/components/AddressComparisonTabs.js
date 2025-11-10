"use client";

import EditAddressForm from "./EditAddressForm";
import { formatFullAddress, findChanges } from "./addressUtils";

export default function AddressComparisonTabs({
  selectedRequest,
  activeTab,
  setActiveTab,
  isEditing,
  setIsEditing,
  editedAddress,
  setEditedAddress,
  oldAddress,
  newAddress,
}) {
  // Handle saving edited address
  const handleSaveEdit = (editedData) => {
    // Make sure we have a valid object
    const validEditedData = editedData || {};
    setEditedAddress(validEditedData);
    setIsEditing(false);
    return Promise.resolve(); // Return a resolved promise for the EditAddressForm component
  };

  const changes = findChanges(oldAddress, editedAddress || newAddress);

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-black">เปรียบเทียบที่อยู่</h3>
            <p className="text-sm text-black">ตรวจสอบข้อมูลที่อยู่เดิมและที่อยู่ใหม่</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "old"
                  ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("old")}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>ที่อยู่เดิม</span>
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "new"
                  ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("new")}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>ที่อยู่ใหม่</span>
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "diff"
                  ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("diff")}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>เปรียบเทียบการเปลี่ยนแปลง</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === "old" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">ที่อยู่เดิม</h4>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  {formatFullAddress(oldAddress)}
                </div>
              </div>
            )}

            {activeTab === "new" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">ที่อยู่ใหม่</h4>
                </div>
                {isEditing ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <EditAddressForm
                      addressData={editedAddress || newAddress}
                      addrLang={selectedRequest.addr_lang}
                      onSave={handleSaveEdit}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                    />
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      {formatFullAddress(editedAddress || newAddress)}
                    </div>
                    {selectedRequest.status === "pending" && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        แก้ไขข้อมูลที่อยู่
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "diff" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">การเปลี่ยนแปลง</h4>
                </div>
                {changes.length > 0 ? (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-purple-200">
                        <thead>
                          <tr className="bg-purple-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">
                              FIELD
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">
                              ค่าเดิม
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">
                              ค่าใหม่
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-200">
                          {changes.map((change, index) => (
                            <tr
                              key={index}
                              className={index % 2 === 0 ? "bg-white" : "bg-purple-50"}
                            >
                              <td className="px-4 py-3 text-sm font-semibold text-black">
                                {change.field}
                              </td>
                              <td className="px-4 py-3 text-sm text-black bg-red-50 font-medium">
                                {change.oldValue}
                              </td>
                              <td className="px-4 py-3 text-sm text-black bg-green-50 font-medium">
                                {change.newValue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-black font-medium">ไม่พบการเปลี่ยนแปลงข้อมูล</p>
                    <p className="text-black text-sm mt-1">ที่อยู่เดิมและที่อยู่ใหม่เหมือนกัน</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
