"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import serverCallFuction from "@/lib/constantFunction";
import type { RepurchaseReminder } from "@/types/dashboard";

interface Props {
  reminder?: RepurchaseReminder | null;
}

export default function RepurchaseReminderModal({ reminder }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!reminder);
  }, [reminder]);

  if (!reminder) return null;

  const snooze = async () => {
    setOpen(false);
    try {
      await serverCallFuction("POST", "api/dashboard/repurchase-reminder/dismiss");
    } catch {
      // popup is already closed locally
    }
  };

  const purchaseNow = () => {
    setOpen(false);
    router.push("/placed_order");
  };

  const dueDate = new Date(reminder.due_date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Modal isOpen={open} onClose={snooze} showCloseButton={false} className="max-w-md">
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">{reminder.is_overdue ? "⚠️" : "🔔"}</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {reminder.is_overdue ? "Self Repurchase Overdue" : "Self Repurchase Reminder"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {reminder.is_overdue
            ? `Your self repurchase was due on ${dueDate}. Please repurchase now to keep your account active.`
            : `Your self repurchase is due on ${dueDate} (${reminder.days_left} day${reminder.days_left === 1 ? "" : "s"} left).`}
        </p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={snooze}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Remind me later
          </button>
          <button
            onClick={purchaseNow}
            className="rounded-lg bg-brand-500 px-5 py-2 text-sm text-white hover:bg-brand-600"
          >
            Purchase Now
          </button>
        </div>
      </div>
    </Modal>
  );
}
