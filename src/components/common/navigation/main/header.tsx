import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/constants";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { status } = useAuthSessionContext();

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "/faq" },
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
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <Link
              to="/"
              className="flex items-center space-x-2 min-w-0 hover:opacity-80 transition-opacity"
            >
              <img src="../../../../../public/logo.png" className="w-8 h-8 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              // For anchor links, keep as buttons since they need scroll behavior
              if (item.href.startsWith("#")) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="text-muted-foreground hover:text-foreground px-3 lg:px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted cursor-pointer whitespace-nowrap"
                  >
                    {item.name}
                  </button>
                );
              }
              // For regular navigation, use Link components
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground px-3 lg:px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted cursor-pointer whitespace-nowrap"
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {status === "authenticated" ? (
              <>
                <Button
                  variant="secondary"
                  asChild
                >
                  <Link to={ROUTES.DASHBOARD.MAIN}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="text-sm px-3 lg:px-4"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 lg:px-4"
                >
                  <Link to={ROUTES.SIGNUP}>Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 h-10 w-10"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navigation.map((item) => {
                // For anchor links, keep as buttons since they need scroll behavior
                if (item.href.startsWith("#")) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="text-muted-foreground hover:text-foreground block px-3 py-2 text-base font-medium rounded-lg hover:bg-muted w-full text-left transition-colors"
                    >
                      {item.name}
                    </button>
                  );
                }
                // For regular navigation, use Link components
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground block px-3 py-2 text-base font-medium rounded-lg hover:bg-muted w-full text-left transition-colors"
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
                {status === "authenticated" ? (
                  <Button
                    variant="secondary"
                    asChild
                    className="w-full"
                  >
                    <Link to={ROUTES.DASHBOARD.MAIN} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start"
                    >
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      <Link to={ROUTES.SIGNUP} onClick={() => setIsMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
