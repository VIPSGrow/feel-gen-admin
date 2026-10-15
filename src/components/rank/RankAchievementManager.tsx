"use client";

import { useEffect, useState } from "react";
import serverCallFuction from "@/lib/constantFunction";
import RankCongratsModal, {
  RankAchievement,
} from "./RankCongratsModal";

interface PendingAchievementsResponse {
  success?: boolean;
  data?: RankAchievement[];
}

export default function RankAchievementManager() {
  const [achievements, setAchievements] = useState<RankAchievement[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadPendingAchievements = async () => {
      try {
        const response = await serverCallFuction<PendingAchievementsResponse>(
          "GET",
          "api/rank-achievements/pending",
        );

        if (
          !cancelled &&
          response &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          const pending = response.data
            .filter((achievement) => achievement && achievement.id != null)
            .sort((first, second) => first.rank_no - second.rank_no);
          setAchievements(pending);
        }
      } catch {
        // Rank achievements are optional and should not interrupt the dashboard.
      }
    };

    void loadPendingAchievements();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentAchievement = achievements[0] || null;

  const markCurrentAsSeen = async () => {
    if (!currentAchievement) return;

    const [seenAchievement] = achievements;
    setAchievements((pending) => pending.slice(1));

    try {
      await serverCallFuction("POST", "api/rank-achievements/seen", {
        ids: [seenAchievement.id],
      });
    } catch {
      // The achievement has been dismissed locally; a failed acknowledgement is non-blocking.
    }
  };

  return (
    <RankCongratsModal
      achievement={currentAchievement}
      onClose={markCurrentAsSeen}
    />
  );
}
