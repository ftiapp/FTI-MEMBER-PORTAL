import React from 'react';

const EmptyState = ({ message = 'ไม่พบข้อมูล', icon = null }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default EmptyState;