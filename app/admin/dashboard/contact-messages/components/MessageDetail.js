'use client';

import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/date';

export default function MessageDetail({
  selectedMessage,
  responseText,
  setResponseText,
  isSubmitting,
  onMarkAsReplied,
  onSendEmailReply
}) {
  if (!selectedMessage) {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col items-center justify-center h-96 text-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg text-black font-bold">เลือกข้อความเพื่อดูรายละเอียด</p>
          <p className="text-sm text-black font-semibold mt-2">คลิกที่ข้อความในรายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-black">{selectedMessage.subject}</h3>
            <div>
              <StatusBadge status={selectedMessage.status} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black font-semibold">
            <div>
              <span className="font-bold text-black">จาก:</span> {selectedMessage.name}
            </div>
            <div>
              <span className="font-bold text-black">อีเมล:</span> {selectedMessage.email}
            </div>
            <div>
              <span className="font-bold text-black">เบอร์โทร:</span> {selectedMessage.phone || '-'}
            </div>
            <div>
              <span className="font-bold text-black">วันที่:</span> {formatDate(selectedMessage.created_at)}
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white flex-grow overflow-y-auto">
          <div className="mb-6">
            <h4 className="font-bold text-black mb-2 text-base">ข้อความ:</h4>
            <div className="bg-white p-4 rounded-lg border border-black">
              <p className="whitespace-pre-wrap text-black font-semibold">{selectedMessage.message}</p>
            </div>
          </div>
          
          {selectedMessage.admin_response && (
            <div>
              <h4 className="font-bold text-black mb-2 text-base">การตอบกลับของผู้ดูแลระบบ:</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-500">
                <p className="whitespace-pre-wrap text-black font-semibold">{selectedMessage.admin_response}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t bg-white">
          <div className="space-y-4">
            <div>
              <label htmlFor="responseText" className="block text-sm font-bold text-black mb-1">
                บันทึกการตอบกลับ:
              </label>
              <textarea
                id="responseText"
                rows="4"
                className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                placeholder="บันทึกรายละเอียดการตอบกลับ เช่น วิธีการตอบกลับ, เนื้อหาโดยย่อ (ข้อความนี้มีไว้เพื่อแจ้งเตือนว่าไดทำการตอบกลับเรียบร้อยแล้วเท่านั้น)"
                value={responseText}
                onChange={(e) => setResponseText(String(e.target.value))}
              ></textarea>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onSendEmailReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  เปิดอีเมลเพื่อตอบกลับ
                </span>
              </button>
              
              <button
                onClick={() => onMarkAsReplied(selectedMessage.id)}
                disabled={isSubmitting || !(responseText && typeof responseText === 'string' && responseText.trim())}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium ${
                  isSubmitting || !(responseText && typeof responseText === 'string' && responseText.trim())
                    ? 'bg-black text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกว่าตอบกลับแล้ว'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}