import React from 'react';
import { formatDate } from './utils';

const StatusCard = ({ 
  icon, 
  title, 
  description, 
  statusText, 
  statusClass, 
  date, 
  errorMessage,
  children 
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <span className={`px-3 py-1 text-xs rounded-full ${statusClass} font-medium shadow-sm`}>
              {statusText}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2 font-medium">
            {description}
            {errorMessage && (
              <span className="block mt-2 text-red-600 p-2 bg-red-50 rounded border border-red-200">
                <strong>เหตุผลที่ปฏิเสธ:</strong> {errorMessage}
              </span>
            )}
          </p>
          <div className="mt-3 text-sm text-gray-600">
            {formatDate(date)}
          </div>
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;