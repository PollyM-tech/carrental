export function signedInHome(account: { staff: boolean; roles: readonly string[] }): "/dashboard" | "/workspace" {
  return account.staff && account.roles.length > 0 ? "/dashboard" : "/workspace";
}
