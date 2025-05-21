'use client';

import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';

/**
 * ContactStepIndicator component that shows the contact process steps
 * 
 * @param {Object} props Component properties
 * @param {number} props.currentStep The current active step (1-3)
 */
export default function ContactStepIndicator({ currentStep = 1 }) {
  const steps = [
    { 
      id: 1, 
      icon: <FaEnvelope className="w-5 h-5" />, 
      label: 'ส่งข้อความติดต่อ',
      description: 'กรอกและส่งแบบฟอร์มติดต่อ'
    },
    { 
      id: 2, 
      icon: <FaEnvelope className="w-5 h-5" />, 
      label: 'ยืนยันข้อความติดต่อ',
      description: 'ยืนยันข้อมูลการติดต่อ'
    },
    { 
      id: 3, 
      icon: <FaEnvelope className="w-5 h-5" />, 
      label: 'แอดมินตอบกลับ',
      description: 'ภายใน 2 วันทำการ'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100)}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = step.id <= currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center flex-1"
              style={{ maxWidth: '200px' }}
            >
              <motion.div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${isActive ? 'border-blue-600 bg-white' : 'border-gray-300 bg-gray-100'}`}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? '#ffffff' : '#f3f4f6',
                  borderColor: isActive ? '#2563eb' : '#d1d5db',
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{
                    color: isActive ? '#2563eb' : '#9ca3af',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.icon}
                </motion.div>
              </motion.div>
              
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
