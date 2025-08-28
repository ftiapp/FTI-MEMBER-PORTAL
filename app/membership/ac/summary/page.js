'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SummarySection from '@/app/membership/ac/components/SummarySection'; // ใช้ SummarySection ของ AC

export default function ACSummaryPage() {
  const [applicationData, setApplicationData] = useState(null);
  const [industrialGroups, setIndustrialGroups] = useState([]);
  const [provincialChapters, setProvincialChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!id) {
      setError('ไม่พบรหัสเอกสารสมัครสมาชิก');
      setLoading(false);
      return;
    }

    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching AC data for ID:', id);
      
      const response = await fetch(`/api/membership/ac/summary/${id}`);
      const result = await response.json();
      
      console.log('AC API Response:', result);
      console.log('AC API Response Data:', result.data);
      console.log('AC Company Name:', result.data?.companyName);
      
      if (result.success) {
        setApplicationData(result.data);
        // Set lookup data for PDF generation
        setIndustrialGroups(result.data?.industrialGroups || []);
        setProvincialChapters(result.data?.provinceChapters || []);
        console.log('AC Data set to state:', result.data);
        console.log('=== AC Summary Page Debug ===');
        console.log('AC applicationData structure:', {
          companyName: result.data?.companyName,
          taxId: result.data?.taxId,
          businessTypes: result.data?.businessTypes,
          representatives: result.data?.representatives,
          products: result.data?.products,
          addressNumber: result.data?.addressNumber
        });
      } else {
        setError(result.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error('Error fetching AC data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { generateMembershipPDF } = await import('@/app/membership/utils/pdfUtils');
      
      // สร้าง lookup objects สำหรับ PDF
      const industrialGroupsLookup = {};
      const provincialChaptersLookup = {};
      
      // แปลง industrialGroups array เป็น lookup object
      industrialGroups.forEach(group => {
        industrialGroupsLookup[group.id] = group.name_th || group.name || group.id;
      });
      
      // แปลง provincialChapters array เป็น lookup object
      provincialChapters.forEach(chapter => {
        provincialChaptersLookup[chapter.id] = chapter.name_th || chapter.name || chapter.id;
      });
      
      // Generate PDF with lookup data
      await generateMembershipPDF(applicationData, 'ac', industrialGroupsLookup, provincialChaptersLookup);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    }
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="relative bg-gradient-to-r from-green-900 to-green-700 text-white py-16 md:py-24">
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                เอกสารสมัครสมาชิก: สมทบ (นิติบุคคล)
              </h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                สมาชิกประเภทสมทบ (นิติบุคคล)
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="relative bg-gradient-to-r from-red-900 to-red-700 text-white py-16 md:py-24">
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                เกิดข้อผิดพลาด
              </h1>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                ไม่สามารถโหลดข้อมูลได้
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">เกิดข้อผิดพลาด</span>
                </div>
                <p>{error}</p>
              </div>
              <button 
                onClick={handleClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                กลับไปหน้าก่อนหน้า
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!applicationData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                ไม่พบข้อมูล
              </h1>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                ไม่พบข้อมูลเอกสารสมัครสมาชิกที่ท่านต้องการดู
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-4gray-700 px-6 py-4 rounded-lg mb-6">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.01-6-2.709M15 13.344A7.962 7.962 0 0121 8.5c0-2.21-.9-4.21-2.344-5.656" />
                  </svg>
                  <span className="font-medium">ไม่พบข้อมูล</span>
                </div>
                <p>ไม่พบข้อมูลเอกสารสมัครสมาชิกที่ท่านต้องการดู</p>
              </div>
              <button 
                onClick={handleClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                กลับไปหน้าก่อนหน้า
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Document icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              เอกสารสมัครสมาชิก: สมทบ (นิติบุคคล)
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              สมาชิกประเภทสมทบ (นิติบุคคล) - {applicationData?.companyName || 'กำลังโหลด...'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Action Buttons */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-green-50 rounded-full -ml-20 -mb-20"></div>
              </>
            )}
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  เอกสารสมัครสมาชิกประเภท: สมทบ (นิติบุคคล)
                </h2>
                <p className="text-gray-600 mb-1">
                  บริษัท: {applicationData?.companyName || '-'}
                </p>
                <p className="text-gray-600">
                  วันที่สมัครสมาชิก: {applicationData?.createdAt ? new Date(applicationData.createdAt).toLocaleDateString('th-TH') : '-'}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-4 4V4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1h4a1 1 0 011 1v6z" />
                  </svg>
                  ดาวน์โหลด PDF
                </button>
                <button 
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ปิด
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Summary Content */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-16 -mt-16"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-50 rounded-full -mr-24 -mb-24"></div>
              </>
            )}
            
            <div className="relative z-10 p-6 md:p-8">
  {/* ใช้ SummarySection ของ AC */}
  <SummarySection 
    formData={applicationData}
    industrialGroups={[]} // อาจต้องส่งข้อมูลจริงจาก API
    provincialChapters={applicationData?.provinceChapters || []} // ⭐ เพิ่มบรรทัดนี้
  />
</div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}