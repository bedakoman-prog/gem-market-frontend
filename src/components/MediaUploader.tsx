"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
}

const MAX_PHOTOS = 8;
const MAX_VIDEOS = 2;
const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

// Grille d'ajout/suppression de photos et vidéos pour une annonce. Utilisé à
// la fois juste après la publication et depuis la page de l'annonce pour un
// vendeur qui veut compléter ou changer ses médias plus tard.
export function MediaUploader({
  listingId,
  initialMedia = [],
  onChange,
}: {
  listingId: string;
  initialMedia?: MediaItem[];
  onChange?: (media: MediaItem[]) => void;
}) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoCount = media.filter((m) => m.type === "photo").length;
  const videoCount = media.filter((m) => m.type === "video").length;
  const full = photoCount >= MAX_PHOTOS && videoCount >= MAX_VIDEOS;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      setUploadingCount((c) => c + 1);
      try {
        const uploaded = await api.upload<MediaItem>(`/listings/${listingId}/media`, file);
        setMedia((prev) => {
          const next = [...prev, uploaded];
          onChange?.(next);
          return next;
        });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Échec de l'envoi du fichier.");
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemove(mediaId: string) {
    setError(null);
    try {
      await api.del(`/listings/${listingId}/media/${mediaId}`);
      setMedia((prev) => {
        const next = prev.filter((m) => m.id !== mediaId);
        onChange?.(next);
        return next;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suppression.");
    }
  }

  return (
    <div>
      {error && (
        <p
          className="mb-3 rounded-[var(--radius-s)] p-2.5 text-[12.5px]"
          style={{ background: "var(--clay-100)", color: "var(--clay)" }}
        >
          {error}
        </p>
      )}

      <div className="mb-2 grid grid-cols-3 gap-2">
        {media.map((m) => (
          <div
            key={m.id}
            className="relative aspect-square overflow-hidden rounded-[var(--radius-s)]"
            style={{ background: "var(--surface)" }}
          >
            {m.type === "video" ? (
              <video src={m.url} className="h-full w-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(m.id)}
              aria-label="Supprimer"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="flex aspect-square items-center justify-center rounded-[var(--radius-s)] border"
            style={{ borderColor: "var(--line)" }}
          >
            <Loader2 className="animate-spin" size={20} color="var(--teal-600)" />
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius-s)] border border-dashed text-[10.5px] font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--teal-700)" }}
          >
            <ImagePlus size={18} />
            Ajouter
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
        {photoCount}/{MAX_PHOTOS} photos · {videoCount}/{MAX_VIDEOS} vidéos — formats acceptés : JPG, PNG, WEBP, MP4,
        MOV, WEBM.
      </p>
    </div>
  );
}
