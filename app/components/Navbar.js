'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { name: 'หน้าแรก', href: '/' },
    { name: 'เกี่ยวกับเรา', href: '/about' },
    { name: 'บริการของเรา', href: '/services' },
    { name: 'ประเภทสมาชิก', href: '/membership' },
    { name: 'ติดต่อเรา', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Organization Name */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/images/FTI-MasterLogo_RGB_forLightBG.png"
              alt="สภาอุตสาหกรรมแห่งประเทศไทย"
              width={90}
              height={45}
              priority
              className="mr-3"
            />
            <div className="flex flex-col">
              <span className="text-blue-900 font-semibold text-lg">สภาอุตสาหกรรมแห่งประเทศไทย</span>
              <span className="text-gray-600 text-sm">The Federation of Thai Industries</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  แดชบอร์ด
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    แดชบอร์ด
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold mx-4"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold text-center mx-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
