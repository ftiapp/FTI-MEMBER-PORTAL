import Link from "next/link";

export default function ActionButton({ href, children, variant = "primary", external = false, className = "", onClick }) {
  const baseClasses = "px-5 py-2 rounded-lg font-medium transition-all duration-300 shadow-md relative overflow-hidden group text-sm inline-flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300",
    search: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5",
  };

  const Component = external ? "a" : Link;
  const linkProps = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };

  return (
    <Component {...linkProps} onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Component>
  );
}
