'use client';

import React from 'react';
import { FaArrowRight, FaLayerGroup, FaListAlt, FaCheckCircle, FaUserCog, FaLaptop } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TsicFlow = ({ flowStep }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-4 mb-6">
      <div className="flex flex-row justify-between items-center w-full max-w-6xl mx-auto bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="flex items-center justify-center mr-3">
            <div className={`rounded-full p-2 ${flowStep >= 1 ? "bg-blue-100" : "bg-gray-100"}`}>
              <FaLayerGroup className={flowStep >= 1 ? "text-blue-500 text-xl" : "text-gray-400 text-xl"} />
            </div>
          </div>
          
          <div>
            <p className={`font-medium ${flowStep >= 1 ? "text-blue-600" : "text-gray-500"}`}>เลือกหมวดหมู่ธุรกิจ</p>
            <p className="text-sm text-gray-500">เลือกหมวดหมู่ธุรกิจที่เกี่ยวข้อง</p>
          </div>
        </div>
        
        <FaArrowRight className={flowStep >= 2 ? "text-blue-500 mx-2" : "text-gray-300 mx-2"} />
        
        <div className="flex items-center">
          <div className="flex items-center justify-center mr-3">
            <div className={`rounded-full p-2 ${flowStep >= 2 ? "bg-blue-100" : "bg-gray-100"}`}>
              <FaListAlt className={flowStep >= 2 ? "text-blue-500 text-xl" : "text-gray-400 text-xl"} />
            </div>
          </div>
          
          <div>
            <p className={`font-medium ${flowStep >= 2 ? "text-blue-600" : "text-gray-500"}`}>เลือก TSIC Code</p>
            <p className="text-sm text-gray-500">เลือกรหัส TSIC ที่ตรงกับธุรกิจ</p>
          </div>
        </div>
        
        <FaArrowRight className={flowStep >= 3 ? "text-blue-500 mx-2" : "text-gray-300 mx-2"} />
        
        <div className="flex items-center">
          <div className="flex items-center justify-center mr-3">
            <div className={`rounded-full p-2 ${flowStep >= 3 ? "bg-blue-100" : "bg-gray-100"}`}>
              <FaCheckCircle className={flowStep >= 3 ? "text-blue-500 text-xl" : "text-gray-400 text-xl"} />
            </div>
          </div>
          
          <div>
            <p className={`font-medium ${flowStep >= 3 ? "text-blue-600" : "text-gray-500"}`}>ยืนยันข้อมูล</p>
            <p className="text-sm text-gray-500">ตรวจสอบและยืนยันข้อมูล</p>
          </div>
        </div>
        
        <FaArrowRight className={flowStep >= 4 ? "text-blue-500 mx-2" : "text-gray-300 mx-2"} />
        
        <div className="flex items-center">
          <div className="flex items-center justify-center mr-3">
            <div className={`rounded-full p-2 ${flowStep >= 4 ? "bg-blue-100" : "bg-gray-100"}`}>
              <FaUserCog className={flowStep >= 4 ? "text-blue-500 text-xl" : "text-gray-400 text-xl"} />
            </div>
          </div>
          
          <div>
            <p className={`font-medium ${flowStep >= 4 ? "text-blue-600" : "text-gray-500"}`}>การอนุมัติ</p>
            <p className="text-sm text-gray-500">รอการอนุมัติจากผู้ดูแลระบบ</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaLaptop className="text-blue-500 h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>หมายเหตุ:</strong> ท่านสามารถเลือกหมวดหมู่ของธุรกิจท่านได้มากที่สุด 20 หมวดหมู่ โดยผู้ดูแลระบบจะใช้เวลา 1-2 วันทำการ ในการตรวจสอบอนุมัติคำขอของท่าน
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TsicFlow;