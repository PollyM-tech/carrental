// src/app/sign-in/route.ts
import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function GET() {
  const authorizationUrl = await getSignInUrl();
  redirect(authorizationUrl);
}