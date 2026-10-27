import type { PublicCar } from "./workflow";
import type { Car } from "@/data/cars";
export function catalogueCar(car: Pick<PublicCar, "_id" | "name" | "category" | "pricePerDay" | "displayImageUrl" | "seats" | "transmission" | "fuel" | "brand" | "model" | "location" | "description" | "isFeatured">): Car {
  return { id: car._id, name: car.name, category: car.category, pricePerDay: car.pricePerDay, image: car.displayImageUrl || "/logo.png", seats: car.seats, transmission: car.transmission, fuel: car.fuel, brand: car.brand || "", model: car.model || "", location: car.location || "Nairobi", description: car.description, isFeatured: car.isFeatured, status: "available" };
}
