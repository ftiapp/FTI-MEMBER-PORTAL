'use client';

/**
 * Fetch TSIC codes for a member
 * @param {string} memberCode - The member code
 * @returns {Object} - Object with success status and data array of TSIC codes
 */
export async function fetchTsicCodes(memberCode) {
  if (!memberCode) {
    console.error('Member code is required');
    return { success: false, message: 'รหัสสมาชิกไม่ถูกต้อง', data: [] };
  }
  
  try {
    console.log(`Fetching TSIC codes for member: ${memberCode}`);
    
    // ใช้ endpoint ที่เราสร้างขึ้นใหม่เพื่อดึงข้อมูลจากตาราง member_tsic_codes โดยตรง
    const response = await fetch(`/api/member/tsic-codes/list?member_code=${encodeURIComponent(memberCode)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for authentication
    });
    
    // ตรวจสอบสถานะการตอบกลับ
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return { 
        success: false, 
        message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.statusText}`, 
        data: [] 
      };
    }
    
    // แปลงข้อมูล JSON
    const data = await response.json();
    console.log('TSIC codes API response:', data);
    
    if (data.success) {
      // ข้อมูลที่ได้รับอาจอยู่ในรูปแบบต่างๆ ขึ้นอยู่กับการตอบกลับของ API
      const tsicCodes = data.data || data.tsicCodes || data.codes || [];
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const formattedCodes = tsicCodes.map(code => ({
        tsic_code: code.tsic_code,
        category_code: code.category_code || '00',
        description: code.description || code.tsic_description || '',
        description_EN: code.description_EN || '',
        category_name: code.category_name || '',
        category_name_EN: code.category_name_EN || '',
        status: code.status || 'approved'
      }));
      
      return { success: true, data: formattedCodes };
    } else {
      return { success: false, message: data.message || 'ไม่สามารถดึงข้อมูลได้', data: [] };
    }
  } catch (error) {
    console.error('Error fetching TSIC codes:', error);
    return { 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', 
      data: [] 
    };
  }
}

/**
 * ฟังก์ชันใหม่ที่จะโหลดและเลือกรหัส TSIC โดยเฉพาะ
 * @param {string} memberCode - รหัสสมาชิก
 * @param {Array} mainCategories - รายการหมวดหมู่หลัก
 * @param {Function} setSelectedMainCategories - ฟังก์ชันสำหรับเซ็ตหมวดหมู่หลักที่เลือก
 * @param {Function} setSelectedSubcategories - ฟังก์ชันสำหรับเซ็ตหมวดหมู่ย่อยที่เลือก
 * @param {Function} fetchSubcategories - ฟังก์ชันสำหรับดึงข้อมูลหมวดหมู่ย่อย
 * @param {Object} subcategories - ข้อมูลหมวดหมู่ย่อยที่มีอยู่
 */
