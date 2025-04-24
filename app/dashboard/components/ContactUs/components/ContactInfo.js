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
            <p className="text-gray-600">1453 กด 2</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <FaEnvelope className="text-blue-700" size={16} />
          </div>
          <div>
            <p className="font-medium text-gray-800">อีเมล</p>
            <a href="mailto:member@fti.or.th" className="text-blue-700 underline hover:text-blue-900">member@fti.or.th</a>
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
            <div className="mt-4 flex flex-col items-center justify-center">
              <a
                href="https://www.google.com/maps/dir//%E0%B8%AA%E0%B8%A0%E0%B8%B2%E0%B8%AD%E0%B8%B8%E0%B8%95%E0%B8%AA%E0%B8%B2%E0%B8%AB%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2+2+%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%A7%E0%B8%B2%E0%B8%AA%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C+%E0%B9%81%E0%B8%82%E0%B8%A7%E0%B8%87%E0%B8%97%E0%B8%B8%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B9%80%E0%B8%A1%E0%B8%86+%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AA%E0%B8%B2%E0%B8%97%E0%B8%A3+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3+10120+%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2/@13.7112622,100.4536774,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x30e29f1a3d1745ab:0xe53e4bdad87508ca!2m2!1d100.5360792!2d13.7112758?entry=ttu&g_ep=EgoyMDI1MDQyMS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center group"
                title="ดูแผนที่บน Google Maps"
              >
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-2">
                  <FaMapMarkerAlt className="text-blue-700" size={32} />
                </span>
                <span className="text-blue-700 font-medium group-hover:underline">คลิกเพื่อดูแผนที่</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
