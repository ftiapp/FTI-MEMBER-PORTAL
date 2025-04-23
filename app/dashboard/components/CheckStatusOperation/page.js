'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingState from './components/Loadingstate';
import ErrorState from './components/ErrorState';
import OperationsList from './components/OperationsList';

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const router = useRouter();
  const [operations, setOperations] = useState([]);

  const [loading, setLoading] = useState(true);


  const [loadingError, setLoadingError] = useState(false);
  
  // Refs for preventing duplicate requests
  const isLoadingOperations = useRef(false);


  useEffect(() => {
    if (user?.id) {
      fetchOperationStatus();
    }
  }, [user]);

  const fetchOperationStatus = async () => {
    // Prevent duplicate requests
    if (isLoadingOperations.current) return;
    
    try {
      isLoadingOperations.current = true;
      setLoading(true);
      setLoadingError(false);
      
      const response = await fetch(`/api/dashboard/operation-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      } else {
        console.error('Failed to fetch operation status');
        setLoadingError(true);
      }
    } catch (error) {
      console.error('Error fetching operation status:', error);
      setLoadingError(true);
    } finally {
      setLoading(false);
      // Add a small delay before allowing new requests
      setTimeout(() => {
        isLoadingOperations.current = false;
      }, 300);
    }
  };
  
  
  
  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchOperationStatus();
    }
  };

  


  if (loading) {
    return <LoadingState />;
  }
  
  if (loadingError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Update Operations */}
      <OperationsList operations={operations} userId={user?.id} />
      
      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Better button active state */
        button:active {
          transform: translateY(2px);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}