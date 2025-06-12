import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import RegistrationSuccess from './RegistrationSuccess';
import VerifyingState from './VerifyingState';
import PasswordResetForm from './PasswordResetForm';
import SuccessState from './SuccessState';
import ErrorState from './ErrorState';

export default function VerificationStates({ 
  verificationStatus, 
  setVerificationStatus,
  errorMessage, 
  newEmail, 
  email, 
  userId, 
  token, 
  router 
}) {
  return (
    <AnimatePresence mode="wait">
      {verificationStatus === 'registration_success' && (
        <RegistrationSuccess 
          newEmail={newEmail} 
          email={email} 
        />
      )}

      {verificationStatus === 'verifying' && (
        <VerifyingState />
      )}

      {verificationStatus === 'password_reset' && (
        <PasswordResetForm 
          newEmail={newEmail}
          userId={userId}
          token={token}
          setVerificationStatus={setVerificationStatus}
          router={router}
        />
      )}

      {verificationStatus === 'success' && (
        <SuccessState />
      )}

      {verificationStatus === 'error' && (
        <ErrorState 
          errorMessage={errorMessage}
          setVerificationStatus={setVerificationStatus}
          email={email}
        />
      )}
    </AnimatePresence>
  );
}