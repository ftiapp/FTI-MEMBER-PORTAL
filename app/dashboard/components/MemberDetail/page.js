"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { MemberDetail } from "./components";

/**
 * MemberDetailPage component serves as the main entry point for the member detail page
 * @returns {JSX.Element} The MemberDetailPage component
 */
const MemberDetailPage = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Set the user ID when the auth context is ready
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-blue-900">ข้อมูลสมาชิกของคุณ</h1>
      <MemberDetail userId={userId} />
    </div>
  );
};

export default MemberDetailPage;
