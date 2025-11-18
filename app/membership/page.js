"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "./MembershiplandingPage/components/HeroSection";
import StepWorkflow from "./MembershiplandingPage/components/StepWorkflow";
import MembershipCards from "./MembershiplandingPage/components/MembershipCards";
import DocumentRequirements from "./MembershiplandingPage/components/DocumentRequirements";
import BenefitsComparison from "./MembershiplandingPage/components/BenefitsComparison";
import SummaryStatistics from "./MembershiplandingPage/components/SummaryStatistics";
import FAQSection from "./MembershiplandingPage/components/FAQSection";
import MemberCountBanner from "./MembershiplandingPage/components/MemberCountBanner";


export default function Membership() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <HeroSection />
        
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">สมาชิกสภาอุตสาหกรรม</h2>
          </div>

          <StepWorkflow />
          <MembershipCards />
          <DocumentRequirements />
          <BenefitsComparison />
          <SummaryStatistics />
          <FAQSection />
          <MemberCountBanner />
         
        </div>
      </div>
      <Footer />
    </>
  );
}