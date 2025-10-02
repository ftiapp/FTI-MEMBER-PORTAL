"use client";

import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

/**
 * SearchBar component for filtering companies by name
 * @param {Object} props Component properties
 * @param {string} props.searchTerm Current search term
 * @param {Function} props.onSearchChange Callback for search term changes
 * @returns {JSX.Element} The search bar UI
 */
const SearchBar = ({ searchTerm, onSearchChange }) => (
  <motion.div
    className="mb-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <FaSearch className="h-5 w-5 text-gray-400" />
        </motion.div>
      </div>
      <motion.input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="ค้นหาชื่อบริษัทหรือหมายเลขสมาชิก..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
      />
    </div>
  </motion.div>
);

export default SearchBar;
