import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const oldPhotoPath =
      formData.get("oldPhotoPath") as string | null;

    const file = formData.get("file") as File | null;

    console.log("Old photo:", oldPhotoPath);

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file selected.",
        },
        { status: 400 }
      );
    }

    // Check image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    // Optional: 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size cannot exceed 5 MB.",
        },
        { status: 400 }
      );
    }

    /*
     * Delete old photo
     */
    if (oldPhotoPath) {
      try {
        await del(oldPhotoPath);

        console.log(
          "Old photo deleted:",
          oldPhotoPath
        );
      } catch (error) {
        console.error(
          "Failed to delete old photo:",
          error
        );
      }
    }

    /*
     * Generate new file name
     */
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `users/${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}.${extension}`;

    /*
     * Upload to Vercel Blob
     */
    const blob = await put(
      fileName,
      file,
      {
        access: "public",
        addRandomSuffix: false,
      }
    );

    console.log("Uploaded:", blob.url);

    return NextResponse.json({
      success: true,

      fileName: blob.pathname,

      imageUrl: blob.url,

      url: blob.url,
    });

  } catch (error) {

    console.error(
      "Photo upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Photo upload failed.",
      },
      { status: 500 }
    );
  }
}