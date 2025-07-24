import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/constants";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { status } = useAuthSessionContext();

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Resources", href: "#resources" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <img src="../../../../../public/logo.png" className="w-8" />
              <span className="text-xl font-bold text-blue-700">
                {APP_NAME}
              </span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {status === "authenticated" ? (
              <>
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all duration-300 text-white"
                  onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  onClick={() => navigate(ROUTES.SIGNUP)}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium rounded-lg hover:bg-gray-50 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                  onClick={() => handleNavigation("/onboarding")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
