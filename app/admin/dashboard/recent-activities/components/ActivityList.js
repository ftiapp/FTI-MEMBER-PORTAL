'use client';

import { motion } from 'framer-motion';
import ActivityItem from './ActivityItem';

export default function ActivityList({ activities, loading, error, onRefresh }) {
  if (loading && activities.length === 0) {
    return (
      <motion.div 
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-red-50 border border-red-200 p-4 rounded-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={onRefresh}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">ไม่พบข้อมูลกิจกรรม</p>
          <p className="text-gray-400 text-sm">ลองปรับเปลี่ยนตัวกรองหรือรีเฟรชหน้า</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white shadow-md border border-gray-200 overflow-hidden sm:rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ul className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            index={index}
          />
        ))}
      </ul>
    </motion.div>
  );
}