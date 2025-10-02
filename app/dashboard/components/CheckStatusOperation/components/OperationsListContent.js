import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingOverlay } from "../../shared";
import { getStatusIcon, getStatusText, getStatusClass } from "./utils";
import {
  getContactMessageStatusIcon,
  getContactMessageStatusText,
  getContactMessageStatusClass,
} from "./contactMessageStatusUtils";
import {
  getAddressUpdateStatusIcon,
  getAddressUpdateStatusText,
  getAddressUpdateStatusClass,
} from "./addressUpdateStatusUtils";
import {
  getProductUpdateStatusIcon,
  getProductUpdateStatusText,
  getProductUpdateStatusClass,
} from "./productUpdateStatusUtils";
import {
  getSocialMediaStatusIcon,
  getSocialMediaStatusText,
  getSocialMediaStatusClass,
} from "./socialMediaStatusUtils";
import { getLogoStatusIcon, getLogoStatusText, getLogoStatusClass } from "../utils/logoStatusUtils";
import { getTsicStatusIcon, getTsicStatusText, getTsicStatusClass } from "../utils/tsicStatusUtils";
import EmptyState from "./EmptyState";
import StatusCard from "./StatusCard";
import Pagination from "./Pagination";
import { containerVariants, itemVariants } from "../utils/animationVariants";

const OperationsListContent = ({
  isLoading,
  filteredOperations,
  currentOperations,
  totalPages,
  currentPage,
  setCurrentPage,
}) => {
  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="กำลังโหลดรายการ..." inline={true} />;
  }

  if (filteredOperations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState message="ไม่พบรายการแก้ไขข้อมูล" />
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} className="space-y-4">
      <AnimatePresence mode="wait">
        {currentOperations.map((operation, index) => (
          <motion.div
            key={`${operation.type}-${operation.id}-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
          >
            <StatusCard
              icon={
                operation.title === "ติดต่อเจ้าหน้าที่"
                  ? getContactMessageStatusIcon(operation.status)
                  : operation.title === "แก้ไขข้อมูลสมาชิก"
                    ? getAddressUpdateStatusIcon(operation.status)
                    : operation.title === "แก้ไขข้อมูลสินค้า"
                      ? getProductUpdateStatusIcon(operation.status)
                      : operation.title === "อัปเดตโซเชียลมีเดีย"
                        ? getSocialMediaStatusIcon(operation.status)
                        : operation.title === "อัปเดตโลโก้บริษัท"
                          ? getLogoStatusIcon(operation.status)
                          : operation.title === "อัปเดตรหัส TSIC"
                            ? getTsicStatusIcon(operation.status)
                            : getStatusIcon(operation.status)
              }
              title={operation.title}
              description={operation.description}
              statusText={
                operation.title === "ติดต่อเจ้าหน้าที่"
                  ? getContactMessageStatusText(operation.status)
                  : operation.title === "แก้ไขข้อมูลสมาชิก"
                    ? getAddressUpdateStatusText(operation.status)
                    : operation.title === "แก้ไขข้อมูลสินค้า"
                      ? getProductUpdateStatusText(operation.status)
                      : operation.title === "อัปเดตโซเชียลมีเดีย"
                        ? getSocialMediaStatusText(operation.status)
                        : operation.title === "อัปเดตโลโก้บริษัท"
                          ? getLogoStatusText(operation.status)
                          : operation.title === "อัปเดตรหัส TSIC"
                            ? getTsicStatusText(operation.status)
                            : getStatusText(operation.status)
              }
              statusClass={
                operation.title === "ติดต่อเจ้าหน้าที่"
                  ? getContactMessageStatusClass(operation.status)
                  : operation.title === "แก้ไขข้อมูลสมาชิก"
                    ? getAddressUpdateStatusClass(operation.status)
                    : operation.title === "แก้ไขข้อมูลสินค้า"
                      ? getProductUpdateStatusClass(operation.status)
                      : operation.title === "อัปเดตโซเชียลมีเดีย"
                        ? getSocialMediaStatusClass(operation.status)
                        : operation.title === "อัปเดตโลโก้บริษัท"
                          ? getLogoStatusClass(operation.status)
                          : operation.title === "อัปเดตรหัส TSIC"
                            ? getTsicStatusClass(operation.status)
                            : getStatusClass(operation.status)
              }
              date={operation.created_at}
              errorMessage={operation.status === "rejected" ? operation.reason : null}
              id={operation.id}
              type={
                operation.type ||
                (operation.title === "ติดต่อเจ้าหน้าที่"
                  ? "ติดต่อเจ้าหน้าที่"
                  : operation.title === "แก้ไขข้อมูลสมาชิก"
                    ? "แก้ไขข้อมูลสมาชิก"
                    : operation.title === "แก้ไขข้อมูลสินค้า"
                      ? "แก้ไขข้อมูลสินค้า"
                      : operation.title === "อัปเดตโซเชียลมีเดีย"
                        ? "อัปเดตโซเชียลมีเดีย"
                        : operation.title === "อัปเดตโลโก้บริษัท"
                          ? "อัปเดตโลโก้บริษัท"
                          : operation.title === "อัปเดตรหัส TSIC"
                            ? "อัปเดตรหัส TSIC"
                            : operation.title?.includes("ยืนยันสมาชิกเดิม")
                              ? "ยืนยันสมาชิกเดิม"
                              : "แก้ไขข้อมูลส่วนตัว")
              }
              status={operation.status}
              message_content={operation.message_content}
              old_address={operation.old_address}
              new_address={operation.new_address}
              old_product={operation.old_product}
              new_product={operation.new_product}
              items={operation.items}
              member_code={operation.member_code}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </motion.div>
  );
};

export default OperationsListContent;
