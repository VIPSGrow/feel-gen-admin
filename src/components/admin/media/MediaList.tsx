"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import serverCallFuction from "@/lib/constantFunction";

type MediaItem = {
  id: number | string;
  title?: string | null;
  description?: string | null;
  file_url: string;
  type?: "image" | "video";
  media_type?: "image" | "video";
  status: boolean | number;
};

const LIMIT = 20;

export default function MediaList() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [type, setType] = useState<"" | "image" | "video">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (type) q.set("type", type);
      const res: any = await serverCallFuction("GET", `api/media/admin?${q.toString()}`);
      if (res?.success === false) throw new Error(res?.message || "Failed to load media");
      setItems(Array.isArray(res?.data) ? res.data : []);
      setTotal(Number(res?.total) || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: MediaItem["id"]) => {
    const res: any = await serverCallFuction("PATCH", `api/media/${id}/toggle`);
    if (res?.success === false) return setError(res?.message || "Toggle failed");
    load();
  };

  const remove = async (id: MediaItem["id"]) => {
    if (!window.confirm("Delete this media permanently?")) return;
    const res: any = await serverCallFuction("DELETE", `api/media/${id}`);
    if (res?.success === false) return setError(res?.message || "Delete failed");
    load();
  };

  const isVideo = (m: MediaItem) =>
    (m.type || m.media_type) === "video" || /\.(mp4|webm|mov|mkv)$/i.test(m.file_url);
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value as "" | "image" | "video");
          }}
          className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:text-white"
        >
          <option value="">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <Link href="/media/add" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          Add Media
        </Link>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading media...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No media found.</p>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
          {items.map((m) => {
            const active = Boolean(m.status);
            const video = isVideo(m);
            return (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex h-44 items-center justify-center bg-gray-100 dark:bg-gray-900">
                  {video ? (
                    <video src={m.file_url} controls className="h-full w-full object-contain" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.file_url} alt={m.title || "media"} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{m.title || "Untitled"}</p>
                  <p className="text-xs text-gray-500">{video ? "Video" : "Image"}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${active ? "text-green-600" : "text-gray-500"}`}>
                      {active ? "Active" : "Inactive"}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => toggle(m.id)} className="text-brand-500 hover:underline">
                        {active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => remove(m.id)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 dark:text-white">
              {items.map((m, i) => {
                const active = Boolean(m.status);
                const video = isVideo(m);
                return (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="px-4 py-3">
                      <a href={m.file_url} target="_blank" rel="noreferrer">
                        {video ? (
                          <video src={m.file_url} className="h-14 w-24 rounded object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.file_url} alt={m.title || "media"} className="h-14 w-24 rounded object-cover" />
                        )}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate font-medium">{m.title || "Untitled"}</p>
                      {m.description && <p className="max-w-xs truncate text-xs text-gray-500">{m.description}</p>}
                    </td>
                    <td className="px-4 py-3">{video ? "Video" : "Image"}</td>
                    <td className="px-4 py-3">
                      <span className={active ? "text-green-600" : "text-gray-500"}>{active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => toggle(m.id)} className="text-brand-500 hover:underline">
                          {active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => remove(m.id)} className="text-red-500 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-50">
            Prev
          </button>
          <span>
            {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
