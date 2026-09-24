import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../services/auth.servise";
import { generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and Password required",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Login
    // -----------------------------------------

    const user = await AuthService.login(username, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // Generate JWT
    // -----------------------------------------

    const token = await generateToken({
      empCode: user.empCode,
      username: user.username,
      position: user.position,
      location: user.location,
      branchCode: user.branchCode,
      photo: user.photo,
    });

    // -----------------------------------------
    // Create response
    // -----------------------------------------

    const response = NextResponse.json({
      success: true,
      user,
    });

    // -----------------------------------------
    // Cookie options
    // -----------------------------------------

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 8,
    };

    // -----------------------------------------
    // Authentication cookie
    // -----------------------------------------

    response.cookies.set("token", token, cookieOptions);

    // -----------------------------------------
    // User/branch cookies
    // -----------------------------------------

    response.cookies.set(
      "branchCode",
      user.branchCode ?? "",
      cookieOptions
    );

    response.cookies.set(
      "branchName",
      user.location ?? "",
      cookieOptions
    );

    response.cookies.set(
      "empCode",
      user.empCode ?? "",
      cookieOptions
    );

    response.cookies.set(
      "empName",
      user.username ?? "",
      cookieOptions
    );

    response.cookies.set(
      "position",
      user.position ?? "",
      cookieOptions
    );

    response.cookies.set(
      "photo",
      user.photo ?? "",
      cookieOptions
    );

    // -----------------------------------------
    // Return SAME response
    // -----------------------------------------

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}