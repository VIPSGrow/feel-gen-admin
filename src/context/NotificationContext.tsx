"use client";
import serverCallFuction from "@/lib/constantFunction";
import { useContext, createContext, useState, useEffect, ReactNode } from "react";

interface NotificationContextType {
    notification: Record<string, any> | null;
    activePopup: any;
    setActivePopup: boolean;
    isLoading: boolean;
}
interface NotiProviderProps {
    children: ReactNode;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotification must be used with NotificationProvider")
    }
    return context;
}

export function NotificationProvider({ children }: NotiProviderProps) {
    const [popups, setPopups] = useState([]); // Multiple popups handle karne ke liye array
    const [barNotifications, setBarNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);    

    // Popup ko close karne ke liye function
const removePopup = (id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
};


    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await serverCallFuction('GET', 'api/notifications');
            if (res.status) {
                // 1. BAR filter karke state mein rakhein
                setBarNotifications(res.data.filter(n => n.display_type === 'BAR'));

                // 2. Separate POPUP notifications
                setPopups(res.data.filter(n => n.display_type === 'POPUP'));
            }
        } catch (err) {
            console.error("Notif Error:", err);
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <NotificationContext.Provider value={{ barNotifications, popups, isLoading,removePopup }}>
            {children}
        </NotificationContext.Provider>
    );
}
export const useNotifications = () => useContext(NotificationContext);