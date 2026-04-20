export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';

export function hasAnyRole(
  roles: string[] | undefined,
  requiredRoles: string[]
): boolean {
  if (!roles?.length) {
    return false;
  }

  return requiredRoles.some((role) => roles.includes(role));
}

export function isAdminRole(roles: string[] | undefined): boolean {
  return hasAnyRole(roles, [ADMIN_ROLE]);
}
