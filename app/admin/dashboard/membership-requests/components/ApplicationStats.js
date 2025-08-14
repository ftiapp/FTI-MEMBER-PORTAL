import React from 'react';
import { STATUS } from '../ีutils/constants';

const ApplicationStats = ({ applications }) => {
  const pending = applications.filter(app => app.status === STATUS.PENDING).length;
  const approved = applications.filter(app => app.status === STATUS.APPROVED).length;
  const rejected = applications.filter(app => app.status === STATUS.REJECTED).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="text-sm text-blue-600">ทั้งหมด</div>
        <div className="text-2xl font-bold text-blue-900">{applications.length}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="text-sm text-blue-600">รอพิจารณา</div>
        <div className="text-2xl font-bold text-blue-700">{pending}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="text-sm text-blue-600">อนุมัติแล้ว</div>
        <div className="text-2xl font-bold text-blue-800">{approved}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="text-sm text-blue-600">ปฏิเสธแล้ว</div>
        <div className="text-2xl font-bold text-blue-600">{rejected}</div>
      </div>
    </div>
  );
};

export default ApplicationStats;
