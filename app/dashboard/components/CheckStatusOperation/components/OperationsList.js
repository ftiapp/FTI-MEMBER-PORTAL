import React, { useState } from "react";
import { motion } from "framer-motion";
import OperationsListHeader from "./OperationsListHeader";
import OperationsListContent from "./OperationsListContent";
import OperationsListSearchBar from "./OperationsListSearchBar";
import { containerVariants } from "../utils/animationVariants";
import { operationTypeOptions, statusOptions } from "../utils/filterOptions";
import useOperationsFiltering from "../hooks/useOperationsFiltering";

/**
 * OperationsList component displays all operations for a user with filtering and pagination
 * @param {Array} operations - Initial operations to display (now contains all data from unified endpoint)
 * @param {string} userId - The user ID to fetch operations for
 */
const OperationsList = ({ operations: initialOperations, userId }) => {
  // Search/filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);

  // Use initialOperations directly (already contains all merged data from unified endpoint)
  const operations = initialOperations || [];

  // Apply filtering and pagination
  const { currentOperations, totalPages, currentPage, setCurrentPage } = useOperationsFiltering(
    operations,
    search,
    statusFilter,
    typeFilter,
    dateRange,
  );

  // No loading state needed since data comes from parent
  const isLoading = false;

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
