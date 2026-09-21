"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import serverCallFuction from "@/lib/constantFunction";
import Badge from "../ui/badge/Badge";
import { Download } from "lucide-react";

const DEFAULT_IMG = "/images/placeholder.png";

interface ApiResponse {
    status: boolean;
    data: {
        frontUrl?: string;
    };
}

export default function WelcomeCompo() {
    const { user } = useAuth();
    const effectiveUserId = user?.id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [welcomeUrl, setWelcomeUrl] = useState({
        front: DEFAULT_IMG,
    });

    const baseUploadUrl = useMemo(() => {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    }, []);

    useEffect(() => {
        // Create an AbortController instance to track this specific execution loop
        const controller = new AbortController();
        const { signal } = controller;
        let cancelled = false;

        const handleWelcomeLetterLogic = async () => {
            if (!effectiveUserId) return;

            const letterUrl = `${baseUploadUrl}/uploads/welcome-letter/${effectiveUserId}/welcome_letter.jpg`;

            setLoading(true);
            setError(null);

            try {
                // Pass the abort signal directly into the HEAD request check
                const checkResponse = await fetch(letterUrl, {
                    method: 'HEAD',
                    signal: signal
                });

                if (checkResponse.ok) {
                    if (!cancelled) {
                        setWelcomeUrl({ front: letterUrl });
                    }
                } else {
                    // Pass the signal inside options if serverCallFuction supports it, 
                    // or rely on the local 'cancelled' flag to ignore stale states.
                    const res = await serverCallFuction("POST", "api/letter/generate", null, { signal }) as ApiResponse;

                    if (!cancelled && res.status) {
                        setWelcomeUrl({
                            front: res.data.frontUrl || letterUrl
                        });
                    }
                }
            } catch (e: unknown) {
                // Filter out native fetch cancellation errors
                if ((e as Error).name === 'AbortError' || cancelled) return;

                const err = e as { message?: string };
                setError(err?.message || "Failed to process welcome letter");
                setWelcomeUrl({ front: letterUrl });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        handleWelcomeLetterLogic();

        // Cleanup: Abort any unfinished network events immediately
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [effectiveUserId, baseUploadUrl]);

    const downloadWelcomeLetter = (url: string) => {
        if (!url || url === DEFAULT_IMG) return;
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = `Welcome_Letter_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            {loading && <div className="text-sm text-gray-600 animate-pulse">Checking welcome letter status...</div>}
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

            <div className="max-w-2xl mx-auto mt-4">
                <div className="rounded-xl border p-4 bg-white dark:bg-gray-900 relative shadow-sm">
                    <div className="text-sm font-medium mb-3 text-gray-500">Your Welcome Letter</div>

                    <div className="relative w-full overflow-hidden rounded-lg border border-gray-100">
                        <Image
                            src={welcomeUrl.front}
                            alt="Feel Safe Welcome Letter"
                            width={700}
                            height={1000}
                            className="w-full h-auto object-contain"
                            unoptimized
                        />
                    </div>

                    <Badge
                        variant="solid"
                        className="absolute top-3 right-3 cursor-pointer flex items-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors px-3 py-1.5 rounded-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadWelcomeLetter(welcomeUrl.front);
                        }}
                    >
                        <Download className="mr-1.5" size={16} />
                        <span className="font-medium text-sm">Download Letter</span>
                    </Badge>
                </div>
            </div>
        </div>
    );
}