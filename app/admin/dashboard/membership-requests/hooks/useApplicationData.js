"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { normalizeApplicationData } from "../ีutils/dataTransformers";

export const useApplicationData = (type, id) => {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industrialGroups, setIndustrialGroups] = useState({});
  const [provincialChapters, setProvincialChapters] = useState({});

  useEffect(() => {
    if (!type || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch application data with error handling
        const response = await fetch(`/api/admin/membership-requests/${type}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response has content before parsing
        const text = await response.text();
        if (!text) {
          throw new Error("Empty response from server");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error("Response text:", text);
          throw new Error("Invalid JSON response from server");
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch application");
        }

        const normalizedData = normalizeApplicationData(data.data, type);
        setApplication(normalizedData);
        // Always fetch additional data (industrial groups and provincial chapters)
        // for all types (OC/AC/AM/IC) so admin dropdowns have data
        await fetchAdditionalData();
      } catch (err) {
        console.error("Error fetching application:", err);
        setError(err.message);
        toast.error(`ไม่สามารถดึงข้อมูลได้: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  const fetchAdditionalData = async () => {
    try {
      // Fetch industrial groups with error handling
      const fetchWithErrorHandling = async (url) => {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return null;
          }

          const text = await response.text();
          if (!text) {
            console.warn(`Empty response from ${url}`);
            return null;
          }

          return JSON.parse(text);
        } catch (error) {
          console.warn(`Error fetching ${url}:`, error);
          return null;
        }
      };

      const [groupsData, chaptersData] = await Promise.all([
        // Request larger limits so admin can see all options
        fetchWithErrorHandling("/api/industrial-groups?limit=500"),
        fetchWithErrorHandling("/api/provincial-chapters?limit=300"),
      ]);

      // Process industrial groups as array of { id, name, code }
      if ((groupsData && Array.isArray(groupsData?.data)) || Array.isArray(groupsData)) {
        const rawGroups = Array.isArray(groupsData) ? groupsData : groupsData.data;
        const groupsArray = rawGroups
          .map((group) => {
            if (!group) return null;
            // Support MSSQL field names and normalized API format
            const id = group.id || group.MEMBER_GROUP_CODE || group.code;
            const name =
              group.name || group.MEMBER_GROUP_NAME_TH || group.MEMBER_GROUP_NAME || group.name_th;
            const code = group.MEMBER_GROUP_CODE || group.code || id;
            if (!id || !name) return null;
            return { id: String(id), name: String(name), code: String(code) };
          })
          .filter(Boolean);
        // Dedupe by id
        const uniqueGroups = Array.from(
          groupsArray.reduce((map, item) => map.set(item.id, item), new Map()).values(),
        );
        setIndustrialGroups(uniqueGroups);
      }

      // Process provincial chapters as array of { id, name, code }
      if ((chaptersData && Array.isArray(chaptersData?.data)) || Array.isArray(chaptersData)) {
        const rawChapters = Array.isArray(chaptersData) ? chaptersData : chaptersData.data;
        const chaptersArray = rawChapters
          .map((chapter) => {
            if (!chapter) return null;
            const id = chapter.id || chapter.MEMBER_GROUP_CODE || chapter.code;
            const name =
              chapter.name ||
              chapter.MEMBER_GROUP_NAME_TH ||
              chapter.MEMBER_GROUP_NAME ||
              chapter.name_th;
            const code = chapter.MEMBER_GROUP_CODE || chapter.code || id;
            if (!id || !name) return null;
            return { id: String(id), name: String(name), code: String(code) };
          })
          .filter(Boolean);
        // Dedupe by id
        const uniqueChapters = Array.from(
          chaptersArray.reduce((map, item) => map.set(item.id, item), new Map()).values(),
        );
        setProvincialChapters(uniqueChapters);
      }
    } catch (err) {
      console.error("Error fetching additional data:", err);
      // Don't throw error here as this is supplementary data
    }
  };

  const updateApplication = (updates) => {
    setApplication((prev) => {
      if (!prev) {
        // If no previous data, normalize the new data
        return normalizeApplicationData(updates, type);
      }
      
      // Check if this is a full data replacement (has 'id' field) or partial update
      if (updates.id && updates.id === prev.id) {
        // Full data replacement - normalize it
        return normalizeApplicationData(updates, type);
      }
      
      // Partial update - merge with existing data
      return { ...prev, ...updates };
    });
  };

  return {
    application,
    isLoading,
    error,
    industrialGroups,
    provincialChapters,
    updateApplication,
  };
};
