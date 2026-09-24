
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo / Shop Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-bold text-white">
              TVS
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Galnewa TVS
              </h1>
              <p className="text-xs text-gray-500">
                Authorized TVS Motorcycle Dealer
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-red-600"
            >
              Home
            </Link>

            <a
              href="#motorcycles"
              className="font-medium text-gray-700 hover:text-red-600"
            >
              Motorcycles
            </a>

            <a
              href="#services"
              className="font-medium text-gray-700 hover:text-red-600"
            >
              Services
            </a>

            <a
              href="#contact"
              className="font-medium text-gray-700 hover:text-red-600"
            >
              Contact
            </a>
          </nav>

          {/* Login */}
          <Link
            href="/login"
            className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-red-950">
        <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">

          {/* Hero Text */}
          <div className="text-white">

            <div className="mb-5 inline-flex rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300">
              Official TVS Motorcycle Dealer
            </div>

            <h2 className="text-5xl font-extrabold leading-tight md:text-6xl">
              Ride Your
              <span className="block text-red-500">
                Dream Bike
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Welcome to Galnewa TVS. Discover reliable, powerful and
              stylish TVS motorcycles with professional service and
              customer care.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="#motorcycles"
                className="rounded-lg bg-red-600 px-7 py-3.5 font-bold text-white transition hover:bg-red-700"
              >
                Explore Motorcycles
              </a>

              <Link
                href="/login"
                className="rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Staff Login
              </Link>

            </div>
          </div>

          {/* Motorcycle Visual */}
          <div className="flex items-center justify-center">
            <div className="relative flex h-[380px] w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur">

              <div className="text-center">
                <div className="text-8xl font-black italic text-red-600">
                  TVS
                </div>

                <div className="mt-4 text-3xl font-bold text-white">
                  GALNEWA
                </div>

                <div className="mt-2 text-sm uppercase tracking-[0.4em] text-gray-400">
                  Motorcycle Showroom
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Motorcycle Section */}
      <section id="motorcycles" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-red-600">
              Our Motorcycles
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Find Your Perfect Ride
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Explore our range of TVS motorcycles and scooters designed
              for performance, comfort and everyday reliability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Card 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-3xl font-bold text-gray-800">
                  TVS
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Motorcycles
              </h3>

              <p className="mt-2 text-gray-600">
                Powerful and reliable motorcycles for everyday riding.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-3xl font-bold text-gray-800">
                  TVS
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Scooters / Moped
              </h3>

              <p className="mt-2 text-gray-600">
                Comfortable, stylish and practical scooters for city life.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-3xl font-bold text-gray-800">
                  TVS
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Genuine Parts
              </h3>

              <p className="mt-2 text-gray-600">
                Genuine TVS spare parts and professional maintenance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-red-600">
              Our Services
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Complete Motorcycle Care
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">

            {[
              ["01", "Sales", "New TVS motorcycles and scooters."],
              ["02", "Service", "Professional motorcycle servicing."],
              ["03", "Spare Parts", "Genuine TVS spare parts."],
              ["04", "Customer Care", "Friendly support for every customer."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-xl border border-gray-200 p-6"
              >
                <span className="text-sm font-bold text-red-600">
                  {number}
                </span>

                <h3 className="mt-3 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Login CTA */}
      <section className="bg-red-600 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center text-white">

          <h2 className="text-3xl font-bold md:text-4xl">
            Galnewa TVS Management System
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-red-100">
            Access sales, stock, service, customers, accounts and
            showroom management.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 font-bold text-red-600 shadow-lg transition hover:bg-gray-100"
          >
            Login to System
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-950 py-10 text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 md:flex-row">

          <div>
            <div className="text-xl font-bold text-white">
              Galnewa TVS
            </div>

            <p className="mt-2 text-sm">
              Authorized TVS Motorcycle Dealer
            </p>
          </div>

          <div className="text-sm md:text-right">
            <p>Galnewa, Sri Lanka</p>
            <p className="mt-1">Sales • Service • Spare Parts</p>
          </div>

        </div>
      </footer>

    </main>
  );
}

