"use client";
import { useEffect, useState } from "react";
import { workflow, PublicCar } from "./workflow";
import { catalogueCar } from "./catalogue";
import type { Car } from "@/data/cars";
export function useCatalogue() {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; workflow<PublicCar[]>("workflow/public/cars/", { public: true }).then(rows => { if (active) setCars(rows.map(catalogueCar)); }).catch(error => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return { cars, error, loading };
}
