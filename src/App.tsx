import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Plus,
  Check
} from 'lucide-react';
import {
  INITIAL_PRODUCTS,
  VERIFIED_REVIEWS,
  type ProductItem,
  type ProductCategory,
  type CustomerReview,
  type OrderRecord
} from './data/catalog';
import { ProductVisualCanvas } from './components/ProductVisualCanvas';
import { ProductDetailModal } from './components/ProductDetailModal';
import type { CartItem } from './components/CartCheckoutDrawer';
import { ReviewsSection } from './components/ReviewsSection';
import {
  AccountHeaderPopover,
  SignInOtpPage,
  CustomerProfileOrdersPage,
  type SavedAddress
} from './components/CustomerAuthViews';
import { FullCartPage, FullCheckoutPage } from './components/CartAndCheckoutPages';

const ANNOUNCEMENTS = [
  'Free shipping for all orders 🤎',
  '✈ Worldwide Shipping Available ✈'
];

const COLLECTION_HERO_COPY: Record<
  'all' | ProductCategory,
  { title: string; description: string }
> = {
  all: {
    title: 'Sarees by Sahasra',
    description:
      'Sarees by Sahasra is a curated expression of timeless elegance, where each saree is a graceful blend of tradition, craftsmanship, and quiet luxury. From rich silks to delicate weaves, our collections are designed for women who embrace heritage with a modern sensibility. Every drape from Sahasra tells a story—woven with care, worn with pride.'
  },
  'kasavu-sarees': {
    title: 'Sarees by Sahasra',
    description:
      'Sarees by Sahasra is a curated expression of timeless elegance, where each saree is a graceful blend of tradition, craftsmanship, and quiet luxury. From rich silks to delicate weaves, our collections are designed for women who embrace heritage with a modern sensibility. Every drape from Sahasra tells a story—woven with care, worn with pride.'
  },
  'gift-hampers': {
    title: 'Box of Joy — Gift Hampers',
    description:
      'Thoughtfully curated celebration boxes pairing our signature Onam Kasavu sarees with coordinated temple necklaces, glass and gold-plated bangle stacks, forever jasmine garlands, and artisanal perfumes.'
  },
  'temple-jewellery': {
    title: 'Temple Necklaces & Long Haarams',
    description:
      'Sculpted in traditional South Indian nakshi work and hand-set with ruby and emerald Kemp stones, our 22K gold-plated necklaces, earrings, and Goddess Lakshmi haarams complete every festive drape.'
  },
  'chokers-bangles': {
    title: 'Chokers & Handcrafted Bangles',
    description:
      'From hand-knotted ivory pearl cluster chokers to traditional temple kadas and glass bangle stacks, discover heirloom-inspired adornments crafted for effortless grace.'
  },
  'accessories-crafts': {
    title: 'Forever Flowers & Handcrafted Keepsakes',
    description:
      'Delicate handcrafted forever jasmine garlands, hair brooches, anklets, and artisanal crochet keepsakes designed to complement your festive wardrobe.'
  }
};

type ActiveViewMode =
  | 'storefront'
  | 'cart_page'
  | 'checkout_page'
  | 'signin_otp_page'
  | 'profile_orders_page';

