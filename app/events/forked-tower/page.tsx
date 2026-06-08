import Link from "next/link";

const parties = [
  {
    name: "Aster",
    focus: "North-west platform · opener assignments",
    roster: [
      ["Shield", "Warrior", "Rhalen Stormward"],
      ["Healer", "Sage", "Minae Solfaire"],
      ["Healer", "White Mage", "Talia Moonbloom"],
      ["Melee", "Dragoon", "Kaito Ashenstar"],
      ["Melee", "Viper", "Nyx Valeriant"],
      ["Physical Ranged", "Bard", "Pipin Whistlewind"],
      ["Caster", "Pictomancer", "Aurelia Inkheart"],
      ["Caster", "Black Mage", "Orion Duskwick"],
    ],
  },
  {
    name: "Beryl",
    focus: "North platform · add control",
    roster: [
      ["Shield", "Paladin", "Cedric Dawnblade"],
      ["Healer", "Scholar", "Luna Nymwright"],
      ["Healer", "Astrologian", "Seren Starfall"],
      ["Melee", "Samurai", "Hanae Redwillow"],
      ["Melee", "Reaper", "Varric Gravesong"],
      ["Physical Ranged", "Machinist", "Tobin Gearhart"],
      ["Caster", "Summoner", "Ember Foxglove"],
      ["Caster", "Red Mage", "Lucien Roseveil"],
    ],
  },
  {
    name: "Cobalt",
    focus: "North-east platform · interrupt calls",
    roster: [
      ["Shield", "Dark Knight", "Maelis Nightforge"],
      ["Healer", "White Mage", "Iris Cloudwater"],
      ["Healer", "Sage", "Veda Brightneedle"],
      ["Melee", "Monk", "Riku Ironpalm"],
      ["Melee", "Ninja", "Sable Quickstep"],
      ["Physical Ranged", "Dancer", "Faye Sunspoke"],
      ["Caster", "Pictomancer", "Momo Prismleaf"],
      ["Caster", "Black Mage", "Dorian Voidquill"],
    ],
  },
  {
    name: "Dawn",
    focus: "South-east platform · tower soaks",
    roster: [
      ["Shield", "Gunbreaker", "Bram Triggerfall"],
      ["Healer", "Astrologian", "Noelle Skyscribe"],
      ["Healer", "Scholar", "Perrin Tomevale"],
      ["Melee", "Viper", "Zara Twinstrike"],
      ["Melee", "Dragoon", "Elios Wyverncall"],
      ["Physical Ranged", "Bard", "Clover Highnote"],
      ["Caster", "Red Mage", "Sylas Vermillion"],
      ["Caster", "Summoner", "Nia Carbuncle"],
    ],
  },
  {
    name: "Ember",
    focus: "South platform · rescue and recovery",
    roster: [
      ["Shield", "Warrior", "Garrick Oakbreaker"],
      ["Healer", "Sage", "Althea Noulith"],
      ["Healer", "White Mage", "Marin Lilybell"],
      ["Melee", "Reaper", "Cyrus Blackthorn"],
      ["Melee", "Samurai", "Renji Silverreed"],
      ["Physical Ranged", "Machinist", "Poppy Brassbolt"],
      ["Caster", "Black Mage", "Vesper Coalheart"],
      ["Caster", "Pictomancer", "Juniper Palette"],
    ],
  },
  {
    name: "Frost",
    focus: "South-west platform · flex replacements",
    roster: [
      ["Shield", "Paladin", "Leontius Lightguard"],
      ["Healer", "Scholar", "Edda Codexborn"],
      ["Healer", "Astrologian", "Siona Celestine"],
      ["Melee", "Ninja", "Tatsu Shadowfern"],
      ["Melee", "Monk", "Mira Stonefist"],
      ["Physical Ranged", "Dancer", "Lottie Ribbonstep"],
      ["Caster", "Summoner", "Rhea Egiwhisper"],
      ["Caster", "Red Mage", "Theo Scarlet"],
    ],
  },
];

