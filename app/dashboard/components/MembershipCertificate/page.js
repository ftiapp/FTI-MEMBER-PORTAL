'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion } from 'framer-motion';
import CertificateTable from './CertificateTable';
import { handlePrintCertificate, handleDownloadCertificate } from './utils';

export default function MembershipCertificate() {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    // Fetch member data from API
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      // ดึงข้อมูลจาก API เดียวกับ Wasmember
      const response = await fetch(`/api/member/submissions?userId=${user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch member data');
      }

      const data = await response.json();
      console.log('Fetched all submissions:', data);
      
      // กรองเฉพาะข้อมูลที่ได้รับการอนุมัติ (Admin_Submit = 1)
      let approvedMembers = [];
      
      if (Array.isArray(data)) {
        approvedMembers = data.filter(item => item.Admin_Submit === 1);
      } else if (data && data.submissions) {
        approvedMembers = data.submissions.filter(item => item.Admin_Submit === 1);
      }
      
      console.log('Approved members:', approvedMembers);
      
      // กรองข้อมูลซ้ำ - แสดงเพียงรายการเดียวต่อ Member_code (เก็บข้อมูลล่าสุด)
      const memberMap = new Map();
      approvedMembers.forEach(member => {
        if (member.MEMBER_CODE) {
          // เก็บข้อมูลล่าสุดหรือข้อมูลที่มี ID มากที่สุด
          const existingMember = memberMap.get(member.MEMBER_CODE);
          if (!existingMember || (member.id && existingMember.id && member.id > existingMember.id)) {
            memberMap.set(member.MEMBER_CODE, member);
          } else if (!existingMember) {
            memberMap.set(member.MEMBER_CODE, member);
          }
        }
      });
      
      const uniqueMembers = Array.from(memberMap.values());
      console.log('Unique members after deduplication:', uniqueMembers);
      setMemberData(uniqueMembers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching member data:', err);
      setError('ไม่สามารถดึงข้อมูลสมาชิกได้ กรุณาลองใหม่ภายหลัง');
      setLoading(false);
    }
  };

  // Make sure memberData is an array before filtering
  const memberDataArray = Array.isArray(memberData) ? memberData : [memberData].filter(Boolean);
  
  // Filter and search functionality
  const filteredMembers = memberDataArray.filter(member => {
    if (!member) return false;
    
    const matchesSearch = searchTerm === '' ||
      (member.company_name && member.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.MEMBER_CODE && member.MEMBER_CODE.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === '' ||
      (member.company_type && member.company_type === filterType);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  // Get unique member types for filter dropdown
  const memberTypes = [...new Set(memberDataArray.map(member => member && member.company_type).filter(Boolean))];

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!memberDataArray.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>ไม่พบข้อมูลสมาชิกที่ได้รับการอนุมัติ กรุณาติดต่อเจ้าหน้าที่</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CertificateTable 
        currentItems={currentItems}
        memberData={memberData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        memberTypes={memberTypes}
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </motion.div>
  );
}