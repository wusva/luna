"use client";

import { useState, useRef } from "react";
import { Photo } from "@/types/app";
import { MAX_PHOTOS } from "@/lib/constants";

interface PhotoUploaderProps {
  photos: Photo[];
  onUpload: (photo: Photo) => void;
  onDelete: (photoId: string) => void;
}

export default function PhotoUploader({
  photos,
  onUpload,
  onDelete,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Resize image client-side
      const resized = await resizeImage(file, 1080);
      const formData = new FormData();
      formData.append("file", resized);

      const res = await fetch("/api/photos", { method: "POST", body: formData });
      if (res.ok) {
        const photo = await res.json();
        onUpload(photo);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (photoId: string) => {
    const res = await fetch(`/api/photos?id=${photoId}`, { method: "DELETE" });
    if (res.ok) onDelete(photoId);
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] || null);

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((photo, i) => (
        <div
          key={photo?.id || `slot-${i}`}
          className="relative aspect-[3/4] rounded-xl overflow-hidden bg-tg-secondary"
        >
          {photo ? (
            <>
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs"
              >
                ×
              </button>
            </>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading || photos.length >= MAX_PHOTOS}
              className="w-full h-full flex items-center justify-center text-tg-hint"
            >
              {uploading && i === photos.length ? (
                <div className="w-6 h-6 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
          )}
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}

function resizeImage(file: File, maxSize: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85
      );
    };
    img.src = URL.createObjectURL(file);
  });
}
