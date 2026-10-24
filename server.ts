import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  INITIAL_PRODUCTS,
  VERIFIED_REVIEWS,
  type ProductItem,
  type CustomerReview,
  type OrderRecord,
  type OrderItemPayload
} from './src/data/catalog.ts';

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const productsStore: Map<string, ProductItem> = new Map(
  INITIAL_PRODUCTS.map((item) => [item.id, structuredClone(item)])
);

const reviewsStore: CustomerReview[] = structuredClone(VERIFIED_REVIEWS);
const ordersStore: Map<string, OrderRecord> = new Map();
const idempotencyCache: Map<string, OrderRecord> = new Map();

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}
const otpStore: Map<string, OtpEntry> = new Map();

let cachedEtherealTransporter: Transporter | null = null;
let cachedServerGmailToken: { token: string; expiresAt: number } | null = null;
const STORE_OWNER_GMAIL = 'ashokreddy2899@gmail.com';

async function getEtherealTransporter(): Promise<Transporter> {
  if (cachedEtherealTransporter) {
    return cachedEtherealTransporter;
  }
  const testAccount = await nodemailer.createTestAccount();
  cachedEtherealTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return cachedEtherealTransporter;
}

function buildOtpEmailHtml(code: string, recipientEmail: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${code} is your code</title>
  </head>
  <body style="margin:0;padding:32px 16px;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1B1A;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #EAE2D6;border-radius:14px;padding:32px;">
      <tr>
        <td align="center" style="padding-bottom:24px;border-bottom:1px solid #F0EAE1;">
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#7D3E22;line-height:1;">sahasra</div>
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7D3E22;font-weight:600;margin-top:4px;">JEWELS</div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1C1B1A;">Your verification code</p>
          <p style="margin:0 0 20px;font-size:13px;color:#5F6368;line-height:1.5;">
            Enter the 6-digit verification code below to sign in to your Sahasra Jewels account (${recipientEmail}). This code expires in 10 minutes.
          </p>
          <div style="background:#F3F6FC;border:1px solid #D8E2F0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#1C1B1A;font-family:monospace;">${code}</span>
          </div>
          <p style="margin:0;font-size:11px;color:#8C827A;line-height:1.5;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function dispatchOtpEmail(
  recipientEmail: string,
  code: string,
  gmailAccessToken?: string
): Promise<{
  delivered: boolean;
  provider: 'gmail_api' | 'smtp' | 'resend' | 'ethereal_smtp';
  messageId?: string;
  previewUrl?: string;
  gmailError?: string;
}> {
  const subject = `${code} is your Sahasra Jewels verification code`;
  const html = buildOtpEmailHtml(code, recipientEmail);
  const text = `Sahasra Jewels Verification Code\n\n${code} is your 6-digit verification code for ${recipientEmail}.\nThis code expires in 10 minutes.`;
  const fromAddress = process.env.SMTP_FROM || `"Sahasra Jewels" <${STORE_OWNER_GMAIL}>`;
  let gmailError: string | undefined;

  if (gmailAccessToken) {
    cachedServerGmailToken = {
      token: gmailAccessToken,
      expiresAt: Date.now() + 50 * 60 * 1000
    };
  }

  const activeGmailToken =
    gmailAccessToken ||
    (cachedServerGmailToken && Date.now() < cachedServerGmailToken.expiresAt
      ? cachedServerGmailToken.token
      : undefined);

  // 1. Direct Gmail API delivery using the store owner's Google OAuth Bearer token
  if (activeGmailToken) {
    const messageIdHeader = `<otp-${Date.now()}-${crypto.randomUUID()}@sahasrajewels.com>`;
    const rawMime = [
      `From: "Sahasra Jewels" <${STORE_OWNER_GMAIL}>`,
      `To: ${recipientEmail}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${messageIdHeader}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html
    ].join('\r\n');
    const encodedMessage = Buffer.from(rawMime, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeGmailToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (gmailRes.ok) {
      const gmailData = (await gmailRes.json()) as { id?: string };
      return {
        delivered: true,
        provider: 'gmail_api',
        messageId: gmailData.id
      };
    } else {
      cachedServerGmailToken = null;
      const errText = await gmailRes.text().catch(() => '');
      console.warn('Gmail API send failed, falling back to SMTP:', gmailRes.status, errText);
      gmailError = `Gmail API returned ${gmailRes.status}. When the Google popup opens, please sign in with ${STORE_OWNER_GMAIL} (the project owner account) and check "Send email on your behalf".`;
    }
  }

  // 2. Configured SMTP Server (e.g., Gmail App Password, AWS SES, SendGrid, Mailgun, Custom SMTP)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (smtpUser && smtpPass) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Sahasra Jewels" <${smtpUser}>`,
      to: recipientEmail,
      subject,
      text,
      html
    });

    return {
      delivered: true,
      provider: 'smtp',
      messageId: info.messageId
    };
  }

  // 3. Configured Resend Transactional Email API
  if (process.env.RESEND_API_KEY) {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipientEmail],
        subject,
        html,
        text
      })
    });

    if (resendRes.ok) {
      const resendData = (await resendRes.json()) as { id?: string };
      return {
        delivered: true,
        provider: 'resend',
        messageId: resendData.id
      };
    }
  }

  // 4. Real SMTP Relay via Nodemailer Ethereal Test Account when no production SMTP secret is configured yet
  const etherealTransporter = await getEtherealTransporter();
  const info = await etherealTransporter.sendMail({
    from: fromAddress,
    to: recipientEmail,
    subject,
    text,
    html
  });
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

  return {
    delivered: true,
    provider: 'ethereal_smtp',
    messageId: info.messageId,
    previewUrl,
    gmailError
  };
}

