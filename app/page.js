"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Image from "next/image";
import Link from "next/link";
import YouTubeAutoplay from "./components/YouTubeAutoplay";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const heroFadeUp = {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const milestones = [
    {
      year: "2510",
      title: "ก่อตั้งสมาคมอุตสาหกรรมไทย",
      description:
        "เริ่มต้นในนาม สมาคมอุตสาหกรรมไทย (The Association of Thai Industries – ATI) โดยมีคณะผู้เริ่มก่อตั้งจำนวน 27 คน และมีนายทวี บุณยเกตุ เป็นนายกสมาคมฯ คนแรก",
    },
    {
      year: "2530",
      title: "ยกระดับเป็นสภาอุตสาหกรรม",
      description:
        "รัฐบาลประกาศพระราชบัญญัติสภาอุตสาหกรรมแห่งประเทศไทย พ.ศ. 2530 ยกฐานะสมาคมอุตสาหกรรมไทยขึ้นเป็นสภาอุตสาหกรรมแห่งประเทศไทย",
    },
  ];

  const objectives = [
    {
      title: "เป็นตัวแทนผู้ประกอบการ",
      description:
        "เป็นตัวแทนของผู้ประกอบการอุตสาหกรรมภาคเอกชน ในการประสานนโยบายและดำเนินงานระหว่างภาครัฐและเอกชน",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      title: "พัฒนาอุตสาหกรรม",
      description:
        "ส่งเสริมและพัฒนาการประกอบอุตสาหกรรม รวมถึงศึกษาและแก้ไขปัญหาเกี่ยวกับการประกอบอุตสาหกรรม",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    },
    {
      title: "สนับสนุนการศึกษา",
      description:
        "ส่งเสริม สนับสนุนการศึกษา วิจัย อบรม เผยแพร่วิชาการ และเทคโนโลยีเกี่ยวกับอุตสาหกรรม",
      icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    },
    {
      title: "ให้คำปรึกษา",
      description: "ให้คำปรึกษาและข้อเสนอแนะแก่รัฐบาล เพื่อพัฒนาเศรษฐกิจด้านอุตสาหกรรมของประเทศ",
      icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const roles = [
    {
      title: "กำหนดนโยบายและวางแผน",
      description:
        "เข้าร่วมกำหนดนโยบายและร่วมวางแผนกับภาครัฐในการพัฒนาเศรษฐกิจและอุตสาหกรรมของประเทศ",
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    },
    {
      title: "เป็นตัวแทนภาคเอกชน",
      description:
        "นำเสนอข้อมูลและปัญหาต่าง ๆ ด้านอุตสาหกรรมต่อภาครัฐ ผ่านคณะกรรมการร่วม 3 สถาบันภาคเอกชน",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      title: "พัฒนากิจกรรม",
      description:
        "สร้าง ส่งเสริม พัฒนากิจกรรมต่าง ๆ โดยอาศัยความคิดริเริ่มจากสมาชิก กรรมการ และกลุ่มอุตสาหกรรม",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "ประสานความสัมพันธ์",
      description:
        "ประสานความสัมพันธ์กับต่างประเทศ ทั้งในอาเซียน ยุโรป อเมริกา ออสเตรเลีย ในส่วนของภาครัฐและเอกชน",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const [timelineRef, timelineInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [objectivesRef, objectivesInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [rolesRef, rolesInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-gray-50"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
          </div>

          <div className="relative h-full overflow-hidden py-16">
            <div className="container mx-auto flex flex-col px-4 lg:px-8">
              <div className="mt-16 grid grid-cols-1 justify-items-center">
                <div className="flex max-w-3xl flex-col items-center gap-8 pb-10 text-center">
                  <motion.h1
                    className="bg-gradient-to-br from-slate-900 from-30% to-slate-700 bg-clip-text py-4 text-3xl font-semibold leading-tight tracking-tight text-transparent sm:text-nowrap sm:text-5xl md:text-6xl lg:text-7xl"
                    animate="animate"
                    variants={heroFadeUp}
                    initial="initial"
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      type: "spring",
                    }}
                  >
                    สภาอุตสาหกรรมแห่งประเทศไทย
                  </motion.h1>

                  <motion.p
                    className="max-w-2xl text-lg tracking-tight text-balance text-gray-600 md:text-xl"
                    animate="animate"
                    variants={heroFadeUp}
                    initial="initial"
                    transition={{
                      duration: 0.6,
                      delay: 0.2,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      type: "spring",
                    }}
                  >
                    เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย
                    ให้สามารถแข่งขันได้ในระดับสากล ผ่านการเชื่อมโยงภาครัฐ ภาคเอกชน
                    และภาคอุตสาหกรรมเข้าด้วยกัน
                  </motion.p>

                  <motion.div
                    className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
                    animate="animate"
                    variants={heroFadeUp}
                    initial="initial"
                    transition={{
                      duration: 0.6,
                      delay: 0.3,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      type: "spring",
                    }}
                  >
                    <Link
                      href="/register"
                      className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
                    >
                      สมัครสมาชิกเว็บไซต์
                    </Link>
                    <a
                      href="#about"
                      className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white/70 px-8 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-slate-400 hover:bg-white sm:w-auto"
                    >
                      ทำความรู้จัก FTI เพิ่มเติม
                    </a>
                  </motion.div>

                  <motion.p
                    className="text-xs text-slate-400"
                    animate="animate"
                    variants={heroFadeUp}
                    initial="initial"
                    transition={{
                      duration: 0.6,
                      delay: 0.4,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      type: "spring",
                    }}
                  >
                    ระบบสมาชิกออนไลน์สำหรับผู้ประกอบการอุตสาหกรรมทั่วประเทศ
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                คู่มือการใช้งานระบบสมาชิก
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                วิธีการสมัครใช้งาน
              </h2>
              <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-blue-600" />
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                วิดีโอแนะนำวิธีการสมัครสมาชิกเว็บไซต์และยืนยันสมาชิกเดิม
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl rounded-2xl bg-white p-3 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 md:p-5"
            >
              <YouTubeAutoplay
                videoId="oynt-orKzyE"
                title="วิธีการสมัครใช้งาน สภาอุตสาหกรรมแห่งประเทศไทย"
              />
            </motion.div>
          </div>
        </section>

        {/* White section under hero with centered image */}
        <section className="bg-gray-50/70">
          <div className="container mx-auto flex justify-center px-4 py-12">
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
              <Image
                src="/FTI%20PIC.png"
                alt="สภาอุตสาหกรรมแห่งประเทศไทย - เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย ให้สามารถแข่งขันได้ในระดับสากล"
                width={1000}
                height={563}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* About Section (merged from about page) */}
        <section id="about" className="bg-gray-50">
          {/* Timeline Section */}
          <section className="py-16 bg-white" ref={timelineRef}>
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  className="text-3xl font-bold text-gray-900 mb-12 text-center"
                  variants={fadeInUp}
                  initial="hidden"
                  animate={timelineInView ? "visible" : "hidden"}
                >
                  ประวัติความเป็นมา
                  <motion.div
                    className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                    initial={{ width: 0 }}
                    animate={timelineInView ? { width: 64 } : { width: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.h2>

                {!isMobile ? (
                  <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>

                    <div className="space-y-12">
                      {milestones.map((milestone, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                          variants={fadeInUp}
                          initial="hidden"
                          animate={timelineInView ? "visible" : "hidden"}
                          transition={{ delay: index * 0.2 }}
                        >
                          <div className="w-1/2 pr-8">
                            <div className={`${index % 2 === 0 ? "text-right" : "text-left"}`}>
                              <h3 className="text-2xl font-bold text-blue-600 mb-2">
                                พ.ศ. {milestone.year}
                              </h3>
                              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                {milestone.title}
                              </h4>
                              <p className="text-gray-600">{milestone.description}</p>
                            </div>
                          </div>
                          <div className="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow">
                            <div className="h-2.5 w-2.5 bg-white rounded-full"></div>
                          </div>
                          <div className="w-1/2 pl-8"></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-8">
                    <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-blue-200"></div>

                    <div className="space-y-8">
                      {milestones.map((milestone, index) => (
                        <motion.div
                          key={index}
                          className="relative flex items-start"
                          variants={fadeInUp}
                          initial="hidden"
                          animate={timelineInView ? "visible" : "hidden"}
                          transition={{ delay: index * 0.2 }}
                        >
                          <div className="absolute -left-8 flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow flex items-center justify-center z-10">
                            <div className="h-2.5 w-2.5 bg-white rounded-full"></div>
                          </div>
                          <div className="w-full">
                            <h3 className="text-xl font-bold text-blue-600 mb-1">
                              พ.ศ. {milestone.year}
                            </h3>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {milestone.title}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {milestone.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Objectives Section */}
          <section className="py-16 bg-gray-50" ref={objectivesRef}>
            <div className="container mx-auto px-4">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-12 text-center"
                variants={fadeInUp}
                initial="hidden"
                animate={objectivesInView ? "visible" : "hidden"}
              >
                วัตถุประสงค์
                <motion.div
                  className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                  initial={{ width: 0 }}
                  animate={objectivesInView ? { width: 64 } : { width: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.h2>
              <motion.div
                className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate={objectivesInView ? "visible" : "hidden"}
              >
                {objectives.map((objective, index) => (
                  <motion.div
                    key={index}
                    className="group rounded-xl bg-white p-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/80 hover:ring-blue-100"
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-200">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={objective.icon}
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                          {objective.title}
                        </h3>
                        <p className="text-gray-600">{objective.description}</p>
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
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  className="text-3xl font-bold text-gray-900 mb-12 text-center"
                  variants={fadeInUp}
                  initial="hidden"
                  animate={rolesInView ? "visible" : "hidden"}
                >
                  บทบาทและหน้าที่
                  <motion.div
                    className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                    initial={{ width: 0 }}
                    animate={rolesInView ? { width: 64 } : { width: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.h2>
                <motion.div
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate={rolesInView ? "visible" : "hidden"}
                >
                  {roles.map((role, index) => (
                    <motion.div
                      key={index}
                      className="rounded-xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg shadow-blue-100/70 ring-1 ring-blue-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/80"
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 ring-1 ring-blue-200">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={role.icon}
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="mb-2 text-lg font-semibold text-gray-900">{role.title}</h3>
                          <p className="text-gray-600 text-sm">{role.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
