'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };
  
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    },
    hover: { 
      y: -10, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 } 
    }
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    }
  };

  const timelineRightItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    }
  };

  const timelineDotAnimation = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 10,
        delay: 0.2
      } 
    }
  };

  // Intersection Observer hooks for different sections
  const [timelineRef, timelineInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [objectivesRef, objectivesInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [rolesRef, rolesInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <>
      <Navbar />
      <motion.main className="bg-gray-50 min-h-screen">
        {/* Hero Section - Updated to match Privacy Policy */}
        <motion.div 
          className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-blue-800 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          
          {/* Building icon for about page */}
          <motion.div 
            className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 0.15, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 21V7L13 3V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 21V11L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9H10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13H10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 17H10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 13H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 17H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              เกี่ยวกับเรา
            </motion.h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.p 
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              สภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
          </div>
        </motion.div>

        {/* Timeline Section */}
        <section className="py-16 bg-white" ref={timelineRef}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate={timelineInView ? "visible" : "hidden"}
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-12 text-center"
                variants={fadeIn}
              >
                ประวัติความเป็นมา
              </motion.h2>
              <div className="relative">
                {/* Timeline Line */}
                <motion.div 
                  className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"
                  initial={{ height: 0 }}
                  animate={timelineInView ? { height: "100%" } : { height: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                ></motion.div>
                
                {/* Timeline Items */}
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      <motion.div 
                        className="w-1/2 pr-8 text-right"
                        variants={index % 2 === 0 ? timelineItemVariants : timelineRightItemVariants}
                        initial="hidden"
                        animate={timelineInView ? "visible" : "hidden"}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <div className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                          <motion.h3 
                            className="text-2xl font-bold text-blue-600 mb-2"
                            initial={{ opacity: 0 }}
                            animate={timelineInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: index * 0.2 + 0.7 }}
                          >
                            พ.ศ. {milestone.year}
                          </motion.h3>
                          <motion.h4 
                            className="text-xl font-semibold text-gray-900 mb-2"
                            initial={{ opacity: 0 }}
                            animate={timelineInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: index * 0.2 + 0.8 }}
                          >
                            {milestone.title}
                          </motion.h4>
                          <motion.p 
                            className="text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={timelineInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: index * 0.2 + 0.9 }}
                          >
                            {milestone.description}
                          </motion.p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow"
                        variants={timelineDotAnimation}
                        initial="hidden"
                        animate={timelineInView ? "visible" : "hidden"}
                        transition={{ delay: index * 0.3 + 0.6 }}
                      >
                        <motion.div 
                          className="h-2.5 w-2.5 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={timelineInView ? { scale: 1 } : { scale: 0 }}
                          transition={{ delay: index * 0.3 + 0.8 }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="py-16 bg-gray-50" ref={objectivesRef}>
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-12 text-center"
              variants={fadeIn}
              initial="hidden"
              animate={objectivesInView ? "visible" : "hidden"}
            >
              วัตถุประสงค์
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate={objectivesInView ? "visible" : "hidden"}
            >
              {objectives.map((objective, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  variants={cardVariants}
                  initial="hidden"
                  animate={objectivesInView ? "visible" : "hidden"}
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start">
                    <motion.div 
                      className="flex-shrink-0"
                      initial={{ opacity: 0, rotate: -20 }}
                      animate={objectivesInView ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -20 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <motion.svg 
                          className="w-6 h-6" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          initial={{ scale: 0 }}
                          animate={objectivesInView ? { scale: 1 } : { scale: 0 }}
                          transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={objective.icon} />
                        </motion.svg>
                      </div>
                    </motion.div>
                    <div className="ml-4">
                      <motion.h3 
                        className="text-xl font-semibold text-gray-900 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={objectivesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {objective.title}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={objectivesInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                      >
                        {objective.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-16 bg-white" ref={rolesRef}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate={rolesInView ? "visible" : "hidden"}
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-12 text-center"
                variants={fadeIn}
              >
                บทบาทและหน้าที่
              </motion.h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate={rolesInView ? "visible" : "hidden"}
              >
                {roles.map((role, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    variants={cardVariants}
                    initial="hidden"
                    animate={rolesInView ? "visible" : "hidden"}
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start">
                      <motion.div 
                        className="flex-shrink-0"
                        initial={{ opacity: 0, rotate: -20 }}
                        animate={rolesInView ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -20 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <motion.svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            initial={{ scale: 0 }}
                            animate={rolesInView ? { scale: 1 } : { scale: 0 }}
                            transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={role.icon} />
                          </motion.svg>
                        </div>
                      </motion.div>
                      <div className="ml-4">
                        <motion.h3 
                          className="text-lg font-semibold text-gray-900 mb-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={rolesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          {role.title}
                        </motion.h3>
                        <motion.p 
                          className="text-gray-600 text-sm"
                          initial={{ opacity: 0 }}
                          animate={rolesInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ delay: index * 0.1 + 0.6 }}
                        >
                          {role.description}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </motion.main>
    </>
  );
}