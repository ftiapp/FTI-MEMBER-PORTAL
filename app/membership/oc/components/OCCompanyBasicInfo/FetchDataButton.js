export default function FetchDataButton({ onClick, disabled, isLoading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        absolute right-2 top-2 
        px-3 py-1.5 
        bg-blue-600 hover:bg-blue-700 
        text-white text-xs font-medium
        rounded-md
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      {isLoading ? "กำลังดึง..." : "ดึงข้อมูล"}
    </button>
  );
}