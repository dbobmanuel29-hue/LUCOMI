import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../lib/helpers";
import { Micro } from "./ui";

type Item = {
  id: string;
  name: string;
  url: string;
  status: "uploading" | "done" | "error";
  progress: number;
};

/**
 * Image upload experience for Cloudinary.
 * Previews are local object URLs today; api.uploadImage() is swapped for the
 * Cloudinary unsigned upload endpoint later. No Firebase Storage is used.
 */
export function ImageUpload({
  value,
  onChange,
  max = 8,
  label = "Images",
  hint = "JPG or PNG · several images supported",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, max - items.length)
      .forEach((file) => {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        if (!file.type.startsWith("image/")) {
          setItems((prev) => [...prev, { id, name: file.name, url: "", status: "error", progress: 0 }]);
          return;
        }
        const url = URL.createObjectURL(file);
        setItems((prev) => [...prev, { id, name: file.name, url, status: "uploading", progress: 12 }]);
        api.uploadImage(file.name).then((res) => {
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, status: "done", progress: res.progress, url } : it)),
          );
          onChange([...value, url]);
        });
      });
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      const next = prev.filter((it) => it.id !== id);
      if (target?.status === "done") onChange(value.filter((u) => u !== target.url));
      return next;
    });
  };

  const setPrimary = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (!target) return prev;
      const next = [target, ...prev.filter((it) => it.id !== id)];
      onChange(next.filter((it) => it.status === "done").map((it) => it.url));
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Micro className="text-ink">{label}</Micro>
        <span className="text-[11px] text-mute tnum">
          {items.filter((i) => i.status === "done").length}/{max}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-mute">{hint}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
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
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-[12px] text-mute">
          <ImagePlus className="h-3.5 w-3.5" /> No images added yet — the first image becomes the primary photo.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-[4/3] bg-plate">
                {item.url ? (
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] text-mute">Unsupported file</div>
                )}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-end bg-ink/45 p-2">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                      <div className="h-full bg-white transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                )}
                {i === 0 && item.status === "done" && (
                  <span className="micro absolute left-2 top-2 rounded-full bg-ink px-2 py-1 text-[9px] text-white">
                    Primary
                  </span>
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
