import { useState, useEffect, useCallback } from 'react';
import { searchBySubdistrict, searchByPostalCode, testConnection } from '../../../services/thailandAddressService';

export const useAddressAutocomplete = (handleChange) => {
  // ตรวจสอบว่า handleChange ถูกส่งเข้ามาหรือไม่
  console.log('useAddressAutocomplete: handleChange type:', typeof handleChange);
  const [subdistrictResults, setSubdistrictResults] = useState([]);
  const [postalCodeResults, setPostalCodeResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSubdistrictResults, setShowSubdistrictResults] = useState(false);
  const [showPostalCodeResults, setShowPostalCodeResults] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  
  // Debounce timers และ AbortController สำหรับ cancel requests
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [postalDebounceTimer, setPostalDebounceTimer] = useState(null);
  const [currentController, setCurrentController] = useState(null);

  // ทดสอบ API Connection เมื่อ component โหลด (แบบ lazy)
  useEffect(() => {
    async function checkAPI() {
      const isReady = await testConnection();
      setApiReady(isReady);
      if (!isReady) {
        console.warn('Thailand Address API is not ready');
      }
    }
    
    // เช็ค API หลังจาก component mount 1 วินาที (ไม่รีบร้อน)
    const timer = setTimeout(checkAPI, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Cleanup function สำหรับ cancel ongoing requests
  useEffect(() => {
    return () => {
      // Cancel ongoing requests เมื่อ component unmount
      if (currentController) {
        currentController.abort();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (postalDebounceTimer) {
        clearTimeout(postalDebounceTimer);
      }
    };
  }, [currentController, debounceTimer, postalDebounceTimer]);

  // สร้าง synthetic event helper ที่มีโครงสร้างเหมือน event จริงๆ
  const createSyntheticEvent = useCallback((name, value) => {
    console.log(`Creating synthetic event for ${name} with value:`, value);
    return {
      target: { name, value },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
  }, []);

  // ฟังก์ชันเคลียร์ข้อมูลที่เกี่ยวข้อง
  const clearRelatedFields = useCallback((fields) => {
    fields.forEach(field => {
      handleChange(createSyntheticEvent(field, ''));
    });
  }, [handleChange, createSyntheticEvent]);

  // จัดการการค้นหาตำบล
  const handleSubdistrictSearch = useCallback(async (value) => {
    // ยกเลิก timer เดิม
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // ยกเลิก request เดิม
    if (currentController) {
      currentController.abort();
    }
    
    // ถ้าค่าว่างเปล่า ไม่ต้องค้นหา และเคลียร์ค่าอำเภอ/จังหวัด
    if (!value.trim()) {
      setSubdistrictResults([]);
      setShowSubdistrictResults(false);
      setIsSearching(false);
      clearRelatedFields(['addressDistrict', 'addressProvince', 'addressPostalCode']);
      return;
    }
    
    // ตั้ง loading state
    if (value.trim().length >= 2 && apiReady) {
      setIsSearching(true);
      
      // สร้าง timer ใหม่ - รอ 800ms หลังจากผู้ใช้พิมพ์เสร็จ
      const newTimer = setTimeout(async () => {
        try {
          // สร้าง AbortController ใหม่
          const controller = new AbortController();
          setCurrentController(controller);
          
          const results = await searchBySubdistrict(value);
          
          // ตรวจสอบว่า request ยังไม่ถูก cancel
          if (!controller.signal.aborted) {
            setSubdistrictResults(results);
            setShowSubdistrictResults(results.length > 0);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error searching subdistrict:', error);
          }
        } finally {
          if (!currentController?.signal.aborted) {
            setIsSearching(false);
          }
        }
      }, 800); // Debounce 800ms
      
      setDebounceTimer(newTimer);
    } else {
      setIsSearching(false);
      
      // ถ้าพิมพ์ไม่ครบ 2 ตัวอักษร ให้เคลียร์ค่าอำเภอ/จังหวัด/รหัสไปรษณีย์
      if (value.trim().length > 0 && value.trim().length < 2) {
        clearRelatedFields(['addressDistrict', 'addressProvince', 'addressPostalCode']);
      }
    }
  }, [debounceTimer, currentController, apiReady, clearRelatedFields]);

  // จัดการการค้นหารหัสไปรษณีย์
  const handlePostalCodeSearch = useCallback(async (value) => {
    // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
    if (!/^\d*$/.test(value)) {
      return false;
    }
    
    // ยกเลิก timer เดิม
    if (postalDebounceTimer) {
      clearTimeout(postalDebounceTimer);
    }
    
    // ยกเลิก request เดิม
    if (currentController) {
      currentController.abort();
    }
    
    // ถ้าค่าว่างเปล่า ไม่ต้องค้นหา และเคลียร์ค่าตำบล/อำเภอ/จังหวัด
    if (!value.trim()) {
      setPostalCodeResults([]);
      setShowPostalCodeResults(false);
      setIsSearching(false);
      clearRelatedFields(['addressSubdistrict', 'addressDistrict', 'addressProvince']);
      return true;
    }
    
    // ค้นหาข้อมูลรหัสไปรษณีย์ (ขั้นต่ำ 3 ตัวเลข)
    if (value.trim().length >= 3 && apiReady) {
      setIsSearching(true);
      
      // สร้าง timer ใหม่ - รอ 1000ms สำหรับรหัสไปรษณีย์ (นานกว่าเพราะมักจะพิมพ์ครบเลย)
      const newTimer = setTimeout(async () => {
        try {
          // สร้าง AbortController ใหม่
          const controller = new AbortController();
          setCurrentController(controller);
          
          const results = await searchByPostalCode(value);
          
          // ตรวจสอบว่า request ยังไม่ถูก cancel
          if (!controller.signal.aborted) {
            setPostalCodeResults(results);
            setShowPostalCodeResults(results.length > 0);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error searching postal code:', error);
          }
        } finally {
          if (!currentController?.signal.aborted) {
            setIsSearching(false);
          }
        }
      }, 1000); // Debounce 1000ms สำหรับรหัสไปรษณีย์
      
      setPostalDebounceTimer(newTimer);
    } else {
      setIsSearching(false);
      
      // ถ้าพิมพ์ไม่ครบ 3 ตัวเลข ให้เคลียร์ค่าตำบล/อำเภอ/จังหวัด
      if (value.trim().length > 0 && value.trim().length < 3) {
        clearRelatedFields(['addressSubdistrict', 'addressDistrict', 'addressProvince']);
      }
    }
    
    return true;
  }, [postalDebounceTimer, currentController, apiReady, clearRelatedFields]);

  // เลือกที่อยู่จากผลลัพธ์ตำบล
  const selectAddressFromSubdistrict = useCallback((address) => {
    // ยกเลิก timer และ request ที่กำลังทำงาน
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    if (currentController) {
      currentController.abort();
      setCurrentController(null);
    }
    
    // อัพเดทฟิลด์ต่างๆ
    handleChange(createSyntheticEvent('addressSubdistrict', address.subdistrict));
    handleChange(createSyntheticEvent('addressDistrict', address.district));
    handleChange(createSyntheticEvent('addressProvince', address.province));
    handleChange(createSyntheticEvent('addressPostalCode', address.postalCode));
    
    // ซ่อนผลลัพธ์และล้าง loading state
    setShowSubdistrictResults(false);
    setIsSearching(false);
    setSubdistrictResults([]);
  }, [debounceTimer, currentController, handleChange, createSyntheticEvent]);

  // เลือกที่อยู่จากผลลัพธ์รหัสไปรษณีย์
  const selectAddressFromPostalCode = useCallback((address) => {
    // ยกเลิก timer และ request ที่กำลังทำงาน
    if (postalDebounceTimer) {
      clearTimeout(postalDebounceTimer);
      setPostalDebounceTimer(null);
    }
    if (currentController) {
      currentController.abort();
      setCurrentController(null);
    }
    
    // อัพเดทฟิลด์ต่างๆ
    handleChange(createSyntheticEvent('addressPostalCode', address.postalCode));
    handleChange(createSyntheticEvent('addressSubdistrict', address.subdistrict));
    handleChange(createSyntheticEvent('addressDistrict', address.district));
    handleChange(createSyntheticEvent('addressProvince', address.province));
    
    // ซ่อนผลลัพธ์และล้าง loading state
    setShowPostalCodeResults(false);
    setIsSearching(false);
    setPostalCodeResults([]);
  }, [postalDebounceTimer, currentController, handleChange, createSyntheticEvent]);

  // ซ่อนผลลัพธ์เมื่อคลิกนอกพื้นที่
  const handleClickOutside = useCallback(() => {
    setTimeout(() => {
      setShowSubdistrictResults(false);
      setShowPostalCodeResults(false);
    }, 200);
  }, []);

  return {
    // States
    subdistrictResults,
    postalCodeResults,
    isSearching,
    showSubdistrictResults,
    showPostalCodeResults,
    apiReady,
    
    // Functions
    handleSubdistrictSearch,
    handlePostalCodeSearch,
    selectAddressFromSubdistrict,
    selectAddressFromPostalCode,
    handleClickOutside,
    createSyntheticEvent
  };
};