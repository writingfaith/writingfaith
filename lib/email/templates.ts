/**
 * Transactional email templates, hand-built HTML in the site's palette.
 * Email clients need table-safe markup and inline styles; these templates
 * stay deliberately spare — one message, one action.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell({ body, footer }: { body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f9f6ef;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6ef;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;text-align:left;">
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#201c16;padding-bottom:28px;">
                Writing<span style="color:#8a5a2b;font-style:italic;">Faith</span>
              </td>
            </tr>
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.65;color:#201c16;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding-top:36px;border-top:1px solid #e6ddcd;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#6f6656;">
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background-color:#8a5a2b;border-radius:4px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function magicLinkEmail({ url }: { url: string }) {
  return {
    subject: "Your sign-in link for WritingFaith",
    html: shell({
      body: `<p style="margin:0 0 16px;">Hello,</p>
        <p style="margin:0 0 16px;">Use the button below to sign in to WritingFaith. The link is valid for 24 hours and can be used once.</p>
        ${button(url, "Sign in to WritingFaith")}
        <p style="margin:0;">If you didn’t request this, you can safely ignore this email — nothing happens unless the link is used.</p>`,
      footer: `This link was requested from writingfaith. For your security, don’t forward this email.`,
    }),
    text: `Sign in to WritingFaith:\n\n${url}\n\nThe link is valid for 24 hours and can be used once. If you didn't request this, you can ignore this email.`,
  };
}

export function confirmSubscriptionEmail({
  confirmUrl,
  unsubscribeUrl,
}: {
  confirmUrl: string;
  unsubscribeUrl: string;
}) {
  return {
    subject: "Confirm your subscription to WritingFaith",
    html: shell({
      body: `<p style="margin:0 0 16px;">Hello,</p>
        <p style="margin:0 0 16px;">You asked to receive new essays from WritingFaith by email. Please confirm your subscription:</p>
        ${button(confirmUrl, "Confirm subscription")}
        <p style="margin:0;">If this wasn’t you, do nothing — you won’t be subscribed.</p>`,
      footer: `You received this because your address was entered at writingfaith. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6f6656;">Unsubscribe</a>`,
    }),
    text: `Confirm your subscription to WritingFaith:\n\n${confirmUrl}\n\nIf this wasn't you, do nothing — you won't be subscribed.\n\nUnsubscribe: ${unsubscribeUrl}`,
  };
}
