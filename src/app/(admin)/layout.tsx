"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';
import React from 'react';
import AppBottomBar from '@/layout/AppBottomBar';
import ChatBot from '@/components/chatbot/ChatBot';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  useEffect(() => {

    if (!isLoading && !user) {
      router.replace('/signin');
    } else if (user?.kyc_status === false) {
      if (user?.role === 'Super Admin') {

      } else {
        router.replace('/kyc');
      }
    } else if (user?.is_active === false) {
      if (user?.role === 'Super Admin') {

      } else {
        router.replace('/activation');
      }
    }
  }, [user, role, router, isLoading]);

  if (!user) {
    return <div>Loading...</div>; // Or redirect spinner
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 main-body transition-all duration-300 ease-in-out min-h-screen ${mainContentMargin}`}>
        <AppHeader />
        <div className=" mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>

        <AppBottomBar />
        <ChatBot />
      </div>
    </div>
  );
}
