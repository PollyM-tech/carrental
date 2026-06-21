## Project structure
N/B - USE THIS to check project tree tree -L 4 -I "node_modules|.next|.git"
.
├── convex
│   ├── auth.config.ts
│   ├── authTest.ts
│   ├── auth.ts
│   ├── bookings.ts
│   ├── cars.ts
│   ├── _generated
│   │   ├── api.d.ts
│   │   ├── api.js
│   │   ├── dataModel.d.ts
│   │   ├── server.d.ts
│   │   └── server.js
│   ├── http.ts
│   ├── lib
│   │   └── auth.ts
│   ├── schema.ts
│   ├── settings.ts
│   ├── users.ts
│   └── webhooks.ts
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── about
│   │   │   └── page.tsx
│   │   ├── auth-test
│   │   │   └── page.tsx
│   │   ├── callback
│   │   │   └── route.ts
│   │   ├── cars
│   │   │   └── page.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── bookings
│   │   │   ├── cars
│   │   │   ├── page.tsx
│   │   │   └── settings
│   │   ├── faq
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── services
│   │   │   └── page.tsx
│   │   ├── sign-in
│   │   │   └── route.ts
│   │   ├── sign-out
│   │   │   └── route.ts
│   │   ├── sign-up
│   │   │   └── route.ts
│   │   ├── token-test
│   │   │   └── page.tsx
│   │   └── unauthorized
│   │       └── page.tsx
│   ├── components
│   │   ├── admin
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── BookingsTable.tsx
│   │   │   ├── CarForm.tsx
│   │   │   └── CarsTable.tsx
│   │   ├── forms
│   │   │   └── PublicBookingForm.tsx
│   │   ├── home
│   │   │   ├── BookingForm.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FAQPreview.tsx
│   │   │   ├── FeaturedCars.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ServicesPreview.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── WhyChooseUs.tsx
│   │   ├── layout
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── shared
│   │       ├── EmptyState.tsx
│   │       ├── SectionHeader.tsx
│   │       └── WhatsAppButton.tsx
│   ├── providers
│   │   └── convex-provider.tsx
│   └── proxy.ts
└── tsconfig.json
