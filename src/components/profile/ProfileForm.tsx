"use client";

import { useState } from "react";
import { Gender, LookingFor, Photo } from "@/types/app";
import { MAX_BIO_LENGTH, MIN_AGE } from "@/lib/constants";
import PhotoUploader from "./PhotoUploader";

interface ProfileFormProps {
  initialData?: {
    name: string;
    bio: string;
    birth_date: string;
    gender: Gender;
    looking_for: LookingFor;
    photos: Photo[];
  };
  onSubmit: (data: {
    name: string;
    bio: string;
    birth_date: string;
    gender: Gender;
    looking_for: LookingFor;
  }) => void;
  submitLabel: string;
  isLoading?: boolean;
}

export default function ProfileForm({
  initialData,
  onSubmit,
  submitLabel,
  isLoading,
}: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [birthDate, setBirthDate] = useState(initialData?.birth_date || "");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "male");
  const [lookingFor, setLookingFor] = useState<LookingFor>(
    initialData?.looking_for || "everyone"
  );
  const [photos, setPhotos] = useState<Photo[]>(initialData?.photos || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, bio, birth_date: birthDate, gender, looking_for: lookingFor });
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - MIN_AGE);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4">
      <div>
        <label className="block text-sm font-medium text-tg-hint mb-2">
          Фотографии
        </label>
        <PhotoUploader
          photos={photos}
          onUpload={(p) => setPhotos([...photos, p])}
          onDelete={(id) => setPhotos(photos.filter((p) => p.id !== id))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-hint mb-1">Имя</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl bg-tg-secondary text-tg-text outline-none focus:ring-2 focus:ring-tg-button"
          placeholder="Как тебя зовут?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-hint mb-1">
          Дата рождения
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          max={maxDateStr}
          className="w-full px-4 py-3 rounded-xl bg-tg-secondary text-tg-text outline-none focus:ring-2 focus:ring-tg-button"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-hint mb-2">Пол</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["male", "Мужской"],
            ["female", "Женский"],
            ["other", "Другой"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                gender === value
                  ? "bg-tg-button text-tg-button-text"
                  : "bg-tg-secondary text-tg-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-hint mb-2">
          Кого ищешь
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["male", "Парней"],
            ["female", "Девушек"],
            ["everyone", "Всех"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLookingFor(value)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                lookingFor === value
                  ? "bg-tg-button text-tg-button-text"
                  : "bg-tg-secondary text-tg-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-hint mb-1">
          О себе
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={MAX_BIO_LENGTH}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-tg-secondary text-tg-text outline-none resize-none focus:ring-2 focus:ring-tg-button"
          placeholder="Расскажи о себе..."
        />
        <p className="text-xs text-tg-hint mt-1 text-right">
          {bio.length}/{MAX_BIO_LENGTH}
        </p>
      </div>

      <button
        type="submit"
        disabled={!name || !birthDate || isLoading || photos.length === 0}
        className="w-full py-4 rounded-xl bg-tg-button text-tg-button-text font-semibold disabled:opacity-50 transition-opacity"
      >
        {isLoading ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
