import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const folder = formData.get("folder")?.toString() || "uploads";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file selected",
        },
        { status: 400 }
      );
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size cannot exceed 5 MB",
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `${folder}/${crypto.randomUUID()}.${extension}`;

    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });

  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Image upload failed",
      },
      { status: 500 }
    );
  }
}