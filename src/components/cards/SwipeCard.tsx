"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Profile } from "@/types/app";
import { calculateAge } from "@/lib/utils";
import { SWIPE_THRESHOLD, CARD_ROTATION_RANGE } from "@/lib/constants";
import { useState } from "react";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "like" | "dislike" | "superlike") => void;
  isTop: boolean;
}

export default function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-CARD_ROTATION_RANGE, 0, CARD_ROTATION_RANGE]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile.photos || [];
  const currentPhoto = photos[photoIndex];

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset } = info;
    if (offset.x > SWIPE_THRESHOLD) {
      onSwipe("like");
    } else if (offset.x < -SWIPE_THRESHOLD) {
      onSwipe("dislike");
    } else if (offset.y < -SWIPE_THRESHOLD) {
      onSwipe("superlike");
    }
  };

  const nextPhoto = () => {
    if (photoIndex < photos.length - 1) setPhotoIndex(photoIndex + 1);
  };

  const prevPhoto = () => {
    if (photoIndex > 0) setPhotoIndex(photoIndex - 1);
  };

  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={isTop ? { scale: 1 } : { scale: 0.95 }}
      animate={isTop ? { scale: 1 } : { scale: 0.95 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Photo */}
      <div className="w-full h-full bg-tg-secondary relative">
        {currentPhoto ? (
          <img
            src={currentPhoto.url}
            alt={profile.name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tg-hint text-lg">
            Нет фото
          </div>
        )}

        {/* Photo navigation zones */}
        {photos.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-1/3 h-full z-20"
              onClick={prevPhoto}
            />
            <div
              className="absolute right-0 top-0 w-1/3 h-full z-20"
              onClick={nextPhoto}
            />
            {/* Photo indicators */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-30">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i === photoIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Like/Nope/Superlike stamps */}
        <motion.div
          className="absolute top-16 left-6 border-4 border-like text-like px-4 py-2 rounded-lg text-3xl font-black -rotate-12 z-30"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-16 right-6 border-4 border-nope text-nope px-4 py-2 rounded-lg text-3xl font-black rotate-12 z-30"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 border-4 border-superlike text-superlike px-4 py-2 rounded-lg text-3xl font-black z-30"
          style={{ opacity: superlikeOpacity }}
        >
          SUPER
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h2 className="text-2xl font-bold text-white">
            {profile.name}
            {profile.birth_date && (
              <span className="font-normal">
                , {calculateAge(profile.birth_date)}
              </span>
            )}
          </h2>
          {profile.bio && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
