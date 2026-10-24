# Sahasra — Sarees & Heritage Jewellery (`sahasra-ecommerce-app`)

Headless e-commerce platform for handcrafted South Indian Kasavu sarees, festive gift hampers, and 22K gold-plated temple jewellery.

## Key Features

- **Storefront & Collections**: Multi-category filtering (`Sarees`, `Gift Hampers`, `Temple Jewellery`, `Chokers & Bangles`, `Forever Flowers`), live search modal, secondary hover photography, and verified customer reviews.
- **Customer Authentication & Real Email OTP**:
  - Cryptographic 6-digit OTP generation (`crypto.randomInt(100000, 1000000)`) with 10-minute TTL and rate-limiting.
  - Real email delivery via **Google Gmail API (`gmail.send`)**, **Nodemailer SMTP** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`), and **Resend API**.
  - Customer Profile & Orders portal with saved shipping addresses and marketing preferences.
- **Full-Page Cart & Checkout**:
  - Interactive cart drawer and full-page cart view with special order instructions.
  - 2-column checkout with standard/express shipping, tip calculator, promo codes (`SAHASRA10`, `ONAM20`), and 3% included GST calculation.
- **Payment Gateways**:
  - **Cashfree Payments**: UPI QR, UPI ID, Cards, Wallets (`PAYTM100` cashback offer), and Net Banking.
  - **Stripe PaymentIntents**: Deterministic HMAC-signed PaymentIntent creation with `Idempotency-Key` replay protection.
  - **Razorpay / COD**: Full multi-gateway checkout support.
- **High-Concurrency Order Engine**:
  - Per-SKU mutex lock serialization (`withSkuLock`) in `/server.ts` and pessimistic/optimistic locking reference implementation in `/backend-springboot` (Java 21 + Spring Boot 3.3).

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

The application runs on `http://localhost:3000`.
