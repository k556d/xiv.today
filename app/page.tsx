const upcomingEvents = [
  {
    title: "Moogle Treasure Festival community farms",
    date: "June 14, 2026",
    region: "Cross-data center",
    description:
      "Player-led farming parties for tomestones, mounts, and glamours during the recurring treasure-hunt rush.",
  },
  {
    title: "Crystalline Conflict Community Cup watch party",
    date: "June 21, 2026",
    region: "North America",
    description:
      "PvP fans gather to cheer on organized teams and learn strategy from community shoutcasters.",
  },
  {
    title: "Eorzean Symphony listening night",
    date: "July 5, 2026",
    region: "Online",
    description:
      "A casual music appreciation stream celebrating arrangements from across Final Fantasy XIV.",
  },
  {
    title: "The Rising remembrance parade",
    date: "August 27, 2026",
    region: "All worlds",
    description:
      "Free companies and role-play groups march through city-states to mark the anniversary season.",
  },
  {
    title: "Fan Festival community meetup",
    date: "September 12, 2026",
    region: "Las Vegas, NV",
    description:
      "Creator booths, photo meetups, and raid-group reunions inspired by the official Fan Festival tradition.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1224] px-6 py-10 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Community calendar
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            xiv.today
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A simple snapshot of upcoming Final Fantasy XIV community gatherings,
            streams, tournaments, and celebrations.
          </p>
        </section>

        <section className="mt-10 flex-1" aria-labelledby="events-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-200">
                Next up
              </p>
              <h2 id="events-heading" className="mt-2 text-3xl font-semibold text-white">
                Upcoming events
              </h2>
            </div>
            <p className="text-sm text-slate-400">Example listings for early planning.</p>
          </div>

          <ol className="mt-6 grid gap-4">
            {upcomingEvents.map((event) => (
              <li
                key={event.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-200/50 hover:bg-white/[0.08]"
              >
                <article className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-start">
                  <div>
                    <time className="text-lg font-semibold text-cyan-100">{event.date}</time>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">
                      {event.region}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{event.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-slate-400">
          <p>
            xiv.today is a fan-made project and is not affiliated with Final Fantasy XIV,
            Square Enix, or their related companies.
          </p>
          <p className="mt-2">© 2026 xiv.today. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
