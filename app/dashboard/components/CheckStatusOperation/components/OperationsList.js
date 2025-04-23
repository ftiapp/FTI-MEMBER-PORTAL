import React, { useState } from 'react';
import { 
  getStatusIcon, 
  getStatusText, 
  getStatusClass 
} from './utils';
import EmptyState from './EmptyState';
import StatusCard from './StatusCard';
import Pagination from './Pagination';

const OperationsList = ({ operations }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  // Calculate pagination
  const indexOfLastOperation = currentPage * itemsPerPage;
  const indexOfFirstOperation = indexOfLastOperation - itemsPerPage;
  const currentOperations = operations.slice(indexOfFirstOperation, indexOfLastOperation);
  const totalPages = Math.ceil(operations.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" id="operations-container">
      <h3 className="text-xl font-semibold mb-4 text-blue-800">สถานะการแก้ไขข้อมูล</h3>
      
      {operations.length === 0 ? (
        <EmptyState message="ไม่พบรายการแก้ไขข้อมูล" />
      ) : (
        <div className="space-y-4">
          {currentOperations.map((operation, index) => (
            <StatusCard
              key={index}
              icon={getStatusIcon(operation.status)}
              title={operation.title}
              description={operation.description}
              statusText={getStatusText(operation.status)}
              statusClass={getStatusClass(operation.status)}
              date={operation.created_at}
              errorMessage={operation.status === 'rejected' ? operation.reason : null}
            />
          ))}
          
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
};

export default OperationsList;