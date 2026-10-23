"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <main className="mx-auto max-w-xl p-8">
    <h1 className="text-2xl font-bold">Unable to load the dashboard</h1>
    <p className="my-4">{error.message}</p>
    <button className="rounded-xl bg-orange-600 px-5 py-3 text-white" onClick={reset}>Try again</button>
  </main>;
}
