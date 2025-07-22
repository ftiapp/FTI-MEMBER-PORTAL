import React from 'react';

const DocumentsSection = ({ documents, handleViewDocument }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">เอกสารแนบ</h3>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-sm">{doc.document_name || `เอกสาร ${index + 1}`}</p>
              <p className="text-gray-500 text-xs">{doc.file_path || '-'}</p>
            </div>
            {doc.file_path && (
              <button 
                onClick={() => handleViewDocument(doc.file_path)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="ดูเอกสาร"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
