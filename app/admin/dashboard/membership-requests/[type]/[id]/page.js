'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import AdminLayout from '../../../../components/AdminLayout';
import { formatDate } from '../../../../product-updates/utils/formatters';
import MembershipDetailView from './components/MembershipDetailView';
import ICDetailView from './components/ICDetailView';
import RejectModal from './components/RejectModal';

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
          // Initialize admin note from application data if available
          if (data.data.adminNote) {
            setAdminNote(data.data.adminNote);
          }
          
          // Fetch additional data for IC type
          if (type === 'ic') {
            await fetchAdditionalData();
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
  
  // Fetch additional data for IC type
  const fetchAdditionalData = async () => {
    try {
      // Fetch industrial groups
      const industrialGroupsResponse = await fetch('/api/industrial-groups');
      if (industrialGroupsResponse.ok) {
        const industrialGroupsData = await industrialGroupsResponse.json();
        if (industrialGroupsData.success) {
          const groupsMap = {};
          industrialGroupsData.data.forEach(group => {
            groupsMap[group.id] = group.name;
          });
          setIndustrialGroups(groupsMap);
        }
      }
      
      // Fetch provincial chapters
      const provincialChaptersResponse = await fetch('/api/provincial-chapters');
      if (provincialChaptersResponse.ok) {
        const provincialChaptersData = await provincialChaptersResponse.json();
        if (provincialChaptersData.success) {
          const chaptersMap = {};
          provincialChaptersData.data.forEach(chapter => {
            chaptersMap[chapter.id] = chapter.name;
          });
          setProvincialChapters(chaptersMap);
        }
      }
    } catch (error) {
      console.error('Error fetching additional data:', error);
    }
  };

  // Handle save admin note separately
  const handleSaveNote = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${id}/save-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNote }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('บันทึกหมายเหตุเรียบร้อยแล้ว');
        // Update the application object to include the updated admin note
        setApplication({
          ...application,
          adminNote: adminNote,
          adminNoteAt: new Date().toISOString()
        });
      } else {
        toast.error(data.message || 'ไม่สามารถบันทึกหมายเหตุได้');
      }
    } catch (error) {
      console.error('Error saving admin note:', error);
      toast.error('ไม่สามารถบันทึกหมายเหตุได้');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        // Add a small delay before redirecting to ensure the toast is seen
        setTimeout(() => {
          router.push('/admin/dashboard/membership-requests');
        }, 1500);
      } else {
        toast.error(data.message || 'ไม่สามารถอนุมัติการสมัครสมาชิกได้');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('ไม่สามารถอนุมัติการสมัครสมาชิกได้');
      setIsSubmitting(false);
    }
  };

  // Handle reject application (show modal first)
  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  // Handle actual reject after confirmation
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
      setRejectionReason('');
    }
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

  // Enhanced print function
  const handlePrint = () => {
    // Create a new window for printing with all content
    const printWindow = window.open('', '_blank');
    
    // Get the main content
    const content = document.querySelector('.container').innerHTML;
    
    // Create the print document
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>รายละเอียดการสมัครสมาชิก ${getMemberTypeText(type)}</title>
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Sarabun', 'Tahoma', sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #2d3748;
            background: white;
            padding: 0;
            margin: 0;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          /* Hide interactive elements */
          button,
          textarea,
          input,
          svg,
          .print\\:hidden,
          [class*="hover:"],
          [class*="focus:"],
          .bg-blue-600,
          .bg-red-600,
          .bg-green-600,
          .bg-gray-600 {
            display: none !important;
          }
          
          /* Container and layout */
          .container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
          }
          
          /* Headers */
          h1 {
            font-size: 20pt;
            font-weight: 600;
            text-align: center;
            margin-bottom: 25pt;
            padding: 15pt 0;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            border-radius: 8pt;
            page-break-after: avoid;
            box-shadow: 0 2pt 4pt rgba(0,0,0,0.1);
          }
          
          h2, h3 {
            font-size: 14pt;
            font-weight: 600;
            margin: 20pt 0 12pt 0;
            color: #1e40af;
            padding: 8pt 0 4pt 0;
            border-bottom: 1pt solid #e2e8f0;
            page-break-after: avoid;
          }
          
          h4 {
            font-size: 12pt;
            font-weight: 600;
            margin: 15pt 0 8pt 0;
            color: #374151;
          }
          
          /* Sections */
          .bg-white,
          .rounded-lg,
          .border,
          .border-gray-200 {
            display: block;
            background: #fafbff;
            border: 1pt solid #cbd5e1;
            border-radius: 6pt;
            margin-bottom: 15pt;
            padding: 12pt;
            page-break-inside: avoid;
            box-shadow: 0 1pt 3pt rgba(0,0,0,0.05);
          }
          
          /* Grid layouts */
          .grid,
          .grid-cols-1,
          .grid-cols-2,
          .md\\:grid-cols-2 {
            display: block;
            width: 100%;
          }
          
          .grid > div,
          .grid-cols-2 > div,
          .md\\:grid-cols-2 > div {
            display: inline-block;
            width: 48%;
            vertical-align: top;
            margin-right: 2%;
            margin-bottom: 10pt;
            padding: 6pt;
            background: white;
            border-radius: 4pt;
          }
          
          .grid > div:nth-child(2n),
          .grid-cols-2 > div:nth-child(2n),
          .md\\:grid-cols-2 > div:nth-child(2n) {
            margin-right: 0;
          }
          
          /* Text styles */
          .text-gray-600 {
            color: #64748b;
            font-size: 10pt;
            font-weight: 500;
            margin-bottom: 3pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
          }
          
          .font-medium,
          .font-semibold {
            font-weight: 600;
            font-size: 11pt;
            color: #1f2937;
            margin-bottom: 6pt;
          }
          
          /* Tags and badges */
          .rounded-full,
          .bg-blue-100,
          .bg-orange-100,
          .bg-green-100,
          .bg-yellow-100,
          .bg-red-100 {
            display: inline-block;
            border: 1pt solid #3b82f6;
            background: #dbeafe;
            color: #1e40af;
            padding: 3pt 8pt;
            margin: 2pt 3pt;
            font-size: 9pt;
            font-weight: 500;
            border-radius: 12pt;
          }
          
          /* Representatives and contacts */
          .border-gray-200,
          .border-gray-100 {
            border: 1pt solid #e2e8f0;
            background: white;
            border-radius: 6pt;
            margin-bottom: 12pt;
            padding: 10pt;
          }
          
          /* Spacing */
          .space-y-6 > * {
            margin-bottom: 18pt;
          }
          
          .space-y-4 > * {
            margin-bottom: 12pt;
          }
          
          .space-y-2 > * {
            margin-bottom: 8pt;
          }
          
          .mb-6 { margin-bottom: 18pt; }
          .mb-4 { margin-bottom: 12pt; }
          .mb-3 { margin-bottom: 10pt; }
          .mb-2 { margin-bottom: 6pt; }
          .p-6 { padding: 12pt; }
          .p-4 { padding: 10pt; }
          .p-3 { padding: 8pt; }
          
          /* Flex to block */
          .flex,
          .flex-wrap,
          .items-center,
          .justify-between {
            display: block;
          }
          
          /* Page breaks */
          .avoid-break {
            page-break-inside: avoid;
          }
          
          /* Print header */
          .print-header {
            text-align: center;
            margin-bottom: 25pt;
            padding: 0;
          }
          
          /* Document info */
          .document-info {
            margin-bottom: 20pt;
            padding: 12pt;
            border: 1pt solid #3b82f6;
            background: #eff6ff;
            border-radius: 6pt;
            color: #1e40af;
            font-weight: 500;
          }
          
          .document-info p {
            margin: 4pt 0;
          }
          
          /* Table-like styling for better organization */
          .field-group {
            background: white;
            border-left: 3pt solid #3b82f6;
            padding-left: 8pt;
          }
          
          /* Better typography */
          p {
            margin: 0 0 6pt 0;
          }
          
          strong {
            color: #1e40af;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>รายละเอียดการสมัครสมาชิก ${getMemberTypeText(type)}</h1>
          ${application ? `
            <div class="document-info">
              <p><strong>วันที่สมัคร:</strong> ${formatDate(application.created_at || application.createdAt)}</p>
              <p><strong>สถานะ:</strong> ${
                (application.status === 'pending' || application.status === 0 || application.status === '0') ? 'รอการอนุมัติ' :
                (application.status === 'approved' || application.status === 1 || application.status === '1') ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'
              }</p>
            </div>
          ` : ''}
        </div>
        ${content}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/print.css" media="print" />
        <style jsx>{`
          @media print {
            /* Force all elements to be visible */
            * {
              visibility: visible !important;
              display: block !important;
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              position: static !important;
            }
            
            /* Hide only specific elements */
            .print\\:hidden,
            button,
            textarea,
            input,
            svg,
            [class*="hover:"],
            [class*="focus:"],
            .bg-blue-600,
            .bg-red-600,
            .bg-green-600,
            .bg-gray-600 {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Page setup */
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            
            body { 
              font-size: 12pt; 
              line-height: 1.4; 
              color: #000; 
              background: white;
              width: 100%;
              height: auto;
              overflow: visible;
            }
            
            /* Ensure content flows properly */
            .container,
            .space-y-6,
            .space-y-4 {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              page-break-inside: auto !important;
            }
            
            /* Section styling */
            .bg-white { 
              background: white !important; 
              border: 1pt solid #ccc; 
              margin-bottom: 15pt; 
              padding: 10pt; 
              page-break-inside: avoid;
              display: block !important;
            }
            
            /* Grid adjustments */
            .grid { 
              display: block !important; 
            }
            
            .grid > div { 
              display: inline-block !important; 
              width: 48% !important; 
              vertical-align: top !important; 
              margin-right: 2% !important; 
              margin-bottom: 8pt !important; 
            }
            
            .grid > div:nth-child(2n) { 
              margin-right: 0 !important; 
            }
            
            /* Headers */
            h1 { 
              font-size: 18pt; 
              text-align: center; 
              margin-bottom: 20pt; 
              border-bottom: 2pt solid #000; 
              padding-bottom: 10pt; 
            }
            
            h3 { 
              font-size: 14pt; 
              font-weight: bold; 
              margin-top: 15pt; 
              margin-bottom: 10pt; 
            }
            
            /* Text styles */
            .text-gray-600 { 
              color: #666 !important; 
              font-size: 10pt; 
            }
            
            .font-medium { 
              font-weight: bold; 
              font-size: 11pt; 
              color: #000; 
            }
            
            /* Force content to be visible */
            .space-y-6 > * {
              display: block !important;
              visibility: visible !important;
              margin-bottom: 15pt !important;
              page-break-inside: avoid;
            }
            
            /* Inline elements */
            span, em, strong, b, i {
              display: inline !important;
            }
          }
        `}</style>
      </Head>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.push('/admin/dashboard/membership-requests')}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              รายละเอียดการสมัครสมาชิก {getMemberTypeText(type)}
            </h1>
          </div>
          {application && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>วันที่สมัคร: {formatDate(application.created_at || application.createdAt)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (application.status === 'pending' || application.status === 0 || application.status === '0') ? 'bg-yellow-100 text-yellow-800' :
                (application.status === 'approved' || application.status === 1 || application.status === '1') ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(application.status === 'pending' || application.status === 0 || application.status === '0') ? 'รอการอนุมัติ' :
                 (application.status === 'approved' || application.status === 1 || application.status === '1') ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {application ? (
          <>
            {type === 'ic' ? (
              <ICDetailView 
                application={application}
                industrialGroups={industrialGroups}
                provincialChapters={provincialChapters}
                handleViewDocument={handleViewDocument}
                handlePrint={handlePrint}
                handleSaveNote={handleSaveNote}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                isSubmitting={isSubmitting}
              />
            ) : (
              <MembershipDetailView 
                application={application}
                type={type}
                handleViewDocument={handleViewDocument}
                handleApprove={handleApprove}
                handleReject={handleRejectClick}
                handleSaveNote={handleSaveNote}
                isSubmitting={isSubmitting}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                handlePrint={handlePrint}
              />
            )}
            
            <RejectModal 
              showRejectModal={showRejectModal}
              setShowRejectModal={setShowRejectModal}
              rejectionReason={rejectionReason}
              setRejectionReason={setRejectionReason}
              handleReject={handleReject}
              isSubmitting={isSubmitting}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500">ไม่พบข้อมูลการสมัครสมาชิก</p>
          </div>
        )}
        </div>
      </AdminLayout>
    </>
  );
}