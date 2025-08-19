'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { normalizeApplicationData } from '../ีutils/dataTransformers';

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
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response has content before parsing
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch application');
        }
        
        const normalizedData = normalizeApplicationData(data.data, type);
        setApplication(normalizedData);
        
        // Fetch additional data for IC type
        if (type === 'ic') {
          await fetchAdditionalData();
        }
      } catch (err) {
        console.error('Error fetching application:', err);
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
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
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
        fetchWithErrorHandling('/api/industrial-groups'),
        fetchWithErrorHandling('/api/provincial-chapters')
      ]);
      
      // Process industrial groups
      if (groupsData && groupsData.success && Array.isArray(groupsData.data)) {
        const groupsMap = {};
        groupsData.data.forEach(group => {
          if (group && group.id) {
            groupsMap[group.id] = group.name || '';
          }
        });
        setIndustrialGroups(groupsMap);
      }
      
      // Process provincial chapters
      if (chaptersData && chaptersData.success && Array.isArray(chaptersData.data)) {
        const chaptersMap = {};
        chaptersData.data.forEach(chapter => {
          if (chapter && chapter.id) {
            chaptersMap[chapter.id] = chapter.name || '';
          }
        });
        setProvincialChapters(chaptersMap);
      }
    } catch (err) {
      console.error('Error fetching additional data:', err);
      // Don't throw error here as this is supplementary data
    }
  };
  
  const updateApplication = (updates) => {
    setApplication(prev => {
      if (!prev) return updates;
      return { ...prev, ...updates };
    });
  };
  
  return {
    application,
    isLoading,
    error,
    industrialGroups,
    provincialChapters,
    updateApplication
  };
};