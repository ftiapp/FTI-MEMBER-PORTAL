'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import UserList from './components/UserList';
import UserEmailChangeForm from './components/UserEmailChangeForm';

/**
 * Admin Email Change Management
 * 
 * This component allows admins to change emails for users who have lost access 
 * to their original email address after verifying their identity through external means.
 */
export default function AdminEmailChange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch user details if userId is provided in the URL
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);
  
  // Fetch user details by ID
  const fetchUserDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedUser(data.user);
      } else {
        console.error('Error fetching user details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user selection from the list
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Update URL with selected user ID for bookmarking/sharing
    router.push(`/admin/dashboard/email-change?userId=${user.id}`, undefined, { scroll: false });
  };
  
  // Clear selected user and return to list view
  const handleBackToList = () => {
    setSelectedUser(null);
    router.push('/admin/dashboard/email-change', undefined, { scroll: false });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedUser ? 'เปลี่ยนอีเมลผู้ใช้' : 'จัดการเปลี่ยนอีเมลผู้ใช้'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            สำหรับผู้ใช้ที่ไม่สามารถเข้าถึงอีเมลเดิมได้ (ลืมรหัสผ่านอีเมล, อีเมลถูกยกเลิก, ฯลฯ)
          </p>
        </div>
        
        {selectedUser ? (
          <UserEmailChangeForm user={selectedUser} onBack={handleBackToList} />
        ) : (
          <UserList onSelectUser={handleUserSelect} />
        )}
      </div>
    </AdminLayout>
  );
}
