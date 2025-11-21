import { motion } from "framer-motion";

function HeroSection({ title, subtitle, isMobile = false }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-gray-50">
      {/* Decorative elements - ซ่อนในมือถือ */}
      {!isMobile && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        </div>
      )}

      {/* Register icon - ซ่อนในมือถือ */}
      {!isMobile && (
        <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 opacity-15 lg:block">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 8V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 11H17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center md:py-20">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {title}
        </h1>
        <motion.div
          className="mx-auto mb-6 mt-4 h-1 w-24 rounded-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl">{subtitle}</p>
      </div>
    </section>
  );
}

export default HeroSection;
