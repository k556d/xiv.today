import Link from "next/link";
import styles from "./page.module.css";

const parties = [
  {
    name: "Aster",
    focus: "North-west platform · opener assignments",
    roster: [
      ["Tank", "Warrior", "Rhalen Stormward"],
      ["Healer", "Sage", "Minae Solfaire"],
      ["Healer", "White Mage", "Talia Moonbloom"],
      ["Melee", "Dragoon", "Kaito Ashenstar"],
      ["Melee", "Viper", "Nyx Valeriant"],
      ["Physical Ranged", "Bard", "Pipin Whistlewind"],
      ["Caster", "Pictomancer", "Aurelia Inkheart"],
      ["Tank", "Gunbreaker", "Orion Duskwick"],
    ],
  },
  {
    name: "Beryl",
    focus: "North platform · add control",
    roster: [
      ["Tank", "Paladin", "Cedric Dawnblade"],
      ["Healer", "Scholar", "Luna Nymwright"],
      ["Healer", "Astrologian", "Seren Starfall"],
      ["Melee", "Samurai", "Hanae Redwillow"],
      ["Melee", "Reaper", "Varric Gravesong"],
      ["Physical Ranged", "Machinist", "Tobin Gearhart"],
      ["Caster", "Summoner", "Ember Foxglove"],
      ["Tank", "Dark Knight", "Lucien Roseveil"],
    ],
  },
  {
    name: "Cobalt",
    focus: "North-east platform · interrupt calls",
    roster: [
      ["Tank", "Dark Knight", "Maelis Nightforge"],
      ["Healer", "White Mage", "Iris Cloudwater"],
      ["Healer", "Sage", "Veda Brightneedle"],
      ["Melee", "Monk", "Riku Ironpalm"],
      ["Melee", "Ninja", "Sable Quickstep"],
      ["Physical Ranged", "Dancer", "Faye Sunspoke"],
      ["Caster", "Pictomancer", "Momo Prismleaf"],
      ["Tank", "Warrior", "Dorian Voidquill"],
    ],
  },
  {
    name: "Dawn",
    focus: "South-east platform · tower soaks",
    roster: [
      ["Tank", "Gunbreaker", "Bram Triggerfall"],
      ["Healer", "Astrologian", "Noelle Skyscribe"],
      ["Healer", "Scholar", "Perrin Tomevale"],
      ["Melee", "Viper", "Zara Twinstrike"],
      ["Melee", "Dragoon", "Elios Wyverncall"],
      ["Physical Ranged", "Bard", "Clover Highnote"],
      ["Caster", "Red Mage", "Sylas Vermillion"],
      ["Tank", "Paladin", "Nia Carbuncle"],
    ],
  },
  {
    name: "Ember",
    focus: "South platform · rescue and recovery",
    roster: [
      ["Tank", "Warrior", "Garrick Oakbreaker"],
      ["Healer", "Sage", "Althea Noulith"],
      ["Healer", "White Mage", "Marin Lilybell"],
      ["Melee", "Reaper", "Cyrus Blackthorn"],
      ["Melee", "Samurai", "Renji Silverreed"],
      ["Physical Ranged", "Machinist", "Poppy Brassbolt"],
      ["Caster", "Black Mage", "Vesper Coalheart"],
      ["Tank", "Gunbreaker", "Juniper Palette"],
    ],
  },
  {
    name: "Frost",
    focus: "South-west platform · flex replacements",
    roster: [
      ["Tank", "Paladin", "Leontius Lightguard"],
      ["Healer", "Scholar", "Edda Codexborn"],
      ["Healer", "Astrologian", "Siona Celestine"],
      ["Melee", "Ninja", "Tatsu Shadowfern"],
      ["Melee", "Monk", "Mira Stonefist"],
      ["Physical Ranged", "Dancer", "Lottie Ribbonstep"],
      ["Caster", "Summoner", "Rhea Egiwhisper"],
      ["Tank", "Dark Knight", "Theo Scarlet"],
    ],
  },
];

const timeline = [
  ["19:00", "Raid lead opens voice lobby, confirms 48 signups, reserves, ciphers, and knowledge level 20 access."],
  ["19:10", "Six party leads split groups, post markers, and confirm each party has two tanks and two healers."],
  ["19:20", "Instance scout calls a fresh South Horn. Players enter, sync parties, and gather at the pavilion."],
  ["19:35", "Auroral Mirage window: everyone checks food, potions, phantom actions, and right-of-entry status."],
  ["19:40", "Forked Tower pull. First attempt is treated as a UI-realistic planned event, not a guaranteed clear."],
];

