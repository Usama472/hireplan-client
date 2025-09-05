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
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      // Handle anchor links
      if (window.location.pathname !== "/") {
        // If not on home page, navigate to home page with hash
        navigate("/" + href);
        // Use setTimeout to ensure the navigation completes before scrolling
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        // If on home page, scroll to section immediately
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      // Handle regular navigation
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <img src="../../../../../public/logo.png" className="w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {status === "authenticated" ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  className="text-muted-foreground hover:text-foreground block px-3 py-2 text-base font-medium rounded-lg hover:bg-muted w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleNavigation("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleNavigation("/signup")}
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
