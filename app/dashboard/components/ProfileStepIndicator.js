'use client';

import { motion } from 'framer-motion';
import { FaEdit, FaCheckCircle, FaUserCog } from 'react-icons/fa';

/**
 * ProfileStepIndicator component that shows the steps in the profile update process
 * 
 * @param {Object} props Component properties
 * @param {number} props.currentStep The current active step (1-3)
 */
export default function ProfileStepIndicator({ currentStep = 1 }) {
  const steps = [
    { 
      id: 1, 
      icon: <FaEdit className="w-5 h-5" />, 
      label: '1 แก้ไขชื่อ',
      description: 'แก้ไขชื่อ-นามสกุล'
    },
    { 
      id: 2, 
      icon: <FaCheckCircle className="w-5 h-5" />, 
      label: '2 ตรวจสอบยืนยัน',
      description: 'ยืนยันข้อมูลที่แก้ไข'
    },
    { 
      id: 3, 
      icon: <FaUserCog className="w-5 h-5" />, 
      label: '3 แอดมินยืนยัน',
      description: 'ภายใน 2 วันทำการ'
    }
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          // Calculate if this step is active, completed, or upcoming
          const isActive = step.id === currentStep;
          const isCompleted = currentStep > step.id;
          const isUpcoming = currentStep < step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              
              {/* Step circle */}
              <motion.div
                className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-500'
                    : isCompleted
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? '#EBF5FF' : 
                                   isCompleted ? '#3B82F6' : '#FFFFFF'
                }}
                transition={{ duration: 0.3 }}
              >
                {step.icon}
              </motion.div>
              
              {/* Step label */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  !isUpcoming ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden md:block">
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
