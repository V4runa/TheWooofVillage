"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, Crop as CropIcon, ZoomIn } from "lucide-react";
import { btn } from "@/components/admin/AdminUi";

type AspectPreset = {
  key: string;
  label: string;
  value: number;
};

const ASPECTS: AspectPreset[] = [
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "1:1", label: "Square", value: 1 },
  { key: "3:4", label: "Portrait", value: 3 / 4 },
  { key: "16:9", label: "Wide", value: 16 / 9 },
];

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Needed so the resulting canvas isn't tainted (Supabase public buckets
    // send permissive CORS headers).
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image for cropping."));
    img.src = url;
  });
}

async function getCroppedFile(
  src: string,
  area: Area,
  fileName: string
): Promise<File> {
  const image = await createImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export crop."))),
      "image/jpeg",
      0.9
    )
  );

  const base = fileName.replace(/\.[^/.]+$/, "") || "photo";
  return new File([blob], `${base}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function ImageCropModal({
  src,
  fileName = "photo",
  busy = false,
  onCancel,
  onSave,
}: {
  src: string;
  fileName?: string;
  busy?: boolean;
  onCancel: () => void;
  onSave: (file: File) => void | Promise<void>;
}) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [aspect, setAspect] = React.useState<number>(ASPECTS[0].value);
  const [areaPixels, setAreaPixels] = React.useState<Area | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onCropComplete = React.useCallback((_a: Area, areaPx: Area) => {
    setAreaPixels(areaPx);
  }, []);

  async function apply() {
    if (!areaPixels) return;
    setExporting(true);
    setError(null);
    try {
      const file = await getCroppedFile(src, areaPixels, fileName);
      await onSave(file);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not crop image.");
    } finally {
      setExporting(false);
    }
  }

  const working = busy || exporting;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crop photo"
      onClick={(e) => e.target === e.currentTarget && !working && onCancel()}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-meadow-200 bg-white shadow-adminLg ring-1 ring-black/10">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <CropIcon size={20} className="text-meadow-700" />
            Crop photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={working}
            className="rounded-xl p-2 text-gray-500 hover:bg-stone-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-meadow-500 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative h-[48vh] w-full bg-stone-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition
          />
        </div>

        <div className="shrink-0 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-gray-600">Aspect:</span>
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                type="button"
                disabled={working}
                onClick={() => setAspect(a.value)}
                className={[
                  "rounded-full px-3.5 py-1.5 text-sm font-bold transition disabled:opacity-50",
                  aspect === a.value
                    ? "bg-meadow-600 text-white shadow-admin"
                    : "bg-stone-100 text-gray-700 ring-1 ring-stone-200 hover:bg-stone-200",
                ].join(" ")}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ZoomIn size={18} className="shrink-0 text-gray-500" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              disabled={working}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-meadow-600"
              aria-label="Zoom"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className={btn("muted")}
              onClick={onCancel}
              disabled={working}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${btn("primary")} flex items-center gap-2`}
              onClick={apply}
              disabled={working || !areaPixels}
            >
              <CropIcon size={16} />
              {working ? "Saving…" : "Apply crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
