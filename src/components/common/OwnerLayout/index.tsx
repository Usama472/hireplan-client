import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

interface OwnerLayoutProps {
  children?: React.ReactNode;
}

/**
 * Admin Portal Layout
 * This layout removes the main app navigation and provides a clean owner-only interface
 */
const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Remove any default app headers/navigation */}
      <style>{`
        /* Hide main app header for owner routes */
        body {
          margin: 0;
          padding: 0;
        }
        
        /* Ensure admin portal takes full viewport */
        #root {
          min-height: 100vh;
        }
      `}</style>
      
      {/* Render admin portal content */}
      <div className="owner-portal-wrapper">
        {children || <Outlet />}
      </div>
    </>
  );
};

export default OwnerLayout;
