'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOperationStatus();
    }
  }, [user]);

  const fetchOperationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/operation-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations);
      } else {
        console.error('Failed to fetch operation status');
      }
    } catch (error) {
      console.error('Error fetching operation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm น.', { locale: th });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" size={20} />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" size={20} />;
      default:
        return <FaHourglassHalf className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอการอนุมัติ';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธแล้ว';
      default:
        return 'รอดำเนินการ';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">สถานะการดำเนินการ</h3>
      
      {operations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่พบรายการดำเนินการ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {operations.map((operation, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                  {getStatusIcon(operation.status)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{operation.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(operation.status)}`}>
                      {getStatusText(operation.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {operation.description}
                    {operation.status === 'rejected' && operation.reason && (
                      <span className="block mt-1 text-red-600">
                        เหตุผลที่ปฏิเสธ: {operation.reason}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(operation.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
