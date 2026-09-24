import { Mail } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { IMG, team as fallbackTeam } from "../lib/mock";
import { waLink } from "../lib/helpers";
import { SocialLinks, TIKTOK_DISCOVERY, useSettings } from "../components/Chrome";
import { TikTokIcon, WhatsAppIcon } from "../components/BrandIcons";
import { useQuote } from "../components/QuoteFlow";
import { Button, Marquee, Micro, Reveal, usePageMeta } from "../components/ui";

export default function Team() {
  usePageMeta(
    "Meet the Team — LUCOMI ENTERPRISE",
    "Meet the people behind LUCOMI ENTERPRISE — design, production, finishing, installation and client relations for professional office furniture in Port Harcourt, Nigeria.",
  );
  const { open } = useQuote();
  const settings = useSettings();
  const { data } = useAsync(() => api.team.list());
  const team = data && data.length ? data : fallbackTeam;
  const founder = team.find((m) => m.featured) ?? team[0];
  const rest = team.filter((m) => m.id !== founder.id);

  return (
    <>
      {/* hero */}
      <section className="shell pt-[120px] sm:pt-[150px]">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Micro className="text-ink">The People</Micro>
            <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)]">
              Meet the
              <span className="block pl-[6vw] italic">Team.</span>
            </h1>
            <Reveal variant="left" className="mt-10 text-[17px] leading-relaxed text-mute">
              <p>
                LUCOMI ENTERPRISE is built around a small, hands-on team — the person who designs your furniture, the
                people who build it, and the people who install and look after it. Every enquiry passes through the
                same workshop and the same standards.
              </p>
            </Reveal>
          </div>
          <div className="space-y-4 lg:col-span-5 lg:col-start-8">
            <Reveal variant="clip" className="relative overflow-hidden rounded-xl bg-ink">
              <img
                src={IMG.workshop}
                alt="Inside the LUCOMI workshop — materials, tools and furniture in production"
                className="aspect-[16/10] w-full object-cover opacity-85 sm:aspect-[16/9] lg:aspect-[4/3]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <Micro className="text-white/70">Design / Make / Deliver</Micro>
                <p className="display mt-2 text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] text-white">
                  Behind every detail,
                  <br />
                  <span className="italic">there are people.</span>
                </p>
              </div>
            </Reveal>
            <Reveal variant="right" className="rounded-xl border border-line/70 bg-white p-7 plate-shadow">
              <Micro className="text-ink">Where the work happens</Micro>
              <p className="mt-3 text-[15px] leading-relaxed text-charcoal">{settings.address}</p>
              <SocialLinks settings={settings} tone="light" className="mt-5" />
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee
        className="mt-14 border-y border-line bg-white"
        items={["Design", "Production", "Finishing", "Quality", "Delivery", "Installation", "After-sales Care"]}
      />

      {/* founder feature */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="clip" className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full rounded-t-[220px] rounded-b-3xl bg-ink/10" aria-hidden="true" />
              <img
                src={founder.image}
                alt={`${founder.name}, ${founder.role} at LUCOMI ENTERPRISE`}
                loading="lazy"
                className="relative aspect-[4/5] w-full rounded-t-[220px] rounded-b-3xl object-cover"
              />
              <span className="micro absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/92 px-5 py-2 text-[#0A2A5E]">
                {founder.role}
              </span>
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Micro className="text-royal">Leadership</Micro>
            <h2 className="display mt-5 text-[clamp(2.6rem,6vw,4.6rem)]">{founder.name}</h2>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-mute">{founder.bio}</p>

            <div className="mt-8 border-t border-line pt-7">
              <Micro className="text-royal">The approach</Micro>
              <p className="display mt-3 max-w-xl text-[clamp(1.6rem,3.4vw,2.4rem)] italic leading-[1.15] text-ink">
                Understand the brief. Work out the details. Make furniture that serves the space.
              </p>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {founder.focus.map((f) => (
                <li key={f} className="rounded-full border border-line bg-paper px-4 py-2 text-[12.5px] text-charcoal">
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={() => open("", "Quote Request")}>Work With Us</Button>
              <Button
                variant="outline"
                href={waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* team grid */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Micro className="text-ink">The Workshop Team</Micro>
            <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
              The People Behind
              <span className="block italic">Every Order.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
            From the drawing board to the delivery truck, each member owns part of the journey your furniture takes
            through LUCOMI.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((member, i) => (
            <Reveal key={member.id} delay={(i % 3) * 0.06} variant="scale" className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line/70 bg-white plate-shadow transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden bg-plate">
                  <img
                    src={member.image}
                    alt={`${member.name}, ${member.role} at LUCOMI ENTERPRISE`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <span className="micro absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[#0A2A5E]">
                    {member.role}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="display text-[29px] leading-none">{member.name}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-mute">{member.bio}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {member.focus.map((f) => (
                      <li key={f} className="rounded-full bg-plate px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-mute">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}

          {/* join / contact card fills the last slot */}
          <Reveal delay={0.12} variant="scale" className="h-full">
            <div className="flex h-full flex-col justify-between rounded-xl bg-ink p-7 text-white">
              <div>
                <Micro className="text-white/55">Get In Touch</Micro>
                <h3 className="display mt-4 text-[32px] leading-none text-white">Talk to the people who make it.</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/70">
                  Questions about an order, a custom design or delivery? The team replies by phone, email and WhatsApp.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                <Button variant="light" full href="/contact">
                  <Mail className="h-4 w-4" /> Contact the Team
                </Button>
                <a
                  href={settings.social.tiktok || TIKTOK_DISCOVERY}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={settings.social.tiktok ? "LUCOMI on TikTok" : "Search for LUCOMI on TikTok"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white/10"
                >
                  <TikTokIcon className="h-4 w-4" /> {settings.social.tiktok ? "TikTok" : "Find on TikTok"}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <Micro className="text-ink">How We Work Together</Micro>
              <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.2rem)]">
                One Team,
                <span className="block italic">One Standard.</span>
              </h2>
            </div>
          </div>
          <div className="mt-12 grid gap-x-14 md:grid-cols-2">
            {[
              ["Direct communication", "You speak with the people actually responsible for your furniture — not a chain of intermediaries."],
              ["Shared drawings", "Designs are agreed in writing and in drawing form before a single panel is cut."],
              ["Visible production", "The workshop is in Port Harcourt. Where practical, clients can see work in progress."],
              ["Owned handover", "The same team that built the furniture delivers and installs it, and stands behind it afterwards."],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={(i % 2) * 0.06}>
                <div className="rule grid grid-cols-[auto_1fr] gap-x-6 py-7">
                  <span className="display text-[24px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-[29px] leading-none">{title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-mute">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="bg-ink">
        <div className="shell flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)] text-white">
            Let's build
            <br />
            <span className="italic">your workspace.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="light" size="lg" onClick={() => open("", "Quote Request")}>
              Request a Quote
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/35 text-white hover:bg-white hover:text-ink"
              href="/custom"
            >
              Start a Custom Project
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
