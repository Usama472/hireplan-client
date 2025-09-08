import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Footer } from "@/components/common/navigation/main/footer";
import { Header } from "@/components/common/navigation/main/header";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { ScrollToTop } from "@/lib/hooks/ScrollToTop";
import { type FC } from "react";
import { useLocation } from "react-router-dom";

export type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const { status } = useAuthSessionContext();
  const path = location.pathname;

  const hideLayoutFor = ["/signup"];
  
  // Skip loading for landing page and other critical public pages
  const skipLoadingFor = ["/", "/contact", "/privacy", "/terms", "/company", "/apply", "/interview"];
  const shouldSkipLoading = skipLoadingFor.some(route => 
    path === route || path.startsWith(route + '/')
  );

  // Show loading for auth-dependent public pages
  if (status === 'loading' && !shouldSkipLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Hide layout for specific routes and all company routes
  const shouldHideLayout = hideLayoutFor.includes(path) || path.startsWith("/company/");

  return shouldHideLayout ? (
    <>
      <ScrollToTop />
      {children}
    </>
  ) : (
    <div>
      <ScrollToTop />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default PublicRoute;