export default function App() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState<CustomerReview[]>(VERIFIED_REVIEWS);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(1377);

  // Page router state
  const [viewMode, setViewMode] = useState<ActiveViewMode>('storefront');
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'orders'>('profile');

  // Customer Auth & Account Popover State (Matching Screenshots 1, 2, 3, 4)
  const [customerEmail, setCustomerEmail] = useState('ashokreddy2899@gmail.com');
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const accountWrapperRef = useRef<HTMLDivElement | null>(null);

  // Announcement bar state
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  // Navigation & Dropdown state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Filtering & Sorting state
  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('kasavu-sarees');
  const [customCollectionTitle, setCustomCollectionTitle] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in-stock' | 'sold-out'>('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under-1500' | '1500-3000' | 'above-3000'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title-asc'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Search Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hover state for product card secondary photo reveal
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Cart state initialized with "3868 - Premium Ruby Pink Jadau Kemp Pearl Necklace with Earrings" (Rs. 6,999.00) matching Screenshots 5, 6, 7, 8, 9
  const [cartItems, setCartItems] = useState<CartItem[]>(() => [
    {
      cartItemId: `${INITIAL_PRODUCTS[0].id}-default`,
      productId: INITIAL_PRODUCTS[0].id,
      sku: INITIAL_PRODUCTS[0].sku,
      title: INITIAL_PRODUCTS[0].title,
      quantity: 1,
      unitPrice: INITIAL_PRODUCTS[0].salePrice,
      selectedVariants: {
        'Back Closure': 'Adjustable Silk Dori'
      },
      primaryImage: INITIAL_PRODUCTS[0].primaryImage,
      maxAvailable: INITIAL_PRODUCTS[0].availableStock
    }
  ]);

  const reviewsSectionRef = useRef<HTMLDivElement | null>(null);

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/v1/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct((prev) =>
            prev ? data.products.find((p: ProductItem) => p.id === prev.id) || prev : null
          );
        }
      }
    } catch {
      // Fallback to INITIAL_PRODUCTS
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/v1/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          setTotalReviewsCount(data.totalReviewsCount || 1377);
        }
      }
    } catch {
      // Fallback to VERIFIED_REVIEWS
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchReviews();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (
        accountWrapperRef.current &&
        !accountWrapperRef.current.contains(e.target as Node)
      ) {
        setIsAccountPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, availabilityFilter, priceRangeFilter, sortBy, searchQuery]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (activeCategory !== 'all' && item.category !== activeCategory) return false;
        if (availabilityFilter === 'in-stock' && (!item.inStock || item.availableStock <= 0))
          return false;
        if (availabilityFilter === 'sold-out' && item.inStock && item.availableStock > 0)
          return false;
        if (priceRangeFilter === 'under-1500' && item.salePrice >= 1500) return false;
        if (
          priceRangeFilter === '1500-3000' &&
          (item.salePrice < 1500 || item.salePrice > 3000)
        )
          return false;
        if (priceRangeFilter === 'above-3000' && item.salePrice <= 3000) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCraft = item.craftType.toLowerCase().includes(q);
          const matchCategory = item.categoryLabel.toLowerCase().includes(q);
          if (!matchTitle && !matchCraft && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
        if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, activeCategory, availabilityFilter, priceRangeFilter, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const selectCollection = (category: 'all' | ProductCategory, customHeading?: string) => {
    setActiveCategory(category);
    setCustomCollectionTitle(customHeading || null);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setViewMode('storefront');
  };

  const handleAddToCart = (
    product: ProductItem,
    quantity: number,
    selectedVariants: Record<string, string>,
    openCheckoutDirectly = false
  ) => {
    const variantKey = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const cartItemId = `${product.id}-${variantKey || 'default'}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: Math.min(product.availableStock, item.quantity + quantity)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          sku: product.sku,
          title: product.title,
          quantity,
          unitPrice: product.salePrice,
          selectedVariants,
          primaryImage: product.primaryImage,
          maxAvailable: product.availableStock
        }
      ];
    });

    if (openCheckoutDirectly) {
      setSelectedProduct(null);
      setViewMode('checkout_page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    const defaultVariants: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.values.length > 0) defaultVariants[v.name] = v.values[0];
    });
    handleAddToCart(product, 1, defaultVariants, false);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1400);
  };

  const handleUpdateCartQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => String(i.cartItemId) !== cartItemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (String(i.cartItemId) === cartItemId ? { ...i, quantity: newQty } : i))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => String(i.cartItemId) !== cartItemId));
  };

  const handleSubmitReview = async (payload: {
    reviewerName: string;
    rating: number;
    title: string;
    body: string;
    productTitle: string;
    productImage: string;
  }) => {
    const res = await fetch('/api/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      await fetchReviews();
    }
  };

  // Dedicated full-page views for Sign In + OTP (Screenshots 2 & 3), Profile/Orders (Screenshot 4), and Checkout (Screenshots 6, 7, 8, 9)
  if (viewMode === 'signin_otp_page') {
    return (
      <SignInOtpPage
        email={customerEmail}
        onEmailChange={setCustomerEmail}
        onVerifiedSuccess={(verifiedEmail) => {
          setCustomerEmail(verifiedEmail);
          setIsSignedIn(true);
          setProfileInitialTab('profile');
          setViewMode('profile_orders_page');
        }}
        onBackToStore={() => setViewMode('storefront')}
      />
    );
  }

  if (viewMode === 'profile_orders_page') {
    return (
      <CustomerProfileOrdersPage
        initialTab={profileInitialTab}
        email={customerEmail}
        onEmailChange={setCustomerEmail}
        addresses={savedAddresses}
        onAddAddress={(addr) => setSavedAddresses((prev) => [addr, ...prev])}
        orders={recentOrders}
        onSignOut={() => {
          setIsSignedIn(false);
          setViewMode('storefront');
        }}
        onBackToStore={() => setViewMode('storefront')}
      />
    );
  }

  if (viewMode === 'checkout_page') {
    return (
      <FullCheckoutPage
        items={cartItems}
        customerEmail={customerEmail}
        specialInstructions={specialInstructions}
        onReturnToCart={() => setViewMode('cart_page')}
        onReturnToStore={() => setViewMode('storefront')}
        onOrderCompleted={(order) => {
          setRecentOrders((prev) => [order, ...prev]);
          fetchCatalog();
        }}
        onClearCart={() => setCartItems([])}
      />
    );
  }

  const heroContent = COLLECTION_HERO_COPY[activeCategory];
  const displayHeroTitle = customCollectionTitle || heroContent.title;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#231812]">
      {/* Top Announcement Bar (#834328 warm brown) */}
      <div className="bg-[#834328] text-white h-9 px-4 flex items-center justify-center border-b border-[#6E361F]">
        <div className="max-w-3xl w-full flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() =>
              setAnnouncementIdx((prev) => (prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1))
            }
            aria-label="Previous announcement"
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <p className="font-normal tracking-wide truncate px-2 text-center">
            {ANNOUNCEMENTS[announcementIdx]}
          </p>

          <button
            type="button"
            onClick={() =>
              setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)
            }
            aria-label="Next announcement"
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Header (Matching Screenshot 5 3-Row Menu + Right Icons with Account Popover) */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2] border-b border-[#EAE2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
          {/* Left on Mobile: Hamburger + Search Icon */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
              className="p-2 text-[#231812] hover:text-[#834328] cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search"
              className="p-2 text-[#231812] hover:text-[#834328] cursor-pointer"
            >
              <svg fill="none" className="w-5 h-5" viewBox="0 0 18 19">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.03 11.68A5.784 5.784 0 1 1 2.85 3.5a5.784 5.784 0 0 1 8.18 8.18m.26 1.12a6.78 6.78 0 1 1 .72-.7l5.4 5.4a.5.5 0 1 1-.71.7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Brand Logo */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              selectCollection('kasavu-sarees', 'Sarees by Sahasra');
            }}
            className="flex flex-col items-center justify-center shrink-0 cursor-pointer"
          >
            <span className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-[#834328] leading-none">
              sahasra
            </span>
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#834328] -mt-0.5 font-semibold">
              jewels
            </span>
          </a>

          {/* Center 3-Row Inline Navigation Menu (Matching Screenshot 5 image_dfa81685.png) */}
          <nav
            ref={navRef}
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#3B2C24] max-w-4xl"
          >
            <button
              type="button"
              onClick={() => selectCollection('all', 'Sarees & Jewellery by Sahasra')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => selectCollection('gift-hampers', 'Gift Hampers')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Gift Hampers
            </button>

            <button
              type="button"
              onClick={() => selectCollection('kasavu-sarees', 'Sarees by Sahasra')}
              className={`py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'storefront' && activeCategory === 'kasavu-sarees'
                  ? 'underline font-medium text-[#834328]'
                  : ''
              }`}
            >
              Sarees by Sahasra
            </button>

            {/* Earring Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'earring' ? null : 'earring'))
                }
                className="py-0.5 flex items-center gap-1 hover:text-[#834328] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Earring</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'earring' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#FAF7F2] border border-[#E5DEC9] rounded-md shadow-lg py-2 z-40">
                  {[
                    'All Earrings',
                    'Temple Earrings',
                    'Stone & Kemp Earrings',
                    'Oxidised Earrings',
                    'Western Earrings'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => selectCollection('temple-jewellery', sub)}
                      className="w-full text-left px-4 py-2 text-xs text-[#3B2C24] hover:bg-[#EFE6D5] hover:text-[#834328] cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chokers Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'chokers' ? null : 'chokers'))
                }
                className="py-0.5 flex items-center gap-1 hover:text-[#834328] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Chokers</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'chokers' && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-[#FAF7F2] border border-[#E5DEC9] rounded-md shadow-lg py-2 z-40">
                  {['Budget Chokers', 'Premium Chokers', 'All Chokers'].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => selectCollection('chokers-bangles', sub)}
                      className="w-full text-left px-4 py-2 text-xs text-[#3B2C24] hover:bg-[#EFE6D5] hover:text-[#834328] cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => selectCollection('temple-jewellery', 'Necklaces')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Necklaces
            </button>

            <button
              type="button"
              onClick={() => selectCollection('temple-jewellery', 'Pendants')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Pendants
            </button>

            <button
              type="button"
              onClick={() => selectCollection('temple-jewellery', 'Long Chains / Haarams')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Long Chains / Haarams
            </button>

            {/* Combos Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'combos' ? null : 'combos'))
                }
                className="py-0.5 flex items-center gap-1 hover:text-[#834328] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Combos</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'combos' && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-[#FAF7F2] border border-[#E5DEC9] rounded-md shadow-lg py-2 z-40">
                  {[
                    'Budget Bridal Combo',
                    'Premium Bridal Combo',
                    'Layered Necklace Combo'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => selectCollection('gift-hampers', sub)}
                      className="w-full text-left px-4 py-2 text-xs text-[#3B2C24] hover:bg-[#EFE6D5] hover:text-[#834328] cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Row 2 Items matching Screenshot 5 */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'bangles' ? null : 'bangles'))
                }
                className="py-0.5 flex items-center gap-1 hover:text-[#834328] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Bangles</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'bangles' && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-[#FAF7F2] border border-[#E5DEC9] rounded-md shadow-lg py-2 z-40">
                  {[
                    'Budget Bangles',
                    'Premium Bangles',
                    'All Bangles',
                    'Bangle Stacks'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => selectCollection('chokers-bangles', sub)}
                      className="w-full text-left px-4 py-2 text-xs text-[#3B2C24] hover:bg-[#EFE6D5] hover:text-[#834328] cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              'Armlets / Vanki',
              'Rings',
              'Hip Chains',
              'Earchain / Maatti',
              'Maang Tikka',
              'Hair Brooch & Chotis',
              'Anklets',
              'Nosepins'
            ].map((itemLabel) => (
              <button
                key={itemLabel}
                type="button"
                onClick={() => selectCollection('temple-jewellery', itemLabel)}
                className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
              >
                {itemLabel}
              </button>
            ))}

            {/* Row 3 Items matching Screenshot 5 */}
            <button
              type="button"
              onClick={() => selectCollection('gift-hampers', '🌷 Forever Flowers')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              🌷 Forever Flowers
            </button>

            <button
              type="button"
              onClick={() => selectCollection('gift-hampers', '🧶 Crochet Keychain / Toy')}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              🧶 Crochet Keychain / Toy
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('storefront');
                setTimeout(() => {
                  reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}
              className="py-0.5 hover:text-[#834328] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Customer Reviews
            </button>
          </nav>

          {/* Right Header Icons (Search, Account with Popover, Bag with count bubble) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* 1. Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search"
              className="hidden lg:flex items-center justify-center w-9 h-9 text-[#231812] hover:text-[#834328] transition-colors cursor-pointer"
            >
              <svg fill="none" className="w-[18px] h-[18px]" viewBox="0 0 18 19">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.03 11.68A5.784 5.784 0 1 1 2.85 3.5a5.784 5.784 0 0 1 8.18 8.18m.26 1.12a6.78 6.78 0 1 1 .72-.7l5.4 5.4a.5.5 0 1 1-.71.7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* 2. Account Icon + Popover (Matches Screenshot 1 & Screenshot 5) */}
            <div ref={accountWrapperRef} className="relative">
              <button
                type="button"
                onClick={() => setIsAccountPopoverOpen((prev) => !prev)}
                aria-label="Account"
                className="flex items-center justify-center w-9 h-9 text-[#231812] hover:text-[#834328] transition-colors cursor-pointer"
              >
                {isSignedIn && viewMode === 'cart_page' ? (
                  <span className="w-7 h-7 rounded-full bg-[#834328] text-white text-xs font-semibold flex items-center justify-center uppercase">
                    {(customerEmail || 'A')[0]}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    className="w-[19px] h-[19px]"
                    viewBox="0 0 18 19"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M6 4.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8m5.58 12.15c1.12.82 1.83 2.24 1.91 4.85H1.51c.08-2.6.79-4.03 1.9-4.85C4.66 11.75 6.5 11.5 9 11.5s4.35.26 5.58 1.15M9 10.5c-2.5 0-4.65.24-6.17 1.35C1.27 12.98.5 14.93.5 18v.5h17V18c0-3.07-.77-5.02-2.33-6.15-1.52-1.1-3.67-1.35-6.17-1.35"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <AccountHeaderPopover
                isOpen={isAccountPopoverOpen}
                email={customerEmail}
                isSignedIn={isSignedIn}
                onEmailChange={setCustomerEmail}
                onClose={() => setIsAccountPopoverOpen(false)}
                onProceedToSignIn={() => {
                  setIsAccountPopoverOpen(false);
                  setViewMode('signin_otp_page');
                }}
                onOpenOrdersPage={() => {
                  setIsAccountPopoverOpen(false);
                  setProfileInitialTab('orders');
                  setViewMode('profile_orders_page');
                }}
                onOpenProfilePage={() => {
                  setIsAccountPopoverOpen(false);
                  setProfileInitialTab('profile');
                  setViewMode('profile_orders_page');
                }}
              />
            </div>

            {/* 3. Shopping Bag Icon with warm brown #834328 circular count badge */}
            <button
              type="button"
              onClick={() => {
                setViewMode('cart_page');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Cart"
              className="relative flex items-center justify-center w-10 h-10 text-[#231812] hover:text-[#834328] transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="w-9 h-9"
                viewBox="0 0 40 40"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M20.5 6.5a4.75 4.75 0 0 0-4.75 4.75v.56h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33l-.77-11.6h-3.16v-.57A4.75 4.75 0 0 0 20.5 6.5m3.75 5.31v-.56a3.75 3.75 0 1 0-7.5 0v.56zm-7.5 1h7.5v.56a3.75 3.75 0 1 1-7.5 0zm-1 0v.56a4.75 4.75 0 1 0 9.5 0v-.56h2.22l.71 10.67a4 4 0 0 1-3.99 4.27h-7.38a4 4 0 0 1-4-4.27l.72-10.67z"
                />
              </svg>
              {totalCartQuantity > 0 && (
                <span className="absolute bottom-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#834328] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                  {totalCartQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-80 max-w-[85vw] bg-[#FAF7F2] h-full flex flex-col justify-between p-6 overflow-y-auto shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD3]">
                <span className="font-serif-display text-2xl font-bold text-[#834328]">
                  sahasra
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1 text-[#231812] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-[#231812]">
                {[
                  { label: 'Home', cat: 'all' as const, heading: 'Sarees by Sahasra' },
                  { label: 'Gift Hampers', cat: 'gift-hampers' as const, heading: 'Gift Hampers' },
                  { label: 'Sarees by Sahasra', cat: 'kasavu-sarees' as const, heading: 'Sarees by Sahasra' },
                  { label: 'Earring', cat: 'temple-jewellery' as const, heading: 'Temple & Kemp Earrings' },
                  { label: 'Chokers', cat: 'chokers-bangles' as const, heading: 'Chokers' },
                  { label: 'Necklaces', cat: 'temple-jewellery' as const, heading: 'Necklaces' },
                  { label: 'Pendants', cat: 'temple-jewellery' as const, heading: 'Pendants' },
                  { label: 'Long Chains / Haarams', cat: 'temple-jewellery' as const, heading: 'Long Chains / Haarams' },
                  { label: 'Combos', cat: 'gift-hampers' as const, heading: 'Combos' },
                  { label: 'Bangles', cat: 'chokers-bangles' as const, heading: 'Bangles' },
                  { label: 'Armlets / Vanki', cat: 'temple-jewellery' as const, heading: 'Armlets / Vanki' },
                  { label: 'Rings', cat: 'temple-jewellery' as const, heading: 'Rings' },
                  { label: 'Hip Chains', cat: 'temple-jewellery' as const, heading: 'Hip Chains' },
                  { label: 'Maang Tikka', cat: 'temple-jewellery' as const, heading: 'Maang Tikka' },
                  { label: 'Anklets', cat: 'temple-jewellery' as const, heading: 'Anklets' },
                  { label: 'Nosepins', cat: 'temple-jewellery' as const, heading: 'Nosepins' },
                  { label: '🌷 Forever Flowers', cat: 'gift-hampers' as const, heading: '🌷 Forever Flowers' },
                  { label: '🧶 Crochet Keychain / Toy', cat: 'gift-hampers' as const, heading: '🧶 Crochet Keychain / Toy' }
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => selectCollection(item.cat, item.heading)}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-[#EFE6D5] hover:text-[#834328] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E6DFD3] text-xs flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setViewMode('signin_otp_page');
                }}
                className="font-medium text-[#834328] hover:underline cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileInitialTab('orders');
                  setViewMode('profile_orders_page');
                }}
                className="font-medium text-[#834328] hover:underline cursor-pointer"
              >
                Orders & Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Search Modal Overlay */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="bg-[#FAF7F2] border-b border-[#E5DEC9] py-6 px-4 shadow-md">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees, Jadau Kemp necklaces, gift hampers, bangles..."
                  className="w-full pl-4 pr-10 py-3 text-sm bg-white border border-[#834328] rounded-md focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#231812] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                aria-label="Close search"
                className="p-2 text-[#231812] hover:text-[#834328] cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="max-w-3xl mx-auto mt-4 bg-white border border-[#E6DFD3] rounded-md max-h-80 overflow-y-auto divide-y divide-[#F2ECE1]">
                {filteredProducts.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      setSelectedProduct(item);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-[#FAF7F2] text-left transition-colors cursor-pointer"
                  >
                    <img
                      src={item.primaryImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover rounded-xs bg-[#F2ECE1] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#834328] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#6E5A4F]">
                        Rs. {item.salePrice.toLocaleString('en-IN')}.00
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setIsSearchModalOpen(false)} />
        </div>
      )}

      {/* Main Content Area: Either Full Cart Page (Screenshot 5) OR Storefront Collection View */}
      <main id="MainContent" className="flex-1">
        {viewMode === 'cart_page' ? (
          <FullCartPage
            items={cartItems}
            specialInstructions={specialInstructions}
            onSpecialInstructionsChange={setSpecialInstructions}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onContinueShopping={() => setViewMode('storefront')}
            onProceedToCheckout={() => {
              setViewMode('checkout_page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {/* Collection Hero Banner (#834328 warm brown) */}
            <section className="bg-[#834328] text-white py-9 sm:py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                  <h1 className="font-serif-display text-3xl sm:text-4xl font-normal tracking-wide text-white">
                    {displayHeroTitle}
                  </h1>
                  <p className="mt-4 text-sm sm:text-[15px] text-[#F7EFE8]/95 leading-relaxed">
                    {heroContent.description}
                  </p>
                </div>
              </div>
            </section>

            {/* Filter & Sort Row */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
              <div className="flex items-center justify-between gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setShowFilterBar((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm text-[#7A5C4D] hover:text-[#834328] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
                  <span>Filter and sort</span>
                </button>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 text-xs text-[#7A5C4D]">
                    <label htmlFor="SortBySelect">Sort by:</label>
                    <select
                      id="SortBySelect"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="bg-transparent text-xs text-[#7A5C4D] focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="featured">Date, new to old</option>
                      <option value="price-asc">Price, low to high</option>
                      <option value="price-desc">Price, high to low</option>
                      <option value="title-asc">Alphabetically, A-Z</option>
                    </select>
                  </div>

                  <span className="text-sm text-[#8C6D5D]">40 products</span>
                </div>
              </div>

              {showFilterBar && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-[#E6DFD3] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block font-semibold text-[#834328] mb-2">
                      Availability
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'in-stock', label: 'In stock' },
                          { id: 'sold-out', label: 'Out of stock' }
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setAvailabilityFilter(st.id)}
                          className={`px-3 py-1.5 rounded-md border cursor-pointer ${
                            availabilityFilter === st.id
                              ? 'bg-[#834328] text-white border-[#834328]'
                              : 'bg-[#FAF7F2] text-[#4A3B32] border-[#D8CFC2]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block font-semibold text-[#834328] mb-2">
                      Price
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'all', label: 'All Prices' },
                          { id: 'under-1500', label: 'Under Rs. 1,500' },
                          { id: '1500-3000', label: 'Rs. 1,500 – Rs. 3,000' },
                          { id: 'above-3000', label: 'Above Rs. 3,000' }
                        ] as const
                      ).map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => setPriceRangeFilter(pr.id)}
                          className={`px-3 py-1.5 rounded-md border cursor-pointer ${
                            priceRangeFilter === pr.id
                              ? 'bg-[#834328] text-white border-[#834328]'
                              : 'bg-[#FAF7F2] text-[#4A3B32] border-[#D8CFC2]'
                          }`}
                        >
                          {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        selectCollection('all');
                        setAvailabilityFilter('all');
                        setPriceRangeFilter('all');
                        setSearchQuery('');
                        setSortBy('featured');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#834328] underline cursor-pointer"
                    >
                      Remove all
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Product Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <ul
                role="list"
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10"
              >
                {paginatedProducts.map((product) => {
                  const isHovered = hoveredProductId === product.id;
                  const isQuickAdded = quickAddedId === product.id;

                  return (
                    <li
                      key={product.id}
                      onMouseEnter={() => setHoveredProductId(product.id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#F2ECE1]">
                        <ProductVisualCanvas
                          product={product}
                          showSecondary={isHovered}
                        />

                        {product.badge && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span
                              className={`inline-block px-3.5 py-1 text-xs font-normal rounded-full ${
                                product.badge === 'Sold out'
                                  ? 'bg-[#7A3E24] text-white'
                                  : 'bg-[#FBC02D] text-[#231812]'
                              }`}
                            >
                              {product.badge === 'Limited Run' ? 'Sale' : product.badge}
                            </span>
                          </div>
                        )}

                        {product.inStock && product.availableStock > 0 && (
                          <div
                            className={`absolute inset-x-3 bottom-3 z-10 transition-opacity duration-150 ${
                              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, product)}
                              className="w-full py-2 px-3 rounded-sm bg-[#834328]/95 hover:bg-[#6B351E] text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {isQuickAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add to cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="pt-3.5 pb-1 px-1 text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-[13px] sm:text-sm font-normal text-[#834328] group-hover:underline underline-offset-4 leading-relaxed">
                          {product.title}
                        </h3>

                        <div className="mt-2 flex flex-col items-center">
                          {product.regularPrice > product.salePrice && (
                            <s className="text-xs text-[#9C7A68]">
                              Rs. {product.regularPrice.toLocaleString('en-IN')}.00
                            </s>
                          )}
                          <span className="text-sm sm:text-[15px] font-normal text-[#834328] mt-0.5">
                            Rs. {product.salePrice.toLocaleString('en-IN')}.00
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Pagination Bar (1 2 3 4 >) */}
              <nav
                aria-label="Pagination"
                className="mt-12 pb-8 flex items-center justify-center gap-7 text-sm text-[#834328]"
              >
                {[1, 2, 3, 4].map((pageNum) => {
                  const effectivePage = ((pageNum - 1) % totalPages) + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(effectivePage);
                        window.scrollTo({ top: 240, behavior: 'smooth' });
                      }}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`w-7 h-8 flex items-center justify-center transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-b border-[#834328] font-medium text-[#834328]'
                          : 'text-[#8C6D5D] hover:text-[#834328]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => (p >= totalPages ? 1 : p + 1));
                    window.scrollTo({ top: 240, behavior: 'smooth' });
                  }}
                  aria-label="Next page"
                  className="p-1 text-[#834328] hover:text-[#5C2D18] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </section>

            {/* Verified Family Reviews Carousel Section */}
            <div ref={reviewsSectionRef}>
              <ReviewsSection
                reviews={reviews}
                totalReviewsCount={totalReviewsCount}
                products={products}
                onSubmitReview={handleSubmitReview}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer (#834328 warm brown) */}
      <footer className="bg-[#834328] text-[#F7EFE8] pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Social Icons Row */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <a
              href="#facebook"
              onClick={(e) => {
                e.preventDefault();
                setActivePolicyModal('Connect with Sahasra Jewels');
              }}
              aria-label="Facebook"
              className="text-white hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  d="M18 10.049C18 5.603 14.419 2 10 2s-8 3.603-8 8.049C2 14.067 4.925 17.396 8.75 18v-5.624H6.719v-2.328h2.03V8.275c0-2.017 1.195-3.132 3.023-3.132.874 0 1.79.158 1.79.158v1.98h-1.009c-.994 0-1.303.621-1.303 1.258v1.51h2.219l-.355 2.326H11.25V18c3.825-.604 6.75-3.933 6.75-7.951"
                />
              </svg>
            </a>

            <a
              href="#instagram"
              onClick={(e) => {
                e.preventDefault();
                setActivePolicyModal('Connect with Sahasra Jewels');
              }}
              aria-label="Instagram"
              className="text-white hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M13.23 3.492c-.84-.037-1.096-.046-3.23-.046-2.144 0-2.39.01-3.238.055-.776.027-1.195.164-1.487.273a2.4 2.4 0 0 0-.912.593 2.5 2.5 0 0 0-.602.922c-.11.282-.238.702-.274 1.486-.046.84-.046 1.095-.046 3.23s.01 2.39.046 3.229c.004.51.097 1.016.274 1.495.145.365.319.639.602.913.282.282.538.456.92.602.474.176.974.268 1.479.273.848.046 1.103.046 3.238.046s2.39-.01 3.23-.046c.784-.036 1.203-.164 1.486-.273.374-.146.648-.329.921-.602.283-.283.447-.548.602-.922.177-.476.27-.979.274-1.486.037-.84.046-1.095.046-3.23s-.01-2.39-.055-3.229c-.027-.784-.164-1.204-.274-1.495a2.4 2.4 0 0 0-.593-.913 2.6 2.6 0 0 0-.92-.602c-.284-.11-.703-.237-1.488-.273ZM6.697 2.05c.857-.036 1.131-.045 3.302-.045a63 63 0 0 1 3.302.045c.664.014 1.321.14 1.943.374a4 4 0 0 1 1.414.922c.41.397.728.88.93 1.414.23.622.354 1.279.365 1.942C18 7.56 18 7.824 18 10.005c0 2.17-.01 2.444-.046 3.292-.036.858-.173 1.442-.374 1.943-.2.53-.474.976-.92 1.423a3.9 3.9 0 0 1-1.415.922c-.51.191-1.095.337-1.943.374-.857.036-1.122.045-3.302.045-2.171 0-2.445-.009-3.302-.055-.849-.027-1.432-.164-1.943-.364a4.15 4.15 0 0 1-1.414-.922 4.1 4.1 0 0 1-.93-1.423c-.183-.51-.329-1.085-.365-1.943C2.009 12.45 2 12.167 2 10.004c0-2.161 0-2.435.055-3.302.027-.848.164-1.432.365-1.942a4.4 4.4 0 0 1 .92-1.414 4.2 4.2 0 0 1 1.415-.93c.51-.183 1.094-.33 1.943-.366Zm.427 4.806a4.105 4.105 0 1 1 5.805 5.805 4.105 4.105 0 0 1-5.805-5.805m1.882 5.371a2.668 2.668 0 1 0 2.042-4.93 2.668 2.668 0 0 0-2.042 4.93m5.922-5.942a.958.958 0 1 1-1.355-1.355.958.958 0 0 1 1.355 1.355"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <a
              href="#youtube"
              onClick={(e) => {
                e.preventDefault();
                setActivePolicyModal('Connect with Sahasra Jewels');
              }}
              aria-label="YouTube"
              className="text-white hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  d="M18.16 5.87c.34 1.309.34 4.08.34 4.08s0 2.771-.34 4.08a2.13 2.13 0 0 1-1.53 1.53c-1.309.34-6.63.34-6.63.34s-5.321 0-6.63-.34a2.13 2.13 0 0 1-1.53-1.53c-.34-1.309-.34-4.08-.34-4.08s0-2.771.34-4.08a2.17 2.17 0 0 1 1.53-1.53C4.679 4 10 4 10 4s5.321 0 6.63.34a2.17 2.17 0 0 1 1.53 1.53M8.3 12.5l4.42-2.55L8.3 7.4z"
                />
              </svg>
            </a>

            <a
              href="#pinterest"
              onClick={(e) => {
                e.preventDefault();
                setActivePolicyModal('Connect with Sahasra Jewels');
              }}
              aria-label="Pinterest"
              className="text-white hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  d="M10 2.01a8.1 8.1 0 0 1 5.666 2.353 8.09 8.09 0 0 1 1.277 9.68A7.95 7.95 0 0 1 10 18.04a8.2 8.2 0 0 1-2.276-.307c.403-.653.672-1.24.816-1.729l.567-2.2c.134.27.393.5.768.702.384.192.768.297 1.19.297q1.254 0 2.248-.72a4.7 4.7 0 0 0 1.537-1.969c.37-.89.554-1.848.537-2.813 0-1.249-.48-2.315-1.43-3.227a5.06 5.06 0 0 0-3.65-1.374c-.893 0-1.729.154-2.478.461a5.02 5.02 0 0 0-3.236 4.552c0 .72.134 1.355.413 1.902.269.538.672.922 1.22 1.152.096.039.182.039.25 0 .066-.028.114-.096.143-.192l.173-.653c.048-.144.02-.288-.105-.432a2.26 2.26 0 0 1-.548-1.565 3.803 3.803 0 0 1 3.976-3.861c1.047 0 1.863.288 2.44.855.585.576.883 1.315.883 2.228a6.8 6.8 0 0 1-.317 2.122 3.8 3.8 0 0 1-.893 1.556c-.384.384-.836.576-1.345.576-.413 0-.749-.144-1.018-.451-.259-.307-.345-.672-.25-1.085q.22-.77.452-1.537l.173-.701c.057-.25.086-.451.086-.624 0-.346-.096-.634-.269-.855-.192-.22-.451-.336-.797-.336-.432 0-.797.192-1.085.595-.288.394-.442.893-.442 1.499.005.374.063.746.173 1.104l.058.144c-.576 2.478-.913 3.938-1.037 4.36-.116.528-.154 1.153-.125 1.863A8.07 8.07 0 0 1 2 10.03c0-2.208.778-4.11 2.343-5.666A7.72 7.72 0 0 1 10 2.001z"
                />
              </svg>
            </a>
          </div>

          <div className="w-full border-t border-white/15 pt-6 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
              <span className="px-2.5 py-1 rounded-xs bg-[#0071CE] text-white text-[10px] font-bold tracking-tight">
                AMEX
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-white text-black text-[10px] font-bold tracking-tight">
                 Pay
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-white text-[#3086C8] text-[10px] font-bold tracking-tight">
                Diners
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-white text-[#F48120] text-[10px] font-bold tracking-tight">
                DISCOVER
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-white text-[#006EBC] text-[10px] font-bold tracking-tight">
                JCB
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-[#232323] text-[#F79E1B] text-[10px] font-bold tracking-tight">
                Mastercard
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-[#142FBD] text-white text-[10px] font-bold tracking-tight">
                VISA
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-[#EEDCC8]/90 text-center">
              <span>© 2026, sahasrajewels</span>
              {(
                [
                  'Refund policy',
                  'Privacy policy',
                  'Terms of service',
                  'Shipping policy',
                  'Contact information'
                ] as const
              ).map((policy) => (
                <React.Fragment key={policy}>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setActivePolicyModal(policy)}
                    className="hover:text-white hover:underline cursor-pointer"
                  >
                    {policy}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Chat Widget */}
      <button
        type="button"
        onClick={() => setActivePolicyModal('WhatsApp Concierge — +91 70255 88899')}
        aria-label="Open WhatsApp chat"
        className="fixed bottom-5 right-5 z-30 w-13 h-13 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="w-13 h-13">
          <defs>
            <linearGradient
              id="wa-grad"
              x1="85.915"
              x2="86.535"
              y1="32.567"
              y2="137.092"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#57d163" />
              <stop offset="1" stopColor="#23b33a" />
            </linearGradient>
          </defs>
          <path
            fill="#fff"
            d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
          />
          <path
            fill="url(#wa-grad)"
            d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
          />
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
          />
        </svg>
      </button>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Store Policy & Contact Modal */}
      {activePolicyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E6DFD3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD3]">
              <h3 className="font-serif-display text-2xl font-semibold text-[#834328]">
                {activePolicyModal}
              </h3>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="text-[#6E5A4F] hover:text-[#231812] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-xs text-[#4A3B32] leading-relaxed">
              Every Sahasra handloom saree and temple jewellery piece is carefully inspected prior to dispatch. All domestic orders include complimentary insured shipping within 6–10 business days (or 2–4 business days with Express Shipping). Unused items with intact tags are eligible for exchange or return within 7 days of delivery.
            </p>
            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="mt-5 w-full py-2.5 bg-[#834328] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
