#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Weekly Meal Plan Generator (7 days) — simple & compute-light
- No ML, no DB. Uses your CSV of ingredients.
- Per-slot templates: Breakfast 6–8 items; Lunch/Dinner 8–10 items; exactly one dressing if available.
- Heuristic scoring: macro-fit + cuisine-focus + role-coverage + item-count match (tiny penalties).
- Per day: pick best (B,L,D) combo from top candidates.
- Weekly diversity: avoid exact duplicates; lightly spread cuisines across the week.
- Output: JSON with 7 days × {breakfast,lunch,dinner} and weekly totals.

Run:
  python weekly_plan_generator.py \
    --csv "data.csv" \
    --P 150 --C 250 --F 60 \
    --allergens "gluten,dairy" \
    --out runs/weekly_plan.json
"""
import argparse, json, math, os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
import numpy as np, pandas as pd

RNG = np.random.default_rng(12345)

SLOTS = ["breakfast", "lunch", "dinner"]
COMPOSITION = {
    "breakfast": {
        "required": {"base_protein": 0, "dressing_sauce": 0},
        "optional_max": {"base_carb": 1, "secondary_protein": 1, "leafy_green": 1, "vegetable": 2,
                         "fat_source": 1, "topping": 2, "garnish": 2},
        "total_range": (6, 8),
        "split": (0.30, 0.35, 0.35),  # share of daily P,C,F
    },
    "lunch": {
        "required": {"base_protein": 1, "dressing_sauce": 1},
        "optional_max": {"base_carb": 1, "secondary_protein": 1, "leafy_green": 2, "vegetable": 3,
                         "fat_source": 1, "topping": 2, "garnish": 2},
        "total_range": (8, 10),
        "split": (0.40, 0.35, 0.35),
    },
    "dinner": {
        "required": {"base_protein": 1, "dressing_sauce": 1},
        "optional_max": {"base_carb": 1, "secondary_protein": 1, "leafy_green": 2, "vegetable": 3,
                         "fat_source": 1, "topping": 2, "garnish": 2},
        "total_range": (8, 10),
        "split": (0.30, 0.30, 0.30),
    },
}
BAN_KEYWORDS = [("whey","blueberry"), ("soba","blueberry"), ("noodle","blueberry")]

# -------------------- IO --------------------
def load_csv(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    for col in ["meal_types","cuisine","diet_tags","allergens"]:
        if col in df.columns:
            df[col] = df[col].apply(_parse_list)
        else:
            df[col] = [[] for _ in range(len(df))]
    for col in ["protein","carbs","fat","sugar","fiber","kcal","price_per_serving"]:
        if col in df.columns:
            df[col] = df[col].fillna(0.0).astype(float)
        else:
            df[col] = 0.0
    df["name_lc"] = df["name"].astype(str).str.lower()
    df["role"] = df.get("role", "other")
    df["category"] = df.get("category", "other")
    return df

def load_from_supabase(supabase_url: str, api_key: str, table: str = "ingredient") -> pd.DataFrame:
    """
    Fetch rows from Supabase REST API and normalize to the same DataFrame shape
    expected by the generator. Uses the project's anon/service key as `api_key`.

    Example SUPABASE_URL: https://<project_ref>.supabase.co
    Endpoint: {SUPABASE_URL}/rest/v1/{table}?select=*

    This function avoids adding external dependencies by using urllib from the
    standard library and json for parsing.
    """
    import urllib.request
    import urllib.error

    url = supabase_url.rstrip("/") + f"/rest/v1/{table}?select=*"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Supabase request failed: {e.code} {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Supabase request error: {e}")

    if not isinstance(data, list):
        raise RuntimeError("Unexpected response from Supabase; expected a JSON list of rows")

    df = pd.DataFrame(data)

    # Normalize array/list columns
    for col in ["meal_types", "cuisine", "diet_tags", "allergens"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: x if isinstance(x, list) else _parse_list(x))
        else:
            df[col] = [[] for _ in range(len(df))]

    # Numeric columns
    for col in ["protein", "carbs", "fat", "sugar", "fiber", "kcal", "price_per_serving"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0).astype(float)
        else:
            df[col] = 0.0

    df["name_lc"] = df["name"].astype(str).str.lower()
    df["role"] = df.get("role", "other")
    df["category"] = df.get("category", "other")
    return df

def load_pairings_from_supabase(supabase_url: str, api_key: str, ingredient_df: pd.DataFrame, 
                                 min_score: int = 5) -> List[set]:
    """
    Fetch pairing table from Supabase, join ingredient names, and return as list of sets.
    Only includes pairings with pairing_score >= min_score.
    
    Returns: list of sets, where each set contains two lowercased ingredient names that form a validated pair.
    """
    import urllib.request
    import urllib.error

    url = supabase_url.rstrip("/") + f"/rest/v1/pairing?select=*"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Supabase pairing request failed: {e.code} {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Supabase pairing request error: {e}")

    if not isinstance(data, list):
        raise RuntimeError("Unexpected response from Supabase pairing table")

    # Build a map from ingredient id (UUID) to name (lowercased)
    id_to_name = {}
    for _, row in ingredient_df.iterrows():
        ing_id = row.get("id")
        if ing_id:
            id_to_name[str(ing_id)] = str(row.get("name", "")).strip().lower()

    # Convert pairings: for each row with score >= min_score, create a set of two names
    validated_pairings = []
    for row in data:
        try:
            score = int(row.get("pairing_score", 0))
            if score < min_score:
                continue
            ing_a_id = str(row.get("ingredient_a", ""))
            ing_b_id = str(row.get("ingredient_b", ""))
            name_a = id_to_name.get(ing_a_id)
            name_b = id_to_name.get(ing_b_id)
            if name_a and name_b:
                validated_pairings.append({name_a, name_b})
        except Exception:
            continue

    return validated_pairings

def _parse_list(x: Any) -> List[str]:
    if isinstance(x, list): return [str(i) for i in x]
    if isinstance(x, str):
        s = x.strip()
        if s == "" or s.lower()=="none": return []
        if s.startswith("["):
            try:
                v = json.loads(s)
                if isinstance(v, list): return [str(i) for i in v]
            except Exception: pass
        return [s]
    return []

# ---------------- candidate ----------------
@dataclass
class Cand:
    names: List[str]; roles: List[str]; cuisines: List[str]
    P: float; C: float; F: float; kcal: float; price: float; allergens: List[str]

def filter_pool(df: pd.DataFrame, slot: str, allergens: List[str]) -> pd.DataFrame:
    aset = set(a.strip().lower() for a in allergens if a.strip())
    ok = []
    for _, r in df.iterrows():
        mts = r["meal_types"] or []
        if not (slot in mts or "universal" in mts or len(mts)==0):
            ok.append(False); continue
        r_all = set(a.strip().lower() for a in (r["allergens"] or []))
        if aset and r_all.intersection(aset):
            ok.append(False); continue
        ok.append(True)
    return df[pd.Series(ok).values].copy().reset_index(drop=True)

def banned(names: List[str]) -> bool:
    s = " ".join(n.lower() for n in names)
    for a,b in BAN_KEYWORDS:
        if a in s and b in s: return True
    return False

def cuisine_majority(c_lists: List[List[str]]) -> List[str]:
    counts: Dict[str,int] = {}; has_uni=False
    for cs in c_lists:
        if not cs: continue
        if "universal" in cs: has_uni=True
        for c in cs:
            if c=="universal": continue
            counts[c]=counts.get(c,0)+1
    if counts:
        return [max(counts.items(), key=lambda kv: kv[1])[0]]
    return ["universal"] if has_uni else []

def role_index(pool: pd.DataFrame) -> Dict[str, List[Dict[str,Any]]]:
    idx: Dict[str, List[Dict[str,Any]]] = {}
    for _, r in pool.iterrows():
        idx.setdefault(str(r["role"]), []).append(r.to_dict())
    return idx

def sample_unique(items: List[Dict[str,Any]], k: int) -> List[Dict[str,Any]]:
    if k<=0 or not items: return []
    k = min(k, len(items))
    sel = RNG.choice(len(items), size=k, replace=False)
    return [items[int(i)] for i in sel]

def sample_candidate(pool: pd.DataFrame, slot: str) -> Optional[Cand]:
    comp = COMPOSITION[slot]; idx = role_index(pool)
    mn, mx = comp["total_range"]; target = int(RNG.integers(mn, mx+1))
    picks: List[Dict[str,Any]] = []; used=set()

    # required first
    for role, count in comp["required"].items():
        if count<=0: continue
        avail = [r for r in idx.get(role, []) if r.get("id") not in used]
        chosen = sample_unique(avail, count)
        for r in chosen: picks.append(r); used.add(r.get("id"))

    # choose cuisine target
    if picks:
        maj = cuisine_majority([p.get("cuisine", []) for p in picks])
    else:
        maj = cuisine_majority([r.get("cuisine", []) for _, r in pool.iterrows()])
    if not maj: return None
    target_c = maj[0]

    # optional roles
    def add_role(role: str, kmax: int):
        if kmax<=0: return
        avail = [r for r in idx.get(role, []) if r.get("id") not in used]
        prefer = [r for r in avail if target_c in (r.get("cuisine") or []) or "universal" in (r.get("cuisine") or [])]
        chosen = sample_unique(prefer if prefer else avail, kmax)
        for r in chosen: picks.append(r); used.add(r.get("id"))

    for role, kmax in comp["optional_max"].items():
        if len(picks) >= target: break
        add_role(role, min(kmax, target - len(picks)))

    # fill remainder if under min
    if len(picks) < mn:
        left = [r.to_dict() for _, r in pool.iterrows() if r.get("id") not in used]
        prefer = [r for r in left if target_c in (r.get("cuisine") or []) or "universal" in (r.get("cuisine") or [])]
        chosen = sample_unique(prefer if prefer else left, mn - len(picks))
        for r in chosen: picks.append(r); used.add(r.get("id"))

    names = [str(p["name"]) for p in picks]
    if banned(names): return None

    # enforce exactly one dressing if >1
    roles = [str(p.get("role","")) for p in picks]
    if roles.count("dressing_sauce") > 1:
        keep_i = int(RNG.integers(0, roles.count("dressing_sauce")))
        kept = 0; new=[]
        for p in picks:
            if p.get("role")=="dressing_sauce":
                if kept==keep_i: new.append(p); kept+=1
            else:
                new.append(p)
        picks = new
        roles = [str(p.get("role","")) for p in picks]

    cuisines = cuisine_majority([p.get("cuisine") or [] for p in picks])
    if not cuisines: return None

    P = float(sum(p.get("protein",0.0) for p in picks))
    C = float(sum(p.get("carbs",0.0) for p in picks))
    F = float(sum(p.get("fat",0.0) for p in picks))
    kcal = float(sum(p.get("kcal",0.0) for p in picks))
    price = float(sum(p.get("price_per_serving",0.0) for p in picks))
    allergens = sorted({a.strip().lower() for p in picks for a in (p.get("allergens") or []) if a})
    return Cand(names=names, roles=roles, cuisines=cuisines, P=P, C=C, F=F, kcal=kcal, price=price, allergens=allergens)

def generate_batch(pool: pd.DataFrame, slot: str, n: int=360) -> List[Cand]:
    out=[]; attempts=0; cap=n*40
    while len(out)<n and attempts<cap:
        attempts+=1
        c=sample_candidate(pool, slot)
        if c is not None: out.append(c)
    return out

# --------------- scoring -----------------
def slot_targets(P:float,C:float,F:float, slot:str)->Dict[str,float]:
    sp,sc,sf = COMPOSITION[slot]["split"]; return {"P":P*sp,"C":C*sc,"F":F*sf}

def macro_score(c:Cand, tgt:Dict[str,float])->float:
    eps=1e-6
    rel=(abs(c.P-tgt["P"])/(tgt["P"]+eps)+abs(c.C-tgt["C"])/(tgt["C"]+eps)+abs(c.F-tgt["F"])/(tgt["F"]+eps))/3.0
    return max(0.0, 1.0-rel)

def count_score(c:Cand, slot:str)->float:
    mn,mx=COMPOSITION[slot]["total_range"]; n=len(c.roles)
    if n<mn: return max(0.0, 1.0-(mn-n)*0.3)
    if n>mx: return max(0.0, 1.0-(n-mx)*0.2)
    mid=(mn+mx)/2.0
    return max(0.0, 1.0-abs(n-mid)/(mx-mn+1e-6))

def role_coverage(c:Cand, slot:str)->float:
    req=COMPOSITION[slot]["required"]; ok=0; total=max(len(req),1)
    for role,count in req.items():
        if count==0: ok+=1
        else: ok+=1 if role in c.roles else 0
    bonus=0.0
    bonus+=0.15 if "leafy_green" in c.roles else 0.0
    bonus+=0.10 if "vegetable" in c.roles else 0.0
    bonus+=0.10 if "fat_source" in c.roles else 0.0
    return min(1.0, ok/total + bonus)

def cuisine_focus(c:Cand)->float:
    cs=[x for x in c.cuisines if x!="universal"]
    if not cs: return 0.5
    n=len(cs); p=1.0/n; H=-n*p*math.log(p+1e-9); return max(0.0, 1.0-(H/1.5))

def score_candidate(c:Cand, slot:str, tgt:Dict[str,float])->float:
    ms=macro_score(c,tgt); coh=cuisine_focus(c); rc=role_coverage(c,slot); cnt=count_score(c,slot)
    dpen=0.0
    if slot in ("lunch","dinner"):
        dcount=c.roles.count("dressing_sauce")
        if dcount==0: dpen+=0.2
        if dcount>1: dpen+=0.3
    return float(max(0.0, min(1.0, 0.45*ms + 0.20*coh + 0.20*rc + 0.10*cnt - 0.05*dpen)))

# --------------- day selection -----------
def pick_day(df:pd.DataFrame, P:float,C:float,F:float, allergens:List[str],
             no_repeat_signatures:set, cuisine_bias:Dict[str,int], ingredient_usage:Dict[str,int],
             validated_pairings:Optional[List[set]] = None) -> Dict[str,Any]:
    out={"meals":{}, "info":{}}
    per_slot_tgts = {s: slot_targets(P,C,F,s) for s in SLOTS}
    per_slot_lists: Dict[str, List[Tuple[Cand,float]]] = {}

    for slot in SLOTS:
        pool=filter_pool(df, slot, allergens)
        cands=generate_batch(pool, slot, n=360)
        RNG.shuffle(cands)  # Add randomness to candidate order
        tg=per_slot_tgts[slot]
        scored=[]
        for c in cands:
            sig = tuple(sorted(c.names))
            if sig in no_repeat_signatures:
                continue
            s=score_candidate(c, slot, tg)
            # much stronger cuisine fatigue penalty to promote rotation
            main_c = c.cuisines[0] if c.cuisines else "universal"
            s -= 0.15 * cuisine_bias.get(main_c, 0)
            # much stronger ingredient usage penalty
            ing_penalty = 0.0
            for nm in c.names:
                ing_penalty += ingredient_usage.get(str(nm).strip().lower(), 0)
            s -= 0.12 * ing_penalty
            # pairing bonus: if candidate contains any validated pairing, give a boost
            if validated_pairings:
                names_lc = {str(n).strip().lower() for n in c.names}
                for pair in validated_pairings:
                    try:
                        if pair and pair.issubset(names_lc):
                            s += 0.25
                            break
                    except Exception:
                        # pair may not be a set (defensive), try converting
                        try:
                            pset = set([str(x).strip().lower() for x in pair])
                            if pset and pset.issubset(names_lc):
                                s += 0.25
                                break
                        except Exception:
                            continue
            scored.append((c, s))
        scored.sort(key=lambda x:-x[1])
        per_slot_lists[slot]=scored[:30]  # Top-30 for combo search, more variety

    best=None; best_cost=1e9; meta={}
    B=per_slot_lists["breakfast"]; L=per_slot_lists["lunch"]; D=per_slot_lists["dinner"]
    for (cb,sb) in B:
        for (cl,sl) in L:
            for (cd,sd) in D:
                Pday=cb.P+cl.P+cd.P; Cday=cb.C+cl.C+cd.C; Fday=cb.F+cl.F+cd.F
                rel=(abs(Pday-P)/(P+1e-6)+abs(Cday-C)/(C+1e-6)+abs(Fday-F)/(F+1e-6))/3.0
                # prefer combos that use distinct cuisines across the day
                distinct_cuisines = len({(cb.cuisines[0] if cb.cuisines else "universal"),
                                        (cl.cuisines[0] if cl.cuisines else "universal"),
                                        (cd.cuisines[0] if cd.cuisines else "universal")})
                diversity_bonus = 0.04 * distinct_cuisines  # up to 0.12
                quality=(sb+sl+sd)/3.0 + diversity_bonus
                cost=0.65*rel - 0.35*quality
                if cost<best_cost:
                    best_cost=cost; best=(cb,cl,cd); meta={"rel_err":float(rel), "quality":float(quality)}

    b,l,d = best
    out["meals"]["breakfast"]={"names":b.names,"roles":b.roles,"cuisines":b.cuisines,
                               "macros":{"P":b.P,"C":b.C,"F":b.F,"kcal":b.kcal},"price":b.price}
    out["meals"]["lunch"]={"names":l.names,"roles":l.roles,"cuisines":l.cuisines,
                           "macros":{"P":l.P,"C":l.C,"F":l.F,"kcal":l.kcal},"price":l.price}
    out["meals"]["dinner"]={"names":d.names,"roles":d.roles,"cuisines":d.cuisines,
                            "macros":{"P":d.P,"C":d.C,"F":d.F,"kcal":d.kcal},"price":d.price}
    out["info"]=meta
    out["totals"]={"P":b.P+l.P+d.P,"C":b.C+l.C+d.C,"F":b.F+l.F+d.F,"kcal":b.kcal+l.kcal+d.kcal,"price":b.price+l.price+d.price}
    # update diversity trackers and ingredient usage
    for c in [b,l,d]:
        no_repeat_signatures.add(tuple(sorted(c.names)))
        cu = c.cuisines[0] if c.cuisines else "universal"
        cuisine_bias[cu] = cuisine_bias.get(cu, 0) + 1
        for nm in c.names:
            key = str(nm).strip().lower()
            ingredient_usage[key] = ingredient_usage.get(key, 0) + 1
    return out

# --------------- presets -----------
# Presets: (candidate_batch_size, per_slot_top_k)
PRESETS = {
    "fast": (30, 5),        # quick, lower diversity
    "balanced": (180, 15),  # medium speed/diversity (default, was n=360, top-30 -> now halved)
    "quality": (360, 30),   # high diversity (original settings)
    "deep": (720, 50),      # very thorough (slower, highest diversity)
}

def build_week_with_presets(df:pd.DataFrame, P:float,C:float,F:float, allergens:List[str], 
                            preset:str="balanced", validated_pairings:Optional[List[set]] = None) -> Dict[str,Any]:
    """
    Build a week using a named preset to configure generation parameters.
    preset: "fast" | "balanced" | "quality" | "deep"
    """
    if preset not in PRESETS:
        raise ValueError(f"Unknown preset: {preset}. Must be one of {list(PRESETS.keys())}")
    
    batch_size, top_k = PRESETS[preset]
    
    # Temporarily patch generate_batch to use the batch_size
    global RNG
    days=[]; no_repeat=set(); cuisine_bias={}; ingredient_usage={}
    for day in range(1,8):
        day_out = pick_day_with_params(df, P,C,F, allergens, no_repeat, cuisine_bias, ingredient_usage, 
                                        batch_size=batch_size, top_k=top_k, validated_pairings=validated_pairings)
        day_out["day"]=day
        days.append(day_out)
    
    totals={"P":0.0,"C":0.0,"F":0.0,"kcal":0.0,"price":0.0}
    for d in days:
        for sl in SLOTS:
            m=d["meals"][sl]["macros"]
            totals["P"]+=m["P"]; totals["C"]+=m["C"]; totals["F"]+=m["F"]; totals["kcal"]+=m["kcal"]
            totals["price"]+=d["meals"][sl]["price"]
    return {"inputs":{"daily_P":P,"daily_C":C,"daily_F":F,"allergens":allergens,"preset":preset},
            "days":days, "weekly_totals":totals}

def pick_day_with_params(df:pd.DataFrame, P:float,C:float,F:float, allergens:List[str],
                         no_repeat_signatures:set, cuisine_bias:Dict[str,int], ingredient_usage:Dict[str,int],
                         batch_size:int=360, top_k:int=30, validated_pairings:Optional[List[set]] = None) -> Dict[str,Any]:
    """
    Like pick_day but with explicit batch_size and top_k parameters for preset support.
    """
    out={"meals":{}, "info":{}}
    per_slot_tgts = {s: slot_targets(P,C,F,s) for s in SLOTS}
    per_slot_lists: Dict[str, List[Tuple[Cand,float]]] = {}

    for slot in SLOTS:
        pool=filter_pool(df, slot, allergens)
        # Use batch_size parameter instead of hardcoded 360
        cands=generate_batch(pool, slot, n=batch_size)
        RNG.shuffle(cands)
        tg=per_slot_tgts[slot]
        scored=[]
        for c in cands:
            sig = tuple(sorted(c.names))
            if sig in no_repeat_signatures:
                continue
            s=score_candidate(c, slot, tg)
            main_c = c.cuisines[0] if c.cuisines else "universal"
            s -= 0.15 * cuisine_bias.get(main_c, 0)
            ing_penalty = 0.0
            for nm in c.names:
                ing_penalty += ingredient_usage.get(str(nm).strip().lower(), 0)
            s -= 0.12 * ing_penalty
            if validated_pairings:
                names_lc = {str(n).strip().lower() for n in c.names}
                for pair in validated_pairings:
                    try:
                        if pair and pair.issubset(names_lc):
                            s += 0.25
                            break
                    except Exception:
                        try:
                            pset = set([str(x).strip().lower() for x in pair])
                            if pset and pset.issubset(names_lc):
                                s += 0.25
                                break
                        except Exception:
                            continue
            scored.append((c, s))
        scored.sort(key=lambda x:-x[1])
        # Use top_k parameter instead of hardcoded 30
        per_slot_lists[slot]=scored[:top_k]

    best=None; best_cost=1e9; meta={}
    B=per_slot_lists["breakfast"]; L=per_slot_lists["lunch"]; D=per_slot_lists["dinner"]
    for (cb,sb) in B:
        for (cl,sl) in L:
            for (cd,sd) in D:
                Pday=cb.P+cl.P+cd.P; Cday=cb.C+cl.C+cd.C; Fday=cb.F+cl.F+cd.F
                rel=(abs(Pday-P)/(P+1e-6)+abs(Cday-C)/(C+1e-6)+abs(Fday-F)/(F+1e-6))/3.0
                distinct_cuisines = len({(cb.cuisines[0] if cb.cuisines else "universal"),
                                        (cl.cuisines[0] if cl.cuisines else "universal"),
                                        (cd.cuisines[0] if cd.cuisines else "universal")})
                diversity_bonus = 0.04 * distinct_cuisines
                quality=(sb+sl+sd)/3.0 + diversity_bonus
                cost=0.65*rel - 0.35*quality
                if cost<best_cost:
                    best_cost=cost; best=(cb,cl,cd); meta={"rel_err":float(rel), "quality":float(quality)}

    b,l,d = best
    out["meals"]["breakfast"]={"names":b.names,"roles":b.roles,"cuisines":b.cuisines,
                               "macros":{"P":b.P,"C":b.C,"F":b.F,"kcal":b.kcal},"price":b.price}
    out["meals"]["lunch"]={"names":l.names,"roles":l.roles,"cuisines":l.cuisines,
                           "macros":{"P":l.P,"C":l.C,"F":l.F,"kcal":l.kcal},"price":l.price}
    out["meals"]["dinner"]={"names":d.names,"roles":d.roles,"cuisines":d.cuisines,
                            "macros":{"P":d.P,"C":d.C,"F":d.F,"kcal":d.kcal},"price":d.price}
    out["info"]=meta
    out["totals"]={"P":b.P+l.P+d.P,"C":b.C+l.C+d.C,"F":b.F+l.F+d.F,"kcal":b.kcal+l.kcal+d.kcal,"price":b.price+l.price+d.price}
    for c in [b,l,d]:
        no_repeat_signatures.add(tuple(sorted(c.names)))
        cu = c.cuisines[0] if c.cuisines else "universal"
        cuisine_bias[cu] = cuisine_bias.get(cu, 0) + 1
        for nm in c.names:
            key = str(nm).strip().lower()
            ingredient_usage[key] = ingredient_usage.get(key, 0) + 1
    return out

# --------------- weekly planner -----------
def build_week(df:pd.DataFrame, P:float,C:float,F:float, allergens:List[str], validated_pairings:Optional[List[set]] = None) -> Dict[str,Any]:
    days=[]; no_repeat=set(); cuisine_bias={}; ingredient_usage={}
    for day in range(1,8):
        day_out = pick_day(df, P,C,F, allergens, no_repeat, cuisine_bias, ingredient_usage, validated_pairings=validated_pairings)
        day_out["day"]=day
        days.append(day_out)

    totals={"P":0.0,"C":0.0,"F":0.0,"kcal":0.0,"price":0.0}
    for d in days:
        for sl in SLOTS:
            m=d["meals"][sl]["macros"]
            totals["P"]+=m["P"]; totals["C"]+=m["C"]; totals["F"]+=m["F"]; totals["kcal"]+=m["kcal"]
            totals["price"]+=d["meals"][sl]["price"]
    return {"inputs":{"daily_P":P,"daily_C":C,"daily_F":F,"allergens":allergens},
            "days":days, "weekly_totals":totals}

def main():
    ap=argparse.ArgumentParser(description="Weekly meal planner (7 days) from CSV")
    ap.add_argument("--csv", required=True)
    ap.add_argument("--P", type=float, required=True, help="Daily protein target")
    ap.add_argument("--C", type=float, required=True, help="Daily carb target")
    ap.add_argument("--F", type=float, required=True, help="Daily fat target")
    ap.add_argument("--allergens", type=str, default="", help="Comma-separated allergens to avoid")
    ap.add_argument("--out", type=str, default="runs/weekly_plan.json", help="Output JSON path")
    args=ap.parse_args()

    allergens=[a.strip().lower() for a in args.allergens.split(",") if a.strip()] if args.allergens else []
    df=load_csv(args.csv)
    plan=build_week(df, args.P, args.C, args.F, allergens)

    outp=Path(args.out)
    outp.parent.mkdir(parents=True, exist_ok=True)
    with open(outp,"w",encoding="utf-8") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved: {outp}")
    # quick print
    for d in plan["days"]:
        print(f"DAY {d['day']}: rel_err={d['info']['rel_err']:.3f}")
        for sl in SLOTS:
            m=d["meals"][sl]; mac=m["macros"]
            print(f"  {sl.upper()}: {', '.join(m['names'])} | items={len(m['roles'])} | P={mac['P']:.1f} C={mac['C']:.1f} F={mac['F']:.1f}")
    wt=plan["weekly_totals"]
    print(f"WEEK TOTALS: P={wt['P']:.1f} C={wt['C']:.1f} F={wt['F']:.1f} kcal={wt['kcal']:.0f} price={wt['price']:.2f}")

if __name__=="__main__":
    main()
