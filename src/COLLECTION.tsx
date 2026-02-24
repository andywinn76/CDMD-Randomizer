import type { CollectionItem } from "./App";

export const COLLECTION: CollectionItem[] = [
  // Seasons
  { id: "S1", name: "Season 1 (Core Box)", season: 1, type: "season" },
  { id: "S2", name: "Season 2", season: 2, type: "season" },
  { id: "S3", name: "Season 3 (Core Box)", season: 3, type: "season" },
  { id: "S4", name: "Season 4", season: 4, type: "season" },
  { id: "S5", name: "Season 5 (Core Box)" , season: 5, type: "season" },
  { id: "S6", name: "Season 6", season: 6, type: "season" },

  // Big boxes
  { id: "Unspeakable Box", name: "Unspeakable Box", season: 1, type: "expansion" },
  { id: "Unknowable Box", name: "Unknowable Box", season: 3, type: "expansion" },
  { id: "Unimaginable Box", name: "Unimaginable Box", season: 5, type: "expansion" },

  // Comic content
  { id: "Comic Book Vol. 1", name: "Comic Book Vol. 1", season: 1, type: "expansion" },
  { id: "Comic Book Vol. 2", name: "Comic Book Vol. 2", season: 4, type: "expansion" },

  // Standalone / special expansions (you can split these later if you want)
  { id: "Yog-Sothoth", name: "Yog-Sothoth", season: 1, type: "expansion" },
  { id: "Black Goat of the Woods", name: "Black Goat of the Woods", season: 1, type: "expansion" },
  { id: "Ithaqua", name: "Ithaqua", season: 3, type: "expansion" },

  // Promos / preorder / misc
  { id: "Iron Maiden", name: "Iron Maiden", season: 2, type: "expansion" },
  { id: "Scarlett", name: "Scarlett Hayes", season: 2, type: "expansion" },
  { id: "Dark Providence Preorder", name: "Dark Providence Preorder Agents", season: 4, type: "expansion" },
  { id: "Portal Games 25th Anniversary Promo", name: "Robinson Crusoe", season: 5, type: "expansion" },

  // Epic stuff
  { id: "R'lyeh Rising", name: "R'lyeh Rising", season: 1, type: "expansion" },
  { id: "Godzilla Rising", name: "Godzilla Rising", season: 5, type: "expansion" },
];
