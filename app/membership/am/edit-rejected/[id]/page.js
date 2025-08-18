'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
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
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState('');

  const fetchComments = async (membershipType, membershipId) => {
    try {
      console.log('🔄 Fetching comments for:', membershipType, membershipId);
      const res = await fetch(`/api/membership/user-comments/${membershipType}/${membershipId}`);
      const result = await res.json();
      console.log('📥 Comments API Response:', result);
      if (result.success) {
        setComments(result.comments);
        console.log('✅ Comments set:', result.comments);
      } else {
        console.error('Failed to fetch comments:', result.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Transform rejection_data snapshot into the flat formData shape for AMMembershipForm
  const mapRejectionDataToAMForm = (data) => {
    if (!data) return {};

    const main = data.main || {};
    const address = (Array.isArray(data.addresses) && data.addresses[0]) || {};
    const reps = Array.isArray(data.representatives) ? data.representatives : [];
    const btypes = Array.isArray(data.businessTypes) ? data.businessTypes : [];
    const btypeOther = (Array.isArray(data.businessTypeOther) && data.businessTypeOther[0]) || {};
    const products = Array.isArray(data.products) ? data.products : [];
    const documents = Array.isArray(data.documents) ? data.documents : [];
    const financial = (Array.isArray(data.financial) && data.financial[0]) || {};

    const getDocumentUrl = (docType) => {
      const doc = documents.find(d => d.document_type === docType);
      return doc ? doc.document_url : null;
    };

    return {
      // Association / company info
      associationName: main.company_name_th || '',
      associationNameEng: main.company_name_en || '',
      taxId: main.tax_id || '',
      associationEmail: main.company_email || '',
      associationPhone: main.company_phone || '',
      associationPhoneExt: main.company_phone_ext || '',

      // Address
      addressNumber: address.address_number || '',
      moo: address.moo || '',
      street: address.street || '',
      subDistrict: address.sub_district || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postal_code || '',

      // Representatives
      representatives: reps.map(r => ({
        key: uuidv4(),
        id: r.id || null,
        idCardNumber: r.id_card_number || '',
        firstNameThai: r.first_name_th || '',
        lastNameThai: r.last_name_th || '',
        firstNameEnglish: r.first_name_en || '',
        lastNameEnglish: r.last_name_en || '',
        position: r.position || '',
        email: r.email || '',
        phone: r.phone || '',
        phoneExt: r.phone_ext || '',
        isPrimary: r.is_primary === 1 || r.is_primary === true,
      })),

      // Business
      businessTypes: btypes.map(bt => bt.business_type || '').filter(Boolean),
      otherBusinessType: btypeOther.detail || '',
      products: products.map(p => ({ key: uuidv4(), id: p.id || null, name: p.name_th || p.product_name || '' })),
      memberCount: main.number_of_member ? String(main.number_of_member) : '',

      // Financial
      registeredCapital: financial.registered_capital || '',
      totalAssets: financial.total_assets || '',
      totalRevenue: financial.total_revenue || '',
      permanentEmployees: financial.permanent_employees || '',
      temporaryEmployees: financial.temporary_employees || '',

      // Documents
      associationRegistration: getDocumentUrl('association_registration'),
      associationProfile: getDocumentUrl('association_profile'),
      memberList: getDocumentUrl('member_list'),
      vatRegistration: getDocumentUrl('vat_registration'),
      idCard: getDocumentUrl('id_card'),
      authorityLetter: getDocumentUrl('authority_letter'),
      companyStamp: getDocumentUrl('company_stamp'),
      authorizedSignature: getDocumentUrl('authorized_signature'),
    };
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
        console.log('🔍 Checking membership data:', {
          membershipType: result.data.membershipType,
          membershipId: result.data.membershipId,
          hasData: !!result.data
        });
        if (result.data.membershipType && result.data.membershipId) {
          console.log('📞 Calling fetchComments with:', result.data.membershipType, result.data.membershipId);
          fetchComments(result.data.membershipType, result.data.membershipId);
        } else {
          console.log('❌ Missing membershipType or membershipId in response');
        }
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

            {/* Comments History Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">ประวัติการสื่อสาร</h3>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-gray-500 mb-4">Debug: Comments array length: {comments.length}</p>
                )}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className={`p-4 rounded-lg ${comment.comment_type.startsWith('admin') ? 'bg-red-50 border-l-4 border-red-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <p className={`text-sm font-semibold ${comment.comment_type.startsWith('admin') ? 'text-red-800' : 'text-blue-800'}`}>
                            {comment.comment_type.startsWith('admin') ? 'ผู้ดูแลระบบ' : 'ผู้สมัคร'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">ยังไม่มีประวัติการสื่อสาร</p>
                )}
              </div>
            </div>

            {/* User Comment Box */}
            <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  แสดงความคิดเห็นเพิ่มเติมถึงผู้ดูแลระบบ (ถ้ามี)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  หากคุณต้องการชี้แจงรายละเอียดเพิ่มเติมเกี่ยวกับการแก้ไขข้อมูล สามารถพิมพ์ข้อความที่นี่ได้
                </p>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                />
              </div>
            </div>

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
                  userComment={userComment}
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
