export default function InfoAlert() {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-black">หากคุณเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย</p>
            <p className="text-sm text-black">กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ</p>
          </div>
        </div>
      </div>
    );
  }
  