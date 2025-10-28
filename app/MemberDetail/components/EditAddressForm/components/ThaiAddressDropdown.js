"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SearchableDropdown from "../../../../membership/shared/SearchableDropdown";

/**
 * Thai Address Dropdown component with API integration
 */
export default function ThaiAddressDropdown({ 
  formData, 
  handleChange, 
  itemVariants
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    subDistricts: false
  });

  // Client-side cache to reduce API calls
  const cacheRef = useRef({
    provinces: null,
    districts: new Map(),
    subDistricts: new Map(),
    lastFetch: new Map()
  });
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  
  // Rate limiting retry state
  const [rateLimitRetry, setRateLimitRetry] = useState({});

  // Handle rate limiting with retry
  const handleRateLimit = (fetchFn, retryKey) => {
    const retryCount = rateLimitRetry[retryKey] || 0;
    
    if (retryCount < 3) {
      // Retry after exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      setTimeout(() => {
        setRateLimitRetry(prev => ({ ...prev, [retryKey]: retryCount + 1 }));
        fetchFn();
      }, delay);
    }
  };

  // Fetch provinces on mount
  useEffect(() => {
    console.log("🌍 Fetching provinces...");
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const provinceName = formData.ADDR_PROVINCE_NAME;
    console.log("🏛️ Province changed:", provinceName);
    
    if (provinceName) {
      // Extract clean province name (remove prefix)
      const cleanProvinceName = provinceName.replace('จังหวัด', '').trim();
      console.log("🔍 Fetching districts for:", cleanProvinceName);
      fetchDistricts(cleanProvinceName);
    } else {
      setDistricts([]);
      setSubDistricts([]);
      console.log("🧹 Cleared districts and sub-districts");
    }
  }, [formData.ADDR_PROVINCE_NAME]);

  // Fetch sub-districts when district changes
  useEffect(() => {
    const provinceName = formData.ADDR_PROVINCE_NAME;
    const districtName = formData.ADDR_DISTRICT;
    
    console.log("🏢 District changed:", districtName);
    
    if (provinceName && districtName) {
      // Extract clean names (remove prefixes)
      const cleanProvinceName = provinceName.replace('จังหวัด', '').trim();
      let cleanDistrictName = districtName.replace('อำเภอ', '').trim();
      cleanDistrictName = cleanDistrictName.replace('เขต', '').trim();
      
      console.log("🔍 Fetching sub-districts for:", cleanProvinceName, cleanDistrictName);
      fetchSubDistricts(cleanProvinceName, cleanDistrictName);
    } else {
      setSubDistricts([]);
      console.log("🧹 Cleared sub-districts");
    }
  }, [formData.ADDR_DISTRICT, formData.ADDR_PROVINCE_NAME]);

  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      console.log("📡 Calling provinces API...");
      // Use search API directly - better performance and reliability
      const response = await fetch('/api/thailand-address/search?query=&type=province');
      const data = await response.json();
      console.log("📥 Provinces response:", data);
      
      if (data.success) {
        // Transform to expected format
        const provinces = data.data.map((item, index) => ({
          code: (index + 1).toString().padStart(2, '0'),
          name_th: item.text || item.id,
          name_en: item.text || item.id
        }));
        setProvinces(provinces);
        console.log("✅ Provinces loaded:", provinces.length);
      } else {
        console.error("❌ Provinces API failed:", data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching provinces:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const fetchDistricts = async (provinceName) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      console.log("📡 Calling districts API for:", provinceName);
      // Use search API - filter by province
      const response = await fetch(`/api/thailand-address/search?query=&type=district&province=${encodeURIComponent(provinceName)}`);
      const data = await response.json();
      console.log("📥 Districts response:", data);
      
      if (data.success) {
        // Filter districts by province and deduplicate using Set for performance
        const uniqueDistricts = new Set();
        data.data.forEach(item => {
          if (item.province === provinceName && item.text && item.text.trim()) {
            uniqueDistricts.add(item.text.trim());
          }
        });
        
        // Convert back to expected format
        const districts = Array.from(uniqueDistricts).map((text, index) => ({
          code: (index + 1).toString().padStart(4, '0'),
          name_th: text,
          name_en: text
        }));
        
        setDistricts(districts);
        console.log("✅ Districts loaded:", districts.length);
      } else {
        const errorMessage = data.message || 'Unknown error';
        if (errorMessage.includes('คำขอมากเกินไป')) {
          console.log("⏳ Rate limited - retrying districts...");
          handleRateLimit(() => fetchDistricts(provinceName), 'districts');
        } else {
          console.error("❌ Districts API failed:", errorMessage);
          setDistricts([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const fetchSubDistricts = async (provinceName, districtName) => {
    setLoading(prev => ({ ...prev, subDistricts: true }));
    try {
      console.log("📡 Calling sub-districts API for:", provinceName, districtName);
      // Use search API - filter by both province and district
      const response = await fetch(`/api/thailand-address/search?query=&type=subdistrict&province=${encodeURIComponent(provinceName)}&district=${encodeURIComponent(districtName)}`);
      const data = await response.json();
      console.log("📥 Sub-districts response:", data);
      
      if (data.success) {
        // Filter sub-districts by both province and district, and deduplicate using Set
        const uniqueSubDistricts = new Set();
        data.data.forEach(item => {
          if (item.province === provinceName && item.district === districtName && item.text && item.text.trim()) {
            uniqueSubDistricts.add(item.text.trim());
          }
        });
        
        // Convert back to expected format
        const subDistricts = Array.from(uniqueSubDistricts).map((text, index) => ({
          code: (index + 1).toString().padStart(6, '0'),
          name_th: text,
          name_en: text
        }));
        
        setSubDistricts(subDistricts);
        console.log("✅ Sub-districts loaded:", subDistricts.length);
      } else {
        const errorMessage = data.message || 'Unknown error';
        if (errorMessage.includes('คำขอมากเกินไป')) {
          console.log("⏳ Rate limited - retrying sub-districts...");
          handleRateLimit(() => fetchSubDistricts(provinceName, districtName), 'subdistricts');
        } else {
          console.error("❌ Sub-districts API failed:", errorMessage);
          setSubDistricts([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching sub-districts:', error);
      setSubDistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, subDistricts: false }));
    }
  };

  // Handle province change with auto-prefix
  const handleProvinceChange = (e) => {
    const value = e.target.value;
    console.log("🎯 Province selected:", value);
    
    // Clear district and sub-district when province changes
    handleChange({ target: { name: 'ADDR_DISTRICT', value: '' } });
    handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
    
    // Auto-add prefix
    if (value && value !== "") {
      const finalValue = value.includes('จังหวัด') ? value : `จังหวัด${value}`;
      handleChange({ target: { name: 'ADDR_PROVINCE_NAME', value: finalValue } });
      console.log("✅ Set province with prefix:", finalValue);
    } else {
      handleChange({ target: { name: 'ADDR_PROVINCE_NAME', value: '' } });
    }
  };

  // Handle district change with auto-prefix
  const handleDistrictChange = (e) => {
    const value = e.target.value;
    console.log("🎯 District selected:", value);
    const isBangkok = formData.ADDR_PROVINCE_NAME?.includes('กรุงเทพมหานคร');
    
    // Clear sub-district when district changes
    handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
    
    // Auto-add prefix based on province type
    if (value && value !== "") {
      const prefix = isBangkok ? 'เขต' : 'อำเภอ';
      const finalValue = value.includes(prefix) ? value : `${prefix}${value}`;
      handleChange({ target: { name: 'ADDR_DISTRICT', value: finalValue } });
      console.log(`✅ Set ${prefix} with prefix:`, finalValue);
    } else {
      handleChange({ target: { name: 'ADDR_DISTRICT', value: '' } });
    }
  };

  // Handle sub-district change with auto-prefix
  const handleSubDistrictChange = (e) => {
    const value = e.target.value;
    console.log("🎯 Sub-district selected:", value);
    const isBangkok = formData.ADDR_PROVINCE_NAME?.includes('กรุงเทพมหานคร');
    
    // Auto-add prefix based on province type
    if (value && value !== "") {
      const prefix = isBangkok ? 'แขวง' : 'ตำบล';
      const finalValue = value.includes(prefix) ? value : `${prefix}${value}`;
      handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: finalValue } });
      console.log(`✅ Set ${prefix} with prefix:`, finalValue);
    } else {
      handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
    }
  };

  // Extract clean name without prefix for display
  const getDisplayName = (name, type) => {
    if (!name) return "";
    
    const prefixes = {
      province: 'จังหวัด',
      district: 'อำเภอ',
      subdistrict: 'ตำบล',
      bangkokDistrict: 'เขต',
      bangkokSubdistrict: 'แขวง'
    };
    
    // Remove any prefix for display
    let cleanName = name;
    Object.values(prefixes).forEach(prefix => {
      if (cleanName.startsWith(prefix)) {
        cleanName = cleanName.substring(prefix.length);
      }
    });
    
    return cleanName;
  };

  const isBangkok = formData.ADDR_PROVINCE_NAME?.includes('กรุงเทพมหานคร');

  // Handle searchable dropdown changes
  const handleProvinceSearchChange = (value) => {
    if (value && value !== "") {
      const finalValue = value.includes('จังหวัด') ? value : `จังหวัด${value}`;
      handleChange({ target: { name: 'ADDR_PROVINCE_NAME', value: finalValue } });
    } else {
      handleChange({ target: { name: 'ADDR_PROVINCE_NAME', value: '' } });
    }
  };

  const handleDistrictSearchChange = (value) => {
    if (value && value !== "") {
      const prefix = isBangkok ? 'เขต' : 'อำเภอ';
      const finalValue = value.includes(prefix) ? value : `${prefix}${value}`;
      handleChange({ target: { name: 'ADDR_DISTRICT', value: finalValue } });
    } else {
      handleChange({ target: { name: 'ADDR_DISTRICT', value: '' } });
    }
  };

  const handleSubDistrictSearchChange = (value) => {
    if (value && value !== "") {
      const prefix = isBangkok ? 'แขวง' : 'ตำบล';
      const finalValue = value.includes(prefix) ? value : `${prefix}${value}`;
      handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: finalValue } });
    } else {
      handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
    }
  };

  const fetchProvinceOptions = useCallback(async (searchTerm) => {
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=province`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }, []);

  const fetchDistrictOptions = useCallback(async (searchTerm) => {
    const cleanProvinceName = formData.ADDR_PROVINCE_NAME?.replace('จังหวัด', '').trim();
    if (!cleanProvinceName) return [];
    
    // Check cache first
    const cacheKey = `${cleanProvinceName}:${searchTerm}`;
    const cached = cacheRef.current.districts.get(cacheKey);
    const lastFetch = cacheRef.current.lastFetch.get(cacheKey);
    
    if (cached && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      console.log("📋 Using cached districts for:", cacheKey);
      return cached;
    }
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=district&province=${encodeURIComponent(cleanProvinceName)}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter and transform
        const districts = data.data
          .filter(item => item.province === cleanProvinceName)
          .map(item => ({
            text: item.text,
            province: item.province
          }));
        
        // Cache the result
        cacheRef.current.districts.set(cacheKey, districts);
        cacheRef.current.lastFetch.set(cacheKey, Date.now());
        
        return districts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }, [formData.ADDR_PROVINCE_NAME]);

  const fetchSubDistrictOptions = useCallback(async (searchTerm) => {
    const cleanProvinceName = formData.ADDR_PROVINCE_NAME?.replace('จังหวัด', '').trim();
    const cleanDistrictName = formData.ADDR_DISTRICT?.replace('อำเภอ', '').replace('เขต', '').trim();
    if (!cleanProvinceName || !cleanDistrictName) return [];
    
    // Check cache first
    const cacheKey = `${cleanProvinceName}:${cleanDistrictName}:${searchTerm}`;
    const cached = cacheRef.current.subDistricts.get(cacheKey);
    const lastFetch = cacheRef.current.lastFetch.get(cacheKey);
    
    if (cached && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      console.log("📋 Using cached sub-districts for:", cacheKey);
      return cached;
    }
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=subdistrict&province=${encodeURIComponent(cleanProvinceName)}&district=${encodeURIComponent(cleanDistrictName)}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter and transform
        const subDistricts = data.data
          .filter(item => item.province === cleanProvinceName && item.district === cleanDistrictName)
          .map(item => ({
            text: item.text,
            province: item.province,
            district: item.district,
            postalCode: item.postalCode
          }));
        
        // Cache the result
        cacheRef.current.subDistricts.set(cacheKey, subDistricts);
        cacheRef.current.lastFetch.set(cacheKey, Date.now());
        
        return subDistricts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching sub-districts:', error);
      return [];
    }
  }, [formData.ADDR_PROVINCE_NAME, formData.ADDR_DISTRICT]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {/* Province Searchable Dropdown */}
      <motion.div variants={itemVariants}>
        <SearchableDropdown
          label="จังหวัด:"
          placeholder="ค้นหาหรือเลือกจังหวัด"
          value={getDisplayName(formData.ADDR_PROVINCE_NAME, 'province')}
          onChange={handleProvinceSearchChange}
          onSelect={(option) => {
            handleProvinceSearchChange(option.text);
            // Clear dependent fields
            handleChange({ target: { name: 'ADDR_DISTRICT', value: '' } });
            handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
          }}
          fetchOptions={fetchProvinceOptions}
          isRequired={true}
          isReadOnly={false}
        />
      </motion.div>

      {/* District Searchable Dropdown */}
      <motion.div variants={itemVariants}>
        <SearchableDropdown
          label={isBangkok ? 'เขต:' : 'อำเภอ:'}
          placeholder={`ค้นหาหรือเลือก${isBangkok ? 'เขต' : 'อำเภอ'}`}
          value={getDisplayName(formData.ADDR_DISTRICT, 'district')}
          onChange={handleDistrictSearchChange}
          onSelect={(option) => {
            handleDistrictSearchChange(option.text);
            // Clear sub-district
            handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: '' } });
          }}
          fetchOptions={fetchDistrictOptions}
          isRequired={true}
          isReadOnly={false}
          disabled={!formData.ADDR_PROVINCE_NAME}
        />
        {!formData.ADDR_PROVINCE_NAME && (
          <div className="text-xs text-gray-500 mt-2">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              กรุณาเลือกจังหวัดก่อน
            </span>
          </div>
        )}
        {rateLimitRetry.districts > 0 && rateLimitRetry.districts < 3 && (
          <div className="text-xs text-orange-600 mt-2">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              กำลังลองใหม่ ({rateLimitRetry.districts}/3)...
            </span>
          </div>
        )}
      </motion.div>

      {/* Sub-district Searchable Dropdown */}
      <motion.div variants={itemVariants}>
        <SearchableDropdown
          label={isBangkok ? 'แขวง:' : 'ตำบล:'}
          placeholder={`ค้นหาหรือเลือก${isBangkok ? 'แขวง' : 'ตำบล'}`}
          value={getDisplayName(formData.ADDR_SUB_DISTRICT, 'subdistrict')}
          onChange={handleSubDistrictSearchChange}
          onSelect={(option) => {
            handleSubDistrictSearchChange(option.text);
            // Auto-fill postal code if available
            if (option.postalCode) {
              handleChange({ target: { name: 'ADDR_POSTCODE', value: option.postalCode } });
            }
          }}
          fetchOptions={fetchSubDistrictOptions}
          isRequired={true}
          isReadOnly={false}
          disabled={!formData.ADDR_PROVINCE_NAME || !formData.ADDR_DISTRICT}
        />
        {(!formData.ADDR_PROVINCE_NAME || !formData.ADDR_DISTRICT) && (
          <div className="text-xs text-gray-500 mt-2">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              กรุณาเลือกจังหวัดและ{isBangkok ? 'เขต' : 'อำเภอ'}ก่อน
            </span>
          </div>
        )}
        {rateLimitRetry.subdistricts > 0 && rateLimitRetry.subdistricts < 3 && (
          <div className="text-xs text-orange-600 mt-2">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              กำลังลองใหม่ ({rateLimitRetry.subdistricts}/3)...
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
