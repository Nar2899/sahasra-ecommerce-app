import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Lock,
  Search,
  HelpCircle,
  MoreVertical,
  Check,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import type { OrderRecord } from '../data/catalog';
import type { CartItem } from './CartCheckoutDrawer';
import { CashfreeGatewayModal } from './CashfreeGatewayModal';

// ============================================================================
// 1. FULL-PAGE "YOUR CART" VIEW (Matches Screenshot 5: image_dfa81685.png)
// ============================================================================
interface FullCartPageProps {
  items: CartItem[];
  specialInstructions: string;
  onSpecialInstructionsChange: (val: string) => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
}

export const FullCartPage: React.FC<FullCartPageProps> = ({
  items,
  specialInstructions,
  onSpecialInstructionsChange,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onProceedToCheckout
}) => {
  const estimatedTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Heading & Continue Shopping Link */}
      <div className="flex items-baseline justify-between mb-10">
        <h1 className="font-serif-display text-4xl sm:text-5xl font-normal text-[#834328]">
          Your cart
        </h1>
        <button
          type="button"
          onClick={onContinueShopping}
          className="text-sm text-[#834328] underline underline-offset-4 hover:opacity-80 cursor-pointer"
        >
          Continue shopping
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center border-y border-[#EAE2D6]">
          <p className="text-lg text-[#834328] mb-5">Your cart is currently empty.</p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="px-8 py-3 rounded-full bg-[#834328] text-white text-sm font-medium hover:bg-[#6B351E] transition-colors cursor-pointer"
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 pb-4 border-b border-[#EAE2D6] text-[10px] tracking-[0.16em] uppercase text-[#9C7A68]">
            <div className="col-span-6 sm:col-span-7">PRODUCT</div>
            <div className="col-span-4 sm:col-span-3 text-center">QUANTITY</div>
            <div className="col-span-2 text-right">TOTAL</div>
          </div>

          {/* Product Rows */}
          <div className="divide-y divide-[#EAE2D6] border-b border-[#EAE2D6]">
            {items.map((item) => (
              <div
                key={String(item.cartItemId)}
                className="py-8 grid grid-cols-12 items-start gap-4"
              >
                {/* Product Info */}
                <div className="col-span-6 sm:col-span-7 flex gap-5">
                  <img
                    src={item.primaryImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-24 sm:w-28 aspect-4/5 object-cover bg-[#F2ECE1] shrink-0"
                  />
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-[15px] font-normal text-[#834328] leading-snug max-w-xs">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#9C7A68]">
                      Rs. {item.unitPrice.toLocaleString('en-IN')}.00
                    </p>
                  </div>
                </div>

                {/* Quantity Pill Stepper + Trash Icon */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-[#D8CFC2] bg-[#FAF7F2] h-11 px-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(String(item.cartItemId), item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="w-8 h-8 flex items-center justify-center text-[#834328] hover:opacity-70 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs text-[#834328] font-medium">
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
                      className="w-8 h-8 flex items-center justify-center text-[#834328] hover:opacity-70 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(String(item.cartItemId))}
                    aria-label="Remove item"
                    className="text-[#9C7A68] hover:text-[#834328] p-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="col-span-2 text-right text-sm sm:text-[15px] text-[#834328]">
                  Rs. {(item.unitPrice * item.quantity).toLocaleString('en-IN')}.00
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Special Instructions & Estimated Total */}
          <div className="pt-10 flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="w-full md:w-80">
              <label
                htmlFor="OrderSpecialInstructions"
                className="block text-xs text-[#834328] mb-2.5"
              >
                Order special instructions
              </label>
              <textarea
                id="OrderSpecialInstructions"
                rows={4}
                value={specialInstructions}
                onChange={(e) => onSpecialInstructionsChange(e.target.value)}
                className="w-full rounded-2xl border border-[#DFD5C7] bg-white p-3.5 text-xs text-[#231812] focus:outline-none focus:border-[#834328]"
              />
            </div>

            <div className="w-full md:w-auto flex flex-col items-end text-right">
              <div className="flex items-baseline gap-6 mb-2">
                <span className="text-sm text-[#834328]">Estimated total</span>
                <span className="text-lg font-medium text-[#834328]">
                  Rs. {estimatedTotal.toLocaleString('en-IN')}.00
                </span>
              </div>
              <p className="text-xs text-[#9C7A68] mb-6">
                Taxes included. Discounts and{' '}
                <span className="underline">shipping</span> calculated at checkout.
              </p>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full sm:w-80 py-3.5 px-8 rounded-full bg-[#834328] hover:bg-[#6B351E] text-white text-sm font-medium transition-colors cursor-pointer shadow-xs"
              >
                Check out
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

// ============================================================================
// 2. FULL-PAGE 2-COLUMN CHECKOUT PAGE (Matches Screenshots 6, 7, 8, & 9)
// ============================================================================
interface FullCheckoutPageProps {
  items: CartItem[];
  customerEmail: string;
  specialInstructions: string;
  onReturnToCart: () => void;
  onReturnToStore: () => void;
  onOrderCompleted: (order: OrderRecord) => void;
  onClearCart: () => void;
}

export const FullCheckoutPage: React.FC<FullCheckoutPageProps> = ({
  items,
  customerEmail,
  specialInstructions,
  onReturnToCart,
  onReturnToStore,
  onOrderCompleted,
  onClearCart
}) => {
  // Delivery Address Fields (pre-populated with Screenshot 8 values for instant testing)
  const [country, setCountry] = useState('India');
  const [firstName, setFirstName] = useState('Ashok');
  const [lastName, setLastName] = useState('N');
  const [address, setAddress] = useState('4-15, Avancha, Thimmajipet');
  const [apartment, setApartment] = useState('Avancha');
  const [city, setCity] = useState('Nagarkurnool');
  const [stateName, setStateName] = useState('Telangana');
  const [pinCode, setPinCode] = useState('509301');
  const [phone, setPhone] = useState('099512 13758');

  // Shipping Method (Matches Screenshot 8)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Gateway Selection (Matches Screenshots 6, 7, 8)
  const [paymentGateway, setPaymentGateway] = useState<
    'credit_card' | 'cashfree' | 'razorpay'
  >('cashfree');

  // Credit Card fields (Matches Screenshot 6 & 7)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Add Tip Section (Matches Screenshot 7)
  const [supportTipChecked, setSupportTipChecked] = useState(true);
  const [selectedTipPercent, setSelectedTipPercent] = useState<0 | 10 | 15 | 20>(0);
  const [customTipInput, setCustomTipInput] = useState<number>(0);

  // Discount Code in Right Column
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');

  // Cashfree Modal & Confirmed Receipt state
  const [isCashfreeModalOpen, setIsCashfreeModalOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotalInr = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingCostInr = shippingMethod === 'express' ? 200 : 0;
  const discountAmountInr =
    appliedDiscountCode === 'SAHASRA10'
      ? Math.round(subtotalInr * 0.1)
      : appliedDiscountCode === 'ONAM20'
      ? Math.round(subtotalInr * 0.2)
      : 0;

  const calculatedTipInr = supportTipChecked
    ? selectedTipPercent > 0
      ? Math.round(subtotalInr * (selectedTipPercent / 100) * 100) / 100
      : customTipInput
    : 0;

  const totalInr = Math.max(
    0,
    Math.round((subtotalInr - discountAmountInr + shippingCostInr + calculatedTipInr) * 100) / 100
  );

  // 3% included GST calculation matching Screenshot 6 ("Including ₹203.85 in taxes" on ₹6,999.00)
  const includedTaxInr =
    Math.round((subtotalInr - subtotalInr / 1.03) * 100) / 100;

  const finalizeOrder = async (cashbackApplied = 0) => {
    setProcessingOrder(true);
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod:
            paymentGateway === 'credit_card'
              ? 'stripe_card'
              : paymentGateway,
          promoCode: appliedDiscountCode,
          shippingInr: shippingCostInr,
          tipInr: calculatedTipInr,
          cashbackInr: cashbackApplied,
          specialInstructions,
          customer: {
            fullName: `${firstName} ${lastName}`.trim(),
            email: customerEmail || 'ashokreddy2899@gmail.com',
            phone,
            addressLine: address,
            apartment,
            city,
            state: stateName,
            postalCode: pinCode
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

      const data = await res.json();
      if (res.ok && data.order) {
        setConfirmedOrder(data.order);
        onOrderCompleted(data.order);
        onClearCart();
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  const handlePayNowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentGateway === 'cashfree') {
      setIsCashfreeModalOpen(true);
      return;
    }
    finalizeOrder(0);
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] p-8 text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-[#E8F5EE] text-[#1E6B45] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-[#7D3E22]">
            Order {confirmedOrder.orderId} Confirmed!
          </h1>
          <p className="text-xs text-[#5C493E]">
            Thank you, <strong>{confirmedOrder.customer.fullName}</strong>. Your payment of{' '}
            <strong>₹{confirmedOrder.totalInr.toLocaleString('en-IN')}</strong> via{' '}
            <strong className="uppercase">{confirmedOrder.paymentMethod}</strong> has been verified.
          </p>
          <div className="bg-white rounded-xl p-4 border border-[#E6DFD3] text-left text-xs space-y-1 text-[#4A3B32]">
            <p className="font-semibold text-[#7D3E22]">Delivery Address:</p>
            <p>
              {confirmedOrder.customer.addressLine}, {confirmedOrder.customer.apartment}
            </p>
            <p>
              {confirmedOrder.customer.city}, {confirmedOrder.customer.state} —{' '}
              {confirmedOrder.customer.postalCode}
            </p>
            <p>Phone: {confirmedOrder.customer.phone}</p>
          </div>
          <button
            type="button"
            onClick={onReturnToStore}
            className="w-full py-3.5 rounded-xl bg-[#7D3E22] hover:bg-[#633019] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1C1B1A]">
      {/* Top Checkout Bar matching Screenshot 6 */}
      <header className="border-b border-[#EAEAEA] py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="w-8" />
          <button
            type="button"
            onClick={onReturnToStore}
            className="flex flex-col items-center cursor-pointer"
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
            onClick={onReturnToCart}
            aria-label="Return to cart"
            className="text-[#7D3E22] hover:opacity-80 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main 2-Column Checkout Split matching Screenshots 6, 7, 8 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Delivery, Shipping, Payment, Tip */}
        <form
          onSubmit={handlePayNowSubmit}
          className="lg:col-span-7 p-6 sm:p-10 lg:border-r border-[#EAEAEA] space-y-8"
        >
          {/* Logged-in Account Row */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-7 h-7 rounded-full bg-[#EDEDED] text-[#1C1B1A] font-semibold flex items-center justify-center uppercase">
                {(customerEmail || 'A')[0]}
              </span>
              <span className="text-[#1C1B1A] font-medium">
                {customerEmail || 'ashokreddy2899@gmail.com'}
              </span>
            </div>
            <MoreVertical className="w-4 h-4 text-[#767676]" />
          </div>

          {/* Delivery Section */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-[#1C1B1A]">Delivery</h2>

            <div className="relative rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2">
              <label className="block text-[10px] text-[#687385]">
                Country/Region
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[#1C1B1A] focus:outline-none"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2">
                <label className="block text-[10px] text-[#767676]">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
              <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2">
                <label className="block text-[10px] text-[#767676]">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2 flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-[10px] text-[#687385]">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
              <Search className="w-4 h-4 text-[#767676] shrink-0" />
            </div>

            <div className="rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2">
              <label className="block text-[10px] text-[#687385]">
                Apartment, suite, etc. (optional)
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border-2 border-[#7D3E22] bg-[#F4F7FC] px-3.5 py-2">
                <label className="block text-[10px] text-[#687385]">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
              <div className="rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2">
                <label className="block text-[10px] text-[#687385]">State</label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>
              <div className="rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2">
                <label className="block text-[10px] text-[#687385]">PIN code</label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#D9D9D9] bg-[#F4F7FC] px-3.5 py-2 flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-[10px] text-[#687385]">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1B1A] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#767676]">
                <HelpCircle className="w-4 h-4" />
                <span className="px-1.5 py-0.5 bg-white rounded border border-[#E5E5E5] text-[11px]">
                  🇮🇳
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Method Section matching Screenshot 8 */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#1C1B1A]">Shipping method</h2>

            <div className="rounded-xl border border-[#D9D9D9] overflow-hidden divide-y divide-[#D9D9D9]">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  shippingMethod === 'standard'
                    ? 'bg-[#FBF6F3] border-[#7D3E22]'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      shippingMethod === 'standard'
                        ? 'border-[#7D3E22] bg-[#7D3E22]'
                        : 'border-[#B8B8B8]'
                    }`}
                  >
                    {shippingMethod === 'standard' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <div className="text-xs">
                    <p className="font-medium text-[#1C1B1A]">Standard Delivery</p>
                    <p className="text-[#767676]">6 to 10 business days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1C1B1A]">FREE</span>
              </label>

              <label
                onClick={() => setShippingMethod('express')}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  shippingMethod === 'express'
                    ? 'bg-[#FBF6F3] border-[#7D3E22]'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      shippingMethod === 'express'
                        ? 'border-[#7D3E22] bg-[#7D3E22]'
                        : 'border-[#B8B8B8]'
                    }`}
                  >
                    {shippingMethod === 'express' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <div className="text-xs">
                    <p className="font-medium text-[#1C1B1A]">Express Shipping</p>
                    <p className="text-[#767676]">2 to 4 business days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1C1B1A]">₹200.00</span>
              </label>
            </div>
          </div>

          {/* Payment Section matching Screenshots 6, 7, 8 */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C1B1A]">Payment</h2>
              <p className="text-xs text-[#767676]">
                All transactions are secure and encrypted.
              </p>
            </div>

            <div className="rounded-xl border border-[#D9D9D9] overflow-hidden divide-y divide-[#D9D9D9]">
              {/* Option 1: Credit Card */}
              <div>
                <div
                  onClick={() => setPaymentGateway('credit_card')}
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    paymentGateway === 'credit_card'
                      ? 'bg-[#FBF6F3] border-b border-[#7D3E22]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-[#1C1B1A]">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentGateway === 'credit_card'
                          ? 'border-[#7D3E22] bg-[#7D3E22]'
                          : 'border-[#B8B8B8]'
                      }`}
                    >
                      {paymentGateway === 'credit_card' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>Credit card</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#142FBD] text-white text-[9px] font-bold">
                      VISA
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#232323] text-[#F79E1B] text-[9px] font-bold">
                      MC
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#0071CE] text-white text-[9px] font-bold">
                      AMEX
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs border border-[#D9D9D9] text-[9px] text-[#767676]">
                      +3
                    </span>
                  </div>
                </div>

                {paymentGateway === 'credit_card' && (
                  <div className="p-4 bg-[#F7F7F7] space-y-3">
                    <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2.5 flex items-center justify-between">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card number"
                        className="w-full text-xs text-[#1C1B1A] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-[#767676]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2.5">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="Expiration date (MM / YY)"
                          className="w-full text-xs text-[#1C1B1A] focus:outline-none"
                        />
                      </div>
                      <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2.5 flex items-center justify-between">
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="Security code"
                          className="w-full text-xs text-[#1C1B1A] focus:outline-none"
                        />
                        <HelpCircle className="w-4 h-4 text-[#767676]" />
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2.5">
                      <input
                        type="text"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        placeholder="Name on card"
                        className="w-full text-xs text-[#1C1B1A] focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[#1C1B1A] cursor-pointer pt-1">
                      <button
                        type="button"
                        onClick={() => setBillingSameAsShipping((p) => !p)}
                        className={`w-4 h-4 rounded-xs flex items-center justify-center border ${
                          billingSameAsShipping
                            ? 'bg-[#7D3E22] border-[#7D3E22] text-white'
                            : 'bg-white border-[#B8B8B8]'
                        }`}
                      >
                        {billingSameAsShipping && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span>Use shipping address as billing address</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Option 2: Cashfree (UPI, Card, Intl Card, Apple Pay, Wallet) */}
              <div>
                <div
                  onClick={() => setPaymentGateway('cashfree')}
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    paymentGateway === 'cashfree'
                      ? 'bg-[#FBF6F3] border-b border-[#7D3E22]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-[#1C1B1A]">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentGateway === 'cashfree'
                          ? 'border-[#7D3E22] bg-[#7D3E22]'
                          : 'border-[#B8B8B8]'
                      }`}
                    >
                      {paymentGateway === 'cashfree' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>
                      Cashfree (UPI, Card, Intl Card, Apple Pay, Wallet)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-1.5 py-0.5 rounded-xs border border-[#D9D9D9] bg-white text-[#1C1B1A] text-[9px] font-bold">
                      UPI
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#142FBD] text-white text-[9px] font-bold">
                      VISA
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#232323] text-[#F79E1B] text-[9px] font-bold">
                      MC
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs border border-[#D9D9D9] text-[9px] text-[#767676]">
                      +11
                    </span>
                  </div>
                </div>

                {paymentGateway === 'cashfree' && (
                  <div className="p-6 bg-[#F7F7F7] text-center text-xs text-[#4A4A4A]">
                    You'll be redirected to Cashfree (UPI, Card, Intl Card, Apple Pay, Wallet) to complete your purchase
                  </div>
                )}
              </div>

              {/* Option 3: Razorpay Secure */}
              <div>
                <div
                  onClick={() => setPaymentGateway('razorpay')}
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    paymentGateway === 'razorpay'
                      ? 'bg-[#FBF6F3] border-b border-[#7D3E22]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-[#1C1B1A]">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentGateway === 'razorpay'
                          ? 'border-[#7D3E22] bg-[#7D3E22]'
                          : 'border-[#B8B8B8]'
                      }`}
                    >
                      {paymentGateway === 'razorpay' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>
                      Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-1.5 py-0.5 rounded-xs border border-[#D9D9D9] bg-white text-[#1C1B1A] text-[9px] font-bold">
                      UPI
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#142FBD] text-white text-[9px] font-bold">
                      VISA
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#232323] text-[#F79E1B] text-[9px] font-bold">
                      MC
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs border border-[#D9D9D9] text-[9px] text-[#767676]">
                      +12
                    </span>
                  </div>
                </div>

                {paymentGateway === 'razorpay' && (
                  <div className="p-6 bg-[#F7F7F7] text-center text-xs text-[#4A4A4A]">
                    You'll be redirected to Razorpay Secure to complete your purchase.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Tip Section matching Screenshot 7 */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#1C1B1A]">Add tip</h2>

            <div className="rounded-xl border border-[#D9D9D9] overflow-hidden bg-white">
              <div className="p-4 border-b border-[#EAEAEA]">
                <label className="flex items-center gap-2.5 text-xs text-[#1C1B1A] cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setSupportTipChecked((p) => !p)}
                    className={`w-4 h-4 rounded-xs flex items-center justify-center border ${
                      supportTipChecked
                        ? 'bg-[#7D3E22] border-[#7D3E22] text-white'
                        : 'bg-white border-[#B8B8B8]'
                    }`}
                  >
                    {supportTipChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span>Show your support for the team at sahasrajewels</span>
                </label>
              </div>

              {supportTipChecked && (
                <div className="p-4 bg-[#FAFAFA] space-y-3">
                  {/* 4 Segmented Tip Buttons */}
                  <div className="grid grid-cols-4 rounded-lg border border-[#D9D9D9] bg-white overflow-hidden">
                    {([10, 15, 20, 0] as const).map((pct) => {
                      const isSelected = selectedTipPercent === pct && customTipInput === 0;
                      const amt = Math.round(subtotalInr * (pct / 100) * 100) / 100;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setSelectedTipPercent(pct);
                            setCustomTipInput(0);
                          }}
                          className={`py-2.5 px-2 text-center border-r last:border-r-0 border-[#D9D9D9] transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FBF6F3] border-2 border-[#7D3E22] font-semibold text-[#1C1B1A]'
                              : 'hover:bg-[#F5F5F5] text-[#1C1B1A]'
                          }`}
                        >
                          {pct === 0 ? (
                            <span className="text-xs">None</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-medium">{pct}%</span>
                              <span className="text-[10px] text-[#767676]">
                                ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Tip Input Row */}
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between rounded-lg border border-[#D9D9D9] bg-white px-3.5 py-2">
                      <input
                        type="number"
                        min={0}
                        value={customTipInput || ''}
                        onChange={(e) => {
                          setCustomTipInput(Number(e.target.value));
                          setSelectedTipPercent(0);
                        }}
                        placeholder="Custom tip"
                        className="w-full text-xs text-[#1C1B1A] focus:outline-none"
                      />
                      <div className="flex items-center gap-3 text-[#767676]">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomTipInput((v) => Math.max(0, v - 50))
                          }
                          className="cursor-pointer hover:text-[#1C1B1A]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomTipInput((v) => v + 50)}
                          className="cursor-pointer hover:text-[#1C1B1A]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-[#D9D9D9] bg-[#F2F2F2] text-xs font-medium text-[#767676] cursor-pointer"
                    >
                      Add tip
                    </button>
                  </div>

                  <p className="text-xs text-[#4A4A4A]">
                    Thank you, we appreciate it.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Pay Now Button matching Screenshot 7 */}
          <button
            type="submit"
            disabled={processingOrder}
            className="w-full py-4 rounded-xl bg-[#7D3E22] hover:bg-[#633019] text-white text-sm font-bold transition-colors cursor-pointer shadow-xs"
          >
            {processingOrder ? 'Processing Order...' : 'Pay now'}
          </button>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <button
              type="button"
              onClick={onReturnToStore}
              className="text-xs text-[#7D3E22] underline cursor-pointer"
            >
              Terms and policies
            </button>
          </div>
        </form>

        {/* Right Column: Sticky Order Summary matching Screenshots 6, 7, 8 */}
        <aside className="lg:col-span-5 p-6 sm:p-10 bg-[#FAFAFA] lg:bg-white space-y-6">
          {/* Items List */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={String(item.cartItemId)}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg border border-[#E5E5E5] bg-[#F4EFE6] shrink-0">
                    <img
                      src={item.primaryImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1C1B1A] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#1C1B1A] leading-snug max-w-[220px]">
                    {item.title}
                  </span>
                </div>

                <span className="text-xs font-medium text-[#1C1B1A] whitespace-nowrap">
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}.00
                </span>
              </div>
            ))}
          </div>

          {/* Discount Code or Gift Card Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Discount code or gift card"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D9D9D9] bg-white text-xs text-[#1C1B1A] focus:outline-none focus:border-[#7D3E22]"
            />
            <button
              type="button"
              onClick={() =>
                setAppliedDiscountCode(discountInput.trim().toUpperCase())
              }
              className="px-4 py-2.5 rounded-lg border border-[#D9D9D9] bg-[#F5F5F5] hover:bg-[#EAEAEA] text-xs font-semibold text-[#5A5A5A] cursor-pointer"
            >
              Apply
            </button>
          </div>

          {/* Subtotal, Shipping, Total Breakdown */}
          <div className="space-y-2.5 text-xs pt-2">
            <div className="flex justify-between text-[#1C1B1A]">
              <span>Subtotal</span>
              <span>₹{subtotalInr.toLocaleString('en-IN')}.00</span>
            </div>

            {discountAmountInr > 0 && (
              <div className="flex justify-between text-[#1E6B45]">
                <span>Discount ({appliedDiscountCode})</span>
                <span>- ₹{discountAmountInr.toLocaleString('en-IN')}.00</span>
              </div>
            )}

            <div className="flex justify-between text-[#1C1B1A]">
              <span className="flex items-center gap-1">
                Shipping <HelpCircle className="w-3.5 h-3.5 text-[#767676]" />
              </span>
              <span className="font-medium">
                {shippingCostInr === 0 ? 'FREE' : `₹${shippingCostInr}.00`}
              </span>
            </div>

            {calculatedTipInr > 0 && (
              <div className="flex justify-between text-[#1C1B1A]">
                <span>Tip</span>
                <span>₹{calculatedTipInr.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#EAEAEA] flex items-baseline justify-between">
              <div>
                <span className="text-base font-bold text-[#1C1B1A] block">
                  Total
                </span>
                <span className="text-[11px] text-[#767676]">
                  Including ₹{includedTaxInr.toLocaleString('en-IN')} in taxes
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-[#767676]">INR</span>
                <span className="text-lg font-bold text-[#1C1B1A]">
                  ₹{totalInr.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Cashfree Split-Card Checkout Modal (Matches Screenshot 9) */}
      <CashfreeGatewayModal
        isOpen={isCashfreeModalOpen}
        amountInr={totalInr}
        customerPhone={`+91 ${phone.replace(/^0/, '')}`}
        onClose={() => setIsCashfreeModalOpen(false)}
        onPaymentSuccess={({ cashbackApplied }) => {
          setIsCashfreeModalOpen(false);
          finalizeOrder(cashbackApplied);
        }}
      />
    </div>
  );
};
