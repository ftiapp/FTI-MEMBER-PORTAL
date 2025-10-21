"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  initializeAddresses,
  getCurrentAddress,
  findFirstErrorTab,
  scrollToAddressSection,
  createErrorSignature,
} from "./addressUtils";

/**
 * Custom hook สำหรับจัดการ logic ที่อยู่
 */
export default function useAddressHandlers(formData, setFormData, errors) {
  const [activeTab, setActiveTab] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const prevErrorSig = useRef("");

  // Initialize addresses if not exists
  useEffect(() => {
    if (!formData.addresses) {
      setFormData((prev) => ({
        ...prev,
        addresses: initializeAddresses(),
      }));
    }
  }, [formData.addresses, setFormData]);

  // Auto-switch to tab with errors
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) {
      prevErrorSig.current = "";
      return;
    }

    const errorSig = createErrorSignature(errors);
    if (errorSig === prevErrorSig.current || !errorSig) return;

    prevErrorSig.current = errorSig;
    const errorTab = findFirstErrorTab(errors);

    if (errorTab && errorTab !== activeTab) {
      setActiveTab(errorTab);
      scrollToAddressSection();
    }
  }, [errors, activeTab]);

  // Get current address
  const currentAddress = getCurrentAddress(formData.addresses, activeTab);

  // Handle input change
  const handleInputChange = useCallback(
    (name, value) => {
      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            [name]: value,
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  // Fetch functions
  const fetchSubDistricts = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];

      try {
        const currentAddr = getCurrentAddress(formData.addresses, activeTab);
        const province = currentAddr.province;
        const district = currentAddr.district;

        let url = `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=subdistrict`;
        if (province) url += `&province=${encodeURIComponent(province)}`;
        if (district) url += `&district=${encodeURIComponent(district)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`ไม่สามารถค้นหาข้อมูลตำบลได้: ${response.status}`);

        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching subdistricts:", error);
        return [];
      }
    },
    [formData.addresses, activeTab],
  );

  const fetchDistricts = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];

      try {
        const currentAddr = getCurrentAddress(formData.addresses, activeTab);
        const province = currentAddr.province;

        let url = `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=district`;
        if (province) url += `&province=${encodeURIComponent(province)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`ไม่สามารถค้นหาข้อมูลอำเภอได้: ${response.status}`);

        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching districts:", error);
        return [];
      }
    },
    [formData.addresses, activeTab],
  );

  const fetchProvinces = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    try {
      const response = await fetch(
        `/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=province`,
      );
      if (!response.ok) throw new Error(`ไม่สามารถค้นหาข้อมูลจังหวัดได้: ${response.status}`);

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
      if (!response.ok) throw new Error(`ไม่สามารถค้นหาข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching postal codes:", error);
      return [];
    }
  }, []);

  // Location handlers
  const handleSubDistrictChange = useCallback(
    (value) => {
      handleInputChange("subDistrict", value);
    },
    [handleInputChange],
  );

  const handleSubDistrictSelect = useCallback(
    (option) => {
      if (!option) return;

      const hasFullAddressInfo = option.district && option.province && option.postalCode;

      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            subDistrict: option.text || option.name || "",
            ...(hasFullAddressInfo && {
              district: option.district || "",
              province: option.province || "",
              postalCode: option.postalCode || "",
            }),
            addressType: activeTab,
          },
        },
      }));

      if (hasFullAddressInfo) {
        toast.success("ข้อมูลที่อยู่ถูกเติมอัตโนมัติแล้ว");
      }
    },
    [setFormData, activeTab],
  );

  const handleDistrictChange = useCallback(
    (value) => {
      handleInputChange("district", value);
    },
    [handleInputChange],
  );

  const handleDistrictSelect = useCallback(
    (option) => {
      if (!option) return;

      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            district: option.text || option.name || "",
            province: option.province || prev.addresses?.[activeTab]?.province || "",
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  const handleProvinceChange = useCallback(
    (value) => {
      handleInputChange("province", value);
    },
    [handleInputChange],
  );

  const handleProvinceSelect = useCallback(
    (option) => {
      if (!option) return;

      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [activeTab]: {
            ...prev.addresses?.[activeTab],
            province: option.text || option.name || "",
            addressType: activeTab,
          },
        },
      }));
    },
    [setFormData, activeTab],
  );

  const handlePostalCodeChange = useCallback(
    (value) => {
      handleInputChange("postalCode", value);
    },
    [handleInputChange],
  );

  const handlePostalCodeSelect = useCallback(
    (option) => {
      if (!option) return;

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

      toast.success("ข้อมูลที่อยู่ถูกเติมจากรหัสไปรษณีย์แล้ว");
    },
    [setFormData, activeTab],
  );

  return {
    activeTab,
    setActiveTab,
    currentAddress,
    isLoading,
    setIsLoading,
    handleInputChange,
    handlers: {
      handleSubDistrictChange,
      handleSubDistrictSelect,
      handleDistrictChange,
      handleDistrictSelect,
      handleProvinceChange,
      handleProvinceSelect,
      handlePostalCodeChange,
      handlePostalCodeSelect,
    },
    fetchFunctions: {
      fetchSubDistricts,
      fetchDistricts,
      fetchProvinces,
      fetchPostalCodes,
    },
  };
}
