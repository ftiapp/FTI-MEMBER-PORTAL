"use client";

import React, { useState, useEffect } from "react";
import { FaFileAlt, FaCircle, FaPencilAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatProductsList } from "./utils";
import EditProductForm from "./EditProductForm";
import { toast } from "react-toastify";

/**
 * Component for displaying products and services list
 */
const ProductsList = ({ companyInfo, memberType, memberGroupCode, typeCode, language = "th" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // เลือกรายการสินค้าตามภาษาที่เลือก
  const productsList =
    language === "th"
      ? formatProductsList(companyInfo.PRODUCT_DESC_TH || "")
      : formatProductsList(companyInfo.PRODUCT_DESC_EN || "");

  const memberCode = companyInfo.MEMBER_CODE || companyInfo.member_code;

  // Check if there's a pending product update request
  useEffect(() => {
    if (memberCode) {
      checkPendingProductUpdate();
    }
  }, [memberCode]);

  const checkPendingProductUpdate = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch(
        `/api/member/check-pending-product-update?member_code=${memberCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      setHasPendingRequest(data.hasPendingRequest || false);
    } catch (error) {
      console.error("Error checking pending product update:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    setHasPendingRequest(true);
  };

  if (isEditing) {
    return (
      <EditProductForm
        companyInfo={companyInfo}
        onCancel={handleCancelEdit}
        onSuccess={handleEditSuccess}
        memberType={memberType}
        memberGroupCode={memberGroupCode}
        typeCode={typeCode}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-medium text-blue-600">
          {language === "th" ? "สินค้าและบริการ" : "Products and Services"}
        </h3>

        <div>
          {hasPendingRequest ? (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              คำขอแก้ไขกำลังรอการอนุมัติ
            </div>
          ) : (
            <button
              onClick={handleEditClick}
              disabled={isCheckingStatus}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaPencilAlt className="mr-1 h-3 w-3" />
              แก้ไข
            </button>
          )}
        </div>
      </div>

      {productsList.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200 mt-4">
          {language === "th"
            ? "ยังไม่มีข้อมูลสินค้าและบริการ"
            : "No product and service information"}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mt-4">
          <div className="flex items-start mb-3">
            <FaFileAlt className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <p className="font-medium text-gray-800">
              {language === "th" ? "รายละเอียดสินค้า/บริการ" : "Product/Service Details"}
            </p>
          </div>
          <ul className="pl-8 space-y-2">
            {productsList.map((product, index) => (
              <li key={index} className="flex items-start group">
                <FaCircle className="text-blue-500 mr-2 mt-1.5 text-xs flex-shrink-0" />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  {product}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsList;
