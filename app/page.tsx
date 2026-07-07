export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-20 sm:py-28">
        <p className="font-sans text-sm uppercase tracking-[0.2em] text-ink-faint">
          Essays on faith
        </p>
        <h1 className="mt-6 max-w-[24ch] text-balance font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Quiet reflections on following{" "}
          <em className="text-accent">Christ</em> in an unquiet world.
        </h1>
        <p className="mt-8 max-w-prose text-ink-muted">
          WritingFaith is the home of Veruschka Pestano’s writing — long-form
          essays on scripture, doubt, hope, and the ordinary places where faith
          is lived. Written slowly, for reading slowly.
        </p>
      </section>
    </div>
  );
}
