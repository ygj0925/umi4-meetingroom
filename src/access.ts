/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const permissions: string[] = (currentUser as any)?.permissions || [];
  const roles: string[] = (currentUser as any)?.roles || [];

  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    permissions,
    roles,
    hasPermission: (permission: string) => permissions.includes(permission),
    hasRole: (role: string) => roles.includes(role),
  };
}
