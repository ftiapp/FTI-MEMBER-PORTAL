/**
 * Custom Hook for Fetching Industrial Groups and Provincial Chapters
 * Handles API calls to MSSQL database
 */

import { useState, useEffect } from "react";

let cachedIndustrialGroups = null;
let cachedProvincialChapters = null;
let cachedError = null;
let inFlightPromise = null;

export const useIndustrialGroups = () => {
  const [industrialGroups, setIndustrialGroups] = useState([]);
  const [provincialChapters, setProvincialChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (cachedIndustrialGroups && cachedProvincialChapters) {
        setIndustrialGroups(cachedIndustrialGroups);
        setProvincialChapters(cachedProvincialChapters);
        setError(cachedError);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (!inFlightPromise) {
          inFlightPromise = (async () => {
            const industrialGroupsResponse = await fetch("/api/industrial-groups");
            let formattedIndustrialGroups = [];
            if (industrialGroupsResponse.ok) {
              const industrialGroupsData = await industrialGroupsResponse.json();
              formattedIndustrialGroups = Array.isArray(industrialGroupsData?.data)
                ? industrialGroupsData.data.map((item) => ({
                    id: item.MEMBER_GROUP_CODE,
                    name_th: item.MEMBER_GROUP_NAME,
                    name_en: item.MEMBER_GROUP_NAME,
                  }))
                : [];
            } else {
              console.error("❌ Failed to fetch industrial groups:", industrialGroupsResponse.status);
            }

            const provincialChaptersResponse = await fetch("/api/province-groups");
            let formattedProvincialChapters = [];
            if (provincialChaptersResponse.ok) {
              const provincialChaptersData = await provincialChaptersResponse.json();
              formattedProvincialChapters = Array.isArray(provincialChaptersData?.data)
                ? provincialChaptersData.data.map((item) => ({
                    id: item.MEMBER_GROUP_CODE,
                    name_th: item.MEMBER_GROUP_NAME,
                    name_en: item.MEMBER_GROUP_NAME,
                  }))
                : [];
            } else {
              console.error(
                "❌ Failed to fetch provincial chapters:",
                provincialChaptersResponse.status,
              );
            }

            return {
              industrialGroups: formattedIndustrialGroups,
              provincialChapters: formattedProvincialChapters,
              error: null,
            };
          })();
        }

        const result = await inFlightPromise;

        cachedIndustrialGroups = result.industrialGroups;
        cachedProvincialChapters = result.provincialChapters;
        cachedError = result.error;

        setIndustrialGroups(result.industrialGroups);
        setProvincialChapters(result.provincialChapters);
        setError(result.error);
      } catch (err) {
        console.error("❌ Error fetching industrial groups data:", err);
        cachedError = err?.message || String(err);
        setError(cachedError);
      } finally {
        inFlightPromise = null;
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    industrialGroups,
    provincialChapters,
    isLoading,
    error,
  };
};
