'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCheck, FaClipboardCheck, FaCheckCircle, FaBuilding, FaFileAlt } from 'react-icons/fa';

const WasMemberStepIndicator = ({ currentStep }) => {
  const steps = [
    { 
      title: 'เลือกบริษัท', 
      icon: <FaBuilding className="w-5 h-5" />,
      description: 'เลือกบริษัทสมาชิกเดิม (สูงสุด 10 บริษัท)'
    },
    { 
      title: 'อัพโหลดเอกสาร', 
      icon: <FaClipboardCheck className="w-5 h-5" />,
      description: 'อัพโหลดเอกสารยืนยันตัวตน'
    },
    { 
      title: 'ตรวจสอบข้อมูล', 
      icon: <FaFileAlt className="w-5 h-5" />,
      description: 'ตรวจสอบข้อมูลและเอกสารทั้งหมด'
    },
    { 
      title: 'ยืนยันตัวตนสำเร็จ', 
      icon: <FaCheckCircle className="w-5 h-5" />,
      description: 'การยืนยันตัวตนเสร็จสมบูรณ์'
    }
  ];

  return (
    <div className="w-full py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center mb-6 md:mb-0 relative"
              style={{ width: '100%', maxWidth: '200px' }}
            >
              {/* Step Circle */}
              <motion.div 
                className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {step.icon}
              </motion.div>
              
              {/* Step Title */}
              <motion.p 
                className={`text-sm font-medium text-center ${
                  isActive 
                    ? 'text-blue-600' 
                    : isCompleted 
                      ? 'text-green-500' 
                      : 'text-gray-500'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {step.title}
              </motion.p>
              
              {/* Step Description */}
              <motion.p 
                className="text-xs text-gray-500 text-center mt-1 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {step.description}
              </motion.p>
              
              {/* Connector Line (except for the last step) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute h-0.5 bg-gray-200 top-6 w-full" style={{ left: '60%', zIndex: -1 }}>
                  <div 
                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} 
                    style={{ width: isCompleted ? '100%' : '0%', transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WasMemberStepIndicator;
