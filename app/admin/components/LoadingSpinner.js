"use client";

function LoadingSpinner({ size = 8, color = "white" }) {
  const sizeClasses = {
    4: "h-4 w-4",
    6: "h-6 w-6",
    8: "h-8 w-8",
    12: "h-12 w-12",
    16: "h-16 w-16",
  };

  const colorClasses = {
    white: "border-t-white border-b-white border-l-transparent border-r-transparent",
    blue: "border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent",
    gray: "border-t-gray-300 border-b-gray-300 border-l-transparent border-r-transparent",
    red: "border-t-red-500 border-b-red-500 border-l-transparent border-r-transparent",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
    ></div>
  );
}

export default LoadingSpinner;
