'use client';

import { useState } from 'react';
import TsicManagement from './tsic/TsicManagement';
import TsicSelection from './TsicSelection';

export default function TsicCodeManager({ memberCode, language = 'th' }) {
  const [mode, setMode] = useState('view'); // 'view', 'add'

  // Helper function to get text based on current language
  const getText = (thText, enText) => {
    return language === 'th' ? thText : (enText || thText);
  };

  // Handle add TSIC code
  const handleAdd = () => {
    setMode('add');
  };

  // Handle operation success
  const handleSuccess = () => {
    setMode('view');
  };

  return (
    <div className="space-y-6">
     

      {mode === 'view' && (
        <TsicManagement 
          memberCode={memberCode} 
          onAdd={handleAdd}
          language={language}
        />
      )}

      {mode === 'add' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {getText('เพิ่มรหัส TSIC', 'Add TSIC Code')}
            </h3>
            <button
              type="button"
              onClick={() => setMode('view')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {getText('ยกเลิก', 'Cancel')}
            </button>
          </div>
          <TsicSelection 
            memberCode={memberCode} 
            onSuccess={handleSuccess}
            isEditMode={false}
            language={language}
          />
        </div>
      )}


    </div>
  );
}
