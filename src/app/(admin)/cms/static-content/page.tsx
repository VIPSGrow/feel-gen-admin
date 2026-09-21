"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import { Plus, Pencil, Trash, Search } from "lucide-react";
import serverCallFuction from "@/lib/constantFunction";
import { slugify } from "@/lib/slugify";
import { StaticContent } from "@/types/static-content";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import RichTextEditor from "@/components/form/editor/RichTextEditor";

const StaticContentPage = () => {
  const [staticContents, setStaticContents] = useState<StaticContent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_title: "",
    meta_description: "",
    status: "published" as 'draft' | 'published',
  });
  const [modalKey, setModalKey] = useState(0);

  // Fetch all static content
  const fetchStaticContents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await serverCallFuction("GET", "api/static/static");
      if (res && (res.success || res.status !== false)) {
        setStaticContents(Array.isArray(res.data) ? res.data : []);
      } else {
        setError("Failed to fetch static content");
      }
    } catch (err) {
      setError("Failed to fetch static content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaticContents();
  }, [fetchStaticContents]);

  const filteredContents = staticContents.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      meta_title: "",
      meta_description: "",
      status: "published",
    });
    setEditingId(null);
    setIsEditMode(false);
    setModalKey((k) => k + 1);
  };

  const openAdd = () => {
    resetForm();
    openModal();
  };

  const openEdit = (item: StaticContent) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      content: item.content,
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
      status: item.status,
    });
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title' && value) {
      const slug = slugify(value);
      setFormData((prev) => ({ ...prev, [name]: value, slug: slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content.trim()) {
      alert("Title, slug, and content are required");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        status: formData.status,
      };

      const endpoint = isEditMode && editingId ? `api/static/static/${formData.slug}` : "api/static/static";
      const method = isEditMode ? "PUT" : "PUT";

      const res = await serverCallFuction(method, endpoint, payload);
      
      if (res && (res.success || res.status !== false)) {
        if (isEditMode && editingId) {
          setStaticContents((prev) =>
            prev.map((item) => (item.id === editingId ? res.data || { ...formData, id: editingId } : item))
          );
        } else {
          // Optimistic add - full refresh better
          fetchStaticContents();
        }
        closeModal();
        resetForm();
      } else {
        alert("Failed to save. Check console.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving content");
    }
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm(`Delete "${slug}"?`)) return;
    
    try {
      const res = await serverCallFuction("DELETE", `api/static/${id || slug}`);
      if (res && (res.success || res.status !== false)) {
        setStaticContents((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      alert("Delete error");
    }
  };

  const statusColor = (status: string) => {
    return status === 'published' ? 'success' : 'warning';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Static Content
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your website static pages (About, Privacy, etc.)
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or slug..."
              defaultValue={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Page
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start uppercase text-xs">
                      Title
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start uppercase text-xs">
                      Slug
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start uppercase text-xs">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start uppercase text-xs">
                      Last Updated
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-end uppercase text-xs">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredContents.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-6 py-12 text-center text-gray-500 grid grid-cols-5">
                        {searchTerm ? "No matching content found" : "No static content yet. Create one!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContents.map((item) => (
                      <TableRow key={item.id || item.slug}>
                        <TableCell className="px-6 py-4 text-start">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-start">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 dark:bg-gray-800">
                            /{item.slug}
                          </code>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge size="sm" color={statusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-500">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-end">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(item)}
                              className="p-0"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.slug)}
                              className=" p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      <Modal 
      isOpen={isModalOpen} 
      onClose={() => {
        closeModal();
        resetForm();
      }}
      className='max-w-lg mx-auto'>
        <div className="p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {isEditMode ? "Edit Static Page" : "Create New Static Page"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  key={`title-${modalKey}`}
                  id="title"
                  name="title"
                  defaultValue={formData.title}
                  onChange={handleInputChange}
                  placeholder="Page title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  key={`slug-${modalKey}`}
                  id="slug"
                  name="slug"
                  defaultValue={formData.slug}
                  onChange={handleInputChange}
                  placeholder="about-us"
                  className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
                  disabled={isEditMode}
                />
              </div>
            </div>
            
            <div>
              <Label>Content * (Rich Text)</Label>
              <RichTextEditor
                key={`content-${modalKey}`}
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Enter content here..."
                className="min-h-[250px]"
              />
              <p className="mt-2 text-xs text-gray-500">
                Use the toolbar for formatting. Outputs clean HTML.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  key={`meta_title-${modalKey}`}
                  id="meta_title"
                  name="meta_title"
                  defaultValue={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="SEO Meta Title"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Input
                  key={`meta_description-${modalKey}`}
                  id="meta_description"
                  name="meta_description"
                  defaultValue={formData.meta_description}
                  onChange={handleInputChange}
                  placeholder="SEO Meta Description (150 chars)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  closeModal();
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button className="flex-1">
                {isEditMode ? "Update Page" : "Create Page"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default StaticContentPage;

