import { useState } from "react";
import { ArrowRight, Check, Star } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { IMG } from "../lib/mock";
import { cn } from "../lib/helpers";
import { ReviewQuote } from "../components/ReviewQuote";
import { Button, ErrorState, Field, Input, Micro, Notice, Reveal, Skeleton, Textarea, usePageMeta } from "../components/ui";
import { useAuth } from "../components/AuthFlow";

const STEPS = [
  ["01", "Share your experience", "Tell us what you ordered and how it works in your space."],
  ["02", "We review it", "Customer feedback stays unpublished until it has been checked."],
  ["03", "Your words go live", "Approved reviews help the next customer plan their workspace."],
];

export default function Reviews() {
  usePageMeta(
    "Reviews & Feedback - LUCOMI ENTERPRISE",
    "Read customer feedback and share your experience with LUCOMI ENTERPRISE office furniture. Every review is approved before publication.",
  );

  const { data, loading, error, reload } = useAsync(() => api.testimonials.list());
  const { user, open: openAuth } = useAuth();
  const reviewsToShow = (data ?? []).filter((item) => item.published);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", company: "", product: "", content: "" });
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating || !consent) return;
    setStatus("saving");
    try {
      await api.testimonials.save({
        id: `review-${Date.now()}`,
        userId: user?.uid,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        company: form.company.trim(),
        product: form.product.trim(),
        content: form.content.trim(),
        rating,
        image: user?.photoURL ?? "",
        published: false,
        placeholder: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">Reviews / Customer Stories</Micro>
        <h1 className="display mt-5 text-[clamp(3.1rem,10vw,7rem)]">
          Words from
          <span className="block pl-[6vw] italic">the Workspace.</span>
        </h1>
        <div className="mt-9 grid gap-7 md:grid-cols-12 md:items-end">
          <p className="text-[16px] leading-relaxed text-mute md:col-span-6">
            Honest feedback makes better furniture. Tell us how a LUCOMI piece works in your space. Customer
            submissions are reviewed before they appear here.
          </p>
          <div className="md:col-span-4 md:col-start-9 md:text-right">
            <Button onClick={() => {
              document.getElementById("share-review")?.scrollIntoView({ behavior: "smooth" });
              if (!user) openAuth();
            }} variant="outline">
              Share your experience <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Reveal variant="clip" className="relative mt-12 overflow-hidden rounded-xl bg-ink">
          <img
            src={IMG.reception}
            alt="A thoughtfully furnished reception area with a white and walnut counter and visitor seating"
            className="h-[48vw] max-h-[510px] min-h-[280px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-2xl p-7 sm:p-12">
            <Micro className="text-white/70">Listening to our customers</Micro>
            <p className="display mt-3 text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] text-white">
              Good spaces deserve honest stories.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Micro className="text-ink">Customer voices</Micro>
            <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
              The Experience,
              <span className="block italic">In Their Words.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
            Feedback from businesses and organisations LUCOMI ENTERPRISE has furnished. Every new submission is
            approved before it appears here.
          </p>
        </div>

        {loading && (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {[0, 1, 2].map((item) => <Skeleton key={item} className="h-56 rounded-lg" />)}
          </div>
        )}
        {error && <div className="mt-10"><ErrorState message={error} onRetry={reload} /></div>}
        {!loading && !error && reviewsToShow.length === 0 && (
          <div className="mt-12 border-t border-line py-14">
            <h3 className="display text-3xl">No published reviews yet.</h3>
            <p className="mt-3 max-w-lg text-sm text-mute">Have a LUCOMI workspace? Be the first to tell us about it.</p>
          </div>
        )}
        {!loading && !error && reviewsToShow.length > 0 && (
          <div className="mt-12 grid gap-x-16 gap-y-12 lg:grid-cols-2">
            {reviewsToShow.map((review, index) => (
              <Reveal key={review.id} delay={(index % 2) * 0.08}>
                <ReviewQuote review={review} featured={index === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="share-review" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Micro className="text-ink">Your Experience</Micro>
            <h2 className="display mt-5 text-[clamp(2.5rem,5vw,3.8rem)]">
              Tell us how
              <span className="block italic">it works for you.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-mute">
              Bought or used LUCOMI furniture? We would value your honest feedback on the furniture, the service and
              how the space is working now.
            </p>
            <div className="mt-8 border-t border-line pt-6">
              <Micro className="text-royal">What happens next</Micro>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                Your review goes to the LUCOMI team for a quick check, then appears on this page once approved. We may
                email you to confirm details before publishing.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {status === "success" ? (
              <div className="border-t border-line pt-8" role="status">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-royal text-white">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="display mt-6 text-[clamp(2.4rem,5vw,3.6rem)]">Thank you for sharing.</h3>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute">
                  Your review has been received and is with the LUCOMI team for approval. Once checked, it will appear
                  on this page.
                </p>
                <Button className="mt-8" variant="outline" onClick={() => {
                  setForm({ customerName: "", customerEmail: "", company: "", product: "", content: "" });
                  setRating(0);
                  setConsent(false);
                  setStatus("idle");
                }}>
                  Share another review
                </Button>
              </div>
            ) : !user ? (
              <div className="border-t border-line pt-8">
                <Notice title="Sign in required">
                  You need a LUCOMI account to submit a review. You can still read all published reviews without signing in.
                </Notice>
                <Button className="mt-6" onClick={openAuth}>Sign In / Create Account</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6 border-t border-line pt-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" required>
                    <Input required value={form.customerName} onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))} placeholder="Your full name" />
                  </Field>
                  <Field label="Email" hint="not published" required>
                    <Input required type="email" value={form.customerEmail} onChange={(event) => setForm((prev) => ({ ...prev, customerEmail: event.target.value }))} placeholder="you@company.com" />
                  </Field>
                  <Field label="Company" hint="optional">
                    <Input value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} placeholder="Organisation name" />
                  </Field>
                  <Field label="Furniture or project" hint="optional">
                    <Input value={form.product} onChange={(event) => setForm((prev) => ({ ...prev, product: event.target.value }))} placeholder="e.g. Executive desk" />
                  </Field>
                </div>
                <div>
                  <p className="micro text-ink">Your rating <span className="text-royal">*</span></p>
                  <div className="mt-3 flex gap-2" role="group" aria-label="Select a rating from one to five stars">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                        aria-pressed={rating === value}
                        onClick={() => setRating(value)}
                        className={cn("flex h-11 w-11 items-center justify-center rounded-full border transition-colors", value <= rating ? "border-royal bg-royal text-white" : "border-line bg-paper text-mute hover:border-royal")}
                      >
                        <Star className={cn("h-5 w-5", value <= rating && "fill-current")} />
                      </button>
                    ))}
                  </div>
                  {!rating && <p className="mt-2 text-[12px] text-mute">Choose a rating to continue.</p>}
                </div>
                <Field label="Your review" required>
                  <Textarea
                    required
                    minLength={20}
                    maxLength={1200}
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    placeholder="What did you order, and how has it been to use?"
                  />
                </Field>
                <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-mute">
                  <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#1560E8]" />
                  I agree that LUCOMI may review and, after approval, publish my name, company and feedback. My email
                  is only used to follow up and is not shown publicly.
                </label>
                {status === "error" && <Notice tone="warn" title="Unable to save review">Please try again.</Notice>}
                <Button type="submit" size="lg" disabled={status === "saving"}>
                  {status === "saving" ? "Saving review..." : "Submit Review"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="shell py-20 sm:py-28">
        <Micro className="text-ink">A clear process</Micro>
        <h2 className="display mt-4 text-[clamp(2.5rem,6vw,4rem)]">How reviews are shared.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(([number, title, detail], index) => (
            <Reveal key={number} delay={index * 0.08}>
              <div className="border-t border-line pt-6">
                <span className="display text-[25px] italic text-royal">{number}</span>
                <h3 className="display mt-3 text-[29px]">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-mute">{detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}