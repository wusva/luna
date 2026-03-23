"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/types/app";

interface MatchModalProps {
  isOpen: boolean;
  matchedUser: Profile | null;
  onChat: () => void;
  onContinue: () => void;
}

export default function MatchModal({
  isOpen,
  matchedUser,
  onChat,
  onContinue,
}: MatchModalProps) {
  const photo = matchedUser?.photos?.find((p) => p.position === 0);

  return (
    <AnimatePresence>
      {isOpen && matchedUser && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Это мэтч!
            </h1>

            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white mb-4">
              {photo ? (
                <img
                  src={photo.url}
                  alt={matchedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-tg-secondary flex items-center justify-center text-3xl">
                  {matchedUser.name[0]}
                </div>
              )}
            </div>

            <p className="text-white text-lg mb-8">
              Вы понравились друг другу с{" "}
              <span className="font-bold">{matchedUser.name}</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={onChat}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold"
              >
                Написать сообщение
              </button>
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-xl bg-white/10 text-white font-medium"
              >
                Продолжить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
