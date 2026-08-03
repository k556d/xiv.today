import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { worlds, users, characters, events } from "./schema";

const worldSeedGroups = [
  {
    names: ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
    dataCenter: "Aether",
  },
  {
    names: ["Cerberus", "Louisoix", "Moogle", "Omega", "Phantom", "Ragnarok", "Sagittarius", "Spriggan"],
    dataCenter: "Chaos",
  },
  {
    names: ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"],
    dataCenter: "Crystal",
  },
  {
    names: ["Cuchulainn", "Golem", "Halicarnassus", "Kraken", "Maduin", "Marilith", "Rafflesia", "Seraph"],
    dataCenter: "Dynamis",
  },
  {
    names: ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Tonberry", "Typhon"],
    dataCenter: "Elemental",
  },
  {
    names: ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima"],
    dataCenter: "Gaia",
  },
  {
    names: ["Alpha", "Lich", "Odin", "Phoenix", "Raiden", "Shiva", "Twintania", "Zodiark"],
    dataCenter: "Light",
  },
  {
    names: ["Anima", "Asura", "Chocobo", "Hades", "Ixion", "Masamune", "Pandaemonium", "Titan"],
    dataCenter: "Mana",
  },
  {
    names: ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"],
    dataCenter: "Materia",
  },
  {
    names: ["Belias", "Mandragora", "Ramuh", "Shinryu", "Unicorn", "Valefor", "Yojimbo", "Zeromus"],
    dataCenter: "Meteor",
  },
  {
    names: ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
    dataCenter: "Primal",
  },
] as const;

const worldsSeed = worldSeedGroups.flatMap((group) =>
  group.names.map((name) => ({ name, dataCenter: group.dataCenter })),
);

const usersSeed = [
  { id: "seed-auri-kha" },
  { id: "seed-sena-velle" },
  { id: "seed-mihli-tia" },
  { id: "seed-nono-nono" },
];

const charactersSeed = [
  {
    id: "seed-auri-kha",
    userId: "seed-auri-kha",
    name: "Auri Kha",
    worldName: "Gilgamesh",
    avatarUrl: createSeedAvatarUrl("auri-kha"),
  },
  {
    id: "seed-sena-velle",
    userId: "seed-sena-velle",
    name: "Sena Velle",
    worldName: "Moogle",
    avatarUrl: createSeedAvatarUrl("sena-velle"),
  },
  {
    id: "seed-mihli-tia",
    userId: "seed-mihli-tia",
    name: "Mihli Tia",
    worldName: "Cactuar",
    avatarUrl: createSeedAvatarUrl("mihli-tia"),
  },
  {
    id: "seed-mihli-rai",
    userId: "seed-mihli-tia",
    name: "Mihli Rai",
    worldName: "Siren",
    avatarUrl: createSeedAvatarUrl("mihli-rai"),
  },
  {
    id: "seed-nono-nono",
    userId: "seed-nono-nono",
    name: "Nono Nono",
    worldName: "Phoenix",
    avatarUrl: createSeedAvatarUrl("nono-nono"),
  },
];

const eventsSeed = [
  {
    id: "seed-dsr-prog",
    organizerId: "seed-auri-kha",
    name: "Dragonsong's Reprise (Ultimate) progression",
    date: "Saturday, July 18, 2026 · 18:00 UTC",
    description: "Eight-player static practice through Nidhogg with a focus on consistent Dive from Grace execution.",
  },
  {
    id: "seed-eden-promise-reclear",
    organizerId: "seed-sena-velle",
    name: "Eden's Promise: Eternity (Savage) reclear",
    date: "Sunday, July 19, 2026 · 16:00 UTC",
    description: "Weekly E12S reclear for mounts, books, and a clean run through Oracle of Darkness.",
  },
  {
    id: "seed-alphascape-savage",
    organizerId: "seed-mihli-tia",
    name: "Alphascape V4.0 (Savage) mount farm",
    date: "Tuesday, July 21, 2026 · 19:00 UTC",
    description: "Unsynced O12S clears for the Omega mount with a short mechanic refresher before pulls.",
  },
  {
    id: "seed-blue-mage-log",
    organizerId: "seed-mihli-rai",
    name: "Blue Mage Log: The Final Coil of Bahamut - Turn 4",
    date: "Thursday, July 23, 2026 · 17:00 UTC",
    description: "Blue Mage prime target practice for a full party with the required spells and level sync enabled.",
  },
  {
    id: "seed-masked-carnivale",
    organizerId: "seed-nono-nono",
    name: "Masked Carnivale weekly target help",
    date: "Friday, July 24, 2026 · 20:00 UTC",
    description: "Blue Mage group session for weekly targets, spell learning, and Carnivale strategy questions.",
  },
];

function createSeedAvatarUrl(seed: string) {
  const letters = seed.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "X";
  const hash = Array.from(seed).reduce((accumulator, character) => {
    return (Math.imul(accumulator ^ character.charCodeAt(0), 16777619) >>> 0);
  }, 2166136261);
  const hue = hash % 360;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue} 55% 42%)" />
          <stop offset="100%" stop-color="hsl(${(hue + 32) % 360} 55% 26%)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#g)" />
      <text x="32" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="white">${letters}</text>
    </svg>
  `)}`;
}

const seed = async () => {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });

  console.log("Seeding worlds…");
  await db.insert(worlds).values(worldsSeed);

  console.log("Seeding users…");
  await db.insert(users).values(usersSeed);

  console.log("Seeding characters…");
  await db.insert(characters).values(charactersSeed);

  console.log("Seeding events…");
  await db.insert(events).values(eventsSeed);
  console.log(`Inserted ${eventsSeed.length} events.`);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
