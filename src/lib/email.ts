import { Resend } from "resend";
import type { AuditReport } from "./types";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

function getEmailDomain(): string {
  const domain = process.env.EMAIL_DOMAIN;
  if (!domain) {
    throw new Error("Missing EMAIL_DOMAIN environment variable");
  }
  return domain;
}

export async function sendReportEmail(
  to: string,
  report: AuditReport,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResend();
    const { error } = await client.emails.send({
      from: `bConsulted First <audits@${getEmailDomain()}>`,
      to,
      subject: `Your Shopify Audit Report — Score: ${report.overallScore}/100`,
      html,
      text: `Your Shopify Operations Audit for ${report.storeUrl}\n\nOverall Score: ${report.overallScore}/100\n\n${report.executiveSummary}\n\nView your full report: ${process.env.NEXT_PUBLIC_BASE_URL}/audit/results/${report.id}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Email send failed:", message);
    return { success: false, error: message };
  }
}

export async function sendContactNotification(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResend();
    const { error } = await client.emails.send({
      from: `bConsulted First <notifications@${getEmailDomain()}>`,
      to: `hello@${getEmailDomain()}`,
      subject: `Contact Form: ${subject}`,
      text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown email error";
    return { success: false, error: msg };
  }
}
