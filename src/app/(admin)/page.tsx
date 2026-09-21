import type { Metadata } from "next";
import React from "react";
import DashboardCompo from "@/components/DashboardCompo";

export const metadata: Metadata = {
  title:
    "Feel safe | Dashboard",
  description: "Feel Safe Description",
};

export default function Ecommerce() {


  return (
    <>
      <DashboardCompo />
    </>
  );
}

