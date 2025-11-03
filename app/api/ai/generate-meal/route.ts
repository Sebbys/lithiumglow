import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";

const SLOTS = ["breakfast", "lunch", "dinner"] as const;
const COMPOSITION = {
  breakfast: {
    required: { base_protein: 0, dressing_sauce: 0 },
    optional_max: {
      base_carb: 1,
      secondary_protein: 1,
      leafy_green: 1,
      vegetable: 2,
      fat_source: 1,
      topping: 2,
      garnish: 2,
    },
    total_range: [6, 8],
    split: [0.3, 0.35, 0.35], // P, C, F
  },
  lunch: {
    required: { base_protein: 1, dressing_sauce: 1 },
    optional_max: {
      base_carb: 1,
      secondary_protein: 1,
      leafy_green: 2,
      vegetable: 3,
      fat_source: 1,
      topping: 2,
      garnish: 2,
    },
    total_range: [8, 10],
    split: [0.4, 0.35, 0.35],
  },
  dinner: {
    required: { base_protein: 1, dressing_sauce: 1 },
    optional_max: {
      base_carb: 1,
      secondary_protein: 1,
      leafy_green: 2,
      vegetable: 3,
      fat_source: 1,
      topping: 2,
      garnish: 2,
    },
    total_range: [8, 10],
    split: [0.3, 0.3, 0.3],
  },
} as const;

interface WeeklyPlanRequest {
  dailyP: number; // Daily protein target (g)
  dailyC: number; // Daily carbs target (g)
  dailyF: number; // Daily fat target (g)
  allergens?: string[]; // Items to avoid
  dietTags?: string[]; // Preferred diet tags
  preset?: "fast" | "balanced" | "quality" | "deep"; // Speed/diversity trade-off
  allowRepeats?: boolean; // Relax weekly no-repeat constraint
  debug?: boolean; // Include detailed debug info in response
}

interface MealDay {
  day: number;
  meals: {
    breakfast: SlotMeal;
    lunch: SlotMeal;
    dinner: SlotMeal;
  };
  totals: Macros;
  info: { rel_err: number; quality: number };
}

interface SlotMeal {
  names: string[];
  roles: string[];
  cuisines: string[];
  macros: Macros;
  price: number;
}

interface Macros {
  P: number;
  C: number;
  F: number;
  kcal: number;
  price?: number;
}

interface Candidate {
  names: string[];
  roles: string[];
  cuisines: string[];
  P: number;
  C: number;
  F: number;
  kcal: number;
  price: number;
}

