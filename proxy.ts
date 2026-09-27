import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {

    const { pathname } = request.nextUrl;

    console.log("Middleware:", pathname);

    // Public routes
    const publicRoutes = [
        "/login",
        "/api/auth/login",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
        pathname === route || pathname.startsWith(route + "/")
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    // No token
    if (!token) {

        // API request
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                { status: 401 }
            );
        }

        // Normal page
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    try {

        const { payload } = await jwtVerify(
            token,
            secret
        );

        console.log("Authenticated user:", payload);

        return NextResponse.next();

    } catch (error) {

        console.log("Invalid token");

        // API request
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token"
                },
                { status: 401 }
            );
        }

        // Normal page
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }
}

export const config = {
    matcher: [
        /*
         * Run middleware on all application routes except
         * Next.js internal files and static files.
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};