import type { Metadata } from "next";
import MlmPlanSettings from "@/components/admin/mlm-plan/MlmPlanSettings";

export const metadata: Metadata = {
  title: "MLM Plan Configuration | Feel Safe Admin",
  description: "Configure sponsor and generation commission settings",
};

export default function MlmPlanPage() {
  return <MlmPlanSettings />;
}
