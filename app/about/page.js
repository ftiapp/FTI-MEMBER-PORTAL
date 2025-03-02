'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';

export default function About() {
  const milestones = [
    {
      year: '2510',
      title: 'ก่อตั้งสมาคมอุตสาหกรรมไทย',
      description: 'เริ่มต้นในนาม สมาคมอุตสาหกรรมไทย (The Association of Thai Industries – ATI) โดยมีคณะผู้เริ่มก่อตั้งจำนวน 27 คน และมีนายทวี บุณยเกตุ เป็นนายกสมาคมฯ คนแรก',
    },
    {
      year: '2530',
      title: 'ยกระดับเป็นสภาอุตสาหกรรม',
      description: 'รัฐบาลประกาศพระราชบัญญัติสภาอุตสาหกรรมแห่งประเทศไทย พ.ศ. 2530 ยกฐานะสมาคมอุตสาหกรรมไทยขึ้นเป็นสภาอุตสาหกรรมแห่งประเทศไทย',
    },
  ];

  const objectives = [
    {
      title: 'เป็นตัวแทนผู้ประกอบการ',
      description: 'เป็นตัวแทนของผู้ประกอบการอุตสาหกรรมภาคเอกชน ในการประสานนโยบายและดำเนินงานระหว่างภาครัฐและเอกชน',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: 'พัฒนาอุตสาหกรรม',
      description: 'ส่งเสริมและพัฒนาการประกอบอุตสาหกรรม รวมถึงศึกษาและแก้ไขปัญหาเกี่ยวกับการประกอบอุตสาหกรรม',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    {
      title: 'สนับสนุนการศึกษา',
      description: 'ส่งเสริม สนับสนุนการศึกษา วิจัย อบรม เผยแพร่วิชาการ และเทคโนโลยีเกี่ยวกับอุตสาหกรรม',
      icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    },
    {
      title: 'ให้คำปรึกษา',
      description: 'ให้คำปรึกษาและข้อเสนอแนะแก่รัฐบาล เพื่อพัฒนาเศรษฐกิจด้านอุตสาหกรรมของประเทศ',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  const roles = [
    {
      title: 'กำหนดนโยบายและวางแผน',
      description: 'เข้าร่วมกำหนดนโยบายและร่วมวางแผนกับภาครัฐในการพัฒนาเศรษฐกิจและอุตสาหกรรมของประเทศ',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    },
    {
      title: 'เป็นตัวแทนภาคเอกชน',
      description: 'นำเสนอข้อมูลและปัญหาต่าง ๆ ด้านอุตสาหกรรมต่อภาครัฐ ผ่านคณะกรรมการร่วม 3 สถาบันภาคเอกชน',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: 'พัฒนากิจกรรม',
      description: 'สร้าง ส่งเสริม พัฒนากิจกรรมต่าง ๆ โดยอาศัยความคิดริเริ่มจากสมาชิก กรรมการ และกลุ่มอุตสาหกรรม',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      title: 'ประสานความสัมพันธ์',
      description: 'ประสานความสัมพันธ์กับต่างประเทศ ทั้งในอาเซียน ยุโรป อเมริกา ออสเตรเลีย ในส่วนของภาครัฐและเอกชน',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <HeroSection
        title="เกี่ยวกับเรา"
        description="สภาอุตสาหกรรมแห่งประเทศไทย องค์กรที่เป็นศูนย์รวมของผู้ประกอบการอุตสาหกรรมไทย"
      />

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">ประวัติความเป็นมา</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
              
              {/* Timeline Items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 pr-8 text-right">
                      <div className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <h3 className="text-2xl font-bold text-blue-600 mb-2">พ.ศ. {milestone.year}</h3>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow">
                      <div className="h-2.5 w-2.5 bg-white rounded-full"></div>
                    </div>
                    <div className="w-1/2 pl-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">วัตถุประสงค์</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {objectives.map((objective, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={objective.icon} />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{objective.title}</h3>
                    <p className="text-gray-600">{objective.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">บทบาทและหน้าที่</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {roles.map((role, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={role.icon} />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                      <p className="text-gray-600 text-sm">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
