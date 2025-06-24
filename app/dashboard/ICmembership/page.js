'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import ICMembershipForm from './components/ICMembershipForm';
import { useICMembershipSubmit } from './hooks/useICMembershipSubmit';
import SuccessMessage from './components/SuccessMessage';
import ErrorMessage from './components/ErrorMessage';

export default function ICMembership() {
  const { user } = useAuth();
  const { handleSubmit, isSubmitting, submitError, submitSuccess } = useICMembershipSubmit();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ทบ สมทบ-บุคคลธรรมดา</h1>
      
      {submitSuccess ? (
        <SuccessMessage />
      ) : (
        <>
          {submitError && <ErrorMessage message={submitError} />}
          <ICMembershipForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}
