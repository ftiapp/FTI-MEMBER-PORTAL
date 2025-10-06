"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import SearchableDropdown from "./SearchableDropdown";

export default function AddressSection({ formData, setFormData, errors, isLoading }) {
  const [activeTab, setActiveTab] = useState("1"); // เปลี่ยนเป็น default ที่อยู่สำนักงาน

  // Address types configuration
  const addressTypes = {
    1: { label: "ที่อยู่สำนักงาน", color: "blue" },
    2: { label: "ที่อยู่จัดส่งเอกสาร", color: "blue" },
    3: { label: "ที่อยู่ใบกำกับภาษี", color: "blue" },
  };

  // Initialize address data if not exists
  useEffect(() => {
    if (!formData.addresses) {
      setFormData((prev) => ({
        ...prev,
        addresses: {
          1: { addressType: "1" },
          2: { addressType: "2" },
          3: { addressType: "3" },
        },
      }));
    }
  }, [formData.addresses, setFormData]);

  // Get current address data
  const getCurrentAddress = () => {
    if (!formData.addresses || !formData.addresses[activeTab]) {
      return {};
    }
    return formData.addresses[activeTab];
  };

  // Handle address input changes
  const handleAddressInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          [field]: value,
          addressType: activeTab,
        },
      },
    }));
  };

  // Copy address from office address (type 1) to other types
  const copyAddressFromOffice = (targetType) => {
    const officeAddress = formData.addresses?.["1"];
    if (!officeAddress) {
      toast.error("กรุณากรอกที่อยู่สำนักงานก่อน");
      return;
    }

    const addressToCopy = {
      ...officeAddress,
      addressType: targetType,
    };

    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [targetType]: addressToCopy,
      },
    }));

    toast.success(`คัดลอกที่อยู่ไปยัง${addressTypes[targetType].label}เรียบร้อยแล้ว`);
  };

  // Prevent repeated auto-switching: track previous error signature and manual tab interactions
  const prevAddressErrorSig = useRef("");
  const manualTabOverrideRef = useRef(false);

  // Auto-switch to the tab that has the first address error, but only when errors change
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) {
      prevAddressErrorSig.current = "";
      manualTabOverrideRef.current = false;
      return;
    }

    // Build a signature of address-related errors only
    const keys = Object.keys(errors);
    const addressKeys = keys.filter((k) => k.startsWith("addresses.") || /^address_\d+_/.test(k));
    const sig = addressKeys.sort().join("|");

    // If no address-related errors or signature unchanged, do nothing
    if (addressKeys.length === 0 || sig === prevAddressErrorSig.current) return;
    prevAddressErrorSig.current = sig;

    // Respect manual tab overrides: do not force tab switching after the user has interacted
    if (manualTabOverrideRef.current) return;

    // Find first address error and switch to that tab
    let firstErrorKey = addressKeys.find((key) => key.startsWith("addresses.")) || addressKeys[0];
    let typeMatch = firstErrorKey ? firstErrorKey.match(/addresses\.(\d+)\./) : null;
    if (!typeMatch) {
      typeMatch = firstErrorKey.match(/^address_(\d+)_/);
    }

    if (typeMatch && typeMatch[1]) {
      const errorTab = typeMatch[1];
      const doScroll = () => {
        const addressSection =
          document.querySelector('[data-section="addresses"]') ||
          document.querySelector('[data-section="company-address"]') ||
          document.querySelector(".company-address") ||
          document.querySelector("h3")?.closest(".bg-white");
        if (addressSection) {
          addressSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };
      if (errorTab !== activeTab) {
        setActiveTab(errorTab);
      }
      setTimeout(doScroll, 100);
    }
  }, [errors]);

  // Handle input change
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          [name]: value,
        },
      },
    }));
  };

  const fetchPostalCode = useCallback(
    async (subDistrict) => {
      if (!subDistrict || subDistrict.trim() === "") return;

      try {
        console.log(`🔍 กำลังหา postal code สำหรับ: ${subDistrict}`);

        const response = await fetch(
          `/api/thailand-address/search?query=${encodeURIComponent(subDistrict.trim())}&type=subdistrict`,
        );

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
        }

        const data = await response.json();
        console.log("📬 ผลการค้นหา postal code:", data);

        if (data.success && data.data && data.data.length > 0) {
          // หาตำบลที่ตรงกันที่สุด
          const exactMatch = data.data.find((item) => item.text === subDistrict);
          const selectedItem = exactMatch || data.data[0];

          if (selectedItem && selectedItem.postalCode) {
            console.log(`✅ เจอ postal code: ${selectedItem.postalCode}`);

            setFormData((prev) => ({
              ...prev,
              postalCode: selectedItem.postalCode,
            }));
            // ลดการแจ้งเตือนซ้ำ ๆ: ไม่ต้องแสดง toast สำเร็จทุกครั้ง
          } else {
            console.log("❌ ไม่มี postal code ในข้อมูล");
          }
        } else {
          console.log("❌ ไม่เจอข้อมูลตำบล");
        }
      } catch (error) {
        console.error("Error fetching postal code:", error);
        // ไม่แสดง error toast เพื่อไม่รบกวนผู้ใช้
      }
    },
    [setFormData],
  );

  const fetchSubDistricts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    try {
      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=subdistrict`,
      );
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลตำบลได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching subdistricts:", error);
      return [];
    }
  }, []);

  const fetchDistricts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    try {
      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=district`,
      );
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลอำเภอได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  }, []);

  const fetchProvinces = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    try {
      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=province`,
      );
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลจังหวัดได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }
  }, []);

  const fetchPostalCodes = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    try {
      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=postalCode`,
      );
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching postal codes:", error);
      return [];
    }
  }, []);

  const handleSubDistrictChange = useCallback(
    (value) => {
      handleAddressInputChange("subDistrict", value);
    },
    [handleAddressInputChange],
  );

  const handleSubDistrictSelect = useCallback(
    (option) => {
      if (!option) return;

      console.log("Selected subdistrict option:", option);
      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            subDistrict: option.text || option.name || "",
            district: option.district || "",
            province: option.province || "",
            postalCode: option.postalCode || "",
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  const handleDistrictChange = useCallback(
    (value) => {
      handleAddressInputChange("district", value);
    },
    [handleAddressInputChange],
  );

  const handleDistrictSelect = useCallback(
    (option) => {
      if (!option) return;

      console.log("Selected district option:", option);
      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            district: option.text || option.name || "",
            province: option.province || "",
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  const handleProvinceChange = useCallback(
    (value) => {
      handleAddressInputChange("province", value);
    },
    [handleAddressInputChange],
  );

  const handlePostalCodeChange = useCallback(
    (value) => {
      handleAddressInputChange("postalCode", value);
    },
    [handleAddressInputChange],
  );

  const handlePostalCodeSelect = useCallback(
    (option) => {
      if (!option) return;

      console.log("Selected postal code option:", option);
      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            subDistrict: option.subdistrict || option.subDistrict || "",
            district: option.district || "",
            province: option.province || "",
            postalCode: option.text || option.postalCode || "",
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  return (
    <div
      data-section="addresses"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Address Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">ที่อยู่</h3>
        <p className="text-blue-100 text-sm mt-1">ข้อมูลที่อยู่และการติดต่อ</p>
      </div>

      {/* Address Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">หมายเหตุสำคัญ</h4>
              <div className="mt-1 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    บังคับ: กรุณากรอกที่อยู่ให้ครบ <strong>ทั้ง 3 ประเภท</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Address Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {["1", "2", "3"].map((type) => {
            const config = addressTypes[type];
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => {
                  manualTabOverrideRef.current = true;
                  setActiveTab(type);
                }}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? `bg-${config.color}-600 text-white shadow-sm`
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }
                `}
              >
                <span>{config.label}</span>
                {type === "2" && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-1 font-semibold">
                    สำคัญ
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Copy Address Buttons - แสดงเฉพาะในแท็บ "ที่อยู่จัดส่งเอกสาร" และ "ที่อยู่ใบกำกับภาษี" */}
        {(activeTab === "2" || activeTab === "3") && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-green-800">คัดลอกที่อยู่จากที่อยู่สำนักงาน</span>
              </div>
              <button
                type="button"
                onClick={() => copyAddressFromOffice(activeTab)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>คัดลอกที่อยู่</span>
              </button>
            </div>
          </div>
        )}

        {/* Address Details Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-base font-medium text-gray-900">
                {addressTypes[activeTab].label}
              </h4>
              <p className="text-sm text-gray-500">
                {activeTab === "1" && "ที่อยู่สำนักงานหลัก"}
                {activeTab === "2" && "ที่อยู่สำหรับการจัดส่งเอกสาร"}
                {activeTab === "3" && "ที่อยู่ตามใบกำกับภาษี"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Number */}
            <div className="space-y-2">
              <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-900">
                บ้านเลขที่
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="addressNumber"
                name="addressNumber"
                data-field={`address_${activeTab}_addressNumber`}
                value={getCurrentAddress().addressNumber || ""}
                onChange={(e) => handleAddressInputChange("addressNumber", e.target.value)}
                placeholder="กรอกบ้านเลขที่"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${
                    errors?.[`addresses.${activeTab}.addressNumber`]
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  bg-white
                `}
              />
              {errors?.[`addresses.${activeTab}.addressNumber`] && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors[`addresses.${activeTab}.addressNumber`]}
                </p>
              )}
            </div>

            {/* Building */}
            <div className="space-y-2">
              <label htmlFor="building" className="block text-sm font-medium text-gray-900">
                อาคาร/หมู่บ้าน
              </label>
              <input
                type="text"
                id="building"
                name="building"
                value={getCurrentAddress().building || ""}
                onChange={(e) => handleAddressInputChange("building", e.target.value)}
                placeholder="กรอกชื่ออาคารหรือหมู่บ้าน (ถ้ามี)"
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
              />
            </div>

            {/* Moo */}
            <div className="space-y-2">
              <label htmlFor="moo" className="block text-sm font-medium text-gray-900">
                หมู่
              </label>
              <input
                type="text"
                id="moo"
                name="moo"
                value={getCurrentAddress().moo || ""}
                onChange={(e) => handleAddressInputChange("moo", e.target.value)}
                placeholder="กรอกหมู่ที่"
                disabled={isLoading}
                className="
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                "
              />
            </div>

            {/* Soi */}
            <div className="space-y-2">
              <label htmlFor="soi" className="block text-sm font-medium text-gray-900">
                ซอย
              </label>
              <input
                type="text"
                id="soi"
                name="soi"
                value={getCurrentAddress().soi || ""}
                onChange={(e) => handleAddressInputChange("soi", e.target.value)}
                placeholder="กรอกซอย"
                disabled={isLoading}
                className="
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                "
              />
            </div>

            {/* Road */}
            <div className="space-y-2">
              <label htmlFor="road" className="block text-sm font-medium text-gray-900">
                ถนน
              </label>
              <input
                type="text"
                id="road"
                name="road"
                value={getCurrentAddress().road || ""}
                onChange={(e) => handleAddressInputChange("road", e.target.value)}
                placeholder="กรอกถนน"
                disabled={isLoading}
                className="
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                "
              />
            </div>

            {/* Sub District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="ตำบล/แขวง"
                placeholder="พิมพ์เพื่อค้นหาตำบล/แขวง"
                value={getCurrentAddress().subDistrict || ""}
                onChange={handleSubDistrictChange}
                onSelect={handleSubDistrictSelect}
                fetchOptions={fetchSubDistricts}
                isRequired={true}
                isReadOnly={false}
                error={errors?.[`addresses.${activeTab}.subDistrict`]}
                disabled={isLoading}
                containerProps={{ "data-field": `address_${activeTab}_subDistrict` }}
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="อำเภอ/เขต"
                placeholder="พิมพ์เพื่อค้นหาอำเภอ/เขต"
                value={getCurrentAddress().district || ""}
                onChange={handleDistrictChange}
                onSelect={handleDistrictSelect}
                fetchOptions={fetchDistricts}
                isRequired={true}
                isReadOnly={true}
                error={errors?.[`addresses.${activeTab}.district`]}
                containerProps={{ "data-field": `address_${activeTab}_district` }}
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <SearchableDropdown
                label="จังหวัด"
                placeholder="พิมพ์เพื่อค้นหาจังหวัด"
                value={getCurrentAddress().province || ""}
                onChange={handleProvinceChange}
                fetchOptions={fetchProvinces}
                isRequired={true}
                isReadOnly={true}
                error={errors?.[`addresses.${activeTab}.province`]}
                containerProps={{ "data-field": `address_${activeTab}_province` }}
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <SearchableDropdown
                label="รหัสไปรษณีย์"
                placeholder="รหัสไปรษณีย์"
                value={getCurrentAddress().postalCode || ""}
                onChange={handlePostalCodeChange}
                onSelect={handlePostalCodeSelect}
                fetchOptions={fetchPostalCodes}
                isRequired={true}
                isReadOnly={false}
                error={errors?.[`addresses.${activeTab}.postalCode`]}
                autoFillNote={getCurrentAddress().postalCode ? "* ข้อมูลถูกดึงอัตโนมัติ" : null}
                disabled={isLoading}
                containerProps={{ "data-field": `address_${activeTab}_postalCode` }}
              />
            </div>

            {/* Company Phone */}
            <div className="lg:col-span-2 space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                โทรศัพท์ / โทรศัพท์มือถือ
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={getCurrentAddress().phone || ""}
                    onChange={(e) => handleAddressInputChange("phone", e.target.value)}
                    placeholder="02-123-4567"
                    disabled={isLoading}
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors?.[`addresses.${activeTab}.phone`]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }
                    `}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="phoneExtension"
                    name="phoneExtension"
                    value={getCurrentAddress().phoneExtension || ""}
                    onChange={(e) => handleAddressInputChange("phoneExtension", e.target.value)}
                    placeholder="ต่อ (ถ้ามี)"
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-gray-400"
                  />
                </div>
              </div>
              {errors?.[`addresses.${activeTab}.phone`] && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors[`addresses.${activeTab}.phone`]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor={`email-${activeTab}`}
                className="block text-sm font-medium text-gray-900"
              >
                อีเมล
              </label>
              <input
                type="email"
                id={`email-${activeTab}`}
                name="email"
                value={getCurrentAddress().email || ""}
                onChange={(e) => handleAddressInputChange("email", e.target.value)}
                placeholder="กรอกอีเมล"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${
                    errors?.[`addresses.${activeTab}.email`]
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
              />
              {errors?.[`addresses.${activeTab}.email`] && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors[`addresses.${activeTab}.email`]}
                </p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label
                htmlFor={`website-${activeTab}`}
                className="block text-sm font-medium text-gray-900"
              >
                เว็บไซต์
              </label>
              <input
                type="url"
                id={`website-${activeTab}`}
                name="website"
                value={getCurrentAddress().website || ""}
                onChange={(e) => handleAddressInputChange("website", e.target.value)}
                placeholder="กรอกเว็บไซต์ (ถ้ามี)"
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white placeholder-gray-400"
              />
              {/* Helper note for website format */}
              <p className="text-xs text-red-600">
               กรุณากรอกเป็นลิงก์เต็มรูปแบบ โดยขึ้นต้นด้วย https:// เช่น https://www.google.com
              </p>
              {errors?.[`addresses.${activeTab}.website`] && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors[`addresses.${activeTab}.website`]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AddressSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
};

AddressSection.defaultProps = {
  errors: {},
  isLoading: false,
};
