"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconCheck, IconCalendar } from "@/components/icons";

interface VerifyData {
  consultationId: string;
  name: string;
  email: string;
  paid: boolean;
}

function CalendlyEmbed({
  name,
  email,
  consultationId,
}: {
  name: string;
  email: string;
  consultationId: string;
}) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  useEffect(() => {
    if (!calendlyUrl) return;

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [calendlyUrl]);

  if (!calendlyUrl) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Calendar scheduling is not yet configured.</p>
      </div>
    );
  }

  const fullUrl = `${calendlyUrl}?hide_gdpr_banner=1&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&utm_content=${encodeURIComponent(consultationId)}`;

  return (
    <div
      className="calendly-inline-widget"
      data-url={fullUrl}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyData | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session ID. Please return to the booking page.");
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Payment verification failed");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex-1 pt-32 pb-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-border rounded-full mx-auto mb-4" />
            <div className="h-8 bg-border rounded w-64 mx-auto mb-2" />
            <div className="h-4 bg-border rounded w-48 mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex-1 pt-32 pb-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-red-600 mb-4">{error || "Something went wrong."}</p>
          <a
            href="/book"
            className="text-primary hover:text-accent transition-colors font-semibold"
          >
            Return to booking
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-32 pb-20 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        {/* Payment confirmation */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Payment confirmed
          </h1>
          <p className="text-muted text-lg">
            Now pick a time for your 30-minute consultation.
          </p>
        </div>

        {/* Details card */}
        <div className="bg-section-alt rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <IconCalendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Consultation Details
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              <span className="text-muted">Name:</span> {data.name}
            </p>
            <p className="text-foreground">
              <span className="text-muted">Email:</span> {data.email}
            </p>
            <p className="text-foreground">
              <span className="text-muted">Amount:</span> $50.00 USD
            </p>
          </div>
        </div>

        {/* Calendly embed */}
        <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden">
          <CalendlyEmbed
            consultationId={data.consultationId}
            name={data.name}
            email={data.email}
          />
        </div>
      </div>
    </main>
  );
}

export default function BookSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-1 pt-32 pb-20 bg-background">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <p className="text-muted">Loading...</p>
            </div>
          </main>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
