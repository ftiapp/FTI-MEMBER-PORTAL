'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import AMMembershipForm from '../../components/AMMembershipForm';
import AMStepIndicator from '../../components/AMStepIndicator';

export default function EditRejectedAM() {
  const params = useParams();
  const router = useRouter();
  const [rejectedApp, setRejectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Transform rejection_data snapshot into the flat formData shape for AMMembershipForm
  const mapRejectionDataToAMForm = (data) => {
    console.log('🔍 Mapping rejection data:', data);
    if (!data) return {};
    
    // Check if data is already in flat format (like draft data)
    if (data.associationName || data.companyName || data.taxId) {
      console.log('📋 Data is already in flat format, using as-is');
      return {
        // Map common fields that might have different names
        associationName: data.associationName || data.companyName || '',
        associationNameEng: data.associationNameEng || data.companyNameEng || '',
        taxId: data.taxId || '',
        associationEmail: data.associationEmail || data.companyEmail || '',
        associationPhone: data.associationPhone || data.companyPhone || '',
        addressNumber: data.addressNumber || '',
        street: data.street || '',
        subDistrict: data.subDistrict || '',
        district: data.district || '',
        province: data.province || '',
        postalCode: data.postalCode || '',
        moo: data.moo || '',
        representatives: data.representatives || [],
        businessTypes: data.businessTypes || [],
        otherBusinessType: data.otherBusinessType || '',
        products: data.products || '',
        memberCount: data.memberCount || data.numberOfEmployees || '',
        // Documents
        associationRegistration: data.associationRegistration || null,
        associationProfile: data.associationProfile || null,
        memberList: data.memberList || null,
        vatRegistration: data.vatRegistration || null,
        idCard: data.idCard || null,
        authorityLetter: data.authorityLetter || null,
        companyStamp: data.companyStamp || null,
        authorizedSignature: data.authorizedSignature || null
      };
    }
    
    // Handle nested database structure
    const main = data.main || {};
    const address = Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses[0] : {};
    const reps = Array.isArray(data.representatives) ? data.representatives : [];
    const btypes = Array.isArray(data.businessTypes) ? data.businessTypes : [];
    const btypeOther = Array.isArray(data.businessTypeOther) && data.businessTypeOther.length > 0 ? data.businessTypeOther[0] : {};
    const products = Array.isArray(data.products) ? data.products : [];
    
    console.log('📊 Extracted nested data:', { main, address, reps, btypes, btypeOther, products });

    const mappedData = {
      // Association / company info
      associationName: main.company_name_th || '',
      associationNameEng: main.company_name_en || '',
      taxId: main.tax_id || '',
      associationEmail: main.company_email || '',
      associationPhone: main.company_phone || '',
      addressNumber: address.address_number || '',
      street: address.street || '',
      subDistrict: address.sub_district || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postal_code || '',

      // Representatives (map to expected keys; idCardNumber may not exist in AM schema)
      representatives: reps.length > 0 ? reps.map((r, idx) => ({
        idCardNumber: r.id_card_number || '',
        firstNameThai: r.first_name_th || '',
        lastNameThai: r.last_name_th || '',
        firstNameEnglish: r.first_name_en || '',
        lastNameEnglish: r.last_name_en || '',
        position: r.position || '',
        email: r.email || '',
        phone: r.phone || '',
        isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0
      })) : [
        {
          idCardNumber: '',
          firstNameThai: '',
          lastNameThai: '',
          firstNameEnglish: '',
          lastNameEnglish: '',
          position: '',
          email: '',
          phone: '',
          isPrimary: true
        }
      ],

      // Business
      businessTypes: btypes.map(bt => typeof bt === 'string' ? bt : (bt.business_type || '')).filter(Boolean),
      otherBusinessType: btypeOther.detail || '',
      products: products.map(p => p.name_th || p.product_name || '').filter(Boolean).join(', '),
      memberCount: main.number_of_member ? String(main.number_of_member) : '' ,

      // Documents: keep empty; user can re-upload if necessary
      associationRegistration: null,
      associationProfile: null,
      memberList: null,
      vatRegistration: null,
      idCard: null,
      authorityLetter: null,
      companyStamp: null,
      authorizedSignature: null
    };
    
    console.log('✅ Final mapped data:', mappedData);
    return mappedData;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (params.id) fetchRejectedApplication();
  }, [params.id]);

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await res.json();
      console.log('🌐 API Response:', result);
      
      if (result.success) {
        setRejectedApp(result.data);
        console.log('📋 Rejected App Data:', result.data);
        
        if (result.data.rejectionData) {
          console.log('🔄 Found rejectionData, mapping...');
          // Map the rejection snapshot to form shape expected by AMMembershipForm
          const mapped = mapRejectionDataToAMForm(result.data.rejectionData);
          console.log('🎯 Setting formData to:', mapped);
          setFormData(mapped);
          
          const adminNote = result.data.adminNote?.toLowerCase() || '';
          if (adminNote.includes('สมาคม') || adminNote.includes('association') || adminNote.includes('บริษัท') || adminNote.includes('company')) setCurrentStep(1);
          else if (adminNote.includes('ผู้แทน') || adminNote.includes('representative')) setCurrentStep(2);
          else if (adminNote.includes('ธุรกิจ') || adminNote.includes('business')) setCurrentStep(3);
          else if (adminNote.includes('เอกสาร') || adminNote.includes('document')) setCurrentStep(4);
        } else {
          console.log('❌ No rejectionData found in response');
        }
      } else {
        setError(result.message || 'Failed to fetch rejected application');
      }
    } catch (e) {
      console.error('💥 Fetch error:', e);
      setError('Failed to fetch rejected application');
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { id: 1, name: 'ข้อมูลสมาคม/บริษัท' },
    { id: 2, name: 'ข้อมูลผู้แทน' },
    { id: 3, name: 'ข้อมูลธุรกิจ' },
    { id: 4, name: 'เอกสารแนบ' },
    { id: 5, name: 'ยืนยันข้อมูล' },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-green-900 to-green-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-green-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-green-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}
            
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมาชิก AM ที่ถูกปฏิเสธ
              </h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-green-100 max-w-3xl mx-auto">
                กำลังโหลดข้อมูลใบสมัครที่ถูกปฏิเสธ
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
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
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-green-900 to-green-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-green-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-green-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}
            
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมาชิก AM ที่ถูกปฏิเสธ
              </h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-green-100 max-w-3xl mx-auto">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center py-16">
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
        <div className="relative bg-gradient-to-r from-green-900 to-green-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-green-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-green-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              แก้ไขใบสมัครสมาชิก AM ที่ถูกปฏิเสธ
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-green-100 max-w-3xl mx-auto">
              สมาชิกสามัญ-สมาคมการค้า (AM)
            </p>
          </div>
        </div>
        
        <div className="py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">

            {rejectedApp && (
              <div className="bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="p-6">
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
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 p-4">
                <AMStepIndicator steps={steps} currentStep={currentStep} />
              </div>
              <div className="p-6">
                <AMMembershipForm
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  formData={formData}
                  setFormData={setFormData}
                  totalSteps={steps.length}
                  rejectionId={params.id}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
