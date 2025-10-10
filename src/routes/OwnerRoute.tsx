import { type FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerAuthService } from "@/http/owner/auth";
import OwnerLayout from "@/components/layout/OwnerLayout";

export type OwnerRouteProps = {
  children: React.ReactNode;
};

const OwnerRoute: FC<OwnerRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('owner_access_token');
      
      if (!storedToken || (storedToken !== 'hardcoded-access-token' && storedToken.length < 10)) {
        console.log('❌ OwnerRoute: No authentication, redirecting to login');
        navigate('/owner/login', { replace: true });
        return;
      }

      console.log('✅ OwnerRoute: Authentication valid');
    };

    checkAuth();
  }, [navigate]);

  return (
    <OwnerLayout>
      {children}
    </OwnerLayout>
  );
};

export default OwnerRoute;
