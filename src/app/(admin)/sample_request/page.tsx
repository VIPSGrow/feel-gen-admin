"use client";

import React, { useEffect, useMemo, useState } from "react";


import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import serverCallFuction from "@/lib/constantFunction";

type SampleRequestStatus = string;

type SampleRequest = {
    id?: number | string;
    full_name?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    whatsappNo?: string;
    phoneNo?: string;
    status?: SampleRequestStatus;
    created_at?: string;
    createdAt?: string;
    [key: string]: unknown;
};


function formatDate(value: unknown): string {
    if (!value) return "-";
    const d = new Date(value as any);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
}

function getFullName(item: SampleRequest): string {
    return (
        item.full_name ||
        item.name ||
        item.username ||
        (item.email ? item.email : "") ||
        "Unknown"
    );
}

function getContact(item: SampleRequest): string {
    const phone = item.phone || item.phoneNo || item.whatsappNo;
    const email = item.email;
    return [phone, email].filter(Boolean).join(" / ") || "-";
}

export default function SampleRequestPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<SampleRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [viewOpen, setViewOpen] = useState(false);
    const [selected, setSelected] = useState<SampleRequest | null>(null);

    const statusColor = useMemo(() => {
        return (status: string | undefined) => {
            const s = (status || "").toLowerCase();
            if (!s) return "primary";
            if (s === "approved" || s === "active" || s === "completed" || s === "success") return "success";
            if (s === "pending" || s === "submitted" || s === "in_progress") return "primary";
            if (s === "rejected" || s === "cancelled" || s === "failed") return "error";
            return "primary";
        };
    }, []);

    async function fetchRequests() {
        setLoading(true);
        setError(null);
        try {
            const res = await serverCallFuction("GET", "api/sample-requests/");

            // Backend shapes we handle:
            // 1) { data: [...], pagination: {...} }
            // 2) { status, data: [...] }
            // 3) directly: [...]
            const resObj = res as Record<string, unknown> | null;

            const maybeData =
                resObj && typeof resObj === "object" && "data" in resObj
                    ? (resObj.data as unknown)
                    : res;

            const normalized = Array.isArray(maybeData) ? (maybeData as SampleRequest[]) : [];
            setItems(normalized);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : undefined;
            setError(msg || "Failed to load sample requests");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchRequests();
    }, []);

    const openView = (item: SampleRequest) => {
        setSelected(item);
        setViewOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold dark:text-gray-200">Sample Requests</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage user sample request entries</p>
                </div>
                <Button variant="outline" onClick={fetchRequests}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <p>Loading sample requests...</p>
            ) : error ? (
                <div className="p-4 border rounded border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/40">
                    <p className="text-red-700 dark:text-red-200">{error}</p>
                </div>
            ) : items.length === 0 ? (
                <p>No sample requests found.</p>
            ) : (
                <div className="rounded-lg border bg-white overflow-hidden dark:bg-gray-900">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    ID
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    Name
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    Contact
                                </TableCell>
                                {/* <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    Status
                                </TableCell> */}
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    Created
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {items.map((item, idx) => {
                                const id = item.id ?? idx + 1;
                                const status = (item.status ?? "").toString();
                                return (
                                    <TableRow key={String(id)}>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{id}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {getFullName(item)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{getContact(item)}</TableCell>
                                        {/* <TableCell className="px-6 py-4">
                                            <Badge color={statusColor(status)}>{status || "-"}</Badge>
                                        </TableCell> */}
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {formatDate(item.created_at ?? item.createdAt)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Button variant="outline" size="sm" onClick={() => openView(item)}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {viewOpen && selected && (
                <Modal
                    isOpen={viewOpen}
                    onClose={() => {
                        setViewOpen(false);
                        setSelected(null);
                    }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold mb-2">Sample Request Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {selected.id ?? "-"}
                                </p>
                            </div>
                            <div>
                                <Badge color="primary">-</Badge>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{getFullName(selected)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{getContact(selected)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {formatDate(selected.created_at ?? selected.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* All fields from API item, but formatted nicely (no raw JSON dump) */}
                        <div className="mt-6 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Phone</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {selected.phone || selected.phoneNo || selected.whatsappNo || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {selected.email || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Gender</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {((selected as { gender?: string }).gender) || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">DOB</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate((selected as { dob?: string }).dob || null)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">State</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {((selected as { state?: string }).state) || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">City</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {((selected as { city?: string }).city) || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Pincode</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {(selected.pincode as any) || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05] sm:col-span-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Address</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                        {((selected as { address?: string }).address) || [selected.city, selected.state, selected.pincode].filter(Boolean).join(", ") || "-"}
                                    </span>
                                </div>
                            </div>

                            {/* Optional: show any remaining non-null fields */}
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Other fields</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(selected)
                                        .filter(([k, v]) => {
                                            if (v === null || v === undefined) return false;
                                            const key = k.toLowerCase();
                                            return ![
                                                "id",
                                                "full_name",
                                                "name",
                                                "username",
                                                "email",
                                                "phone",
                                                "phonenumber",
                                                "phoneno",
                                                "whatsappno",
                                                "status",
                                                "created_at",
                                                "createdat",
                                                "gender",
                                                "dob",
                                                "state",
                                                "city",
                                                "pincode",
                                                "address"
                                            ].includes(key);
                                        })
                                        .slice(0, 20)
                                        .map(([k, v]) => (
                                            <div
                                                key={k}
                                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/[0.05]"
                                            >
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{k}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                                                        ? String(v)
                                                        : JSON.stringify(v)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>



                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => {
                                    setViewOpen(false);
                                    setSelected(null);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

