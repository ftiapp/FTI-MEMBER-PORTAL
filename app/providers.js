"use client";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { LoadingProvider } from "./components/GlobalLoadingOverlay";
import "react-toastify/dist/ReactToastify.css";
import "./styles/custom-toast.css";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <LoadingProvider>
        {children}
        <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="custom-toast-container"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          progressClassName="custom-toast-progress"
        />
      </LoadingProvider>
    </AuthProvider>
  );
}
