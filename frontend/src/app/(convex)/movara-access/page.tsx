import type { Metadata } from "next";
import AdminSignIn from "@/components/auth/AdminSignIn";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default function AdminAccess() { return <AdminSignIn />; }
