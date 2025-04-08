import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-6">
            <Link href="/" className="block">
              <Image
                src="/FTI-MasterLogo_RGB-White.png"
                alt="สภาอุตสาหกรรมแห่งประเทศไทย"
                width={180}
                height={72}
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              สภาอุตสาหกรรมแห่งประเทศไทย องค์กรที่มุ่งมั่นพัฒนาและส่งเสริมอุตสาหกรรมไทยให้เติบโตอย่างยั่งยืน
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/TheFederationOfThaiIndustries" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://x.com/ftithailand" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@ftithailandchannel" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
              <a href="https://page.line.me/sjw1724h" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 5.582 2 9.958c0 3.78 3.35 6.952 7.867 7.554.305.063.735.195.842.45.096.228.064.585.031.814-.109.33-.633 1.975.863.076 1.496-1.899 8.07-4.744 10.997-8.126C23.517 9.157 24 7.638 24 9.958c0-4.376-4.477-7.958-12-7.958zm-3.656 9.15h-1.313a.33.33 0 01-.328-.332V7.22c0-.183.148-.332.328-.332.18 0 .328.149.328.332v3.09h.985c.18 0 .328.148.328.33 0 .184-.147.332-.328.332zm1.657-.331a.33.33 0 01-.328.331.33.33 0 01-.328-.331V7.22c0-.183.147-.332.328-.332.18 0 .328.149.328.332v3.598zm3.969 0a.33.33 0 01-.23.316.322.322 0 01-.397-.08l-1.366-1.866v1.63a.33.33 0 01-.329.331.33.33 0 01-.328-.331V7.22c0-.183.147-.332.328-.332a.33.33 0 01.397.08l1.366 1.865V7.22c0-.183.147-.332.328-.332.18 0 .328.149.328.332v3.598zm2.984.331h-1.313a.33.33 0 01-.328-.332V7.22c0-.183.147-.332.328-.332h1.313c.18 0 .328.149.328.332a.33.33 0 01-.328.331h-.985v.82h.985c.18 0 .328.15.328.332a.33.33 0 01-.328.331h-.985v.82h.985c.18 0 .328.15.328.332 0 .184-.147.332-.328.332z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">ลิงก์ด่วน</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  บริการของเรา
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  ข่าวสาร
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">สำหรับสมาชิก</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  สมัครสมาชิก
                </Link>
              </li>
              <li>
                <Link href="/member-benefits" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  สิทธิประโยชน์
                </Link>
              </li>
              <li>
                <Link href="/training" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  อบรมและสัมมนา
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">ติดต่อเรา</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+6621451234" className="hover:text-white transition-colors">
                  02-145-1234
                </a>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@fti.or.th" className="hover:text-white transition-colors">
                  contact@fti.or.th
                </a>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>กรุงเทพมหานคร 10400</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>จันทร์-ศุกร์: 8:30 - 17:30 น.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0"> {new Date().getFullYear()} สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/sitemap" className="text-sm text-gray-400 hover:text-white transition-colors">
              แผนผังเว็บไซต์
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}