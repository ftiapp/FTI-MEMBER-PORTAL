"use client";

import { useState } from "react";
import OCMembershipForm from "../oc/components/OCMembershipForm";
import ACMembershipForm from "../ac/components/ACMembershipForm";
import AMMembershipForm from "../am/components/AMMembershipForm";
import ICMembershipForm from "../ic/components/ICMembershipForm";
import OCStepIndicator from "../oc/components/OCStepIndicator";
import ACStepIndicator from "../ac/components/ACStepIndicator";
import AMStepIndicator from "../am/components/AMStepIndicator";
import ICStepIndicator from "../ic/components/ICStepIndicator";

export default function RejectedApplicationForm({ 
  membershipType, 
  formData, 
  setFormData,
  rejectedApp 
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Render appropriate form based on membership type
  const renderForm = () => {
    const commonProps = {
      formData,
      setFormData,
      currentStep,
      setCurrentStep,
      isEditMode: true,
      isRejectedMode: true,
    };

    switch (membershipType) {
      case 'oc':
        return <OCMembershipForm {...commonProps} />;
      case 'ac':
        return <ACMembershipForm {...commonProps} />;
      case 'am':
        return <AMMembershipForm {...commonProps} />;
      case 'ic':
        return <ICMembershipForm {...commonProps} />;
      default:
        return <div className="text-red-500">ไม่รองรับประเภทสมาชิกนี้</div>;
    }
  };

  // Define steps for each membership type
  const getSteps = () => {
    switch (membershipType) {
      case 'oc':
      case 'ac':
        return [
          { id: 1, name: "ข้อมูลบริษัท" },
          { id: 2, name: "ข้อมูลผู้แทน" },
          { id: 3, name: "ข้อมูลธุรกิจ" },
          { id: 4, name: "เอกสารแนบ" },
          { id: 5, name: "ยืนยันข้อมูล" },
        ];
      case 'am':
        return [
          { id: 1, name: "ข้อมูลบริษัท" },
          { id: 2, name: "ข้อมูลผู้แทน" },
          { id: 3, name: "ข้อมูลธุรกิจ" },
          { id: 4, name: "เอกสารแนบ" },
          { id: 5, name: "ยืนยันข้อมูล" },
        ];
      case 'ic':
        return [
          { id: 1, name: "ข้อมูลส่วนตัว" },
          { id: 2, name: "ข้อมูลธุรกิจ" },
          { id: 3, name: "เอกสารแนบ" },
          { id: 4, name: "ยืนยันข้อมูล" },
        ];
      default:
        return [];
    }
  };

  // Render appropriate step indicator
  const renderStepIndicator = () => {
    const steps = getSteps();
    const props = { currentStep, setCurrentStep, steps };

    switch (membershipType) {
      case 'oc':
        return <OCStepIndicator {...props} />;
      case 'ac':
        return <ACStepIndicator {...props} />;
      case 'am':
        return <AMStepIndicator {...props} />;
      case 'ic':
        return <ICStepIndicator {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStepIndicator()}
      {renderForm()}
    </div>
  );
}
