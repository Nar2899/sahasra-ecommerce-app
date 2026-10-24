import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  Package,
  User,
  MapPin,
  Mail,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import type { OrderRecord } from '../data/catalog';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// ============================================================================
// 1. HEADER ACCOUNT POPOVER (Matches Screenshot 1: image_d7e98747.png)
// ============================================================================
interface AccountHeaderPopoverProps {
  isOpen: boolean;
  email: string;
  isSignedIn: boolean;
  onEmailChange: (email: string) => void;
  onClose: () => void;
  onProceedToSignIn: () => void;
  onOpenOrdersPage: () => void;
  onOpenProfilePage: () => void;
}

export const AccountHeaderPopover: React.FC<AccountHeaderPopoverProps> = ({
  isOpen,
  email,
  onEmailChange,
  onClose,
  onProceedToSignIn,
  onOpenOrdersPage,
  onOpenProfilePage
}) => {
  const [marketingChecked, setMarketingChecked] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[360px] sm:w-[400px] bg-white rounded-xl shadow-2xl border border-[#EAE2D6] p-6 z-50 text-[#231812]"
      role="dialog"
      aria-label="Sign in or create account"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-normal text-[#1C1B1A]">
          Sign in or create account
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] flex items-center justify-center text-[#1C1B1A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onProceedToSignIn();
        }}
      >
        {/* Light blue-tinted pill box matching Screenshot 1 */}
        <div className="relative flex items-center justify-between bg-[#EBF1FA] border border-[#D8E2F0] rounded-2xl px-4 py-2.5">
          <div className="flex-1 min-w-0 pr-3">
            <label className="block text-[11px] text-[#687385] leading-tight">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="ashokreddy2899@gmail.com"
              className="w-full bg-transparent text-sm text-[#1C1B1A] focus:outline-none truncate"
            />
          </div>
          <button
            type="submit"
            aria-label="Continue with email"
            className="w-10 h-10 rounded-full bg-[#7D3E22] hover:bg-[#633019] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Marketing checkbox */}
        <label className="mt-4 flex items-center gap-2.5 text-sm text-[#1C1B1A] cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setMarketingChecked((p) => !p)}
            className={`w-4 h-4 rounded-xs flex items-center justify-center border transition-colors ${
              marketingChecked
                ? 'bg-[#7D3E22] border-[#7D3E22] text-white'
                : 'bg-white border-[#B8B8B8]'
            }`}
          >
            {marketingChecked && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <span>Email me with news and offers</span>
        </label>
      </form>

      {/* Bottom Orders & Profile Pill Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenOrdersPage}
          className="py-3 px-4 rounded-2xl border border-[#DFDFDF] hover:border-[#7D3E22] bg-white text-sm text-[#1C1B1A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
        </button>

        <button
          type="button"
          onClick={onOpenProfilePage}
          className="py-3 px-4 rounded-2xl border border-[#DFDFDF] hover:border-[#7D3E22] bg-white text-sm text-[#1C1B1A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. FULL-PAGE SIGN IN & 6-DIGIT EMAIL OTP VERIFICATION VIEW
// ============================================================================
interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            hint?: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (err: unknown) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_TOKEN_STORAGE_KEY = 'sahasra_gmail_oauth_token';
const GMAIL_TOKEN_EXPIRY_KEY = 'sahasra_gmail_oauth_expiry';
// The Google Cloud project owner account authorized to send emails via the OAuth client
const AUTHORIZED_SENDER_GMAIL = 'ashokreddy2899@gmail.com';

// Read the provisioned Google OAuth Client ID from firebase-applet-config.json
const GOOGLE_OAUTH_CLIENT_ID: string =
  (firebaseAppletConfig as { oAuthClientId?: string }).oAuthClientId ||
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
  '322854253373-rdo5ser39sqeeq39ha9n5d6s086dgcf5.apps.googleusercontent.com';

function getCachedGmailToken(): string | null {
  try {
    const token = sessionStorage.getItem(GMAIL_TOKEN_STORAGE_KEY);
    const expiry = Number(sessionStorage.getItem(GMAIL_TOKEN_EXPIRY_KEY) || 0);
    if (token && Date.now() < expiry) {
      return token;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function setCachedGmailToken(token: string, expiresInSeconds = 3500) {
  try {
    sessionStorage.setItem(GMAIL_TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(
      GMAIL_TOKEN_EXPIRY_KEY,
      String(Date.now() + expiresInSeconds * 1000)
    );
  } catch {
    // Ignore storage errors
  }
}

function clearCachedGmailToken() {
  try {
    sessionStorage.removeItem(GMAIL_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(GMAIL_TOKEN_EXPIRY_KEY);
  } catch {
    // Ignore storage errors
  }
}

interface SignInOtpPageProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerifiedSuccess: (email: string) => void;
  onBackToStore: () => void;
}

export const SignInOtpPage: React.FC<SignInOtpPageProps> = ({
  email,
  onEmailChange,
  onVerifiedSuccess,
  onBackToStore
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [marketingChecked, setMarketingChecked] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deliveryProvider, setDeliveryProvider] = useState<string | null>(null);
  const [webmailPreviewUrl, setWebmailPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const dispatchOtpRequest = async (gmailToken?: string | null) => {
    setErrorMsg(null);
    setStatusMessage(null);
    setIsSending(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (gmailToken) {
        headers.Authorization = `Bearer ${gmailToken}`;
      }

      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          gmailAccessToken: gmailToken || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not send verification email. Please try again.');
        return;
      }

      setOtpCode('');
      setDeliveryProvider(data.provider || null);
      setWebmailPreviewUrl(data.previewUrl || null);
      setStep('otp');
      setResendCooldown(30);

      if (data.provider === 'gmail_api') {
        setStatusMessage(
          `6-digit verification code delivered to ${email} via Gmail. Please check your Inbox (or Spam/All Mail).`
        );
      } else if (data.provider === 'smtp' || data.provider === 'resend') {
        setStatusMessage(`6-digit verification code sent to ${email} via SMTP.`);
      } else {
        if (data.gmailError) {
          clearCachedGmailToken();
          setErrorMsg(data.gmailError);
        } else {
          setStatusMessage(
            `6-digit verification code generated and dispatched via Nodemailer SMTP for ${email}.`
          );
        }
      }
    } catch {
      setErrorMsg('Network error while sending verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Triggered when user clicks the arrow button on Sign In or Resend Code:
  // Uses cached Gmail token if already authorized, otherwise sends immediately via backend SMTP without blocking with a popup.
  const sendOtpToEmail = () => {
    setErrorMsg(null);
    const cachedToken = getCachedGmailToken();
    void dispatchOtpRequest(cachedToken);
  };

  // Optional explicit Gmail OAuth trigger if user wants to authorize Gmail API directly
  const authorizeAndSendViaGmail = () => {
    setErrorMsg(null);
    const oauth2 = window.google?.accounts?.oauth2;
    if (!GOOGLE_OAUTH_CLIENT_ID || !oauth2) {
      setErrorMsg('Google Identity Services is still loading. Please try again in a moment.');
      return;
    }

    setIsSending(true);
    try {
      const tokenClient = oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        scope: GMAIL_SEND_SCOPE,
        hint: AUTHORIZED_SENDER_GMAIL,
        callback: (response: GoogleTokenResponse) => {
          if (response.access_token) {
            setCachedGmailToken(response.access_token, response.expires_in || 3500);
            void dispatchOtpRequest(response.access_token);
          } else {
            setIsSending(false);
          }
        },
        error_callback: () => {
          setIsSending(false);
          setErrorMsg(
            'Google OAuth popup was closed or blocked (Error 403: access_denied). Add your email under "Test users" in Google Cloud Console OAuth Consent Screen, or open the delivered SMTP webmail message below.'
          );
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch {
      setIsSending(false);
    }
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtpToEmail();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = otpCode.replace(/\D/g, '').trim();
    if (cleaned.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: cleaned })
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        setErrorMsg(data.error || 'Invalid verification code. Please check your email and try again.');
        return;
      }
      onVerifiedSuccess(email);
    } catch {
      setErrorMsg('Unable to verify code right now. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 px-4">
      {/* Top Centered Brand Logo */}
      <button
        type="button"
        onClick={onBackToStore}
        className="flex flex-col items-center cursor-pointer mb-20"
      >
        <span className="font-serif-display text-4xl font-bold tracking-tight text-[#7D3E22] leading-none">
          sahasra
        </span>
        <span className="text-[11px] tracking-[0.22em] uppercase text-[#7D3E22] font-semibold">
          jewels
        </span>
      </button>

      {step === 'email' ? (
        <div className="w-full max-w-[400px]">
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Sign in</h1>
          <p className="text-xs text-[#6E6E6E] mt-1.5 mb-5">
            Enter your email and we'll send you a verification code
          </p>

          {errorMsg && (
            <p className="text-xs text-[#9B1C1C] bg-[#FDF2F2] border border-[#F8B4B4] rounded-lg px-3 py-2 mb-4">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleRequestOtp}>
            {/* Outlined Email Box */}
            <div className="p-0.5 rounded-xl border-2 border-[#B8998A]">
              <div className="flex items-center justify-between bg-[#EBF1FA] border border-[#7D3E22] rounded-lg px-3.5 py-2">
                <div className="flex-1 min-w-0 pr-2">
                  <label className="block text-[11px] text-[#687385] leading-tight">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-[#1C1B1A] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  aria-label="Send verification code"
                  className="w-8 h-8 rounded-lg bg-[#7D3E22] hover:bg-[#633019] disabled:opacity-60 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-xs text-[#1C1B1A] cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setMarketingChecked((p) => !p)}
                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                  marketingChecked
                    ? 'bg-[#7D3E22] border-[#7D3E22] text-white'
                    : 'bg-white border-[#B8B8B8]'
                }`}
              >
                {marketingChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>
              <span>Email me with news and offers</span>
            </label>

            <p className="mt-7 text-center text-[11px] text-[#7A7A7A]">
              By continuing, you agree to our{' '}
              <button
                type="button"
                onClick={onBackToStore}
                className="underline hover:text-[#1C1B1A] cursor-pointer"
              >
                Terms of service
              </button>
            </p>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-[400px]">
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Enter code</h1>
          <p className="text-xs text-[#6E6E6E] mt-1.5 mb-4">
            Sent to <strong>{email}</strong>
          </p>

          {statusMessage && !errorMsg && (
            <p className="text-xs text-[#1E6B45] bg-[#EDF7F1] border border-[#C6E6D3] rounded-lg px-3 py-2 mb-3">
              {statusMessage}
            </p>
          )}

          {errorMsg && (
            <p className="text-xs text-[#9B1C1C] bg-[#FDF2F2] border border-[#F8B4B4] rounded-lg px-3 py-2 mb-3">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-0.5 rounded-xl border-2 border-[#B8998A]">
              <div className="flex items-center justify-between bg-[#EBF1FA] border border-[#7D3E22] rounded-lg px-3.5 py-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-[#687385] leading-tight">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full bg-transparent text-sm font-semibold tracking-widest text-[#1C1B1A] placeholder:font-normal placeholder:tracking-normal placeholder:text-[#8F9BB3] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length < 6}
                  aria-label="Verify code"
                  className="w-8 h-8 rounded-lg bg-[#7D3E22] hover:bg-[#633019] disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setStatusMessage(null);
                  setStep('email');
                }}
                className="text-xs text-[#7D3E22] hover:underline cursor-pointer"
              >
                Use a different email
              </button>

              <button
                type="button"
                disabled={isSending || resendCooldown > 0}
                onClick={sendOtpToEmail}
                className="text-xs text-[#7D3E22] hover:underline disabled:text-[#9A9A9A] disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'}
                </span>
              </button>
            </div>

            {deliveryProvider !== 'gmail_api' && (
              <div className="pt-3 border-t border-[#F0EAE1] flex flex-col gap-2.5">
                {webmailPreviewUrl && (
                  <a
                    href={webmailPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#7D3E22] hover:bg-[#633019] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Delivered OTP Email Inbox</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] p-3 text-[11px] text-[#5A4D44] space-y-1.5">
                  <p className="font-semibold text-[#231812]">
                    Why did Google show &ldquo;Error 403: access_denied&rdquo;?
                  </p>
                  <p className="leading-relaxed">
                    New Google Cloud OAuth apps start in <strong>Testing</strong> mode and block emails until added to <strong>Test users</strong>. To receive OTPs directly in <strong>{email}</strong>:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Add <strong>{email}</strong> under <strong>Test users</strong> (or click <strong>Publish App</strong>) in{' '}
                      <a
                        href="https://console.cloud.google.com/apis/credentials/consent?project=gen-lang-client-0155102910"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7D3E22] underline font-medium"
                      >
                        Google Cloud OAuth Audience ↗
                      </a>
                      , then{' '}
                      <button
                        type="button"
                        onClick={authorizeAndSendViaGmail}
                        className="text-[#7D3E22] underline font-semibold cursor-pointer"
                      >
                        click here to send via Gmail
                      </button>
                      .
                    </li>
                    <li>
                      Or set <code className="font-mono text-[#7D3E22]">SMTP_USER</code> &amp; <code className="font-mono text-[#7D3E22]">SMTP_PASS</code> (a 16-digit Google App Password) in the Secrets panel for automatic server-side Gmail delivery.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. CUSTOMER PROFILE & ORDERS PORTAL (Matches Screenshot 4: image_205ca9ca.png)
// ============================================================================
export interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
}

interface CustomerProfileOrdersPageProps {
  initialTab?: 'profile' | 'orders';
  email: string;
  onEmailChange: (email: string) => void;
  addresses: SavedAddress[];
  onAddAddress: (addr: SavedAddress) => void;
  orders: OrderRecord[];
  onSignOut: () => void;
  onBackToStore: () => void;
}

export const CustomerProfileOrdersPage: React.FC<CustomerProfileOrdersPageProps> = ({
  initialTab = 'profile',
  email,
  onEmailChange,
  addresses,
  onAddAddress,
  orders,
  onSignOut,
  onBackToStore
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  const [marketingEmailEnabled, setMarketingEmailEnabled] = useState(true);
  const [editingEmail, setEditingEmail] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // New address form fields matching Screenshot 8
  const [firstName, setFirstName] = useState('Ashok');
  const [lastName, setLastName] = useState('N');
  const [address, setAddress] = useState('4-15, Avancha, Thimmajipet');
  const [apartment, setApartment] = useState('Avancha');
  const [city, setCity] = useState('Nagarkurnool');
  const [stateName, setStateName] = useState('Telangana');
  const [pinCode, setPinCode] = useState('509301');
  const [phone, setPhone] = useState('099512 13758');

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAddress({
      id: `addr-${Date.now()}`,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state: stateName,
      pinCode,
      phone
    });
    setIsAddAddressOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#1C1B1A]">
      {/* Top Portal Header matching Screenshot 4 */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStore}
          className="flex flex-col items-start cursor-pointer"
        >
          <span className="font-serif-display text-3xl font-bold tracking-tight text-[#7D3E22] leading-none">
            sahasra
          </span>
          <span className="text-[10px] tracking-[0.22em] uppercase text-[#7D3E22] font-semibold">
            jewels
          </span>
        </button>

        <button
          type="button"
          onClick={onBackToStore}
          title="Back to Storefront"
          className="w-8 h-8 rounded-full border border-[#7A7A7A] flex items-center justify-center text-[#5A5A5A] hover:border-[#7D3E22] hover:text-[#7D3E22] cursor-pointer"
        >
          <User className="w-4 h-4" />
        </button>
      </header>

      {/* Main 2-Column Layout matching Screenshot 4 */}
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Navigation Column */}
        <aside className="md:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`block text-left text-lg transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'font-bold text-[#1C1B1A]'
                : 'font-normal text-[#767676] hover:text-[#1C1B1A]'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`block text-left text-lg transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'font-bold text-[#1C1B1A]'
                : 'font-normal text-[#767676] hover:text-[#1C1B1A]'
            }`}
          >
            Profile
          </button>

          <div className="pt-6">
            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs text-[#7D3E22] underline hover:opacity-80 cursor-pointer"
            >
              ← Return to shop
            </button>
          </div>
        </aside>

        {/* Right Content Column */}
        <div className="md:col-span-9 space-y-8">
          {activeTab === 'profile' ? (
            <>
              {/* Contact Card */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-sm font-bold text-[#1C1B1A]">Contact</h2>
                  <button
                    type="button"
                    onClick={() => setEditingEmail((p) => !p)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-xs font-medium text-[#1C1B1A] cursor-pointer"
                  >
                    {editingEmail ? 'Done' : 'Edit'}
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-[#EDEDED] shadow-2xs px-5 py-4 flex items-center justify-between text-xs">
                  <span className="text-[#767676]">Email</span>
                  {editingEmail ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      className="px-2 py-1 border border-[#7D3E22] rounded text-xs text-right"
                    />
                  ) : (
                    <span className="text-[#1C1B1A] font-medium">{email}</span>
                  )}
                </div>
              </div>

              {/* Addresses Card */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-sm font-bold text-[#1C1B1A]">Addresses</h2>
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-xs font-medium text-[#1C1B1A] cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[#EDEDED] shadow-2xs px-5 py-5 flex items-center gap-3 text-xs text-[#767676]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#1C1B1A]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>No addresses added</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="bg-white rounded-xl border border-[#EDEDED] shadow-2xs px-5 py-4 text-xs flex items-start justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#1C1B1A]">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-[#5A5A5A]">
                            {addr.address}, {addr.apartment}
                          </p>
                          <p className="text-[#5A5A5A]">
                            {addr.city}, {addr.state} {addr.pinCode} · India
                          </p>
                          <p className="text-[#767676]">{addr.phone}</p>
                        </div>
                        <span className="text-[11px] text-[#7D3E22] font-medium">
                          Default
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Marketing Preferences Card */}
              <div>
                <h2 className="text-sm font-bold text-[#1C1B1A] mb-2.5">
                  Marketing preferences
                </h2>
                <div className="bg-white rounded-xl border border-[#EDEDED] shadow-2xs px-5 py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-[#1C1B1A]">
                    <Mail className="w-4 h-4 text-[#767676]" />
                    <span>Email</span>
                  </div>

                  {/* Brown Toggle Switch matching Screenshot 4 */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={marketingEmailEnabled}
                    onClick={() => setMarketingEmailEnabled((p) => !p)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      marketingEmailEnabled ? 'bg-[#7D3E22] justify-end' : 'bg-[#D4D4D4] justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                      {marketingEmailEnabled && (
                        <Check className="w-3 h-3 text-[#7D3E22] stroke-[2.5]" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Out Row */}
              <div className="pt-2 flex items-center gap-5">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-xs font-semibold text-[#7D3E22] transition-colors cursor-pointer"
                >
                  Sign out
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-xs text-[#7D3E22] hover:underline cursor-pointer"
                >
                  Sign out of all devices
                </button>
              </div>
            </>
          ) : (
            /* Orders Tab */
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1C1B1A]">Orders</h2>
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#EDEDED] p-10 text-center space-y-3">
                  <p className="text-sm font-medium text-[#1C1B1A]">
                    No orders yet
                  </p>
                  <p className="text-xs text-[#767676]">
                    Go to the store to place an order.
                  </p>
                  <button
                    type="button"
                    onClick={onBackToStore}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#7D3E22] text-white text-xs font-semibold cursor-pointer"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-white rounded-xl border border-[#EDEDED] p-5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-[#F2F2F2] pb-2">
                        <span className="font-bold text-sm text-[#7D3E22]">
                          Order {ord.orderId}
                        </span>
                        <span className="font-semibold text-[#1E6B45]">
                          Confirmed · Paid ₹{ord.totalInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-1 text-[#5A5A5A]">
                        {ord.items.map((item, idx) => (
                          <p key={idx}>
                            {item.quantity} × {item.title} — ₹
                            {(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </p>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#767676]">
                        Shipping to: {ord.customer.fullName}, {ord.customer.addressLine},{' '}
                        {ord.customer.city}, {ord.customer.state} {ord.customer.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E5E5] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
              <h3 className="text-base font-bold text-[#1C1B1A]">Add address</h3>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                className="text-[#767676] hover:text-[#1C1B1A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#767676] mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#767676] mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#767676] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#767676] mb-1">
                  Apartment, suite, etc.
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#767676] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#767676] mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#767676] mb-1">
                    PIN code
                  </label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#767676] mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8D8D8] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8D8D8] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#7D3E22] text-white text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
