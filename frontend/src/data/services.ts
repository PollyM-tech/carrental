
import {
  BriefcaseBusiness,
  CalendarRange,
  CarFront,
  MapPin,
  Route,
  Users,
} from "lucide-react";

export const services = [
  {
    slug: "self-drive-car-hire",
    title: "Self-Drive Car Hire",
    description:
      "Enjoy the flexibility of travelling at your own pace. Explore our available vehicles for everyday travel, personal errands, and short trips.",
    image: "/lexus.jpeg",
    icon: CarFront,
  },
  {
    slug: "airport-car-collection",
    title: "Airport Car Collection",
    description:
      "Request a convenient vehicle handover or return at JKIA, Wilson Airport, or another agreed location, subject to availability.",
    image: "/mercedes.jpg",
    icon: MapPin,
  },
  {
    slug: "corporate-car-hire",
    title: "Corporate Car Hire",
    description:
      "Explore self-drive rental options for business meetings, work assignments, and professional travel.",
    image: "/lexus.jpeg",
    icon: BriefcaseBusiness,
  },
  {
    slug: "long-term-car-rental",
    title: "Long-Term Car Rental",
    description:
      "Need a vehicle for several days or weeks? Ask about flexible rental periods and available options for extended use.",
    image: "/mercedes.jpg",
    icon: CalendarRange,
  },
  {
    slug: "family-travel",
    title: "Family Travel",
    description:
      "Find a comfortable vehicle suited to family visits, holidays, and shared journeys, with space for passengers and luggage.",
    image: "/familycar.jpg",
    icon: Users,
  },
  {
    slug: "road-trips",
    title: "Road Trips & Getaways",
    description:
      "Plan a weekend escape or longer road trip with a suitable self-drive vehicle from our available fleet.",
    image: "/familycar.jpg",
    icon: Route,
  },
];
