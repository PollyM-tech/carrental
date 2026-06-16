export default function AuthTestPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Account check
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#0A1628]">
          Your secure session is active.
        </h1>
        <p className="mt-6 text-slate-600">
          You can continue to the dashboard when your account has the required
          access.
        </p>
      </section>
    </main>
  );
}
