'use client';

import dynamic from 'next/dynamic';

// โหลด components แต่ละประเภทแบบ dynamic
const ICDetailModal = dynamic(() => import('../IC/ICDetailModal'), { ssr: false });
const OCDetailModal = dynamic(() => import('../OC/OCDetailModal'), { ssr: false });
const ACDetailModal = dynamic(() => import('../AC/ACDetailModal'), { ssr: false });
const AMDetailModal = dynamic(() => import('../AM/AMDetailModal'), { ssr: false });

export default function ApplicationDetailModal({ application, onClose }) {
  if (!application) return null;

  const renderModal = () => {
    switch (application.memberType) {
      case 'IC':
        return <ICDetailModal application={application} onClose={onClose} />;
      case 'OC':
        return <OCDetailModal application={application} onClose={onClose} />;
      case 'AC':
        return <ACDetailModal application={application} onClose={onClose} />;
      case 'AM':
        return <AMDetailModal application={application} onClose={onClose} />;
      default:
        return null;
    }
  };

  return renderModal();
}