const timeline = [
  ["19:00", "Raid lead opens voice lobby, confirms 48 signups, reserves, ciphers, and knowledge level 20 access."],
  ["19:10", "Six party leads split groups, post markers, and confirm each party has one tank and two healers."],
  ["19:20", "Instance scout calls a fresh South Horn. Players enter, sync parties, and gather at the pavilion."],
  ["19:35", "Auroral Mirage window: everyone checks food, potions, phantom actions, and right-of-entry status."],
  ["19:40", "Forked Tower pull. First attempt is treated as a UI-realistic planned event, not a guaranteed clear."],
];

const roleSummary = [
  ["Tanks", "6", "One per party for boss positioning, busters, add pickup, and emergency mitigation calls."],
  ["Healers", "12", "Two per party for raidwide recovery, limited-raise triage, shields, and platform stability."],
  ["Melee DPS", "12", "Two per party for burst windows, priority target damage, and close-range mechanic coverage."],
  ["Physical ranged DPS", "6", "One per party for mobile uptime, mitigation support, and movement-heavy assignments."],
  ["Casters", "12", "Two per party for sustained damage, raise-capable coverage where available, and burst planning."],
];

export default function ForkedTowerEventPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#41246d_0,#111827_35%,#060711_72%)] px-6 py-8 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link
          href="/"
          className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-200/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          ← Back to today&apos;s events
        </Link>

        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-purple-950/40 backdrop-blur md:grid-cols-[1.25fr_0.75fr] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-200">
              Planned field operation
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              The Forked Tower: Blood
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              A sample 48-player FFXIV event page for an Occult Crescent raid night.
              The signup is intentionally filled with generated player names so the UI
              can be reviewed as if this were a real scheduled run.
            </p>
          </div>
          <dl className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">When</dt>
              <dd className="mt-1 text-xl font-semibold text-white">Tonight · 19:00 UTC</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Scale</dt>
              <dd className="mt-1 text-xl font-semibold text-white">48 players · 6 parties</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</dt>
              <dd className="mt-1 text-xl font-semibold text-emerald-200">Ready check pending</dd>
            </div>
          </dl>
        </section>

        <section className="grid gap-4 md:grid-cols-5" aria-label="Role summary">
          {roleSummary.map(([role, count, note]) => (
            <article key={role} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">{role}</p>
              <p className="mt-3 text-4xl font-bold text-white">{count}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Run timeline</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Tonight&apos;s plan</h2>
            <ol className="mt-6 grid gap-4">
              {timeline.map(([time, item]) => (
                <li key={time} className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <time className="font-mono text-sm font-semibold text-pink-200">{time}</time>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Composition note</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Balanced, readable, and flexible</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Forked Tower parties can be flexible, but this mock setup uses a familiar
              one-tank, two-healer, five-DPS structure in each group. That makes party
              health easy to scan, gives every platform dedicated recovery, and keeps
              assignments simple while the UI is still being prototyped.
            </p>
          </article>
        </section>

        <section aria-labelledby="party-rosters">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Roster</p>
              <h2 id="party-rosters" className="mt-2 text-3xl font-bold text-white">48 signed players</h2>
            </div>
            <p className="text-sm text-slate-400">Generated names for prototype data</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {parties.map((party) => (
              <article key={party.name} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Party {party.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{party.focus}</p>
                  </div>
                  <span className="mt-2 w-fit rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 sm:mt-0">
                    8/8 ready
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Job</th>
                        <th className="px-4 py-3 font-semibold">Player</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {party.roster.map(([role, job, player]) => (
                        <tr key={player} className="bg-slate-950/30">
                          <td className="px-4 py-3 text-cyan-100">{role}</td>
                          <td className="px-4 py-3 text-slate-300">{job}</td>
                          <td className="px-4 py-3 font-semibold text-white">{player}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 pb-2 pt-6 text-sm leading-6 text-slate-400">
          <p>
            xiv.today is not affiliated with, endorsed by, sponsored by, or otherwise
            connected to FINAL FANTASY XIV or Square Enix.
          </p>
        </footer>
      </div>
    </main>
  );
}
