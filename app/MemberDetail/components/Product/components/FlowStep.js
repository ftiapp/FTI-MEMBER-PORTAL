'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Flow step component with icon, title and animation
 */
const FlowStep = ({ icon, title, description, active, step, delay }) => {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`flex flex-col items-center ${active ? 'text-blue-600' : 'text-gray-400'}`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Icon size={28} className={active ? 'text-blue-600' : 'text-gray-400'} />
      </div>
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mb-1">
        {step}
      </div>
      <p className="font-medium text-center">{title}</p>
      <p className="text-xs text-center text-gray-500">{description}</p>
    </motion.div>
  );
};

export default FlowStep;