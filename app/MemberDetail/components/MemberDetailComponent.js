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
import AddressTabContent from './AddressTabContent';
import RepresentativeTabContent from './RepresentativeTabContent';
import ProductsTabContent from './ProductTabContent';

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
 * and displays multiple addresses if available (ADDR_CODE 001, 002, 003)
 * 
 * @param {Object} props Component properties
 * @param {string} props.memberCode The member code to fetch details for
 */
export default function MemberDetailComponent({ memberCode }) {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

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
  }, [memberCode]);

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

  // Get the first company data for display
  const firstRegistCode = Object.keys(memberData)[0];
  const firstCompany = memberData[firstRegistCode];
  const companyInfo = firstCompany.companyInfo;
  const addresses = firstCompany.addresses;
  const representatives = firstCompany.representatives;

  // Check if multiple companies with the same REGIST_CODE exist
  const multipleCompanies = Object.keys(memberData).length > 1;
  
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
      {/* Header with company name and type */}
      <MemberDetailHeader 
        companyInfo={companyInfo}
        memberTypeInfo={memberTypeInfo}
        statusInfo={statusInfo}
        getOrganizationType={getOrganizationType}
        itemVariants={itemVariants}
      />

      {/* Tabs */}
      <MemberDetailTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemVariants={itemVariants}
      />
      
  

      {/* Content based on active tab */}
      <motion.div 
        className="p-6"
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
              <AddressTabContent addresses={addresses} />
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
              <ProductsTabContent companyInfo={companyInfo} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}