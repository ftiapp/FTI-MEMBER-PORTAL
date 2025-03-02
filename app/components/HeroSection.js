'use client';

export default function HeroSection({ title, description, children }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-90"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05]" style={{ backgroundSize: '32px 32px' }}></div>
      </div>
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
