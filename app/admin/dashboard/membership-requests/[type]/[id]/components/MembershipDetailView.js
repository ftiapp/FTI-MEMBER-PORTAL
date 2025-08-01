import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MembershipDetailView = ({ 
  application, 
  type, 
  handleViewDocument, 
  handleApprove, 
  handleReject,
  handleSaveNote,
  isSubmitting,
  adminNote,
  setAdminNote,
  handlePrint,
  handleConnectMemberCode
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const onConnectMemberCode = async () => {
    if (!application || !application.id) return;
    
    setIsConnecting(true);
    try {
      await handleConnectMemberCode(application.id);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!application) return;
    
    setIsGeneratingPDF(true);
    try {
      // Get the content div
      const element = document.getElementById('membership-detail-content');
      if (!element) {
        console.error('Content element not found');
        return;
      }
      
      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // If content fits in one page
      if (imgHeight <= pageHeight) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page handling
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      
      // Generate filename
      const memberType = type?.toUpperCase() || 'UNKNOWN';
      const memberName = application.company_name_th || application.companyNameTh || 
                        application.associationNameTh || 
                        `${application.first_name_th || application.firstNameTh || ''} ${application.last_name_th || application.lastNameTh || ''}`.trim() || 
                        'Unknown';
      const filename = `${memberType}_${memberName.replace(/[^a-zA-Z0-9ก-๙\s]/g, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const [industrialGroups, setIndustrialGroups] = useState({});
  const [provincialChapters, setProvincialChapters] = useState({});

  useEffect(() => {
    const fetchGroupsData = async () => {
      try {
        const industrialResponse = await fetch('/api/industrial-groups');
        if (industrialResponse.ok) {
          const industrialResult = await industrialResponse.json();
          const industrialData = industrialResult.data || industrialResult;
          const industrialMap = {};
          industrialData.forEach(group => {
            industrialMap[group.MEMBER_GROUP_CODE] = group.MEMBER_GROUP_NAME;
          });
          setIndustrialGroups(industrialMap);
        }

        const provincialResponse = await fetch('/api/provincial-chapters');
        if (provincialResponse.ok) {
          const provincialResult = await provincialResponse.json();
          const provincialData = provincialResult.data || provincialResult;
          const provincialMap = {};
          provincialData.forEach(chapter => {
            provincialMap[chapter.MEMBER_GROUP_CODE] = chapter.MEMBER_GROUP_NAME;
          });
          setProvincialChapters(provincialMap);
        }
      } catch (error) {
        console.error('Error fetching groups data:', error);
      }
    };

    fetchGroupsData();
  }, []);

  if (!application) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">ไม่พบข้อมูลการสมัครสมาชิก</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Download PDF Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors ${
              isGeneratingPDF 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                กำลังสร้าง PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ดาวน์โหลด PDF
              </>
            )}
          </button>
        </div>
        
        {/* Content wrapper for PDF generation */}
        <div id="membership-detail-content" className="space-y-8">
        
        {/* ข้อมูลผู้สมัคร */}
        {(application.firstname || application.lastname || application.email || application.phone) && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ข้อมูลผู้สมัคร
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล</p>
                <p className="text-lg text-gray-900">
                  {(application.firstname || application.lastname) 
                    ? `${application.firstname || ''} ${application.lastname || ''}`.trim() 
                    : '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                <p className="text-lg text-gray-900">{application.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-lg text-gray-900">{application.phone || '-'}</p>
              </div>
              
            </div>
          </div>
        )}

        {/* 1. ข้อมูลบริษัท/ผู้สมัคร */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            {type === 'ic' ? 'ข้อมูลผู้สมัคร' : 'ข้อมูลบริษัท'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {type === 'ic' ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                  <p className="text-lg text-gray-900">{application.first_name_th || application.firstNameTh || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                  <p className="text-lg text-gray-900">{application.last_name_th || application.lastNameTh || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                  <p className="text-lg text-gray-900">{application.first_name_en || application.firstNameEn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                  <p className="text-lg text-gray-900">{application.last_name_en || application.lastNameEn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">เลขบัตรประชาชน</p>
                  <p className="text-lg text-gray-900 font-mono">{application.id_card_number || application.idCard || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                  <p className="text-lg text-gray-900">{application.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                  <p className="text-lg text-gray-900">{application.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
                  <p className="text-lg text-gray-900">{application.website || '-'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (ไทย)</p>
                  <p className="text-lg text-gray-900">{application.company_name_th || application.companyNameTh || application.associationNameTh || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (อังกฤษ)</p>
                  <p className="text-lg text-gray-900">{application.company_name_en || application.companyNameEn || application.associationNameEn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">เลขทะเบียนนิติบุคคล</p>
                  <p className="text-lg text-gray-900 font-mono">{application.tax_id || application.taxId || '-'}</p>
                </div>
                {type === 'am' && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                      <p className="text-lg text-gray-900">{application.number_of_employees || application.numberOfEmployees || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนสมาชิกสมาคม</p>
                      <p className="text-lg text-gray-900">{application.number_of_member || application.numberOfMember || '-'}</p>
                    </div>
                  </>
                )}
                {type === 'ac' && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                    <p className="text-lg text-gray-900">{application.number_of_employees || application.numberOfEmployees || '-'}</p>
                  </div>
                )}
                {type === 'oc' && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทโรงงาน</p>
                      <p className="text-lg text-gray-900">
                        {(() => {
                          const factoryType = application.factory_type || application.factoryType;
                          if (factoryType === 'TYPE1' || factoryType === 'type1' || factoryType === '1') {
                            return 'มีเครื่องจักร > 50 แรงม้า';
                          } else if (factoryType === 'TYPE2' || factoryType === 'type2' || factoryType === '2') {
                            return 'ไม่มีเครื่องจักรหรือมีเครื่องจักร < 50 แรงม้า';
                          } else {
                            return '-';
                          }
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
                      <p className="text-lg text-gray-900">{application.number_of_employees || application.numberOfEmployees || '-'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                  <p className="text-lg text-gray-900">{application.company_email || application.companyEmail || application.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                  <p className="text-lg text-gray-900">{application.company_phone || application.companyPhone || application.phone || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
                  <p className="text-lg text-gray-900">{application.company_website || application.companyWebsite || application.website || '-'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
        {((application.industrialGroupIds && application.industrialGroupIds.length > 0) || 
          (application.provincialChapterIds && application.provincialChapterIds.length > 0)) && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
            </h3>
            
            {application.industrialGroupIds && application.industrialGroupIds.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
                <div className="space-y-3">
                  {application.industrialGroupIds.map((group, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-lg font-medium text-gray-900">
                        {industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}
                      </p>
                      {industrialGroups[group.id || group] && (
                        <p className="text-sm text-blue-600">รหัส: {group.id || group}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {application.provincialChapterIds && application.provincialChapterIds.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
                <div className="space-y-3">
                  {application.provincialChapterIds.map((chapter, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-lg font-medium text-gray-900">
                        {provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}
                      </p>
                      {provincialChapters[chapter.id || chapter] && (
                        <p className="text-sm text-blue-600">รหัส: {chapter.id || chapter}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ข้อมูลผู้แทน */}
        {application.representatives && application.representatives.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ข้อมูลผู้แทน
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {application.representatives.map((rep, index) => {
                const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                const repType = isPrimary ? 'ผู้แทน 1 (หลัก)' : 'ผู้แทน 2 (รอง)';
                
                return (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-blue-900">{repType}</h4>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {isPrimary ? 'หลัก' : 'รอง'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                          <p className="text-sm text-gray-900">{rep.first_name_th || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                          <p className="text-sm text-gray-900">{rep.last_name_th || '-'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{rep.first_name_en || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{rep.last_name_en || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                        <p className="text-sm text-gray-900">{rep.position || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                          <p className="text-sm text-gray-900">{rep.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                          <p className="text-sm text-gray-900 break-all">{rep.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. ข้อมูลที่อยู่ */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ข้อมูลที่อยู่
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
              <p className="text-lg text-gray-900">{application.address_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
              <p className="text-lg text-gray-900">{application.moo || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
              <p className="text-lg text-gray-900">{application.soi || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
              <p className="text-lg text-gray-900">{application.street || application.road || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
              <p className="text-lg text-gray-900">{application.sub_district || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
              <p className="text-lg text-gray-900">{application.district || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
              <p className="text-lg text-gray-900">{application.province || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
              <p className="text-lg text-gray-900 font-mono">{application.postal_code || '-'}</p>
            </div>
          </div>
        </div>

        {/* 5. ข้อมูลผู้ติดต่อ */}
        {type !== 'ic' && ((application.contactPersons && application.contactPersons.length > 0) || (application.contactPerson && application.contactPerson.length > 0) || (application.contactPerson && typeof application.contactPerson === 'object')) && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ข้อมูลผู้ติดต่อ
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(application.contactPersons || application.contactPerson) ? 
                (application.contactPersons || application.contactPerson || []).map((contact, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-4">ผู้ติดต่อ {index + 1}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
                      <p className="text-sm text-gray-900">
                        {(contact.first_name_th || contact.firstNameTh || '') + ' ' + (contact.last_name_th || contact.lastNameTh || '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
                      <p className="text-sm text-gray-900">
                        {(contact.first_name_en || contact.firstNameEn || '') + ' ' + (contact.last_name_en || contact.lastNameEn || '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                      <p className="text-sm text-gray-900">{contact.position || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                        <p className="text-sm text-gray-900">{contact.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                        <p className="text-sm text-gray-900 break-all">{contact.email || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              : application.contactPerson && typeof application.contactPerson === 'object' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-4">ผู้ติดต่อ</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
                      <p className="text-lg text-gray-900">{`${application.contactPerson.first_name_th || application.contactPerson.firstNameTh || ''} ${application.contactPerson.last_name_th || application.contactPerson.lastNameTh || ''}`}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
                      <p className="text-lg text-gray-900">{`${application.contactPerson.first_name_en || application.contactPerson.firstNameEn || ''} ${application.contactPerson.last_name_en || application.contactPerson.lastNameEn || ''}`}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                      <p className="text-lg text-gray-900">{application.contactPerson.position || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                      <p className="text-lg text-gray-900">{application.contactPerson.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                      <p className="text-lg text-gray-900 font-mono">{application.contactPerson.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 6. ข้อมูลธุรกิจ */}
        {((application.businessTypes && (Array.isArray(application.businessTypes) ? application.businessTypes.length > 0 : Object.keys(application.businessTypes).length > 0)) || 
          (application.products && application.products.length > 0)) && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ข้อมูลธุรกิจ
            </h3>
            
            {/* ประเภทธุรกิจ */}
            {application.businessTypes && (Array.isArray(application.businessTypes) ? application.businessTypes.length > 0 : Object.keys(application.businessTypes).length > 0) && (
              <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
                <div className="flex flex-wrap gap-3">
                  {Array.isArray(application.businessTypes) ? 
                    // Handle array of business types (OC/IC)
                    application.businessTypes.map((businessType, index) => {
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

                      if (businessType.business_type === 'other' && application.businessTypeOther && application.businessTypeOther.length > 0) {
                        const otherDetail = application.businessTypeOther.find(other => other.main_id === businessType.main_id);
                        return (
                          <span key={index} className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                            อื่นๆ: {otherDetail?.detail || 'ไม่ระบุ'}
                          </span>
                        );
                      }
                      return (
                        <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                          {getBusinessTypeName(businessType.business_type)}
                        </span>
                      );
                    })
                    : 
                    // Handle object of business types (AM)
                    Object.entries(application.businessTypes).map(([key, value], index) => {
                      if (!value) return null;
                      
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

                      if (key === 'other' && application.businessTypeOther) {
                        // Handle different structures of businessTypeOther for AM type
                        const otherDetail = typeof application.businessTypeOther === 'string' 
                          ? application.businessTypeOther 
                          : application.businessTypeOther.detail || 
                            (application.businessTypeOther.other_detail) || 
                            '';
                            
                        return (
                          <span key={index} className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                            อื่นๆ: {otherDetail || 'ไม่ระบุ'}
                          </span>
                        );
                      }
                      return (
                        <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                          {getBusinessTypeName(key)}
                        </span>
                      );
                    }).filter(Boolean)
                  }
                </div>
              </div>
            )}
            
            {/* สินค้าและบริการ */}
            {application.products && application.products.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.products.map((product, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-lg font-bold text-blue-900 mb-3">สินค้า/บริการ {index + 1}</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (ไทย)</p>
                          <p className="text-sm text-gray-900">{product.name_th || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{product.name_en || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* เอกสารแนบ - Hidden in print */}
        {application.documents && application.documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              เอกสารแนบ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.documents.map((doc, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1">{doc.document_name || `เอกสาร ${index + 1}`}</p>
                    <p className="text-sm text-gray-600 truncate" title={doc.file_path || '-'}>
                      {doc.file_path || '-'}
                    </p>
                  </div>
                  {doc.file_path && (
                    <button 
                      onClick={() => handleViewDocument(doc.file_path)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* การดำเนินการ - Hidden in print */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 print:hidden">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            การดำเนินการของผู้ดูแลระบบ
          </h3>
          
          {/* Admin Note */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-lg font-semibold text-gray-800">หมายเหตุของผู้ดูแลระบบ</label>
              {application.adminNoteAt && (
                <span className="text-sm text-gray-500">
                  บันทึกเมื่อ: {new Date(application.adminNoteAt).toLocaleString('th-TH')}
                </span>
              )}
            </div>
            <textarea
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="4"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          {application.status !== 1 && (
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
              </button>
            </div>
          )}
          
          
          {/* Show Member Code if available */}
          {application.status === 1 && application.member_code && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
              <p className="text-xl font-bold text-green-700">{application.member_code}</p>
              <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
            </div>
          )}
        </div>
        
        </div> {/* End of membership-detail-content wrapper */}

      </div>
    </div>
  );
};

export default MembershipDetailView;