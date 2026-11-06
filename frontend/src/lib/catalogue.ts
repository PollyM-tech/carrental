import type { PublicCar } from "./workflow";
import type { Car } from "@/data/cars";
const detail = (value: string) => value.trim().toLowerCase() === "to be confirmed" ? "" : value.trim();
export function catalogueCar(car: Pick<PublicCar, "_id" | "name" | "category" | "pricePerDay" | "displayImageUrl" | "seats" | "transmission" | "fuel" | "brand" | "model" | "location" | "description" | "isFeatured" | "imageUrls">): Car {
  return { id: car._id, name: car.name, category: car.category, pricePerDay: car.pricePerDay, image: car.displayImageUrl || "/logo.png", images: car.imageUrls, seats: car.seats, transmission: detail(car.transmission), fuel: detail(car.fuel), brand: car.brand || "", model: car.model || "", location: detail(car.location), description: car.description, isFeatured: car.isFeatured, status: "available" };
}
