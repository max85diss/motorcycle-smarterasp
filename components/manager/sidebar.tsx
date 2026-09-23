
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
    href: "/manager",
  },

  {
    title: "User Management",
    children: [
      {
        title: "Users",
        href: "/manager/user/newUser",
      },
      {
        title: "Roles",
        href: "/manager/user/roles",
      },
      {
        title: "Permissions",
        href: "/dashboard/permissions",
      },
    ],
  },

   {title: "Branch Management",
    children: [
      {
        title: "New",
        href: "/manager/branch/add-branch",
      },
      {
        title: "Target",
        href: "/dashboard/roles",
      },
      {
        title: "Performance",
        href: "/dashboard/permissions",
      },
    ],
  },

   {title: "Finance Management",
    children: [
      {
        title: "Cashbook",
        href: "/manager/cashbook/viewCashbook",
      },
      {
        title: "Bankbook",
        href: "/manager/bankbook/view",
      },
      {
        title: "Cheques",
        href: "/manager/bankbook/cheques",
      },
    ],
  },


  {
    title: "Inventory",
    children: [
      {
        title: "Consignments",
        href: "/manager/consignment/create",
      },
      {
        title: "Stock",
        href: "/manager/stock",
      },
      {
        title: "Consignment Other Items",
        href: "/manager/consignment-other-stock/stock-insert",
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
     children: [
      {
        title: "Bike Settings",
        href: "/manager/setting/bike",
      },
      {
        title: "Charge Settings",
        href: "/manager/setting/charge",
      },
       {
        title: "Other Items Settings",
        href: "/manager/setting/other-items",
      },
       {
        title: "Bank Settings",
        href: "/manager/bank-accounts",
      },
    ],
  },

   {
    title: "Aproval",
     children: [
      {
        title: "Consignment",
        href: "/manager/consignment/approval",
      },
     
    ],
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

