"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import serverCallFuction from "@/lib/constantFunction";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";
import type {
  GenerationCommission,
  MlmPlanResponse,
  MlmRank,
  MlmReward,
  ServerResponse,
} from "@/types/mlm-plan";

const EMPTY_SETTINGS: PlanSettings = {
  mrp: "",
  direct_partner_commission_percentage: "",
  distributor_price: "",
  distributor_price_mode: "",
  distributor_price_percentage: "",
  packets_per_package: "",
  holding_period_days: "",
  maximum_generation_level: "",
};

const LEVELS = [1, 2, 3, 4, 5, 6, 7];
const inputClass = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const valueOf = (value: unknown) => (value === null || value === undefined ? "" : String(value));
const isSuccessful = (response: { status?: boolean; success?: boolean }) => response.status !== false && response.success !== false;

const MlmPlanSettings = () => {
  const { user, hasPermission } = useAuth();
  const isSuperAdmin = hasPermission("mlm-plan") ||
    (user?.role_name || user?.role || "").toLowerCase().includes("super admin");
  const [tab, setTab] = useState<"settings" | "commissions" | "ranks" | "rewards">("settings");
  const [settings, setSettings] = useState<PlanSettings>(EMPTY_SETTINGS);
  const [commissions, setCommissions] = useState<GenerationCommission[]>([]);
  const [ranks, setRanks] = useState<MlmRank[]>([]);
  const [rewards, setRewards] = useState<MlmReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notify = (type: "success" | "error", text: string) => setMessage({ type, text });

  const loadPlan = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await serverCallFuction<MlmPlanResponse>("GET", "api/settings/mlm-plan");
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to load MLM plan");
      const body = response.data || {};
      const rawSettings = body.settings || body.plan_settings || {};
      setSettings({
        ...EMPTY_SETTINGS,
        ...Object.fromEntries(Object.entries(rawSettings).map(([key, value]) => [key, valueOf(value)])),
      });
      setCommissions((body.commissions || body.generation_commissions || []).map((item) => ({
        id: typeof item.id === "number" ? item.id : undefined,
        level: Number(item.level ?? item.level_no),
        level_name: valueOf(item.level_name),
        percentage: valueOf(item.percentage ?? item.commission_percentage),
      })));
      setRanks((body.ranks || []).map((item) => ({
        id: Number(item.id),
        rank_name: valueOf(item.rank_name ?? item.name),
        milestone_threshold: valueOf(item.milestone_threshold ?? item.threshold),
        threshold_type: valueOf(item.threshold_type),
      })));
      setRewards((body.rewards || []).map((item) => ({
        id: typeof item.id === "number" ? item.id : undefined,
        reward_type: valueOf(item.reward_type),
        reward_value: valueOf(item.reward_value),
        reward_description: valueOf(item.reward_description ?? item.description),
      })));
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to load MLM plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) loadPlan();
  }, [isSuperAdmin]);

  const validateNumber = (value: string, label: string, percentage = false) => {
    const number = Number(value);
    if (value.trim() === "" || Number.isNaN(number)) return `${label} is required`;
    if (number < 0) return `${label} cannot be negative`;
    if (percentage && number > 100) return `${label} must be between 0 and 100`;
    return null;
  };

  const saveSettings = async () => {
    const percentageFields = [
      ["Direct Partner Commission", settings.direct_partner_commission_percentage],
      ["Distributor Price", settings.distributor_price_percentage],
    ] as const;
    for (const [label, value] of percentageFields) {
      const error = validateNumber(value, label, true);
      if (error) return notify("error", error);
    }
    for (const [label, value] of [["MRP", settings.mrp], ["Distributor Price", settings.distributor_price], ["Packets per Package", settings.packets_per_package], ["Holding Period Days", settings.holding_period_days]] as const) {
      const error = validateNumber(value, label);
      if (error) return notify("error", error);
    }
    const level = Number(settings.maximum_generation_level);
    if (!Number.isInteger(level) || level < 1 || level > 7) return notify("error", "Maximum Generation Level must be between 1 and 7");

    setSaving(true);
    try {
      const response = await serverCallFuction("PUT", "api/settings/mlm-plan", settings);
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to save plan settings");
      notify("success", "Plan settings saved successfully.");
      await loadPlan();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to save plan settings");
    } finally {
      setSaving(false);
    }
  };

  const saveCommission = async (commission: GenerationCommission) => {
    const percentageError = validateNumber(commission.percentage, `Generation ${commission.level}`, true);
    if (percentageError) return notify("error", percentageError);
    if (!commission.level_name.trim()) return notify("error", `Generation ${commission.level} name is required`);
    setSaving(true);
    try {
      const response = await serverCallFuction("PUT", `api/settings/mlm-plan/commissions/${commission.level}`, {
        level_name: commission.level_name,
        percentage: Number(commission.percentage),
      });
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to save generation commission");
      notify("success", `Generation ${commission.level} commission saved.`);
      await loadPlan();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to save generation commission");
    } finally {
      setSaving(false);
    }
  };

  const saveRank = async (rank: MlmRank) => {
    const thresholdError = validateNumber(rank.milestone_threshold, "Milestone threshold");
    if (thresholdError) return notify("error", thresholdError);
    if (!rank.rank_name.trim() || !rank.threshold_type.trim()) return notify("error", "Rank name and threshold type are required");
    setSaving(true);
    try {
      const response = await serverCallFuction("PUT", `api/settings/mlm-plan/ranks/${rank.id}`, {
        rank_name: rank.rank_name,
        milestone_threshold: Number(rank.milestone_threshold),
        threshold_type: rank.threshold_type,
      });
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to save rank");
      notify("success", "Rank saved successfully.");
      await loadPlan();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to save rank");
    } finally {
      setSaving(false);
    }
  };

  const saveReward = async (reward: MlmReward) => {
    const valueError = validateNumber(reward.reward_value, "Reward value");
    if (valueError) return notify("error", valueError);
    if (!reward.reward_type.trim() || !reward.reward_description.trim()) return notify("error", "Reward type and description are required");
    setSaving(true);
    try {
      const response = await serverCallFuction(reward.id ? "PUT" : "POST", reward.id ? `api/settings/mlm-plan/rewards/${reward.id}` : "api/settings/mlm-plan/rewards", {
        reward_type: reward.reward_type,
        reward_value: Number(reward.reward_value),
        reward_description: reward.reward_description,
      });
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to save reward");
      notify("success", "Reward saved successfully.");
      await loadPlan();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to save reward");
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async (reward: MlmReward) => {
    if (!reward.id) return;
    if (!window.confirm(`Delete reward "${reward.reward_type}"?`)) return;
    setSaving(true);
    try {
      const response = await serverCallFuction("DELETE", `api/settings/mlm-plan/rewards/${reward.id}`) as ServerResponse;
      if (response.status === false || response.success === false) throw new Error(response.message || "Unable to delete reward");
      notify("success", "Reward deleted successfully.");
      await loadPlan();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Unable to delete reward");
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) return <div className="p-6"><div className="rounded-xl border border-error-200 bg-error-50 p-5 text-error-700">Super Admin access is required to manage the MLM plan.</div></div>;
  if (loading) return <div className="p-6 text-center text-gray-500">Loading MLM plan configuration...</div>;

  const updateSettings = (key: keyof PlanSettings, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const updateCommission = (level: number, key: "level_name" | "percentage", value: string) => setCommissions((current) => {
    const existing = current.find((item) => item.level === level);
    if (existing) return current.map((item) => item.level === level ? { ...item, [key]: value } : item);
    return [...current, { level, level_name: key === "level_name" ? value : "", percentage: key === "percentage" ? value : "" }].sort((left, right) => left.level - right.level);
  });
  const updateRank = (id: number, key: keyof MlmRank, value: string) => setRanks((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateReward = (index: number, key: keyof MlmReward, value: string) => setRewards((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MLM Plan Configuration</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage current sponsor and generation commission settings.</p>
      </div>
      {message && <div className={`rounded-lg border p-4 text-sm ${message.type === "success" ? "border-success-200 bg-success-50 text-success-700" : "border-error-200 bg-error-50 text-error-700"}`}>{message.text}</div>}

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
        {(["settings", "commissions", "ranks", "rewards"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`border-b-2 px-4 py-3 text-sm font-medium capitalize ${tab === item ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500"}`}>{item === "settings" ? "Plan Settings" : item === "commissions" ? "Generation Commissions" : item}</button>
        ))}
      </div>

      {tab === "settings" && <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(["mrp", "direct_partner_commission_percentage", "distributor_price", "distributor_price_mode", "distributor_price_percentage", "packets_per_package", "holding_period_days", "maximum_generation_level"] as const).map((key) => (
          <div key={key}><Label>{key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</Label><Input type={key === "distributor_price_mode" ? "text" : "number"} min="0" max={key.includes("percentage") || key.includes("commission") ? "100" : undefined} value={settings[key]} onChange={(event) => updateSettings(key, event.target.value)} /></div>
        ))}
      </div><div className="mt-5"><Button onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Plan Settings"}</Button></div></section>}

      {tab === "commissions" && <section className="space-y-3">{LEVELS.map((level) => { const commission = commissions.find((item) => item.level === level) || { level, level_name: "", percentage: "" }; return <div key={level} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[120px_1fr_180px_auto] md:items-end"><div><Label>Level</Label><p className="h-11 pt-3 font-semibold text-gray-900 dark:text-white">Generation {level}</p></div><div><Label>Level Name</Label><input className={inputClass} value={commission.level_name} onChange={(event) => updateCommission(level, "level_name", event.target.value)} /></div><div><Label>Percentage</Label><input className={inputClass} type="number" min="0" max="100" value={commission.percentage} onChange={(event) => updateCommission(level, "percentage", event.target.value)} /></div><Button onClick={() => saveCommission(commission)} disabled={saving}>Save</Button></div>})}</section>}

      {tab === "ranks" && <section className="space-y-3">{ranks.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No ranks returned by the API.</div> : ranks.map((rank) => <div key={rank.id} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_180px_180px_auto] md:items-end"><div><Label>Rank Name</Label><input className={inputClass} value={rank.rank_name} onChange={(event) => updateRank(rank.id, "rank_name", event.target.value)} /></div><div><Label>Milestone Threshold</Label><input className={inputClass} type="number" min="0" value={rank.milestone_threshold} onChange={(event) => updateRank(rank.id, "milestone_threshold", event.target.value)} /></div><div><Label>Threshold Type</Label><input className={inputClass} value={rank.threshold_type} onChange={(event) => updateRank(rank.id, "threshold_type", event.target.value)} /></div><Button onClick={() => saveRank(rank)} disabled={saving}>Save</Button></div>)}</section>}

      {tab === "rewards" && <section className="space-y-3"><div className="flex justify-end"><Button onClick={() => setRewards((current) => [...current, { reward_type: "", reward_value: "", reward_description: "" }])}>Add Reward</Button></div>{rewards.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No rewards returned by the API.</div> : rewards.map((reward, index) => <div key={reward.id ?? `new-${index}`} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[180px_160px_1fr_auto] md:items-end"><div><Label>Reward Type</Label><input className={inputClass} value={reward.reward_type} onChange={(event) => updateReward(index, "reward_type", event.target.value)} /></div><div><Label>Reward Value</Label><input className={inputClass} type="number" min="0" value={reward.reward_value} onChange={(event) => updateReward(index, "reward_value", event.target.value)} /></div><div><Label>Reward Description</Label><textarea className={`${inputClass} h-20 py-2`} value={reward.reward_description} onChange={(event) => updateReward(index, "reward_description", event.target.value)} /></div><div className="flex flex-col gap-2"><Button onClick={() => saveReward(reward)} disabled={saving}>Save</Button>{reward.id && <Button variant="ghost" onClick={() => deleteReward(reward)} disabled={saving} startIcon={<Trash2 className="w-4 h-4" />}>Delete</Button>}</div></div>)}</section>}
    </div>
  );
};

export default MlmPlanSettings;
