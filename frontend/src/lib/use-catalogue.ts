"use client";
import { useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { catalogueCar } from "./catalogue";
import type { Car } from "@/data/cars";
export function useCatalogue() {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      queueMicrotask(() => { if (active) { setError("Vehicle availability is temporarily unavailable. Please contact Movara."); setLoading(false); } });
      return () => { active = false; };
    }
    // This connection reads only the public catalogue; it never carries auth tokens.
    const client = new ConvexReactClient(url);
    const watch = client.watchQuery(api.vehicles.publicList, {});
    const update = () => {
      if (!active) return;
      try {
        const data = watch.localQueryResult();
        if (data === undefined) return;
        setCars(data.map(catalogueCar)); setError(""); setLoading(false);
      } catch { setCars([]); setError("Unable to load vehicle availability. Please retry shortly or contact Movara."); setLoading(false); }
    };
    const unsubscribe = watch.onUpdate(update);
    queueMicrotask(update);
    return () => { active = false; unsubscribe(); void client.close(); };
  }, []);
  return { cars, error, loading };
}
