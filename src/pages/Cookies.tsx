import { Link } from "react-router-dom";
import { useSettings } from "../components/Chrome";
import { Micro, Reveal, usePageMeta } from "../components/ui";

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return <Reveal><div className="rule grid gap-x-6 py-7 sm:grid-cols-[auto_1fr]"><span className="display text-[22px] italic text-royal tnum">{n}</span><div><h2 className="display text-[28px] leading-none sm:text-[32px]">{title}</h2><div className="mt-3 space-y-3 text-[15px] leading-relaxed text-mute">{children}</div></div></div></Reveal>;
}
export function Cookies() {
  usePageMeta("Cookie Policy — LUCOMI ENTERPRISE","How LUCOMI ENTERPRISE uses cookies and similar browser storage technologies on this website.");
  const settings = useSettings();
  return <>
    <section className="shell pt-[120px] sm:pt-[150px]"><Micro className="text-ink">Legal</Micro><h1 className="display mt-5 text-[clamp(2.6rem,8vw,5.6rem)]">Cookie<span className="block pl-[5vw] italic">Policy.</span></h1><p className="micro mt-8 text-mute">Last updated — September 2026</p></section>
    <section className="shell pb-20 pt-12 sm:pb-28"><div className="max-w-4xl">
      <Clause n="01" title="What cookies are"><p>Cookies are small files stored on your device by a website. Similar technologies can also store or access information through your browser, including local storage. This policy uses “cookies” as a simple term for both.</p></Clause>
      <Clause n="02" title="What LUCOMI uses"><p>LUCOMI currently uses limited first-party browser storage for essential preferences. The website stores your light/dark theme choice and your cookie-consent choice in local storage. These are used to operate features you have requested and remember your privacy preference.</p></Clause>
      <Clause n="03" title="Essential storage"><p>Essential browser storage is used for site preferences and consent management. It is not used to sell personal information or to build advertising profiles.</p></Clause>
      <Clause n="04" title="Analytics"><p>LUCOMI does not currently load Google Analytics, Meta Pixel, advertising cookies or another third-party analytics platform through the public website. The Analytics option in the consent panel is therefore off unless and until a service is introduced.</p></Clause>
      <Clause n="05" title="Third-party services"><p>When you choose to open services such as WhatsApp or social-media profiles, you leave the LUCOMI website and the third party may use its own cookies or similar technologies. Their own privacy and cookie policies then apply.</p></Clause>
      <Clause n="06" title="Your choices"><p>You can reject optional technologies or change your preference at any time using Cookie Settings in the website footer. Rejecting optional technologies does not prevent you from browsing the catalogue or contacting LUCOMI.</p></Clause>
      <Clause n="07" title="Changes"><p>If LUCOMI introduces non-essential cookies or similar technologies, this policy will be updated with the relevant purpose and the consent controls will be updated before they are activated where required.</p></Clause>
      <Clause n="08" title="Contact"><p>Questions about cookies or privacy: {settings.email}</p></Clause>
    </div></section>
  </>;
}