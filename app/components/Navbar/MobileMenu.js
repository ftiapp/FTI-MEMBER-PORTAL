import { menuIcons } from "./MenuIcons.js";
import ActionButton from "./ActionButton.js";

export default function MobileMenu({ menuItems, user, pathname, onClose }) {
  return (
    <div className="lg:hidden w-full fixed top-[80px] left-0 right-0 bg-white z-[9998] shadow-2xl border-t-2 border-gray-300 max-h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 space-y-3">
        {/* เมนูหลัก */}
        <div className="space-y-1">
          <div className="px-4 mb-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              เมนูหลัก
            </h3>
          </div>
          {menuItems.map((item) => (
            <div key={item.name}>
              <a
                href={item.href}
                className={`
                  font-medium transition-all duration-300 px-6 py-3 block rounded-xl relative group flex items-center gap-3
                  ${
                    pathname === item.href
                      ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200"
                      : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  }
                `}
                onClick={onClose}
              >
                {menuIcons[item.name]}
                <span className="relative z-10">{item.name}</span>
                {pathname !== item.href && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                )}
              </a>
            </div>
          ))}
        </div>

        {user ? (
          <>
            {/* บริการสมาชิก */}
            <div className="space-y-1 pt-3 border-t border-gray-200">
              <div className="px-4 mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  บริการสมาชิก
                </h3>
              </div>
              <a
                href="https://membersearch.fti.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-3 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm font-medium">ค้นหาสมาชิก</span>
              </a>

              <a
                href="https://epayment.fti.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-sm font-medium">ชำระเงินออนไลน์</span>
              </a>

              <a
                href="/dashboard?tab=documents"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm font-medium">จัดการสมาชิก</span>
              </a>
            </div>
          </>
        ) : (
          <>
            {/* สำหรับผู้ไม่ได้ล็อกอิน */}
            <div className="space-y-1 pt-3 border-t border-gray-200">
              <div className="px-4 mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  บริการ
                </h3>
              </div>
              <a
                href="https://membersearch.fti.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-3 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm font-medium">ค้นหาสมาชิก</span>
              </a>

              <a
                href="https://epayment.fti.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-sm font-medium">ชำระเงินออนไลน์</span>
              </a>
            </div>

            <div className="space-y-1 pt-3 border-t border-gray-200">
              <div className="px-4 mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  เข้าสู่ระบบ
                </h3>
              </div>
              <a
                href="/login"
                className="flex items-center px-6 py-3 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={onClose}
              >
                {menuIcons["เข้าสู่ระบบ"]}
                <span className="text-sm font-medium">เข้าสู่ระบบ</span>
              </a>

              <a
                href="/register"
                className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span className="text-sm font-medium">สมัครสมาชิก</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
