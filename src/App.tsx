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

export interface CollectionItem {
  id: ID; // unique key like "S1" or "EXP_S1_BLACK_GOAT"
  name: string;
  season: SeasonNumber; // which season box this belongs to (for expansions too)
  type: CollectionType;
}

export interface Character {
  id: ID;
  name: string;
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

/*************************
 *  Utils
 *************************/

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] ?? null;
}

function getCollectionById(id: ID): CollectionItem | undefined {
  return COLLECTION.find((c) => c.id === id);
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

type RandomizeFlags = {
  character: boolean;
  oldOne: boolean;
  scenario: boolean;
};

const DEFAULT_FLAGS: RandomizeFlags = {
  character: true,
  oldOne: true,
  scenario: true,
};

const LS_KEYS = {
  owned: "cddmd_owned_collection_v1",
  flags: "cddmd_randomize_flags_v1",
};

export default function App() {
  const [owned, setOwned] = useLocalStorage<ID[]>(LS_KEYS.owned, ["S1", "S2", "S3", "S4"]);
  const [flags, setFlags] = useLocalStorage<RandomizeFlags>(LS_KEYS.flags, DEFAULT_FLAGS);

  const [resultCharacter, setResultCharacter] = useState<Character | null>(null);
  const [resultOldOne, setResultOldOne] = useState<OldOne | null>(null);
  const [resultScenario, setResultScenario] = useState<Scenario | null>(null);

  // Filter pools by ownership
  const characterPool = useMemo(() => CHARACTERS.filter((c) => owned.includes(c.expansionId)), [owned]);
  const oldOnePool = useMemo(() => OLD_ONES.filter((o) => owned.includes(o.expansionId)), [owned]);
  const scenarioPool = useMemo(() => SCENARIOS.filter((s) => owned.includes(s.expansionId)), [owned]);

  // Simple randomizer
  function randomizeAll() {
    if (flags.character) setResultCharacter(pickRandom(characterPool));
    else setResultCharacter(null);

    if (flags.oldOne) setResultOldOne(pickRandom(oldOnePool));
    else setResultOldOne(null);

    if (flags.scenario) setResultScenario(pickRandom(scenarioPool));
    else setResultScenario(null);
  }

  // UI helpers

  function toggleOwned(id: ID) {
    setOwned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function setAllOwned(next: boolean) {
    setOwned(next ? COLLECTION.map((c) => c.id) : []);
  }

  const resetRef = useRef<HTMLButtonElement | null>(null);

  function resetResults() {
    setResultCharacter(null);
    setResultOldOne(null);
    setResultScenario(null);
  }

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

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cthulhu: Death May Die — Randomizer</h1>
              <p className="text-sm text-slate-600">React + TypeScript + Tailwind • Local storage collection</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={randomizeAll} className="rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800 active:scale-[0.99]" title="Randomize based on owned content">
                Randomize
              </button>
              <button ref={resetRef} onClick={resetResults} className="rounded-2xl border px-4 py-2 text-slate-700 hover:bg-slate-100" title="Clear current results">
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Collection selector */}
        <section className="rounded-2xl bg-slate-800/60 backdrop-blur p-6">
          <div className="mb-3 flex items-center justify-between gap-3 ">
            <SectionTitle>Collection</SectionTitle>
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
              <span className="mr-2 text-blue-400">Choose owned content</span>
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

        {/* Randomize options */}
        <section className="rounded-2xl bg-slate-800/60 backdrop-blur p-6">
          <SectionTitle>Randomize</SectionTitle>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input type="checkbox" className="size-4 accent-slate-800" checked={flags.character} onChange={(e) => setFlags((f) => ({ ...f, character: e.target.checked }))} />
              <span>Character</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input type="checkbox" className="size-4 accent-slate-800" checked={flags.oldOne} onChange={(e) => setFlags((f) => ({ ...f, oldOne: e.target.checked }))} />
              <span>Old One (Boss)</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input type="checkbox" className="size-4 accent-slate-800" checked={flags.scenario} onChange={(e) => setFlags((f) => ({ ...f, scenario: e.target.checked }))} />
              <span>Scenario</span>
            </label>
          </div>
          <p className="mt-2 text-sm text-slate-600">Monsters coming later ✨</p>
        </section>

        {/* Results */}
        <section className="rounded-3xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Results</SectionTitle>
            <div className="text-sm text-slate-600">Filtered by your owned collection</div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ResultCard title="Character" item={resultCharacter?.name} location={resultCharacter ? getCollectionById(resultCharacter.expansionId)?.name : undefined} emptyHint={characterPool.length ? "Click Randomize" : "No characters in owned collection"} />

            <ResultCard title="Old One" item={resultOldOne?.name} location={resultOldOne ? getCollectionById(resultOldOne.expansionId)?.name : undefined} emptyHint={oldOnePool.length ? "Click Randomize" : "No Old Ones in owned collection"} />

            <ResultCard title="Scenario" item={resultScenario?.name} location={resultScenario ? getCollectionById(resultScenario.expansionId)?.name : undefined} emptyHint={scenarioPool.length ? "Click Randomize" : "No scenarios in owned collection"} />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-10 pt-2 text-center text-xs text-slate-500">Built with 💜 by you. Expand the data and ship it to Vercel.</footer>
    </div>
  );
}


