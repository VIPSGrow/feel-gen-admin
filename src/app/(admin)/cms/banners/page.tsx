"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import { Plus, Pencil, Trash, Search, ImageIcon, Smartphone } from "lucide-react";
import serverCallFuction from "@/lib/constantFunction";
import { Banner } from "@/types/static-content";
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

const BannersPage = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { isOpen: isModalOpen, openModal, closeModal } = useModal();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        image_url: "",
        mobile_image_url: "",
        link_type: "",
        link_value: "",
        display_order: "0",
        position: "",
        start_date: "",
        end_date: "",
    });

    const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [desktopPreview, setDesktopPreview] = useState<string>("");
    const [mobilePreview, setMobilePreview] = useState<string>("");
    const [imageError, setImageError] = useState<string>("");

    // Fetch all banners
    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await serverCallFuction("GET", "api/static/banner");
            if (res && (res.success || res.status !== false)) {
                setBanners(Array.isArray(res.data) ? res.data : []);
            } else {
                setError("Failed to fetch banners");
            }
        } catch (err) {
            setError("Failed to fetch banners");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (desktopPreview && desktopPreview.startsWith("blob:")) {
                URL.revokeObjectURL(desktopPreview);
            }
            if (mobilePreview && mobilePreview.startsWith("blob:")) {
                URL.revokeObjectURL(mobilePreview);
            }
        };
    }, [desktopPreview, mobilePreview]);

    const filteredBanners = banners.filter(
        (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.position || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            title: "",
            subtitle: "",
            image_url: "",
            mobile_image_url: "",
            link_type: "",
            link_value: "",
            display_order: "0",
            position: "",
            start_date: "",
            end_date: "",
        });
        setDesktopImageFile(null);
        setMobileImageFile(null);
        if (desktopPreview && desktopPreview.startsWith("blob:")) {
            URL.revokeObjectURL(desktopPreview);
        }
        if (mobilePreview && mobilePreview.startsWith("blob:")) {
            URL.revokeObjectURL(mobilePreview);
        }
        setDesktopPreview("");
        setMobilePreview("");
        setImageError("");
        setEditingId(null);
        setIsEditMode(false);
    };

    const openAdd = () => {
        resetForm();
        openModal();
    };

    const openEdit = (banner: Banner) => {
        setIsEditMode(true);
        setEditingId(banner.id);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || "",
            image_url: banner.image_url || "",
            mobile_image_url: banner.mobile_image_url || "",
            link_type: banner.link_type || "",
            link_value: banner.link_value || "",
            display_order: String(banner.display_order || 0),
            position: banner.position || "",
            start_date: banner.start_date ? banner.start_date.slice(0, 10) : "",
            end_date: banner.end_date ? banner.end_date.slice(0, 10) : "",
        });
        setDesktopImageFile(null);
        setMobileImageFile(null);
        setDesktopPreview(banner.image_url || "");
        setMobilePreview(banner.mobile_image_url || "");
        setImageError("");
        openModal();
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateImageFile = (file: File): string | null => {
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return "Image must be no larger than 2MB";
        }
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            return "Only JPG, PNG, WebP images are allowed";
        }
        return null;
    };

    const handleDesktopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const err = validateImageFile(file);
        if (err) {
            setImageError(err);
            e.target.value = "";
            return;
        }

        setImageError("");
        setDesktopImageFile(file);
        if (desktopPreview && desktopPreview.startsWith("blob:")) {
            URL.revokeObjectURL(desktopPreview);
        }
        setDesktopPreview(URL.createObjectURL(file));
    };

    const handleMobileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const err = validateImageFile(file);
        if (err) {
            setImageError(err);
            e.target.value = "";
            return;
        }

        setImageError("");
        setMobileImageFile(file);
        if (mobilePreview && mobilePreview.startsWith("blob:")) {
            URL.revokeObjectURL(mobilePreview);
        }
        setMobilePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }

        setSubmitting(true);
        try {
            const submitFormData = new FormData();
            submitFormData.append("title", formData.title);
            submitFormData.append("subtitle", formData.subtitle);
            submitFormData.append("link_type", formData.link_type);
            submitFormData.append("link_value", formData.link_value);
            submitFormData.append("display_order", formData.display_order);
            submitFormData.append("position", formData.position);
            submitFormData.append("start_date", formData.start_date);
            submitFormData.append("end_date", formData.end_date);

            if (desktopImageFile) {
                submitFormData.append("image", desktopImageFile);
            } else if (formData.image_url) {
                submitFormData.append("image_url", formData.image_url);
            }

            if (mobileImageFile) {
                submitFormData.append("mobile_image", mobileImageFile);
            } else if (formData.mobile_image_url) {
                submitFormData.append("mobile_image_url", formData.mobile_image_url);
            }

            const endpoint =
                isEditMode && editingId
                    ? `api/static/banner/${editingId}`
                    : "api/static/banner";
            const method = isEditMode ? "PUT" : "POST";

            const res = await serverCallFuction(method, endpoint, submitFormData);

            if (res && (res.success || res.status !== false)) {
                fetchBanners();
                closeModal();
                resetForm();
            } else {
                alert(res?.message || "Failed to save banner");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving banner");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await serverCallFuction("DELETE", `api/static/banner/${id}`);
            if (res && (res.success || res.status !== false)) {
                setBanners((prev) => prev.filter((item) => item.id !== id));
            } else {
                alert("Delete failed");
            }
        } catch (err) {
            alert("Delete error");
        }
    };

    const linkTypeOptions = [
        { value: "", label: "None" },
        { value: "url", label: "External URL" },
        { value: "product", label: "Product" },
        { value: "category", label: "Category" },
        { value: "page", label: "Page" },
    ];

    const positionOptions = [
        { value: "", label: "Select Position" },
        { value: "home_top", label: "Home Top" },
        { value: "home_middle", label: "Home Middle" },
        { value: "home_bottom", label: "Home Bottom" },
        { value: "sidebar", label: "Sidebar" },
        { value: "popup", label: "Popup" },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Banners
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage website banners and promotional images
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search banners..."
                            defaultValue={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={openAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Banner
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
                        <div className="min-w-[1100px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-start uppercase text-xs"
                                        >
                                            Banner
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-start uppercase text-xs"
                                        >
                                            Position
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-start uppercase text-xs"
                                        >
                                            Link
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-start uppercase text-xs"
                                        >
                                            Order
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-start uppercase text-xs"
                                        >
                                            Duration
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-4 font-medium text-gray-100 text-end uppercase text-xs"
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredBanners.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                {searchTerm
                                                    ? "No matching banners found"
                                                    : "No banners yet. Create one!"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBanners.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src =
                                                                            "/placeholder.png";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {item.title}
                                                            </div>
                                                            {item.subtitle && (
                                                                <div className="text-gray-500 text-xs dark:text-gray-400">
                                                                    {item.subtitle}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    {item.position ? (
                                                        <Badge size="sm" color="light">
                                                            {item.position}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    {item.link_type ? (
                                                        <div>
                                                            <Badge
                                                                size="sm"
                                                                color={
                                                                    item.link_type === "url"
                                                                        ? "info"
                                                                        : "success"
                                                                }
                                                            >
                                                                {item.link_type}
                                                            </Badge>
                                                            {item.link_value && (
                                                                <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                                                                    {item.link_value}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-sm text-gray-700 dark:text-gray-300">
                                                    {item.display_order}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-sm text-gray-500">
                                                    {item.start_date || item.end_date ? (
                                                        <div className="text-xs">
                                                            {item.start_date && (
                                                                <div>
                                                                    From:{" "}
                                                                    {new Date(
                                                                        item.start_date
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {item.end_date && (
                                                                <div>
                                                                    To:{" "}
                                                                    {new Date(
                                                                        item.end_date
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Always</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-end">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEdit(item)}
                                                            className="p-2"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash className="w-3.5 h-3.5" />
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    closeModal();
                    resetForm();
                }}
                className="max-w-2xl mx-auto"
            >
                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {isEditMode ? "Edit Banner" : "Create New Banner"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title & Subtitle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Banner title"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="subtitle">Subtitle</Label>
                                <Input
                                    id="subtitle"
                                    name="subtitle"
                                    defaultValue={formData.subtitle}
                                    onChange={handleInputChange}
                                    placeholder="Optional subtitle"
                                />
                            </div>
                        </div>

                        {/* Desktop Image */}
                        <div>
                            <Label htmlFor="desktop-image">
                                <span className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Desktop Image
                                </span>
                            </Label>
                            <Input
                                id="desktop-image"
                                type="file"
                                accept="image/*"
                                onChange={handleDesktopImageUpload}
                                className="w-full"
                            />
                            {!desktopImageFile && !desktopPreview && (
                                <div className="mt-2">
                                    <Label htmlFor="image_url" className="text-xs text-gray-500">
                                        Or enter image URL
                                    </Label>
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        type="text"
                                        defaultValue={formData.image_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            )}
                            {desktopPreview && (
                                <div className="mt-3 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <img
                                        src={desktopPreview}
                                        alt="Desktop preview"
                                        className="h-32 w-auto object-contain mx-auto rounded"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Mobile Image */}
                        <div>
                            <Label htmlFor="mobile-image">
                                <span className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Mobile Image
                                </span>
                            </Label>
                            <Input
                                id="mobile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleMobileImageUpload}
                                className="w-full"
                            />
                            {!mobileImageFile && !mobilePreview && (
                                <div className="mt-2">
                                    <Label
                                        htmlFor="mobile_image_url"
                                        className="text-xs text-gray-500"
                                    >
                                        Or enter mobile image URL
                                    </Label>
                                    <Input
                                        id="mobile_image_url"
                                        name="mobile_image_url"
                                        type="text"
                                        defaultValue={formData.mobile_image_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/mobile-image.jpg"
                                    />
                                </div>
                            )}
                            {mobilePreview && (
                                <div className="mt-3 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <img
                                        src={mobilePreview}
                                        alt="Mobile preview"
                                        className="h-32 w-auto object-contain mx-auto rounded"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {imageError && (
                            <p className="text-red-500 text-sm">{imageError}</p>
                        )}

                        {/* Link Type & Value */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="link_type">Link Type</Label>
                                <select
                                    id="link_type"
                                    name="link_type"
                                    value={formData.link_type}
                                    onChange={handleInputChange}
                                    className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
                                >
                                    {linkTypeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="link_value">Link Value</Label>
                                <Input
                                    id="link_value"
                                    name="link_value"
                                    defaultValue={formData.link_value}
                                    onChange={handleInputChange}
                                    placeholder="URL, product ID, etc."
                                />
                            </div>
                        </div>

                        {/* Position & Display Order */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="position">Position</Label>
                                <select
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
                                >
                                    {positionOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input
                                    id="display_order"
                                    name="display_order"
                                    type="number"
                                    defaultValue={formData.display_order}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Start & End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    defaultValue={formData.start_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    defaultValue={formData.end_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    closeModal();
                                    resetForm();
                                }}
                                className="flex-1"
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving..."
                                    : isEditMode
                                        ? "Update Banner"
                                        : "Create Banner"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default BannersPage;

