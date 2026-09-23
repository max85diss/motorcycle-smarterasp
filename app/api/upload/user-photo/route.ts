
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
     //const body = await request.json();
    
   
    const formData = await request.formData();
    console.log("Received form data:", formData);
    const oldPhotoPath = formData.get("oldPhotoPath") as string | null;
    console.log("Deleting old photo:", oldPhotoPath);
     deletePhoto(oldPhotoPath);
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file selected.",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "users"
    );

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });
    }

    const extension = path.extname(file.name);

    const fileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000) +
      extension;

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName,
      imageUrl: `/uploads/users/${fileName}`,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Photo upload failed.",
      },
      {
        status: 500,
      }
    );

  }
}



 function deletePhoto(photoPath: string | null)

 {


  if (!photoPath) return;

  const filePath = path.join(
    process.cwd(),
    "public",
    photoPath.replace(/^\//, "")
  );

  

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

}