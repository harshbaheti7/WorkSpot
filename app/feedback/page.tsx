import ContactForm from "@/components/ContactForm";

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Feedback
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Tell us what&apos;s working.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Wrong hours? A café we missed? A score you disagree with? Send it in
        — v1 gets better with every correction.
      </p>
      <ContactForm subjectPrefix="Feedback" />
    </div>
  );
}
