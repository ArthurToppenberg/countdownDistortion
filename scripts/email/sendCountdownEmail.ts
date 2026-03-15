import { Resend } from "resend";
import config from "../../app/web/app/config.json";
import recipients from "./recipients.json";

const FROM_ADDRESS = "Distortion Countdown <onboarding@resend.dev>";

interface Recipient {
  name: string;
  email: string;
}

function getDaysLeft(): number {
  const target = new Date(config.countdown).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

function buildText(daysLeft: number, recipientName: string): string {
  const year = new Date(config.countdown).getFullYear();

  if (daysLeft === 0) {
    return `Distortion er i dag!\n\nSes derude, ${recipientName}!\n\n— Distortion ${year}`;
  }

  const dayWord = daysLeft === 1 ? "dag" : "dage";
  return [
    "COUNTDOWN TO DISTORTION",
    "",
    `${daysLeft} ${dayWord} tilbage`,
    "",
    `Hej ${recipientName} — der er kun ${daysLeft} ${dayWord} til Distortion.`,
    "",
    `— Distortion ${year}`,
  ].join("\n");
}

function buildHtml(daysLeft: number, recipientName: string): string {
  const year = new Date(config.countdown).getFullYear();

  if (daysLeft === 0) {
    return `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;text-align:center;">
        <h1 style="font-size:48px;margin:0 0 16px;">🎉</h1>
        <h2 style="font-size:28px;color:#fff;background:linear-gradient(135deg,#10b981,#06b6d4);padding:24px;border-radius:16px;">
          Distortion er i dag!
        </h2>
        <p style="color:#666;margin-top:16px;">Ses derude, ${recipientName}!</p>
      </div>`;
  }

  const dayWord = daysLeft === 1 ? "dag" : "dage";
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;text-align:center;">
      <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Countdown to Distortion</p>
      <div style="background:linear-gradient(135deg,#18181b,#27272a);border-radius:16px;padding:40px 20px;margin:16px 0;">
        <span style="font-size:72px;font-weight:900;color:#fff;font-family:monospace;">${daysLeft}</span>
        <p style="color:#a1a1aa;text-transform:uppercase;letter-spacing:4px;font-size:14px;margin:8px 0 0;">
          ${dayWord} tilbage
        </p>
      </div>
      <p style="color:#666;font-size:14px;margin-top:20px;">Hej ${recipientName} — der er kun <strong>${daysLeft}</strong> ${dayWord} til Distortion 🎶</p>
      <p style="color:#999;font-size:11px;margin-top:32px;">Distortion ${year}</p>
    </div>`;
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

  const typedRecipients: Recipient[] = recipients;
  const results = await Promise.allSettled(
    typedRecipients.map(async (recipient) => {
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: recipient.email,
        subject,
        text: buildText(daysLeft, recipient.name),
        html: buildHtml(daysLeft, recipient.name),
      });

      if (error) {
        throw new Error(`Failed to send to ${recipient.email}: ${error.message}`);
      }

      return recipient.email;
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      console.info(`Email » Sent to ${result.value} (${daysLeft} days left)`);
    } else {
      console.error(`Email » ${result.reason}`);
    }
  }

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
