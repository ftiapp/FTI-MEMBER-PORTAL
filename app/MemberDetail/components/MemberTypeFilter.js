"use client";

import { useState, useEffect } from "react";

/**
 * MemberTypeFilter component for filtering membership data by member type
 * @param {Object} props
 * @param {string} props.memberType - The selected member type
 * @param {Array} props.membershipData - Array of membership data to filter
 * @param {Function} props.onSelectFilter - Callback function when filter is selected
 */
export default function MemberTypeFilter({ memberType, membershipData, onSelectFilter }) {
  const [filters, setFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Generate filters based on membership data
  useEffect(() => {
    if (membershipData && membershipData.length > 0) {
      // Get unique filter values
      const uniqueFilters = [...new Set(membershipData.map((item) => item.category || "ไม่ระบุ"))];
      setFilters(["ทั้งหมด", ...uniqueFilters]);
    }
  }, [membershipData]);

  // Handle filter selection
  const handleFilterClick = (filter) => {
    const filterValue = filter === "ทั้งหมด" ? "all" : filter;
    setSelectedFilter(filterValue);
    onSelectFilter(filterValue);
  };

  if (!membershipData || membershipData.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-transparent">
      <div className="flex flex-wrap gap-2.5">
        {filters.map((filter, index) => (
          <button
            key={index}
            onClick={() => handleFilterClick(filter)}
            className={`
              px-4 py-1.5 
              text-sm font-medium 
              rounded-full 
              transition-all duration-200 
              ${
                selectedFilter === (filter === "ทั้งหมด" ? "all" : filter)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
