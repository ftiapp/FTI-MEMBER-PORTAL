// services/thailandAddressService.js
// เรียกใช้ API Route ภายในแอป Next.js (ไม่โดน CORS) พร้อม Performance Optimization

// Cache สำหรับเก็บผลลัพธ์การค้นหา (ลด API calls)
const searchCache = new Map();
const CACHE_EXPIRE_TIME = 5 * 60 * 1000; // 5 นาที

// ฟังก์ชันสำหรับสร้าง cache key
function getCacheKey(query, type) {
  return `${type}:${query.toLowerCase().trim()}`;
}

// ฟังก์ชันตรวจสอบและลบ cache ที่หมดอายุ
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, data] of searchCache.entries()) {
    if (now - data.timestamp > CACHE_EXPIRE_TIME) {
      searchCache.delete(key);
    }
  }
}

// ค้นหาโดยใช้ชื่อตำบล (พร้อม cache และ optimization)
export async function searchBySubdistrict(query, abortSignal) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = getCacheKey(query, 'subdistrict');
    
    // ตรวจสอบ cache ก่อน
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRE_TIME) {
      console.log('📋 Using cached result for:', query);
      return cached.data;
    }

    // ทำความสะอาด cache ที่หมดอายุ (ทุก 10 requests)
    if (searchCache.size > 0 && Math.random() < 0.1) {
      cleanExpiredCache();
    }

    console.log('🔍 Searching API for subdistrict:', query);
    
    const response = await fetch(
      `/api/thailand-address?query=${encodeURIComponent(query)}&type=subdistrict`,
      { 
        signal: abortSignal,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // เก็บผลลัพธ์ใน cache
      searchCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
      
      // จำกัดขนาด cache ไม่เกิน 100 รายการ
      if (searchCache.size > 100) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      
      return result.data;
    } else {
      console.error('API Error:', result.error);
      return [];
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 Request aborted for subdistrict:', query);
      return [];
    }
    console.error('Error searching subdistrict:', error);
    return [];
  }
}

// ค้นหาโดยใช้รหัสไปรษณีย์ (พร้อม cache และ optimization)
export async function searchByPostalCode(query, abortSignal) {
  try {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const cacheKey = getCacheKey(query, 'postalCode');
    
    // ตรวจสอบ cache ก่อน
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRE_TIME) {
      console.log('📋 Using cached result for postal code:', query);
      return cached.data;
    }

    console.log('🔍 Searching API for postal code:', query);

    const response = await fetch(
      `/api/thailand-address?query=${encodeURIComponent(query)}&type=postalCode`,
      { 
        signal: abortSignal,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // เก็บผลลัพธ์ใน cache
      searchCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
      
      // จำกัดขนาด cache
      if (searchCache.size > 100) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      
      return result.data;
    } else {
      console.error('API Error:', result.error);
      return [];
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 Request aborted for postal code:', query);
      return [];
    }
    console.error('Error searching postal code:', error);
    return [];
  }
}

// ฟังก์ชันทดสอบ API (ใช้ cache)
export async function testConnection() {
  try {
    const cacheKey = 'api_test_connection';
    const cached = searchCache.get(cacheKey);
    
    // ใช้ cache สำหรับการทดสอบ API (1 นาที)
    if (cached && (Date.now() - cached.timestamp) < 60000) {
      return cached.data;
    }

    const response = await fetch('/api/thailand-address?query=บาง&type=subdistrict');
    const result = await response.json();
    
    const isSuccess = result.success && result.data.length > 0;
    
    // เก็บผลลัพธ์การทดสอบใน cache
    searchCache.set(cacheKey, {
      data: isSuccess,
      timestamp: Date.now()
    });
    
    if (isSuccess) {
      console.log('✅ API Connection successful!', result.data.slice(0, 2));
      return true;
    } else {
      console.warn('⚠️ API returned no data');
      return false;
    }
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    return false;
  }
}

// ฟังก์ชันล้าง cache (สำหรับการพัฒนา)
export function clearCache() {
  searchCache.clear();
  console.log('🗑️ Cache cleared');
}

// ฟังก์ชันดูสถานะ cache (สำหรับการพัฒนา)
export function getCacheStats() {
  return {
    size: searchCache.size,
    keys: Array.from(searchCache.keys())
  };
}