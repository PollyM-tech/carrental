## Project structure

carrental/
├── convex/
│   ├── schema.ts
│   ├── cars.ts
│   ├── bookings.ts
│   ├── users.ts
│   └── _generated/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── booking/
│   │   │   │   └── page.tsx
│   │   │   ├── fleet/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── BookingBar.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── FeaturedCars.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── AboutUs.tsx
│   │   │   ├── WhyChooseUs.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FloatingWhatsApp.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── assets/
│   │   │   ├── Logo.png
│   │   │   ├── hero.png
│   │   │   ├── affordable-car.png
│   │   │   ├── executive-suv.png
│   │   │   ├── midrange-suv.png
│   │   │   └── group-van.png
│   │   │
│   │   ├── data/
│   │   │   └── cars.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── convex.ts
│   │   │   ├── utils.ts
│   │   │   └── whatsapp.ts
│   │   │
│   │   └── providers/
│   │       └── ConvexProvider.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   └── .env.local
│
├── package.json
├── package-lock.json
├── node_modules/
├── .gitignore
└── README.md