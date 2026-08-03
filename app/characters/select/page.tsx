import { unauthorized } from "next/navigation";
import CharacterLookupSearch from "@/components/CharacterLookupSearch";
import { getCurrentUser } from "@/server/current-user";
import { listWorlds } from "@/server/db/worlds";
import { searchLodestoneCharacters, type LodestoneCharacterSearchResult } from "@/server/lodestone";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function CharacterSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string | string[]; world?: string | string[] }>;
}) {
  const session = await getCurrentUser();

  if (!session) {
    unauthorized();
  }

  const params = await searchParams;
  const name = typeof params.name === "string" ? params.name.trim() : "";
  const world = typeof params.world === "string" ? params.world.trim() : "";
  const worldRows = await listWorlds();
  const lookup = name && world
    ? await searchLodestoneCharacters(name, world)
      .then((results) => ({ results, error: null }))
      .catch(() => ({ results: [] as LodestoneCharacterSearchResult[], error: "Lookup failed." }))
    : { results: [] as LodestoneCharacterSearchResult[], error: null };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <CharacterLookupSearch
          key={`${name}:${world}`}
          worlds={worldRows.map((row) => row.name)}
          initialName={name}
          initialWorld={world}
          initialResults={lookup.results}
          initialError={lookup.error}
        />
      </div>
    </main>
  );
}
