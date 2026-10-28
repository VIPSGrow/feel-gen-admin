"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { compressMediaFile } from "@/lib/mediaCompression";

const MAX_SIZE = 200 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-matroska,.mkv";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.feelsafeco.in";

type MediaUploadResponse = {
  success?: boolean;
  status?: boolean;
  message?: string;
};

export default function MediaUploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preparingFile, setPreparingFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionNotice, setCompressionNotice] = useState("");

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
    setUploadProgress(0);
    setCompressionNotice("");
    try {
      const preparedFiles: File[] = [];
      let hasUncompressedVideo = false;
      for (const file of files) {
        setPreparingFile(`Compressing ${file.name}...`);
        const result = await compressMediaFile(file);
        preparedFiles.push(result.file);
        if (
          file.size > 1024 * 1024 &&
          !result.compressed &&
          (file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name))
        ) {
          hasUncompressedVideo = true;
        }
      }

      const fd = new FormData();
      preparedFiles.forEach((f) => fd.append("files", f));
      if (title.trim()) fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      setPreparingFile("");
      if (hasUncompressedVideo) {
        setCompressionNotice("Some videos cannot be compressed in this browser and will upload in their original size.");
      }
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const token = localStorage.getItem("authToken") || "";
        xhr.open("POST", `${API_URL}/api/media`);
        xhr.setRequestHeader("x-auth-token", token);
        if (token) xhr.setRequestHeader("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          let response: MediaUploadResponse;
          try {
            response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          } catch {
            reject(new Error("Invalid response from server"));
            return;
          }
          if (xhr.status < 200 || xhr.status >= 300 || response?.success === false || response?.status === false) {
            reject(new Error(response?.message || `Upload failed (${xhr.status})`));
            return;
          }
          resolve();
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));
        xhr.send(fd);
      });
      router.push("/media");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
      setPreparingFile("");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      <div>
        <label className="mb-1 block text-sm font-medium dark:text-white">Files (images / videos, max 200MB each)</label>
        <input type="file" multiple accept={ACCEPT} onChange={(e) => onFiles(e.target.files)} className={inputCls} />
        {files.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {files.length} file(s) selected. Large images and supported videos are compressed before upload.
          </p>
        )}
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
      {preparingFile && <p className="text-sm text-gray-500">{preparingFile}</p>}
      {compressionNotice && <p className="text-sm text-amber-600">{compressionNotice}</p>}
      {submitting && !preparingFile && (
        <div className="space-y-1" role="status" aria-live="polite">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <progress className="w-full accent-brand-500" value={uploadProgress} max="100" />
        </div>
      )}
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
