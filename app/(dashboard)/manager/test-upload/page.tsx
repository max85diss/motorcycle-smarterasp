"use client";

import { useState } from "react";

export default function TestUploadPage() {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  }

  async function uploadImage() {

    if (!file) {
      alert("Please select an image");
      return;
    }

    setLoading(true);

    try {

      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "users");

      const response = await fetch("/api/upload/test-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Upload failed"
        );
      }

      setImageUrl(result.url);

      alert("Image uploaded successfully");

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">

      <h1 className="mb-6 text-2xl font-bold">
        Upload User Photo
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {preview && (
        <div className="mb-5">
          <p className="mb-2 font-semibold">
            Preview
          </p>

          <img
            src={preview}
            alt="Preview"
            className="h-48 w-48 rounded-lg object-cover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={uploadImage}
        disabled={!file || loading}
        className="rounded bg-blue-600 px-5 py-2 text-white disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>

      {imageUrl && (
        <div className="mt-8">

          <p className="mb-2 font-semibold">
            Uploaded Image
          </p>

          <img
            src={imageUrl}
            alt="Uploaded"
            className="h-48 w-48 rounded-lg object-cover"
          />

          <p className="mt-3 break-all text-sm">
            {imageUrl}
          </p>

        </div>
      )}

    </div>
  );
}