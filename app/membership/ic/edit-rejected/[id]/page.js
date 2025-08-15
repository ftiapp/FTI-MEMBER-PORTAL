'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import ICMembershipForm from '../../components/ICMembershipForm';
import ICStepIndicator from '../../components/ICStepIndicator';

export default function EditRejectedIC() {
  const params = useParams();
  const router = useRouter();
  const [rejectedApp, setRejectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
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
    if (params.id) fetchRejectedApplication();
  }, [params.id]);

  // Transform rejection_data snapshot into the flat formData shape for ICMembershipForm
  const mapRejectionDataToICForm = (data) => {
    console.log('🔍 Mapping IC rejection data:', data);
    if (!data) return {};
    
    // Check if data is already in flat format (like draft data)
    if (data.firstNameThai || data.idCardNumber || data.taxId) {
      console.log('📋 IC Data is already in flat format, using as-is');
      return data;
    }
    
    // Handle nested database structure
    const main = data.main || {};
    const address = Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses[0] : {};
    const reps = Array.isArray(data.representatives) ? data.representatives : [];
    const btypes = Array.isArray(data.businessTypes) ? data.businessTypes : [];
    const btypeOther = Array.isArray(data.businessTypeOther) && data.businessTypeOther.length > 0 ? data.businessTypeOther[0] : {};
    const products = Array.isArray(data.products) ? data.products : [];
    const industryGroups = Array.isArray(data.industryGroups) ? data.industryGroups : [];
    const provinceChapters = Array.isArray(data.provinceChapters) ? data.provinceChapters : [];
    
    console.log('📊 Extracted IC nested data:', { main, address, reps, btypes, btypeOther, products, industryGroups, provinceChapters });

    const financial = Array.isArray(data.businessFinancials) && data.businessFinancials.length > 0 ? data.businessFinancials[0] : {};
    const docs = Array.isArray(data.documents) ? data.documents : [];

    const getDocUrl = (docType) => {
      const doc = docs.find(d => d.document_type === docType);
      return doc ? doc.file_path : null;
    };

    const mappedData = {
      // Applicant info (IC specific)
      idCardNumber: main.id_card_number || '',
      firstNameThai: main.first_name_th || '',
      lastNameThai: main.last_name_th || '',
      firstNameEnglish: main.first_name_en || '',
      lastNameEnglish: main.last_name_en || '',
      birthDate: main.birth_date || '',
      nationality: main.nationality || '',
      phone: main.phone || '',
      phoneExtension: main.phone_extension || '',
      email: main.email || '',
      
      // Address info
      addressNumber: address.address_number || '',
      building: address.building || '',
      moo: address.moo || '',
      soi: address.soi || '',
      street: address.street || '',
      subDistrict: address.sub_district || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postal_code || '',

      // Company info (if applicable)
      companyName: main.company_name_th || '',
      companyNameEng: main.company_name_en || '',
      taxId: main.tax_id || '',
      companyEmail: main.company_email || '',
      companyPhone: main.company_phone || '',
      companyPhoneExtension: main.company_phone_extension || '',
      position: main.position || '',

      // Financial Info
      registeredCapital: financial.registered_capital || '',
      totalAssets: financial.total_assets || '',
      totalRevenue: financial.total_revenue || '',
      netProfit: financial.net_profit || '',
      productionCapacity: financial.production_capacity || '',
      exportSalesRatio: financial.export_sales_ratio || '',
      debtToEquityRatio: financial.debt_to_equity_ratio || '',

      // Representatives
      representatives: reps.length > 0 ? reps.map((r, idx) => ({
        key: uuidv4(), // Add unique key
        firstNameThai: r.first_name_th || '',
        lastNameThai: r.last_name_th || '',
        firstNameEnglish: r.first_name_en || '',
        lastNameEnglish: r.last_name_en || '',
        position: r.position || '',
        email: r.email || '',
        phone: r.phone || '',
        phoneExtension: r.phone_extension || '',
        isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0
      })) : [],

      // Industrial Groups & Provincial Chapters
      industrialGroups: industryGroups.map(ig => ({
        id: ig.industry_group_id || ig.id,
        name: ig.industry_group_name || ig.name
      })),
      provincialChapters: provinceChapters.map(pc => ({
        id: pc.province_chapter_id || pc.id,
        name: pc.province_chapter_name || pc.name
      })),

      // Business
      businessTypes: btypes.map(bt => typeof bt === 'string' ? bt : (bt.business_type || '')).filter(Boolean),
      otherBusinessType: btypeOther.detail || '',
      products: products.map(p => ({
        key: uuidv4(), // Add unique key
        nameTh: p.name_th || p.product_name || '',
        nameEn: p.name_en || ''
      })),

      // Documents: Preserve existing URLs
      idCard: getDocUrl('id_card'),
      houseRegistration: getDocUrl('house_registration'),
      companyRegistration: getDocUrl('company_registration'),
      vatRegistration: getDocUrl('vat_registration'),
      authorityLetter: getDocUrl('authority_letter'),
      companyStamp: getDocUrl('company_stamp'),
      authorizedSignature: getDocUrl('authorized_signature')
    };
    
    console.log('✅ Final IC mapped data:', mappedData);
    return mappedData;
  };

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await res.json();
      console.log('🌐 IC API Response:', result);
      
      if (result.success) {
        setRejectedApp(result.data);
        console.log('📋 IC Rejected App Data:', result.data);
        
        if (result.data.rejectionData) {
          console.log('🔄 Found IC rejectionData, mapping...');
          const mapped = mapRejectionDataToICForm(result.data.rejectionData);
          console.log('🎯 Setting IC formData to:', mapped);
          setFormData(mapped);
          
          const adminNote = result.data.adminNote?.toLowerCase() || '';
          if (adminNote.includes('บริษัท') || adminNote.includes('company') || adminNote.includes('ผู้สมัคร')) setCurrentStep(1);
          else if (adminNote.includes('ผู้แทน') || adminNote.includes('representative')) setCurrentStep(2);
          else if (adminNote.includes('ธุรกิจ') || adminNote.includes('business')) setCurrentStep(3);
          else if (adminNote.includes('เอกสาร') || adminNote.includes('document')) setCurrentStep(4);
        } else {
          console.log('❌ No IC rejectionData found in response');
        }
      } else {
        setError(result.message || 'Failed to fetch rejected application');
      }
    } catch (e) {
      console.error('💥 IC Fetch error:', e);
      setError('Failed to fetch rejected application');
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { id: 1, name: 'ข้อมูลผู้สมัคร/บริษัท' },
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
          <div className="relative bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}
            
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมทบ IC ที่ถูกปฏิเสธ
              </h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-purple-100 max-w-3xl mx-auto">
                กำลังโหลดข้อมูลใบสมัครที่ถูกปฏิเสธ
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
          <div className="relative bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16 md:py-24">
            {/* Decorative elements - ซ่อนในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
              </>
            )}
            
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
                แก้ไขใบสมัครสมทบ IC ที่ถูกปฏิเสธ
              </h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto mb-6"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-lg md:text-xl text-center text-purple-100 max-w-3xl mx-auto">
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
        <div className="relative bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16 md:py-24">
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              แก้ไขใบสมัครสมทบ IC ที่ถูกปฏิเสธ
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <p className="text-lg md:text-xl text-center text-purple-100 max-w-3xl mx-auto">
              สมทบ-บุคคลธรรมดา (IC)
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
                <ICStepIndicator steps={steps} currentStep={currentStep} />
              </div>
              <div className="p-6">
                <ICMembershipForm
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
