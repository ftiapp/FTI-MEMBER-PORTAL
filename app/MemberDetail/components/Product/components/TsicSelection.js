'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SectionFlow from './SectionFlow';
import ConfirmationDialog from './ConfirmationDialog';
import { useAuth } from '@/app/contexts/AuthContext';

// Import our new components
import MainCategoryStep from './tsic/MainCategoryStep';
import SubcategoryStep from './tsic/SubcategoryStep';
import ReviewStep from './tsic/ReviewStep';
import SuccessMessage from './tsic/SuccessMessage';
import LanguageToggle from './tsic/LanguageToggle';
import LoadingSpinner from './tsic/LoadingSpinner';

// Import API functions
import { submitTsicUpdate, fetchTsicCodes, preloadTsicCodes } from './api';

const MAX_MAIN_CATEGORIES = 3;
const MAX_SUBCATEGORIES = 5;

export default function TsicSelection({ onSuccess, memberCode, isEditMode = false, replacingTsicCode = null, editingTsicId = null, language = 'th', onDataLoaded }) {
  // Get the current user from AuthContext
  const { user } = useAuth();
  // State variables
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [filteredSubcategories, setFilteredSubcategories] = useState({});
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState({});
  const [itemsPerPage] = useState(9);
  const [isLoading, setIsLoading] = useState({
    main: false,
    subcategories: {},
    submit: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalTsicData, setOriginalTsicData] = useState(null);
  const [editMode, setEditMode] = useState({
    active: isEditMode,
    tsicId: editingTsicId,
    tsicCode: replacingTsicCode
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  // ใช้ค่า language จาก props แทนการประกาศ state ใหม่
  const [languageState, setLanguage] = useState(language); // ใช้ค่าเริ่มต้นจาก props

  // Fetch main categories on component mount
  useEffect(() => {
    fetchMainCategories();
  }, [languageState]);
  
  // เราจะไม่เรียกใช้ fetchExistingTsicCodes ที่นี่ เพราะมีการเรียกใช้ใน fetchMainCategories อยู่แล้ว
  // เพื่อหลีกเลี่ยงการเรียกใช้ซ้ำซ้อน
  
  // Fetch subcategories for selected main categories
  useEffect(() => {
    // When main categories are loaded and we have selected categories
    if (mainCategories.length > 0 && selectedMainCategories.length > 0) {
      console.log('Fetching subcategories for selected main categories:', selectedMainCategories);
      // Fetch subcategories for each selected main category
      selectedMainCategories.forEach(category => {
        if (!subcategories[category.category_code]) {
          fetchSubcategories(category);
        }
      });
    }
  }, [mainCategories.length, selectedMainCategories.length]);
  
  // We'll fetch existing TSIC codes after main categories are loaded
  // This ensures we have the category data needed to properly display selections
  
  // Fetch existing TSIC codes and pre-select them
  const fetchExistingTsicCodes = async () => {
    try {
      setIsLoading(prev => ({ ...prev, main: true }));
      console.log('Fetching existing TSIC codes for member code:', memberCode);
      
      const result = await fetchTsicCodes(memberCode);
      console.log('API result:', result);
      
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        console.log('Existing TSIC codes loaded successfully:', result.data);
        
        // Store original TSIC data for reference
        setOriginalTsicData(result.data);
        
        // Group TSIC codes by category
        const groupedByCategory = {};
        const selectedCategories = [];
        const selectedSubs = {};
        
        // First pass: collect all unique categories
        const uniqueCategories = new Set();
        result.data.forEach(tsic => {
          if (tsic.category_code && tsic.category_code !== '00') {
            uniqueCategories.add(tsic.category_code);
          }
        });
        
        console.log('Unique category codes found:', Array.from(uniqueCategories));
        console.log('Available main categories:', mainCategories);
        
        // Fetch category information for each unique category
        for (const categoryCode of uniqueCategories) {
          // Find the category in mainCategories
          const category = mainCategories.find(c => c.category_code === categoryCode);
          console.log(`Looking for category ${categoryCode} in mainCategories:`, category);
          
          if (category) {
            selectedCategories.push(category);
            
            // Fetch subcategories for this category
            await fetchSubcategories(category);
            
            // Group TSIC codes by this category
            const tsicsInCategory = result.data.filter(tsic => 
              tsic.category_code === categoryCode
            );
            
            console.log(`Found ${tsicsInCategory.length} TSIC codes for category ${categoryCode}:`, tsicsInCategory);
            
            // Find the full subcategory objects from the fetched subcategories
            const subcategoryObjects = [];
            tsicsInCategory.forEach(tsic => {
              const subcategory = subcategories[categoryCode]?.find(sub => 
                sub.tsic_code === tsic.tsic_code
              );
              
              if (subcategory) {
                subcategoryObjects.push(subcategory);
              } else {
                // If we can't find the exact subcategory, create a placeholder
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
        
        // Always pre-select existing TSIC codes, regardless of mode
        console.log('Setting selected main categories:', selectedCategories);
        console.log('Setting selected subcategories:', selectedSubs);
        
        // Set selected categories and subcategories
        setSelectedMainCategories(selectedCategories);
        setSelectedSubcategories(selectedSubs);
        
        // ไม่ต้องข้ามไปขั้นตอนที่ 2 โดยอัตโนมัติ เพื่อให้ผู้ใช้เห็นหมวดหมู่ใหญ่ที่เลือกไว้แล้ว
        // Always stay at step 1 when adding new TSIC codes
        setCurrentStep(1);
        
        // Log what's been selected for debugging
        console.log('After setting, selectedMainCategories:', selectedCategories);
        console.log('After setting, selectedSubcategories:', selectedSubs);
        
        // Manually trigger subcategory loading for each selected category
        selectedCategories.forEach(category => {
          if (!subcategories[category.category_code]) {
            fetchSubcategories(category);
          }
        });
        
        // If in edit mode, only select the specific TSIC code being edited
        if (editMode.active && editMode.tsicCode) {
          // Find the specific TSIC code and its category
          const tsicToEdit = result.data.find(tsic => tsic.tsic_code === editMode.tsicCode);
          
          if (tsicToEdit) {
            const categoryCode = tsicToEdit.category_code;
            const category = mainCategories.find(c => c.category_code === categoryCode);
            
            if (category) {
              // Only select this specific category and TSIC code
              setSelectedMainCategories([category]);
              
              // Find the full subcategory object
              const subcategoryObj = subcategories[categoryCode]?.find(sub => 
                sub.tsic_code === tsicToEdit.tsic_code
              ) || {
                tsic_code: tsicToEdit.tsic_code,
                description: tsicToEdit.description || '',
                display_description: tsicToEdit.description || '',
                display_description_EN: tsicToEdit.description || ''
              };
              
              setSelectedSubcategories({
                [categoryCode]: [subcategoryObj]
              });
              
              setCurrentStep(2);
              
              toast.info(getText(
                'โหมดแก้ไข: คุณกำลังแก้ไขรหัส TSIC ' + tsicToEdit.tsic_code,
                'Edit mode: You are editing TSIC code ' + tsicToEdit.tsic_code
              ));
            }
          }
        }
        
        toast.info(getText(
          'โหลดรหัส TSIC ที่มีอยู่เดิมเรียบร้อยแล้ว คุณสามารถแก้ไขได้ตามต้องการ',
          'Existing TSIC codes loaded successfully. You can modify them as needed.'
        ));
      } else {
        console.log('No existing TSIC codes found or error loading them');
      }
    } catch (error) {
      console.error('Error fetching existing TSIC codes:', error);
      toast.error(getText(
        'ไม่สามารถโหลดรหัส TSIC ที่มีอยู่เดิมได้ กรุณาลองใหม่อีกครั้ง',
        'Unable to load existing TSIC codes. Please try again.'
      ));
    } finally {
      setIsLoading(prev => ({ ...prev, main: false }));
    }
  };
  
  // โหลดสถานะที่บันทึกไว้หลังจาก login
  useEffect(() => {
    if (user) {
      try {
        const savedState = sessionStorage.getItem('tsic_selection_state');
        if (savedState) {
          console.log('Found saved TSIC selection state, restoring...');
          const state = JSON.parse(savedState);
          
          // ตรวจสอบว่าเป็นสถานะของสมาชิกคนเดียวกันหรือไม่
          if (state.memberCode === memberCode) {
            // โหลดสถานะที่บันทึกไว้
            if (state.selectedMainCategories) {
              setSelectedMainCategories(state.selectedMainCategories);
            }
            
            if (state.selectedSubcategories) {
              setSelectedSubcategories(state.selectedSubcategories);
              
              // โหลด subcategories สำหรับแต่ละหมวดหมู่หลัก
              Object.keys(state.selectedSubcategories).forEach(categoryCode => {
                if (!subcategories[categoryCode]) {
                  fetchSubcategories(categoryCode);
                }
              });
            }
            
            if (state.currentStep) {
              setCurrentStep(state.currentStep);
            }
            
            console.log('Successfully restored saved state');
            
            // ลบสถานะที่บันทึกไว้
            sessionStorage.removeItem('tsic_selection_state');
          }
        }
      } catch (e) {
        console.error('Error restoring saved state:', e);
      }
    }
  }, [user, memberCode]);

  // Helper function to get text based on current language
  const getText = (thText, enText) => {
    return languageState === 'th' ? thText : (enText || thText);
  };

  // Fetch main categories
  const fetchMainCategories = async () => {
    setIsLoading(prev => ({ ...prev, main: true }));
    try {
      console.log('Fetching main categories...');
      const response = await fetch('/api/tsic/main-categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log('Main categories API response:', data);
      
      if (data.success) {
        const categoriesWithCode = data.data
          .sort((a, b) => a.category_code.localeCompare(b.category_code))
          .map(category => ({
            ...category,
            display_name: `${category.category_code} ${category.category_name}`,
            display_name_EN: `${category.category_code} ${category.category_name_EN || category.category_name}`
          }));
        
        console.log('Processed main categories:', categoriesWithCode);
        setMainCategories(categoriesWithCode);
        
        // After loading main categories, fetch existing TSIC codes
        if (memberCode) {
          console.log('Main categories loaded successfully, now preloading TSIC codes for member code:', memberCode);
          // ใช้ฟังก์ชัน preloadTsicCodes แทนฟังก์ชัน fetchExistingTsicCodes
          setTimeout(async () => {
            const result = await preloadTsicCodes(
              memberCode,
              categoriesWithCode,
              setSelectedMainCategories,
              setSelectedSubcategories,
              fetchSubcategories,
              subcategories
            );
            
            // เรียกใช้ onDataLoaded เมื่อโหลดข้อมูลเสร็จสิ้น
            if (onDataLoaded) {
              onDataLoaded(result);
            }
          }, 1000); // รอ 1 วินาทีเพื่อให้แน่ใจว่า state ถูกอัพเดทอย่างถูกต้อง
        }
      } else {
        throw new Error(data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching main categories:', error);
      toast.error(getText('ไม่สามารถโหลดหมวดหมู่หลักได้ กรุณาลองใหม่อีกครั้ง', 'Unable to load main categories. Please try again.'));
    } finally {
      setIsLoading(prev => ({ ...prev, main: false }));
    }
  };

  // Handle search input change
  const handleSearch = (e, categoryCode) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (subcategories[categoryCode]) {
      // First filter by search term
      const filtered = subcategories[categoryCode].filter(sub => {
        const searchLower = value.toLowerCase();
        return (
          sub.tsic_code.toLowerCase().includes(searchLower) ||
          sub.description.toLowerCase().includes(searchLower)
        );
      });
      
      // Then sort to keep selected items at the top
      const selectedSubs = selectedSubcategories[categoryCode] || [];
      const sortedFiltered = [...filtered].sort((a, b) => {
        const aSelected = selectedSubs.some(s => s.tsic_code === a.tsic_code);
        const bSelected = selectedSubs.some(s => s.tsic_code === b.tsic_code);
        
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.tsic_code.localeCompare(b.tsic_code);
      });
      
      setFilteredSubcategories(prev => ({
        ...prev,
        [categoryCode]: sortedFiltered
      }));
      
      setCurrentPage(prev => ({
        ...prev,
        [categoryCode]: 1
      }));
    }
  };

  // Handle page change
  const handlePageChange = (newPage, categoryCode) => {
    if (newPage < 1) newPage = 1;
    const totalPages = Math.ceil((filteredSubcategories[categoryCode]?.length || 0) / itemsPerPage);
    if (newPage > totalPages) newPage = totalPages;
    
    setCurrentPage(prev => ({
      ...prev,
      [categoryCode]: newPage
    }));
  };

  // Handle main category selection
  const handleMainCategoryChange = async (category) => {
    // If in edit mode, don't allow changing categories
    if (editMode.active) {
      toast.warning(getText(
        'ในโหมดแก้ไข คุณไม่สามารถเปลี่ยนหมวดหมู่หลักได้',
        'In edit mode, you cannot change the main category'
      ));
      return;
    }
    if (
      !selectedMainCategories.some(c => c.category_code === category.category_code) && 
      selectedMainCategories.length >= MAX_MAIN_CATEGORIES
    ) {
      toast.warning(getText(`คุณสามารถเลือกได้สูงสุด ${MAX_MAIN_CATEGORIES} หมวดหมู่หลัก`, `You can select up to ${MAX_MAIN_CATEGORIES} main categories`));
      return;
    }
    
    const isSelected = selectedMainCategories.some(c => c.category_code === category.category_code);
    
    if (isSelected) {
      // Remove the category
      setSelectedMainCategories(prev => 
        prev.filter(c => c.category_code !== category.category_code)
      );
      
      // Remove its subcategories
      setSelectedSubcategories(prev => {
        const newState = { ...prev };
        delete newState[category.category_code];
        return newState;
      });
      
      return;
    }
    
    // Add the category
    setSelectedMainCategories(prev => [...prev, category]);
    
    // Fetch subcategories for this category if we haven't already
    if (!subcategories[category.category_code]) {
      await fetchSubcategories(category);
    }
  };

  // Fetch subcategories for a category
  const fetchSubcategories = async (category) => {
    setIsLoading(prev => ({
      ...prev,
      subcategories: { ...prev.subcategories, [category.category_code]: true }
    }));
    
    try {
      const response = await fetch(`/api/tsic/subcategories/${category.category_code}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success) {
        const subcategoryData = data.data.map(item => ({
          ...item,
          display_description: item.description,
          display_description_EN: item.description_EN || item.description
        }));
        
        // Store the original subcategory data
        setSubcategories(prev => ({
          ...prev,
          [category.category_code]: subcategoryData
        }));
        
        // Sort subcategories to show selected ones at the top
        const selectedSubs = selectedSubcategories[category.category_code] || [];
        const sortedSubcategories = [...subcategoryData].sort((a, b) => {
          const aSelected = selectedSubs.some(s => s.tsic_code === a.tsic_code);
          const bSelected = selectedSubs.some(s => s.tsic_code === b.tsic_code);
          
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.tsic_code.localeCompare(b.tsic_code);
        });
        
        setFilteredSubcategories(prev => ({
          ...prev,
          [category.category_code]: sortedSubcategories
        }));
        
        setCurrentPage(prev => ({
          ...prev,
          [category.category_code]: 1
        }));
      } else {
        throw new Error(data.message || 'Failed to load subcategories');
      }
    } catch (error) {
      console.error(`Error fetching subcategories for ${category.category_code}:`, error);
      toast.error(getText('ไม่สามารถโหลดหมวดหมู่ย่อยได้ กรุณาลองใหม่อีกครั้ง', 'Unable to load subcategories. Please try again.'));
      
      // Remove the category if subcategories couldn't be loaded
      setSelectedMainCategories(prev => 
        prev.filter(c => c.category_code !== category.category_code)
      );
    } finally {
      setIsLoading(prev => ({
        ...prev,
        subcategories: { ...prev.subcategories, [category.category_code]: false }
      }));
    }
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (mainCategoryCode, subcategory, isChecked) => {
    // If in edit mode, only allow selecting one subcategory
    if (editMode.active) {
      if (isChecked) {
        // Replace the current selection with the new one
        setSelectedSubcategories({
          [mainCategoryCode]: [subcategory]
        });
      } else {
        // Don't allow deselecting in edit mode
        toast.warning(getText(
          'ในโหมดแก้ไข คุณต้องเลือกรหัส TSIC ใหม่เพื่อแทนที่รหัสเดิม',
          'In edit mode, you must select a new TSIC code to replace the old one'
        ));
      }
      return;
    }
    
    console.log('Handling subcategory change:', mainCategoryCode, subcategory.tsic_code, isChecked);
    
    // Check max subcategories limit before updating state
    if (isChecked) {
      const currentSubs = selectedSubcategories[mainCategoryCode] || [];
      if (currentSubs.length >= MAX_SUBCATEGORIES) {
        // Schedule the toast for the next tick instead of during render
        setTimeout(() => {
          toast.warning(getText(
            `คุณสามารถเลือกได้สูงสุด ${MAX_SUBCATEGORIES} หมวดหมู่ย่อยต่อหมวดหมู่หลัก`,
            `You can select up to ${MAX_SUBCATEGORIES} subcategories per main category`
          ));
        }, 0);
        return; // Don't update state if we've reached the limit
      }
    }
    
    setSelectedSubcategories(prev => {
      const currentSubs = prev[mainCategoryCode] || [];
      let newSubs;
      
      if (isChecked) {
        newSubs = [...currentSubs, subcategory];
      } else {
        newSubs = currentSubs.filter(s => s.tsic_code !== subcategory.tsic_code);
        
        // If this was the last subcategory for this main category, remove the main category as well
        if (newSubs.length === 0) {
          // We'll remove the main category in the next useEffect
          setTimeout(() => {
            setSelectedMainCategories(prevCategories => 
              prevCategories.filter(c => c.category_code !== mainCategoryCode)
            );
          }, 0);
        }
      }
      
      return {
        ...prev,
        [mainCategoryCode]: newSubs
      };
    });
  };

  // Validate and move to review step
  const handleSubmit = () => {
    if (selectedMainCategories.length === 0) {
      toast.warning(getText('กรุณาเลือกอย่างน้อย 1 หมวดหมู่หลัก', 'Please select at least 1 main category'));
      return;
    }
    
    // Check if at least one subcategory is selected for each main category
    for (const category of selectedMainCategories) {
      const subs = selectedSubcategories[category.category_code] || [];
      if (subs.length === 0) {
        const categoryName = language === 'th' ? category.category_name : (category.category_name_EN || category.category_name);
        toast.warning(getText(
          `กรุณาเลือกหมวดหมู่ย่อยอย่างน้อย 1 รายการสำหรับ ${categoryName}`,
          `Please select at least 1 subcategory for ${categoryName}`
        ));
        return;
      }
    }
    
    setCurrentStep(3);
  };

  // Cancel submission
  const cancelSubmit = () => {
    setShowConfirmation(false);
    setCurrentStep(2);
  };

  // Confirm submission
  const confirmSubmit = async () => {
    setIsLoading(prev => ({ ...prev, submit: true }));
    try {
      console.log('Starting TSIC submission process');
      console.log('Current user state:', user);
      console.log('Replacing TSIC code:', replacingTsicCode);
      
      // ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่
      if (!user) {
        console.error('No user found in AuthContext');
        toast.error(getText('กรุณาเข้าสู่ระบบก่อนดำเนินการ', 'Please log in before proceeding'));
        
        // บันทึกสถานะปัจจุบันไว้ใน sessionStorage เพื่อให้กลับมาทำต่อหลังจาก login
        try {
          const currentState = {
            memberCode,
            selectedMainCategories,
            selectedSubcategories,
            currentStep
          };
          sessionStorage.setItem('tsic_selection_state', JSON.stringify(currentState));
          console.log('Saved current state to sessionStorage');
        } catch (e) {
          console.error('Failed to save state to sessionStorage:', e);
        }
        
        // Redirect to login page
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      
      // ตรวจสอบว่าผู้ใช้มี ID หรือไม่
      if (!user.id) {
        console.error('User object does not have an ID');
        toast.error(getText('ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'Invalid user information. Please log in again.'));
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      
      // รวบรวมข้อมูล TSIC codes ที่เลือกไว้
      const allSelectedSubcategories = [];
      Object.values(selectedSubcategories).forEach(subs => {
        if (Array.isArray(subs) && subs.length > 0) {
          allSelectedSubcategories.push(...subs);
        }
      });
      
      console.log('All selected subcategories:', allSelectedSubcategories);
      
      // ตรวจสอบว่ามีการเลือก subcategories หรือไม่
      if (!allSelectedSubcategories || allSelectedSubcategories.length === 0) {
        console.error('No subcategories selected');
        toast.error(getText('กรุณาเลือกรหัส TSIC อย่างน้อย 1 รายการ', 'Please select at least one TSIC code.'));
        setIsLoading(prev => ({ ...prev, submit: false }));
        return;
      }
      
      // แปลง subcategories เป็น TSIC codes
      let tsicCodes = allSelectedSubcategories.map(sub => {
        // ตรวจสอบว่า sub มี tsic_code หรือไม่
        if (!sub || !sub.tsic_code) {
          console.error('Invalid subcategory object:', sub);
          return null;
        }
        return sub.tsic_code;
      }).filter(code => code !== null); // กรองค่า null ออก
      
      // ถ้ากำลังแทนที่รหัส TSIC เดิม ให้ตรวจสอบว่ามีการเลือกรหัสใหม่เพียง 1 รายการ
      if (editMode.active && editMode.tsicCode) {
        if (tsicCodes.length !== 1) {
          toast.warning(getText(
            'กรุณาเลือกรหัส TSIC ใหม่เพียง 1 รายการเพื่อแทนที่รหัสเดิม',
            'Please select only 1 new TSIC code to replace the old one.'
          ));
          setIsLoading(prev => ({ ...prev, submit: false }));
          return;
        }
        
        // เพิ่มข้อมูลว่ากำลังแทนที่รหัสเดิม
        console.log(`Replacing TSIC code ${editMode.tsicCode} with ${tsicCodes[0]}`);
      }
      
      console.log('Selected TSIC codes after filtering:', tsicCodes);
      
      // ตรวจสอบว่ามีการเลือก TSIC codes หรือไม่
      if (!tsicCodes || tsicCodes.length === 0) {
        console.error('No valid TSIC codes after filtering');
        toast.error(getText('กรุณาเลือกรหัส TSIC อย่างน้อย 1 รายการ', 'Please select at least one TSIC code.'));
        setIsLoading(prev => ({ ...prev, submit: false }));
        return;
      }
      
      // แสดงสถานะกำลังโหลด
      setCurrentStep(4);
      
      // ตรวจสอบว่ามี cookie token หรือไม่
      const hasCookieToken = document.cookie.includes('token=');
      console.log('Has cookie token:', hasCookieToken);
      
      // ส่งข้อมูลไปยัง API
      console.log('Submitting TSIC update with user ID:', user.id, 'and email:', user.email);
      const result = await submitTsicUpdate(
        user.email,
        memberCode || '',
        tsicCodes,
        editMode.active ? editMode.tsicCode : null // ส่งรหัส TSIC ที่ต้องการแทนที่ไปด้วย (ถ้ามี)
      );
      
      console.log('TSIC update result:', result);
      
      if (!result.success) {
        // จัดการกับกรณีที่มีข้อผิดพลาด
        if (result.requiresLogin || (result.message && result.message.includes('เข้าสู่ระบบ'))) {
          // กรณีที่ต้องเข้าสู่ระบบใหม่
          console.error('Authentication error, redirecting to login page');
          toast.error(getText('กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'Please log in again'));
          
          // บันทึกสถานะปัจจุบันไว้
          try {
            const currentState = {
              memberCode,
              selectedMainCategories,
              selectedSubcategories,
              currentStep: 3 // กลับไปที่หน้ายืนยันหลังจาก login
            };
            sessionStorage.setItem('tsic_selection_state', JSON.stringify(currentState));
          } catch (e) {
            console.error('Failed to save state to sessionStorage:', e);
          }
          
          // Redirect to login page
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          return;
        }
        
        // กรณีข้อผิดพลาดอื่นๆ
        throw new Error(result.message || getText('ไม่สามารถส่งข้อมูลได้', 'Unable to submit data'));
      }
      
      setShowSuccess(true);
      setShowConfirmation(false);
      
      // ตั้งค่า cooldown เพื่อป้องกันการกดปุ่มซ้ำ
      try {
        const cooldownKey = `tsic_cooldown_${memberCode}`;
        const now = new Date().getTime();
        
        // ตั้งเวลา cooldown เป็น 5 วินาทีสำหรับการพัฒนา
        const cooldownSeconds = 5; // 5 วินาทีสำหรับการพัฒนา
        const cooldownMs = cooldownSeconds * 1000;
        const endTime = new Date(now + cooldownMs);
        
        localStorage.setItem(cooldownKey, JSON.stringify({
          endTime: endTime.toISOString(),
          memberCode
        }));
        
        console.log(`TSIC update cooldown set for ${memberCode}: ${cooldownSeconds} seconds`);
      } catch (e) {
        console.error('Failed to set cooldown:', e);
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);

      toast.success(getText(
        'บันทึกรหัส TSIC เรียบร้อยแล้ว',
        'TSIC codes saved successfully.'
      ));
    } catch (error) {
      console.error('Error submitting TSIC codes:', error);
      toast.error(error.message || getText(
        'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง',
        'An error occurred while submitting data. Please try again.'
      ));
      setCurrentStep(3);
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Get the count of selected subcategories for a category
  const getSelectedCount = (categoryCode) => {
    return (selectedSubcategories[categoryCode] || []).length;
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'th' ? 'en' : 'th');
  };

  // Render the component
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <SectionFlow currentStep={currentStep} language={languageState} />
        <LanguageToggle language={languageState} onToggle={toggleLanguage} />
      </div>
      
      {showSuccess ? (
        <SuccessMessage language={languageState} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentStep === 1 && getText('1. เลือกหมวดหมู่ใหญ่', '1. Select Main Category')}
            {currentStep === 2 && getText('2. เลือกหมวดหมู่ย่อย', '2. Select Subcategory')}
            {currentStep === 3 && getText('3. ตรวจสอบข้อมูล', '3. Review Information')}
            {currentStep === 4 && getText('4. กำลังส่งข้อมูล', '4. Submitting Data')}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {currentStep === 1 && getText(
              `คุณสามารถเลือกได้สูงสุด ${MAX_MAIN_CATEGORIES} หมวดหมู่หลัก`,
              `You can select up to ${MAX_MAIN_CATEGORIES} main categories`
            )}
            {currentStep === 2 && getText(
              `เลือกได้สูงสุด ${MAX_SUBCATEGORIES} หมวดหมู่ย่อยต่อหมวดหมู่หลัก`,
              `Select up to ${MAX_SUBCATEGORIES} subcategories per main category`
            )}
            {currentStep === 3 && getText(
              'ตรวจสอบข้อมูลที่เลือกก่อนยืนยัน',
              'Review your selected information before confirming'
            )}
            {currentStep === 4 && getText(
              'กำลังส่งข้อมูลไปยังระบบ',
              'Submitting data to the system'
            )}
          </p>
          
          {/* Step 1: Main Category Selection */}
          {currentStep === 1 && (
            <>
              <MainCategoryStep 
                mainCategories={mainCategories}
                selectedMainCategories={selectedMainCategories}
                handleMainCategoryChange={handleMainCategoryChange}
                isLoading={isLoading}
                language={languageState}
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => selectedMainCategories.length > 0 && setCurrentStep(2)}
                  disabled={selectedMainCategories.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getText('ถัดไป', 'Next')}
                </button>
              </div>
            </>
          )}
          
          {/* Step 2: Subcategory Selection */}
          {currentStep === 2 && selectedMainCategories.length > 0 && (
            <>
              <SubcategoryStep
                selectedMainCategories={selectedMainCategories}
                filteredSubcategories={filteredSubcategories}
                selectedSubcategories={selectedSubcategories}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                handlePageChange={handlePageChange}
                handleSubcategoryChange={handleSubcategoryChange}
                isLoading={isLoading}
                language={languageState}
                getSelectedCount={getSelectedCount}
              />
              
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {getText('ย้อนกลับ', 'Back')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {getText('ถัดไป', 'Next')}
                </button>
              </div>
            </>
          )}
          
          {/* Step 3: Review and Confirm */}
          {currentStep === 3 && (
            <ReviewStep
              selectedMainCategories={selectedMainCategories}
              selectedSubcategories={selectedSubcategories}
              language={languageState}
              handleCancel={() => setCurrentStep(2)}
              handleSubmit={confirmSubmit}
            />
          )}
          
          {/* Step 4: Loading */}
          {currentStep === 4 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      )}
      
      {showConfirmation && (
        <ConfirmationDialog
          title={getText('ยืนยันการส่งข้อมูล', 'Confirm Submission')}
          message={getText(
            'คุณต้องการส่งข้อมูลรหัส TSIC ที่เลือกหรือไม่?',
            'Do you want to submit the selected TSIC codes?'
          )}
          confirmText={getText('ยืนยัน', 'Confirm')}
          cancelText={getText('ยกเลิก', 'Cancel')}
          onConfirm={confirmSubmit}
          onCancel={cancelSubmit}
        />
      )}
    </div>
  );
}
