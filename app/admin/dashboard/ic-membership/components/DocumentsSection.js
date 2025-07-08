'use client';

/**
 * Component for displaying uploaded documents
 */
export default function DocumentsSection({ documents }) {
  // Get document type name
  const getDocumentTypeName = (type) => {
    switch (type) {
      case 'id_card':
        return 'บัตรประจำตัวประชาชน';
      case 'company_certificate':
        return 'หนังสือรับรองบริษัท';
      case 'vat_registration':
        return 'ใบทะเบียนภาษีมูลค่าเพิ่ม';
      case 'other':
        return 'เอกสารอื่นๆ';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">เอกสารแนบ</h2>
      </div>
      
      {documents && documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left">ประเภทเอกสาร</th>
                <th className="py-2 px-4 text-left">ชื่อไฟล์</th>
                <th className="py-2 px-4 text-left print:hidden">ดาวน์โหลด</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-2 px-4">{getDocumentTypeName(doc.document_type)}</td>
                  <td className="py-2 px-4">
                    {doc.original_filename || 'ไม่มีชื่อไฟล์'}
                  </td>
                  <td className="py-2 px-4 print:hidden">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ดูเอกสาร
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
          ไม่พบเอกสารแนบ
        </div>
      )}
    </div>
  );
}
