"use client";

export default function LanguageToggle({ language, onToggle }) {
  return (
    <div className="flex items-center space-x-2">
      <span
        className={`text-sm font-medium ${language === "th" ? "text-blue-600" : "text-gray-500"}`}
      >
        TH
      </span>
      <button
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
        aria-pressed={language === "en"}
        aria-labelledby="language-toggle"
      >
        <span className="sr-only" id="language-toggle">
          Toggle language
        </span>
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${
            language === "en" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${language === "en" ? "text-blue-600" : "text-gray-500"}`}
      >
        EN
      </span>
    </div>
  );
}
