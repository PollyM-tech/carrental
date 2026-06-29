# MoBri Car Hire

MoBri Car Hire is a modern car rental web application built for a Nairobi-based car hire business. The platform includes a public website where customers can browse vehicles, view car details, send booking requests, contact the business through WhatsApp, and learn about available services. It also includes a protected admin dashboard for managing cars, bookings, business settings, and fleet visibility.

The project is built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Convex**. It is designed to be fast, responsive, mobile-friendly, and easy to deploy on Vercel.

---

## Live Website

Production URL:

```txt
https://carrental-rose.vercel.app/
```

Admin login URL:

```txt
https://carrental-rose.vercel.app/admin-login
```

---

## Project Overview

MoBri Car Hire provides two main experiences:

1. **Public customer website**

   * Homepage with hero section, featured cars, services, FAQs, testimonials, and booking CTA.
   * Public fleet page where customers can view available vehicles.
   * Individual car details pages.
   * Contact and booking page.
   * Services page.
   * FAQ page.
   * Floating WhatsApp button.

2. **Admin dashboard**

   * Admin login using a password-based session.
   * Dashboard overview with fleet and booking statistics.
   * Car management page.
   * Booking management page.
   * Individual booking detail page.
   * Business settings page.
   * Mobile-friendly admin sidebar and header.

---

## Tech Stack

| Technology   | Purpose                                            |
| ------------ | -------------------------------------------------- |
| Next.js      | Frontend framework and routing                     |
| TypeScript   | Type-safe application code                         |
| Tailwind CSS | Styling and responsive UI                          |
| Convex       | Backend database, queries, mutations, file storage |
| Vercel       | Deployment and hosting                             |
| Lucide React | Icons                                              |
| Next/Image   | Optimized image rendering                          |

---

## Main Features

### Public Website

The public side of the website is designed for customers who want to rent a car quickly and easily.

Features include:

* Responsive homepage.
* Premium car hire branding.
* Featured car cards.
* Public cars page.
* Car details page using dynamic route `/cars/[carId]`.
* Contact and booking form.
* WhatsApp inquiry flow.
* FAQ preview and full FAQ page.
* Services page.
* About page.
* Floating WhatsApp button.
* Footer with business contact details.

---

### Admin Dashboard

The admin dashboard is used by the business owner or staff to manage the rental operation.

Features include:

* Password-based admin login.
* Admin session stored using localStorage token.
* Dashboard statistics.
* Fleet summary.
* Recent bookings.
* Car creation, update, status change, featured toggle, and soft delete.
* Booking list and booking status management.
* Booking detail page.
* Business settings management.
* Responsive admin sidebar.
* Responsive admin header with search, notifications, and logout.

---

## Project Structure

