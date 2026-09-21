"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import serverCallFuction from "@/lib/constantFunction";
import Badge from "../ui/badge/Badge";
import { Download } from "lucide-react";

const DEFAULT_IMG = "/images/placeholder.png";

export default function IDCardCompo() {
    const { user } = useAuth();
    const effectiveUserId = user?.id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [idCardUrls, setIdCardUrls] = useState({
        front: DEFAULT_IMG,
        back: DEFAULT_IMG,
        qr: DEFAULT_IMG,
    });

    const baseUploadUrl = useMemo(() => {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    }, []);

    useEffect(() => {
        let cancelled = false;

        const handleIdCardLogic = async () => {
            if (!effectiveUserId) return;

            // 1. Construct the paths to check
            const frontUrl = `${baseUploadUrl}/uploads/id-cards/${effectiveUserId}/front.jpg`;
            const backUrl = `${baseUploadUrl}/uploads/id-cards/${effectiveUserId}/back.jpg`;
            const qrUrl = `${baseUploadUrl}/uploads/id-cards/${effectiveUserId}/qr.png`;

            setLoading(true);
            setError(null);

            try {
                // 2. Check if the file exists already
                const checkResponse = await fetch(frontUrl, { method: 'HEAD' });

                if (checkResponse.ok) {
                    // Files exist! Set them to state and exit.
                    if (!cancelled) {
                        setIdCardUrls({ front: frontUrl, back: backUrl, qr: qrUrl });
                    }
                } else {
                    // 3. Files don't exist, trigger generation
                    const res = await serverCallFuction("POST", "api/id-cards/generate");

                    if (!cancelled && res.status) {
                        setIdCardUrls({
                            front: res.data.frontUrl || frontUrl,
                            back: res.data.backUrl || backUrl,
                            qr: res.data.qrUrl || qrUrl,
                        });
                    }
                }
            } catch (e: unknown) {
                const err = e as { message?: string };
                if (!cancelled) {
                    setError(err?.message || "Failed to process ID card");
                    // Fallback to constructed URLs even if check fails
                    setIdCardUrls({ front: frontUrl, back: backUrl, qr: qrUrl });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        handleIdCardLogic();

        return () => {
            cancelled = true;
        };
    }, [effectiveUserId, baseUploadUrl]); // Only run when user ID or Base URL changes

    const downloadIdCard = (url: string, side: 'Front' | 'Back') => {
        if (!url || url === DEFAULT_IMG) return;
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = `ID_Card_${side}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            {loading && <div className="text-sm text-gray-600 animate-pulse">Checking ID card status...</div>}
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Front Side */}
                <div className="rounded-xl border p-3 bg-white dark:bg-gray-900 relative">
                    <div className="text-sm font-medium mb-2">Front</div>
                    <Image
                        src={idCardUrls.front}
                        alt="ID Card Front"
                        width={300}
                        height={200}
                        className="w-full h-auto rounded-lg object-contain"
                        unoptimized
                    />
                    <Badge
                        variant="solid"
                        className="absolute top-2 right-2 cursor-pointer flex items-center hover:bg-opacity-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadIdCard(idCardUrls.front, 'Front');
                        }}
                    >
                        <Download className="mr-1" size={16} />
                        <span>Download</span>
                    </Badge>
                </div>

                {/* Back Side */}
                <div className="rounded-xl border p-3 bg-white dark:bg-gray-900 relative">
                    <div className="text-sm font-medium mb-2">Back</div>
                    <Image
                        src={idCardUrls.back}
                        alt="ID Card Back"
                        width={600}
                        height={380}
                        className="w-full h-auto rounded-lg object-contain"
                        unoptimized
                    />
                    <Badge
                        variant="solid"
                        className="absolute top-2 right-2 cursor-pointer flex items-center hover:bg-opacity-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadIdCard(idCardUrls.back, 'Back');
                        }}
                    >
                        <Download className="mr-1" size={16} />
                        <span>Download</span>
                    </Badge>
                </div>

                {/* QR Code */}
                <div className="rounded-xl border p-3 bg-white dark:bg-gray-900">
                    <div className="text-sm font-medium mb-2">QR</div>
                    <div className="flex items-center justify-start gap-4">
                        <Image
                            src={idCardUrls.qr}
                            alt="ID Card QR"
                            width={200}
                            height={200}
                            className="w-48 h-48 rounded-lg object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}