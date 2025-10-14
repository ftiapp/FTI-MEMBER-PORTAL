/**
 * Custom Hook for Fetching Industrial Groups and Provincial Chapters
 * Handles API calls to MSSQL database
 */

import { useState, useEffect } from "react";

export const useIndustrialGroups = () => {
  const [industrialGroups, setIndustrialGroups] = useState([]);
  const [provincialChapters, setProvincialChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch industrial groups from MSSQL
        const industrialGroupsResponse = await fetch("/api/industrial-groups");
        
        if (industrialGroupsResponse.ok) {
          const industrialGroupsData = await industrialGroupsResponse.json();
          
          // Format data from MSSQL structure
          const formattedIndustrialGroups = industrialGroupsData.data.map((item) => ({
            id: item.MEMBER_GROUP_CODE,
            name_th: item.MEMBER_GROUP_NAME,
            name_en: item.MEMBER_GROUP_NAME,
          }));
          
          setIndustrialGroups(formattedIndustrialGroups);
          console.log("✅ Industrial Groups loaded:", formattedIndustrialGroups.length);
        } else {
          console.error("❌ Failed to fetch industrial groups:", industrialGroupsResponse.status);
        }

        // Fetch provincial chapters from MSSQL
        const provincialChaptersResponse = await fetch("/api/province-groups");
        
        if (provincialChaptersResponse.ok) {
          const provincialChaptersData = await provincialChaptersResponse.json();
          
          // Format data from MSSQL structure
          const formattedProvincialChapters = provincialChaptersData.data.map((item) => ({
            id: item.MEMBER_GROUP_CODE,
            name_th: item.MEMBER_GROUP_NAME,
            name_en: item.MEMBER_GROUP_NAME,
          }));
          
          setProvincialChapters(formattedProvincialChapters);
          console.log("✅ Provincial Chapters loaded:", formattedProvincialChapters.length);
        } else {
          console.error("❌ Failed to fetch provincial chapters:", provincialChaptersResponse.status);
        }
      } catch (err) {
        console.error("❌ Error fetching industrial groups data:", err);
        setError(err.message);
      } finally {
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
