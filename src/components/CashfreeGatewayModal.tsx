import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  Landmark,
  Users,
  Check,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface CashfreeGatewayModalProps {
  isOpen: boolean;
  amountInr: number;
  customerPhone: string;
  onClose: () => void;
  onPaymentSuccess: (details: {
    cfPaymentId: string;
    cashbackApplied: number;
    channel: string;
  }) => void;
}

export const CashfreeGatewayModal: React.FC<CashfreeGatewayModalProps> = ({
  isOpen,
  amountInr,
  customerPhone,
  onClose,
  onPaymentSuccess
}) => {
  const [paytmCashbackApplied, setPaytmCashbackApplied] = useState(false);
  const [qrRevealed, setQrRevealed] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'card' | 'wallets' | 'netbanking' | null>(
    null
  );
  const [phoneValue, setPhoneValue] = useState(customerPhone || '+91 9951213758');
  const [editingPhone, setEditingPhone] = useState(false);
  const [processingChannel, setProcessingChannel] = useState<string | null>(null);

  if (!isOpen) return null;

  const cashbackAmount = paytmCashbackApplied ? 100 : 0;
  const finalAmount = Math.max(1, amountInr - cashbackAmount);

  const triggerCompletePayment = (channel: string) => {
    setProcessingChannel(channel);
    setTimeout(() => {
      setProcessingChannel(null);
      onPaymentSuccess({
        cfPaymentId: `cf_pay_${Date.now()}`,
        cashbackApplied: cashbackAmount,
        channel
      });
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background:
          'repeating-linear-gradient(-55deg, #ECEEF1, #ECEEF1 48px, #E4E7EB 48px, #E4E7EB 96px)'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Cashfree Secure Checkout"
    >
      <div className="w-full max-w-[820px] bg-white rounded-2xl shadow-2xl border border-black/5 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Left Brown & Cream Sidebar (5 columns) */}
        <div className="md:col-span-5 rounded-xl overflow-hidden flex flex-col justify-between bg-[#EBE3DB] border border-[#DFD5CA]">
          <div>
            {/* Top dark brown trust bar */}
            <div className="bg-[#6B371E] text-white/95 py-2 px-3 text-[11px] font-medium flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>4830+ customers served</span>
            </div>

            {/* Store Header & Amount Box */}
            <div className="bg-[#7D3E22] text-white p-4 pb-5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Return to checkout"
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="mt-4 mb-5 text-center">
                <div className="font-serif-display text-lg font-bold tracking-widest uppercase">
                  SAHASRA JEWELS
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-white/12 hover:bg-white/18 text-white font-semibold text-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>₹{finalAmount.toLocaleString('en-IN')}</span>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </button>
            </div>

            {/* Offers and Coupons Section */}
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-[#5C493E] mb-2.5">
                <span className="font-medium">Offers and Coupons</span>
                <span className="font-semibold text-[#231812] flex items-center gap-0.5">
                  11 Offers Available <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="bg-white rounded-xl p-3.5 shadow-2xs border border-[#E2D9CE] flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#00BAF2] text-white text-[8px] font-bold flex items-center justify-center">
                      P
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-[#231812]">
                      PAYTM
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#231812]">
                    Save ₹100 as cashback
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPaytmCashbackApplied((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                    paytmCashbackApplied
                      ? 'bg-[#04AB61] text-white border-[#04AB61]'
                      : 'bg-white text-[#04AB61] border-[#04AB61] hover:bg-[#E8F8F0]'
                  }`}
                >
                  {paytmCashbackApplied ? 'APPLIED' : 'APPLY'}
                </button>
              </div>
            </div>
          </div>

          {/* Secured by Cashfree Footer */}
          <div className="py-3 px-4 text-center text-[11px] text-[#5C493E] flex items-center justify-center gap-1.5 border-t border-[#DFD5CA]">
            <span>Secured by</span>
            <span className="font-bold text-[#04AB61] tracking-tight">Cashfree</span>
          </div>
        </div>

        {/* Right Payment Options Panel (7 columns) */}
        <div className="md:col-span-7 p-2 sm:p-4 flex flex-col justify-between">
          <div>
            {/* Phone Header */}
            <div className="flex items-center justify-between text-xs pb-4">
              {!editingPhone ? (
                <span className="text-[#4A3B32]">
                  Payment Options for{' '}
                  <strong className="text-[#231812]">{phoneValue}</strong>
                </span>
              ) : (
                <input
                  type="text"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  onBlur={() => setEditingPhone(false)}
                  autoFocus
                  className="px-2 py-1 border border-[#834328] rounded text-xs"
                />
              )}
              <button
                type="button"
                onClick={() => setEditingPhone((p) => !p)}
                className="text-[#7D3E22] font-semibold hover:underline cursor-pointer"
              >
                {editingPhone ? 'Save' : 'Change'}
              </button>
            </div>

            {/* Suggested For You */}
            <div className="space-y-3">
              <span className="block text-xs text-[#6E5A4F]">Suggested For You</span>

              {/* Apple Pay Button */}
              <button
                type="button"
                onClick={() => triggerCompletePayment('Apple Pay')}
                disabled={Boolean(processingChannel)}
                className="w-full h-12 rounded-xl bg-black hover:bg-[#1C1C1C] text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>
                  {processingChannel === 'Apple Pay' ? 'Authorizing Pay...' : 'Pay'}
                </span>
              </button>

              {/* Scan and Pay UPI QR Card */}
              <div className="p-5 rounded-xl border border-[#ECEAE6] bg-[#FCFBFA] flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="relative w-32 h-32 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-center p-2">
                  <QrCode
                    className={`w-24 h-24 text-[#231812] transition-all ${
                      qrRevealed ? 'blur-none opacity-100' : 'blur-[2px] opacity-45'
                    }`}
                  />
                  {!qrRevealed && (
                    <button
                      type="button"
                      onClick={() => setQrRevealed(true)}
                      className="absolute px-3 py-2 rounded-lg bg-[#7D3E22] hover:bg-[#633019] text-white text-xs font-medium shadow-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Click to see QR
                    </button>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-[#4A3B32] mb-2">Scan and pay with</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#F1F3F4] text-[#1A73E8] text-[10px] font-bold">
                      GPay
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#5F259F] text-white text-[10px] font-bold">
                      PhonePe
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#00BAF2] text-white text-[10px] font-bold">
                      Paytm
                    </span>
                  </div>
                  <p className="text-xs text-[#6E5A4F]">or other UPI apps</p>

                  {qrRevealed && (
                    <button
                      type="button"
                      onClick={() => triggerCompletePayment('UPI QR Scan')}
                      disabled={Boolean(processingChannel)}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#04AB61] hover:bg-[#038E4F] text-white text-xs font-semibold flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {processingChannel === 'UPI QR Scan'
                          ? 'Verifying UPI...'
                          : `Confirm ₹${finalAmount.toLocaleString('en-IN')} UPI`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Other Payment Options */}
            <div className="mt-5">
              <span className="block text-xs text-[#6E5A4F] mb-2.5">
                Other Payment Options
              </span>

              <div className="rounded-xl border border-[#ECEAE6] divide-y divide-[#ECEAE6] overflow-hidden bg-white">
                {/* Card Option */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion((p) => (p === 'card' ? null : 'card'))
                    }
                    className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-xs font-medium text-[#231812]">
                      <CreditCard className="w-4 h-4 text-[#7D3E22]" />
                      <span>Card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#142FBD]">VISA</span>
                      <span className="text-[10px] font-bold text-[#EB001B]">MC</span>
                      <span className="text-[10px] font-bold text-[#097969]">RuPay</span>
                      <ChevronRight className="w-4 h-4 text-[#6E5A4F]" />
                    </div>
                  </button>
                  {activeAccordion === 'card' && (
                    <div className="p-3.5 bg-[#FAF7F2] border-t border-[#ECEAE6] flex items-center justify-between gap-2">
                      <span className="text-xs text-[#5C493E]">
                        Visa / Mastercard / RuPay ending 4242
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerCompletePayment('Cashfree Card')}
                        className="px-4 py-1.5 rounded-lg bg-[#7D3E22] text-white text-xs font-semibold cursor-pointer"
                      >
                        Pay ₹{finalAmount.toLocaleString('en-IN')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Wallets Option */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion((p) => (p === 'wallets' ? null : 'wallets'))
                    }
                    className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-xs font-medium text-[#231812]">
                      <Wallet className="w-4 h-4 text-[#7D3E22]" />
                      <span>Wallets</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6E5A4F]" />
                  </button>
                  {activeAccordion === 'wallets' && (
                    <div className="p-3.5 bg-[#FAF7F2] border-t border-[#ECEAE6] flex flex-wrap gap-2">
                      {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay'].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => triggerCompletePayment(w)}
                          className="px-3 py-1.5 rounded-md bg-white border border-[#D8CFC2] hover:border-[#7D3E22] text-xs font-medium text-[#231812] cursor-pointer"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Net Banking Option */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccordion((p) =>
                        p === 'netbanking' ? null : 'netbanking'
                      )
                    }
                    className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-xs font-medium text-[#231812]">
                      <Landmark className="w-4 h-4 text-[#7D3E22]" />
                      <span>Net Banking</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6E5A4F]" />
                  </button>
                  {activeAccordion === 'netbanking' && (
                    <div className="p-3.5 bg-[#FAF7F2] border-t border-[#ECEAE6] flex flex-wrap gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => triggerCompletePayment(`${bank} NetBanking`)}
                          className="px-3 py-1.5 rounded-md bg-white border border-[#D8CFC2] hover:border-[#7D3E22] text-xs font-medium text-[#231812] cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#ECEAE6] flex items-center justify-between text-[11px] text-[#6E5A4F]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#04AB61]" />
              100% Safe & Encrypted Payment
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#7D3E22] hover:underline cursor-pointer"
            >
              Cancel & return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
