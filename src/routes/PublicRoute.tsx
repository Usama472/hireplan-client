import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Footer } from "@/components/common/navigation/main/footer";
import { Header } from "@/components/common/navigation/main/header";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { type FC } from "react";
import { useLocation } from "react-router-dom";

export type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const { status } = useAuthSessionContext();
  const path = location.pathname;

  const hideLayoutFor = ["/login", "/signup"];

  // Show loading state while checking authentication
  if (status === "loading") {
    return <LoadingScreen />;
  }

  const shouldHideLayout = hideLayoutFor.includes(path);

  return shouldHideLayout ? (
    <>{children}</>
  ) : (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default PublicRoute;
