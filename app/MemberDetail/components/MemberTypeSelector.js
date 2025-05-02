'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaIndustry, FaCity, FaSpinner } from 'react-icons/fa';

/**
 * MemberTypeSelector component for selecting between different member types
 * 
 * @param {Object} props Component properties
 * @param {string} props.memberCode The member code to fetch membership types for
 * @param {Function} props.onSelectType Callback function when a type is selected
 */
export default function MemberTypeSelector({ memberCode, onSelectType }) {
  const [membershipTypes, setMembershipTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: { 
      scale: 1.03, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

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
          // Process membership types
          const memberships = {
            '000': {},
            '100': {},
            '200': {}
          };
          
          // Loop through all companies
          Object.values(data.data).forEach(company => {
            const companyInfo = company.companyInfo;
            const mainGroupCode = companyInfo.MEMBER_MAIN_GROUP_CODE;
            const groupCode = companyInfo.MEMBER_GROUP_CODE;
            
            // Add the group to the main group
            if (!memberships[mainGroupCode][groupCode]) {
              memberships[mainGroupCode][groupCode] = {
                name: '',
                nameEn: '',
                count: 0
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
            
            // Increment the count
            memberships[mainGroupCode][groupCode].count++;
          });
          
          setMembershipTypes(memberships);
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

  // Check if there are any membership types
  const hasFTI = membershipTypes['000'] && Object.keys(membershipTypes['000']).length > 0;
  const hasIndustryGroups = membershipTypes['100'] && Object.keys(membershipTypes['100']).length > 0;
  const hasProvinces = membershipTypes['200'] && Object.keys(membershipTypes['200']).length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
        <p className="font-medium">เกิดข้อผิดพลาด</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!hasFTI && !hasIndustryGroups && !hasProvinces) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
        <p>ไม่พบข้อมูลการเป็นสมาชิกสำหรับรหัสสมาชิกนี้</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="text-xl font-semibold text-gray-800 mb-6"
        variants={itemVariants}
      >
        กรุณาเลือกประเภทสมาชิกที่ต้องการดูข้อมูล
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* สภาอุตสาหกรรมแห่งประเทศไทย (000) */}
        {hasFTI && (
          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100 hover:border-blue-300 transition-colors duration-300"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelectType('000')}
          >
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-center">
                <FaBuilding className="text-2xl mr-3" />
                <h3 className="text-lg font-medium">สภาอุตสาหกรรมแห่งประเทศไทย</h3>
              </div>
              <p className="text-sm text-blue-100 mt-1">The Federation of Thai Industries</p>
            </div>
            <div className="p-4">
              <p className="text-gray-600">
                ข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">รหัสสมาชิก: {memberCode}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ดูข้อมูล
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* กลุ่มอุตสาหกรรม (100) */}
        {hasIndustryGroups && (
          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden border border-green-100 hover:border-green-300 transition-colors duration-300"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelectType('100')}
          >
            <div className="bg-green-600 p-4 text-white">
              <div className="flex items-center">
                <FaIndustry className="text-2xl mr-3" />
                <h3 className="text-lg font-medium">กลุ่มอุตสาหกรรม</h3>
              </div>
              <p className="text-sm text-green-100 mt-1">Industry Groups</p>
            </div>
            <div className="p-4">
              <p className="text-gray-600">
                ข้อมูลสมาชิกกลุ่มอุตสาหกรรม {Object.keys(membershipTypes['100']).length > 1 ? `(${Object.keys(membershipTypes['100']).length} กลุ่ม)` : ''}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">รหัสสมาชิก: {memberCode}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ดูข้อมูล
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* สภาอุตสาหกรรมจังหวัด (200) */}
        {hasProvinces && (
          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 hover:border-purple-300 transition-colors duration-300"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelectType('200')}
          >
            <div className="bg-purple-600 p-4 text-white">
              <div className="flex items-center">
                <FaCity className="text-2xl mr-3" />
                <h3 className="text-lg font-medium">สภาอุตสาหกรรมจังหวัด</h3>
              </div>
              <p className="text-sm text-purple-100 mt-1">Provincial Industry</p>
            </div>
            <div className="p-4">
              <p className="text-gray-600">
                ข้อมูลสมาชิกสภาอุตสาหกรรมจังหวัด {Object.keys(membershipTypes['200']).length > 1 ? `(${Object.keys(membershipTypes['200']).length} จังหวัด)` : ''}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">รหัสสมาชิก: {memberCode}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ดูข้อมูล
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* If there are multiple groups or provinces, show a second level selection */}
      {(Object.keys(membershipTypes['100']).length > 1 || Object.keys(membershipTypes['200']).length > 1) && (
        <motion.div
          className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-blue-700">
            <strong>หมายเหตุ:</strong> สมาชิกนี้มีการเป็นสมาชิกหลายประเภท คุณสามารถเลือกดูข้อมูลแต่ละประเภทได้โดยการคลิกที่ประเภทสมาชิกที่ต้องการ
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
