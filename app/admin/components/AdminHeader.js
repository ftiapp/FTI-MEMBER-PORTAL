'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHeader({ title }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminLevel, setAdminLevel] = useState('');
  
  useEffect(() => {
    // Fetch admin information when component mounts
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
          
          // Set admin level text based on admin_level
          if (data.admin) {
            switch (data.admin.adminLevel) {
              case 5:
                setAdminLevel('ซูเปอร์แอดมิน');
                break;
              case 4:
                setAdminLevel('แอดมินระดับสูง');
                break;
              case 3:
                setAdminLevel('แอดมินระดับกลาง');
                break;
              case 2:
                setAdminLevel('แอดมินระดับต้น');
                break;
              case 1:
                setAdminLevel('ผู้ดูแลระบบ');
                break;
              default:
                setAdminLevel('ผู้ดูแลระบบ');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
      }
    };
    
    fetchAdminInfo();
  }, []);
  
  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {admin?.username?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="font-medium">{admin?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">{adminLevel}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className={`flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
              title="ออกจากระบบ"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>ออก</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
