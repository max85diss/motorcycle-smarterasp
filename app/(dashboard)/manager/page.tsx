
import Image from "next/image";
import Navbar from "../../../components/created/navbar";
import Sidebar from "../../../components/created/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function Dashboard() {
  // Replace this with getCurrentUser() or your /api/auth/me data

   const user1 = await getCurrentUser();
   console.log(user1)
  const user = {
    username: user1?.username,
    position: user1?.position,
    location:user1?.location,
    photo: user1?.photo || "/images/user.png",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      

      <div className="flex">
       

        <main className="flex-1 p-6">

          {/* Welcome Card */}

          <div className="mb-6 rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-5">

                <Image
                  src={user.photo}
                  width={80}
                  height={80}
                  alt="User"
                  className="rounded-full border-4 border-blue-500"
                />

                <div>
                  <h1 className="text-3xl font-bold">
                    {user.username}
                  </h1>

                  <p className="text-gray-600">
                    {user.position}
                  </p>

                  <p className="text-gray-500">
                    📍 {user.location}
                  </p>
                </div>

              </div>

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Welcome Back
                </p>

                <h2 className="text-2xl font-semibold text-blue-600">
                  ERP Dashboard
                </h2>

              </div>

            </div>
          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Users</p>

              <h2 className="mt-2 text-4xl font-bold">
                256
              </h2>

              <p className="mt-3 text-green-600">
                +12 Today
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Products</p>

              <h2 className="mt-2 text-4xl font-bold">
                1420
              </h2>

              <p className="mt-3 text-green-600">
                +8 New
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Orders</p>

              <h2 className="mt-2 text-4xl font-bold">
                324
              </h2>

              <p className="mt-3 text-red-600">
                -5 Pending
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Revenue</p>

              <h2 className="mt-2 text-4xl font-bold">
                $52,640
              </h2>

              <p className="mt-3 text-green-600">
                +18%
              </p>
            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-4 text-xl font-semibold">
                Recent Activities
              </h2>

              <ul className="space-y-3">

                <li className="rounded bg-gray-100 p-3">
                  User logged into the system
                </li>

                <li className="rounded bg-gray-100 p-3">
                  Product inventory updated
                </li>

                <li className="rounded bg-gray-100 p-3">
                  New sales order created
                </li>

                <li className="rounded bg-gray-100 p-3">
                  Report generated
                </li>

              </ul>

            </div>

            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="mb-4 text-xl font-semibold">
                Profile
              </h2>

              <table className="w-full">

                <tbody>

                  <tr className="border-b">
                    <td className="py-3 font-semibold">
                      Name
                    </td>
                    <td>{user.username}</td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-3 font-semibold">
                      Position
                    </td>
                    <td>{user.position}</td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-3 font-semibold">
                      Location
                    </td>
                    <td>{user.location}</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-semibold">
                      Status
                    </td>
                    <td className="text-green-600">
                      Online
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

