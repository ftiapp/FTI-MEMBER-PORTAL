"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingOverlay } from "../shared";
import ErrorState from "./components/ErrorState";
import OperationsList from "./components/OperationsList";

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const router = useRouter();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // Refs for preventing duplicate requests
  const isLoadingOperations = useRef(false);

  useEffect(() => {
    if (user?.id) {
      fetchOperationStatus();
    }
  }, [user]);

  const fetchOperationStatus = async () => {
    // Prevent duplicate requests
    if (isLoadingOperations.current) return;

    try {
      isLoadingOperations.current = true;
      setLoading(true);
      setLoadingError(false);

      const response = await fetch(`/api/dashboard/operation-status?userId=${user.id}`);

      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      } else {
        console.error("Failed to fetch operation status");
        setLoadingError(true);
      }
    } catch (error) {
      console.error("Error fetching operation status:", error);
      setLoadingError(true);
    } finally {
      setLoading(false);
      // Add a small delay before allowing new requests
      setTimeout(() => {
        isLoadingOperations.current = false;
      }, 300);
    }
  };

  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchOperationStatus();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <LoadingOverlay isVisible={true} message="กำลังโหลดสถานะการดำเนินการ..." inline={true} />
    );
  }

  if (loadingError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ErrorState onRetry={handleRetry} />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Profile Update Operations */}
        <OperationsList operations={operations} userId={user?.id} />
      </motion.div>
    </AnimatePresence>
  );
}
