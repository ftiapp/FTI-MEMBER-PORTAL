'use client';

import { motion } from 'framer-motion';
import { formatDate, getActionBadgeColor } from '../utils/activityHelpers';

export default function ActivityItem({ activity, index }) {
  return (
    <motion.li 
      className="px-6 py-4 transition duration-150 ease-in-out hover:bg-gray-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ backgroundColor: "#f9fafb", x: 3 }}
    >
      <div className="flex items-center justify-between sm:flex-row flex-col sm:items-center items-start">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
              {activity.adminName ? activity.adminName.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {activity.adminName || 'ผู้ดูแลระบบ'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(activity.timestamp)}
            </div>
          </div>
        </div>
        <div className="sm:ml-0 ml-14 mt-2 sm:mt-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(activity.actionType)}`}>
            {activity.actionType}
          </span>
        </div>
      </div>
      <div className="mt-3 ml-14">
        <p className="text-sm text-gray-700 leading-relaxed">
          {activity.readableAction}
        </p>
        {activity.details && Object.keys(activity.details).length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {Object.entries(activity.details).map(([key, value]) => (
                <span key={key} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs border border-gray-200">
                  <span className="font-medium">{key}:</span>
                  <span className="ml-1">{value}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.li>
  );
}