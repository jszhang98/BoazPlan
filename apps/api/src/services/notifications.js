/**
 * Notification dispatch service — Epic 4: Communications & Notifications
 *
 * Every event always writes an in-app Notification record.
 * Push (Web Push / VAPID) is attempted when VAPID env vars are present.
 * Email is sent when SMTP_HOST is configured; in dev/test it falls back to
 * a console.log stub so no external calls are made during testing.
 *
 * Production wiring:
 *   VAPID_PUBLIC_KEY  / VAPID_PRIVATE_KEY  — generate with: npx web-push generate-vapid-keys
 *   VAPID_EMAIL       — mailto: contact address
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / EMAIL_FROM
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Email ──────────────────────────────────────────────────────────────────────

async function sendEmail(to, subject, text) {
  if (!process.env.SMTP_HOST) {
    // Dev / test: log only, no network call
    console.log(`[email:dev] to=${to} | subject="${subject}"`);
    return;
  }
  // Dynamic import keeps nodemailer optional — add `npm install nodemailer`
  // and configure SMTP_* env vars to enable real delivery.
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'BoazPlan <no-reply@boazplan.app>',
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('[email] send failed:', err.message);
  }
}

// ── Web Push ───────────────────────────────────────────────────────────────────

async function sendPush(userId, payload) {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return; // not configured in this env

  const { default: webpush } = await import('web-push');
  webpush.setVapidDetails(
    VAPID_EMAIL || 'mailto:admin@boazplan.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
    } catch (err) {
      // 410 Gone — subscription expired; clean up silently
      if (err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }
}

// ── Core dispatch ──────────────────────────────────────────────────────────────

/**
 * Send a notification to a single user.
 * Always creates an in-app Notification record; also attempts push + email
 * based on the user's notificationPreferences JSON.
 *
 * Default prefs (when not set): { email: true, push: true }
 */
export async function sendNotification(userId, { type, title, body = '', metadata = {} }) {
  // 1. Persist in-app notification (always)
  await prisma.notification.create({
    data: { userId, type, title, body, metadata: JSON.stringify(metadata) },
  });

  // 2. Load user + preferences
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  let prefs = { email: true, push: true };
  try { Object.assign(prefs, JSON.parse(user.notificationPreferences || '{}')); } catch {}

  // 3. Push — fire-and-forget, errors swallowed
  if (prefs.push) {
    sendPush(userId, { title, body, data: metadata }).catch(() => {});
  }

  // 4. Email — fire-and-forget, errors swallowed
  if (prefs.email) {
    sendEmail(user.email, title, body || title).catch(() => {});
  }
}

/**
 * Broadcast a notification to every member of a church.
 */
export async function broadcastToChurch(churchId, notification) {
  const members = await prisma.churchMembership.findMany({
    where: { churchId },
    select: { userId: true },
  });
  await Promise.allSettled(
    members.map(({ userId }) => sendNotification(userId, notification)),
  );
}

/**
 * Build and broadcast the weekly prayer & aid digest for a single church.
 * Returns { sent: N } where N is the number of open requests included.
 */
export async function runWeeklyDigest(churchId) {
  const open = await prisma.request.findMany({
    where: { churchId, status: { in: ['open', 'pending_approval'] }, hidden: false },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    take: 20,
  });

  if (open.length === 0) return { sent: 0 };

  const urgencyIcon = { urgent: '🔴', high: '🟠', normal: '🟢' };
  const lines = open.map((r) => `${urgencyIcon[r.urgency] ?? '•'} ${r.title}`).join('\n');

  await broadcastToChurch(churchId, {
    type: 'digest',
    title: 'Your Weekly Prayer & Aid Digest',
    body: `Open requests this week:\n\n${lines}`,
    metadata: { churchId },
  });

  return { sent: open.length };
}