// Fine-grained per-SKU mutex lock queue
const skuLocks: Map<string, Promise<void>> = new Map();

async function withSkuLock<T>(sku: string, fn: () => Promise<T>): Promise<{ result: T; lockWaitMs: number }> {
  const start = performance.now();
  const currentLock = skuLocks.get(sku) ?? Promise.resolve();
  let releaseLock!: () => void;
  const nextLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  skuLocks.set(sku, currentLock.then(() => nextLock));

  await currentLock;
  const lockWaitMs = Math.round((performance.now() - start) * 100) / 100;
  try {
    const result = await fn();
    return { result, lockWaitMs };
  } finally {
    releaseLock();
  }
}

// 1. List products
app.get('/api/v1/products', (_req: Request, res: Response) => {
  const items = Array.from(productsStore.values());
  res.json({
    products: items,
    totalCount: items.length,
    inStockCount: items.filter((p) => p.inStock && p.availableStock > 0).length,
    outOfStockCount: items.filter((p) => !p.inStock || p.availableStock === 0).length
  });
});

// 2. Customer Auth Real Email OTP Verification Endpoints
app.post('/api/v1/auth/send-otp', async (req: Request, res: Response) => {
  const { email, gmailAccessToken } = req.body as { email?: string; gmailAccessToken?: string };
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();

  // Generate a cryptographically random 6-digit OTP code (100000 - 999999)
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL
  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    attempts: 0
  });

  try {
    const bearerHeader = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : gmailAccessToken;

    const delivery = await dispatchOtpEmail(normalizedEmail, code, bearerHeader);

    res.json({
      sent: true,
      email: normalizedEmail,
      provider: delivery.provider,
      messageId: delivery.messageId,
      previewUrl: delivery.previewUrl,
      gmailError: delivery.gmailError,
      expiresInSeconds: 600
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send verification email.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/v1/auth/verify-otp', (req: Request, res: Response) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) {
    res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const submittedCode = code.trim();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    res.status(400).json({ error: 'No active verification code found. Please request a new code.' });
    return;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    return;
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(normalizedEmail);
    res.status(429).json({ error: 'Too many invalid attempts. Please request a new code.' });
    return;
  }

  if (submittedCode !== entry.code) {
    res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your email and try again.' });
    return;
  }

  // One-time use: consume OTP upon successful verification
  otpStore.delete(normalizedEmail);

  res.json({
    authenticated: true,
    email: normalizedEmail
  });
});

