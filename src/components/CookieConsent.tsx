import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Settings, X } from "lucide-react";

const STORAGE_KEY = "lucomi-cookie-consent";
type Consent = { analytics: boolean; updatedAt: string };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Consent;
    return typeof value.analytics === "boolean" ? value : null;
  } catch { return null; }
}

function saveConsent(analytics: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics, updatedAt: new Date().toISOString() }));
  } catch {}
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const current = readConsent();
    setConsent(current);
    setAnalytics(current?.analytics ?? false);
    const open = () => setSettingsOpen(true);
    window.addEventListener("lucomi:open-cookie-settings", open);
    return () => window.removeEventListener("lucomi:open-cookie-settings", open);
  }, []);

  const apply = (allowAnalytics: boolean) => {
    saveConsent(allowAnalytics);
    setAnalytics(allowAnalytics);
    setConsent({ analytics: allowAnalytics, updatedAt: new Date().toISOString() });
    setSettingsOpen(false);
  };

  if (consent && !settingsOpen) return null;

  if (settingsOpen) {
    return (
      <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
        <div role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" className="w-full max-w-xl rounded-2xl border border-line bg-paper p-5 plate-shadow-lg sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="micro text-royal">Privacy preferences</p><h2 id="cookie-settings-title" className="display mt-2 text-[32px]">Cookie settings.</h2></div>
            <button type="button" onClick={() => setSettingsOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute hover:border-ink hover:text-ink" aria-label="Close cookie settings"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
            <div className="flex items-center justify-between gap-5 p-4">
              <div><p className="text-sm font-semibold text-ink">Essential</p><p className="mt-1 text-xs leading-relaxed text-mute">Required for basic site operation and remembering your privacy choice.</p></div>
              <span className="shrink-0 rounded-full bg-royal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-royal">Always on</span>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-5 p-4">
              <span><span className="block text-sm font-semibold text-ink">Analytics</span><span className="mt-1 block text-xs leading-relaxed text-mute">Optional measurement technologies. LUCOMI currently has no third-party analytics service enabled.</span></span>
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="h-5 w-5 shrink-0 accent-[var(--color-royal)]" />
            </label>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => apply(false)} className="rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:bg-plate">Reject optional</button>
            <button type="button" onClick={() => apply(analytics)} className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink-deep">Save preferences</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-[110] border-t border-line bg-paper/95 shadow-[0_-12px_35px_-25px_rgba(10,42,94,0.45)] backdrop-blur-md">
      <div className="shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="min-w-0 max-w-3xl">
          <p className="text-sm font-semibold text-ink">Cookies & privacy</p>
          <p className="mt-1 text-xs leading-relaxed text-mute sm:text-[13px]">LUCOMI uses essential browser storage for site preferences and to remember your privacy choice. Optional analytics are currently off. <Link to="/cookies" className="font-semibold text-royal hover:text-ink">Cookie Policy</Link>.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => apply(false)} className="rounded-lg border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-plate">Reject optional</button>
          <button type="button" onClick={() => setSettingsOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-royal/30 bg-royal/5 px-4 py-2.5 text-xs font-semibold text-royal hover:bg-royal/10"><Settings className="h-3.5 w-3.5" /> Settings</button>
          <button type="button" onClick={() => apply(true)} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-ink-deep"><Check className="h-3.5 w-3.5" /> Accept all</button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("lucomi:open-cookie-settings"))}>Cookie Settings</button>;
}
