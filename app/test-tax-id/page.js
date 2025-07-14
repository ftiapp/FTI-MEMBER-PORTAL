'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestTaxIdValidation() {
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taxId || taxId.length !== 13) {
      toast.error('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/member/oc-membership/check-tax-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taxId })
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setResult(data);
      
      if (data.valid) {
        toast.success('เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้');
      } else {
        toast.error(data.message || 'เลขประจำตัวผู้เสียภาษีไม่ผ่านการตรวจสอบ');
      }
    } catch (error) {
      console.error('Error validating TAX_ID:', error);
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">ทดสอบการตรวจสอบเลขประจำตัวผู้เสียภาษี</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              เลขประจำตัวผู้เสียภาษี
            </label>
            <input
              type="text"
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              maxLength={13}
              placeholder="0000000000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">กรอกเลขประจำตัวผู้เสียภาษี 13 หลัก</p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-2 px-4 rounded-md text-white font-medium
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              transition duration-200
            `}
          >
            {isLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
          </button>
        </form>
        
        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className={`text-lg font-medium ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
              ผลการตรวจสอบ
            </h3>
            <div className="mt-2 text-sm">
              <p><strong>สถานะ:</strong> {result.valid ? 'ผ่านการตรวจสอบ' : 'ไม่ผ่านการตรวจสอบ'}</p>
              {result.message && <p><strong>ข้อความ:</strong> {result.message}</p>}
              {result.status !== undefined && <p><strong>สถานะในระบบ:</strong> {result.status}</p>}
              {result.exists !== undefined && <p><strong>มีในระบบ:</strong> {result.exists ? 'ใช่' : 'ไม่'}</p>}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">คำอธิบายการตรวจสอบ</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-blue-800">
          <li>ระบบจะตรวจสอบว่าเลขประจำตัวผู้เสียภาษีมีรูปแบบถูกต้อง (13 หลัก) หรือไม่</li>
          <li>ตรวจสอบว่าเลขประจำตัวผู้เสียภาษีนี้มีในระบบแล้วหรือไม่</li>
          <li>ถ้ามีในระบบแล้ว จะตรวจสอบสถานะว่าเป็น "รอพิจารณา" (0) หรือ "อนุมัติ" (1) หรือไม่</li>
          <li>ถ้าสถานะเป็น "รอพิจารณา" หรือ "อนุมัติ" จะไม่สามารถสมัครซ้ำได้</li>
          <li>ถ้าสถานะเป็น "ปฏิเสธ" (2) หรือไม่มีในระบบ จะสามารถสมัครได้</li>
        </ul>
      </div>
    </div>
  );
}
