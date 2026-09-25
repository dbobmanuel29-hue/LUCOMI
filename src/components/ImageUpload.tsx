import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "../lib/api";
import { cn } from "../lib/helpers";
import { Micro } from "./ui";

type Item = {
  id: string;
  name: string;
  url: string;
  status: "uploading" | "done" | "error";
  progress: number;
};

export function ImageUpload({
  value,
  onChange,
  max = 8,
  label = "Images",
  hint = "JPG, PNG or WebP · several images supported",
  folder = "lucomi",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  folder?: string;
}) {
  const initialItems = value.map((url, index) => ({
    id: `existing-${index}-${url}`,
    name: `Image ${index + 1}`,
    url,
    status: "done" as const,
    progress: 100,
  }));

  const [items, setItems] = useState<Item[]>(initialItems);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(value);

  useEffect(() => {
    urlsRef.current = value;
  }, [value]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const available = Math.max(0, max - items.length);
    if (!available) {
      setError(`You can add up to ${max} images.`);
      return;
    }

    Array.from(files).slice(0, available).forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      if (!file.type.startsWith("image/")) {
        setItems((prev) => [...prev, { id, name: file.name, url: "", status: "error", progress: 0 }]);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setItems((prev) => [...prev, { id, name: file.name, url: "", status: "error", progress: 0 }]);
        setError(`${file.name} is larger than 10 MB.`);
        return;
      }

      const preview = URL.createObjectURL(file);
      setError(null);
      setItems((prev) => [...prev, { id, name: file.name, url: preview, status: "uploading", progress: 2 }]);

      uploadToCloudinary(file, folder, (progress) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, progress } : item));
      })
        .then((url) => {
          setItems((prev) => prev.map((item) => item.id === id
            ? { ...item, status: "done", progress: 100, url }
            : item
          ));
          const nextUrls = [...urlsRef.current, url];
          urlsRef.current = nextUrls;
          onChange(nextUrls);
          URL.revokeObjectURL(preview);
        })
        .catch((uploadError) => {
          setItems((prev) => prev.map((item) => item.id === id
            ? { ...item, status: "error", progress: 0 }
            : item
          ));
          setError(uploadError instanceof Error ? uploadError.message : "Image upload failed. Please try again.");
          URL.revokeObjectURL(preview);
        });
    });
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      const next = prev.filter((item) => item.id !== id);
      if (target?.status === "done") {
        const nextUrls = urlsRef.current.filter((url) => url !== target.url);
        urlsRef.current = nextUrls;
        onChange(nextUrls);
      }
      return next;
    });
  };

  const setPrimary = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target || target.status !== "done") return prev;
      const next = [target, ...prev.filter((item) => item.id !== id)];
      const nextUrls = next.filter((item) => item.status === "done").map((item) => item.url);
      urlsRef.current = nextUrls;
      onChange(nextUrls);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Micro className="text-ink">{label}</Micro>
        <span className="text-[11px] text-mute tnum">{items.filter((item) => item.status === "done").length}/{max}</span>
      </div>
      <p className="mt-1 text-[12px] text-mute">{hint} · max 10 MB each</p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-royal bg-royal/5" : "border-line bg-white",
        )}
      >
        <UploadCloud className="h-7 w-7 text-mute" />
        <p className="mt-3 text-[14px] text-charcoal">Drag & drop images here</p>
        <p className="text-[12px] text-mute">or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-full border border-line bg-paper px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-plate"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-3 text-[12px] text-royal">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-[12px] text-mute">
          <ImagePlus className="h-3.5 w-3.5" /> No images added yet — the first image becomes the primary photo.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] bg-plate">
                {item.url ? (
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] text-mute">Upload failed</div>
                )}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-end bg-ink/45 p-2">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                      <div className="h-full bg-white transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                )}
                {index === 0 && item.status === "done" && (
                  <span className="micro absolute left-2 top-2 rounded-full bg-ink px-2 py-1 text-[9px] text-white">Primary</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setPrimary(item.id)}
                  className="rounded p-1.5 text-mute transition-colors hover:text-royal"
                  aria-label={`Set ${item.name} as primary image`}
                  title="Set as primary"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <span className="truncate text-[10.5px] text-mute">{item.name}</span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded p-1.5 text-mute transition-colors hover:text-royal"
                  aria-label={`Remove ${item.name}`}
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
