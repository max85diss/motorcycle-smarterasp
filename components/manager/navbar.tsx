
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  username: string;
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <nav className="bg-slate-800 text-white shadow">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold">
            My ERP
          </Link>

          <div className="hidden gap-6 md:flex">
            <Link
              href="/dashboard"
              className="hover:text-blue-300 transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/users"
              className="hover:text-blue-300 transition-colors"
            >
              Users
            </Link>

            <Link
              href="/products"
              className="hover:text-blue-300 transition-colors"
            >
              Products
            </Link>

            <Link
              href="/reports"
              className="hover:text-blue-300 transition-colors"
            >
              Reports
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm md:block">
            Welcome, <strong>{username}</strong>
          </span>

          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

