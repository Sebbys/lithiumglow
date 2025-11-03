"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Sparkles, ChefHat, Save, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

const DIET_TAGS = ["omnivore", "vegetarian", "vegan"];
const PRESETS = [
  { value: "fast", label: "Quick", desc: "Fast generation, good variety" },
  { value: "balanced", label: "Balanced", desc: "Good speed & diversity" },
  { value: "quality", label: "High Quality", desc: "Better matches, slower" },
  { value: "deep", label: "Deep Search", desc: "Best results, takes time" },
] as const;

export function MealGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [dailyP, setDailyP] = useState(150);
  const [dailyC, setDailyC] = useState(250);
  const [dailyF, setDailyF] = useState(60);
  const [preset, setPreset] = useState<"fast" | "balanced" | "quality" | "deep">("balanced");
  const [dietTags, setDietTags] = useState(["omnivore"]);
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null); // editable copy of result
  const [activeDay, setActiveDay] = useState<string>("day-1");
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [ingByName, setIngByName] = useState<Record<string, any>>({});

  // Load ingredients for editing/tags
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/ingredients");
        if (!res.ok) return;
        const data = await res.json();
        setIngredients(data);
        const map: Record<string, any> = {};
        data.forEach((ing: any) => { map[(ing.name || "").toLowerCase()] = ing; });
        setIngByName(map);
      } catch {}
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/ai/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyP: parseInt(dailyP as any),
          dailyC: parseInt(dailyC as any),
          dailyF: parseInt(dailyF as any),
          dietTags,
          preset,
          allowRepeats,
          debug: debugMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate plan");
      }
      
      const data = await response.json();
      console.log("Plan generated:", data);
      setResult(data);
      setPlan(structuredClone(data));
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helpers to recompute a meal from names
  function majorityCuisine(cLists: string[][]): string[] {
    const counts: Record<string, number> = {};
    let hasUni = false;
    for (const cs of cLists) {
      if (!cs || cs.length === 0) continue;
      if (cs.includes("universal")) hasUni = true;
      for (const c of cs) if (c !== "universal") counts[c] = (counts[c] || 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) return [entries[0][0]];
    return hasUni ? ["universal"] : [];
  }

  function computeMealFromNames(names: string[]) {
    const items = names.map((n) => ingByName[(n || "").toLowerCase()]).filter(Boolean);
    const roles = items.map((i) => i.role || "other");
    const cuisines = majorityCuisine(items.map((i) => i.cuisine || []));
    const P = items.reduce((s, i) => s + (i.protein || 0), 0);
    const C = items.reduce((s, i) => s + (i.carbs || 0), 0);
    const F = items.reduce((s, i) => s + (i.fat || 0), 0);
    const kcal = items.reduce((s, i) => s + (i.kcal || 0), 0);
    const price = items.reduce((s, i) => s + (i.pricePerServing || 0), 0);
    return { roles, cuisines: cuisines.length ? cuisines : ["universal"], macros: { P, C, F, kcal }, price };
  }

  function recomputeDayTotals(dayObj: any) {
    const b = dayObj.meals.breakfast?.macros || { P: 0, C: 0, F: 0, kcal: 0 };
    const l = dayObj.meals.lunch?.macros || { P: 0, C: 0, F: 0, kcal: 0 };
    const d = dayObj.meals.dinner?.macros || { P: 0, C: 0, F: 0, kcal: 0 };
    const price =
      (dayObj.meals.breakfast?.price || 0) +
      (dayObj.meals.lunch?.price || 0) +
      (dayObj.meals.dinner?.price || 0);
    dayObj.totals = { P: b.P + l.P + d.P, C: b.C + l.C + d.C, F: b.F + l.F + d.F, kcal: b.kcal + l.kcal + d.kcal, price };
  }

  async function savePlan() {
    if (!plan) return;
    try {
      const res = await fetch("/api/meal-plans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Weekly Plan ${new Date().toISOString().slice(0,10)}`, days: plan.days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save plan");
      alert(`Saved! Plan ID: ${data.mealPlanId}${data.missing?.length ? ` (missing: ${data.missing.join(", ")})` : ""}`);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  // Render
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-primary" />
          AI Meal Planner
        </h1>
        <p className="text-muted-foreground">
          Generate a personalized 7-day meal plan based on your nutrition goals
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Nutrition Goals
          </CardTitle>
          <CardDescription>
            Set your daily macronutrient targets to generate a customized meal plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Macro Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-base font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Protein
                </Label>
                <div className="relative">
                  <Input
                    id="protein"
                    type="number"
                    value={dailyP}
                    onChange={(e) => setDailyP(parseInt(e.target.value) || 150)}
                    min="50"
                    max="300"
                    step="10"
                    className="text-lg h-12 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    g/day
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">50-300g recommended</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-base font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  Carbs
                </Label>
                <div className="relative">
                  <Input
                    id="carbs"
                    type="number"
                    value={dailyC}
                    onChange={(e) => setDailyC(parseInt(e.target.value) || 250)}
                    min="100"
                    max="500"
                    step="10"
                    className="text-lg h-12 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    g/day
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">100-500g recommended</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat" className="text-base font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Fat
                </Label>
                <div className="relative">
                  <Input
                    id="fat"
                    type="number"
                    value={dailyF}
                    onChange={(e) => setDailyF(parseInt(e.target.value) || 60)}
                    min="20"
                    max="150"
                    step="5"
                    className="text-lg h-12 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    g/day
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">20-150g recommended</p>
              </div>
            </div>

            <Separator />

            {/* Diet Preferences */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Diet Preferences</Label>
              <div className="flex gap-3 flex-wrap">
                {DIET_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        dietTags.includes(tag)
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={dietTags.includes(tag)}
                      onChange={(e) =>
                        setDietTags((prev) =>
                          e.target.checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                        )
                      }
                      className="sr-only"
                    />
                    <span className="capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="preset" className="text-base font-semibold">
                  Generation Quality
                </Label>
                <Select value={preset} onValueChange={(v: any) => setPreset(v)}>
                  <SelectTrigger id="preset" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  Variety Control
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Info className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Variety Control</DialogTitle>
                        <DialogDescription>
                          By default, the planner ensures each meal is unique across the week for maximum variety.
                          Enable "Allow repeats" if you're okay with similar meals appearing multiple times - this makes
                          it easier to hit your exact macro targets.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </Label>
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Switch
                    id="allowRepeats"
                    checked={allowRepeats}
                    onCheckedChange={setAllowRepeats}
                  />
                  <Label htmlFor="allowRepeats" className="cursor-pointer flex-1">
                    Allow meal repeats
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {allowRepeats ? "Easier to hit targets" : "Maximum variety"}
                    </span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Switch
                    id="debugMode"
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                  <Label htmlFor="debugMode" className="cursor-pointer flex-1">
                    Debug logs
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Include detailed search/scoring logs in the result
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate 7-Day Meal Plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && plan && (
        <div className="space-y-6">
          {result.error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Generation Error</CardTitle>
                <CardDescription>{result.error}</CardDescription>
              </CardHeader>
              {result.debug && (
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-48">
                    {JSON.stringify(result.debug, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          ) : (
            <>
              {/* Weekly Summary Card */}
              <Card className="bg-linear-to-br from-primary/5 via-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly Overview
                  </CardTitle>
                  <CardDescription>Your total nutrition for the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-background/60">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <p className="text-3xl font-bold">{result.weeklyTotals.P.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/60">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <p className="text-3xl font-bold">{result.weeklyTotals.C.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/60">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                      <p className="text-3xl font-bold">{result.weeklyTotals.F.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">grams</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/60">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-green-500" />
                        <p className="text-sm text-muted-foreground">Calories</p>
                      </div>
                      <p className="text-3xl font-bold">{result.weeklyTotals.kcal.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Debug Logs (optional) */}
              {result.debug && (
                <Card>
                  <CardHeader>
                    <CardTitle>Debug logs</CardTitle>
                    <CardDescription>Scoring details to help fine-tune the algorithm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                        {JSON.stringify(result.debug, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Daily Meal Plans with Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your 7-Day Meal Plan</CardTitle>
                      <CardDescription>Click on each day to view and edit meals</CardDescription>
                    </div>
                    <Button onClick={savePlan} size="lg" className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                      {plan.days.map((d: any) => (
                        <TabsTrigger key={d.day} value={`day-${d.day}`} className="flex-1 min-w-[100px]">
                          Day {d.day}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {plan.days.map((d: any, idx: number) => (
                      <TabsContent key={d.day} value={`day-${d.day}`} className="mt-6">
                        {/* Day Header with Stats */}
                        <div className="mb-6 p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold">Day {d.day} Nutrition</h3>
                            <Badge variant="secondary" className="text-xs">
                              Quality Score: {d.info.quality.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Protein</p>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-lg">{d.totals.P.toFixed(0)}g</p>
                                <MacroDelta target={result.inputs.dailyP} actual={d.totals.P} />
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Carbs</p>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-lg">{d.totals.C.toFixed(0)}g</p>
                                <MacroDelta target={result.inputs.dailyC} actual={d.totals.C} />
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Fat</p>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-lg">{d.totals.F.toFixed(0)}g</p>
                                <MacroDelta target={result.inputs.dailyF} actual={d.totals.F} />
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Calories</p>
                              <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                {d.totals.kcal.toFixed(0)} kcal
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Meals Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                          {["breakfast", "lunch", "dinner"].map((slot) => {
                            const meal = d.meals[slot as "breakfast" | "lunch" | "dinner"];
                            if (!meal) return null;
                            const names: string[] = meal.names || [];

                            return (
                              <Card key={slot} className="overflow-hidden">
                                <CardHeader className="pb-3 bg-muted/30">
                                  <CardTitle className="text-base capitalize flex items-center gap-2">
                                    {slot === "breakfast" && "🌅"}
                                    {slot === "lunch" && "☀️"}
                                    {slot === "dinner" && "🌙"}
                                    {slot}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {names.length} ingredients
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                  {/* Ingredients List */}
                                  <ScrollArea className="h-[280px] pr-3">
                                    <div className="space-y-2">
                                      {names.map((nm, i) => {
                                        const ing = ingByName[(nm || "").toLowerCase()];
                                        return (
                                          <div
                                            key={`${nm}-${i}`}
                                            className="group p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm mb-1 truncate">{nm}</p>
                                                {ing && (
                                                  <div className="flex flex-wrap gap-1">
                                                    <Badge
                                                      variant="secondary"
                                                      className="text-[10px] px-1.5 py-0"
                                                    >
                                                      {ing.role}
                                                    </Badge>
                                                    {ing.cuisine?.slice(0, 1).map((c: string) => (
                                                      <Badge
                                                        key={c}
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0"
                                                      >
                                                        {c}
                                                      </Badge>
                                                    ))}
                                                    {ing.dietTags?.slice(0, 1).map((t: string) => (
                                                      <Badge
                                                        key={t}
                                                        variant="default"
                                                        className="text-[10px] px-1.5 py-0 bg-green-500"
                                                      >
                                                        {t}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                  const next = structuredClone(plan);
                                                  const arr = next.days[idx].meals[slot]
                                                    .names as string[];
                                                  arr.splice(i, 1);
                                                  const rebuilt = computeMealFromNames(arr);
                                                  next.days[idx].meals[slot] = {
                                                    names: arr,
                                                    roles: rebuilt.roles,
                                                    cuisines: rebuilt.cuisines,
                                                    macros: rebuilt.macros,
                                                    price: rebuilt.price,
                                                  };
                                                  recomputeDayTotals(next.days[idx]);
                                                  setPlan(next);
                                                }}
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </ScrollArea>

                                  {/* Add Ingredient Button */}
                                  <AddIngredientDialog
                                    ingredients={ingredients}
                                    onAdd={(ingName) => {
                                      const next = structuredClone(plan);
                                      const arr = next.days[idx].meals[slot].names as string[];
                                      arr.push(ingName);
                                      const rebuilt = computeMealFromNames(arr);
                                      next.days[idx].meals[slot] = {
                                        names: arr,
                                        roles: rebuilt.roles,
                                        cuisines: rebuilt.cuisines,
                                        macros: rebuilt.macros,
                                        price: rebuilt.price,
                                      };
                                      recomputeDayTotals(next.days[idx]);
                                      setPlan(next);
                                    }}
                                  />

                                  <Separator />

                                  {/* Meal Macros */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                      <span className="text-muted-foreground">P:</span>
                                      <span className="font-semibold">
                                        {(d.meals[slot].macros?.P || 0).toFixed(0)}g
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                      <span className="text-muted-foreground">C:</span>
                                      <span className="font-semibold">
                                        {(d.meals[slot].macros?.C || 0).toFixed(0)}g
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span className="text-muted-foreground">F:</span>
                                      <span className="font-semibold">
                                        {(d.meals[slot].macros?.F || 0).toFixed(0)}g
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-2 h-2 text-green-500" />
                                      <span className="font-semibold text-green-600 dark:text-green-400">
                                        {(d.meals[slot].macros?.kcal || 0).toFixed(0)} kcal
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Macro Delta Indicator
function MacroDelta({ target, actual }: { target: number; actual: number }) {
  const delta = actual - target;
  const percentOff = Math.abs(delta / target) * 100;

  if (percentOff < 5) {
    return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-700 dark:text-green-400">On target</Badge>;
  }

  if (delta > 0) {
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-orange-500/20 text-orange-700 dark:text-orange-400 flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3" />
        +{delta.toFixed(0)}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" />
      {delta.toFixed(0)}
    </Badge>
  );
}

// Add Ingredient Dialog with better UX
function AddIngredientDialog({
  ingredients,
  onAdd,
}: {
  ingredients: any[];
  onAdd: (name: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return (ingredients || [])
      .filter((i: any) => (i.name || "").toLowerCase().includes(term))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }, [q, ingredients]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Plus className="w-4 h-4" />
          Add Ingredient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Ingredient to Meal</DialogTitle>
          <DialogDescription>Search and select an ingredient to add</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ingredients by name..."
            className="h-11"
            autoFocus
          />
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((i: any) => (
                <Button
                  key={i.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start hover:border-primary"
                  onClick={() => {
                    onAdd(i.name);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <span className="font-medium text-sm mb-1">{i.name}</span>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {i.role}
                    </Badge>
                    {i.cuisine?.slice(0, 1).map((c: string) => (
                      <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                    <span>P: {i.protein?.toFixed(0)}g</span>
                    <span>C: {i.carbs?.toFixed(0)}g</span>
                    <span>F: {i.fat?.toFixed(0)}g</span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
