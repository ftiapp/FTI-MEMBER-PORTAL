import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch verification status for a user
 * @param {string} userId - The user ID to fetch verification status for
 * @returns {Object} - The verification status data and loading state
 */
const useVerificationStatus = (userId) => {
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    fetch(`/api/member/verification-status?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        let merged = [];
        if (data.verifications && Array.isArray(data.verifications)) {
          merged = data.verifications.filter(v => v.Admin_Submit !== 3);
        } else if (data.submitted && data.memberData && data.memberData.Admin_Submit !== 3) {
          merged = [{
            id: data.memberData.id || Date.now(),
            MEMBER_CODE: data.memberData.MEMBER_CODE || '',
            company_name: data.memberData.company_name || '',
            company_type: data.memberData.company_type || '',
            tax_id: data.memberData.tax_id || '',
            Admin_Submit: data.approved ? 1 : data.rejected ? 2 : 0,
            reject_reason: data.rejectReason || '',
            created_at: data.memberData.created_at || new Date().toISOString()
          }];
        }
        setVerifications(merged);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  return { verifications, isLoading };
};

export default useVerificationStatus;
