import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { worlds } from "./schema";

export function listWorlds() {
  return db
    .select()
    .from(worlds)
    .orderBy(asc(worlds.name));
}

export async function worldExists(worldName: string): Promise<boolean> {
  const [world] = await db
    .select({ name: worlds.name })
    .from(worlds)
    .where(eq(worlds.name, worldName))
    .limit(1);

  return Boolean(world);
}
