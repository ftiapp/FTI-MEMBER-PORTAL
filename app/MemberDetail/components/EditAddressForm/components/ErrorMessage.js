'use client';

import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

/**
 * ErrorMessage component to display error messages in the form
 * 
 * @param {Object} props Component properties
 * @param {string} props.message The error message to display
 */
export default function ErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <motion.div 
      className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <FaExclamationCircle className="mr-2 text-red-500" />
        <p>{message}</p>
      </div>
    </motion.div>
  );
}