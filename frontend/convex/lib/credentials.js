/**
 * Convex Credentials keeps the supplied Password implementation in `options`.
 * Resolve that layer before using crypto or wrapping authorize, and remove it
 * so Convex Auth cannot replace the wrapper when it materializes the provider.
 * @param {import('@convex-dev/auth/server').ConvexCredentialsConfig & {options?: Partial<import('@convex-dev/auth/server').ConvexCredentialsConfig>}} provider
 * @returns {import('@convex-dev/auth/server').ConvexCredentialsConfig}
 */
export function materializeCredentials(provider) {
  const { options, ...base } = provider;
  return { ...base, ...options };
}
