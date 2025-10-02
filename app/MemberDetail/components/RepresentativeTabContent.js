"use client";

import { FaUser, FaAward, FaBriefcase } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced representative tab content for the member detail page
 */
export default function RepresentativeTabContent({ companyInfo, representatives }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.03, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)" },
  };

  // Helper function to get representative data based on member type
  const getRepresentativeData = () => {
    if (
      companyInfo.MEMBER_MAIN_GROUP_CODE === "000" &&
      representatives.right.some((rep) => rep.th || rep.en)
    ) {
      return {
        title: "ผู้แทนสภาอุตสาหกรรมแห่งประเทศไทย",
        subtitle: "Federation of Thai Industries Representatives",
        icon: <FaAward className="text-yellow-500" size={24} />,
        data: representatives.right.filter((rep) => rep.th || rep.en),
        gradientFrom: "from-blue-500",
        gradientTo: "to-indigo-600",
      };
    } else if (
      companyInfo.MEMBER_MAIN_GROUP_CODE === "100" &&
      representatives.industry.some((rep) => rep.th || rep.en)
    ) {
      return {
        title: "ผู้แทนกลุ่มอุตสาหกรรม",
        subtitle: "Industry Group Representatives",
        icon: <FaBriefcase className="text-teal-500" size={24} />,
        data: representatives.industry.filter((rep) => rep.th || rep.en),
        gradientFrom: "from-teal-500",
        gradientTo: "to-emerald-500",
      };
    } else if (
      companyInfo.MEMBER_MAIN_GROUP_CODE === "200" &&
      representatives.province.some((rep) => rep.th || rep.en)
    ) {
      return {
        title: "ผู้แทนสภาอุตสาหกรรมจังหวัด",
        subtitle: "Provincial Industry Representatives",
        icon: <FaUser className="text-purple-500" size={24} />,
        data: representatives.province.filter((rep) => rep.th || rep.en),
        gradientFrom: "from-purple-500",
        gradientTo: "to-pink-500",
      };
    }
    return null;
  };

  const representativeData = getRepresentativeData();
  const hasRepresentatives = representativeData !== null;

  // Get background color based on index
  const getCardGradient = (index) => {
    const gradients = [
      "bg-gradient-to-br from-blue-500 to-indigo-600",
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-teal-500 to-emerald-500",
      "bg-gradient-to-br from-orange-500 to-amber-500",
      "bg-gradient-to-br from-rose-500 to-red-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <motion.div
      className="space-y-8 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {hasRepresentatives && (
        <motion.div variants={itemVariants} className="space-y-8">
          <motion.div
            className="flex items-center space-x-3 border-b pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {representativeData.icon}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{representativeData.title}</h3>
              <p className="text-sm text-gray-500">{representativeData.subtitle}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {representativeData.data.map((rep, index) => (
              <motion.div
                key={`rep-${index}`}
                className="relative group"
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <div className={`rounded-xl overflow-hidden shadow-lg`}>
                  {/* Card Header with Gradient */}
                  <div
                    className={`${getCardGradient(index)} h-24 flex justify-center items-center`}
                  >
                    <motion.div
                      className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-2xl font-bold text-gray-800">{index + 1}</span>
                    </motion.div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-white p-5 space-y-3">
                    <h4 className="text-center font-medium text-sm text-gray-500">
                      ผู้แทนลำดับที่ {index + 1}
                    </h4>
                    <div className="text-center">
                      <p className="font-semibold text-lg text-gray-800 break-words">
                        {rep.th || rep.en || "-"}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex justify-center">
                      <span className="text-xs text-gray-500 inline-flex items-center">
                        <FaUser className="mr-1" size={12} /> Representative
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!hasRepresentatives && (
        <motion.div
          className="py-16 text-center rounded-lg bg-gray-50 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaUser size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">ไม่พบข้อมูลผู้แทน</p>
          <p className="text-sm text-gray-400 mt-2">No representative information available</p>
        </motion.div>
      )}
    </motion.div>
  );
}
