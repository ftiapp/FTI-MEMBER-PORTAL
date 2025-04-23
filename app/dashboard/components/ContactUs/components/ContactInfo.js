'use client';

import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg text-blue-800">ข้อมูลการติดต่อ</h4>
        
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <FaPhone className="text-blue-700" size={16} />
          </div>
          <div>
            <p className="font-medium text-gray-800">โทรศัพท์</p>
            <p className="text-gray-600">02-345-1000</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <FaEnvelope className="text-blue-700" size={16} />
          </div>
          <div>
            <p className="font-medium text-gray-800">อีเมล</p>
            <p className="text-gray-600">contact@fti.or.th</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <FaClock className="text-blue-700" size={16} />
          </div>
          <div>
            <p className="font-medium text-gray-800">เวลาทำการ</p>
            <p className="text-gray-600">วันจันทร์ - วันศุกร์: 08:30 - 17:30 น.</p>
            <p className="text-gray-600">วันเสาร์ - วันอาทิตย์ และวันหยุดนักขัตฤกษ์: ปิดทำการ</p>
          </div>
        </div>
      </div>
      
      {/* Address and Map */}
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-3 mr-4 mt-1">
            <FaMapMarkerAlt className="text-blue-700" size={18} />
          </div>
          <div>
            <h4 className="font-medium text-lg text-gray-800">ที่อยู่</h4>
            <div className="text-gray-700 mt-2 space-y-1">
              <p className="font-medium">สภาอุตสาหกรรมแห่งประเทศไทย</p>
              <p>ชั้น 8 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์</p>
              <p>เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ</p>
              <p>เขตสาทร กรุงเทพมหานคร 10120</p>
            </div>
            
            {/* Map placeholder */}
            <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <FaMapMarkerAlt className="h-8 w-8 text-blue-700 mx-auto" />
                <p className="text-sm text-gray-600 mt-1">คลิกเพื่อดูแผนที่</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
