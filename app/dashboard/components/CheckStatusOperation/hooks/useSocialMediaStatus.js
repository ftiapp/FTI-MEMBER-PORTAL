import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch social media update status from the user log
 * @param {string} userId - The user ID to fetch social media updates for
 * @returns {Object} - The social media update status data, loading state, and error state
 */
const useSocialMediaStatus = (userId) => {
  const [socialMediaUpdates, setSocialMediaUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSocialMediaUpdates = async () => {
      // Don't fetch if no userId is provided
      if (!userId) {
        console.log('useSocialMediaStatus: No userId provided, skipping fetch');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('useSocialMediaStatus: Fetching social media updates for userId:', userId);
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/dashboard/operation-status/social-media-status?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('useSocialMediaStatus: Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('useSocialMediaStatus: Error response:', errorText);
          throw new Error(`Failed to fetch social media updates: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('useSocialMediaStatus: Received data:', data);
        setSocialMediaUpdates(data.updates || []);
      } catch (err) {
        console.error('useSocialMediaStatus: Error fetching social media updates:', err);
        setError(err.message);
        setSocialMediaUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialMediaUpdates();
  }, [userId]);

  return { socialMediaUpdates, isLoading, error };
};

export default useSocialMediaStatus;
