import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch TSIC code update status
 * @param {string} userId - The user ID to fetch TSIC code update status for
 * @returns {Object} - The TSIC code update status data, loading state, and error state
 */
const useTsicStatus = (userId) => {
  const [tsicUpdates, setTsicUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTsicStatus = async () => {
      if (!userId) {
        setIsLoading(false);
        setTsicUpdates([{
          id: 'no-user-id',
          status: 'none',
          description: 'ไม่พบข้อมูลผู้ใช้',
          created_at: new Date().toISOString()
        }]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard/operation-status/tsic-status?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error response: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTsicUpdates(data.tsicUpdates || []);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch TSIC code update status');
        }
      } catch (err) {
        console.error('useTsicStatus:', err);
        setError(err.message);
        setTsicUpdates([{
          id: Date.now(),
          title: 'อัปเดตรหัส TSIC',
          description: 'ไม่สามารถโหลดข้อมูลได้',
          status: 'error',
          created_at: new Date().toISOString(),
          type: 'อัปเดตรหัส TSIC'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTsicStatus();
  }, [userId]);

  return { tsicUpdates, isLoading, error };
};

export default useTsicStatus;
