import React from 'react';

export default function InfoAlert() {
  return (
    <>
      {/* Yellow Alert: Instruction for existing members */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-black">หากท่านเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย</p>
            <p className="text-sm text-black">กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ   เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลของท่านภายในระยะเวลา 1-2 วันทำการ</p>
          </div>
        </div>
      </div>
      {/* Green Alert: Post-submission instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="bg-green-100 rounded-full p-2 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-900">หลังจากที่ท่านได้ดำเนินการส่งข้อมูลยืนยันสมาชิกเดิมเรียบร้อยแล้ว</p>
            <p className="text-sm text-green-900 mt-1">
            
              ท่านสามารถติดตามสถานะการดำเนินการได้ที่เมนู <span className="font-semibold">“สถานะดำเนินการ”</span><br />
              หากคำขอของท่านได้รับการอนุมัติ ท่านจะสามารถตรวจสอบข้อมูลบริษัทของท่านได้ที่เมนู <span className="font-semibold">“ข้อมูลสมาชิก”</span><br />
              
            </p>
          </div>
        </div>
      </div>
    </>
  );
}