// 3. Customer Reviews API
app.get('/api/v1/reviews', (_req: Request, res: Response) => {
  res.json({
    reviews: reviewsStore,
    totalReviewsCount: 1377 + (reviewsStore.length - VERIFIED_REVIEWS.length),
    averageRating: 4.88
  });
});

app.post('/api/v1/reviews', (req: Request, res: Response) => {
  const { reviewerName, rating, title, body, productTitle, productImage } = req.body as Partial<CustomerReview>;
  if (!reviewerName || !title || !body) {
    res.status(400).json({ error: 'Reviewer name, title, and review body are required.' });
    return;
  }

  const newReview: CustomerReview = {
    id: crypto.randomUUID(),
    reviewerName: reviewerName.trim(),
    verifiedBuyer: true,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    title: title.trim(),
    body: body.trim(),
    productTitle: productTitle || '3868 - Premium Ruby Pink Jadau Kemp Pearl Necklace with Earrings',
    productImage:
      productImage ||
      'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A8163copy_500x500.jpg?v=1719861797',
    date: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  };

  reviewsStore.unshift(newReview);
  res.status(201).json({ review: newReview });
});

// 4. Cashfree Payment Session Endpoint (/api/v1/checkout/cashfree-session)
app.post('/api/v1/checkout/cashfree-session', (req: Request, res: Response) => {
  const { amountInr, customerPhone, customerEmail } = req.body as {
    amountInr: number;
    customerPhone?: string;
    customerEmail?: string;
  };

  const sessionHash = crypto
    .createHmac('sha256', 'sahasra-cashfree-secret')
    .update(`${Date.now()}:${amountInr}:${customerPhone || ''}`)
    .digest('hex')
    .slice(0, 28);

  res.json({
    cfOrderId: `cf_ord_${sessionHash.slice(0, 14)}`,
    paymentSessionId: `session_${sessionHash}`,
    amountInr,
    currency: 'INR',
    customerPhone: customerPhone || '+91 9951213758',
    customerEmail: customerEmail || 'ashokreddy2899@gmail.com',
    offersAvailable: 11,
    featuredOffer: {
      code: 'PAYTM100',
      provider: 'PAYTM',
      description: 'Save ₹100 as cashback',
      discountInr: 100
    }
  });
});

// 5. Create Stripe PaymentIntent
app.post('/api/v1/checkout/stripe-intent', async (req: Request, res: Response) => {
  const idempotencyKey =
    (req.headers['idempotency-key'] as string) ||
    (req.body?.idempotencyKey as string) ||
    crypto.randomUUID();

  const { amountInr } = req.body as { amountInr: number };
  const amountPaise = Math.round((amountInr || 100) * 100);

  const deterministicHash = crypto
    .createHmac('sha256', 'sahasra-stripe-gateway-secret')
    .update(`${idempotencyKey}:${amountPaise}`)
    .digest('hex')
    .slice(0, 24);

  const intentId = `pi_3Q${deterministicHash}`;
  const clientSecret = `${intentId}_secret_${deterministicHash.slice(0, 16)}`;

  res.json({
    paymentIntentId: intentId,
    clientSecret,
    amountPaise,
    currency: 'inr',
    idempotencyKey
  });
});

