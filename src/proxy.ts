import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      "/",
      "/sign-in",
      "/sign-up",
      "/callback",
      "/unauthorized",
    ],
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/profile/:path*",
  ],
};
