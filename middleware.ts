import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
    console.log("Middleware:", request.nextUrl.pathname);
    const token = request.cookies.get("token")?.value;

    const pathname = request.nextUrl.pathname;

    console.log(pathname)

    // Public routes
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth/login") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next();
    }

    if (!token) {

        return NextResponse.redirect(new URL("/login", request.url));

    }

    try {

        await jwtVerify(token, secret);
        console.log("token verify:",token)
        return NextResponse.next();

    } catch {

        return NextResponse.redirect(new URL("/login", request.url));

    }

}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/users/:path*",
        "/api/users/:path*",
        "/manager/:path*"
    ]
};