import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

export function ConsultationCTA() {
  return (
    <section className="py-20 md:py-28 px-6 bg-primary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Need a deeper operational review?
        </h2>
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Your AI-powered audit gives you a fast preliminary snapshot. If you want deeper
          insight into workflows, reporting, systems, and operational priorities, the next
          step is a consultation. We&apos;ll review the findings with you, clarify what matters
          most, and map out where to focus first.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-pale transition-colors"
          >
            Book Consultation <IconArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-white/10 transition-colors"
          >
            Learn About Services
          </Link>
        </div>
      </div>
    </section>
  );
}
