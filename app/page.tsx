const upcomingEvents = [
  {
    name: "LunarCon Panel Block",
    date: "Today, June 8, 2026 · 10:00 UTC",
    organizer: "Player-run convention",
    description:
      "A morning panel slot for community talks, venue previews, contests, and convention announcements.",
  },
  {
    name: "MogTalk Raid Roundtable",
    date: "Today, June 8, 2026 · 13:00 UTC",
    organizer: "MogTalk",
    description:
      "A midday community broadcast discussing raid preparation, progression stories, and team expectations.",
  },
  {
    name: "Crystalline Conflict Community Cup",
    date: "Today, June 8, 2026 · 16:00 UTC",
    organizer: "PvP community",
    description:
      "An afternoon tournament block spotlighting Crystalline Conflict teams, casters, brackets, and match streams.",
  },
  {
    name: "FFXIV Art Party",
    date: "Today, June 8, 2026 · 19:00 UTC",
    organizer: "Artist community",
    description:
      "An evening social gathering where artists draw player characters, trade sketches, and share finished pieces online.",
  },
  {
    name: "Fan Festival Watch Party",
    date: "Today, June 8, 2026 · 22:00 UTC",
    organizer: "Local communities",
    description:
      "A late watch party for keynote highlights, cosplay showcases, concert clips, and live-letter speculation.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090b16] px-6 py-10 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col gap-12">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur sm:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Event planner for Warriors of Light
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            xiv.today
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A simple home base for keeping track of notable Final Fantasy XIV
            community events, tournaments, conventions, and fan gatherings.
          </p>
        </section>

        <section aria-labelledby="upcoming-events" className="flex-1">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                What&apos;s next
              </p>
              <h2 id="upcoming-events" className="mt-2 text-3xl font-bold text-white">
                Upcoming events
              </h2>
            </div>
            <p className="text-sm text-slate-400">Example events for today</p>
          </div>

          <ol className="grid gap-4">
            {upcomingEvents.map((event) => (
              <li
                key={event.name}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition hover:border-cyan-200/50 hover:bg-slate-900"
              >
                <article className="grid gap-4 md:grid-cols-[14rem_1fr] md:items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      {event.date}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">{event.organizer}</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{event.name}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{event.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-white/10 pt-6 text-sm leading-6 text-slate-400">
          <p>
            xiv.today is not affiliated with, endorsed by, sponsored by, or
            otherwise connected to FINAL FANTASY XIV or Square Enix.
          </p>
          <p className="mt-2">© 2026 xiv.today. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
