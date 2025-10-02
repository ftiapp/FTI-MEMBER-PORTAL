"use client";

import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

/**
 * Component for displaying TSIC code with language toggle support
 */
export default function TsicCodeDisplay({
  tsicCode,
  description,
  description_EN,
  category,
  category_EN,
  language,
  onEdit,
  onDelete,
  status,
}) {
  // Only show action buttons for approved TSIC codes or if no status is provided
  const showActions = !status || status === "approved";

  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between items-start">
        <div className="font-medium">{tsicCode}</div>
        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(tsicCode, category)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                title={language === "th" ? "แก้ไข" : "Edit"}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(tsicCode, category)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title={language === "th" ? "ลบ" : "Delete"}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-700">
        {language === "th" ? description : description_EN || description}
      </div>
      {category && (
        <div className="text-xs text-gray-500">
          {language === "th" ? `หมวดหมู่ ${category}` : `Category ${category_EN || category}`}
        </div>
      )}
    </div>
  );
}
