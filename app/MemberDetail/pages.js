'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MemberSearch from './components/MemberSearch';
import MemberDetailComponent from './components/MemberDetailComponent';

/**
 * MemberDetail page component
 * Allows users to search for members by member code and displays detailed information
 */
export default function MemberDetailPage() {
  const searchParams = useSearchParams();
  const [memberCode, setMemberCode] = useState('');
  
  // Get member code from URL query parameter if available
  useEffect(() => {
    const codeFromUrl = searchParams.get('memberCode');
    if (codeFromUrl) {
      setMemberCode(codeFromUrl);
    }
  }, [searchParams]);
  
  const handleSearch = (code) => {
    setMemberCode(code);
    // Update URL with the new member code without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('memberCode', code);
    window.history.pushState({}, '', url);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ข้อมูลสมาชิก</h1>
      
      <MemberSearch onSearch={handleSearch} />
      
      {memberCode && <MemberDetailComponent memberCode={memberCode} />}
    </div>
  );
}