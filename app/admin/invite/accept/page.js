"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const passwordPolicy = {
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  message:
    'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ',
};

export default function AcceptAdminInvitePage() {
  const params = useSearchParams();
  const token = params.get('token');

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError('ไม่พบโทเคน');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/invite/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'โทเคนไม่ถูกต้องหรือหมดอายุ');
        } else {
          setInvite(data.data);
        }
      } catch (e) {
        console.error(e);
        setError('เกิดข้อผิดพลาดในการตรวจสอบโทเคน');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const validatePassword = () => passwordPolicy.regex.test(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('กรุณาระบุชื่อผู้ดูแลระบบ');
      return;
    }
    if (trimmedName.length > 100) {
      setError('ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)');
      return;
    }

    if (!validatePassword()) {
      setError(passwordPolicy.message);
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invite/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name: trimmedName }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'ไม่สามารถสร้างบัญชีได้');
      } else {
        setSuccess('ตั้งรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบผู้ดูแลระบบได้แล้ว');
      }
    } catch (e) {
      console.error(e);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 text-blue-700">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p className="text-sm font-medium">กำลังตรวจสอบโทเคน...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <h1 className="text-2xl font-bold mb-2 text-gray-800">คำเชิญไม่ถูกต้อง</h1>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h1 className="text-2xl font-bold mb-1 text-gray-900">ยอมรับคำเชิญเป็นผู้ดูแลระบบ</h1>
            <p className="text-sm text-gray-500 mb-4">ตั้งรหัสผ่านสำหรับบัญชีผู้ดูแลของคุณ</p>

            {invite && (
              <div className="mb-4 p-3 rounded-lg border border-blue-100 bg-blue-50 text-sm text-blue-900">
                <p><span className="font-semibold">อีเมล:</span> {invite.email}</p>
                <p><span className="font-semibold">ระดับสิทธิ์:</span> Admin Level {invite.adminLevel}</p>
              </div>
            )}

            {error && (
              <div className="mb-3 text-sm px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อผู้ดูแลระบบ</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ระบุชื่อ-นามสกุล"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">{passwordPolicy.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ยืนยันรหัสผ่าน</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  {submitting ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านและเปิดใช้งาน'}
                </button>
                <p className="text-xs text-gray-500 text-center">ลิงก์คำเชิญนี้มีอายุ 24 ชั่วโมงเพื่อความปลอดภัย</p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
