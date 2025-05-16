'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import LoadingState from './Loadingstate';
import ErrorState from './ErrorState';
import EmptyState from './Emptystate';
import MemberDetailHeader from './MemberDetailHeader';
import MemberDetailTabs from './MemberDetailTabs';
import InfoTabContent from './InfoTabContent';
import AddressTabContent from './AddressTabContent/page';
import RepresentativeTabContent from './RepresentativeTabContent';
import ProductsPage from './Product/page';
import MembershipTabContent from './MembershipTabContent';
import MemberTypeFilter from './MemberTypeFilter';

// Import constants
import { 
  statusCodeMap, 
  memberTypeCodeMap, 
  getOrganizationType,
  containerVariants,
  itemVariants
} from './constants';

/**
 * MemberDetailComponent displays detailed information about a member based on their member code
 * It handles different types of members based on MEMBER_MAIN_GROUP_CODE (000, 100, 200)
 * and displays specific information based on the selected member type
 * 
 * @param {Object} props Component properties
 * @param {string} props.memberCode The member code to fetch details for
 * @param {string} props.selectedMemberType The selected member type (000, 100, 200)
 * @param {string} props.memberTypeCode The specific group code within the member type (optional)
 */
export default function MemberDetailComponent({ memberCode, selectedMemberType, memberTypeCode }) {
  const [memberData, setMemberData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [membershipTypes, setMembershipTypes] = useState({});
  const [memberTypeTitle, setMemberTypeTitle] = useState('');
  const [selectedFilterCode, setSelectedFilterCode] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberCode) {
        setLoading(false);
        setError('ไม่ได้ระบุรหัสสมาชิก');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for memberCode:', memberCode);
        
        const response = await fetch(`/api/member-detail?memberCode=${encodeURIComponent(memberCode)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลสมาชิกได้ (${response.status})`);
        }

        const data = await response.json();
        console.log('Member data received:', data);
        
        if (data.success && data.data) {
          setMemberData(data.data);
          
          // Process membership types
          const memberships = {};
          
          // Loop through all companies
          Object.values(data.data).forEach(company => {
            const companyInfo = company.companyInfo;
            const mainGroupCode = companyInfo.MEMBER_MAIN_GROUP_CODE;
            const groupCode = companyInfo.MEMBER_GROUP_CODE;
            
            // Initialize the main group if it doesn't exist
            if (!memberships[mainGroupCode]) {
              memberships[mainGroupCode] = {};
            }
            
            // Add the group to the main group
            if (!memberships[mainGroupCode][groupCode]) {
              memberships[mainGroupCode][groupCode] = {
                name: '',
                nameEn: ''
              };
              
              // Set the appropriate name based on the main group code
              if (mainGroupCode === '000') {
                memberships[mainGroupCode][groupCode].name = 'สภาอุตสาหกรรมแห่งประเทศไทย';
                memberships[mainGroupCode][groupCode].nameEn = 'The Federation of Thai Industries';
              } else if (mainGroupCode === '100') {
                memberships[mainGroupCode][groupCode].name = companyInfo.Industry_GROUP_NAME || 'กลุ่มอุตสาหกรรม';
                memberships[mainGroupCode][groupCode].nameEn = companyInfo.Industry_GROUP_NAME_EN || 'Industry Group';
              } else if (mainGroupCode === '200') {
                memberships[mainGroupCode][groupCode].name = companyInfo.Province_GROUP_NAME || 'สภาอุตสาหกรรมจังหวัด';
                memberships[mainGroupCode][groupCode].nameEn = companyInfo.Province_GROUP_NAME_EN || 'Provincial Industry';
              }
            }
          });
          
          setMembershipTypes(memberships);
          
          // Filter data based on selected member type if provided
          if (selectedMemberType) {
            filterDataByMemberType(data.data, selectedMemberType, memberTypeCode);
          }
        } else {
          setError(data.error || 'ไม่พบข้อมูลสมาชิก');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberCode, selectedMemberType, memberTypeCode]);
  
  // Filter data based on selected member type and filter code
  const filterDataByMemberType = (data, type, typeCode) => {
    if (!data || !type) return;
    
    const filteredResults = {};
    let title = '';
    const filterCode = typeCode || selectedFilterCode;
    
    // Loop through all companies
    Object.entries(data).forEach(([registCode, company]) => {
      const companyInfo = company.companyInfo;
      const mainGroupCode = companyInfo.MEMBER_MAIN_GROUP_CODE;
      const groupCode = companyInfo.MEMBER_GROUP_CODE;
      
      // Check if this company matches the selected type
      if (mainGroupCode === type) {
        // If a specific filter code is provided, check if it matches
        if (!filterCode || groupCode === filterCode) {
          filteredResults[registCode] = company;
          
          // Set the title based on the type
          if (type === '000') {
            title = 'สภาอุตสาหกรรมแห่งประเทศไทย';
          } else if (type === '100') {
            title = companyInfo.Industry_GROUP_NAME || 'กลุ่มอุตสาหกรรม';
          } else if (type === '200') {
            title = companyInfo.Province_GROUP_NAME || 'สภาอุตสาหกรรมจังหวัด';
          }
        }
      }
    });
    
    setFilteredData(filteredResults);
    setMemberTypeTitle(title);
  };
  
  // Handle filter selection
  const handleFilterSelect = (filterCode) => {
    setSelectedFilterCode(filterCode);
    filterDataByMemberType(memberData, selectedMemberType, filterCode);
    
    // Update URL with the selected filter code without reloading the page
    const params = new URLSearchParams(window.location.search);
    params.set('typeCode', filterCode);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // No data state
  if (!memberData || Object.keys(memberData).length === 0) {
    return <EmptyState />;
  }
  
  // Use filtered data if available, otherwise use all data
  const displayData = filteredData || memberData;
  
  // No data for selected type
  if (Object.keys(displayData).length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
        <p>ไม่พบข้อมูลสำหรับประเภทสมาชิกที่เลือก</p>
      </div>
    );
  }
  


  // Get the appropriate membership data for the filter
  const getMembershipDataForFilter = () => {
    if (!selectedMemberType || !membershipTypes[selectedMemberType]) {
      return {};
    }
    return membershipTypes[selectedMemberType];
  };

  // Get the first company data for display
  const firstRegistCode = Object.keys(displayData)[0];
  const firstCompany = displayData[firstRegistCode];
  const companyInfo = firstCompany.companyInfo;
  const addresses = firstCompany.addresses;
  const representatives = firstCompany.representatives;

  // Check if multiple companies with the same REGIST_CODE exist
  const multipleCompanies = Object.keys(displayData).length > 1;
  
  // Get status information
  const statusInfo = statusCodeMap[companyInfo.MEMBER_STATUS_CODE] || { name: 'ไม่ระบุสถานะ', color: 'gray' };
  
  // Get member type information
  const memberTypeInfo = memberTypeCodeMap[companyInfo.MEMBER_TYPE_CODE] || { name: 'ไม่ระบุประเภท', color: 'gray' };

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-lg overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Filter for selected member type */}
      {selectedMemberType && Object.keys(membershipTypes).length > 0 && (
        <MemberTypeFilter
          memberType={selectedMemberType}
          membershipData={getMembershipDataForFilter()}
          onSelectFilter={handleFilterSelect}
        />
      )}

      {/* Header with company name and type */}
      <MemberDetailHeader 
        companyInfo={companyInfo}
        memberTypeInfo={memberTypeInfo}
        statusInfo={statusInfo}
        getOrganizationType={getOrganizationType}
        itemVariants={itemVariants}
        memberTypeTitle={memberTypeTitle}
        selectedMemberType={selectedMemberType}
      />

      {/* Tabs */}
      <MemberDetailTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemVariants={itemVariants}
        showMembershipTab={!selectedMemberType && Object.keys(membershipTypes).length > 0}
      />
      
  

      {/* Content based on active tab */}
      <motion.div 
        className="p-6 relative z-10 overflow-visible"
        variants={itemVariants}
      >
        <AnimatePresence mode="wait">
          {/* General Information Tab */}
          {activeTab === 'info' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InfoTabContent 
                companyInfo={companyInfo}
                memberTypeInfo={memberTypeInfo}
                statusInfo={statusInfo}
                getOrganizationType={getOrganizationType}
                containerVariants={containerVariants}
                itemVariants={itemVariants}
                multipleCompanies={multipleCompanies}
              />
            </motion.div>
          )}

          {/* Address Tab */}
          {activeTab === 'addresses' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AddressTabContent 
                addresses={addresses} 
                memberCode={companyInfo.MEMBER_CODE}
                memberType={companyInfo.MEMBER_MAIN_GROUP_CODE}
                memberGroupCode={companyInfo.MEMBER_GROUP_CODE}
                typeCode={companyInfo.MEMBER_TYPE_CODE}
              />
            </motion.div>
          )}

          {/* Representatives Tab */}
          {activeTab === 'representatives' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RepresentativeTabContent 
                companyInfo={companyInfo}
                representatives={representatives}
              />
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductsPage companyInfo={companyInfo} />
            </motion.div>
          )}
          
          {/* Memberships Tab */}
          {activeTab === 'memberships' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MembershipTabContent 
                membershipTypes={membershipTypes} 
                companyInfo={companyInfo}
                containerVariants={containerVariants}
                itemVariants={itemVariants}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}