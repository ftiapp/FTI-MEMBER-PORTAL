'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ICMemberDetailHeader from '../components/ICMemberDetailHeader';
import RepresentativesSection from '../components/RepresentativesSection';
import AddressSection from '../components/AddressSection';
import BusinessInfoSection from '../components/BusinessInfoSection';
import DocumentsSection from '../components/DocumentsSection';
import AdminLayout from '../../../components/AdminLayout';

/**
 * Admin page for viewing and editing IC membership details
 */
export default function ICMembershipDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch application data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/ic-membership/${id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin');
            return;
          }
          
          if (response.status === 403) {
            toast.error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
            router.push('/admin/dashboard');
            return;
          }
          
          throw new Error('ไม่สามารถดึงข้อมูลได้');
        }
        
        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err.message);
        toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);
  
  // Handle update application data
  const handleUpdate = async (updatedData) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/ic-membership/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin');
          return;
        }
        
        if (response.status === 403) {
          toast.error('คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }
      
      const data = await response.json();
      setApplication(data);
      toast.success('อัปเดตข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle update representatives
  const handleUpdateRepresentatives = async (representatives) => {
    await handleUpdate({ representatives });
  };
  
  // Handle update address
  const handleUpdateAddress = async (address) => {
    await handleUpdate({ address });
  };
  
  // Handle update business info
  const handleUpdateBusinessInfo = async (data) => {
    await handleUpdate({
      businessInfo: data.businessInfo,
      products: data.products
    });
  };
  
  // Handle status change
  const handleStatusChange = async (status, reason = '') => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/ic-membership/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin');
          return;
        }
        
        if (response.status === 403) {
          toast.error('คุณไม่มีสิทธิ์อนุมัติหรือปฏิเสธการสมัครสมาชิกนี้');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถอัปเดตสถานะได้');
      }
      
      const data = await response.json();
      setApplication({
        ...application,
        status: data.status
      });
      
      toast.success(status === 1 ? 'อนุมัติการสมัครสมาชิกเรียบร้อยแล้ว' : 'ปฏิเสธการสมัครสมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle back to list
  const handleBackToList = () => {
    router.push('/admin/dashboard/ic-membership');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={handleBackToList}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            กลับไปยังรายการสมาชิก
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  if (!application) {
    return (
      <AdminLayout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">ไม่พบข้อมูล!</strong>
          <span className="block sm:inline"> ไม่พบข้อมูลการสมัครสมาชิก IC ที่ต้องการ</span>
        </div>
        <div className="mt-4">
          <button
            onClick={handleBackToList}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            กลับไปยังรายการสมาชิก
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-4 print:hidden">
        <button
          onClick={handleBackToList}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          &larr; กลับไปยังรายการสมาชิก
        </button>
      </div>
      
      <ICMemberDetailHeader
        application={application}
        onStatusChange={handleStatusChange}
        isLoading={isUpdating}
      />
      
      <RepresentativesSection
        representatives={application.representatives}
        onUpdate={handleUpdateRepresentatives}
        readOnly={application.status !== 0}
      />
      
      <AddressSection
        address={application.address}
        onUpdate={handleUpdateAddress}
        readOnly={application.status !== 0}
      />
      
      <BusinessInfoSection
        businessInfo={application.businessInfo}
        businessCategories={application.businessCategories}
        products={application.products}
        onUpdate={handleUpdateBusinessInfo}
        readOnly={application.status !== 0}
      />
      
      <DocumentsSection documents={application.documents} />
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
