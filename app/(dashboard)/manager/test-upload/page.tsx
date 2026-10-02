
"use client";

import { useState } from "react";

export default function TestUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        // Check image
        if (!selectedFile.type.startsWith("image/")) {
            setMessage("Please select an image file.");
            return;
        }

        setFile(selectedFile);
        setMessage("");

        // Create local preview
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);

        // Clear previous uploaded image
        setUploadedImage("");
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select an image first.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload/test-upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Upload failed");
            }

            setMessage("Photo uploaded successfully.");

            // Returned URL from API
            setUploadedImage(result.url);

        } catch (error) {
            console.error(error);

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Upload failed"
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mx-auto max-w-2xl">

                <div className="rounded-lg bg-white p-6 shadow">

                    <h1 className="mb-6 text-2xl font-bold">
                        Photo Upload
                    </h1>

                    {/* File selection */}
                    <div className="mb-4">

                        <label className="mb-2 block text-sm font-medium">
                            Select Photo
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full rounded border p-2"
                        />

                    </div>

                    {/* Local Preview */}
                    {preview && (
                        <div className="mb-6">

                            <h2 className="mb-2 text-lg font-semibold">
                                Preview
                            </h2>

                            <div className="flex justify-center rounded-lg border bg-gray-50 p-4">

                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-80 max-w-full rounded object-contain"
                                />

                            </div>

                        </div>
                    )}

                    {/* Upload button */}
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {uploading
                            ? "Uploading..."
                            : "Upload Photo"}
                    </button>

                    {/* Message */}
                    {message && (
                        <p className="mt-4 text-sm">
                            {message}
                        </p>
                    )}

                </div>

                {/* Uploaded image */}
                {uploadedImage && (
                    <div className="mt-6 rounded-lg bg-white p-6 shadow">

                        <h2 className="mb-4 text-lg font-semibold">
                            Uploaded Photo
                        </h2>

                        <div className="flex justify-center rounded-lg border bg-gray-50 p-4">

                            <img
                                src={uploadedImage}
                                alt="Uploaded"
                                className="max-h-96 max-w-full rounded object-contain"
                            />

                        </div>

                        <p className="mt-4 break-all text-sm text-gray-600">
                            URL: {uploadedImage}
                        </p>

                    </div>
                )}

            </div>

        </div>
    );
}

