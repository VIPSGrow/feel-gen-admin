"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/context/AuthContext";
import serverCallFuction from "@/lib/constantFunction";

interface Reward {
  id: number;
  rank_id: number;
  rank_no: number;
  rank_name: string;
  reward_type: string;
  reward_value: string;
  reward_description: string;
  created_at?: string;
}

interface Rank {
  id: number;
  rank_name: string;
  rank_no?: number;
}

interface FormData {
  rank_id: string;
  reward_type: string;
  reward_value: string;
  reward_description: string;
}

const EMPTY_FORM: FormData = {
  rank_id: "",
  reward_type: "cash",
  reward_value: "",
  reward_description: "",
};

const isSuccessful = (response: { status?: boolean; success?: boolean }) =>
  response.status !== false && response.success !== false;

export default function MlmRewards() {
  const { hasPermission } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRewards = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await serverCallFuction<{ success?: boolean; status?: boolean; message?: string; data?: Reward[] }>(
        "GET",
        "api/settings/mlm-plan/rewards",
      );
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to load rewards");
      setRewards(response.data || []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load rewards");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRanks = useCallback(async () => {
    try {
      const response = await serverCallFuction<{
        success?: boolean;
        status?: boolean;
        data?: { ranks?: Array<Record<string, unknown>> };
      }>("GET", "api/settings/mlm-plan");
      if (!isSuccessful(response)) return;
      setRanks((response.data?.ranks || []).map((rank) => ({
        id: Number(rank.id),
        rank_name: String(rank.rank_name ?? rank.name ?? ""),
        rank_no: rank.rank_no ? Number(rank.rank_no) : undefined,
      })));
    } catch {
      // The reward list remains usable when rank loading fails.
    }
  }, []);

  useEffect(() => {
    loadRewards();
    loadRanks();
  }, [loadRanks, loadRewards]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setCurrentReward(null);
  };

  const openCreate = () => {
    resetForm();
    openModal();
  };

  const openEdit = (reward: Reward) => {
    setCurrentReward(reward);
    setFormData({
      rank_id: String(reward.rank_id),
      reward_type: reward.reward_type,
      reward_value: reward.reward_value,
      reward_description: reward.reward_description,
    });
    openModal();
  };

  const handleSubmit = async () => {
    if (!formData.rank_id || !formData.reward_type.trim() || !formData.reward_value || !formData.reward_description.trim()) {
      setError("Rank, reward type, value, and description are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const endpoint = currentReward
        ? `api/settings/mlm-plan/rewards/${currentReward.id}`
        : "api/settings/mlm-plan/rewards";
      const body = {
        ...(currentReward ? {} : { rank_id: Number(formData.rank_id) }),
        reward_type: formData.reward_type.trim(),
        reward_value: Number(formData.reward_value),
        reward_description: formData.reward_description.trim(),
      };
      const response = await serverCallFuction(currentReward ? "PUT" : "POST", endpoint, body);
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to save reward");
      closeModal();
      resetForm();
      await loadRewards();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save reward");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (!window.confirm(`Delete the ${reward.rank_name} reward?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await serverCallFuction("DELETE", `api/settings/mlm-plan/rewards/${reward.id}`);
      if (!isSuccessful(response)) throw new Error(response.message || "Unable to delete reward");
      await loadRewards();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete reward");
    } finally {
      setSaving(false);
    }
  };

  const canManage = hasPermission("rewards/add");

  if (loading) return <div className="p-6 text-center">Loading rewards...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rank Rewards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage rewards assigned to MLM ranks</p>
        </div>
        {canManage && <Button onClick={openCreate} startIcon={<Plus className="h-4 w-4" />}>New Reward</Button>}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="min-w-[900px] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-6 py-4 text-left text-gray-100 dark:text-white">Rank</TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-gray-100 dark:text-white">Type</TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-gray-100 dark:text-white">Value</TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-gray-100 dark:text-white">Description</TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-gray-100 dark:text-white">Created</TableCell>
                {canManage && <TableCell isHeader className="px-6 py-4 text-right text-gray-100 dark:text-white">Actions</TableCell>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.length === 0 ? (
                <TableRow><TableCell className="px-6 py-10 text-center text-gray-500" colSpan={canManage ? 6 : 5}>No rewards found.</TableCell></TableRow>
              ) : rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="px-6 py-4 font-semibold text-gray-900 dark:text-white">({reward.rank_no}) {reward.rank_name}</TableCell>
                  <TableCell className="px-6 py-4"><Badge color="primary" variant="solid" size="sm">{reward.reward_type}</Badge></TableCell>
                  <TableCell className="px-6 py-4 font-semibold text-emerald-600">{reward.reward_value}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{reward.reward_description}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{reward.created_at ? new Date(reward.created_at).toLocaleDateString() : "-"}</TableCell>
                  {canManage && <TableCell className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => openEdit(reward)} startIcon={<Pencil className="h-4 w-4" />} /><Button variant="ghost" size="sm" onClick={() => handleDelete(reward)} disabled={saving} startIcon={<Trash2 className="h-4 w-4 text-red-500" />} /></div></TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => { closeModal(); resetForm(); }} className="w-xl">
        <div className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentReward ? "Edit Reward" : "New Reward"}</h2>
          <div><Label>Rank</Label><select value={formData.rank_id} onChange={(event) => setFormData((current) => ({ ...current, rank_id: event.target.value }))} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="" disabled>Select a rank</option>{ranks.map((rank) => <option key={rank.id} value={rank.id}>{rank.rank_no ? `(${rank.rank_no}) ${rank.rank_name}` : rank.rank_name}</option>)}</select></div>
          <div><Label>Reward Type</Label><Input value={formData.reward_type} onChange={(event) => setFormData((current) => ({ ...current, reward_type: event.target.value }))} placeholder="cash" /></div>
          <div><Label>Reward Value</Label><Input type="number" min="0" value={formData.reward_value} onChange={(event) => setFormData((current) => ({ ...current, reward_value: event.target.value }))} /></div>
          <div><Label>Reward Description</Label><TextArea value={formData.reward_description} onChange={(value) => setFormData((current) => ({ ...current, reward_description: value }))} rows={4} /></div>
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={closeModal}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save Reward"}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
