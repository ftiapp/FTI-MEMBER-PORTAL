import React from 'react';

const DocumentsSection = ({ application, onViewDocument }) => {
  if (!application?.documents || application.documents.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        เอกสารแนบ
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {application.documents.map((doc, index) => (
          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 mb-1">{doc.name}</p>
              <p className="text-sm text-gray-600 truncate" title={doc.filePath || '-'}>
                {doc.filePath || '-'}
              </p>
            </div>
            {doc.filePath && (
              <button 
                onClick={() => onViewDocument(doc.filePath)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                title="ดูเอกสาร"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดู
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsSection;
