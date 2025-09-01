import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch product update status for a user
 * @param {string} userId - The user ID to fetch product update status for
 * @returns {Array} - The product update status data
 */
const useProductUpdateStatus = (userId) => {
  const [productUpdates, setProductUpdates] = useState([]);
  
  useEffect(() => {
    if (!userId) return;
    
    console.log('Fetching product update status for user:', userId);
    
    fetch(`/api/dashboard/operation-status/product-update-status?userId=${userId}`, {
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Product update API response:', data);
        if (data.success && Array.isArray(data.updates) && data.updates.length > 0) {
          setProductUpdates(data.updates);
        } else {
          // No updates -> leave empty so nothing renders
          setProductUpdates([]);
        }
      })
      .catch(error => {
        console.error('Error fetching product update status:', error);
        setProductUpdates([]);
      });
  }, [userId]);

  return productUpdates;
};

export default useProductUpdateStatus;
