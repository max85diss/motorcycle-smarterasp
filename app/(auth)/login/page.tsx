


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();
      console.log(result)
      console.log(result.user.username)
      if (!response.ok) {
       
        setError(result.message || "Login failed.");
        return;
      }
       console.log(response.ok)
        const user = result.user;
        console.log(user)
        // const user = data.user;
         console.log("loginUser",user)
         if(user){
           //const router = useRouter()
           const username = user.username;
           const location = user.location;
           const position = user.position;
     
           console.log(location)
           console.log(position)
           if (position ==="Manager")
           {
             console.log("working")
           //router.replace(`/manager?username=${username}&location=${location}`)
           router.replace("/manager")
     
           }else if (position === "Cashier")
           {
            router.replace("/cashier")
           

           }else if (position ==="Documentation")
           {
             router.replace("/documentation")
           
           }else{
             router.replace("/")
           }
          }

      //router.refresh();
    } catch {
      console.error("Unable to connect to the server.");
      setError("Unable to connect to the server.");
    } finally {
      console.log("finally")
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            ERP System
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>
      </div>
    </main>
  );
}
