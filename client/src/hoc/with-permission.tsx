/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withPermission = (
  WrrappedComponent: React.ComponentType,
  requiredPermission: PermissionType
) => {
  const WithPermission = (props: any) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission) || isLoading) {
        navigate(`/workspace/${workspaceId}`);
      }
    }, [user, hasPermission, isLoading, navigate, workspaceId]);
    if (isLoading) {
      return <div>Loading....</div>;
    }

    // check if user has the required permissions
    if (!user || !hasPermission(requiredPermission)) {
      return;
    }
    // if user has the required permissions, render the component
    return <WrrappedComponent {...props} />;
  };

  return WithPermission;
};

export default withPermission;
