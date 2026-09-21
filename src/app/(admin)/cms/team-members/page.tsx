"use client";

import React, { useEffect, useState } from "react";
// import Image from "next/image"; // Removed - Next.js 15+ Image conflict with native Image
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Avatar from "@/components/ui/avatar/Avatar";
import { Pencil, Plus, Trash } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import serverCallFuction from "@/lib/constantFunction";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  image?: string;
  bio?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Mock data based on existing patterns
// Temporary mock data matching schema - will replace with server fetch
const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Lindsey Curtis",
    title: "Team Lead",
    image: "/images/user/user-17.jpg",
    bio: "Experienced team leader with 10+ years...",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Kaiya George",
    title: "Project Manager",
    image: "/images/user/user-18.jpg",
    bio: "Skilled project manager...",
    status: "active",
    created_at: "2024-01-16T14:20:00Z",
    updated_at: "2024-01-16T14:20:00Z",
  },
  // ... more abbreviated for match
];

const TeamMembersPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    image: "",
    bio: "",
    status: "active",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');



  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      try {
        const res = await serverCallFuction("GET", "api/static/teamMember");
        if (isMounted && res.success) {
          setTeamMembers(res.data);
        }
      } catch (error) {
        // handle error if needed
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  const filteredMembers = teamMembers?.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setIsEditMode(false);
    setFormData({ name: "", title: "", image: "", bio: "", status: "active" });
    setSelectedImageFile(null);
    setImagePreview('');
    setImageError('');
    openModal();
  };

  const openEdit = (member: TeamMember) => {
    setIsEditMode(true);
    setEditingId(member.id);
    setFormData({
      name: member.name,
      title: member.title,
      image: member.image || '',
      bio: member.bio || '',
      status: member.status,
    });
    setSelectedImageFile(null);
    setImagePreview(member.image || '');
    setImageError('');
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate image if new file selected
    if (selectedImageFile && imageError) {
      alert(imageError);
      return;
    }

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('title', formData.title);
      submitFormData.append('bio', formData.bio);
      submitFormData.append('status', formData.status);

      if (selectedImageFile) {
        submitFormData.append('image', selectedImageFile);
      } else if (formData.image) {
        submitFormData.append('imageUrl', formData.image);
      }

      const endpoint = isEditMode && editingId
        ? `api/static/teamMember/${editingId}`
        : 'api/static/teamMember';

      const res = await serverCallFuction(
        isEditMode ? "PUT" : "POST",
        endpoint,
        submitFormData
      );

      if (res.success) {
        if (isEditMode) {
          setTeamMembers(teamMembers.map((m) => (m.id === editingId ? res.data : m)));
        } else {
          setTeamMembers((prev) => [res.data, ...prev]);
        }
      }

      // Reset Form and Close Modal
      setFormData({ name: "", title: "", image: "", bio: "", status: "active" });
      setSelectedImageFile(null);
      setImagePreview('');
      setImageError('');
      setEditingId(null);
      setIsEditMode(false);
      closeModal();
    } catch (error) {
      console.error("Error saving team member:", error);
      alert("Failed to save member. Please try again.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    // Size validation: 50KB to 200KB
    const minSize = 50 * 1024; // 50KB
    const maxSize = 500 * 1024; // 200KB
    if (file.size < minSize) {
      setImageError('Image must be at least 50KB');
      return;
    }
    if (file.size > maxSize) {
      setImageError('Image must be no larger than 500KB');
      return;
    }

    // Square validation
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth !== img.naturalHeight) {
        setImageError('Image must be square (same width and height)');
        URL.revokeObjectURL(img.src);
        (e.target as HTMLInputElement).value = ''; // Clear input
        return;
      }
      // Valid image
      setSelectedImageFile(file);
      setImagePreview(img.src); // Use img.src (blob URL)
    };
    img.onerror = () => {
      setImageError('Invalid image file');
      (e.target as HTMLInputElement).value = '';
    };
    img.src = URL.createObjectURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name !== 'image') {  // Skip image field
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const endpoint = `api/static/teamMember/${id}`


      const res = await serverCallFuction(
        "DELETE",
        endpoint
      );

      if (res.success) {
        setTeamMembers(teamMembers.filter((m) => m.id !== id));
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your team members and their details
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search members..."
              defaultValue={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Member Modal (Add/Edit) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            {isEditMode ? "Edit Team Member" : "Add New Team Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="image-upload">Image</Label>
              <div className="space-y-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
                {imageError && (
                  <p className="text-red-500 text-sm mt-1">{imageError}</p>
                )}
                {imagePreview && !imageError && (
                  <div className="mt-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 max-w-xs mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-30 h-30 object-cover mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={(e) => handleSubmit(e)}>
                {isEditMode ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-100 text-start text-theme-xs dark:text-gray-400">
                    Member
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-100 text-start text-theme-xs dark:text-gray-400">
                    Bio
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-100 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-100 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.image || '/images/user/user-1.jpg'} size="medium" alt={member.name} />
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {member.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {member.title}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="text-sm">{member.bio ? member.bio.substring(0, 80) + '...' : 'No bio available'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        size="sm"
                        color={
                          member.status === "active"
                            ? "success"
                            : member.status === "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(member)}
                          className=""

                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;