```txt
carrental/
├── convex/
│   ├── _generated/
│   ├── lib/
│   │   └── adminAuth.ts
│   ├── admin.ts
│   ├── bookings.ts
│   ├── cars.ts
│   ├── schema.ts
│   └── settings.ts
│
├── public/
│   ├── logo.png
│   ├── lexus.jpeg
│   ├── familycar.jpg
│   ├── mercedes.jpg
│   └── other image assets
│
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── admin-login/
│   │   │   └── page.tsx
│   │   ├── cars/
│   │   │   ├── [carId]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   │   ├── [bookingId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── cars/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── faq/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── BookingsTable.tsx
│   │   │   ├── CarForm.tsx
│   │   │   └── CarsTable.tsx
│   │   ├── home/
│   │   │   ├── AboutUs.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FAQPreview.tsx
│   │   │   ├── FeaturedCars.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ServicesPreview.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── WhyChooseUs.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── shared/
│   │       └── WhatsAppButton.tsx
│   │
│   └── providers/
│       └── convex-provider.tsx
│
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Routes

### Public Routes

| Route           | Description                 |
| --------------- | --------------------------- |
| `/`             | Homepage                    |
| `/about`        | About MoBri Car Hire        |
| `/cars`         | Public fleet page           |
| `/cars/[carId]` | Individual car details page |
| `/contact`      | Contact and booking page    |
| `/faq`          | Full FAQ page               |
| `/services`     | Services page               |

### Admin Routes

| Route                             | Description              |
| --------------------------------- | ------------------------ |
| `/admin-login`                    | Admin login page         |
| `/dashboard`                      | Admin dashboard overview |
| `/dashboard/cars`                 | Manage cars              |
| `/dashboard/bookings`             | Manage bookings          |
| `/dashboard/bookings/[bookingId]` | Booking detail page      |
| `/dashboard/settings`             | Business settings page   |

---

## Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

Example:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

The admin password is stored in Convex environment variables, not in `.env.local`.

Set it using:

```bash
npx convex env set ADMIN_PASSWORD "your_admin_password"
```

To confirm Convex environment variables:

```bash
npx convex env list
```

---

## Installation

Clone the repository:

```bash
git clone your-repository-url
cd carrental
```

Install dependencies:

```bash
npm install
```

Start Convex development server:

```bash
npx convex dev
```

Start the Next.js development server:

```bash
npm run dev
```

Open the app in your browser:

```txt
http://localhost:3000
```

---

## Development Commands

| Command                                        | Purpose                            |
| ---------------------------------------------- | ---------------------------------- |
| `npm run dev`                                  | Start local development server     |
| `npm run build`                                | Create production build            |
| `npm run start`                                | Start production server locally    |
| `npx convex dev`                               | Run Convex development environment |
| `npx convex env list`                          | List Convex environment variables  |
| `npx convex env set ADMIN_PASSWORD "password"` | Set admin password                 |

---

## Admin Access

The admin dashboard is accessed through:

```txt
/admin-login
```

After successful login, the user is redirected to:

```txt
/dashboard
```

The admin login system uses:

* Convex mutation for login.
* Admin password stored in Convex environment variables.
* Admin session token stored in browser localStorage.
* localStorage key:

```txt
mobri_admin_token
```

The admin token is passed to protected Convex queries and mutations.

---

## Convex Backend Overview

The Convex backend handles:

* Cars.
* Bookings.
* Admin sessions.
* Settings.
* Image uploads.
* Public queries.
* Protected admin queries and mutations.

### Important Convex Files

| File                      | Purpose                       |
| ------------------------- | ----------------------------- |
| `convex/schema.ts`        | Database schema               |
| `convex/cars.ts`          | Car queries and mutations     |
| `convex/bookings.ts`      | Booking queries and mutations |
| `convex/admin.ts`         | Admin login/session logic     |
| `convex/settings.ts`      | Business settings logic       |
| `convex/lib/adminAuth.ts` | Admin session guard           |

---

## Car Management

Admins can:

* Add a new car.
* Upload a car image.
* Edit car details.
* Change car status.
* Mark a car as featured.
* Remove a car using soft delete.

Car statuses include:

```txt
available
booked
maintenance
unavailable
```

Public pages only show vehicles that are available and not deleted.

Featured cars appear on the homepage when:

```txt
status = available
isFeatured = true
deletedAt is not set
```

---

## Booking Management

Customers can submit booking requests from the public website.

A booking can include:

* Customer name.
* Customer phone.
* Customer email.
* Selected car.
* Pickup location.
* Return location.
* Pickup date.
* Return date.
* Optional message.

Booking statuses include:

```txt
pending
confirmed
active
completed
cancelled
```

Admins can review and update bookings from the dashboard.

---

## Image Handling

The project uses two types of images:

1. Static images stored in the `public/` folder.
2. Uploaded images stored using Convex file storage.

Next.js image optimization is configured through `next.config.ts`.

When using `next/image` with `fill`, always include a `sizes` prop.

Example:

```tsx
<Image
  src="/logo.png"
  alt="MoBri Car Hire logo"
  fill
  sizes="112px"
  className="object-contain"
/>
```

For hero or above-the-fold images, use `priority`.

Example:

```tsx
<Image
  src="/familycar.jpg"
  alt="MoBri Car Hire vehicle"
  fill
  priority
  sizes="100vw"
  className="object-cover"
/>
```

---

## UI/UX Design System

The app follows a premium car rental design style.

### Brand Colors

| Color            | Hex       | Usage                                         |
| ---------------- | --------- | --------------------------------------------- |
| Dark Navy        | `#06142A` | Main text, admin sidebar, dark cards          |
| Orange           | `#FF6B00` | Primary CTA buttons, highlights               |
| Blue             | `#1E6FD9` | Secondary accent, links, dashboard highlights |
| Light Background | `#f4f7fb` | Page backgrounds                              |
| White            | `#ffffff` | Cards and content surfaces                    |

