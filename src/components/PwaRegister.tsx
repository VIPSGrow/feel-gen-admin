"use client";

import { useEffect } from "react";

/**
 * Registers the service worker and updates the PWA context with
 * registration status. Renders nothing by itself.
 */
export default function PwaRegister() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator)
        ) {
            return;
        }

        const register = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });
                console.log("Service Worker registered:", registration.scope);
            } catch (error) {
                console.error("Service Worker registration failed:", error);
            }
        };

        // Register on load
        register();

        // Register on network reconnect (in case it failed earlier)
        let onlineHandler: (() => void) | null = null;
        onlineHandler = () => register();
        window.addEventListener("online", onlineHandler);

        return () => {
            if (onlineHandler) window.removeEventListener("online", onlineHandler);
        };
    }, []);

    return null;
}
