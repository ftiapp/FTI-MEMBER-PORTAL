import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch logo status data from the API
 * @param {number} userId - The user ID to fetch logo status for
 * @returns {Object} - Object containing logo updates, loading state, and error state
 */
export default function useLogoStatus(userId) {
  const [logoUpdates, setLogoUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogoUpdates = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/operation-status/logo-status?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error response: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setLogoUpdates(data.updates || []);
        } else {
          throw new Error(data.message || 'Failed to fetch logo status');
        }
      } catch (err) {
        console.error('useLogoStatus:', err);
        setError(err.message);
        setLogoUpdates([{
          id: Date.now(),
          title: 'อัปเดตโลโก้บริษัท',
          description: 'ไม่สามารถโหลดข้อมูลได้',
          status: 'error',
          created_at: new Date().toISOString(),
          type: 'อัปเดตโลโก้บริษัท'
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogoUpdates();
  }, [userId]);

  return { logoUpdates, loading, error };
}
