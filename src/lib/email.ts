import { Resend } from "resend";
import type { AuditEngagement, AuditReport, Lead } from "./types";
import { createServiceIntakeToken } from "./service-intake-token";

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

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHtmlFragment(value: string): string {
  return value
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .trim();
}

function formatPlainText(value?: string): string {
  if (!value?.trim()) return "";
  return escapeHtml(value.trim()).replace(/\n/g, "<br />");
}

function formatMeetingDate(value?: string): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function getStoreLabel(lead: Lead): string {
  return lead.storeName?.trim() || lead.siteUrl || lead.email;
}

function getGreeting(lead: Lead): string {
  return lead.storeName?.trim()
    ? `${escapeHtml(lead.storeName.trim())} team`
    : "there";
}

function wrapServiceEmail({
  title,
  introHtml,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  title: string;
  introHtml: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const baseUrl = getBaseUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#398860;">bConsulted First</p>
      <p style="margin:8px 0 0;font-size:13px;color:#667085;">Shopify operations advisory</p>
    </div>

    <div style="background:#ffffff;border:1px solid #d9e1da;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#172033;">${escapeHtml(title)}</h1>
      <div style="font-size:15px;line-height:1.7;color:#475467;">${introHtml}</div>
      <div style="margin-top:24px;">${bodyHtml}</div>
      ${
        ctaLabel && ctaUrl
          ? `<div style="margin-top:28px;">
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#398860;color:#ffffff;font-size:14px;font-weight:700;padding:12px 20px;border-radius:8px;text-decoration:none;">
          ${escapeHtml(ctaLabel)}
        </a>
      </div>`
          : ""
      }
    </div>

    <div style="margin-top:20px;text-align:center;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#667085;">
        Questions? Reply to this email or visit
        <a href="${escapeHtml(baseUrl)}" style="color:#398860;text-decoration:none;">${escapeHtml(baseUrl)}</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendServiceEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResend();
    const { error } = await client.emails.send({
      from: `bConsulted First <audits@${getEmailDomain()}>`,
      to,
      subject,
      html,
      text,
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

export async function sendReportEmail(
  to: string,
  report: AuditReport,
  html: string
): Promise<{ success: boolean; error?: string }> {
  return sendServiceEmail({
    to,
    subject: `Your Shopify Audit Report — Score: ${report.overallScore}/100`,
    html,
    text: `Your Shopify Operations Audit for ${report.storeUrl}\n\nOverall Score: ${report.overallScore}/100\n\n${report.executiveSummary}\n\nView your full report: ${getBaseUrl()}/audit/results/${report.id}`,
  });
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

export async function sendFullAuditIntakeEmail(
  lead: Lead,
  engagement: AuditEngagement
): Promise<{ success: boolean; error?: string }> {
  const storeLabel = getStoreLabel(lead);
  const formattedMeetingDate = formatMeetingDate(engagement.meetingAt);
  const intakeToken = createServiceIntakeToken({
    engagementId: engagement.id,
    leadId: lead.id,
  });
  const intakeUrl = `${getBaseUrl()}/service-intake?token=${encodeURIComponent(
    intakeToken
  )}`;
  const meetingBlock =
    engagement.meetingAt || engagement.meetingUrl
      ? `<div style="margin-top:20px;padding:16px;border-radius:10px;background:#f6fbf7;border:1px solid #d9e9dd;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#172033;">Current kickoff details</p>
          <p style="margin:0 0 6px;font-size:14px;color:#475467;"><strong>Meeting time:</strong> ${escapeHtml(formattedMeetingDate)}</p>
          <p style="margin:0;font-size:14px;color:#475467;"><strong>Meeting link:</strong> ${engagement.meetingUrl ? `<a href="${escapeHtml(engagement.meetingUrl)}" style="color:#398860;text-decoration:none;">${escapeHtml(engagement.meetingUrl)}</a>` : "Not set yet"}</p>
        </div>`
      : "";

  const html = wrapServiceEmail({
    title: "Full audit kickoff",
    introHtml: `<p style="margin:0 0 16px;">Hi ${getGreeting(lead)},</p>
      <p style="margin:0 0 16px;">Thanks for moving forward with a deeper review of <strong>${escapeHtml(storeLabel)}</strong>. To make the audit useful, we need a bit more operational context before we finalize the work.</p>
      <p style="margin:0;">Use the intake form below to send the details we need. Reply to this email if you would rather handle it directly.</p>`,
    bodyHtml: `<div style="padding:20px;border-radius:10px;background:#f9fafb;border:1px solid #e4e7ec;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#172033;">Please send back:</p>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#475467;">
          <li>Team size and key roles involved in operations</li>
          <li>Order volume, fulfillment setup, and any 3PL or warehouse tools</li>
          <li>Core systems used today: ERP, inventory, reporting, support, shipping, or spreadsheets</li>
          <li>The top 2-3 operational bottlenecks you want solved first</li>
          <li>Any growth goals, deadlines, or launch windows that affect priorities</li>
        </ul>
      </div>
      ${meetingBlock}`,
    ctaLabel: "Complete intake form",
    ctaUrl: intakeUrl,
  });

  const text = `Hi ${lead.storeName?.trim() ? `${lead.storeName.trim()} team` : "there"},

Thanks for moving forward with a deeper review of ${storeLabel}.

Complete the intake form here:
${intakeUrl}

If needed, you can also reply to this email with:
- Team size and key roles involved in operations
- Order volume, fulfillment setup, and 3PL or warehouse tools
- Core systems used today
- The top 2-3 operational bottlenecks you want solved first
- Any growth goals or deadlines

${engagement.meetingAt || engagement.meetingUrl ? `Current kickoff details:\nMeeting time: ${formattedMeetingDate}\nMeeting link: ${engagement.meetingUrl || "Not set yet"}\n` : ""}`;

  return sendServiceEmail({
    to: lead.email,
    subject: "Next step for your Shopify operations full audit",
    html,
    text,
  });
}

export async function sendMeetingConfirmationEmail(
  lead: Lead,
  engagement: AuditEngagement
): Promise<{ success: boolean; error?: string }> {
  if (!engagement.meetingAt || !engagement.meetingUrl) {
    return {
      success: false,
      error: "Meeting date/time and meeting URL are required",
    };
  }

  const storeLabel = getStoreLabel(lead);
  const formattedMeetingDate = formatMeetingDate(engagement.meetingAt);
  const agendaHtml = engagement.prioritySummary
    ? `<div style="margin-top:20px;padding:16px;border-radius:10px;background:#fff7e8;border:1px solid #f2dfb2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#172033;">Working agenda</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#475467;">${formatPlainText(engagement.prioritySummary)}</p>
      </div>`
    : "";

  const html = wrapServiceEmail({
    title: "Your audit session is scheduled",
    introHtml: `<p style="margin:0 0 16px;">Hi ${getGreeting(lead)},</p>
      <p style="margin:0;">Your Shopify operations session for <strong>${escapeHtml(storeLabel)}</strong> is confirmed. Use the link below to join at the scheduled time.</p>`,
    bodyHtml: `<div style="padding:20px;border-radius:10px;background:#f6fbf7;border:1px solid #d9e9dd;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#172033;">Meeting details</p>
        <p style="margin:0 0 6px;font-size:14px;color:#475467;"><strong>Date:</strong> ${escapeHtml(formattedMeetingDate)}</p>
        <p style="margin:0;font-size:14px;color:#475467;"><strong>Link:</strong> <a href="${escapeHtml(engagement.meetingUrl)}" style="color:#398860;text-decoration:none;">${escapeHtml(engagement.meetingUrl)}</a></p>
      </div>
      ${agendaHtml}`,
    ctaLabel: "Join the meeting",
    ctaUrl: engagement.meetingUrl,
  });

  const text = `Hi ${lead.storeName?.trim() ? `${lead.storeName.trim()} team` : "there"},

Your Shopify operations session for ${storeLabel} is confirmed.

Date: ${formattedMeetingDate}
Link: ${engagement.meetingUrl}

${engagement.prioritySummary ? `Working agenda:\n${engagement.prioritySummary}\n` : ""}`;

  return sendServiceEmail({
    to: lead.email,
    subject: "Your Shopify operations audit session is scheduled",
    html,
    text,
  });
}

export async function sendFinalAuditReportEmail(
  lead: Lead,
  engagement: AuditEngagement
): Promise<{ success: boolean; error?: string }> {
  const reportHtml = engagement.finalReportHtml
    ? normalizeHtmlFragment(engagement.finalReportHtml)
    : "";

  if (!reportHtml && !engagement.finalReportUrl) {
    return {
      success: false,
      error: "Missing final report content or final report URL",
    };
  }

  const storeLabel = getStoreLabel(lead);
  const summaryBlock = engagement.prioritySummary
    ? `<div style="margin-bottom:20px;padding:16px;border-radius:10px;background:#fff7e8;border:1px solid #f2dfb2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#172033;">Top priorities</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#475467;">${formatPlainText(engagement.prioritySummary)}</p>
      </div>`
    : "";
  const reportBlock = reportHtml
    ? `<div style="padding:24px;border-radius:10px;background:#ffffff;border:1px solid #d9e1da;">
        ${reportHtml}
      </div>`
    : `<div style="padding:20px;border-radius:10px;background:#f6fbf7;border:1px solid #d9e9dd;">
        <p style="margin:0;font-size:14px;line-height:1.7;color:#475467;">Your completed report is ready using the link below.</p>
      </div>`;

  const html = wrapServiceEmail({
    title: "Your completed Shopify operations audit",
    introHtml: `<p style="margin:0 0 16px;">Hi ${getGreeting(lead)},</p>
      <p style="margin:0;">Thanks again for the time on your audit engagement for <strong>${escapeHtml(storeLabel)}</strong>. Your completed report is ready below${engagement.finalReportUrl ? " and in the linked deliverable" : ""}.</p>`,
    bodyHtml: `${summaryBlock}${reportBlock}`,
    ctaLabel: engagement.finalReportUrl ? "Open full report" : undefined,
    ctaUrl: engagement.finalReportUrl || undefined,
  });

  const textParts = [
    `Hi ${lead.storeName?.trim() ? `${lead.storeName.trim()} team` : "there"},`,
    "",
    `Your completed Shopify operations audit for ${storeLabel} is ready.`,
  ];

  if (engagement.prioritySummary?.trim()) {
    textParts.push("", "Top priorities:", engagement.prioritySummary.trim());
  }

  if (reportHtml) {
    textParts.push("", stripHtml(reportHtml));
  }

  if (engagement.finalReportUrl) {
    textParts.push("", `Open full report: ${engagement.finalReportUrl}`);
  }

  return sendServiceEmail({
    to: lead.email,
    subject: "Your completed Shopify operations audit",
    html,
    text: textParts.join("\n"),
  });
}
