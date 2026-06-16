import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Access restricted
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          You do not have permission to access this page.
        </h1>
        <p className="mt-4 text-slate-600">
          Contact your administrator if you believe this is an error.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Go back
          </Link>
          <Link
            href="/sign-out"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Sign out
          </Link>
        </div>
      </section>
    </main>
  );
}
