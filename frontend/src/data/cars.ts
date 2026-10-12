
export type CarStatus =
  | "available"
  | "booked"
  | "maintenance";

export type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  pricePerDay: number | null;
  seats: number;
  transmission: string;
  fuel: string;
  location: string;
  status: CarStatus;
  isFeatured: boolean;
};

// Add only confirmed Movara vehicles and rates.
// The array is intentionally empty until real
// fleet information is provided.
export const cars: Car[] = [];

export const featuredCars = cars.filter(
  (car) => car.isFeatured && car.status === "available"
);

export function getCarById(id: string) {
  return cars.find((car) => car.id === id);
}

export function formatPrice(price: number | null) {
  if (price === null) {
    return "Price on request";
  }

  return `KSh ${price.toLocaleString("en-KE")}`;
}
