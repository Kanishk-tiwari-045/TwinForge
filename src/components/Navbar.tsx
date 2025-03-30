import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/#about" },
    { label: "Research Assistant", href: "/research-assistant" }, // Added this
    { label: "Login", href: "/login" },
  ];

  return (
    <nav className="fixed w-full bg-gray-900/95 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
                DigiTwin
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default anchor behavior
                    navigate(item.href.split("#")[0]); // Navigate to base path
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href.split("#")[0]);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