export async function POST(request: NextRequest) {
  unstable_noStore();

  try {
    const body: WeeklyPlanRequest = await request.json();
    const {
      dailyP,
      dailyC,
      dailyF,
      allergens = [],
      dietTags = ["omnivore"],
      preset = "balanced",
      allowRepeats = false,
      debug: debugInput,
    } = body;

    if (!dailyP || !dailyC || !dailyF) {
      return NextResponse.json(
        { error: "dailyP, dailyC, dailyF are required" },
        { status: 400 }
      );
    }

    // Fetch all active ingredients once
    const allIngredients = await db
      .select()
      .from(ingredient)
      .where(eq(ingredient.status, "active"));

    console.log(`[Meal Generation] Found ${allIngredients.length} ingredients`);

    if (allIngredients.length === 0) {
      return NextResponse.json(
        {
          error: "No ingredients available in the database. Please seed the ingredient table first.",
          debug: {
            ingredientCount: 0,
            message: "Run: INSERT scripts/insert-ingredients.sql to populate ingredients",
          },
        },
        { status: 400 }
      );
    }

    // Build 7-day plan with diversity tracking
    const days: MealDay[] = [];
    const noRepeatSignatures = new Set<string>();
    const cuisineBias: Record<string, number> = {};
    const ingredientUsage: Record<string, number> = {};
    const debugEnabled = typeof debugInput === "boolean" ? debugInput : process.env.NODE_ENV !== "production";
    const debug: any = debugEnabled
      ? { summary: { ingredientCount: allIngredients.length, preset }, days: [] as any[] }
      : undefined;

    for (let day = 1; day <= 7; day++) {
      const dayPlan = await pickDay(
        allIngredients,
        dailyP,
        dailyC,
        dailyF,
        allergens,
        dietTags,
        preset,
        allowRepeats,
        day,
        noRepeatSignatures,
        cuisineBias,
        ingredientUsage,
        debugEnabled
      );
      dayPlan.day = day;
      days.push(dayPlan);
      if (debugEnabled && dayPlan && (dayPlan as any).__debug) {
        debug.days.push((dayPlan as any).__debug);
      }
    }

    // Calculate weekly totals
    const weeklyTotals = { P: 0, C: 0, F: 0, kcal: 0, price: 0 };
    for (const day of days) {
      weeklyTotals.P += day.totals.P;
      weeklyTotals.C += day.totals.C;
      weeklyTotals.F += day.totals.F;
      weeklyTotals.kcal += day.totals.kcal;
      weeklyTotals.price += day.totals.price || 0;
    }

    return NextResponse.json({
      inputs: { dailyP, dailyC, dailyF, allergens, dietTags, preset, allowRepeats },
      days,
      weeklyTotals,
      debug,
    });
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    return NextResponse.json(
      {
        error: "Failed to generate meal plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ========== HELPERS ==========

const PRESETS = {
  fast: { batch: 30, topK: 5 },
  balanced: { batch: 180, topK: 15 },
  quality: { batch: 360, topK: 30 },
  deep: { batch: 720, topK: 50 },
};

function filterPool(
  items: any[],
  slot: string,
  allergens: string[],
  dietTags: string[]
): any[] {
  const allergenSet = new Set(allergens.map((a) => a.toLowerCase()));
  const allowAllDiet = dietTags.map((t) => t.toLowerCase()).includes("omnivore");

  return items.filter((item) => {
    // Meal type check
    const mealTypes = item.mealTypes || [];
    if (
      !(
        mealTypes.includes(slot) ||
        mealTypes.includes("universal") ||
        mealTypes.length === 0
      )
    ) {
      return false;
    }

    // Allergen check
    const itemAllergens = (item.allergens || []).map((a: string) =>
      a.toLowerCase()
    );
    if (allergenSet.size > 0 && itemAllergens.some((a: string) => allergenSet.has(a))) {
      return false;
    }

    // Diet tag check: if user is omnivore, allow all; otherwise require intersection when item has tags
    const itemDietTags = (item.dietTags || []).map((t: string) => t.toLowerCase());
    if (!allowAllDiet) {
      if (
        itemDietTags.length > 0 &&
        !itemDietTags.some((tag: string) => dietTags.map((t) => t.toLowerCase()).includes(tag))
      ) {
        return false;
      }
    }

    return true;
  });
}

function roleIndex(items: any[]): Record<string, any[]> {
  const idx: Record<string, any[]> = {};
  for (const item of items) {
    const role = item.role || "other";
    if (!idx[role]) idx[role] = [];
    idx[role].push(item);
  }
  return idx;
}

function sampleUnique(items: any[], k: number): any[] {
  if (k <= 0 || items.length === 0) return [];
  k = Math.min(k, items.length);
  const indices = new Set<number>();
  while (indices.size < k) {
    indices.add(Math.floor(Math.random() * items.length));
  }
  return Array.from(indices).map((i) => items[i]);
}

function cuisineMajority(cuisineLists: string[][]): string[] {
  const counts: Record<string, number> = {};
  let hasUni = false;

  for (const cs of cuisineLists) {
    if (!cs || cs.length === 0) continue;
    if (cs.includes("universal")) hasUni = true;
    for (const c of cs) {
      if (c !== "universal") counts[c] = (counts[c] || 0) + 1;
    }
  }

  if (Object.keys(counts).length > 0) {
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return [best[0]];
  }

  return hasUni ? ["universal"] : [];
}

function sampleCandidate(
  pool: any[],
  slot: typeof SLOTS[number]
): Candidate | null {
  const comp = COMPOSITION[slot];
  const idx = roleIndex(pool);
  const [mn, mx] = comp.total_range;
  const target = Math.floor(Math.random() * (mx - mn + 1)) + mn;

  let picks: any[] = [];
  const used = new Set<string>();

  // Required roles first
  for (const [role, count] of Object.entries(comp.required)) {
    if (count <= 0) continue;
    const avail = (idx[role] || []).filter((r) => !used.has(r.id));
    const chosen = sampleUnique(avail, count);
    for (const c of chosen) {
      picks.push(c);
      used.add(c.id);
    }
  }

  // Determine cuisine bias
  let targetCuisine = "universal";
  if (picks.length > 0) {
    const maj = cuisineMajority(
      picks.map((p) => p.cuisine || [])
    );
    if (maj.length > 0) targetCuisine = maj[0];
  } else {
    const maj = cuisineMajority(
      pool.map((p) => p.cuisine || [])
    );
    // Fallback to 'universal' if no cuisine majority can be determined
    targetCuisine = maj.length > 0 ? maj[0] : "universal";
  }

  // Optional roles
  const addRole = (role: string, maxK: number) => {
    if (maxK <= 0 || picks.length >= target) return;
    const avail = (idx[role] || []).filter((r) => !used.has(r.id));
    const prefer = avail.filter(
      (r) =>
        (r.cuisine || []).includes(targetCuisine) ||
        (r.cuisine || []).includes("universal")
    );
    const chosen = sampleUnique(prefer.length > 0 ? prefer : avail, maxK);
    for (const c of chosen) {
      picks.push(c);
      used.add(c.id);
    }
  };

  for (const [role, maxK] of Object.entries(comp.optional_max)) {
    if (picks.length >= target) break;
    addRole(role, maxK as number);
  }

  // Fill to min if needed
  if (picks.length < mn) {
    const left = pool.filter((r) => !used.has(r.id));
    const prefer = left.filter(
      (r) =>
        (r.cuisine || []).includes(targetCuisine) ||
        (r.cuisine || []).includes("universal")
    );
    const chosen = sampleUnique(
      prefer.length > 0 ? prefer : left,
      mn - picks.length
    );
    for (const c of chosen) {
      picks.push(c);
      used.add(c.id);
    }
  }

  if (picks.length === 0) return null;

  // Enforce max 1 dressing
  let roles = picks.map((p) => p.role || "other");
  const dressingCount = roles.filter((r) => r === "dressing_sauce").length;
  if (dressingCount > 1) {
    const keepIdx = Math.floor(Math.random() * dressingCount);
    let kept = 0;
    const filtered: any[] = [];
    for (const p of picks) {
      if (p.role === "dressing_sauce") {
        if (kept++ === keepIdx) filtered.push(p);
      } else {
        filtered.push(p);
      }
    }
    picks = filtered;
    roles = picks.map((p) => p.role || "other");
  }

  const cuisines = cuisineMajority(
    picks.map((p) => p.cuisine || [])
  );
  // If still no cuisine consensus, default to 'universal' to avoid null candidates
  const finalCuisines = cuisines.length > 0 ? cuisines : ["universal"];

  return {
    names: picks.map((p) => p.name),
    roles,
    cuisines: finalCuisines,
    P: picks.reduce((sum, p) => sum + (p.protein || 0), 0),
    C: picks.reduce((sum, p) => sum + (p.carbs || 0), 0),
    F: picks.reduce((sum, p) => sum + (p.fat || 0), 0),
    kcal: picks.reduce((sum, p) => sum + (p.kcal || 0), 0),
    price: picks.reduce((sum, p) => sum + (p.pricePerServing || 0), 0),
  };
}

function generateBatch(
  pool: any[],
  slot: typeof SLOTS[number],
  n: number
): Candidate[] {
  const out: Candidate[] = [];
  let attempts = 0;
  const cap = n * 40;

  while (out.length < n && attempts < cap) {
    attempts++;
    const c = sampleCandidate(pool, slot);
    if (c) out.push(c);
  }

  return out;
}

function slotTargets(
  P: number,
  C: number,
  F: number,
  slot: typeof SLOTS[number]
): Macros {
  const [p, c, f] = COMPOSITION[slot].split;
  return { P: P * p, C: C * c, F: F * f, kcal: (P * p * 4 + C * c * 4 + F * f * 9) };
}

function macroScore(c: Candidate, tgt: Macros): number {
  const eps = 1e-6;
  const rel =
    (Math.abs(c.P - tgt.P) / (tgt.P + eps) +
      Math.abs(c.C - tgt.C) / (tgt.C + eps) +
      Math.abs(c.F - tgt.F) / (tgt.F + eps)) /
    3;
  return Math.max(0, 1 - rel);
}

function countScore(c: Candidate, slot: typeof SLOTS[number]): number {
  const [mn, mx] = COMPOSITION[slot].total_range;
  const n = c.roles.length;
  if (n < mn) return Math.max(0, 1 - (mn - n) * 0.3);
  if (n > mx) return Math.max(0, 1 - (n - mx) * 0.2);
  const mid = (mn + mx) / 2;
  return Math.max(0, 1 - Math.abs(n - mid) / (mx - mn + 1e-6));
}

function roleCoverage(c: Candidate, slot: typeof SLOTS[number]): number {
  const req = COMPOSITION[slot].required;
  let ok = 0;
  for (const [role, count] of Object.entries(req)) {
    if (count === 0) ok++;
    else if (c.roles.includes(role)) ok++;
  }
  let bonus = 0;
  if (c.roles.includes("leafy_green")) bonus += 0.15;
  if (c.roles.includes("vegetable")) bonus += 0.1;
  if (c.roles.includes("fat_source")) bonus += 0.1;
  return Math.min(1, ok / Object.keys(req).length + bonus);
}

function cuisineFocus(c: Candidate): number {
  const cs = c.cuisines.filter((x) => x !== "universal");
  if (cs.length === 0) return 0.5;
  const n = cs.length;
  const p = 1 / n;
  const H = -n * p * Math.log(p + 1e-9);
  return Math.max(0, 1 - H / 1.5);
}

function scoreCandidate(
  c: Candidate,
  slot: typeof SLOTS[number],
  tgt: Macros
): number {
  const ms = macroScore(c, tgt);
  const coh = cuisineFocus(c);
  const rc = roleCoverage(c, slot);
  const cnt = countScore(c, slot);

  let dpen = 0;
  if (slot === "lunch" || slot === "dinner") {
    const dcount = c.roles.filter((r) => r === "dressing_sauce").length;
    if (dcount === 0) dpen += 0.2;
    if (dcount > 1) dpen += 0.3;
  }

  return Math.max(0, Math.min(1, 0.45 * ms + 0.2 * coh + 0.2 * rc + 0.1 * cnt - 0.05 * dpen));
}

async function pickDay(
  allIngredients: any[],
  P: number,
  C: number,
  F: number,
  allergens: string[],
  dietTags: string[],
  preset: keyof typeof PRESETS,
  allowRepeats: boolean,
  dayIndex: number,
  noRepeat: Set<string>,
  cuisineBias: Record<string, number>,
  ingredientUsage: Record<string, number>,
  debugEnabled: boolean
): Promise<MealDay> {
  const presetConfig = PRESETS[preset];
  const out: MealDay = {
    day: 0,
    meals: {} as any,
    totals: { P: 0, C: 0, F: 0, kcal: 0, price: 0 },
    info: { rel_err: 0, quality: 0 },
  };
  const dayDebug: any = debugEnabled
    ? { day: dayIndex, perSlot: {}, selection: {}, trackers: {} }
    : undefined;

  const perSlotTargets: Record<string, Macros> = {};
  const perSlotLists: Record<
    string,
    Array<{ cand: Candidate; score: number }>
  > = {};

  // Generate and score candidates per slot
  for (const slot of SLOTS) {
    const pool = filterPool(allIngredients, slot, allergens, dietTags);
    const cands = generateBatch(pool, slot, presetConfig.batch);

    const tg = slotTargets(P, C, F, slot);
    perSlotTargets[slot] = tg;

    const scored: Array<{ cand: Candidate; score: number }> = [];
    const scoredRaw: Array<{ cand: Candidate; score: number; parts: any }> = [];

    for (const c of cands) {
      const sig = [...c.names].sort().join("|");
      if (!allowRepeats && noRepeat.has(sig)) continue;

      const base = scoreCandidate(c, slot, tg); // 0..1

      // Cuisine fatigue (soft-capped)
      const mainC = c.cuisines[0] || "universal";
      const cuisineUse = cuisineBias[mainC] || 0;
      const cuisinePenalty = Math.min(0.4, 0.1 * Math.sqrt(cuisineUse));

      // Ingredient overuse (soft-capped)
      let useSum = 0;
      for (const nm of c.names) {
        useSum += ingredientUsage[nm.toLowerCase()] || 0;
      }
      const usagePenalty = Math.min(0.6, 0.08 * Math.sqrt(useSum));

      // Day-based annealing: later days relax penalties slightly
      const anneal = 0.9 + Math.min(0.15, (dayIndex - 1) * 0.02);

      let adjusted = base - anneal * (cuisinePenalty + usagePenalty);
      // Clamp adjusted score to [0,1] for stability
      adjusted = Math.max(0, Math.min(1, adjusted));

      scored.push({ cand: c, score: adjusted });
      if (debugEnabled) {
        scoredRaw.push({
          cand: c,
          score: adjusted,
          parts: {
            base,
            cuisinePenalty,
            usagePenalty,
            anneal,
          },
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    if (scored.length > 0) {
      perSlotLists[slot] = scored.slice(0, presetConfig.topK);
    } else if (cands.length > 0) {
      // Fallback: if scoring filtered everything out, keep raw candidates with neutral score
      perSlotLists[slot] = cands
        .slice(0, presetConfig.topK)
        .map((c) => ({ cand: c, score: 0.5 }));
    } else {
      perSlotLists[slot] = [];
    }

    if (debugEnabled) {
      dayDebug.perSlot[slot] = {
        pool: pool.length,
        batch: cands.length,
        kept: perSlotLists[slot].length,
        topPreview: perSlotLists[slot].slice(0, 5).map((x) => ({
          names: x.cand.names,
          score: x.score,
          cuisines: x.cand.cuisines,
          roles: x.cand.roles,
        })),
      };
    }
  }

  // Find best 3-meal combo (B, L, D)
  let bestB: Candidate | null = null;
  let bestL: Candidate | null = null;
  let bestD: Candidate | null = null;
  let bestCost = 1e9;
  let bestInfo = { rel_err: 0, quality: 0 };

  const B = perSlotLists["breakfast"];
  const L = perSlotLists["lunch"];
  const D = perSlotLists["dinner"];

  console.log(
    `[Meal Generation] Candidate counts — B: ${B.length}, L: ${L.length}, D: ${D.length}`
  );

  for (const { cand: cb, score: sb } of B) {
    for (const { cand: cl, score: sl } of L) {
      for (const { cand: cd, score: sd } of D) {
        const dayP = cb.P + cl.P + cd.P;
        const dayC = cb.C + cl.C + cd.C;
        const dayF = cb.F + cl.F + cd.F;

        const relErr =
          (Math.abs(dayP - P) / (P + 1e-6) +
            Math.abs(dayC - C) / (C + 1e-6) +
            Math.abs(dayF - F) / (F + 1e-6)) /
          3;

        // Diversity bonus for distinct cuisines
        const distinctCuisines = new Set([
          cb.cuisines[0] || "universal",
          cl.cuisines[0] || "universal",
          cd.cuisines[0] || "universal",
        ]).size;
        const diversityBonus = 0.04 * distinctCuisines;

        const qualityAdjusted = (sb + sl + sd) / 3 + diversityBonus;
        const cost = 0.65 * relErr - 0.35 * qualityAdjusted;

        if (cost < bestCost) {
          bestCost = cost;
          bestB = cb;
          bestL = cl;
          bestD = cd;
          bestInfo = { rel_err: relErr, quality: qualityAdjusted };
        }
      }
    }
  }

  // Rescue pass: if quality is too low or error too high, relax penalties by widening search
  if ((!bestB || !bestL || !bestD) || bestInfo.quality < 0.25 || bestInfo.rel_err > 0.3) {
    if (debugEnabled) {
      dayDebug.selection = { ...(dayDebug.selection || {}), rescueTriggered: true, preRescue: { bestCost, bestInfo } };
    }
    // Build simple top lists without usage/cuisine penalties (use base scores only)
    const baseLists: Record<string, Array<{ cand: Candidate; score: number }>> = {};
    for (const slot of SLOTS) {
      const pool = filterPool(allIngredients, slot, allergens, dietTags);
      const cands = generateBatch(pool, slot, Math.max(PRESETS[preset].batch, 240));
      const tg = slotTargets(P, C, F, slot);
      const scored = cands.map((c) => ({ cand: c, score: scoreCandidate(c, slot, tg) }));
      scored.sort((a, b) => b.score - a.score);
      baseLists[slot] = scored.slice(0, Math.max(PRESETS[preset].topK, 30));
    }
    bestB = null as any;
    bestL = null as any;
    bestD = null as any;
    bestCost = 1e9;
    for (const { cand: cb, score: sb } of baseLists["breakfast"]) {
      for (const { cand: cl, score: sl } of baseLists["lunch"]) {
        for (const { cand: cd, score: sd } of baseLists["dinner"]) {
          const dayP = cb.P + cl.P + cd.P;
          const dayC = cb.C + cl.C + cd.C;
          const dayF = cb.F + cl.F + cd.F;
          const relErr =
            (Math.abs(dayP - P) / (P + 1e-6) +
              Math.abs(dayC - C) / (C + 1e-6) +
              Math.abs(dayF - F) / (F + 1e-6)) /
            3;
          const distinctCuisines = new Set([
            cb.cuisines[0] || "universal",
            cl.cuisines[0] || "universal",
            cd.cuisines[0] || "universal",
          ]).size;
          const diversityBonus = 0.04 * distinctCuisines;
          const qualityAdjusted = (sb + sl + sd) / 3 + diversityBonus;
          const cost = 0.65 * relErr - 0.35 * qualityAdjusted;
          if (cost < bestCost) {
            bestCost = cost;
            bestB = cb;
            bestL = cl;
            bestD = cd;
            bestInfo = { rel_err: relErr, quality: qualityAdjusted };
          }
        }
      }
    }
    if (debugEnabled) {
      dayDebug.selection = { ...(dayDebug.selection || {}), postRescue: { bestCost, bestInfo } };
    }
  }

  if (!bestB || !bestL || !bestD) {
    return out; // Fallback, shouldn't happen
  }

  // Build output
  out.meals = {
    breakfast: {
      names: bestB.names,
      roles: bestB.roles,
      cuisines: bestB.cuisines,
      macros: { P: bestB.P, C: bestB.C, F: bestB.F, kcal: bestB.kcal },
      price: bestB.price,
    },
    lunch: {
      names: bestL.names,
      roles: bestL.roles,
      cuisines: bestL.cuisines,
      macros: { P: bestL.P, C: bestL.C, F: bestL.F, kcal: bestL.kcal },
      price: bestL.price,
    },
    dinner: {
      names: bestD.names,
      roles: bestD.roles,
      cuisines: bestD.cuisines,
      macros: { P: bestD.P, C: bestD.C, F: bestD.F, kcal: bestD.kcal },
      price: bestD.price,
    },
  };

  out.totals = {
    P: bestB.P + bestL.P + bestD.P,
    C: bestB.C + bestL.C + bestD.C,
    F: bestB.F + bestL.F + bestD.F,
    kcal: bestB.kcal + bestL.kcal + bestD.kcal,
    price: bestB.price + bestL.price + bestD.price,
  };

  out.info = bestInfo;

  // Update diversity trackers
  for (const c of [bestB, bestL, bestD]) {
    const sig = [...c.names].sort().join("|");
    if (!allowRepeats) noRepeat.add(sig);

    const cu = c.cuisines[0] || "universal";
    cuisineBias[cu] = (cuisineBias[cu] || 0) + 1;

    for (const nm of c.names) {
      const key = nm.toLowerCase();
      ingredientUsage[key] = (ingredientUsage[key] || 0) + 1;
    }
  }

  if (debugEnabled) {
    dayDebug.selection = {
      ...(dayDebug.selection || {}),
      chosen: {
        breakfast: { names: out.meals.breakfast.names, cuisines: out.meals.breakfast.cuisines },
        lunch: { names: out.meals.lunch.names, cuisines: out.meals.lunch.cuisines },
        dinner: { names: out.meals.dinner.names, cuisines: out.meals.dinner.cuisines },
      },
      totals: out.totals,
      info: out.info,
    };
    dayDebug.trackers = {
      cuisineBias: Object.entries(cuisineBias)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      ingredientUsageTop: Object.entries(ingredientUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
    (out as any).__debug = dayDebug;
  }

  return out;
}
