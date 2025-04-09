'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  FaIdCard, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaFileAlt, 
  FaIdBadge, 
  FaRegAddressCard, 
  FaDownload
} from 'react-icons/fa';

/**
 * MemberDetail component displays detailed information about an approved member
 * @param {Object} props Component properties
 * @param {number} props.userId The user ID to fetch member details for
 */
export default function MemberDetail({ userId }) {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/member/details?userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสมาชิกได้');
        }

        const data = await response.json();
        setMemberData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError('ไม่สามารถดึงข้อมูลสมาชิกได้');
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="text-center text-gray-500">
          <p>ไม่พบข้อมูลสมาชิก</p>
        </div>
      </div>
    );
  }

  const {
    MEMBER_CODE,
    company_name,
    company_type,
    registration_number,
    tax_id,
    address,
    province,
    postal_code,
    phone,
    website,
    email,
    admin_comment,
    reject_reason,
    Admin_Submit,
    created_at,
    updated_at,
    name,
    firstname,
    lastname,
    documents
  } = memberData;
  
  // Determine the display name to use
  const displayName = name || (firstname && lastname ? `${firstname} ${lastname}` : '');

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">ข้อมูลสมาชิก</h2>
      
      {/* Member Code and Status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {MEMBER_CODE && (
            <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
              <FaIdCard className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-blue-700">รหัสสมาชิก</p>
                <p className="text-sm font-medium">{MEMBER_CODE}</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${Admin_Submit ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {Admin_Submit ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
          </span>
        </div>
      </div>
      
      {/* Company Information */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ข้อมูลบริษัท</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company_name && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaBuilding className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">ชื่อบริษัท</p>
                <p className="text-sm text-gray-900">{company_name}</p>
              </div>
            </div>
          )}
          
          {company_type && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaBuilding className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">ประเภทบริษัท</p>
                <p className="text-sm text-gray-900">{company_type}</p>
              </div>
            </div>
          )}
          
          {registration_number && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaIdBadge className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">เลขทะเบียนบริษัท</p>
                <p className="text-sm text-gray-900">{registration_number}</p>
              </div>
            </div>
          )}
          
          {tax_id && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaRegAddressCard className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</p>
                <p className="text-sm text-gray-900">{tax_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ข้อมูลการติดต่อ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phone && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaPhone className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">โทรศัพท์</p>
                <p className="text-sm text-gray-900">{phone}</p>
              </div>
            </div>
          )}
          
          {email && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaEnvelope className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">อีเมล</p>
                <p className="text-sm text-gray-900">{email}</p>
              </div>
            </div>
          )}
          
          {website && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaGlobe className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">เว็บไซต์</p>
                <p className="text-sm text-gray-900">
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {website}
                  </a>
                </p>
              </div>
            </div>
          )}
          
          {displayName && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaIdCard className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">ชื่อผู้ติดต่อ</p>
                <p className="text-sm text-gray-900">{displayName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Address */}
      {(address || province || postal_code) && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ที่อยู่</h3>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">
                {address}
                {address && (province || postal_code) ? ', ' : ''}
                {province}
                {province && postal_code ? ' ' : ''}
                {postal_code}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents */}
      {documents && documents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">เอกสาร</h3>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaFileAlt className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${doc.status === 'approved' ? 'bg-green-100 text-green-800' : doc.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {doc.status === 'approved' ? 'อนุมัติแล้ว' : doc.status === 'rejected' ? 'ถูกปฏิเสธ' : 'รอการอนุมัติ'}
                      </span>
                      {doc.uploaded_at && (
                        <span className="text-xs text-gray-500 ml-2">
                          อัพโหลดเมื่อ {new Date(doc.uploaded_at).toLocaleDateString('th-TH')}
                        </span>
                      )}
                    </div>
                    {doc.reject_reason && (
                      <p className="text-xs text-red-600 mt-1">เหตุผลที่ปฏิเสธ: {doc.reject_reason}</p>
                    )}
                  </div>
                </div>
                {doc.file_path && (
                  <a 
                    href={doc.file_path} 
                    download 
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <FaDownload className="mr-1" /> ดาวน์โหลด
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Admin Comments */}
      {(admin_comment || reject_reason) && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ความคิดเห็นจากผู้ดูแลระบบ</h3>
          {admin_comment && (
            <div className="p-3 bg-blue-50 rounded-lg mb-3">
              <p className="text-sm text-gray-800">{admin_comment}</p>
            </div>
          )}
          {reject_reason && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">เหตุผลที่ปฏิเสธ:</p>
              <p className="text-sm text-red-700">{reject_reason}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Timestamps */}
      <div className="mt-6 text-right space-y-1">
        {created_at && (
          <p className="text-xs text-gray-500">
            สร้างเมื่อ: {new Date(created_at).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
        {updated_at && (
          <p className="text-xs text-gray-500">
            อัพเดตล่าสุด: {new Date(updated_at).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  );
}
