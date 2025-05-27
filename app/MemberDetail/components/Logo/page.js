'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LogoUploader from './components/LogoUploader';
import LogoDisplay from './components/LogoDisplay';
import LogoGuide from './components/LogoGuide';
import LoadingState from '../Loadingstate';
import ErrorState from '../ErrorState';
import EmptyState from '../Emptystate';

/**
 * Logo tab content for member detail page
 */
export default function LogoTabContent({ companyInfo, memberType, memberGroupCode, typeCode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoData, setLogoData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const memberCode = companyInfo?.MEMBER_CODE;

  useEffect(() => {
    if (!memberCode) return;
    
    const fetchLogo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/member/logo?memberCode=${encodeURIComponent(memberCode)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลโลโก้ได้ (${response.status})`);
        }

        const data = await response.json();
        
        if (data.success) {
          setLogoData(data.data || null);
        } else {
          // Not finding a logo is not an error
          if (data.error === 'ไม่พบข้อมูลโลโก้') {
            setLogoData(null);
          } else {
            setError(data.error || 'ไม่พบข้อมูลโลโก้');
          }
        }
      } catch (err) {
        console.error('Error fetching logo data:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [memberCode]);

  const handleLogoUpdate = (updatedData) => {
    setLogoData(updatedData);
    setIsEditing(false);
  };

  const handleLogoDelete = async () => {
    if (!logoData || !logoData.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/member/logo/delete?id=${logoData.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`ไม่สามารถลบโลโก้ได้ (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLogoData(null);
      } else {
        setError(data.error || 'ไม่สามารถลบโลโก้ได้');
      }
    } catch (err) {
      console.error('Error deleting logo:', err);
      setError(err.message || 'ไม่สามารถลบโลโก้ได้');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-600">โลโก้/ตราสัญลักษณ์บริษัท</h2>
        {!isEditing && memberType === '000' && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {logoData ? 'แก้ไขโลโก้' : 'เพิ่มโลโก้'}
          </button>
        )}
      </div>

      {/* Guide section */}
      <LogoGuide />

      {/* Display or edit logo */}
      {isEditing ? (
        <LogoUploader 
          memberCode={memberCode} 
          existingLogo={logoData} 
          onUpdate={handleLogoUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        logoData ? (
          <LogoDisplay 
            logoData={logoData} 
            onDelete={handleLogoDelete} 
          />
        ) : (
          <EmptyState message="ยังไม่มีโลโก้บริษัท กรุณาคลิกปุ่ม 'เพิ่มโลโก้' เพื่อเพิ่มโลโก้บริษัทของคุณ" />
        )
      )}
    </motion.div>
  );
}
