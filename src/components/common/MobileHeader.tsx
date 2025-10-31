import { APP_NAME } from "@/constants";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MobileHeader = () => {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between md:hidden">
      {/* Left: Logo and App Name */}
      <Link
        to="/"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
        <span className="font-extrabold text-2xl leading-tight tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </Link>

      {/* Right: Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-10 w-10"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
    </header>
  );
};
