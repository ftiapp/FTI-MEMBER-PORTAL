'use client';

/**
 * คอมโพเนนต์แสดงตัวบอกขั้นตอนสำหรับการสมัครสมาชิกประเภท OC (นิติบุคคล)
 * @param {Object} props
 * @param {Array} props.steps รายการขั้นตอนทั้งหมด
 * @param {number} props.currentStep ขั้นตอนปัจจุบัน
 */
export default function OCStepIndicator({ steps, currentStep }) {
  const getStepIcon = (stepId) => {
    switch (stepId) {
      case 1: // ข้อมูลบริษัท
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2h10z" clipRule="evenodd"/>
          </svg>
        );
      case 2: // ข้อมูลผู้แทน
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        );
      case 3: // ข้อมูลธุรกิจ
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
          </svg>
        );
      case 4: // เอกสารแนบ
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        );
      case 5: // ยืนยันข้อมูล
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return stepId;
    }
  };

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200"></div>
        
        {/* Progress Line Fill */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-blue-600 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle with icon */}
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
                    ${isActive 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    getStepIcon(step.id)
                  )}
                </div>
                
                {/* Step name */}
                <div className="mt-3 text-center max-w-24">
                  <span 
                    className={`
                      text-sm font-medium transition-colors duration-300
                      ${isActive 
                        ? 'text-blue-600' 
                        : isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }
                    `}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}