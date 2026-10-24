import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import type { OrderItemPayload, OrderRecord } from '../data/catalog';

export interface CartItem extends OrderItemPayload {
  cartItemId: number | string;
  maxAvailable: number;
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  initialStep?: 'cart' | 'checkout';
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  initialStep = 'cart',
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'receipt'>(initialStep);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Customer shipping fields
  const [fullName, setFullName] = useState('Arundhati Menon');
  const [email, setEmail] = useState('arundhati.menon@example.com');
  const [phone, setPhone] = useState('+91 98470 55210');
  const [addressLine, setAddressLine] = useState('Villa 14, Heritage Palms, Panampilly Nagar');
  const [city, setCity] = useState('Kochi');
  const [stateName, setStateName] = useState('Kerala');
  const [postalCode, setPostalCode] = useState('682036');

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'upi_instant' | 'cod'>('stripe_card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('842');
  const [upiId, setUpiId] = useState('arundhati.menon@okhdfcbank');

  // Processing & receipt state
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  React.useEffect(() => {
    if (isOpen && step !== 'receipt') {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const subtotalInr = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountInr =
    appliedPromo === 'SAHASRA10'
      ? Math.round(subtotalInr * 0.1)
      : appliedPromo === 'ONAM20'
      ? Math.round(subtotalInr * 0.2)
      : 0;
  const gstInr = Math.round((subtotalInr - discountInr) * 0.03);
  const totalInr = Math.max(0, subtotalInr - discountInr + gstInr);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'SAHASRA10') {
      setAppliedPromo('SAHASRA10');
      setPromoMessage('Discount code SAHASRA10 applied (10% off)');
    } else if (code === 'ONAM20') {
      setAppliedPromo('ONAM20');
      setPromoMessage('Discount code ONAM20 applied (20% off)');
    } else {
      setAppliedPromo('');
      setPromoMessage('Try code SAHASRA10 or ONAM20');
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !postalCode.trim()) {
      setCheckoutError('Please complete all delivery address fields.');
      return;
    }

    setProcessing(true);
    const idempotencyKey = `idemp-shs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      let stripePaymentIntentId = '';
      let stripeClientSecret = '';

      if (paymentMethod !== 'cod') {
        const intentRes = await fetch('/api/v1/checkout/stripe-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify({
            amountInr: totalInr,
            customerEmail: email,
            idempotencyKey,
            metadata: {
              itemCount: String(items.length),
              paymentChannel: paymentMethod
            }
          })
        });

        const intentData = await intentRes.json();
        if (!intentRes.ok) {
          throw new Error(intentData.error || 'Could not process payment');
        }
        stripePaymentIntentId = intentData.paymentIntentId;
        stripeClientSecret = intentData.clientSecret;
      }

      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          idempotencyKey,
          paymentMethod,
          promoCode: appliedPromo,
          stripePaymentIntentId,
          stripeClientSecret,
          customer: {
            fullName,
            email,
            phone,
            addressLine,
            city,
            state: stateName,
            postalCode
          },
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedVariants: item.selectedVariants,
            primaryImage: item.primaryImage
          }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not place your order');
      }

      setConfirmedOrder(orderData.order);
      onOrderCompleted(orderData.order);
      onClearCart();
      setStep('receipt');
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Unable to complete checkout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Your Shopping Cart"
    >
      <div className="relative w-full max-w-md bg-[#FAF7F2] h-full flex flex-col shadow-2xl border-l border-[#E5DEC9]">
        {/* Top Drawer Header */}
        <div className="px-6 py-4 bg-[#834328] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif-display text-xl font-semibold tracking-wide">
              {step === 'cart' && `Your Cart (${items.reduce((s, i) => s + i.quantity, 0)})`}
              {step === 'checkout' && 'Checkout'}
              {step === 'receipt' && 'Order Confirmed'}
            </h2>
            <p className="text-xs text-[#F3E5AB]">
              Free shipping for all orders 🤎
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (step === 'receipt') {
                setStep('cart');
                setConfirmedOrder(null);
              }
              onClose();
            }}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#EFE6D5] flex items-center justify-center text-[#834328] mb-4">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif-display text-2xl font-semibold text-[#834328]">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-[#6E5A4F] max-w-xs mt-2">
                    Explore our curated Sarees, Gift Hampers, Chokers, and Temple Jewellery collections.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-[#834328] text-white text-xs font-medium rounded-lg hover:bg-[#6B351E] transition-colors cursor-pointer"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={String(item.cartItemId)}
                      className="flex gap-4 p-3.5 bg-white rounded-lg border border-[#E6DFD3]"
                    >
                      <img
                        src={item.primaryImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-24 object-cover rounded-md bg-[#F4EFE6] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-[#834328] line-clamp-2">
                            {item.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(String(item.cartItemId))}
                            aria-label="Remove item"
                            className="text-[#8C7A6B] hover:text-[#9E2A2B] p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-[11px] text-[#7A6254] mt-0.5">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' · ')}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#D8CFC2] rounded-md bg-[#FAF7F2]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(String(item.cartItemId), item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#231812] hover:bg-[#E6DFD3] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  String(item.cartItemId),
                                  Math.min(item.maxAvailable, item.quantity + 1)
                                )
                              }
                              aria-label="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#231812] hover:bg-[#E6DFD3] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#834328]">
                            Rs. {(item.unitPrice * item.quantity).toLocaleString('en-IN')}.00
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Discount Code Box */}
                  <form onSubmit={handleApplyPromo} className="pt-2">
                    <label className="block text-xs font-medium text-[#5C493E] mb-1.5">
                      Discount Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter discount code (e.g. SAHASRA10)"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-md focus:outline-none focus:border-[#834328]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-medium bg-[#834328] text-white rounded-md hover:bg-[#6B351E] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage && (
                      <p className="text-[11px] text-[#1E6B45] mt-1.5 font-medium">
                        {promoMessage}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="stripe-checkout-form" onSubmit={handleCompletePayment} className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#834328] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to cart
              </button>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C]">
                  {checkoutError}
                </div>
              )}

              {/* Shipping Address Section */}
              <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#834328]">
                  Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#834328]">
                  Payment Method
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe_card')}
                    className={`p-2.5 rounded-md border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      paymentMethod === 'stripe_card'
                        ? 'bg-[#834328] text-white border-[#834328]'
                        : 'bg-[#FAF7F2] text-[#4A3B32] border-[#D8CFC2]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_instant')}
                    className={`p-2.5 rounded-md border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      paymentMethod === 'upi_instant'
                        ? 'bg-[#834328] text-white border-[#834328]'
                        : 'bg-[#FAF7F2] text-[#4A3B32] border-[#D8CFC2]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-md border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-[#834328] text-white border-[#834328]'
                        : 'bg-[#FAF7F2] text-[#4A3B32] border-[#D8CFC2]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {paymentMethod === 'stripe_card' && (
                  <div className="pt-2 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                          Expiration Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                          Security Code (CVV)
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi_instant' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                      UPI ID (Google Pay / PhonePe / Paytm)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D8CFC2] rounded-md bg-[#FAF7F2]"
                    />
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="pt-2 text-xs text-[#5C493E] bg-[#FAF7F2] p-3 rounded-md border border-[#E6DFD3]">
                    Pay <strong>Rs. {totalInr.toLocaleString('en-IN')}.00</strong> upon delivery at your doorstep. Free shipping included.
                  </div>
                )}
              </div>
            </form>
          )}

          {step === 'receipt' && confirmedOrder && (
            <div className="space-y-5">
              <div className="p-6 rounded-xl bg-white border border-[#E6DFD3] text-center">
                <div className="w-12 h-12 rounded-full bg-[#E8F5EE] text-[#1E6B45] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#834328]">
                  Thank you for your order, {confirmedOrder.customer.fullName}!
                </h3>
                <p className="text-xs text-[#5C493E] mt-1.5">
                  Your order <strong>{confirmedOrder.orderId}</strong> is confirmed and being prepared with care.
                </p>
              </div>

              {/* Delivery Details */}
              <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] text-xs space-y-1.5 text-[#4A3B32]">
                <h4 className="font-semibold text-[#834328] pb-1.5 border-b border-[#E6DFD3]">
                  Delivery Information
                </h4>
                <p className="font-medium text-[#231812]">{confirmedOrder.customer.fullName}</p>
                <p>{confirmedOrder.customer.addressLine}</p>
                <p>
                  {confirmedOrder.customer.city}, {confirmedOrder.customer.state} —{' '}
                  {confirmedOrder.customer.postalCode}
                </p>
                <p>{confirmedOrder.customer.phone}</p>
              </div>

              {/* Itemized Summary */}
              <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] space-y-2 text-xs">
                <h4 className="font-semibold text-[#834328] pb-2 border-b border-[#E6DFD3]">
                  Order Summary
                </h4>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-[#4A3B32]">
                    <span className="truncate max-w-[230px]">
                      {item.quantity} × {item.title}
                    </span>
                    <span className="font-medium">
                      Rs. {(item.unitPrice * item.quantity).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#E6DFD3] flex justify-between font-bold text-sm text-[#834328]">
                  <span>Total Paid</span>
                  <span>Rs. {confirmedOrder.totalInr.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-lg bg-[#834328] text-white hover:bg-[#6B351E] text-xs font-semibold transition-colors cursor-pointer"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>

        {/* Sticky Drawer Footer for Cart & Checkout */}
        {items.length > 0 && step !== 'receipt' && (
          <div className="p-6 bg-white border-t border-[#E5DEC9] shrink-0 space-y-3">
            <div className="space-y-1 text-xs text-[#5C493E]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotalInr.toLocaleString('en-IN')}.00</span>
              </div>
              {discountInr > 0 && (
                <div className="flex justify-between text-[#1E6B45]">
                  <span>Discount ({appliedPromo})</span>
                  <span>- Rs. {discountInr.toLocaleString('en-IN')}.00</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#1E6B45] font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (Included / GST)</span>
                <span>Rs. {gstInr.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#834328] pt-2 border-t border-[#E6DFD3]">
                <span>Estimated total</span>
                <span>Rs. {totalInr.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full h-11 rounded-lg bg-[#834328] hover:bg-[#6B351E] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Check out</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="stripe-checkout-form"
                disabled={processing}
                className="w-full h-11 rounded-lg bg-[#834328] hover:bg-[#6B351E] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {processing
                    ? 'Processing your order...'
                    : `Complete order · Rs. ${totalInr.toLocaleString('en-IN')}.00`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
