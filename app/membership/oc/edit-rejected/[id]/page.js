'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import OCMembershipForm from '../../components/OCMembershipForm';
import OCStepIndicator from '../../components/OCStepIndicator';

export default function EditRejectedOCApplication() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [rejectedApp, setRejectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchRejectedApplication();
    }
  }, [params.id]);

  // Transform rejection_data snapshot into the flat formData shape for OCMembershipForm
  const mapRejectionDataToOCForm = (data) => {
    console.log('🔍 Mapping OC rejection data:', data);
    if (!data) return {};
    
    // Check if data is already in flat format (like draft data)
    if (data.companyName || data.taxId) {
      console.log('📋 OC Data is already in flat format, using as-is');
      return data;
    }
    
    // Handle nested database structure
    const main = data.main || {};
    const address = Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses[0] : {};
    const reps = Array.isArray(data.representatives) ? data.representatives : [];
    const btypes = Array.isArray(data.businessTypes) ? data.businessTypes : [];
    const btypeOther = Array.isArray(data.businessTypeOther) && data.businessTypeOther.length > 0 ? data.businessTypeOther[0] : {};
    const products = Array.isArray(data.products) ? data.products : [];
    
    console.log('📊 Extracted OC nested data:', { main, address, reps, btypes, btypeOther, products });

    const mappedData = {
      // Company info
      companyName: main.company_name_th || '',
      companyNameEng: main.company_name_en || '',
      taxId: main.tax_id || '',
      companyEmail: main.company_email || '',
      companyPhone: main.company_phone || '',
      addressNumber: address.address_number || '',
      street: address.street || '',
      subDistrict: address.sub_district || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postal_code || '',
      moo: address.moo || '',

      // Representatives
      representatives: reps.length > 0 ? reps.map((r, idx) => ({
        firstNameThai: r.first_name_th || '',
        lastNameThai: r.last_name_th || '',
        firstNameEnglish: r.first_name_en || '',
        lastNameEnglish: r.last_name_en || '',
        position: r.position || '',
        email: r.email || '',
        phone: r.phone || '',
        isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0
      })) : [],

      // Business
      businessTypes: btypes.map(bt => typeof bt === 'string' ? bt : (bt.business_type || '')).filter(Boolean),
      otherBusinessType: btypeOther.detail || '',
      products: products.map(p => ({
        nameTh: p.name_th || p.product_name || '',
        nameEn: p.name_en || ''
      })),
      numberOfEmployees: main.number_of_employees ? String(main.number_of_employees) : '',

      // Documents: keep empty; user can re-upload if necessary
      companyRegistration: null,
      factoryLicense: null,
      industrialEstateLicense: null,
      productionImages: null
    };
    
    console.log('✅ Final OC mapped data:', mappedData);
    return mappedData;
  };

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await response.json();
      console.log('🌐 OC API Response:', result);

      if (result.success) {
        setRejectedApp(result.data);
        console.log('📋 OC Rejected App Data:', result.data);
        
        if (result.data.rejectionData) {
          console.log('🔄 Found OC rejectionData, mapping...');
          const mapped = mapRejectionDataToOCForm(result.data.rejectionData);
          console.log('🎯 Setting OC formData to:', mapped);
          setFormData(mapped);
          
          const adminNote = result.data.adminNote?.toLowerCase() || '';
          if (adminNote.includes('ข้อมูลบริษัท') || adminNote.includes('company')) {
            setCurrentStep(1);
          } else if (adminNote.includes('ผู้แทน') || adminNote.includes('representative')) {
            setCurrentStep(2);
          } else if (adminNote.includes('ธุรกิจ') || adminNote.includes('business')) {
            setCurrentStep(3);
          } else if (adminNote.includes('เอกสาร') || adminNote.includes('document')) {
            setCurrentStep(4);
          }
        } else {
          console.log('❌ No OC rejectionData found in response');
        }
      } else {
        setError(result.message || 'Failed to fetch rejected application');
      }
    } catch (error) {
      console.error('💥 OC Fetch error:', error);
      setError('Failed to fetch rejected application');
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { id: 1, name: 'ข้อมูลบริษัท' },
    { id: 2, name: 'ข้อมูลผู้แทน' },
    { id: 3, name: 'ข้อมูลธุรกิจ' },
    { id: 4, name: 'เอกสารแนบ' },
    { id: 5, name: 'ยืนยันข้อมูล' },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard?tab=membership')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              กลับไปหน้าหลัก
            </button>
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
        <Toaster position="top-right" />
        
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">แก้ไขใบสมัครสมาชิกสามัญ (โรงงาน)</h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
                  แก้ไขข้อมูลตามคำแนะนำของผู้ดูแลระบบและส่งใบสมัครใหม่
                </p>
              </div>
              
              {!isMobile && (
                <div className="flex-shrink-0">
                  <div className="bg-white p-3 rounded-full shadow-lg">
                    <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Admin Comments Section */}
        {rejectedApp && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-800 mb-2">ความเห็นของผู้ดูแลระบบ</h3>
                    
                    {rejectedApp.rejectionReason && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-700 mb-1">เหตุผลการปฏิเสธ:</p>
                        <div className="bg-white border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800">{rejectedApp.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {rejectedApp.adminNote && (
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">ข้อเสนอแนะเพิ่มเติม:</p>
                        <div className="bg-white border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800">{rejectedApp.adminNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Step Indicator */}
            <div className="border-b border-gray-200 p-4">
              <OCStepIndicator 
                steps={steps} 
                currentStep={currentStep} 
              />
            </div>
            
            {/* Form */}
            <div className="p-6">
              <OCMembershipForm 
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                totalSteps={steps.length}
                isEditingRejected={true}
                rejectedAppId={params.id}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
