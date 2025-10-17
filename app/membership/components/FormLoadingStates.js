/**
 * Shared loading state components for membership forms
 */

/**
 * Loading spinner with message
 */
export const FormLoadingSpinner = ({ message = "กำลังโหลดข้อมูล..." }) => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-lg text-gray-600">{message}</span>
    </div>
  );
};

/**
 * Error display with retry button
 */
export const FormErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Combined loading/error handler
 */
export const FormDataLoader = ({ isLoading, error, onRetry, children }) => {
  if (isLoading) {
    return <FormLoadingSpinner />;
  }

  if (error) {
    return <FormErrorDisplay error={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
};
