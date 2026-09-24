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
    <LegalShell eyebrow="Legal" title="Terms &" italic="Conditions." updated="September 2026">
      <Clause n="01" title="Who we are">
        <p>
          LUCOMI ENTERPRISE ("LUCOMI", "we", "us") designs and manufactures office furniture from our factory at{" "}
          {settings.address} These terms apply to use of this website and to quotations and orders placed with us.
        </p>
      </Clause>
      <Clause n="02" title="Quotations & pricing">
        <p>
          Product prices are quoted individually because they may depend on dimensions, materials, finishes and quantity.
          Any quotation issued by LUCOMI will state its validity period and the terms that apply. An order becomes
          binding only when the quotation and any required deposit or payment have been accepted in accordance with the
          terms communicated to you.
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
          Because custom furniture may be manufactured specifically to an approved specification, cancellation terms may
          depend on the stage of production and the materials or services already committed. Any applicable cancellation,
          return, refund or restocking terms will be stated in the relevant quotation or order. Please contact LUCOMI
          promptly if you need to change or cancel an order.
        </p>
      </Clause>
      <Clause n="06" title="Workmanship">
        <p>
          Any warranty or workmanship commitment applicable to an order will be stated in the relevant quotation, invoice or
          warranty document. Where a manufacturing defect is covered, contact LUCOMI so the issue can be inspected and
          the appropriate remedy can be determined. Warranty coverage may not extend to misuse, unauthorised alteration,
          improper installation, accident or ordinary wear and tear.
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
          Nothing in these terms excludes or limits liability where doing so would be unlawful under Nigerian law. Any
          other limitation of liability applicable to an order will be stated in the relevant quotation, contract or
          order terms.
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
    <LegalShell eyebrow="Legal" title="Privacy" italic="Policy." updated="September 2026">
      <Clause n="01" title="What this policy covers">
        <p>
          This policy explains how LUCOMI ENTERPRISE handles personal information collected through this website and through
          related customer interactions, including enquiry and quotation forms, custom project submissions, reviews and
          WhatsApp conversations you choose to start from the site.
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
        <p>Depending on the interaction, we may use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respond to enquiries and prepare quotations</li>
          <li>Plan, produce, deliver and install your order</li>
          <li>Verify and, with your consent, publish your review</li>
          <li>Keep records required for business and legal purposes</li>
        </ul>
        <p>We do not sell your personal information. We use it only for the purposes described in this policy or where otherwise
          permitted or required by applicable law.</p>
      </Clause>
      <Clause n="04" title="Reviews">
        <p>
          If you submit a review, your name, company and review text may be published on this website after approval.
          Your email address is used only to follow up on the review and is never published.
        </p>
      </Clause>
      <Clause n="05" title="WhatsApp & third parties">
        <p>
          Choosing "WhatsApp Us" opens WhatsApp, which is operated by Meta and governed by Meta's own terms and privacy
          policy. We may also use service providers for website hosting, database services, image/media hosting, email or
          other technical functions. Those providers may process information on our behalf and may process or store it
          outside Nigeria where applicable safeguards and legal requirements permit.
        </p>
      </Clause>
      <Clause n="06" title="Storage & security">
        <p>
          We retain personal information only for as long as reasonably necessary for the purpose for which it was collected,
          to complete transactions, resolve disputes, maintain appropriate business records or comply with legal
          obligations. We take reasonable technical and organisational measures to protect the information we hold,
          while recognising that no internet transmission or storage system can be guaranteed to be completely secure.
        </p>
      </Clause>
      <Clause n="07" title="Your choices">
        <p>
          Subject to applicable law, you may ask us for information about personal data we hold about you and may request
          correction, deletion, restriction or objection where the law gives you that right. You may also withdraw consent
          where processing is based on consent. To make a request, contact {settings.email}. We may need to verify your
          identity before acting on a request, and some records may need to be retained where required by law.
        </p>
      </Clause>
      <Clause n="08" title="Children">
        <p>This website is intended for business customers and is not directed at children.</p>
      </Clause>
      <Clause n="09" title="Cookies & technical information">
        <p>
          The website may process limited technical information such as browser, device, IP address and basic usage
          information that is normally transmitted when a website is accessed. Where cookies or similar technologies are
          used beyond what is technically necessary, LUCOMI will provide any notice or choice required by applicable law.
        </p>
      </Clause>
      <Clause n="10" title="Data-protection complaints">
        <p>
          If you have a concern about how LUCOMI handles your personal information, please contact us first so we can
          investigate and respond. You may also have the right to complain to the Nigeria Data Protection Commission
          (NDPC) under applicable data-protection law.
        </p>
      </Clause>
      <Clause n="11" title="Changes to this policy">
        <p>
          If this policy changes, the updated version will be published on this page with a new "last updated" date.
        </p>
      </Clause>
      <Clause n="12" title="Contact">
        <p>
          Privacy questions or data-protection requests: {settings.email} · {settings.address}
        </p>
      </Clause>
    </LegalShell>
  );
}
