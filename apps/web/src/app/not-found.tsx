import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6 py-16 text-ink">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-40 h-120 w-120 -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <section className="relative w-full max-w-5xl">

        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="rounded-full border border-black/10 bg-white/60 px-4 py-2 font-mono text-xs tracking-[0.35em] uppercase backdrop-blur">
            Incident #404
          </span>
        </div>

        {/* Hero */}
        <div className="text-center">

          <h1 className="font-display text-[8rem] leading-none md:text-[10rem]">
            404
          </h1>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            The curator is panicking.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate">
            Someone misplaced an entire page.
            <br />
            We've questioned every pixel.
            Even the database claims innocence.
          </p>
        </div>


        {/* Buttons */}

        <div className="mt-12 flex flex-wrap justify-center gap-4">

          <Link
            href="/"
            className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-paper transition duration-300 hover:shadow-xl"
          >
            Pretend This Never Happened
          </Link>

        </div>

      </section>

    </main>
  );
}