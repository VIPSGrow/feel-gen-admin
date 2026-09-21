"use client"

import serverCallFuction from "@/lib/constantFunction";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"


interface WalletItem {
    [key: string]: unknown
}

interface WalletContextType {
    walletData: WalletItem[] | null;
    isLoading: boolean
}

interface WalletProviderProps {
    children: ReactNode
}


const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used with WalletProvider")
    }

    return context
}


export function WalletProvider({ children }: WalletProviderProps) {

    const [walletData, setWalletData] = useState<WalletItem[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    const handleFetchWalle = async () => {
        setIsLoading(true);
        try {
            const res = await serverCallFuction('GET', 'api/wallet/balance');
            if (res.success) {
                setWalletData(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchWalle();
    }, []);


    return <WalletContext.Provider value={{
        walletData,
        isLoading
    }}>{children}</WalletContext.Provider>

}