import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL } from "@/lib/site";

export default function ContactPage() {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Contact us
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Say hello.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Prefer email? Reach us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-ink underline"
        >
          {CONTACT_EMAIL}
        </a>
        . Or use the form below.
      </p>
      <ContactForm subjectPrefix="Contact" />
    </div>
  );
}
