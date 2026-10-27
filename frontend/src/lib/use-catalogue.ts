"use client";
import { useEffect, useState } from "react";
import type { PublicCar } from "./workflow";
import { catalogueCar } from "./catalogue";
import type { Car } from "@/data/cars";
export function useCatalogue() {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/catalogue", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load vehicles.");
        if (active) { setCars((data as PublicCar[]).map(catalogueCar)); setError(""); }
      } catch(e) { if (active) setError(e instanceof Error ? e.message : "Unable to load vehicles."); }
      finally { if (active) setLoading(false); }
    };
    void load(); window.addEventListener("focus", load);
    return () => { active = false; window.removeEventListener("focus", load); };
  }, []);
  return { cars, error, loading };
}
