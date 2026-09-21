"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextValue {
    /** Whether the app can be installed (install prompt available & not yet installed) */
    canInstall: boolean;
    /** Whether the app is currently being installed */
    installing: boolean;
    /** Trigger the native browser install prompt */
    installApp: () => Promise<void>;
    /** Whether the app is running in standalone (installed) mode */
    isStandalone: boolean;
    /** Whether the service worker is registered */
    isSwRegistered: boolean;
}

const PwaContext = createContext<PwaContextValue | undefined>(undefined);

export function PwaProvider({ children }: { children: ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installing, setInstalling] = useState(false);
    const [isSwRegistered, setIsSwRegistered] = useState(false);

    const isStandalone =
        typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone ===
            true);

    // Listen for the beforeinstallprompt event
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setInstalling(false);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return;
        setInstalling(true);
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
            setDeferredPrompt(null);
        }
        setInstalling(false);
    }, [deferredPrompt]);

    const value: PwaContextValue = {
        canInstall: !!deferredPrompt,
        installing,
        installApp,
        isStandalone,
        isSwRegistered,
    };

    return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
    const context = useContext(PwaContext);
    if (!context) {
        throw new Error("usePwa must be used within a PwaProvider");
    }
    return context;
}
