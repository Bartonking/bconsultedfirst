"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const STEPS = [
  "Connecting to storefront...",
  "Analyzing site structure...",
  "Reviewing catalog organization...",
  "Evaluating product pages...",
  "Assessing operational signals...",
  "Generating your report...",
];

export default function AuditProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(stepInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 120);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        router.push("/audit/results/rpt-001");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, router]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6 bg-background">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Generating your audit
          </h1>
          <p className="text-muted mb-10">
            We&apos;re reviewing your storefront and generating a preliminary operational snapshot.
          </p>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted mb-8">{progress}% complete</p>

          {/* Steps */}
          <div className="space-y-3 text-left max-w-sm mx-auto">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                  i <= currentStep ? "opacity-100" : "opacity-30"
                }`}
              >
                {i < currentStep ? (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : i === currentStep ? (
                  <div className="w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-200 rounded-full flex-shrink-0" />
                )}
                <span className={i <= currentStep ? "text-foreground" : "text-muted"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