export async function preloadTsicCodes(memberCode, mainCategories, setSelectedMainCategories, setSelectedSubcategories, fetchSubcategories, subcategories) {
  try {
    console.log('Preloading TSIC codes for member:', memberCode);
    console.log('Available main categories:', mainCategories);
    
    // ดึงข้อมูลรหัส TSIC ที่มีอยู่
    const result = await fetchTsicCodes(memberCode);
    
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      console.log('Existing TSIC codes loaded:', result.data);
      
      // จัดกลุ่มรหัส TSIC ตามหมวดหมู่
      const selectedCategories = [];
      const selectedSubs = {};
      
      // รวบรวมหมวดหมู่ที่ไม่ซ้ำกัน
      const uniqueCategories = new Set();
      result.data.forEach(tsic => {
        if (tsic.category_code && tsic.category_code !== '00') {
          uniqueCategories.add(tsic.category_code);
        }
      });
      
      console.log('Unique category codes found:', Array.from(uniqueCategories));
      
      // สำหรับแต่ละหมวดหมู่
      for (const categoryCode of uniqueCategories) {
        // หาข้อมูลหมวดหมู่จาก mainCategories
        const category = mainCategories.find(c => c.category_code === categoryCode);
        console.log(`Looking for category ${categoryCode} in mainCategories:`, category);
        
        if (category) {
          selectedCategories.push(category);
          
          // ดึงข้อมูลหมวดหมู่ย่อยสำหรับหมวดหมู่นี้
          if (!subcategories[categoryCode] || subcategories[categoryCode].length === 0) {
            await fetchSubcategories(category);
          }
          
          // จัดกลุ่มรหัส TSIC ตามหมวดหมู่นี้
          const tsicsInCategory = result.data.filter(tsic => 
            tsic.category_code === categoryCode
          );
          
          console.log(`Found ${tsicsInCategory.length} TSIC codes for category ${categoryCode}:`, tsicsInCategory);
          
          // หาข้อมูลหมวดหมู่ย่อยที่สมบูรณ์จากหมวดหมู่ย่อยที่ดึงมา
          const subcategoryObjects = [];
          tsicsInCategory.forEach(tsic => {
            const subcategory = subcategories[categoryCode]?.find(sub => 
              sub.tsic_code === tsic.tsic_code
            );
            
            if (subcategory) {
              subcategoryObjects.push(subcategory);
            } else {
              // ถ้าไม่พบหมวดหมู่ย่อยที่ตรงกัน ให้สร้างข้อมูลชั่วคราว
              const placeholder = {
                tsic_code: tsic.tsic_code,
                description: tsic.description || '',
                display_description: tsic.description || '',
                display_description_EN: tsic.description || ''
              };
              console.log(`Creating placeholder for TSIC code ${tsic.tsic_code}:`, placeholder);
              subcategoryObjects.push(placeholder);
            }
          });
          
          selectedSubs[categoryCode] = subcategoryObjects;
          console.log(`Set selectedSubs for category ${categoryCode}:`, subcategoryObjects);
        } else {
          console.warn(`Category ${categoryCode} not found in mainCategories!`);
        }
      }
      
      // เซ็ตหมวดหมู่หลักและหมวดหมู่ย่อยที่เลือก
      console.log('Setting selected main categories:', selectedCategories);
      console.log('Setting selected subcategories:', selectedSubs);
      
      setSelectedMainCategories(selectedCategories);
      setSelectedSubcategories(selectedSubs);
      
      return true;
    } else {
      console.log('No existing TSIC codes found or error loading them');
      return false;
    }
  } catch (error) {
    console.error('Error preloading TSIC codes:', error);
    return false;
  }
}

// Cache for categories to avoid repeated API calls
let categoriesCache = null;
let mainCategoriesCache = null;

/**
 * Fetch main TSIC categories from tsic_description table
 * @param {string} query - Optional search query
 * @returns {Object} - Object with success status and data array of main categories
 */