### Design Principles

* Mobile-first responsiveness.
* Clean and spacious layouts.
* Clear visual hierarchy.
* Strong calls-to-action.
* Rounded cards.
* Soft shadows.
* Good contrast.
* Easy navigation.
* Fast loading pages.
* Accessible buttons and links.

---

## Responsive Design

The project should work well on:

```txt
375px mobile
430px mobile
768px tablet
1024px laptop
1366px desktop
```

Important responsive rules:

* Avoid horizontal scrolling.
* Use `min-w-0` inside flex/grid layouts.
* Tables should become cards on mobile where possible.
* Admin sidebar should slide in on mobile.
* Header controls should fit small screens.
* Dashboard right-side panels should stack on smaller screens.

---

## Deployment

The project is deployed on Vercel.

Before deploying, run:

```bash
npm run build
```

If the build succeeds, push to GitHub:

```bash
git add .
git commit -m "Prepare production deployment"
git push
```

Vercel will automatically redeploy if connected to the GitHub repository.

---

## Vercel Environment Variables

In Vercel, add:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

Path:

```txt
Vercel Dashboard
→ Project
→ Settings
→ Environment Variables
```

After adding or changing environment variables, redeploy the project.

---

## Production Checklist

Before going live, confirm:

* [ ] Homepage loads correctly.
* [ ] Public cars page loads correctly.
* [ ] Car details page opens correctly.
* [ ] Contact form submits booking requests.
* [ ] WhatsApp button opens correctly.
* [ ] FAQ page works.
* [ ] Services page works.
* [ ] Admin login works.
* [ ] Dashboard loads after login.
* [ ] Admin can add cars.
* [ ] Admin can update cars.
* [ ] Admin can change car status.
* [ ] Admin can view bookings.
* [ ] Admin can update booking status.
* [ ] Admin settings update business details.
* [ ] Website works on mobile.
* [ ] Website works on tablet.
* [ ] Website works on laptop.
* [ ] Website works on desktop.
* [ ] `npm run build` passes successfully.

---

## Common Issues and Fixes

### `/faq` returns 404

Make sure this file exists:

```txt
src/app/faq/page.tsx
```

Then restart the development server.

---

### Admin login fails

Check that `ADMIN_PASSWORD` is set in Convex:

```bash
npx convex env list
```

If missing, set it:

```bash
npx convex env set ADMIN_PASSWORD "your_admin_password"
```

---

### Convex URL error on Vercel

Make sure this is added to Vercel environment variables:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

Then redeploy.

---

### Next/Image warning about `sizes`

If an image uses `fill`, add `sizes`.

Example:

```tsx
<Image
  src="/logo.png"
  alt="Logo"
  fill
  sizes="112px"
  className="object-contain"
/>
```

---

### Image 404 errors

Make sure the image exists in the `public/` folder.

Example:

```txt
public/lexus.jpeg
public/familycar.jpg
public/mercedes.jpg
```

Then reference it like:

```tsx
<Image src="/lexus.jpeg" alt="Car" fill sizes="100vw" />
```

---

### Dashboard looks squeezed

Use responsive grid layouts and avoid forcing side panels beside the main content too early.

Recommended pattern:

```tsx
<section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
```

This keeps the right column beside the main content only on very large screens and stacks it below on smaller screens.

---

## Code Quality Guidelines

When editing the project:

* Keep TypeScript strict.
* Avoid `any`.
* Keep components reusable where possible.
* Use clear file names.
* Keep Convex logic separate from UI components.
* Do not expose admin credentials in frontend code.
* Do not remove admin session checks.
* Use accessible button labels.
* Keep mobile responsiveness in mind.
* Run `npm run build` before deployment.

---

## Future Improvements

Possible improvements for future versions:

* Customer account system.
* Online payments.
* Booking calendar.
* Automatic availability checking by date.
* Email confirmations.
* SMS notifications.
* Admin user roles.
* Analytics dashboard.
* Search and filter improvements.
* Better booking invoice/receipt system.
* Customer reviews from real database records.
* Image gallery for each car.
* SEO metadata for each public page.
* Sitemap and robots.txt.
* Blog or travel guide section.

---

## Author

MoBri Car Hire project developed for a Nairobi-based car rental business.

Developer:

```txt
Humphrey Morara
```

---

## License

This project is private and intended for MoBri Car Hire business use.
