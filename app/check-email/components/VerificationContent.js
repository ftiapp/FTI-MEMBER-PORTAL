import { motion } from 'framer-motion';
import Image from 'next/image';
import VerificationStates from './VerificationStates';

export default function VerificationContent({ 
  verificationStatus, 
  setVerificationStatus,
  errorMessage, 
  newEmail, 
  email, 
  userId, 
  token, 
  router 
}) {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          สถานะการยืนยัน
          <motion.div 
            className="w-16 h-1 bg-blue-600 mx-auto mt-3"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.h2>

        <div className="max-w-md mx-auto">
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <Image
                  src="/FTI-MasterLogo_RGB_forLightBG.png"
                  alt="FTI Logo"
                  width={180}
                  height={60}
                  priority
                />
              </div>

              <VerificationStates 
                verificationStatus={verificationStatus}
                setVerificationStatus={setVerificationStatus}
                errorMessage={errorMessage}
                newEmail={newEmail}
                email={email}
                userId={userId}
                token={token}
                router={router}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}