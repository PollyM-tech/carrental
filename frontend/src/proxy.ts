import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
const protectedRoute = createRouteMatcher(["/workspace(.*)", "/dashboard(.*)"]);
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (protectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    const car = request.nextUrl.searchParams.get("car");
    return nextjsMiddlewareRedirect(request, (request.nextUrl.pathname.startsWith("/dashboard") ? "/movara-access" : "/sign-in") + (car ? `?car=${encodeURIComponent(car)}` : ""));
  }
}, { cookieConfig: { maxAge: 60 * 60 * 24 * 7 } });

// Django-backed routes retain their existing auth until their APIs are migrated.
export const config = { matcher: ["/api/auth", "/sign-in", "/movara-access", "/workspace/:path*", "/dashboard/:path*", "/account/:path*"] };
