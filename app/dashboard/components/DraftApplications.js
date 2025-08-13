'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function DraftApplications() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/membership/get-drafts');
      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('ไม่สามารถโหลดเอกสารสมัครสมาชิกที่บันทึกร่างไว้');
    } finally {
      setLoading(false);
    }
  };

  const getMemberTypeThai = (type) => {
    const typeMap = {
      'oc': 'สน',
      'ac': 'ทน',
      'ic': 'ทบ',
      'am': 'สส'
    };
    return typeMap[type] || type;
  };

  const getMemberTypeFullName = (type) => {
    const typeMap = {
      'oc': 'สมาชิกสามัญ-โรงงาน',
      'ac': 'สมาชิกสมทบ-นิติบุคคล',
      'ic': 'สมาชิกสมทบ-บุคคลธรรมดา',
      'am': 'สมาชิกสามัญ-สมาคมการค้า'
    };
    return typeMap[type] || type;
  };

  // Extract TAX ID from various possible fields in draft data
  const getDraftTaxId = (draft) => {
    const d = draft?.draftData || {};
    const val = d.taxId || d.tax_id || d.taxID || d.companyTaxId || d.vatId || d.vat_id;
    return val && String(val).trim() !== '' ? String(val) : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>กำลังโหลดเอกสารสมัครที่บันทึกร่างไว้...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>ไม่มีเอกสารสมัครสมาชิกที่บัทึกร่างไว้</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <div key={`${draft.memberType}-${draft.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-black">
                {getMemberTypeThai(draft.memberType)} - {getMemberTypeFullName(draft.memberType)}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                ขั้นตอนที่ {draft.currentStep} จากทั้งหมด 5 ขั้นตอน
              </p>
              <p className="text-sm text-gray-700 mt-1">
                เลขทะเียนนิติบุคคล: {getDraftTaxId(draft)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                อัปเดตล่าสุด: {formatDate(draft.updatedAt)}
              </p>
            </div>
            <Link
              href={`/membership/${draft.memberType}?draftId=${draft.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              ดำเนินการต่อ
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
