import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events, users } from "./schema";

const seed = async () => {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });

  const organizers = [
    {
      id: "player-run-convention",
      username: "Player-run convention",
    },
    {
      id: "mogtalk",
      username: "MogTalk",
    },
    {
      id: "pvp-community",
      username: "PvP community",
    },
    {
      id: "artist-community",
      username: "Artist community",
    },
    {
      id: "local-communities",
      username: "Local communities",
    },
  ];

  const rows = [
    {
      name: "LunarCon Panel Block",
      date: "Today, June 8, 2026 · 10:00 UTC",
      organizerId: "player-run-convention",
      description:
        "A morning panel slot for community talks, venue previews, contests, and convention announcements.",
    },
    {
      name: "MogTalk Raid Roundtable",
      date: "Today, June 8, 2026 · 13:00 UTC",
      organizerId: "mogtalk",
      description:
        "A midday community broadcast discussing raid preparation, progression stories, and team expectations.",
    },
    {
      name: "Crystalline Conflict Community Cup",
      date: "Today, June 8, 2026 · 16:00 UTC",
      organizerId: "pvp-community",
      description:
        "An afternoon tournament block spotlighting Crystalline Conflict teams, casters, brackets, and match streams.",
    },
    {
      name: "FFXIV Art Party",
      date: "Today, June 8, 2026 · 19:00 UTC",
      organizerId: "artist-community",
      description:
        "An evening social gathering where artists draw player characters, trade sketches, and share finished pieces online.",
    },
    {
      name: "Fan Festival Watch Party",
      date: "Today, June 8, 2026 · 22:00 UTC",
      organizerId: "local-communities",
      description:
        "A late watch party for keynote highlights, cosplay showcases, concert clips, and live-letter speculation.",
    },
  ];

  console.log("Seeding events…");
  await db.insert(users).values(organizers);
  await db.insert(events).values(rows);
  console.log(`Inserted ${rows.length} events.`);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
