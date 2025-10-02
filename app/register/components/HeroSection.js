import { motion } from "framer-motion";

function HeroSection({ title, subtitle, isMobile = false }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
      {/* Decorative elements - ซ่อนในมือถือ */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
        </>
      )}

      {/* Register icon - ซ่อนในมือถือ */}
      {!isMobile && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 8V14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 11H17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">{title}</h1>
        <motion.div
          className="w-24 h-1 bg-white mx-auto mb-6"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}

export default HeroSection;
