"use client";

export default function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-b-2",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-blue-500 ${sizeClasses[size]}`}
        style={{ borderBottomColor: "transparent" }}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
