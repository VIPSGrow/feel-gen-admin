"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";

export interface RankReward {
  type?: string;
  value?: string | number | null;
  description?: string | null;
}

export interface RankAchievement {
  id: string | number;
  rank_no: number;
  rank_name: string;
  rewards: RankReward[];
  achieved_at?: string;
}

interface RankCongratsModalProps {
  achievement: RankAchievement | null;
  onClose: () => void;
}

const isCashReward = (reward: RankReward) =>
  reward.type?.toLowerCase() === "cash" ||
  reward.type?.toLowerCase() === "cash_reward";

export default function RankCongratsModal({
  achievement,
  onClose,
}: RankCongratsModalProps) {
  return (
    <Modal
      isOpen={Boolean(achievement)}
      onClose={onClose}
      className="max-w-lg overflow-hidden shadow-2xl"
      showCloseButton
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pb-8 pt-12 text-center sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {Array.from({ length: 24 }, (_, index) => (
            <span
              key={index}
              className="absolute h-2 w-2 animate-pulse rounded-sm bg-yellow-300"
              style={{
                left: `${(index * 41) % 100}%`,
                top: `${(index * 67) % 85}%`,
                transform: `rotate(${index * 37}deg)`,
                opacity: 0.55 + (index % 4) * 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl shadow-lg ring-4 ring-white/30">
          🎉
        </div>
        <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
          Rank achievement
        </p>
        <h2 className="relative z-10 mt-2 text-3xl font-bold text-white">
          Congratulations!
        </h2>
        {achievement && (
          <>
            <p className="relative z-10 mt-3 text-xl font-semibold text-white">
              {achievement.rank_name}
            </p>
            <p className="relative z-10 mt-1 text-sm text-white/80">
              Rank #{achievement.rank_no}
            </p>
          </>
        )}
      </div>

      {achievement && (
        <div className="bg-white p-6 dark:bg-gray-900 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Your rewards
          </h3>
          <ul className="mt-4 space-y-3">
            {achievement.rewards.length > 0 ? (
              achievement.rewards.map((reward, index) => (
                <li
                  key={`${reward.type || "reward"}-${index}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {isCashReward(reward) ? (
                    <span className="font-semibold">
                      Cash reward: {reward.value}
                    </span>
                  ) : (
                    reward.description || String(reward.value || "Reward")
                  )}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 dark:text-gray-400">
                Keep growing to unlock more rewards.
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Continue
          </button>
        </div>
      )}
    </Modal>
  );
}
