"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import serverCallFuction, { ServerResponse } from "@/lib/constantFunction";

interface MemberKYCEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: (Partial<ApiUserData> & {
        id: number;
        name?: string;
        email?: string;
        phone?: string;
    }) | null;
}

interface FormState {
    bank_name: string;
    account_holder_name: string;
    account_no: string;
    ifsc_code: string;
    branch: string;
    nominee_name: string;
    nominee_relationship: string;
    nominee_age: string;
    nominee_contact: string;
    nominee_aadhaar: string;
    aadhaar_no: string;
    pan_no: string;
}

const EMPTY_FORM: FormState = {
    bank_name: "",
    account_holder_name: "",
    account_no: "",
    ifsc_code: "",
    branch: "",
    nominee_name: "",
    nominee_relationship: "",
    nominee_age: "",
    nominee_contact: "",
    nominee_aadhaar: "",
    aadhaar_no: "",
    pan_no: "",
};

const FILE_FIELDS: { key: string; label: string }[] = [
    { key: "aadhaarFront", label: "Aadhaar Front" },
    { key: "aadhaarBack", label: "Aadhaar Back" },
    { key: "pan", label: "PAN Card" },
    { key: "bankPassbook", label: "Bank Passbook / Cheque" },
    { key: "profileImage", label: "Profile Photo" },
    { key: "gstin", label: "GST Certificate" },
];

// Shape of the user object returned by GET /api/users/by_id/:user_id (snake_case)
interface ApiUserData {
    bank_name?: string;
    account_holder_name?: string;
    account_no?: string;
    ifsc_code?: string;
    branch?: string;
    nominee_name?: string;
    nominee_relationship?: string;
    nominee_age?: string | number;
    nominee_contact?: string;
    nominee_aadhaar?: string;
    aadhaar_no?: string;
    pan_no?: string;
    full_name?: string;
    email?: string;
    phone?: string;
}

type ByIdResponse = ServerResponse & { user?: ApiUserData };

