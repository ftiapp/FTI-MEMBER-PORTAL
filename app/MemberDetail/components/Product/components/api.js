'use client';

/**
 * Fetch TSIC codes for a member
 * @param {string} memberCode - The member code
 * @returns {Array} - Array of TSIC codes with status
 */
export async function fetchTsicCodes(memberCode) {
  try {
    const response = await fetch(`/api/member/get-tsic-codes?member_code=${memberCode}`);
    const data = await response.json();
    
    if (data.success) {
      // Combine approved codes and pending requests
      let allCodes = [];
      
      // Add approved codes
      if (data.approvedCodes && data.approvedCodes.length > 0) {
        allCodes = data.approvedCodes.map(code => ({
          ...code,
          status: 'approved'
        }));
      }
      
      // Add pending requests (most recent first)
      if (data.pendingRequests && data.pendingRequests.length > 0) {
        const latestRequest = data.pendingRequests[0];
        if (latestRequest.status === 'pending') {
          // Parse the tsic_data if it's a JSON string
          let tsicData = latestRequest.tsic_data;
          if (typeof tsicData === 'string') {
            try {
              tsicData = JSON.parse(tsicData);
            } catch (e) {
              console.error('Error parsing tsic_data:', e);
              tsicData = [];
            }
          }
          
          if (Array.isArray(tsicData) && tsicData.length > 0) {
            allCodes = tsicData.map(code => ({
              ...code,
              status: 'pending',
              request_id: latestRequest.id
            }));
          }
        } else if (latestRequest.status === 'rejected' && allCodes.length === 0) {
          // Only show rejected if there are no approved codes
          let tsicData = latestRequest.tsic_data;
          if (typeof tsicData === 'string') {
            try {
              tsicData = JSON.parse(tsicData);
            } catch (e) {
              console.error('Error parsing tsic_data:', e);
              tsicData = [];
            }
          }
          
          if (Array.isArray(tsicData) && tsicData.length > 0) {
            allCodes = tsicData.map(code => ({
              ...code,
              status: 'rejected',
              admin_comment: latestRequest.admin_comment,
              request_id: latestRequest.id
            }));
          }
        }
      }
      
      return allCodes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching TSIC codes:', error);
    return [];
  }
}

// Cache for categories to avoid repeated API calls
let categoriesCache = null;

/**
 * Fetch all TSIC categories
 * @returns {Array} - Array of TSIC categories
 */
export async function fetchAllCategories(query = '') {
  try {
    // Use cached data if available and not searching
    if (categoriesCache && !query) {
      return categoriesCache;
    }
    
    const response = await fetch(`/api/tsic-categories?q=${query}`);
    const data = await response.json();
    const results = data.results || [];
    
    // Cache results if this is a full fetch
    if (!query) {
      categoriesCache = results;
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching TSIC categories:', error);
    return [];
  }
}

/**
 * Fetch TSIC code suggestions
 * @param {string} query - Search query
 * @param {string} categoryCode - Category code
 * @returns {Array} - Array of TSIC code suggestions
 */
export async function fetchTsicSuggestions(query, categoryCode) {
  if (!categoryCode) return [];
  
  try {
    // Add limit=1000 to get all codes, not just the default 50
    const url = `/api/tsic-codes?category_code=${encodeURIComponent(categoryCode)}${query ? `&q=${encodeURIComponent(query)}` : ''}&limit=1000`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Get results and sort them by TSIC code
    const results = data.results || data || [];
    results.sort((a, b) => {
      const codeA = a.tsic_code || a.code || '';
      const codeB = b.tsic_code || b.code || '';
      return codeA.localeCompare(codeB);
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching TSIC suggestions:', error);
    return [];
  }
}

/**
 * Submit TSIC update request
 * @param {number} userId - User ID
 * @param {string} memberCode - Member code
 * @param {Array} tsicCodes - Array of TSIC codes
 * @returns {Object} - Result with success status and message
 */
export async function submitTsicUpdate(userId, memberCode, tsicCodes) {
  try {
    const response = await fetch('/api/member/request-tsic-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        memberCode,
        tsicCodes
      })
    });
    
    const data = await response.json();
    
    // If response is not OK but we have data, return the data with error details
    if (!response.ok) {
      console.warn('TSIC update request failed:', data);
      
      // Handle specific error codes
      if (data.code === 'PENDING_REQUEST_EXISTS') {
        return {
          success: false,
          code: data.code,
          message: data.message || 'มีคำขอที่รอการอนุมัติอยู่แล้ว',
          details: data.details || {},
          help: data.help || 'กรุณารอการอนุมัติหรือติดต่อเจ้าหน้าที่เพื่อยกเลิกคำขอเดิมก่อน'
        };
      }
      
      // Return the error data from the server
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting TSIC update:', error);
    return { 
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
      details: error.message
    };
  }
}