
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
  title: string;
  href?: string;
  children?: {
    title: string;
    href: string;
  }[];
}

const menus: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },

  {
    title: "User Management",
    children: [
      {
        title: "Users",
        href: "/dashboard/users",
      },
      {
        title: "Roles",
        href: "/dashboard/roles",
      },
      {
        title: "Permissions",
        href: "/dashboard/permissions",
      },
    ],
  },

  {
    title: "Inventory",
    children: [
      {
        title: "Products",
        href: "/dashboard/products",
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
      },
      {
        title: "Suppliers",
        href: "/dashboard/suppliers",
      },
    ],
  },

  {
    title: "Sales",
    children: [
      {
        title: "Orders",
        href: "/dashboard/orders",
      },
      {
        title: "Customers",
        href: "/dashboard/customers",
      },
      {
        title: "Invoices",
        href: "/dashboard/invoices",
      },
    ],
  },

  {
    title: "Reports",
    children: [
      {
        title: "Sales Report",
        href: "/dashboard/reports/sales",
      },
      {
        title: "Inventory Report",
        href: "/dashboard/reports/inventory",
      },
    ],
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
  },
];


export default function Sidebar() {

  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<string[]>([]);


  function toggleMenu(title: string) {

    setOpenMenus((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );

  }


  return (

    <aside className="
      h-[calc(100vh-64px)]
      w-64
      bg-slate-900
      text-white
      shadow-lg
      overflow-y-auto
    ">

      <nav className="p-4">

        <ul className="space-y-2">


          {menus.map((menu) => (

            <li key={menu.title}>


              {/* Single Menu */}

              {menu.href && (

                <Link
                  href={menu.href}
                  className={`
                    block
                    rounded-md
                    px-4
                    py-3
                    ${
                      pathname === menu.href
                      ? "bg-blue-600"
                      : "hover:bg-slate-800"
                    }
                  `}
                >
                  {menu.title}
                </Link>

              )}



              {/* Parent Menu */}

              {menu.children && (

                <>

                  <button
                    onClick={() => toggleMenu(menu.title)}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-md
                      px-4
                      py-3
                      hover:bg-slate-800
                    "
                  >

                    <span>
                      {menu.title}
                    </span>


                    <span>
                      {
                        openMenus.includes(menu.title)
                          ? "−"
                          : "+"
                      }
                    </span>


                  </button>


                  {
                    openMenus.includes(menu.title) && (

                      <ul className="
                        mt-1
                        space-y-1
                        pl-5
                      ">


                        {
                          menu.children.map((child) => (

                            <li key={child.href}>

                              <Link
                                href={child.href}
                                className={`
                                  block
                                  rounded-md
                                  px-3
                                  py-2
                                  text-sm
                                  ${
                                    pathname === child.href
                                    ? "bg-blue-600"
                                    : "text-slate-300 hover:bg-slate-800"
                                  }
                                `}
                              >
                                {child.title}
                              </Link>

                            </li>

                          ))
                        }


                      </ul>

                    )
                  }

                </>

              )}


            </li>

          ))}


        </ul>

      </nav>

    </aside>

  );
}

