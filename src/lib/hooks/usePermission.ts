import { PERMISSIONS } from "@/constants/permissions";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useCallback } from "react";

type PermissionKey = keyof typeof PERMISSIONS;
type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

/**
 * Hook to check if the current user has a specific permission
 */
export const usePermission = () => {
  const { data: authData } = useAuthSessionContext();
  const userPermissions = authData?.user?.appRole?.permissions || [];

  const hasPermission = useCallback(
    (permission: PermissionValue | PermissionValue[]) => {
      if (!userPermissions.length) return false;

      if (Array.isArray(permission)) {
        return permission.some((p) => userPermissions.includes(p));
      }

      return userPermissions.includes(permission);
    },
    [userPermissions]
  );

  return { hasPermission };
};

export default usePermission;
