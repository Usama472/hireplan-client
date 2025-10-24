import { Footer } from "@/components/common/navigation/main/footer";
import { Header } from "@/components/common/navigation/main/header";
import { ScrollToTop } from "@/lib/hooks/ScrollToTop";
import { type FC } from "react";
import { useLocation } from "react-router-dom";

export type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // No loading screen - just render immediately
  // AuthRedirection will handle any necessary redirects

  // Hide layout only for company, applicant, and owner routes
  const shouldHideLayout = path.startsWith("/company/") || path.startsWith("/applicant/") || path.startsWith("/owner/");

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