const roleSummary = [
  ["Tanks", "12", "Two per party for boss positioning, busters, add pickup, and emergency mitigation calls."],
  ["Healers", "12", "Two per party for raidwide recovery, limited-raise triage, shields, and platform stability."],
  ["Melee DPS", "12", "Two per party for burst windows, priority target damage, and close-range mechanic coverage."],
  ["Physical ranged DPS", "6", "One per party for mobile uptime, mitigation support, and movement-heavy assignments."],
  ["Casters", "6", "One per party for sustained damage, raise-capable coverage where available, and burst planning."],
];

export default function ForkedTowerEventPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link
          href="/"
          className={styles.backLink}
        >
          ← Back to today&apos;s events
        </Link>

        <section className={styles.hero}>
          <div>
            <p className={styles.heroKicker}>
              Planned field operation
            </p>
            <h1 className={styles.heroTitle}>
              The Forked Tower: Blood
            </h1>
            <p className={styles.heroLead}>
              A sample 48-player FFXIV event page for an Occult Crescent raid night.
              The signup is intentionally filled with generated player names so the UI
              can be reviewed as if this were a real scheduled run.
            </p>
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt className={styles.statLabel}>When</dt>
              <dd className={styles.statValue}>Tonight · 19:00 UTC</dd>
            </div>
            <div>
              <dt className={styles.statLabel}>Scale</dt>
              <dd className={styles.statValue}>48 players · 6 full parties</dd>
            </div>
            <div>
              <dt className={styles.statLabel}>Status</dt>
              <dd className={styles.readyValue}>Ready check pending</dd>
            </div>
            <div>
              <dt className={styles.statLabel}>PF password</dt>
              <dd className={styles.passwordValueBlock}>0420</dd>
            </div>
          </dl>
        </section>

        <section className={styles.summaryGrid} aria-label="Role summary">
          {roleSummary.map(([role, count, note]) => (
            <article key={role} className={styles.summaryCard}>
              <p className={styles.summaryRole}>{role}</p>
              <p className={styles.summaryCount}>{count}</p>
              <p className={styles.summaryNote}>{note}</p>
            </article>
          ))}
        </section>

        <section className={styles.detailGrid}>
          <article className={styles.passwordCard}>
            <p className={styles.passwordKicker}>Party Finder access</p>
            <h2 className={styles.passwordTitle}>
              Password: <span className={styles.passwordValue}>0420</span>
            </h2>
            <p className={styles.passwordLead}>
              The organizer will list the first recruitment party in FFXIV Party
              Finder with this four-digit password. Join that listing first, then
              wait for party leads to distribute players into the six planned
              groups before entering the Occult Crescent instance.
            </p>
          </article>

          <article className={styles.timelineCard}>
            <p className={styles.timelineKicker}>Run timeline</p>
            <h2 className={styles.timelineTitle}>Tonight&apos;s plan</h2>
            <ol className={styles.timelineList}>
              {timeline.map(([time, item]) => (
                <li key={time} className={styles.timelineItem}>
                  <time className={styles.timelineTime}>{time}</time>
                  <p className={styles.timelineText}>{item}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className={styles.noteCard}>
            <p className={styles.noteKicker}>Composition note</p>
            <h2 className={styles.noteTitle}>Balanced, readable, and flexible</h2>
            <p className={styles.noteText}>
              Forked Tower parties can be flexible, but this mock setup uses a familiar
              two-tank, two-healer, four-DPS structure in each group. That makes party
              health easy to scan, gives every platform dedicated recovery, and keeps
              assignments simple while the UI is still being prototyped.
            </p>
          </article>
        </section>

        <section aria-labelledby="party-rosters">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Roster</p>
              <h2 id="party-rosters" className={styles.sectionTitle}>48 signed players</h2>
            </div>
            <p className={styles.sectionMeta}>Generated names for prototype data</p>
          </div>

          <div className={styles.partyGrid}>
            {parties.map((party) => (
              <article key={party.name} className={styles.partyCard}>
                <div className={styles.partyHeader}>
                  <div>
                    <h3 className={styles.partyName}>Party {party.name}</h3>
                    <p className={styles.partyFocus}>{party.focus}</p>
                  </div>
                  <span className={styles.partyReady}>
                    8/8 ready
                  </span>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead className={styles.tableHead}>
                      <tr>
                        <th className={styles.tableHeadCell}>Role</th>
                        <th className={styles.tableHeadCell}>Job</th>
                        <th className={styles.tableHeadCell}>Player</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {party.roster.map(([role, job, player]) => (
                        <tr key={player} className={styles.tableRow}>
                          <td className={styles.roleCell}>{role}</td>
                          <td className={styles.jobCell}>{job}</td>
                          <td className={styles.playerCell}>{player}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p>
            xiv.today is not affiliated with, endorsed by, sponsored by, or otherwise
            connected to FINAL FANTASY XIV or Square Enix.
          </p>
        </footer>
      </div>
    </main>
  );
}
