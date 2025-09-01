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
        setTsicUpdates([]);
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
          // Gracefully handle no data cases instead of throwing
          const msg = (data.message || '').toLowerCase();
          if (
            msg.includes('no member codes') ||
            msg.includes('not found') ||
            Array.isArray(data.tsicUpdates) && data.tsicUpdates.length === 0
          ) {
            // Treat as empty state
            setTsicUpdates([]);
            setError(null);
          } else {
            throw new Error(data.message || 'Failed to fetch TSIC code update status');
          }
        }
      } catch (err) {
        console.error('useTsicStatus:', err);
        setError(err.message);
        setTsicUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTsicStatus();
  }, [userId]);

  return { tsicUpdates, isLoading, error };
};

export default useTsicStatus;
