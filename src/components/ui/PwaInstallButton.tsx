"use client";

import React from "react";
import { Download } from "lucide-react";
import { usePwa } from "@/context/PwaContext";

interface PwaInstallButtonProps {
    /** Compact style suitable for headers / bottom bars */
    compact?: boolean;
    className?: string;
}

/**
 * A button that triggers the native PWA install prompt.
 * Only renders when the app is installable (not already installed).
 */
export default function PwaInstallButton({
    compact = false,
    className = "",
}: PwaInstallButtonProps) {
    const { canInstall, installing, installApp, isStandalone } = usePwa();

    // Hide entirely if already installed or install not available
    if (!canInstall || isStandalone) return null;

    if (compact) {
        return (
            <button
                onClick={installApp}
                disabled={installing}
                title="Install App"
                aria-label="Install App"
                className={`inline-flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${className}`}
            >
                <Download className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={installApp}
            disabled={installing}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60 ${className}`}
        >
            <Download className="w-4 h-4" />
            {installing ? "Installing..." : "Install App"}
        </button>
    );
}
