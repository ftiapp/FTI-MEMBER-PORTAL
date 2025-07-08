// components/AMStepIndicator.js
'use client';

export default function AMStepIndicator({ steps, currentStep }) {
  return (
    <div className="mb-8">
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : isCompleted
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span className="hidden md:inline">{step.name}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile version */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            ขั้นตอนที่ <span className="font-medium">{currentStep}</span> จาก{' '}
            <span className="font-medium">{steps.length}</span>
          </p>
          <p className="text-sm font-medium text-blue-600">{steps[currentStep - 1].name}</p>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
