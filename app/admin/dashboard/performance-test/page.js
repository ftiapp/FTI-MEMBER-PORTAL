'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';

export default function PerformanceTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runPerformanceTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      // Start time measurement
      const startTime = performance.now();
      
      // Test 1: Measure API response time for the new batched endpoint
      const batchedApiStartTime = performance.now();
      const batchedResponse = await fetch('/api/admin/dashboard-data', { cache: 'no-store' });
      const batchedData = await batchedResponse.json();
      const batchedApiTime = performance.now() - batchedApiStartTime;
      
      // Test 2: Measure API response time for individual endpoints
      const individualApiStartTime = performance.now();
      const [sessionResponse, pendingVerificationsResponse, pendingProfileUpdatesResponse, 
             pendingGuestMessagesResponse, pendingAddressUpdatesResponse, pendingProductUpdatesResponse] = await Promise.all([
        fetch('/api/admin/check-session', { cache: 'no-store' }),
        fetch('/api/admin/pending-verifications-count', { cache: 'no-store' }),
        fetch('/api/admin/pending-profile-updates-count', { cache: 'no-store' }),
        fetch('/api/admin/pending-guest-messages-count', { cache: 'no-store' }),
        fetch('/api/admin/pending-address-updates-count', { cache: 'no-store' }),
        fetch('/api/admin/pending-product-updates-count', { cache: 'no-store' })
      ]);
      
      const [sessionData, pendingVerificationsData, pendingProfileUpdatesData, 
             pendingGuestMessagesData, pendingAddressUpdatesData, pendingProductUpdatesData] = await Promise.all([
        sessionResponse.json(),
        pendingVerificationsResponse.json(),
        pendingProfileUpdatesResponse.json(),
        pendingGuestMessagesResponse.json(),
        pendingAddressUpdatesResponse.json(),
        pendingProductUpdatesResponse.json()
      ]);
      
      const individualApiTime = performance.now() - individualApiStartTime;
      
      // Calculate improvement percentage
      const improvementPercentage = ((individualApiTime - batchedApiTime) / individualApiTime) * 100;
      
      // Test 3: Measure cache hit performance
      const cacheStartTime = performance.now();
      const cachedResponse = await fetch('/api/admin/dashboard-data', { cache: 'no-store' });
      await cachedResponse.json();
      const cacheTime = performance.now() - cacheStartTime;
      
      // Calculate total time
      const totalTime = performance.now() - startTime;
      
      // Set results
      setTestResults({
        batchedApiTime: batchedApiTime.toFixed(2),
        individualApiTime: individualApiTime.toFixed(2),
        cacheTime: cacheTime.toFixed(2),
        improvementPercentage: improvementPercentage.toFixed(2),
        totalTime: totalTime.toFixed(2),
        timestamp: new Date().toLocaleString(),
        batchedData,
        individualData: {
          session: sessionData,
          pendingVerifications: pendingVerificationsData,
          pendingProfileUpdates: pendingProfileUpdatesData,
          pendingGuestMessages: pendingGuestMessagesData,
          pendingAddressUpdates: pendingAddressUpdatesData,
          pendingProductUpdates: pendingProductUpdatesData
        }
      });
      
      toast.success('Performance test completed successfully');
    } catch (error) {
      console.error('Error running performance test:', error);
      toast.error('Error running performance test');
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-black mb-6">API Performance Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-black mb-4">
            This page tests the performance difference between the new batched API endpoint and the original multiple API calls approach.
          </p>
          
          <button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Test...' : 'Run Performance Test'}
          </button>
        </div>
        
        {testResults && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-black mb-4">Test Results</h2>
            <p className="text-sm text-gray-500 mb-4">Timestamp: {testResults.timestamp}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-black mb-2">Batched API Call</h3>
                <p className="text-black"><span className="font-semibold">Response Time:</span> {testResults.batchedApiTime} ms</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-black mb-2">Multiple API Calls</h3>
                <p className="text-black"><span className="font-semibold">Response Time:</span> {testResults.individualApiTime} ms</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-black mb-2">Cached API Call</h3>
                <p className="text-black"><span className="font-semibold">Response Time:</span> {testResults.cacheTime} ms</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-black mb-2">Performance Improvement</h3>
                <p className="text-black font-semibold text-lg">{testResults.improvementPercentage}% Faster</p>
                <p className="text-black text-sm">
                  The batched API is {testResults.improvementPercentage}% faster than multiple API calls
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold text-black mb-2">Data Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-black mb-1">Batched API Data</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(testResults.batchedData, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">Individual API Data</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(testResults.individualData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
