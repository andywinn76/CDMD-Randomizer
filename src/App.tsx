import React, { useEffect, useMemo, useRef, useState } from "react";
import { CHARACTERS } from "./CHARACTERS";
import { SCENARIOS } from "./SCENARIOS";
import { OLD_ONES } from "./OLD_ONES";
import { COLLECTION } from "./COLLECTION";
import SectionTitle from "./assets/components/SectionTitle";
import ResultCard from "./assets/components/ResultCard";

/**
 * Cthulhu: Death May Die — Randomizer
 * -----------------------------------------------------
 * Stack: React + TypeScript + TailwindCSS
 * Deploy: Vercel
*
* This single-file version is meant for quick preview. In a real project you'll
* split types, data, hooks, and components into separate files.
*
* ✅ What it does
* - Lets users pick what content (Seasons/Expansions) they own
* - Persists their collection in localStorage
* - Lets users choose which categories to randomize (Character, Old One, Scenario)
* - Generates random results filtered by owned content
* - Shows where each result comes from (Season/Expansion)
*
 * 🧩 What you’ll likely add later
 * - Full data set (all Seasons, Expansions, characters, Old Ones, scenarios)
 * - Random Monsters option
 * - Shareable links, advanced filters, multiple result rolls, etc.
*/

/*************************
 *  TypeScript: Types
*************************/

type ID = string;

type SeasonNumber = 1 | 2 | 3 | 4 | 5 | 6 | string;

type CollectionType = "season" | "expansion";

type PlayerCount = 1 | 2 | 3 | 4;

type CharacterSlot = {
  slotId: string; // stable key
  playerLabel: string; // "Player 1", "Player 2", etc. For solo, you can do "Player 1 (A/B)"
  locked: boolean; // "Keep"
  value: Character | null;
};

const LS_KEYS = {
  owned: "cddmd_owned_collection_v1",
  players: "cddmd_player_count_v1",
};

export interface CollectionItem {
  id: ID; // unique key like "S1" or "EXP_S1_BLACK_GOAT"
  name: string;
  season: SeasonNumber; // which season box this belongs to (for expansions too)
  type: CollectionType;
}

export interface Character {
  id: ID;
  name: string;
  shortName?: string; // optional shorter name for tight spaces
  expansionId: ID; // which Season/Expansion box it comes from
}

export interface OldOne {
  id: ID;
  name: string;
  expansionId: ID;
}

export interface Scenario {
  id: ID;
  name: string;
  // Some scenarios are in the core Season box, some in expansions
  expansionId: ID;
  description: string;
}

const characterPool = CHARACTERS.filter((c) => owned.includes(c.expansionId));
const oldOnePool = OLD_ONES.filter((o) => owned.includes(o.expansionId));
const scenarioPool = SCENARIOS.filter((s) => owned.includes(s.expansionId));

/*************************
 *  Utils
*************************/

function getCollectionById(id: ID): CollectionItem | undefined {
  return COLLECTION.find((c) => c.id === id);
}

function makeCharacterSlots(players: PlayerCount): CharacterSlot[] {
  const count = players === 1 ? 2 : players;

  // labels: solo gets Player 1A / 1B; otherwise Player 1..4
  if (players === 1) {
    return [
      { slotId: "P1A", playerLabel: "Solo Character 1", locked: false, value: null },
      { slotId: "P1B", playerLabel: "Solo Character 2", locked: false, value: null },
    ];
  }

  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return { slotId: `P${n}`, playerLabel: `Player ${n}`, locked: false, value: null };
  });
}

function pickRandomFrom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] ?? null;
}

/**
 * Roll characters for unlocked slots, trying to avoid duplicates.
 * - Keeps locked slot values as-is
 * - Ensures no duplicates among locked + newly rolled, if possible
 */
