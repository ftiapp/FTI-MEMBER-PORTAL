export default function ErrorTooltip({ error }) {
    if (!error) return null;
  
    return (
      <div className="absolute top-0 right-0 -mt-1 -mr-1 z-20">
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
          <div className="relative">
            {error}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }