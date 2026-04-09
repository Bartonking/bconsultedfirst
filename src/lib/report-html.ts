import type { AuditReport } from "./types";

function scoreColor(score: number): string {
  if (score >= 70) return "#398860";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function severityColor(severity: string): { bg: string; text: string } {
  switch (severity) {
    case "high":
      return { bg: "#fef2f2", text: "#dc2626" };
    case "medium":
      return { bg: "#fffbeb", text: "#d97706" };
    default:
      return { bg: "#f0fdf4", text: "#16a34a" };
  }
}

export function renderReportHtml(
  report: AuditReport,
  leadInfo?: { email: string; name?: string }
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bconsultedfirst.com";

  const bookParams = new URLSearchParams();
  if (leadInfo?.email) bookParams.set("email", leadInfo.email);
  if (leadInfo?.name) bookParams.set("name", leadInfo.name);
  bookParams.set("storeUrl", report.storeUrl);
  const bookUrl = `${baseUrl}/book${bookParams.size ? "?" + bookParams.toString() : ""}`;

  const categoryRows = report.categories
    .map(
      (cat) => `
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#1a2332;">${cat.name}</td>
        <td style="padding:12px 16px;width:60%;">
          <div style="background:#f3f4f6;border-radius:8px;height:12px;overflow:hidden;">
            <div style="background:${scoreColor(cat.score)};height:100%;width:${cat.score}%;border-radius:8px;"></div>
          </div>
        </td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:${scoreColor(cat.score)};text-align:right;">${cat.score}/100</td>
      </tr>
    `
    )
    .join("");

  const findingsHtml = report.findings
    .map((f) => {
      const colors = severityColor(f.severity);
      return `
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="display:inline-block;background:${colors.bg};color:${colors.text};font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;text-transform:uppercase;">${f.severity}</span>
          <span style="font-size:13px;color:#6b7280;">${f.category}</span>
        </div>
        <p style="font-size:14px;color:#1a2332;margin:0 0 12px;"><strong>Observation:</strong> ${f.observation}</p>
        <p style="font-size:14px;color:#6b7280;margin:0 0 12px;"><strong>Why it matters:</strong> ${f.whyItMatters}</p>
        <p style="font-size:14px;color:#398860;margin:0;"><strong>Recommendation:</strong> ${f.recommendation}</p>
      </div>
    `;
    })
    .join("");

  const recommendationsHtml = report.recommendations
    .map(
      (rec) =>
        `<li style="padding:8px 0;font-size:14px;color:#1a2332;">${rec}</li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopify Operations Audit — ${report.storeUrl}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:20px;color:#1a2332;margin:0 0 4px;">
        <span style="color:#398860;">bConsulted</span> First
      </h1>
      <p style="font-size:13px;color:#6b7280;margin:0;">Preliminary Shopify Operations Audit</p>
    </div>

    <!-- Overall Score -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Overall Score</p>
      <p style="font-size:56px;font-weight:700;color:${scoreColor(report.overallScore)};margin:0 0 4px;line-height:1;">
        ${report.overallScore}<span style="font-size:20px;color:#6b7280;">/100</span>
      </p>
      <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">${report.storeUrl}</p>
    </div>

    <!-- Executive Summary -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:16px;color:#1a2332;margin:0 0 12px;">Executive Summary</h2>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">${report.executiveSummary}</p>
    </div>

    <!-- Category Scores -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:16px;color:#1a2332;margin:0 0 16px;">Category Scores</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${categoryRows}
      </table>
    </div>

    <!-- Findings -->
    <div style="margin-bottom:24px;">
      <h2 style="font-size:16px;color:#1a2332;margin:0 0 16px;">Key Findings</h2>
      ${findingsHtml}
    </div>

    <!-- Recommendations -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:32px;">
      <h2 style="font-size:16px;color:#1a2332;margin:0 0 12px;">Recommended Next Steps</h2>
      <ol style="margin:0;padding-left:20px;">
        ${recommendationsHtml}
      </ol>
    </div>

    <!-- CTA -->
    <div style="background:#398860;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <h2 style="font-size:20px;color:#ffffff;margin:0 0 12px;">Want a deeper operational review?</h2>
      <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 20px;">
        Book a consultation to review findings with a specialist and create an improvement plan.
      </p>
      <a href="${bookUrl}" style="display:inline-block;background:#ffffff;color:#398860;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Book a Consultation
      </a>
    </div>

    <!-- Disclaimer -->
    <p style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.5;">
      This is a preliminary AI-powered review based on publicly visible storefront signals
      and operational best-practice patterns. It does not access your Shopify admin, internal
      data, or private systems.
    </p>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        &copy; ${new Date().getFullYear()} bConsulted First &mdash;
        <a href="${baseUrl}" style="color:#398860;text-decoration:none;">bconsultedfirst.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
