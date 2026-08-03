import Link from "next/link";
import { db } from "@/server/db";
import CharacterSelectLink from "@/components/CharacterSelectLink";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const forkedTowerHref = "/events/forked-tower";

export default async function Home() {
  const upcomingEvents = await db.query.events.findMany({
    with: {
      organizer: true,
    },
  });

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.kicker}>
            Event planner for Warriors of Light
          </p>
          <h1 className={styles.title}>
            xiv.today
          </h1>
          <p className={styles.lead}>
            A simple home base for keeping track of notable Final Fantasy XIV
            community events, tournaments, conventions, and fan gatherings.
          </p>
          <div>
            <CharacterSelectLink />
          </div>
        </section>

        <section aria-labelledby="upcoming-events" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>
                What&apos;s next
              </p>
              <h2 id="upcoming-events" className={styles.sectionTitle}>
                Upcoming events
              </h2>
            </div>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className={styles.emptyState}>
              No upcoming events. Check back later!
            </p>
          ) : (
            <ol className={styles.list}>
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={forkedTowerHref}
                    className={styles.eventLink}
                  >
                    <article className={styles.eventArticle}>
                      <div>
                        <p className={styles.eventMetaKicker}>
                          {event.date}
                        </p>
                        <p className={styles.eventOrganizer}>
                          {event.organizer?.name ?? event.organizerId}
                        </p>
                      </div>
                      <div>
                        <div className={styles.eventHeading}>
                          <h3 className={styles.eventName}>{event.name}</h3>
                          <span className={styles.eventBadge}>
                            View plan
                          </span>
                        </div>
                        <p className={styles.eventDescription}>{event.description}</p>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className={styles.footer}>
          <p>
            xiv.today is not affiliated with, endorsed by, sponsored by, or
            otherwise connected to FINAL FANTASY XIV or Square Enix.
          </p>
          <p className={styles.footerSpacing}>© 2026 xiv.today. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
