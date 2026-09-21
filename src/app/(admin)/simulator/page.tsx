"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import serverCallFuction from "@/lib/constantFunction";

type IncomeSimulatorPayload = {
    personal_sales: number;
    direct_team_count: number;
    avg_l2_sales: number;
    l2_team_size_per_direct: number;
    l1_commission_pct?: number;
    l2_commission_pct?: number;
    tds_pct?: number;
};

type IncomeSimulatorResponse = {
    status?: boolean;
    success?: boolean;
    message?: string;
    data?: any;
    [key: string]: any;
};

function toNumberOrEmpty(v: string): number | null {
    if (!v || v.trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function formatNumber(n: unknown): string {
    const num = typeof n === "string" ? Number(n) : n;
    if (typeof num !== "number" || !Number.isFinite(num)) return String(n ?? "-");
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 6,
    }).format(num);
}

export default function SimulatorPage() {
    const [form, setForm] = useState({
        personal_sales: "",
        direct_team_count: "",
        avg_l2_sales: "",
        l2_team_size_per_direct: "",
        l1_commission_pct: "",
        l2_commission_pct: "",
        tds_pct: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [result, setResult] = useState<any>(null);

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const payload = useMemo<IncomeSimulatorPayload | null>(() => {
        const personal_sales = toNumberOrEmpty(form.personal_sales);
        const direct_team_count = toNumberOrEmpty(form.direct_team_count);
        const avg_l2_sales = toNumberOrEmpty(form.avg_l2_sales);
        const l2_team_size_per_direct = toNumberOrEmpty(
            form.l2_team_size_per_direct
        );

        if (
            personal_sales === null ||
            direct_team_count === null ||
            avg_l2_sales === null ||
            l2_team_size_per_direct === null
        ) {
            return null;
        }

        const p: IncomeSimulatorPayload = {
            personal_sales,
            direct_team_count,
            avg_l2_sales,
            l2_team_size_per_direct,
        };

        const l1 = toNumberOrEmpty(form.l1_commission_pct);
        const l2 = toNumberOrEmpty(form.l2_commission_pct);
        const tds = toNumberOrEmpty(form.tds_pct);

        if (l1 !== null) p.l1_commission_pct = l1;
        if (l2 !== null) p.l2_commission_pct = l2;
        if (tds !== null) p.tds_pct = tds;

        return p;
    }, [form]);

    const errors = useMemo(() => {
        const e: Record<string, string> = {};
        if (toNumberOrEmpty(form.personal_sales) === null)
            e.personal_sales = "Personal sales is required";
        if (toNumberOrEmpty(form.direct_team_count) === null)
            e.direct_team_count = "Direct team count is required";
        if (toNumberOrEmpty(form.avg_l2_sales) === null)
            e.avg_l2_sales = "Avg L2 sales is required";
        if (toNumberOrEmpty(form.l2_team_size_per_direct) === null)
            e.l2_team_size_per_direct = "L2 team size per direct is required";
        return e;
    }, [form]);

    const canSubmit = payload !== null && Object.keys(errors).length === 0;

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            personal_sales: true,
            direct_team_count: true,
            avg_l2_sales: true,
            l2_team_size_per_direct: true,
            l1_commission_pct: true,
            l2_commission_pct: true,
            tds_pct: true,
        });

        if (!canSubmit || !payload) {
            setError("Please fill all required fields with valid numbers.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = (await serverCallFuction<IncomeSimulatorResponse>(
                "POST",
                "api/business/income-simulator",
                payload
            )) as IncomeSimulatorResponse;

            // serverCallFuction returns either JSON directly or rejected via Promise.reject
            const success =
                (typeof res?.success === "boolean" ? res.success : res?.status) ?? true;

            if (res && (res as any).status === false) {
                setError((res as any).message || "Simulation failed");
                return;
            }

            setResult(res?.data ?? res);

            if (!success && res?.message) setError(res.message);
        } catch (err: any) {
            setError(err?.message || "Simulation failed");
        } finally {
            setLoading(false);
        }
    };

    const renderKeyValueTable = (obj: unknown) => {
        const data = obj && typeof obj === "object" ? obj : null;
        if (!data) return null;

        const entries = Object.entries(data);
        if (entries.length === 0) {
            return (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    No data returned.
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 text-left font-semibold">
                                Field
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-left font-semibold">
                                Value
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.slice(0, 50).map(([k, v]) => (
                            <TableRow key={k}>
                                <TableCell className="px-4 py-3 font-medium">{k}</TableCell>
                                <TableCell className="px-4 py-3">
                                    {typeof v === "number" || typeof v === "string"
                                        ? formatNumber(v)
                                        : JSON.stringify(v)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Income Simulator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Estimate commissions and income based on team sales inputs.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Inputs</CardTitle>
                    <CardDescription>
                        Required fields are used to compute income. Optional commission / TDS
                        percentages can be provided to override backend defaults.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Personal Sales
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.personal_sales}
                                    onChange={(e) => handleChange("personal_sales", e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, personal_sales: true }))}
                                />
                                {touched.personal_sales && errors.personal_sales && (
                                    <div className="mt-2 text-sm text-error-600">{errors.personal_sales}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Direct Team Count
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.direct_team_count}
                                    onChange={(e) => handleChange("direct_team_count", e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, direct_team_count: true }))}
                                />
                                {touched.direct_team_count && errors.direct_team_count && (
                                    <div className="mt-2 text-sm text-error-600">{errors.direct_team_count}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Avg L2 Sales
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.avg_l2_sales}
                                    onChange={(e) => handleChange("avg_l2_sales", e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, avg_l2_sales: true }))}
                                />
                                {touched.avg_l2_sales && errors.avg_l2_sales && (
                                    <div className="mt-2 text-sm text-error-600">{errors.avg_l2_sales}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    L2 Team Size / Direct
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.l2_team_size_per_direct}
                                    onChange={(e) =>
                                        handleChange("l2_team_size_per_direct", e.target.value)
                                    }
                                    onBlur={() =>
                                        setTouched((p) => ({ ...p, l2_team_size_per_direct: true }))
                                    }
                                />
                                {touched.l2_team_size_per_direct &&
                                    errors.l2_team_size_per_direct && (
                                        <div className="mt-2 text-sm text-error-600">
                                            {errors.l2_team_size_per_direct}
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    L1 Commission % (optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.l1_commission_pct}
                                    onChange={(e) =>
                                        handleChange("l1_commission_pct", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    L2 Commission % (optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.l2_commission_pct}
                                    onChange={(e) =>
                                        handleChange("l2_commission_pct", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    TDS % (optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900"
                                    value={form.tds_pct}
                                    onChange={(e) => handleChange("tds_pct", e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="error" title="Simulation error" message={error} />
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-[180px]"
                            >
                                {loading ? "Simulating..." : "Simulate"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                className="min-w-[160px]"
                                onClick={() => {
                                    setForm({
                                        personal_sales: "",
                                        direct_team_count: "",
                                        avg_l2_sales: "",
                                        l2_team_size_per_direct: "",
                                        l1_commission_pct: "",
                                        l2_commission_pct: "",
                                        tds_pct: "",
                                    });
                                    setTouched({});
                                    setError("");
                                    setResult(null);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Result</CardTitle>
                    <CardDescription>
                        Response from <code className="font-mono">/api/business/income-simulator</code>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                        </div>
                    )}

                    {!loading && result && (
                        <div className="space-y-4">
                            {renderKeyValueTable(result)}
                            <div>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                                        JSON preview
                                    </summary>
                                    <pre className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs overflow-auto">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Enter inputs and click <b>Simulate</b>.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

