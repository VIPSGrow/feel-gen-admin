"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import serverCallFuction from "@/lib/constantFunction";

const MAX_SIZE = 200 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-matroska,.mkv";

export default function MediaUploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = (list: FileList | null) => {
    const picked = Array.from(list || []);
    const tooBig = picked.find((f) => f.size > MAX_SIZE);
    setError(tooBig ? `${tooBig.name} is larger than 200MB` : null);
    setFiles(tooBig ? [] : picked);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return setError("Select at least one file");
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      if (title.trim()) fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      const res: any = await serverCallFuction("POST", "api/media", fd);
      if (res?.success === false || res?.status === false) throw new Error(res?.message || "Upload failed");
      router.push("/media");
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      <div>
        <label className="mb-1 block text-sm font-medium dark:text-white">Files (images / videos, max 200MB each)</label>
        <input type="file" multiple accept={ACCEPT} onChange={(e) => onFiles(e.target.files)} className={inputCls} />
        {files.length > 0 && <p className="mt-1 text-xs text-gray-500">{files.length} file(s) selected</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium dark:text-white">Title (optional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium dark:text-white">Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
