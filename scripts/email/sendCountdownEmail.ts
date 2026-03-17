import { Resend } from "resend";
import config from "../../app/web/app/config.json";
import recipients from "./recipients.json";
import funFacts from "./funFacts.json";

const FROM_ADDRESS =
  "Distortion Countdown <countdown@distortion.arthurtoppenberg.dk>";

interface Recipient {
  name: string;
  email: string;
}

function getDaysLeft(): number {
  const target = new Date(config.countdown).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

function getFunFact(daysLeft: number): string {
  const typedFunFacts: string[] = funFacts;
  return typedFunFacts[daysLeft % typedFunFacts.length];
}

function buildText(daysLeft: number, recipientName: string): string {
  const year = new Date(config.countdown).getFullYear();

  if (daysLeft === 0) {
    return `Distortion er i dag!\n\nSes derude, ${recipientName}!\n\n— Distortion ${year}`;
  }

  const dayWord = daysLeft === 1 ? "dag" : "dage";
  const funFact = getFunFact(daysLeft);
  return [
    "COUNTDOWN TO DISTORTION",
    "",
    `${daysLeft} ${dayWord} tilbage`,
    "",
    `Hej ${recipientName} — der er kun ${daysLeft} ${dayWord} til Distortion.`,
    "",
    `💡 Vidste du? ${funFact}`,
    "",
    `— Distortion ${year}`,
  ].join("\n");
}

function darkModeStyles(): string {
  return `
    <style>
      :root { color-scheme: light dark; }
      @media (prefers-color-scheme: dark) {
        .email-body { background-color: #1a1a2e !important; }
        .email-wrapper { background-color: #1a1a2e !important; }
        .header-label { color: #9ca3af !important; }
        .greeting { color: #d1d5db !important; }
        .greeting strong { color: #ffffff !important; }
        .footer-text { color: #6b7280 !important; }
        .fun-fact-box { background-color: #2d2b55 !important; border-color: #4338ca !important; }
        .fun-fact-label { color: #a78bfa !important; }
        .fun-fact-text { color: #c4b5fd !important; }
        .day-zero-greeting { color: #d1d5db !important; }
      }
    </style>`;
}

function buildHtml(daysLeft: number, recipientName: string): string {
  const year = new Date(config.countdown).getFullYear();

  if (daysLeft === 0) {
    return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  ${darkModeStyles()}
</head>
<body class="email-body" style="margin:0;padding:0;background-color:#ffffff;">
  <div class="email-wrapper" style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;text-align:center;background-color:#ffffff;">
    <h1 style="font-size:48px;margin:0 0 16px;">🎉</h1>
    <h2 style="font-size:28px;color:#fff;background:linear-gradient(135deg,#10b981,#06b6d4);padding:24px;border-radius:16px;">
      Distortion er i dag!
    </h2>
    <p class="day-zero-greeting" style="color:#555;margin-top:16px;font-size:16px;">Ses derude, ${recipientName}!</p>
  </div>
</body>
</html>`;
  }

  const dayWord = daysLeft === 1 ? "dag" : "dage";
  const funFact = getFunFact(daysLeft);
  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  ${darkModeStyles()}
</head>
<body class="email-body" style="margin:0;padding:0;background-color:#ffffff;">
  <div class="email-wrapper" style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;text-align:center;background-color:#ffffff;">
    <p class="header-label" style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Countdown to Distortion</p>
    <div style="background:linear-gradient(135deg,#18181b,#27272a);border-radius:16px;padding:40px 20px;margin:16px 0;">
      <span style="font-size:72px;font-weight:900;color:#fff;font-family:monospace;">${daysLeft}</span>
      <p style="color:#a1a1aa;text-transform:uppercase;letter-spacing:4px;font-size:14px;margin:8px 0 0;">
        ${dayWord} tilbage
      </p>
    </div>
    <p class="greeting" style="color:#555;font-size:14px;margin-top:20px;">Hej ${recipientName} — der er kun <strong>${daysLeft}</strong> ${dayWord} til Distortion 🎶</p>
    <div class="fun-fact-box" style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin:24px 0;text-align:left;">
      <p class="fun-fact-label" style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#0284c7;font-weight:700;">💡 Vidste du?</p>
      <p class="fun-fact-text" style="margin:0;font-size:13px;color:#0c4a6e;line-height:1.5;">${funFact}</p>
    </div>
    <p class="footer-text" style="color:#999;font-size:11px;margin-top:32px;">Distortion ${year}</p>
  </div>
</body>
</html>`;
}

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const resend = new Resend(apiKey);
  const daysLeft = getDaysLeft();
  const dayWord = daysLeft === 1 ? "dag" : "dage";
  const subject =
    daysLeft === 0
      ? "Distortion er i dag!"
      : `${daysLeft} ${dayWord} til Distortion`;

  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const typedRecipients: Recipient[] = recipients;
  const failures: string[] = [];

  for (const [index, recipient] of typedRecipients.entries()) {
    if (index > 0) {
      await delay(5000);
    }

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipient.email,
      subject,
      text: buildText(daysLeft, recipient.name),
      html: buildHtml(daysLeft, recipient.name),
    });

    if (error) {
      const message = `Failed to send to ${recipient.email}: ${error.message}`;
      console.error(`Email » Error: ${message}`);
      failures.push(message);
    } else {
      console.info(`Email » Sent to ${recipient.email} (${daysLeft} days left)`);
    }
  }

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
