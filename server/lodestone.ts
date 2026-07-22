import { JSDOM } from "jsdom";

const errors = {
  invalidProfileUrl: "Invalid Lodestone profile URL.",
  profileRequestFailed: (status: number) => `Lodestone profile request failed with ${status}`,
  searchRequestFailed: (status: number) => `Lodestone request failed with ${status}`,
} as const;

export type LodestoneCharacterSearchResult = {
  id: string;
  name: string;
  world: string;
  avatarUrl: string | null;
  profileUrl: string;
};

function getSearchUrl(name: string, world: string) {
  const params = new URLSearchParams({ q: name, worldname: world });
  return `https://na.finalfantasyxiv.com/lodestone/character/?${params.toString()}`;
}

function cleanText(value: string) {
  return value.trim().split(/\s+/).join(" ");
}

function parseWorld(value: string) {
  return cleanText(value).replace(/\s*\[[^\]]+\]$/, "");
}

export async function searchLodestoneCharacters(name: string, world: string) {
  const response = await fetch(getSearchUrl(name, world), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(errors.searchRequestFailed(response.status));
  }

  const html = await response.text();
  const document = new JSDOM(html).window.document;
  const results = new Map<string, LodestoneCharacterSearchResult>();
  const resultCards = Array.from(document.querySelectorAll("div.ldst__window > div.entry"));

  if (resultCards.length === 0) {
    return [];
  }

  for (const card of resultCards) {
    const link = card.querySelector('a[href^="/lodestone/character/"]');
    if (!link) {
      continue;
    }

    const href = link.getAttribute("href");

    if (!href) {
      continue;
    }

    const parts = href.split("/").filter(Boolean);
    const id = parts.at(-1) ?? "";

    if (!id || results.has(id)) {
      continue;
    }

    const avatarUrl = link.querySelector("img")?.getAttribute("src") ?? null;
    const nameNode = card.querySelector(".entry__name, .character__name") ?? link;
    const worldNode = card.querySelector(".entry__world, .character__world");
    const resolvedName = cleanText(nameNode.textContent ?? "") || "Unknown character";
    const resolvedWorld = parseWorld(worldNode?.textContent ?? "") || world;

    results.set(id, {
      id,
      name: resolvedName,
      world: resolvedWorld,
      avatarUrl,
      profileUrl: `https://na.finalfantasyxiv.com${href}`,
    });
  }

  return [...results.values()];
}

function getProfileUrl(profileUrl: string) {
  const url = new URL(profileUrl);

  if (url.hostname !== "na.finalfantasyxiv.com") {
    throw new Error(errors.invalidProfileUrl);
  }

  if (!/^\/lodestone\/character\/\d+\/?$/.test(url.pathname)) {
    throw new Error(errors.invalidProfileUrl);
  }

  return url.toString();
}

export async function verifyLodestoneCharacterCode(profileUrl: string, code: string) {
  const response = await fetch(getProfileUrl(profileUrl), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(errors.profileRequestFailed(response.status));
  }

  const html = await response.text();
  const document = new JSDOM(html).window.document;
  const text = document.body.textContent ?? "";
  const matched = text.includes(code);

  return {
    matched,
    profileUrl: response.url,
  };
}
