import React, { useState } from 'react';
import { Home, Search, PlusSquare, Heart, User, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PwaInstallButton from '@/components/ui/PwaInstallButton';

const AppBottomBar = () => {
    // Track the active tab state
    const [activeTab, setActiveTab] = useState('home');

    const router = useRouter();

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        console.log(`Navigating to ${tabName}`);

        switch (tabName) {
            case "home":
                router.push("/");
                break;
            case "profile":
                router.push("/profile");
                break;
            case "tree":
                router.push("/network-tree")
                break;
            case "add":
                router.push("/shop")
                break;
            default: // Added colon here
                break;
        }
    };

    // Common styles for the buttons
    const getTabStyles = (tabName) =>
        activeTab === tabName ? 'text-brand-600' : 'text-gray-500 hover:text-brand-400';

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 md:hidden">
            {/* Floating PWA Install button above the bottom bar */}
            <div className="absolute right-4 -top-12">
                <PwaInstallButton compact className="bg-white shadow-theme-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">

                {/* Home */}
                <button
                    onClick={() => handleTabClick('home')}
                    className={`inline-flex flex-col items-center justify-center px-5 group ${getTabStyles('home')}`}
                >
                    <Home className="w-6 h-6 mb-1 transition-colors" />
                    <span className="text-xs">Home</span>
                </button>

                {/* Search */}
                <button
                    onClick={() => handleTabClick('search')}
                    className={`inline-flex flex-col items-center justify-center px-5 group ${getTabStyles('search')}`}
                >
                    <Search className="w-6 h-6 mb-1 transition-colors" />
                    <span className="text-xs">Search</span>
                </button>

                {/* Center Action Button */}
                <button
                    onClick={() => handleTabClick('add')}
                    className="inline-flex flex-col items-center justify-center px-5"
                >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 transition-all ${activeTab === 'add' ? 'bg-brand-700 scale-110' : 'bg-brand-500'}`}>
                        <PlusSquare className="w-6 h-6 text-white" />
                    </div>
                </button>

                {/* Wishlist */}
                <button
                    onClick={() => handleTabClick('tree')}
                    className={`inline-flex flex-col items-center justify-center px-5 group ${getTabStyles('tree')}`}
                >
                    <Network className={`w-6 h-6 mb-1 transition-colors ${activeTab === 'wishlist' ? 'fill-current' : ''}`} />
                    <span className="text-xs">Tree</span>
                </button>

                {/* Profile */}
                <button
                    onClick={() => handleTabClick('profile')}
                    className={`inline-flex flex-col items-center justify-center px-5 group ${getTabStyles('profile')}`}
                >
                    <User className="w-6 h-6 mb-1 transition-colors" />
                    <span className="text-xs">Profile</span>
                </button>

            </div>
        </div>
    );
};

export default AppBottomBar;