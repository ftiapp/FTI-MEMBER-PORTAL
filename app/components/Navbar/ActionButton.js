import Link from "next/link";

export default function ActionButton({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  onClick,
}) {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 relative overflow-hidden group text-sm inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    search: "bg-emerald-600 text-white hover:bg-emerald-700",
  };

  const Component = external ? "a" : Link;
  const linkProps = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };

  return (
    <Component
      {...linkProps}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </Component>
  );
}
