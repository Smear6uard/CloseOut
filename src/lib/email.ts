/**
 * Email notification HTML templates.
 *
 * These are pure functions that return { subject, html } objects.
 * They accept an `appUrl` parameter so they work in any runtime
 * (browser, Convex Node actions, etc.).
 *
 * To send emails, create a Convex Node action that uses Resend:
 *   "use node";
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   const { subject, html } = itemAssignedHtml({ ..., appUrl: process.env.APP_URL });
 *   await resend.emails.send({ from: "...", to, subject, html });
 */

interface ItemAssignedParams {
  to: string;
  itemTitle: string;
  projectName: string;
  assignedBy: string;
  itemUrl: string;
  appUrl: string;
}

interface ItemCompletedParams {
  to: string;
  itemTitle: string;
  projectName: string;
  completedBy: string;
  itemUrl: string;
  appUrl: string;
}

interface ReportReadyParams {
  to: string;
  projectName: string;
  reportUrl: string;
  appUrl: string;
}

function baseHtml(content: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 24px; }
    .header h1 { color: #2563eb; font-size: 20px; margin: 0; }
    .cta { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header"><h1>CloseOut</h1></div>
  ${content}
  <div class="footer">
    <p>You're receiving this because you use CloseOut.</p>
    <p><a href="${appUrl}/settings">Manage notifications</a></p>
  </div>
</body>
</html>`;
}

export function itemAssignedHtml(params: ItemAssignedParams): {
  subject: string;
  html: string;
} {
  return {
    subject: `New item assigned: ${params.itemTitle}`,
    html: baseHtml(
      `
      <p><strong>${params.assignedBy}</strong> assigned you a punch list item in <strong>${params.projectName}</strong>:</p>
      <p style="font-size: 16px; font-weight: 600;">${params.itemTitle}</p>
      <a href="${params.itemUrl}" class="cta">View Item</a>
    `,
      params.appUrl
    ),
  };
}

export function itemCompletedHtml(params: ItemCompletedParams): {
  subject: string;
  html: string;
} {
  return {
    subject: `Item completed: ${params.itemTitle}`,
    html: baseHtml(
      `
      <p><strong>${params.completedBy}</strong> marked a punch list item as complete in <strong>${params.projectName}</strong>:</p>
      <p style="font-size: 16px; font-weight: 600;">${params.itemTitle}</p>
      <a href="${params.itemUrl}" class="cta">Review Item</a>
    `,
      params.appUrl
    ),
  };
}

export function reportReadyHtml(params: ReportReadyParams): {
  subject: string;
  html: string;
} {
  return {
    subject: `Report ready: ${params.projectName}`,
    html: baseHtml(
      `
      <p>Your punch list report for <strong>${params.projectName}</strong> is ready to download.</p>
      <a href="${params.reportUrl}" class="cta">Download Report</a>
    `,
      params.appUrl
    ),
  };
}
