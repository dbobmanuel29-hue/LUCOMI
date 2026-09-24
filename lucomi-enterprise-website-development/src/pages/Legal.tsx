import { Link } from "react-router-dom";
import { useSettings } from "../components/Chrome";
import { Micro, Reveal, usePageMeta } from "../components/ui";

function LegalShell({
  eyebrow,
  title,
  italic,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">{eyebrow}</Micro>
        <h1 className="display mt-5 text-[clamp(2.6rem,8vw,5.6rem)]">
          {title}
          <span className="block pl-[5vw] italic">{italic}</span>
        </h1>
        <p className="micro mt-8 text-mute">Last updated — {updated}</p>
      </section>
      <section className="shell pb-20 pt-12 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">{children}</div>
          <aside className="lg:col-span-3 lg:col-start-10">
            <div className="rounded-xl border border-line/70 bg-white p-6 lg:sticky lg:top-[110px]">
              <Micro className="text-ink">Questions?</Micro>
              <p className="mt-3 text-[14px] leading-relaxed text-mute">
                If anything on this page is unclear, contact LUCOMI directly and we will explain it plainly.
              </p>
              <Link to="/contact" className="micro mt-4 inline-block text-royal hover:text-ink">
                Contact us →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <div className="rule grid gap-x-6 py-7 sm:grid-cols-[auto_1fr]">
        <span className="display text-[22px] italic text-royal tnum">{n}</span>
        <div>
          <h2 className="display text-[28px] leading-none sm:text-[32px]">{title}</h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-mute">{children}</div>
        </div>
      </div>
    </Reveal>
  );
}

export function Terms() {
  usePageMeta(
    "Terms & Conditions — LUCOMI ENTERPRISE",
    "The terms and conditions that apply to quotations, orders, production, delivery and installation of LUCOMI ENTERPRISE office furniture.",
  );
  const settings = useSettings();

  return (
    <LegalShell eyebrow="Legal" title="Terms &" italic="Conditions." updated="February 2025">
      <Clause n="01" title="Who we are">
        <p>
          LUCOMI ENTERPRISE ("LUCOMI", "we", "us") designs and manufactures office furniture from our factory at{" "}
          {settings.address} These terms apply to use of this website and to quotations and orders placed with us.
        </p>
      </Clause>
      <Clause n="02" title="Quotations & pricing">
        <p>
          Product prices are quoted individually because they depend on dimensions, materials, finishes and quantity.
          A quotation is an offer that remains valid for the period stated on it. No order exists until you approve a
          quotation and we confirm acceptance.
        </p>
        <p>Prices shown as "Price on Request" or "Contact for Price" are not offers and carry no committed price.</p>
      </Clause>
      <Clause n="03" title="Orders & production">
        <p>
          Made-to-order and custom furniture is produced to the specification, drawings and finishes approved by you
          before production begins. Changes requested after approval may affect price and schedule and must be agreed
          in writing.
        </p>
      </Clause>
      <Clause n="04" title="Delivery & installation">
        <p>
          Delivery and installation arrangements, timescales and any related costs are stated in your quotation.
          Please inspect furniture on delivery and report visible damage as soon as reasonably possible.
        </p>
      </Clause>
      <Clause n="05" title="Cancellations & returns">
        <p>
          Because custom furniture is manufactured specifically for you, cancellations after production has begun may
          incur costs for work completed and materials committed. Standard catalogue items are handled case by case —
          contact us and we will find a fair outcome.
        </p>
      </Clause>
      <Clause n="06" title="Workmanship">
        <p>
          We stand behind our workmanship. If a piece develops a fault arising from manufacture under normal office
          use, contact us and we will inspect and repair or make good as appropriate. This does not cover misuse,
          alteration by others or normal wear.
        </p>
      </Clause>
      <Clause n="07" title="Website content">
        <p>
          Content on this website — text, photography, drawings and the LUCOMI name and logo — belongs to LUCOMI
          ENTERPRISE or its licensors and may not be reproduced for commercial purposes without permission. Product
          imagery is representative; finishes may vary slightly from screen colours.
        </p>
      </Clause>
      <Clause n="08" title="Liability">
        <p>
          Nothing in these terms excludes liability that cannot be excluded under Nigerian law. Beyond that, our
          liability in connection with an order is limited to the price paid for that order.
        </p>
      </Clause>
      <Clause n="09" title="Governing law">
        <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
      </Clause>
      <Clause n="10" title="Contact">
        <p>
          Questions about these terms: {settings.email} · {settings.phone.join(" / ")}
        </p>
      </Clause>
    </LegalShell>
  );
}

export function Privacy() {
  usePageMeta(
    "Privacy Policy — LUCOMI ENTERPRISE",
    "How LUCOMI ENTERPRISE collects, uses and protects the personal information you share through enquiries, quotations and reviews.",
  );
  const settings = useSettings();

  return (
    <LegalShell eyebrow="Legal" title="Privacy" italic="Policy." updated="February 2025">
      <Clause n="01" title="What this policy covers">
        <p>
          This policy explains how LUCOMI ENTERPRISE handles personal information collected through this website —
          enquiry and quotation forms, the custom project form, the review form and WhatsApp conversations you start
          from the site.
        </p>
      </Clause>
      <Clause n="02" title="Information we collect">
        <p>When you contact us we collect what you choose to give us, typically:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name and company name</li>
          <li>Phone number and email address</li>
          <li>Details of your furniture requirement, space and location</li>
          <li>Reference images you upload with a custom project brief</li>
          <li>Review content, rating and the email used to verify it</li>
        </ul>
      </Clause>
      <Clause n="03" title="How we use it">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respond to enquiries and prepare quotations</li>
          <li>Plan, produce, deliver and install your order</li>
          <li>Verify and, with your consent, publish your review</li>
          <li>Keep records required for business and legal purposes</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </Clause>
      <Clause n="04" title="Reviews">
        <p>
          If you submit a review, your name, company and review text may be published on this website after approval.
          Your email address is used only to follow up on the review and is never published.
        </p>
      </Clause>
      <Clause n="05" title="WhatsApp & third parties">
        <p>
          Choosing "WhatsApp Us" opens WhatsApp, which is operated by Meta and governed by its own privacy policy.
          Website media may be served by third-party hosting providers (for example our image hosting service); these
          providers receive standard technical data such as your IP address when images load.
        </p>
      </Clause>
      <Clause n="06" title="Storage & security">
        <p>
          Enquiry records are kept only as long as needed to serve you and meet our legal obligations. We take
          reasonable technical and organisational steps to protect the information we hold.
        </p>
      </Clause>
      <Clause n="07" title="Your choices">
        <p>
          You may ask us at any time to correct or delete the personal information we hold about you, or to remove a
          published review. Write to {settings.email} and we will act on your request.
        </p>
      </Clause>
      <Clause n="08" title="Children">
        <p>This website is intended for business customers and is not directed at children.</p>
      </Clause>
      <Clause n="09" title="Changes to this policy">
        <p>
          If this policy changes, the updated version will be published on this page with a new "last updated" date.
        </p>
      </Clause>
      <Clause n="10" title="Contact">
        <p>
          Privacy questions: {settings.email} · {settings.address}
        </p>
      </Clause>
    </LegalShell>
  );
}
