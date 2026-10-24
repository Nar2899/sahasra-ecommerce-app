export type ProductCategory =
  | 'kasavu-sarees'
  | 'gift-hampers'
  | 'temple-jewellery'
  | 'chokers-bangles'
  | 'accessories-crafts';

export interface ProductVariantOption {
  name: string;
  values: string[];
}

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  handle: string;
  category: ProductCategory;
  subCategory?: string;
  categoryLabel: string;
  craftType: string;
  salePrice: number;
  regularPrice: number;
  inStock: boolean;
  availableStock: number;
  reservedStock: number;
  version: number;
  badge?: 'Sale' | 'Sold out' | 'Limited Run';
  primaryImage: string;
  secondaryImage: string;
  accentColor: string;
  borderHue: string;
  description: string;
  specifications: string[];
  variants: ProductVariantOption[];
  rating: number;
  reviewCount: number;
}

export interface CustomerReview {
  id: string;
  reviewerName: string;
  verifiedBuyer: boolean;
  rating: number;
  title: string;
  body: string;
  productTitle: string;
  productImage: string;
  date: string;
}

export interface OrderItemPayload {
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  selectedVariants: Record<string, string>;
  primaryImage: string;
}

export interface OrderRecord {
  orderId: string;
  idempotencyKey: string;
  stripePaymentIntentId: string;
  stripeClientSecret: string;
  paymentMethod: 'stripe_card' | 'cashfree' | 'razorpay' | 'upi_instant' | 'cod';
  paymentStatus: 'SUCCEEDED' | 'COD_VERIFIED';
  orderStatus: 'CONFIRMED_PREPARING_DISPATCH';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItemPayload[];
  subtotalInr: number;
  discountInr: number;
  shippingInr: number;
  tipInr?: number;
  taxInr: number;
  totalInr: number;
  specialInstructions?: string;
  createdAt: string;
  concurrencyProof: {
    skuVersionsCommitted: Record<string, number>;
    lockAcquisitionMs: number;
  };
}

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: '3868001',
    sku: 'SHS-JWL-JDK-00',
    title: '3868 - Premium Ruby Pink Jadau Kemp Pearl Necklace with Earrings',
    handle: '3868-premium-ruby-pink-jadau-kemp-pearl-necklace-with-earrings',
    category: 'temple-jewellery',
    subCategory: 'Necklaces',
    categoryLabel: 'Jadau Kemp Necklace',
    craftType: '22K Gold Plated Jadau Kemp',
    salePrice: 6999,
    regularPrice: 8999,
    inStock: true,
    availableStock: 12,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A8163copy_500x500.jpg?v=1719861797',
    secondaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A4861copy_500x500.jpg?v=1740125782',
    accentColor: '#8B1E3F',
    borderHue: '#D4AF37',
    description:
      'Handcrafted heirloom-grade Jadau Kemp bridal collar necklace studded with cabochon ruby-pink stones, emerald teardrops, and cascading South Sea pearl clusters, complete with matching jhumka earrings.',
    specifications: [
      'Craftsmanship: Hand-set Jadau Kemp Ruby & Emerald stones with pearl guttapusalu drops',
      'Finish: 22K Antique Gold Micro-Plating over artisan copper-brass alloy',
      'Includes: 1 Bridal Kemp Necklace + 1 Pair of Matching Pearl Drop Earrings'
    ],
    variants: [
      { name: 'Back Closure', values: ['Adjustable Silk Dori', 'Gold Plated Back Chain'] }
    ],
    rating: 5.0,
    reviewCount: 168
  },
  {
    id: '10538568843563',
    sku: 'SHS-CMB-GRN-01',
    title: 'Green Onam Combo - Saree, Necklace with earrings, Bangle Set of 8',
    handle: 'orange-onam-combo-saree-bangle-set-of-12-copy',
    category: 'kasavu-sarees',
    subCategory: 'Combos',
    categoryLabel: 'Festive Combo',
    craftType: 'Kasavu Cotton & Lotus Kemp',
    salePrice: 2799,
    regularPrice: 4899,
    inStock: true,
    availableStock: 14,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1765copy_bab79269-8294-485b-b83f-ac53b0616b32.jpg?v=1786959275&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1775copy.jpg?v=1786959275&width=720',
    accentColor: '#1B4D3E',
    borderHue: '#D4AF37',
    description:
      'A signature festive ensemble pairing a handloom off-white Kerala Kasavu saree featuring an emerald green and gold zari border with an artisan lotus motif antique necklace, matching jhumkas, and an 8-piece glass & gold-plated bangle stack.',
    specifications: [
      'Saree Length: 6.25 Meters (including 0.8m unstitched running blouse)',
      'Weave: Chendamangalam Handloom Cotton with 3-inch Golden Zari & Emerald Kara',
      'Jewellery: Matte Gold-Plated Lotus Choker with matching earrings',
      'Bangles: Set of 8 emerald silk-thread & golden nakshi bangles'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 4.9,
    reviewCount: 128
  },
  {
    id: '10538568089899',
    sku: 'SHS-HMP-SLV-02',
    title: 'Onam Silver Gift Hamper - Saree, Bangle set, Necklace with Earring, Jasmine & Perfume',
    handle: 'onam-gift-hamper-saree-bangle-set-necklace-with-earring-jasmine-copy-1',
    category: 'gift-hampers',
    subCategory: 'Gift Hampers',
    categoryLabel: 'Luxury Gift Hamper',
    craftType: 'Kasavu Weave & Oxidised Silver',
    salePrice: 5999,
    regularPrice: 7899,
    inStock: true,
    availableStock: 8,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1706copy.jpg?v=1786959103&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1724copy_b60b0c9f-394f-4c14-a908-b1fbf8295f2b.jpg?v=1786959102&width=720',
    accentColor: '#2C3E50',
    borderHue: '#C0C0C0',
    description:
      'Presented in a royal keepsake hamper box, this curated gift set brings together a handwoven olive-and-gold Kasavu saree, a statement oxidised silver floral choker with matching studs, coordinating green-and-silver bangles, handcrafted forever jasmine buds, and an artisanal Madurai Mogra attar perfume.',
    specifications: [
      'Box Contents: 1 Handloom Saree, 1 Oxidised Necklace + Earrings, 12 Bangles, Forever Jasmine Garland, 30ml Eau de Parfum',
      'Saree Fabric: 100% Combed Kerala Cotton with olive-green & silver-gold zari border',
      'Packaging: Rigid magnetic-closure royal blue gift box'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 5.0,
    reviewCount: 94
  },
  {
    id: '10538544857387',
    sku: 'SHS-CMB-ORG-03',
    title: 'Orange Onam Combo - Saree & Bangle Set of 12',
    handle: 'red-onam-combo-saree-necklace-jhumka-bangle-set-of-16-copy',
    category: 'kasavu-sarees',
    subCategory: 'Combos',
    categoryLabel: 'Festive Combo',
    craftType: 'Kasavu Cotton & Glass Bangles',
    salePrice: 2899,
    regularPrice: 4899,
    inStock: true,
    availableStock: 19,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1779_copy.jpg?v=1787117648&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1787copy_56788053-982b-482b-b333-6698e482ec50.jpg?v=1786958536&width=720',
    accentColor: '#C85A17',
    borderHue: '#D4AF37',
    description:
      'Vibrant tangerine-orange and antique gold zari stripes elevate this classic off-white Kerala cotton saree, paired with a curated 12-piece stack of translucent Firozabad glass and gold-beaded kadas.',
    specifications: [
      'Saree Length: 6.25 Meters with unstitched running blouse piece',
      'Border: Dual-tone Tangerine & Kasavu Gold Zari checks',
      'Bangle Set: 12 coordinated glass and antique gold-plated bangles'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 4.8,
    reviewCount: 67
  },
  {
    id: '10538487218475',
    sku: 'SHS-HMP-BLU-04',
    title: 'Onam Blue Gift Hamper - Saree, Bangle set, Necklace with Earring, Jasmine & Chocolates',
    handle: 'onam-gift-hamper-saree-bangle-set-necklace-with-earring-jasmine-copy',
    category: 'gift-hampers',
    subCategory: 'Gift Hampers',
    categoryLabel: 'Luxury Gift Hamper',
    craftType: 'Kasavu Weave & Antique Gold',
    salePrice: 3999,
    regularPrice: 6999,
    inStock: false,
    availableStock: 0,
    reservedStock: 0,
    version: 4,
    badge: 'Sold out',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1692copy.jpg?v=1786950782&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1704copy.jpg?v=1786950782&width=720',
    accentColor: '#1E3A5F',
    borderHue: '#D4AF37',
    description:
      'Our bestselling festive celebration box featuring a classic golden Kasavu saree, antique coin palakka necklace with matching studs, velvet-finish bangles, jasmine veni, and gourmet celebratory chocolates.',
    specifications: [
      'Box Contents: Kasavu Saree, Antique Coin Necklace Set, Bangle Stack, Jasmine Veni, Assorted Chocolates',
      'Craftsmanship: Handwoven pure cotton body with tested gold zari pallu'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 4.9,
    reviewCount: 142
  },
  {
    id: '10538482368811',
    sku: 'SHS-HMP-PNK-05',
    title: 'Onam Pink Gift Hamper - Saree, Bangle set, Necklace with Earring & Jasmine',
    handle: 'onam-gift-hamper-saree-bangle-set-necklace-with-earring-jasmine',
    category: 'gift-hampers',
    subCategory: 'Gift Hampers',
    categoryLabel: 'Luxury Gift Hamper',
    craftType: 'Kasavu Weave & Ruby Kemp',
    salePrice: 4199,
    regularPrice: 7899,
    inStock: false,
    availableStock: 0,
    reservedStock: 0,
    version: 3,
    badge: 'Sold out',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1670copy.jpg?v=1786950144&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/7F4A1680copy_4558dd64-288d-4de7-8137-c446e31fd938.jpg?v=1786950144&width=720',
    accentColor: '#9E2A5B',
    borderHue: '#D4AF37',
    description:
      'Dressed in a blush-pink keepsake box, this bridal-grade hamper pairs a pure Kasavu saree with a ruby-pink silk thread and stone bangle stack, temple kemp necklace, and handcrafted jasmine garland.',
    specifications: [
      'Box Contents: Pure Kasavu Saree, Ruby Kemp Necklace + Jhumkas, 24-pc Bridal Bangle Set, Jasmine Garland',
      'Finish: Tarnish-resistant 22K antique gold micro-plating'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 4.9,
    reviewCount: 115
  },
  {
    id: '10537699115307',
    sku: 'SHS-SRE-RED-06',
    title: 'Kerala Kasavu Cotton Saree with Chilli Red Border | Onam Saree',
    handle: 'kerala-kasavu-cotton-saree-with-strawberry-red-border-onam-saree',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Kasavu Saree',
    craftType: 'Balaramapuram Handloom',
    salePrice: 999,
    regularPrice: 1999,
    inStock: false,
    availableStock: 0,
    reservedStock: 0,
    version: 6,
    badge: 'Sold out',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/3_25e07c6f-18b6-402a-bb5d-600a761805ae.jpg?v=1752516134&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/1_7e62f895-b54f-4ec5-a3c4-07eafba96fbd.jpg?v=1752515148&width=720',
    accentColor: '#A61C1C',
    borderHue: '#D4AF37',
    description:
      'Woven on traditional pit looms in Balaramapuram, this breathable unbleached off-white cotton saree features a striking chilli-red puliyilakara border accented with fine golden kasavu lines.',
    specifications: [
      'Material: 100% Pure Unbleached Kerala Handloom Cotton (80s count)',
      'Saree Length: 6.25 Meters (includes 0.80m running blouse piece)'
    ],
    variants: [
      { name: 'Drape Style', values: ['6.25m Standard with Blouse'] }
    ],
    rating: 4.8,
    reviewCount: 204
  },
  {
    id: '10537697444139',
    sku: 'SHS-SRE-GLD-07',
    title: 'Off-White Golden Leaf Tissue Kerala Saree | Onam Saree',
    handle: 'swarna-rekha-gold-tissue-kasavu-saree-with-subtle-grid-weave-onam-saree-copy',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Tissue Kasavu Saree',
    craftType: 'Swarna Rekha Zari Tissue',
    salePrice: 1699,
    regularPrice: 2899,
    inStock: true,
    availableStock: 22,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/8_e0e28f48-27ab-4b5c-8b89-12f54cfdc8fd.jpg?v=1786893630&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/9_32a26c08-aeb2-4e0c-a6b5-f1ff04d9f13f.jpg?v=1786893630&width=720',
    accentColor: '#9A7B2C',
    borderHue: '#D4AF37',
    description:
      'Luminous Swarna Rekha golden tissue weave meets intricate botanical leaf jacquard on the pallu and border, finished with hand-knotted zari kuchu tassels for effortless heirloom grace.',
    specifications: [
      'Weave: Fine Cotton-Silk Golden Tissue blend with botanical zari motifs',
      'Pallu: Rich woven golden leaf brocade with hand-twisted tassels',
      'Length: 6.25 Meters with matching tissue-border blouse fabric'
    ],
    variants: [
      { name: 'Tassel Finish', values: ['Hand-Knotted Zari Kuchu', 'Classic Hemmed Edge'] }
    ],
    rating: 4.9,
    reviewCount: 176
  },
  {
    id: '10537695707435',
    sku: 'SHS-SRE-BLK-08',
    title: 'Off-White Black Kerala Cotton Saree | Onam Saree',
    handle: 'off-white-black-kerala-cotton-saree-onam-saree',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Kasavu Saree',
    craftType: 'Temple Border Handloom',
    salePrice: 1899,
    regularPrice: 2999,
    inStock: true,
    availableStock: 16,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/1_88e6d352-2447-4d60-bed1-95837a7436ab.jpg?v=1786892647&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/2_227d2531-176d-496b-bf9e-b4beb48e19b1.jpg?v=1786892646&width=720',
    accentColor: '#1C1917',
    borderHue: '#D4AF37',
    description:
      'Architectural jet-black temple spires (Gopuram motifs) contrast against warm ivory handloom cotton and a burnished kasavu gold stripe—ideal for pairing with oxidised silver or antique gold jewellery.',
    specifications: [
      'Material: 100% Kuthampully Combed Cotton with Temple border',
      'Length: 6.25 Meters with contrast black-and-gold border blouse piece'
    ],
    variants: [
      { name: 'Drape Style', values: ['6.25m Standard with Blouse', 'Fall & Pico Completed'] }
    ],
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: '10537693774123',
    sku: 'SHS-SRE-EMR-09',
    title: 'Off-White Emerald Green Kerala Cotton Saree | Onam Saree',
    handle: 'onam-saree',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Kasavu Saree',
    craftType: 'Kuthampully Temple Weave',
    salePrice: 1899,
    regularPrice: 2999,
    inStock: true,
    availableStock: 11,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/12_0c566b46-eb82-4ce3-8815-535bc0f2be1b.jpg?v=1786891602&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/13_a7f65f81-bd89-4400-a95b-e69680125863.jpg?v=1786891602&width=720',
    accentColor: '#0F523A',
    borderHue: '#D4AF37',
    description:
      'Deep emerald-green temple motifs woven along a lustrous golden kasavu border give this Kuthampully cotton saree regal depth and featherlight all-day comfort.',
    specifications: [
      'Weave: Kuthampully Handloom with Emerald Temple Spire & Zari Kara',
      'Length: 6.25 Meters (with 0.80m running blouse piece)'
    ],
    variants: [
      { name: 'Drape Style', values: ['6.25m Standard with Blouse', 'Fall & Pico Completed'] }
    ],
    rating: 4.8,
    reviewCount: 112
  },
  {
    id: '10537685844267',
    sku: 'SHS-SRE-OLV-10',
    title: 'Off-White Olive Green & Black Kerala Cotton Saree | Onam Saree',
    handle: 'kerala-kasavu-cotton-saree-with-navy-blue-border-onam-saree-copy',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Kasavu Saree',
    craftType: 'Dual-Kara Handloom',
    salePrice: 999,
    regularPrice: 1799,
    inStock: true,
    availableStock: 25,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/1_c879af0a-a3c2-4d2b-b6c8-076d7564919a.jpg?v=1786891205&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/2_9ab5065e-15b0-480e-a5a1-6fe57639eb05.jpg?v=1786891206&width=720',
    accentColor: '#4A5D23',
    borderHue: '#1C1917',
    description:
      'Earthy olive-green and charcoal-black bands frame a subtle golden zari thread in this contemporary minimalist Kerala cotton drape.',
    specifications: [
      'Material: Pure Handloom Cotton with dual olive & black kara border',
      'Length: 6.25 Meters including running blouse fabric'
    ],
    variants: [
      { name: 'Drape Style', values: ['6.25m Standard with Blouse'] }
    ],
    rating: 4.7,
    reviewCount: 73
  },
  {
    id: '10536772239659',
    sku: 'SHS-SRE-NVY-11',
    title: 'Kerala Kasavu Cotton Saree with Navy Blue Border | Onam Saree',
    handle: 'kerala-kasavu-cotton-saree-with-navy-blue-border-onam-saree',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Kasavu Saree',
    craftType: 'Classic Kara Weave',
    salePrice: 1199,
    regularPrice: 1999,
    inStock: false,
    availableStock: 0,
    reservedStock: 0,
    version: 5,
    badge: 'Sold out',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/64.jpg?v=1751651647&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/65.jpg?v=1752516134&width=720',
    accentColor: '#1B2A4A',
    borderHue: '#D4AF37',
    description:
      'Midnight navy blue meets burnished gold kasavu in a timeless, crisp cotton drape crafted by master weavers in Thrissur.',
    specifications: [
      'Material: 100% Mercerized Kerala Cotton with Navy & Gold Zari Border',
      'Length: 6.25 Meters with unstitched blouse piece'
    ],
    variants: [
      { name: 'Drape Style', values: ['6.25m Standard with Blouse'] }
    ],
    rating: 4.8,
    reviewCount: 64
  },
  {
    id: '10536770666795',
    sku: 'SHS-SRE-KLM-12',
    title: 'Kalamkari Krishna with Venna Kerala Cotton Saree | Onam Saree',
    handle: 'radha-krishna-mural-kasavu-saree-with-rose-gold-kara-onam-saree-copy',
    category: 'kasavu-sarees',
    subCategory: 'Sarees',
    categoryLabel: 'Mural Art Saree',
    craftType: 'Kalamkari & Kasavu',
    salePrice: 1999,
    regularPrice: 2899,
    inStock: true,
    availableStock: 9,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://www.sulliejewels.com/cdn/shop/files/1_ce687e52-4a71-4b21-a488-e7a747f0e088.jpg?v=1786858492&width=720',
    secondaryImage: 'https://www.sulliejewels.com/cdn/shop/files/2_bfb2b77f-f8aa-4344-a55f-fbc589009e77.jpg?v=1786858492&width=720',
    accentColor: '#2B2D42',
    borderHue: '#D4AF37',
    description:
      'Featuring intricate monochrome Kalamkari Krishna mural artistry across the pallu and a bold black-and-gold kasavu border, this collector saree bridges temple mural heritage and artisanal textile craft.',
    specifications: [
      'Artistry: Fine Kalamkari Krishna mural motif on pallu & blouse sleeve border',
      'Body: Unbleached Kerala Cotton with Black & Gold Zari border',
      'Length: 6.25 Meters (includes matching Kalamkari blouse piece)'
    ],
    variants: [
      { name: 'Blouse Option', values: ['Matching Kalamkari Running Blouse'] }
    ],
    rating: 5.0,
    reviewCount: 153
  },
  {
    id: '7063001',
    sku: 'SHS-JWL-HRM-13',
    title: '7063 - Gold Premium Stone & Pearl Goddess Long Chain / Haram with Earring',
    handle: 'gold-premium-stone-pearl-goddess-long-chain-haram-earring',
    category: 'temple-jewellery',
    subCategory: 'Long Chains / Haarams',
    categoryLabel: 'Temple Haram',
    craftType: '22K Antique Nakshi',
    salePrice: 3499,
    regularPrice: 5299,
    inStock: true,
    availableStock: 7,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A4967copy_500x500.jpg?v=1772788617',
    secondaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A4861copy_500x500.jpg?v=1740125782',
    accentColor: '#8B6508',
    borderHue: '#D4AF37',
    description:
      'Sculpted in high-relief South Indian temple nakshi work, this Goddess Lakshmi long haram is hand-set with ruby-pink and emerald kemp stones, framed by freshwater pearl clusters and matching temple jhumkas.',
    specifications: [
      'Base Metal: Copper-Brass Alloy with 22K Antique Matte Gold Micro-Plating',
      'Stones: Hand-cut Kemp Ruby, Emerald & South Sea shell pearl drops',
      'Includes: 1 Long Haram Necklace + 1 Pair of Matching Temple Jhumkas'
    ],
    variants: [
      { name: 'Back Closure', values: ['Adjustable Silk Dori', 'Antique Gold Back Chain'] }
    ],
    rating: 5.0,
    reviewCount: 184
  },
  {
    id: '6656002',
    sku: 'SHS-JWL-MNG-14',
    title: 'Mango Necklace / Maanga Maala with Matching Kemp Studs',
    handle: 'mango-necklace-maanga-maala-with-studs',
    category: 'temple-jewellery',
    subCategory: 'Necklaces',
    categoryLabel: 'Temple Necklace',
    craftType: 'Kemp & Gold Filigree',
    salePrice: 2499,
    regularPrice: 3899,
    inStock: true,
    availableStock: 12,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A6656copy_500x500.jpg?v=1753180877',
    secondaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A6011copy_500x500.jpg?v=1729763000',
    accentColor: '#7A2021',
    borderHue: '#D4AF37',
    description:
      'An iconic South Indian Maanga Maala crafted with interlocking paisley mango motifs studded with cabochon ruby stones and edged with delicate golden guttapusalu beads.',
    specifications: [
      'Finish: Heritage 22K Gold Polish over artisan brass',
      'Earrings: Push-back matching mango kemp studs included'
    ],
    variants: [
      { name: 'Stone Accent', values: ['Ruby & Emerald Kemp', 'Full Ruby Kemp'] }
    ],
    rating: 5.0,
    reviewCount: 231
  },
  {
    id: '9063004',
    sku: 'SHS-JWL-KDA-16',
    title: '985 - Venkateshwara & Lakshmi Kada Premium Temple Bangle',
    handle: 'venkateshwara-lakshmi-kada-premium-bangle',
    category: 'chokers-bangles',
    subCategory: 'Bangles',
    categoryLabel: 'Temple Kada Bangle',
    craftType: 'Screw-Clasp Nakshi Kada',
    salePrice: 1499,
    regularPrice: 2499,
    inStock: true,
    availableStock: 8,
    reservedStock: 0,
    version: 1,
    badge: 'Sale',
    primaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A9063_copy_500x500.jpg?v=1750187066',
    secondaryImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/DSC09626copy_500x500.jpg?v=1764755830',
    accentColor: '#834328',
    borderHue: '#D4AF37',
    description:
      'Intricately carved temple kada bangle featuring sacred Venkateshwara and Goddess Lakshmi reliefs, studded with ruby and emerald cabochons and equipped with a hidden hinge screw clasp.',
    specifications: [
      'Mechanism: Openable side-screw clasp fits multiple wrist profiles comfortably',
      'Carving: 360-degree deep relief temple architecture & deity motifs'
    ],
    variants: [
      { name: 'Bangle Size', values: ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'] }
    ],
    rating: 5.0,
    reviewCount: 98
  }
];

export const VERIFIED_REVIEWS: CustomerReview[] = [
  {
    id: '047db35e-a7e2-468a-8746-8c7f52597f23',
    reviewerName: 'Sahithi Saragadam',
    verifiedBuyer: true,
    rating: 5,
    title: 'Beautiful Design & Excellent Quality',
    body: 'Absolutely loved this Mango Necklace / Maanga Maala set! The design is elegant and looks just like the pictures. The quality is excellent, with a beautiful finish and comfortable fit. The matching studs complete the look perfectly. It looks premium and is perfect for weddings, festivals, and traditional occasions. Highly recommended!',
    productTitle: 'Mango Necklace / Maanga Maala with Studs',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A6656copy_500x500.jpg?v=1753180877',
    date: '07/25/2026'
  },
  {
    id: '567b5368-b87f-47c8-b6d2-67068092ed98',
    reviewerName: 'ALEYAMMA ALIAS',
    verifiedBuyer: true,
    rating: 5,
    title: 'Exlent product i am very happy with the quality',
    body: 'Exlent product i am very happy with the quality, highly recommend',
    productTitle: 'Matt Gold Back Chain',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/Backchain_500x500.jpg?v=1690190669',
    date: '07/27/2026'
  },
  {
    id: '20eb3f82-60b3-4bf3-b0ac-af5dea82e175',
    reviewerName: 'Fanaaz',
    verifiedBuyer: true,
    rating: 5,
    title: 'Really wonderful jewellery',
    body: 'Really wonderful jewellery... worth for money... Nice finished... And well packed... I am happy with it.',
    productTitle: '2128 - Premium Floral Gold Choker with Earring',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A1778copy_500x500.jpg?v=1777291310',
    date: '07/23/2026'
  },
  {
    id: 'f9b58364-ae9c-4317-8b94-ffeb46ae5b7e',
    reviewerName: 'Navneet Jaglan',
    verifiedBuyer: true,
    rating: 5,
    title: 'Bangle is very nice',
    body: 'Bangle is very nice .....as shown in picture as it is same',
    productTitle: '985 - Venkateshwara & Lakshmi Kada Premium Bangle',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A9063_copy_500x500.jpg?v=1750187066',
    date: '07/29/2026'
  },
  {
    id: '42baf5a9-7690-4b7f-9c56-19997c7a44aa',
    reviewerName: 'Madhura Aithal',
    verifiedBuyer: true,
    rating: 5,
    title: 'The necklace is really beautiful',
    body: 'The necklace is really beautiful.',
    productTitle: 'Pearl Cluster Premium Necklace with Earring',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A8163copy_500x500.jpg?v=1719861797',
    date: '07/29/2026'
  },
  {
    id: '2a7d6380-675a-4a63-9724-62e853d49a14',
    reviewerName: 'Kajal Raj',
    verifiedBuyer: true,
    rating: 5,
    title: 'Amazing Jwellery 😍',
    body: 'Such a beautiful jwellery',
    productTitle: '7063 - Gold Premium Stone & Pearl Goddess Long Chain / Haram',
    productImage: 'https://cdn.shopify.com/s/files/1/0782/6971/0635/files/7F4A4967copy_500x500.jpg?v=1772788617',
    date: '07/20/2026'
  }
];
