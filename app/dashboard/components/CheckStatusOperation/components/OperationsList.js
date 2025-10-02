import React, { useState } from "react";
import { motion } from "framer-motion";
import OperationsListHeader from "./OperationsListHeader";
import OperationsListContent from "./OperationsListContent";
import OperationsListSearchBar from "./OperationsListSearchBar";
import { containerVariants } from "../utils/animationVariants";
import { operationTypeOptions, statusOptions } from "../utils/filterOptions";
import useContactMessageStatus from "../hooks/useContactMessageStatus";
import useAddressUpdateStatus from "../hooks/useAddressUpdateStatus";
import useVerificationStatus from "../hooks/useVerificationStatus";
import useProductUpdateStatus from "../hooks/useProductUpdateStatus";
import useSocialMediaStatus from "../hooks/useSocialMediaStatus";
import useLogoStatus from "../hooks/useLogoStatus";
import useTsicStatus from "../hooks/useTsicStatus";
import useMergedOperations from "../hooks/useMergedOperations";
import useOperationsFiltering from "../hooks/useOperationsFiltering";

/**
 * OperationsList component displays all operations for a user with filtering and pagination
 * @param {Array} operations - Initial operations to display
 * @param {string} userId - The user ID to fetch operations for
 */
const OperationsList = ({ operations: initialOperations, userId }) => {
  // Search/filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);

  // Fetch data using custom hooks
  const { contactMessageStatus, isLoading: contactLoading } = useContactMessageStatus(userId);
  const addressUpdates = useAddressUpdateStatus(userId);
  const { verifications, isLoading: verificationsLoading } = useVerificationStatus(userId);
  const productUpdates = useProductUpdateStatus(userId);
  const { socialMediaUpdates, isLoading: socialMediaLoading } = useSocialMediaStatus(userId);
  const { logoUpdates, loading: logoLoading } = useLogoStatus(userId);
  const { tsicUpdates, isLoading: tsicLoading } = useTsicStatus(userId);

  // Merge all operations
  const operations = useMergedOperations(
    initialOperations,
    contactMessageStatus,
    verifications,
    addressUpdates,
    productUpdates,
    socialMediaUpdates,
    logoUpdates,
    tsicUpdates,
  );

  // Apply filtering and pagination
  const { currentOperations, totalPages, currentPage, setCurrentPage } = useOperationsFiltering(
    operations,
    search,
    statusFilter,
    typeFilter,
    dateRange,
  );

  // Determine if we're still loading data
  const isLoading =
    contactLoading || verificationsLoading || socialMediaLoading || logoLoading || tsicLoading;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      id="operations-container"
    >
      <OperationsListHeader />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <OperationsListSearchBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          operationTypeOptions={operationTypeOptions}
          statusOptions={statusOptions}
        />
      </motion.div>

      <OperationsListContent
        isLoading={isLoading}
        filteredOperations={operations}
        currentOperations={currentOperations}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </motion.div>
  );
};

export default OperationsList;
