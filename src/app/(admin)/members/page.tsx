"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveTable, Column } from '@/components/tables/ResponsiveTable';
import Badge from "@/components/ui/badge/Badge";
import Avatar from "@/components/ui/avatar/Avatar";
import { Pencil, Plus, Trash2, Eye, Network, File } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

import serverCallFuction from "@/lib/constantFunction";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MemberKYCEditModal from "@/components/members/MemberKYCEditModal";

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  level: number;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  image?: string;
  referrals_count?: number;
  position?: 'left' | 'right';
  // Financial / KYC / nominee / doc fields (may be present from downline response)
  bank_name?: string;
  bankName?: string;
  account_holder_name?: string;
  accountHolderName?: string;
  account_no?: string;
  accountNo?: string;
  ifsc_code?: string;
  ifscCode?: string;
  branch?: string;
  nominee_name?: string;
  nominee_relationship?: string;
  nominee_age?: number | string;
  nominee_contact?: string;
  nominee_aadhaar?: string;
  aadhaar_no?: string;
  aadhaarNo?: string;
  pan_no?: string;
  panNo?: string;
}

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
}

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [isActiveFilter, setIsActiveFilter] = useState<string>(""); // "true", "false", or ""
  const [kycStatusFilter, setKycStatusFilter] = useState<string>(""); // "pending", "approved", "rejected", or ""
  const [statusFilter, setStatusFilter] = useState<string>(""); // "active", "pending", "inactive", or ""

  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });

  // State for the KYC/Financial edit modal (super admin only)
  const [kycEditMember, setKycEditMember] = useState<Member | null>(null);
  const [isKycEditOpen, setIsKycEditOpen] = useState(false);

  const { user } = useAuth();
  const isSuperAdmin =
    user?.role?.toLowerCase() === "super admin" ||
    user?.role_name?.toLowerCase() === "super admin";

  const openKycEdit = (member: Member) => {
    setKycEditMember(member);
    setIsKycEditOpen(true);
  };


  const router = useRouter();

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (isActiveFilter) params.append("is_active", isActiveFilter);
        if (kycStatusFilter) params.append("kyc_status", kycStatusFilter);
        if (statusFilter) params.append("status", statusFilter);
        
        const queryString = params.toString();
        const endpoint = `api/users/downline${queryString ? `?${queryString}` : ""}`;
        
        const res = await serverCallFuction("GET", endpoint);
        if (res && res.status !== false) {
          setMembers(res.data || []);
        } else {
          setError("Failed to fetch members");
        }
      } catch (err) {
        setError("Error fetching members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isActiveFilter, kycStatusFilter, statusFilter]);

  // Filter members
  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const openAdd = () => {
    // setIsEditMode(false);
    // setEditingId(null);
    // setFormData({ name: "", email: "", phone: "", status: "active" });
    // openModal();
    router.push("members/add");
  };

  const openEdit = (member: Member) => {
    setIsEditMode(true);
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      status: member.status,
    });
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await serverCallFuction(
        isEditMode ? "PUT" : "POST",
        isEditMode ? `api/users/downline/${editingId}` : "api/users/downline",
        formData
      );

      if (res && res.status !== false) {
        if (isEditMode) {
          setMembers(members.map((m) => (m.id === editingId ? res.data : m)));
        } else {
          setMembers([res.data, ...members]);
        }
        closeModal();
        setFormData({ name: "", email: "", phone: "", status: "active" });
      }
    } catch (err) {
      alert("Failed to save member");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await serverCallFuction("DELETE", `api/users/downline/${id}`);
      if (res && res.status !== false) {
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch (err) {
      alert("Failed to delete member");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "pending": return "warning";
      default: return "error";
    }
  };

  const memberColumns: Column<Member>[] = [
    {
      header: 'Member',
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar src={m.image || '/images/user/user-01.jpg'} size="medium" alt={m.name} />
          <span className="font-medium text-gray-800 dark:text-white">{m.name}</span>
        </div>
      ),
    },
    { header: 'Email', cell: (m) => m.email },
    { header: 'Phone', cell: (m) => m.phone || 'N/A' },
    { header: 'Level', cell: (m) => `Level ${m.level}` },
    {
      header: 'Status',
      cell: (m) => (
        <Badge size="sm" color={getStatusColor(m.status)}>
          {m.status}
        </Badge>
      ),
    },
    { header: 'Join Date', cell: (m) => new Date(m.created_at).toLocaleDateString() },
    { header: 'Referrals', cell: (m) => m.referrals_count || 0 },
    {
      header: 'Actions',
      cell: (m) => (
        <div className="flex items-center gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => router.push('/network-tree?selectd_id=' + m.id)}>
            <Network className="w-4 h-4" />
          </Button>
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          {isSuperAdmin ? (
            <Button variant="outline" size="sm" onClick={() => openKycEdit(m)}>
              <File className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push('/network-tree?selectd_id=' + m.id)}>
              <File className="w-4 h-4" />
            </Button>
          )}
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-6">Loading members...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Members (Downline)
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your downline members and their details
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search members by name or email..."
              defaultValue={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative">
              <select
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white appearance-none pr-10"
              >
                <option value="">All Active Status</option>
                <option value="true">Active (true)</option>
                <option value="false">Inactive (false)</option>
              </select>
            </div>
            {/* <div className="relative">
              <select
                value={kycStatusFilter}
                onChange={(e) => setKycStatusFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white appearance-none pr-10"
              >
                <option value="">All KYC Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div> */}
            {/* <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white appearance-none pr-10"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}
          </div>
          
          {isSuperAdmin && (
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          )}
          
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl ">
        <ResponsiveTable<Member>
          columns={memberColumns}
          data={filteredMembers}
          keyExtractor={(m) => m.id}
          emptyText={searchTerm ? 'No members found matching search.' : 'No members found.'}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            {isEditMode ? "Edit Member" : "Add New Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberFormData['status'] })}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditMode ? "Update" : "Add"} Member
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* KYC / Financial / Bank / Nominee edit modal (super admin only) */}
      <MemberKYCEditModal
        isOpen={isKycEditOpen}
        onClose={() => setIsKycEditOpen(false)}
        member={kycEditMember}
      />
    </div>
  );
};

export default MembersPage;

