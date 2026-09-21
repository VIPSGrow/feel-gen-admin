"use client"
import serverCallFuction from "@/lib/constantFunction";
import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react"

// Define the shape of a single setting item
interface SettingItem {
    id: number;
    setting_key: string;
    setting_value: any;
    category: string;
    updated_at: string;
}

// Define the Context type
interface SettingContextType {
    settings: Record<string, any> | null; // Stores as { sms_gateway: {...}, tax_config: {...} }
    isLoading: boolean;
    getSettingByKey: (key: string) => any; // Helper to get specific keys
}

interface SettingProviderProps {
    children: ReactNode;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined)

export function useSetting() {
    const context = useContext(SettingContext)
    if (context === undefined) {
        throw new Error("useSetting must be used with SettingProvider");
    }
    return context
}

export function SettingProvider({ children }: SettingProviderProps) {
    const [settings, setSettings] = useState<Record<string, any> | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleFetchSetting = async () => {
        setIsLoading(true);
        try {
            const res = await serverCallFuction('GET', 'api/settings');
            if (res.success && Array.isArray(res.data)) {
                // Transform Array [{setting_key: 'a', setting_value: 'b'}] 
                // into Object { a: 'b' }
                const formattedSettings = res.data.reduce((acc: any, item: SettingItem) => {
                    acc[item.setting_key] = item.setting_value;
                    return acc;
                }, {});
                
                setSettings(formattedSettings);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchSetting();
    }, []);

    // Helper function to get a specific setting by key
    const getSettingByKey = useCallback((key: string) => {
        return settings ? settings[key] : null;
    }, [settings]);

    return (
        <SettingContext.Provider value={{ 
            settings, 
            isLoading, 
            getSettingByKey 
        }}>
            {children}
        </SettingContext.Provider>
    );
}