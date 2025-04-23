'use client';

import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const ContactHeader = () => {
  return (
    <div className="flex items-center mb-6">
      <div className="bg-blue-100 p-2 rounded-full mr-3">
        <FaEnvelope className="text-blue-700" size={24} />
      </div>
      <h2 className="text-2xl font-bold text-blue-900">ติดต่อเรา</h2>
    </div>
  );
};

export default ContactHeader;