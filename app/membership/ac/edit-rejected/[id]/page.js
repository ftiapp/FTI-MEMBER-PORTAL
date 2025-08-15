'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import ACMembershipForm from '../../components/ACMembershipForm';
import ACStepIndicator from '../../components/ACStepIndicator';

export default function EditRejectedACApplication() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [rejectedApp, setRejectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchRejectedApplication();
    }
  }, [params.id]);

  useEffect(() => {
    if (rejectedApp && rejectedApp.rejectionData) {
      console.log('🔄 Found AC rejectionData, mapping...');
      const mapped = mapRejectionDataToACForm(rejectedApp.rejectionData);
      console.log('🎯 Setting AC formData to:', mapped);
      setFormData(mapped);

      const adminNote = rejectedApp.adminNote?.toLowerCase() || '';
      if (adminNote.includes('บริษัท') || adminNote.includes('company')) setCurrentStep(1);
      else if (adminNote.includes('ผู้แทน') || adminNote.includes('representative')) setCurrentStep(2);
      else if (adminNote.includes('ธุรกิจ') || adminNote.includes('business')) setCurrentStep(3);
      else if (adminNote.includes('เอกสาร') || adminNote.includes('document')) setCurrentStep(4);
    } else if (rejectedApp) {
        console.log('❌ No AC rejectionData found in response');
    }
  }, [rejectedApp]);

  useEffect(() => {
    console.log('EFFECT: formData changed', formData);
  }, [formData]);

  // Transform rejection_data snapshot into the flat formData shape for ACMembershipForm
  const mapRejectionDataToACForm = (data) => {
    console.log('🔍 Mapping AC rejection data:', data);
    if (!data) return {};
    
    // Check if data is already in flat format (like draft data)
    if (data.companyName || data.taxId) {
      console.log('📋 AC Data is already in flat format, using as-is');
      return data;
    }
    
    // Check if data is a string that needs to be parsed
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        console.log('📋 AC Parsed string data:', data);
      } catch (e) {
        console.error('Error parsing rejection data:', e);
        return {};
      }
    }

    const main = data.main || {};
    const addresses = data.addresses || [];
    const address = Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : {};
    const contactPersons = data.contactPersons || [];
    const contactPerson = Array.isArray(contactPersons) && contactPersons.length > 0 ? contactPersons[0] : {};
    const representatives = Array.isArray(data.representatives) ? data.representatives : [];
    const businessTypes = data.businessTypes || [];
    const businessTypeOther = data.businessTypeOther || [];
    const products = Array.isArray(data.products) ? data.products : [];
    const industrialGroups = Array.isArray(data.industryGroups) ? data.industryGroups : [];
    const provincialChapters = Array.isArray(data.provinceChapters) ? data.provinceChapters : [];

    console.log('📊 Extracted AC nested data:', { main, address, contactPerson, representatives, businessTypes, products, industrialGroups, provincialChapters });

    // Map address to nested structure for CompanyAddressInfo
    const mappedAddresses = {
      '1': {
        addressType: '1',
        addressNumber: address.address_number || address.addressnumber || '',
        building: address.building || '',
        moo: address.moo || '',
        soi: address.soi || '',
        street: address.street || '',
        subDistrict: address.sub_district || address.subdistrict || '',
        district: address.district || '',
        province: address.province || '',
        postalCode: address.postal_code || address.postalcode || '',
        phone: address.phone || main.company_phone || '',
        email: address.email || main.company_email || '',
        website: address.website || ''
      },
      '2': {
        addressType: '2',
        addressNumber: address.address_number || address.addressnumber || '',
        building: address.building || '',
        moo: address.moo || '',
        soi: address.soi || '',
        street: address.street || '',
        subDistrict: address.sub_district || address.subdistrict || '',
        district: address.district || '',
        province: address.province || '',
        postalCode: address.postal_code || address.postalcode || '',
        phone: address.phone || main.company_phone || '',
        email: address.email || main.company_email || '',
        website: address.website || ''
      },
      '3': {
        addressType: '3',
        addressNumber: address.address_number || address.addressnumber || '',
        building: address.building || '',
        moo: address.moo || '',
        soi: address.soi || '',
        street: address.street || '',
        subDistrict: address.sub_district || address.subdistrict || '',
        district: address.district || '',
        province: address.province || '',
        postalCode: address.postal_code || address.postalcode || '',
        phone: address.phone || main.company_phone || '',
        email: address.email || main.company_email || '',
        website: address.website || ''
      }
    };

    const mappedData = {
      // Company info
      companyName: main.company_name_th || '',
      companyNameEn: main.company_name_en || '',
      taxId: main.tax_id || '',
      companyEmail: main.company_email || '',
      companyPhone: main.company_phone || '',
      companyWebsite: address.website || '',
      
      // Address data (for backward compatibility)
      addressNumber: address.address_number || address.addressnumber || '',
      building: address.building || '',
      moo: address.moo || '',
      soi: address.soi || '',
      street: address.street || '',
      subDistrict: address.sub_district || address.subdistrict || '',
      district: address.district || '',
      province: address.province || '',
      postalCode: address.postal_code || address.postalcode || '',
      
      // Nested addresses structure for CompanyAddressInfo
      addresses: mappedAddresses,

      // Contact Persons - should be an array
      contactPersons: (data.contactPersons || []).map((p, index) => ({
        id: p.id || Date.now() + index, // Use existing id or generate a new one
        firstNameTh: p.first_name_th || p.firstNameTh || '',
        lastNameTh: p.last_name_th || p.lastNameTh || '',
        firstNameEn: p.first_name_en || p.firstNameEn || '',
        lastNameEn: p.last_name_en || p.lastNameEn || '',
        position: p.position || '',
        email: p.email || '',
        phone: p.phone || '',
        phoneExtension: p.phone_extension || p.phoneExtension || '',
        typeContactId: p.type_contact_id || p.typeContactId,
        typeContactName: p.type_contact_name || p.typeContactName || '',
        typeContactOtherDetail: p.type_contact_other_detail || p.typeContactOtherDetail || '',
        isMain: index === 0
      })),

      // Representatives - ensure at least one representative
      representatives: representatives.length > 0 ? representatives.map((r, idx) => ({
        idCardNumber: r.id_card_number || '',
        firstNameThai: r.first_name_th || '',
        lastNameThai: r.last_name_th || '',
        firstNameEnglish: r.first_name_en || '',
        lastNameEnglish: r.last_name_en || '',
        position: r.position || '',
        phone: r.phone || '',
        email: r.email || '',
        isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0
      })) : [{
        idCardNumber: '',
        firstNameThai: '',
        lastNameThai: '',
        firstNameEnglish: '',
        lastNameEnglish: '',
        position: '',
        phone: '',
        email: '',
        isPrimary: true
      }],

      // Industrial Groups & Provincial Chapters - map to array of IDs
      industrialGroups: industrialGroups.map(ig => ig.industry_group_id || ig.id),
      provincialChapters: provincialChapters.map(pc => pc.province_chapter_id || pc.id),

      // Business Types - convert to object format expected by AC form
      businessTypes: businessTypes.reduce((acc, bt) => {
        const type = bt.business_type || bt;
        acc[type] = true;
        return acc;
      }, {}),
      businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0].detail || '' : '',

      // Products
      products: products.map(p => ({
        name: p.name_th || p.name || '',
        nameEn: p.name_en || '',
        description: p.description || ''
      })),

      // Additional fields
      memberCount: main.member_count || 0,
      registeredCapital: main.registered_capital || '',

      // Documents - set to null to allow re-upload
      documents: {
        certificate: null,
        affidavit: null,
        vatCertificate: null,
        idCard: null,
        photograph: null
      }
    };

    console.log('✅ Mapped AC form data:', mappedData);
    return mappedData;
  };

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/membership/rejected-applications/${params.id}`);
      const result = await res.json();
      console.log('🌐 AC API Response:', result);
      
      if (result.success) {
        setRejectedApp(result.data);
        console.log('📋 AC Rejected App Data set:', result.data);
      } else {
        setError(result.message || 'Failed to fetch rejected application');
      }
    } catch (e) {
      console.error('💥 AC Fetch error:', e);
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
            <button onClick={() => router.push('/dashboard?tab=membership')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">กลับไปหน้าหลัก</button>
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
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">แก้ไขใบสมัครสมาชิกวิสามัญ</h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl">แก้ไขข้อมูลตามคำแนะนำของผู้ดูแลระบบและส่งใบสมัครใหม่</p>
              </div>
            </div>
          </div>
        </div>

        {rejectedApp && (
          <div className="container mx-auto px-4 py-8">
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
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 p-4">
              <ACStepIndicator steps={steps} currentStep={currentStep} />
            </div>
            <div className="p-6">
              <ACMembershipForm
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                totalSteps={steps.length}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
