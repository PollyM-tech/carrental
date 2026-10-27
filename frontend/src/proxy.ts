import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isConnectionError } from "@/lib/connection-errors";
const protectedRoute = createRouteMatcher(["/workspace(.*)", "/dashboard(.*)"]);
const authentication = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (protectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    const car = request.nextUrl.searchParams.get("car");
    return nextjsMiddlewareRedirect(request, (request.nextUrl.pathname.startsWith("/dashboard") ? "/movara-access" : "/sign-in") + (car ? `?car=${encodeURIComponent(car)}` : ""));
  }
}, { cookieConfig: { maxAge: 60 * 60 * 24 * 7 } });
export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname === "/api/auth" && request.method === "POST") {
    const origin = request.headers.get("origin");
    // Next may normalize the request URL's hostname; match the SDK's Host-based check.
    let sameOrigin = !origin;
    if (origin) { try { const parsed = new URL(origin); sameOrigin = parsed.host === request.headers.get("host") && parsed.protocol === request.nextUrl.protocol; } catch { sameOrigin = false; } }
    if (sameOrigin) {
      let body;
      try { body = await request.clone().json(); } catch { /* Let the SDK handle malformed requests. */ }
      const missingCookie = !request.cookies.get("__convexAuthRefreshToken")?.value && !request.cookies.get("__Host-__convexAuthRefreshToken")?.value;
      if (body?.action === "auth:signIn" && body.args?.refreshToken !== undefined && missingCookie) {
        // A revoked/cleared cookie can leave a dummy refresh flag in an older tab.
        // Return the SDK's signed-out result and clear the matching browser cookies.
        const response = NextResponse.json({ tokens: null }, { headers: { "Cache-Control": "no-store" } });
        for (const prefix of ["", "__Host-"]) for (const name of ["__convexAuthJWT", "__convexAuthRefreshToken"]) response.cookies.set(prefix + name, "", { path: "/", httpOnly: true, sameSite: "lax", secure: !!prefix || request.nextUrl.protocol === "https:", expires: new Date(0) });
        return response;
      }
    }
  }
  try { return await authentication(request, event); }
  catch (error) {
    if (!isConnectionError(error)) throw error;
    // Fail closed: never render private pages when authentication cannot be checked.
    if (request.nextUrl.pathname === "/api/auth") return NextResponse.json({ error: "Unable to reach Movara. Check your connection and try again." }, { status: 503 });
    return new NextResponse('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connection unavailable | Movara</title></head><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:1rem"><h1>Unable to connect to Movara</h1><p>Check your connection and try again.</p><a href="">Try again</a></body></html>', { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "5" } });
  }
}
export const config = { matcher: ["/api/auth", "/sign-in", "/movara-access", "/workspace/:path*", "/dashboard/:path*", "/account/:path*"] };
