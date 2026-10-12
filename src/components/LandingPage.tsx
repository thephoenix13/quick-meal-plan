interface LandingPageProps {
  onGetStarted: (version: 'v1' | 'v2') => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <main className="flex min-h-screen items-center bg-white px-6 py-16">
      <section aria-labelledby="experience-heading" className="mx-auto w-full max-w-4xl">
        <h1
          id="experience-heading"
          className="mb-12 text-center text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl"
        >
          Choose your experience
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <article className="flex flex-col rounded-xl border border-gray-200 p-7 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900">Quick form</h2>
            <p className="mt-3 flex-1 text-base leading-relaxed text-gray-600">
              Fill out a single form with your details and generate a meal plan.
            </p>
            <button
              type="button"
              onClick={() => onGetStarted('v1')}
              className="mt-7 min-h-12 w-full rounded-lg bg-gray-900 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Start quick form
            </button>
          </article>

          <article className="flex flex-col rounded-xl border border-gray-200 p-7 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900">Guided onboarding</h2>
            <p className="mt-3 flex-1 text-base leading-relaxed text-gray-600">
              Answer guided questions to build a more detailed profile.
            </p>
            <button
              type="button"
              onClick={() => onGetStarted('v2')}
              className="mt-7 min-h-12 w-full rounded-lg bg-gray-900 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Start guided onboarding
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
