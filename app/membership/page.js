"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "./MembershiplandingPage/components/HeroSection";
import StepWorkflow from "./MembershiplandingPage/components/StepWorkflow";
import MembershipCards from "./MembershiplandingPage/components/MembershipCards";
import DocumentRequirements from "./MembershiplandingPage/components/DocumentRequirements";
import SummaryStatistics from "./MembershiplandingPage/components/SummaryStatistics";
import FAQSection from "./MembershiplandingPage/components/FAQSection";
import MemberCountBanner from "./MembershiplandingPage/components/MemberCountBanner";


export default function Membership() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <HeroSection />

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Member count highlight near top */}
          <MemberCountBanner />

          {/* Steps and membership information */}
          <StepWorkflow />
          <MembershipCards />
          <DocumentRequirements />
          <SummaryStatistics />
          <FAQSection />
        </div>
      </div>
      <Footer />
    </>
  );
}