export async function fetchMainCategories(query = '') {
  try {
    // Use cache if available and no query is provided
    if (mainCategoriesCache && !query) {
      console.log('Using cached main categories');
      return { success: true, data: mainCategoriesCache };
    }
    
    // Fetch main categories from API
    const response = await fetch(`/api/tsic/categories${query ? `?search=${encodeURIComponent(query)}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for authentication
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return { 
        success: false, 
        message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.statusText}`, 
        data: [] 
      };
    }
    
    const data = await response.json();
    console.log('Main categories API response:', data);
    
    if (data.success) {
      // Update cache if no query was provided
      if (!query) {
        mainCategoriesCache = data.data;
      }
      
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'ไม่พบข้อมูลหมวดหมู่ TSIC', data: [] };
  } catch (error) {
    console.error('Error fetching main categories:', error);
    return { 
      success: false, 
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 
      data: [] 
    };
  }
}

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
 * Delete a single TSIC code for a member
 * @param {string} memberCode - The member code
 * @param {string} tsicCode - The TSIC code to delete
 * @returns {Object} - Result with success status and message
 */
export async function deleteTsicCode(memberCode, tsicCode) {
  try {
    if (!memberCode || !tsicCode) {
      return {
        success: false,
        message: 'กรุณาระบุรหัสสมาชิกและรหัส TSIC'
      };
    }
    
    // Get user ID from session storage
    let userId = null;
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Check both userData.id and userData directly since the structure might vary
        userId = userData.id || userData.userId || (userData.user && userData.user.id);
        console.log('Found user ID in session storage:', userId);
      } catch (e) {
        console.error('Error parsing user data from session storage:', e);
      }
    }
    
    // Verify we have a user ID
    if (!userId) {
      console.error('No user ID found in session storage');
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'
      };
    }
    
    console.log(`Deleting TSIC code ${tsicCode} for member ${memberCode}`);
    
    // Call API to delete the TSIC code
    const response = await fetch('/api/member/tsic-codes/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        memberCode,
        tsicCode
      })
    });
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        return {
          success: false,
          message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          requiresLogin: true
        };
      }
      
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || `ไม่สามารถลบรหัส TSIC ${tsicCode} ได้`
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      message: 'ลบรหัส TSIC เรียบร้อยแล้ว',
      data
    };
  } catch (error) {
    console.error('Error deleting TSIC code:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'
    };
  }
}

/**
 * Submit TSIC update directly to member_tsic_codes table without admin approval
 * @param {string} email - User email (not used, but kept for backward compatibility)
 * @param {string} memberCode - Member code
 * @param {Array} tsicCodes - Array of TSIC codes
 * @param {string} replacingTsicCode - TSIC code to replace (optional)
 * @returns {Object} - Result with success status and message
 */
export async function submitTsicUpdate(email, memberCode, tsicCodes, replacingTsicCode = null) {
  try {
    console.log('submitTsicUpdate called with:', { email, memberCode, tsicCodes });
    
    // Check if we have valid tsicCodes
    if (!Array.isArray(tsicCodes) || tsicCodes.length === 0) {
      console.error('Invalid tsicCodes:', tsicCodes);
      return {
        success: false,
        message: 'กรุณาเลือกรหัส TSIC อย่างน้อย 1 รายการ'
      };
    }
    
    // Make sure all tsicCodes are strings
    const validTsicCodes = tsicCodes.map(code => String(code));

    // Check if memberCode is provided
    if (!memberCode) {
      return {
        success: false,
        message: 'กรุณาระบุรหัสสมาชิก'
      };
    }

    // Get user ID from session storage for direct use in API
    let userId = null;
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Check both userData.id and userData directly since the structure might vary
        userId = userData.id || userData.userId || (userData.user && userData.user.id);
        console.log('Found user ID in session storage:', userId);
      } catch (e) {
        console.error('Error parsing user data from session storage:', e);
      }
    }

    // Verify we have a user ID
    if (!userId) {
      console.error('No user ID found in session storage');
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'
      };
    }

    console.log('Submitting TSIC update with user ID:', userId);

    // Get the selected categories and their TSIC codes
    const tsicCodesWithCategories = [];
    
    // Organize TSIC codes by category
    // This assumes tsicCodes is an array of strings like '01101', '01102', etc.
    // We'll need to fetch the category for each TSIC code
    console.log('Fetching categories for TSIC codes:', validTsicCodes);
    const categoriesResponse = await fetch('/api/tsic/categories-for-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tsicCodes: validTsicCodes })
    });

    if (!categoriesResponse.ok) {
      throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
    }

    const categoriesData = await categoriesResponse.json();
    console.log('Categories data:', categoriesData);

    if (!categoriesData.success) {
      throw new Error(categoriesData.message || 'Error fetching categories');
    }
    
    // API สามารถส่งข้อมูลกลับมาได้ 2 รูปแบบ: 
    // 1. Object ที่มี key เป็น tsic_code และ value เป็น category_code
    // 2. Array ของ object ที่มี tsic_code และ category_code
    const categoryData = categoriesData.data || {};
    
    // ตรวจสอบว่าข้อมูลที่ได้รับเป็น array หรือ object
    if (Array.isArray(categoryData)) {
      // กรณีที่เป็น array
      for (const item of categoryData) {
        if (item && item.tsic_code) {
          tsicCodesWithCategories.push({
            tsic_code: item.tsic_code,
            category_code: item.category_code || '00', // Default to '00' if no category
            description: item.description || ''
          });
        }
      }
    } else {
      // กรณีที่เป็น object (key-value map)
      for (const tsicCode of validTsicCodes) {
        tsicCodesWithCategories.push({
          tsic_code: tsicCode,
          category_code: categoryData[tsicCode] || tsicCode.substring(0, 2) || '00',
          description: ''
        });
      }
    }

    console.log('TSIC codes with categories:', tsicCodesWithCategories);

    // Submit to the new direct update API
    const response = await fetch('/api/member/tsic-codes/direct-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        userId,
        memberCode,
        tsicCodes: tsicCodesWithCategories.length > 0 ? tsicCodesWithCategories : validTsicCodes.map(code => ({ category_code: '00', tsic_code: code })),
        replacingTsicCode // Include the TSIC code to replace if provided
      })
    });
    
    // ตรวจสอบสถานะ response
    console.log('TSIC update response status:', response.status);
    
    const data = await response.json();
    console.log('TSIC update response data:', data);
    
    if (!response.ok) {
      // ถ้าเป็น authentication error (401) ให้ลองรีเฟรชหน้าและลองใหม่
      if (response.status === 401) {
        console.warn('Authentication error, token might be invalid or expired');
        return {
          success: false,
          message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          requiresLogin: true
        };
      }
      
      console.warn('TSIC update failed:', data);
      return data;
    }
    
    return {
      success: true,
      message: 'บันทึกรหัส TSIC เรียบร้อยแล้ว',
      data: {
        codesAdded: tsicCodes.length
      }
    };
  } catch (error) {
    console.error('Error submitting TSIC update:', error);
    return { 
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'
    };
  }
}