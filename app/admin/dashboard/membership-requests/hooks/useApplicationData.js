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
        // Fetch application data
        const response = await fetch(`/api/admin/membership-requests/${type}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch application');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch application');
        
        const normalizedData = normalizeApplicationData(data.data, type);
        setApplication(normalizedData);
        
        // Fetch additional data for IC type
        if (type === 'ic') {
          await fetchAdditionalData();
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        setError(err.message);
        toast.error('ไม่สามารถดึงข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [type, id]);
  
  const fetchAdditionalData = async () => {
    try {
      // Fetch industrial groups
      const [groupsRes, chaptersRes] = await Promise.all([
        fetch('/api/industrial-groups'),
        fetch('/api/provincial-chapters')
      ]);
      
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        if (groupsData.success) {
          const groupsMap = {};
          groupsData.data.forEach(group => {
            groupsMap[group.id] = group.name;
          });
          setIndustrialGroups(groupsMap);
        }
      }
      
      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json();
        if (chaptersData.success) {
          const chaptersMap = {};
          chaptersData.data.forEach(chapter => {
            chaptersMap[chapter.id] = chapter.name;
          });
          setProvincialChapters(chaptersMap);
        }
      }
    } catch (err) {
      console.error('Error fetching additional data:', err);
    }
  };
  
  const updateApplication = (updates) => {
    setApplication(prev => ({ ...prev, ...updates }));
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