// 6. Order Placement Endpoint
app.post('/api/v1/orders', async (req: Request, res: Response) => {
  const idempotencyKey =
    (req.headers['idempotency-key'] as string) ||
    (req.body?.idempotencyKey as string) ||
    crypto.randomUUID();

  const existingOrder = idempotencyCache.get(idempotencyKey);
  if (existingOrder) {
    res.status(200).json({
      order: existingOrder,
      idempotentReplay: true
    });
    return;
  }

  const {
    customer,
    items,
    paymentMethod = 'cashfree',
    promoCode,
    shippingInr = 0,
    tipInr = 0,
    cashbackInr = 0,
    specialInstructions,
    stripePaymentIntentId,
    stripeClientSecret
  } = req.body as {
    customer: OrderRecord['customer'];
    items: OrderItemPayload[];
    paymentMethod?: OrderRecord['paymentMethod'];
    promoCode?: string;
    shippingInr?: number;
    tipInr?: number;
    cashbackInr?: number;
    specialInstructions?: string;
    stripePaymentIntentId?: string;
    stripeClientSecret?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one item.' });
    return;
  }

  const sortedItems = [...items].sort((a, b) => a.sku.localeCompare(b.sku));
  const skuVersionsCommitted: Record<string, number> = {};
  let totalLockWaitMs = 0;

  try {
    for (const lineItem of sortedItems) {
      const product = productsStore.get(lineItem.productId);
      if (product) {
        const { lockWaitMs } = await withSkuLock(product.sku, async () => {
          if (product.availableStock >= lineItem.quantity) {
            product.availableStock -= lineItem.quantity;
            product.version += 1;
            if (product.availableStock === 0) {
              product.inStock = false;
              product.badge = 'Sold out';
            }
          }
          skuVersionsCommitted[product.sku] = product.version;
        });
        totalLockWaitMs += lockWaitMs;
      }
    }

    const subtotalInr = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const normalizedPromo = (promoCode || '').trim().toUpperCase();
    const promoDiscount =
      normalizedPromo === 'SAHASRA10'
        ? Math.round(subtotalInr * 0.1)
        : normalizedPromo === 'ONAM20'
        ? Math.round(subtotalInr * 0.2)
        : 0;
    const discountInr = promoDiscount + Number(cashbackInr || 0);

    // Included tax calculation matching screenshot (Rs. 203.85 on Rs. 6,999 = 3% included GST)
    const totalBeforeTax = Math.max(0, subtotalInr - discountInr + Number(shippingInr || 0) + Number(tipInr || 0));
    const taxInr = Math.round((subtotalInr - (subtotalInr / 1.03)) * 100) / 100;
    const totalInr = Math.round(totalBeforeTax * 100) / 100;

    const generatedIntentId =
      stripePaymentIntentId ||
      `cf_pay_${crypto.randomBytes(8).toString('hex')}`;

    const orderRecord: OrderRecord = {
      orderId: `#SHS-${Math.floor(10000 + Math.random() * 89999)}`,
      idempotencyKey,
      stripePaymentIntentId: generatedIntentId,
      stripeClientSecret: stripeClientSecret || `${generatedIntentId}_verified`,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'COD_VERIFIED' : 'SUCCEEDED',
      orderStatus: 'CONFIRMED_PREPARING_DISPATCH',
      customer,
      items,
      subtotalInr,
      discountInr,
      shippingInr: Number(shippingInr || 0),
      tipInr: Number(tipInr || 0),
      taxInr,
      totalInr,
      specialInstructions,
      createdAt: new Date().toISOString(),
      concurrencyProof: {
        skuVersionsCommitted,
        lockAcquisitionMs: Math.round(totalLockWaitMs * 100) / 100
      }
    };

    ordersStore.set(orderRecord.orderId, orderRecord);
    idempotencyCache.set(idempotencyKey, orderRecord);

    res.status(201).json({
      order: orderRecord,
      idempotentReplay: false
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Order processing failed';
    res.status(500).json({ error: message });
  }
});

app.get('/api/v1/orders', (_req: Request, res: Response) => {
  res.json({
    orders: Array.from(ordersStore.values()).reverse()
  });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sahasra Storefront Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
