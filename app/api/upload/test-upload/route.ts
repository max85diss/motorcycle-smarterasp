
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No file selected",
                },
                { status: 400 }
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only image files are allowed",
                },
                { status: 400 }
            );
        }

        // Generate unique filename
        const extension =
            path.extname(file.name) || ".jpg";

        const fileName =
            `${Date.now()}-${crypto.randomUUID()}${extension}`;

        // IMPORTANT:
        // Save inside public/uploads/users
        const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "users"
        );

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        const filePath = path.join(
            uploadDir,
            fileName
        );

        const bytes = await file.arrayBuffer();

        await fs.writeFile(
            filePath,
            Buffer.from(bytes)
        );

        // Browser URL
        const imageUrl =
            `/uploads/users/${fileName}`;

        console.log("Upload directory:", uploadDir);
        console.log("Saved file:", filePath);
        console.log("Image URL:", imageUrl);

        return NextResponse.json({
            success: true,
            message: "Photo uploaded successfully",
            url: imageUrl,
            fileName: fileName,
        });

    } catch (error) {

        console.error("Upload error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Photo upload failed",
            },
            { status: 500 }
        );
    }
}

