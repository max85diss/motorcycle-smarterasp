import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../services/auth.servise";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
export async function POST(req: NextRequest) {

    try {
         const cookieStore = await cookies();
        const body = await req.json();
        console.log(body);
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and Password required" },
                { status: 400 }
            );
        }

        const user = await AuthService.login(username, password);

        console.log(user)

        if (!user) {
            return NextResponse.json(
                { message: "Invalid username or password" },
                { status: 401 }
            );
        }

        const token = await generateToken({
            empCode: user.empCode,
            username: user.username,
            position: user.position,
            location: user.location,
            branchCode: user.branchCode,
            photo: user.photo
        });

        console.log(token)

        const response = NextResponse.json({
            success: true,
            user
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8
        });

         cookieStore.set(
        "branchCode",
        user.branchCode ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );

    cookieStore.set(
        "branchName",
        user.location ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );

    cookieStore.set(
        "empCode",
        user.empCode ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );

    cookieStore.set(
        "empName",
        user.username ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );

    cookieStore.set(
        "position",
        user.position ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );

     cookieStore.set(
        "photo",
        user.photo ?? "",
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        }
    );


        console.log(response);

        return response;

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );

    }
}