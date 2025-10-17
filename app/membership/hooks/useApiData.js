/**
 * Shared hook for fetching membership form API data
 * Used by all membership forms (AC, OC, IC, AM)
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

export const useApiData = () => {
  const [data, setData] = useState({
    businessTypes: [],
    industrialGroups: [],
    provincialChapters: [],
    isLoading: true,
    error: null,
  });

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));

        const [businessTypesRes, industrialGroupsRes, provincialChaptersRes] = await Promise.all([
          fetch("/api/business-types", { signal: abortControllerRef.current.signal }),
          fetch("/api/industrial-groups?limit=1000&page=1", {
            signal: abortControllerRef.current.signal,
          }),
          fetch("/api/provincial-chapters?limit=1000&page=1", {
            signal: abortControllerRef.current.signal,
          }),
        ]);

        const businessTypes = businessTypesRes.ok ? await businessTypesRes.json() : [];

        const industrialGroups = industrialGroupsRes.ok
          ? (await industrialGroupsRes.json()).data?.map((item) => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME,
            })) || []
          : [];

        const provincialChapters = provincialChaptersRes.ok
          ? (await provincialChaptersRes.json()).data?.map((item) => ({
              id: item.MEMBER_GROUP_CODE,
              name_th: item.MEMBER_GROUP_NAME,
              name_en: item.MEMBER_GROUP_NAME,
            })) || []
          : [];

        setData({
          businessTypes,
          industrialGroups,
          provincialChapters,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        console.error("Error fetching data:", error);
        const errorMessage = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
        toast.error(errorMessage);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return data;
};