function rollCharacterSlots(slots: CharacterSlot[], pool: Character[]): CharacterSlot[] {
  // gather already-taken ids from locked slots
  const taken = new Set<string>();
  for (const s of slots) {
    if (s.locked && s.value && pool.some((c) => c.id === s.value!.id)) {
      taken.add(s.value.id);
    }
  }

  // make a mutable "available" list excluding taken
  let available = pool.filter((c) => !taken.has(c.id));

  return slots.map((slot) => {
    if (slot.locked) return slot;

    // If we run out (tiny pool), fall back to full pool (duplicates possible)
    const source = available.length ? available : pool;
    const next = pickRandomFrom(source);

    // If we successfully picked from available, remove it to keep uniqueness
    if (next && available.length) {
      available = available.filter((c) => c.id !== next.id);
    }

    return { ...slot, value: next };
  });
}

// Generic localStorage hook with TypeScript safety
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // no-op: storage might be unavailable
    }
  }, [key, value]);
  
  return [value, setValue] as const;
}

/*************************
 *  UI Bits
 *************************/

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full border px-2.5 py-0.5 text-xs text-slate-300">{children}</span>;
}

/*************************
 *  Main App
 *************************/

export default function App() {
  const [owned, setOwned] = useLocalStorage<ID[]>(LS_KEYS.owned, ["S1", "S2", "S3", "S4"]);
  const [playerCount, setPlayerCount] = useLocalStorage<PlayerCount>(LS_KEYS.players, 1);

  const [characterSlots, setCharacterSlots] = useState<CharacterSlot[]>(() => makeCharacterSlots(playerCount));

  const [oldOneLocked, setOldOneLocked] = useState(false);
  const [scenarioLocked, setScenarioLocked] = useState(false);

  const [resultOldOne, setResultOldOne] = useState<OldOne | null>(null);
  const [resultScenario, setResultScenario] = useState<Scenario | null>(null);

  function updatePlayerCount(next: PlayerCount) {
    setPlayerCount(next);

    setCharacterSlots((prev) => {
      const nextSlots = makeCharacterSlots(next);

      // preserve existing slot values/locks where slotId matches
      const prevById = new Map(prev.map((s) => [s.slotId, s]));
      return nextSlots.map((s) => {
        const old = prevById.get(s.slotId);
        return old ? { ...s, locked: old.locked, value: old.value } : s;
      });
    });
  }

  // Simple randomizer
  function randomizeAll() {
    // Characters: roll only unlocked slots
    setCharacterSlots((prev) => rollCharacterSlots(prev, characterPool));

    // Old One: roll only if not locked
    if (!oldOneLocked) setResultOldOne(pickRandomFrom(oldOnePool));

    // Scenario: roll only if not locked
    if (!scenarioLocked) setResultScenario(pickRandomFrom(scenarioPool));
  }

  // UI helpers

  function toggleOwned(id: ID) {
    setOwned((prev) => {
      const isRemoving = prev.includes(id);
      const nextOwned = isRemoving ? prev.filter((x) => x !== id) : [...prev, id];

      if (isRemoving) {
        setCharacterSlots((slots) => slots.map((s) => (s.value?.expansionId === id ? { ...s, value: null, locked: false } : s)));

        setResultOldOne((prevOld) => {
          const shouldClear = prevOld?.expansionId === id;
          if (shouldClear) setOldOneLocked(false);
          return shouldClear ? null : prevOld;
        });

        setResultScenario((prevScn) => {
          const shouldClear = prevScn?.expansionId === id;
          if (shouldClear) setScenarioLocked(false);
          return shouldClear ? null : prevScn;
        });
      }

      return nextOwned;
    });
  }

  function setAllOwned(next: boolean) {
    const nextOwned = next ? COLLECTION.map((c) => c.id) : [];
    setOwned(nextOwned);
    purgeResultsForOwned(nextOwned);
  }

  function formatScenarioTag(id: string): string | null {
    // Match patterns like S1E1, S10E3, etc.
    const match = id.match(/^S(\d+)E(\d+)$/);
    if (!match) return null;

    const [, season, episode] = match;
    return `S${season}E${episode}`;
  }

  const resetRef = useRef<HTMLButtonElement | null>(null);

  function resetResults() {
    setCharacterSlots((prev) => prev.map((s) => ({ ...s, value: null, locked: false })));
    setResultOldOne(null);
    setOldOneLocked(false);
    setResultScenario(null);
    setScenarioLocked(false);
  }
  
  function purgeResultsForOwned(nextOwned: ID[]) {
    setCharacterSlots((slots) => slots.map((s) => (s.value && !nextOwned.includes(s.value.expansionId) ? { ...s, value: null, locked: false } : s)));

    setResultOldOne((prev) => {
      const shouldClear = prev && !nextOwned.includes(prev.expansionId);
      if (shouldClear) setOldOneLocked(false);
      return shouldClear ? null : prev;
    });

    setResultScenario((prev) => {
      const shouldClear = prev && !nextOwned.includes(prev.expansionId);
      if (shouldClear) setScenarioLocked(false);
      return shouldClear ? null : prev;
    });
  }

  function getCharacterImageSrcById(id: string) {
    return `/images/investigators/${id}.png`;
  }

  useEffect(() => {
  // Only images for characters in the owned collection
  const urls = characterPool.map((c) => getCharacterImageSrcById(c.id));

  // Preload into browser cache
  for (const url of urls) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}, [characterPool]);


  const seasonsInCollection = useMemo(() => {
    // Pull unique seasons from COLLECTION, sort numbers first then strings.
    const uniq = Array.from(new Set(COLLECTION.map((c) => c.season)));

    return uniq.sort((a, b) => {
      const an = typeof a === "number" ? a : Number(a);
      const bn = typeof b === "number" ? b : Number(b);
      const aIsNum = Number.isFinite(an);
      const bIsNum = Number.isFinite(bn);

      if (aIsNum && bIsNum) return an - bn;
      if (aIsNum) return -1;
      if (bIsNum) return 1;

      return String(a).localeCompare(String(b));
    });
  }, []);

  useEffect(() => {
    const ids = new Set(COLLECTION.map((c) => c.id));
    const missing = new Map<string, number>();

    const all = [...CHARACTERS, ...OLD_ONES, ...SCENARIOS];
    for (const item of all as any[]) {
      const key = item.expansionId;
      if (!ids.has(key)) missing.set(key, (missing.get(key) ?? 0) + 1);
    }

    if (missing.size) {
      console.group("Missing COLLECTION ids referenced by data:");
      for (const [key, count] of Array.from(missing.entries()).sort((a, b) => b[1] - a[1])) {
        console.warn(`${key}  (referenced ${count}x)`);
      }
      console.groupEnd();
    } else {
      console.info("✅ All expansionId values match COLLECTION ids");
    }
  }, []);

  const safeOldOne = resultOldOne && owned.includes(resultOldOne.expansionId) ? resultOldOne : null;
  const safeScenario = resultScenario && owned.includes(resultScenario.expansionId) ? resultScenario : null;
  const scenarioTag = safeScenario ? formatScenarioTag(safeScenario.id) : null;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-600">Cthulhu: Death May Die — Randomizer</h1>
              <p className="text-sm text-slate-600">React + TypeScript + Tailwind • Local storage collection</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={randomizeAll} className="rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800 active:scale-[0.99]" title="Randomize based on owned content">
                Randomize
              </button>

              <select className="rounded-2xl border px-3 py-2 text-slate-700 hover:bg-slate-100" value={playerCount} onChange={(e) => updatePlayerCount(Number(e.target.value) as PlayerCount)} title="Number of players (solo generates 2 characters)">
                <option value={1}>Solo</option>
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>

              <button ref={resetRef} onClick={resetResults} className="rounded-2xl border px-4 py-2 text-slate-700 hover:bg-slate-100" title="Clear current results">
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Results */}
        <section className="rounded-3xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle variant="dark">Results</SectionTitle>
            <div className="text-sm text-slate-600">Results are randomly selected from items in your collection</div>
          </div>

          {/* Characters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {characterSlots.map((slot) => {
              const c = slot.value && owned.includes(slot.value.expansionId) ? slot.value : null;

              return (
                <ResultCard
                  key={slot.slotId}
                  title={slot.playerLabel}
                  item={c?.name}
                  location={c ? getCollectionById(c.expansionId)?.name : undefined}
                  emptyHint={characterPool.length ? "Click Randomize" : "No characters in owned collection"}
                  imageSrc={c ? getCharacterImageSrcById(c.id) : undefined}
                  imageAlt={c ? `${c.name} investigator portrait` : undefined}
                  rightSlot={
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="size-4 accent-slate-800"
                        disabled={!c}
                        checked={c ? slot.locked : false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCharacterSlots((prev) => prev.map((s) => (s.slotId === slot.slotId ? { ...s, locked: checked } : s)));
                        }}
                      />
                      Keep
                    </label>
                  }
                />
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultCard
              title="Old One"
              item={safeOldOne?.name}
              location={safeOldOne ? getCollectionById(safeOldOne.expansionId)?.name : undefined}
              emptyHint={oldOnePool.length ? "Click Randomize" : "No Old Ones in owned collection"}
              rightSlot={
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" className="size-4 accent-slate-800" disabled={!safeOldOne} checked={safeOldOne ? oldOneLocked : false} onChange={(e) => setOldOneLocked(e.target.checked)} />
                  Keep
                </label>
              }
            />

            <ResultCard
              title="Scenario"
              item={safeScenario ? `${scenarioTag ? scenarioTag + ": " : ""}${safeScenario.name}` : undefined}
              location={safeScenario ? getCollectionById(safeScenario.expansionId)?.name : undefined}
              emptyHint={scenarioPool.length ? "Click Randomize" : "No scenarios in owned collection"}
              rightSlot={
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" className="size-4 accent-slate-800" disabled={!safeScenario} checked={safeScenario ? scenarioLocked : false} onChange={(e) => setScenarioLocked(e.target.checked)} />
                  Keep
                </label>
              }
            />
          </div>
        </section>
        {/* Collection selector */}
        <section className="rounded-2xl bg-slate-900/70 backdrop-blur p-6">
          <div className="mb-3 flex items-center justify-between gap-3 ">
            <SectionTitle variant="light">My Collection</SectionTitle>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setAllOwned(true)} className="rounded-full border px-3 py-1 hover:bg-slate-50">
                Select all
              </button>
              <button onClick={() => setAllOwned(false)} className="rounded-full border px-3 py-1 hover:bg-slate-50">
                Clear all
              </button>
            </div>
          </div>

          <div className="mb-3 text-sm text-slate-600">
            <span className="mr-2 text-slate-300">Owned:</span>
            {owned.length === 0 ? (
              <Pill>None</Pill>
            ) : (
              <span className="inline-flex flex-wrap gap-1 text-slate-100">
                {owned.map((id) => (
                  <Pill key={id}>{getCollectionById(id)?.name ?? id}</Pill>
                ))}
              </span>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer select-none rounded-xl px-2 py-1 text-sm text-slate-200 hover:bg-slate-50">
              <span className="mr-2 text-blue-400">Choose your owned content</span>
              <span className="text-slate-400">
                ({owned.length}/{COLLECTION.length})
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {seasonsInCollection.map((season) => (
                <div key={String(season)} className="rounded-xl border p-3">
                  <div className="mb-2 font-medium">Season {season}</div>
                  <ul className="space-y-1">
                    {COLLECTION.filter((c) => c.season === season).map((c) => (
                      <li key={c.id} className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                          <input type="checkbox" className="size-4 accent-slate-800" checked={owned.includes(c.id)} onChange={() => toggleOwned(c.id)} />
                          <span className="text-sm">{c.name}</span>
                          {c.type === "expansion" && <span className="ml-auto rounded bg-slate-500 px-2 py-0.5 text-xs text-slate-100">Expansion</span>}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </section>
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-10 pt-2 text-center text-xs text-slate-500">Built with 💜 by Andy Winn.</footer>
    </div>
  );
}