export default function MemberKYCEditModal({
    isOpen,
    onClose,
    member,
}: MemberKYCEditModalProps) {
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch member full data and reset form when modal opens / member changes
    React.useEffect(() => {
        if (isOpen && member) {
            setFiles({});
            setMessage(null);
            // Populate immediately from the passed member object (snake_case + camelCase)
            applyUserData(member);

            let cancelled = false;

            const fetchUser = async () => {
                setLoading(true);
                try {
                    const payload = (await serverCallFuction<ByIdResponse>(
                        "GET",
                        `api/users/by_id/${member.id}`
                    )) as ByIdResponse;
                    if (!cancelled && payload && payload.status !== false && payload.user) {
                        applyUserData(payload.user);
                    }
                } catch {
                    // ignore - keep the data populated from the member prop
                } finally {
                    if (!cancelled) setLoading(false);
                }
            };

            fetchUser();

            return () => {
                cancelled = true;
            };
        }
    }, [isOpen, member]);

    const applyUserData = (m: ApiUserData | null | undefined) => {
        const src = (m || {}) as Record<string, unknown>;
        setFormData({
            bank_name: (src.bank_name as string) || (src.bankName as string) || "",
            account_holder_name: (src.account_holder_name as string) || (src.accountHolderName as string) || "",
            account_no: (src.account_no as string) || (src.accountNo as string) || "",
            ifsc_code: (src.ifsc_code as string) || (src.ifscCode as string) || "",
            branch: (src.branch as string) || "",
            nominee_name: (src.nominee_name as string) || "",
            nominee_relationship: (src.nominee_relationship as string) || "",
            nominee_age: (src.nominee_age?.toString?.() as string) || "",
            nominee_contact: (src.nominee_contact as string) || "",
            nominee_aadhaar: (src.nominee_aadhaar as string) || "",
            aadhaar_no: (src.aadhaar_no as string) || (src.aadhaarNo as string) || "",
            pan_no: (src.pan_no as string) || (src.panNo as string) || "",
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (key: string, file: File) => {
        setFiles((prev) => ({ ...prev, [key]: file }));
        setMessage(null);
    };

    // Save bank / nominee / doc numbers via the downline update endpoint
    const handleSaveDetails = async () => {
        if (!member) return;
        setLoading(true);
        setMessage(null);
        try {
            const payload = {
                bank_name: formData.bank_name,
                account_holder_name: formData.account_holder_name,
                account_no: formData.account_no,
                ifsc_code: formData.ifsc_code,
                branch: formData.branch,
                nominee_name: formData.nominee_name,
                nominee_relationship: formData.nominee_relationship,
                nominee_age: formData.nominee_age,
                nominee_contact: formData.nominee_contact,
                nominee_aadhaar: formData.nominee_aadhaar,
                aadhaar_no: formData.aadhaar_no,
                pan_no: formData.pan_no,
            };

            const res = await serverCallFuction<ServerResponse>(
                "PUT",
                `api/users/account/${member.id}`,
                payload
            );

            if (res && res.status !== false) {
                setMessage({ type: "success", text: "Member details updated successfully." });
            } else {
                setMessage({
                    type: "error",
                    text: res?.message || "Failed to update member details.",
                });
            }
        } catch {
            setMessage({ type: "error", text: "Error updating member details." });
        } finally {
            setLoading(false);
            onClose(); // Close the modal after saving details
        }
    };

    // Upload KYC documents on behalf of the member
    const handleUploadDocs = async () => {
        if (!member) return;
        const uploaded = Object.values(files).filter(Boolean).length;
        if (uploaded === 0) {
            setMessage({ type: "error", text: "Please select at least one document to upload." });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("id", member.id.toString());

            if (files.aadhaarFront) formDataToSend.append("Aadhaar_Front", files.aadhaarFront);
            if (files.aadhaarBack) formDataToSend.append("Aadhaar_Back", files.aadhaarBack);
            if (files.pan) formDataToSend.append("PAN", files.pan);
            if (files.bankPassbook) formDataToSend.append("passbook", files.bankPassbook);
            if (files.profileImage) formDataToSend.append("profile", files.profileImage);
            if (files.gstin) formDataToSend.append("gstin", files.gstin);

            const res = await serverCallFuction<ServerResponse>("POST", "api/users/kyc/upload", formDataToSend);

            if (res && res.status !== false) {
                setMessage({ type: "success", text: "KYC documents uploaded successfully." });
                setFiles({});
            } else {
                setMessage({
                    type: "error",
                    text: res?.message || "Failed to upload KYC documents.",
                });
            }
        } catch {
            setMessage({ type: "error", text: "Error uploading KYC documents." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl m-4">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-2">
                    Edit Member Financial &amp; KYC Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {member?.name || member?.email || `Member #${member?.id}`}
                </p>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm ${message.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="custom-scrollbar max-h-[65vh] overflow-y-auto px-1 pb-4">
                    {/* BANK INFORMATION */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Bank Information
                        </h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                            <div>
                                <Label>Bank Name</Label>
                                <Input name="bank_name" value={formData.bank_name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>Account Holder Name</Label>
                                <Input
                                    name="account_holder_name"
                                    value={formData.account_holder_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label>Account No</Label>
                                <Input name="account_no" value={formData.account_no} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>IFSC Code</Label>
                                <Input name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>Branch</Label>
                                <Input name="branch" value={formData.branch} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* NOMINEE INFORMATION */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Nominee Information
                        </h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                            <div>
                                <Label>Nominee Name</Label>
                                <Input
                                    name="nominee_name"
                                    value={formData.nominee_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label>Relationship</Label>
                                <Input
                                    name="nominee_relationship"
                                    value={formData.nominee_relationship}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label>Age</Label>
                                <Input
                                    type="number"
                                    name="nominee_age"
                                    value={formData.nominee_age}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label>Contact</Label>
                                <Input
                                    name="nominee_contact"
                                    value={formData.nominee_contact}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <Label>Nominee Aadhaar</Label>
                                <Input
                                    name="nominee_aadhaar"
                                    value={formData.nominee_aadhaar}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DOC NUMBERS */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Document Numbers
                        </h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                            <div>
                                <Label>Aadhaar No</Label>
                                <Input name="aadhaar_no" value={formData.aadhaar_no} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label>PAN No</Label>
                                <Input name="pan_no" value={formData.pan_no} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* KYC DOCUMENT UPLOAD */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            KYC Document Upload
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FILE_FIELDS.map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <Label>{label}</Label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            className="hidden"
                                            id={`file-${key}`}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileChange(key, file);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-start text-sm h-11"
                                            onClick={() => document.getElementById(`file-${key}`)?.click()}
                                        >
                                            {files[key]?.name || `Choose ${label.toLowerCase()}`}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 pt-4 mt-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUploadDocs}
                        disabled={loading}
                        variant="outline"
                    >
                        Upload KYC Docs
                    </Button>
                    <Button onClick={handleSaveDetails} disabled={loading}>
                        {loading ? "Saving..." : "Save Details"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
