'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../../components/AdminLayout';
import { formatDate } from '../../../../product-updates/utils/formatters';

export default function MembershipRequestDetail({ params }) {
  const router = useRouter();
  const { type, id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [industrialGroups, setIndustrialGroups] = useState({});
  const [provincialChapters, setProvincialChapters] = useState({});

  // Fetch group names from MSSQL APIs
  const fetchGroupNames = async (groupIds, apiEndpoint) => {
    if (!groupIds || groupIds.length === 0) return {};
    
    try {
      const groupNames = {};
      // Fetch all groups from the API
      const response = await fetch(`${apiEndpoint}?limit=1000`);
      if (response.ok) {
        const data = await response.json();
        const groups = data.data || [];
        
        // Map each group ID to its name
        groupIds.forEach(groupItem => {
          const groupId = groupItem.id;
          const group = groups.find(g => g.MEMBER_GROUP_CODE === groupId);
          if (group) {
            groupNames[groupId] = group.MEMBER_GROUP_NAME;
          }
        });
      }
      return groupNames;
    } catch (error) {
      console.error('Error fetching group names:', error);
      return {};
    }
  };

  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch application details based on type and id
        const response = await fetch(`/api/admin/membership-requests/${type}/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch application details');
        }
        
        const data = await response.json();
        if (data.success) {
          setApplication(data.data);
          
          // Fetch group names if this is OC type
          if (type === 'oc' && data.data) {
            const [industrialGroupNames, provincialChapterNames] = await Promise.all([
              fetchGroupNames(data.data.industrialGroupIds, '/api/industrial-groups'),
              fetchGroupNames(data.data.provincialChapterIds, '/api/provincial-chapters')
            ]);
            
            setIndustrialGroups(industrialGroupNames);
            setProvincialChapters(provincialChapterNames);
          }
        } else {
          toast.error(data.message || 'ไม่สามารถดึงข้อมูลการสมัครสมาชิกได้');
          router.push('/admin/dashboard/membership-requests');
        }
      } catch (error) {
        console.error('Error fetching application details:', error);
        toast.error('ไม่สามารถดึงข้อมูลการสมัครสมาชิกได้');
        router.push('/admin/dashboard/membership-requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (type && id) {
      fetchApplicationDetails();
    }
  }, [type, id, router]);

  // Handle approve application
  const handleApprove = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNote }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('อนุมัติการสมัครสมาชิกเรียบร้อยแล้ว');
        router.push('/admin/dashboard/membership-requests');
      } else {
        toast.error(data.message || 'ไม่สามารถอนุมัติการสมัครสมาชิกได้');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('ไม่สามารถอนุมัติการสมัครสมาชิกได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject application
  const handleReject = async () => {
    if (isSubmitting) return;
    
    if (!rejectionReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminNote,
          rejectionReason 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('ปฏิเสธการสมัครสมาชิกเรียบร้อยแล้ว');
        router.push('/admin/dashboard/membership-requests');
      } else {
        toast.error(data.message || 'ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('ไม่สามารถปฏิเสธการสมัครสมาชิกได้');
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle view document
  const handleViewDocument = (filePath) => {
    if (!filePath) return;
    
    // If it's a full URL, open directly
    if (filePath.startsWith('http')) {
      window.open(filePath, '_blank');
      return;
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const fullUrl = `${baseUrl}/${filePath.replace(/^\//, '')}`;
    window.open(fullUrl, '_blank');
  };

  // Get member type text
  const getMemberTypeText = (type) => {
    switch (type) {
      case 'oc':
        return 'สน (สามัญ-โรงงาน)';
      case 'am':
        return 'สส (สามัญ-สมาคมการค้า)';
      case 'ac':
        return 'ทน (สมทบ-นิติบุคคล)';
      case 'ic':
        return 'ทบ (สมทบ-บุคคลธรรมดา)';
      default:
        return 'ไม่ทราบประเภท';
    }
  };

  // Render application details based on type
  const renderApplicationDetails = () => {
    if (!application) return null;

    switch (type) {
      case 'oc':
        return renderOCDetails();
      case 'am':
        return renderAMDetails();
      case 'ac':
        return renderACDetails();
      case 'ic':
        return renderICDetails();
      default:
        return <p>ไม่พบข้อมูลประเภทสมาชิกที่ระบุ</p>;
    }
  };

  // Render OC (สามัญ-โรงงาน) details
  const renderOCDetails = () => {
    return (
      <div className="space-y-8">
        {/* ข้อมูลบริษัท */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลบริษัท</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">ชื่อบริษัท (ไทย)</p>
              <p className="font-medium">{application.companyNameTh || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ชื่อบริษัท (อังกฤษ)</p>
              <p className="font-medium">{application.companyNameEn || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">เลขประจำตัวผู้เสียภาษี</p>
              <p className="font-medium">{application.taxId || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ประเภทโรงงาน</p>
              <p className="font-medium">
                {application.factoryType === 'type1' 
                  ? 'เครื่องจักร > 50 แรงม้า' 
                  : application.factoryType === 'type2' 
                  ? 'ไม่มีเครื่องจักรหรือ < 50 แรงม้า' 
                  : application.factoryType || '-'
                }
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">จำนวนพนักงาน</p>
              <p className="font-medium">{application.numberOfEmployees || '-'}</p>
            </div>
          </div>
        </div>

        {/* ข้อมูลที่อยู่ */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลที่อยู่</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">เลขที่</p>
              <p className="font-medium">{application.address_number || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">หมู่</p>
              <p className="font-medium">{application.moo || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ซอย</p>
              <p className="font-medium">{application.soi || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ถนน</p>
              <p className="font-medium">{application.street || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ตำบล/แขวง</p>
              <p className="font-medium">{application.sub_district || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">อำเภอ/เขต</p>
              <p className="font-medium">{application.district || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">จังหวัด</p>
              <p className="font-medium">{application.province || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">รหัสไปรษณีย์</p>
              <p className="font-medium">{application.postal_code || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
              <p className="font-medium">{application.companyPhone || application.company_phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">อีเมล</p>
              <p className="font-medium">{application.companyEmail || application.company_email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">เว็บไซต์</p>
              <p className="font-medium">
                {application.companyWebsite || application.company_website || application.website || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* ข้อมูลผู้ติดต่อ */}
        {application.contactPerson && application.contactPerson.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้ติดต่อ</h3>
            <div className="space-y-4">
              {application.contactPerson.map((contact, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
                      <p className="font-medium">{contact.first_name_th || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
                      <p className="font-medium">{contact.last_name_th || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
                      <p className="font-medium">{contact.first_name_en || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
                      <p className="font-medium">{contact.last_name_en || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                      <p className="font-medium">{contact.position || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">อีเมล</p>
                      <p className="font-medium">{contact.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                      <p className="font-medium">{contact.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ข้อมูลผู้แทน */}
        {application.representatives && application.representatives.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้แทน</h3>
            <div className="space-y-4">
              {application.representatives.map((rep, index) => (
                <div key={index} className={`border-l-4 pl-4 py-2 ${
                  rep.is_primary ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      ผู้แทนคนที่ {rep.rep_order || index + 1}
                    </span>
                    {rep.is_primary && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        ผู้แทนหลัก
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
                      <p className="font-medium">{rep.first_name_th || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
                      <p className="font-medium">{rep.last_name_th || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
                      <p className="font-medium">{rep.first_name_en || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
                      <p className="font-medium">{rep.last_name_en || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                      <p className="font-medium">{rep.position || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">อีเมล</p>
                      <p className="font-medium">{rep.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                      <p className="font-medium">{rep.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ข้อมูลธุรกิจ */}
        {((application.businessTypes && application.businessTypes.length > 0) || (application.products && application.products.length > 0)) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลธุรกิจ</h3>
            
            {/* ประเภทธุรกิจ */}
            {application.businessTypes && application.businessTypes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
                <div className="flex flex-wrap gap-2">
                  {application.businessTypes.map((businessType, index) => {
                    const getBusinessTypeName = (type) => {
                      const types = {
                        'manufacturer': 'ผู้ผลิต',
                        'distributor': 'ผู้จัดจำหน่าย',
                        'importer': 'ผู้นำเข้า',
                        'exporter': 'ผู้ส่งออก',
                        'service': 'ผู้ให้บริการ',
                        'other': 'อื่นๆ'
                      };
                      return types[type] || type;
                    };
                    
                    return (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {getBusinessTypeName(businessType.business_type)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* สินค้าและบริการ */}
            {application.products && application.products.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">สินค้าและบริการ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.products.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (ไทย)</p>
                          <p className="font-medium">{product.name_th || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                          <p className="font-medium">{product.name_en || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
        {((application.industrialGroupIds && application.industrialGroupIds.length > 0) || (application.provincialChapterIds && application.provincialChapterIds.length > 0)) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด</h3>
            
            {/* กลุ่มอุตสาหกรรม */}
            {application.industrialGroupIds && application.industrialGroupIds.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">กลุ่มอุตสาหกรรม</h4>
                <div className="space-y-2">
                  {application.industrialGroupIds.map((group, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {industrialGroups[group.id] || `รหัส: ${group.id}`}
                        </span>
                        {industrialGroups[group.id] && (
                          <span className="text-xs text-gray-500 ml-2">(รหัส: {group.id})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* สภาอุตสาหกรรมจังหวัด */}
            {application.provincialChapterIds && application.provincialChapterIds.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">สภาอุตสาหกรรมจังหวัด</h4>
                <div className="space-y-2">
                  {application.provincialChapterIds.map((chapter, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {provincialChapters[chapter.id] || `รหัส: ${chapter.id}`}
                        </span>
                        {provincialChapters[chapter.id] && (
                          <span className="text-xs text-gray-500 ml-2">(รหัส: {chapter.id})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ข้อมูลเอกสาร */}
        {application.documents && application.documents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">เอกสารแนบ</h3>
            <div className="space-y-2">
              {application.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{doc.document_name || `เอกสาร ${index + 1}`}</p>
                    <p className="text-gray-500 text-xs">{doc.file_path || '-'}</p>
                  </div>
                  {doc.file_path && (
                    <button 
                      onClick={() => handleViewDocument(doc.file_path)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      title="ดูเอกสาร"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      ดู
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render AM (สามัญ-สมาคมการค้า) details
  const renderAMDetails = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">ข้อมูลสมาคมการค้า</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">ชื่อสมาคม (ไทย)</p>
            <p className="font-medium">{application.associationNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">ชื่อสมาคม (อังกฤษ)</p>
            <p className="font-medium">{application.associationNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เลขประจำตัวผู้เสียภาษี</p>
            <p className="font-medium">{application.taxId || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">อีเมล</p>
            <p className="font-medium">{application.email || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เบอร์โทรศัพท์</p>
            <p className="font-medium">{application.phone || '-'}</p>
          </div>
        </div>

        {/* Additional sections for AM like address, representatives, etc. would go here */}
      </div>
    );
  };

  // Render AC (สมทบ-นิติบุคคล) details
  const renderACDetails = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">ข้อมูลบริษัท</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">ชื่อบริษัท (ไทย)</p>
            <p className="font-medium">{application.companyNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">ชื่อบริษัท (อังกฤษ)</p>
            <p className="font-medium">{application.companyNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เลขประจำตัวผู้เสียภาษี</p>
            <p className="font-medium">{application.taxId || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">อีเมล</p>
            <p className="font-medium">{application.companyEmail || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เบอร์โทรศัพท์</p>
            <p className="font-medium">{application.companyPhone || '-'}</p>
          </div>
        </div>

        {/* Additional sections for AC like address, representatives, etc. would go here */}
      </div>
    );
  };

  // Render IC (สมทบ-บุคคลธรรมดา) details
  const renderICDetails = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">ข้อมูลผู้สมัคร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">ชื่อ (ไทย)</p>
            <p className="font-medium">{application.firstNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">นามสกุล (ไทย)</p>
            <p className="font-medium">{application.lastNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">ชื่อ (อังกฤษ)</p>
            <p className="font-medium">{application.firstNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">นามสกุล (อังกฤษ)</p>
            <p className="font-medium">{application.lastNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เลขบัตรประชาชน</p>
            <p className="font-medium">{application.idCard || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">อีเมล</p>
            <p className="font-medium">{application.email || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">เบอร์โทรศัพท์</p>
            <p className="font-medium">{application.phone || '-'}</p>
          </div>
        </div>

        {/* Additional sections for IC like address, business info, etc. would go here */}
      </div>
    );
  };

  // Render rejection modal
  const renderRejectModal = () => {
    if (!showRejectModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">ปฏิเสธการสมัครสมาชิก</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">เหตุผลในการปฏิเสธ <span className="text-red-500">*</span></label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="ระบุเหตุผลในการปฏิเสธ"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 print:py-0">
        {/* Back button - hide when printing */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => router.push('/admin/dashboard/membership-requests')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปยังรายการคำขอสมาชิก
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center">
              <svg className="animate-spin h-8 w-8 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        ) : application ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">รายละเอียดการสมัครสมาชิก</h1>
              
              {/* Print button - hide when printing */}
              <button
                onClick={handlePrint}
                className="print:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                พิมพ์
              </button>
            </div>
            
            {/* Application summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">ประเภทสมาชิก</p>
                  <p className="font-medium">{getMemberTypeText(type)}</p>
                </div>
                <div>
                  <p className="text-gray-600">วันที่สมัคร</p>
                  <p className="font-medium">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              
              <hr className="my-6" />
              
              {/* Render application details based on type */}
              {renderApplicationDetails()}
            </div>
            
            {/* Admin actions - hide when printing */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 print:hidden">
              <h3 className="text-xl font-semibold mb-4">การดำเนินการของผู้ดูแลระบบ</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">บันทึกช่วยจำ</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="บันทึกช่วยจำสำหรับผู้ดูแลระบบ (ไม่แสดงให้ผู้สมัครเห็น)"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500">ไม่พบข้อมูลการสมัครสมาชิก</p>
          </div>
        )}
        
        {/* Render rejection modal */}
        {renderRejectModal()}
      </div>
    </AdminLayout>
  );
}
