export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#211a16]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a15d24]">
            MoBri Car Hire
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Reliable car hire for trips across Kenya.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f534c]">
            Book and manage verified vehicles through a secure account with
            role-based access for customers and operations staff.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#211a16] px-6 text-sm font-bold text-white transition hover:bg-[#3a2c24]"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#d6c8ba] px-6 text-sm font-bold text-[#211a16] transition hover:bg-white"
            >
              Create account
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg border border-[#dfd3c7] bg-[#ebe2d8] p-8 shadow-sm">
          <div className="absolute left-8 right-8 top-1/2 h-20 -translate-y-1/2 rounded-t-[4rem] bg-[#211a16]" />
          <div className="absolute left-20 right-20 top-[38%] h-16 rounded-t-[3rem] bg-[#7f4a28]" />
          <div className="absolute bottom-[28%] left-16 h-16 w-16 rounded-full border-[12px] border-[#211a16] bg-[#f7f4ef]" />
          <div className="absolute bottom-[28%] right-16 h-16 w-16 rounded-full border-[12px] border-[#211a16] bg-[#f7f4ef]" />
          <div className="absolute bottom-8 left-8 right-8 h-1 bg-[#c8b8a8]" />
        </div>
      </section>
    </main>
  );
}
