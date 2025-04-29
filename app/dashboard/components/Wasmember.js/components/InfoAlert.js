'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function InfoAlert() {
  // Intersection Observer hooks
  const [alertRef, alertInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [stepsRef, stepsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  
  // Steps data
  const steps = [
    {
      number: "1",
      title: "ส่งข้อมูลยืนยัน",
      description: "กรอกข้อมูลและส่งคำขอ"
    },
    {
      number: "2",
      title: "ตรวจสอบข้อมูล",
      description: "เจ้าหน้าที่ตรวจสอบข้อมูล"
    },
    {
      number: "3",
      title: "อนุมัติ",
      description: "ได้รับการอนุมัติจากเจ้าหน้าที่"
    },
    {
      number: "4",
      title: "ตรวจสอบข้อมูล",
      description: "ในเมนู \"ข้อมูลสมาชิก\""
    }
  ];

  return (
    <div>
      {/* Yellow Alert: Instruction for existing members */}
      <motion.div 
        ref={alertRef}
        initial={{ opacity: 0, y: 20 }}
        animate={alertInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3"
      >
        <div className="flex items-center">
          <motion.div 
            className="bg-yellow-100 rounded-full p-2 mr-3"
            initial={{ scale: 0 }}
            animate={alertInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <div>
            <motion.p 
              className="font-medium text-black"
              initial={{ opacity: 0 }}
              animate={alertInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              หากท่านเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
            <motion.p 
              className="text-sm text-black"
              initial={{ opacity: 0 }}
              animate={alertInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลของท่านภายในระยะเวลา 1-2 วันทำการ
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Workflow Steps */}
      <motion.div 
        ref={stepsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
      >
        <motion.h3 
          className="text-lg font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={stepsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.2 }}
        >
          ขั้นตอนการยืนยันสมาชิกเดิม
        </motion.h3>
        
        <div className="relative flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-4">
          {/* Horizontal connecting line */}
          <motion.div 
            className="absolute top-5 left-0 right-0 hidden md:block h-0.5 bg-blue-200"
            initial={{ width: 0 }}
            animate={stepsInView ? { width: "100%" } : { width: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* Step items */}
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center text-center flex-1 z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.2 + 0.3 }}
            >
              <motion.div 
                className="bg-blue-900 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-3"
                initial={{ scale: 0 }}
                animate={stepsInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: index * 0.2 + 0.4 }}
              >
                {step.number}
              </motion.div>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-4 text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={stepsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p>ท่านสามารถติดตามสถานะการดำเนินการได้ที่เมนู <span className="font-semibold">"สถานะดำเนินการ"</span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}