import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, ShieldCheck, Truck, Check, Plus, Minus, Bell } from 'lucide-react';
import type { ProductItem } from '../data/catalog';
import { ProductVisualCanvas } from './ProductVisualCanvas';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (
    product: ProductItem,
    quantity: number,
    selectedVariants: Record<string, string>,
    openCheckoutDirectly?: boolean
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [showSecondaryPhoto, setShowSecondaryPhoto] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setShowSecondaryPhoto(false);
      setQuantity(1);
      const initialVars: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.values.length > 0) {
          initialVars[v.name] = v.values[0];
        }
      });
      setSelectedVariants(initialVars);
      setAddedFeedback(false);
      setNotifySubmitted(false);
      setNotifyEmail('');
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = (expressCheckout = false) => {
    onAddToCart(product, quantity, selectedVariants, expressCheckout);
    if (!expressCheckout) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#231812] hover:bg-[#834328] hover:text-white transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Gallery Column */}
          <div className="lg:col-span-6 bg-[#F2ECE1] p-6 flex flex-col justify-between">
            <div className="relative aspect-4/5 w-full rounded-lg overflow-hidden bg-white border border-[#E6DFD3]">
              <ProductVisualCanvas product={product} showSecondary={showSecondaryPhoto} />
              {product.badge && (
                <span
                  className={`absolute top-3 left-3 px-3.5 py-1 text-xs font-medium rounded-full ${
                    product.badge === 'Sold out'
                      ? 'bg-[#834328] text-white'
                      : 'bg-[#FBC02D] text-[#231812]'
                  }`}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowSecondaryPhoto(false)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                  !showSecondaryPhoto
                    ? 'bg-[#834328] text-white border-[#834328]'
                    : 'bg-white text-[#5C493E] border-[#DFD5C7] hover:border-[#834328]'
                }`}
              >
                View 1
              </button>
              <button
                type="button"
                onClick={() => setShowSecondaryPhoto(true)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                  showSecondaryPhoto
                    ? 'bg-[#834328] text-white border-[#834328]'
                    : 'bg-white text-[#5C493E] border-[#DFD5C7] hover:border-[#834328]'
                }`}
              >
                View 2
              </button>
            </div>
          </div>

          {/* Right Purchase Details Column */}
          <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between bg-[#FAF7F2]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#834328] mb-2">
                <span>{product.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{product.craftType}</span>
              </div>

              <h2
                id="pdp-modal-title"
                className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#834328] leading-snug"
              >
                {product.title}
              </h2>

              {/* Price */}
              <div className="mt-4 pb-5 border-b border-[#E6DFD3] flex items-baseline gap-3">
                {product.regularPrice > product.salePrice && (
                  <s className="text-sm text-[#9C7A68]">
                    Rs. {product.regularPrice.toLocaleString('en-IN')}.00
                  </s>
                )}
                <span className="text-2xl font-semibold text-[#834328]">
                  Rs. {product.salePrice.toLocaleString('en-IN')}.00
                </span>
                {product.badge && (
                  <span
                    className={`ml-2 px-3 py-0.5 text-xs font-medium rounded-full ${
                      product.badge === 'Sold out'
                        ? 'bg-[#834328] text-white'
                        : 'bg-[#FBC02D] text-[#231812]'
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-[#4A3B32] leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selectors */}
              {product.variants.length > 0 && (
                <div className="mt-5 space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.name}>
                      <label className="block text-xs font-medium text-[#3B2C24] mb-2">
                        {variant.name}:{' '}
                        <span className="text-[#834328] font-semibold">
                          {selectedVariants[variant.name]}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map((val) => {
                          const isSelected = selectedVariants[variant.name] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.name]: val
                                }))
                              }
                              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                                isSelected
                                  ? 'bg-[#834328] text-white border-[#834328]'
                                  : 'bg-white text-[#4A3B32] border-[#D8CFC2] hover:border-[#834328]'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Details */}
              <div className="mt-5 pt-4 border-t border-[#E6DFD3]">
                <h3 className="text-xs font-semibold text-[#3B2C24] mb-2">
                  Product Highlights
                </h3>
                <ul className="space-y-1.5 text-xs text-[#5C493E]">
                  {product.specifications.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#834328] select-none">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase Action Controls */}
            <div className="mt-6 pt-5 border-t border-[#E6DFD3]">
              {product.inStock && product.availableStock > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#D8CFC2] bg-white rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="w-10 h-10 flex items-center justify-center text-[#231812] hover:bg-[#F3EDE4] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(product.availableStock, q + 1))
                        }
                        aria-label="Increase quantity"
                        className="w-10 h-10 flex items-center justify-center text-[#231812] hover:bg-[#F3EDE4] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAdd(false)}
                      className="flex-1 h-11 px-5 rounded-lg border border-[#834328] bg-white hover:bg-[#FAF0E8] text-[#834328] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {addedFeedback ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Item added to your cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to cart</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Buy It Now CTA */}
                  <button
                    type="button"
                    onClick={() => handleAdd(true)}
                    className="w-full h-11 px-5 rounded-lg bg-[#834328] hover:bg-[#6B351E] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Buy it now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 px-4 rounded-lg bg-[#E5DEC9] text-[#7A6254] font-medium text-sm cursor-not-allowed"
                  >
                    Sold out
                  </button>
                  {!notifySubmitted ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (notifyEmail.trim()) setNotifySubmitted(true);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Enter email for restock alert"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-lg focus:outline-none focus:border-[#834328]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#834328] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify Me</span>
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-[#1E6B45] font-medium text-center">
                      We will notify you by email as soon as this piece is back in stock!
                    </p>
                  )}
                </div>
              )}

              {/* Trust Strip */}
              <div className="mt-4 pt-3 border-t border-[#E6DFD3] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E5A4F]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#834328]" />
                  Free shipping on all orders
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#834328]" />
                  Secure payment & quality assured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
