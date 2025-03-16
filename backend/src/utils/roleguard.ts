import { ErrorCodeEnum } from "../enums/errorcode.enum";
import { PermissionType } from "../enums/role.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./roles-permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPersmissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];
  // check if the user has the required permissions
  const hasPermission = requiredPersmissions.every((permission) => {
    return permissions.includes(permission);
  });
  if (!hasPermission) {
    throw new UnauthorizedException(
      "You don't have permission to perform this action"
    );
  }
};
