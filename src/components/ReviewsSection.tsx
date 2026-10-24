import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, PlusCircle, X, Check } from 'lucide-react';
import type { CustomerReview, ProductItem } from '../data/catalog';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  totalReviewsCount: number;
  products: ProductItem[];
  onSubmitReview: (payload: {
    reviewerName: string;
    rating: number;
    title: string;
    body: string;
    productTitle: string;
    productImage: string;
  }) => Promise<void>;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  totalReviewsCount,
  products,
  onSubmitReview
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);

  // Write review form state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const visibleCount = 3;
  const maxStart = Math.max(0, reviews.length - visibleCount);

  const handlePrev = () => {
    setStartIndex((prev) => (prev <= 0 ? maxStart : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= maxStart ? 0 : prev + 1));
  };

  const visibleReviews = reviews.slice(startIndex, startIndex + visibleCount);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const targetProd = products.find((p) => p.id === selectedProductId) || products[0];
      await onSubmitReview({
        reviewerName,
        rating,
        title,
        body,
        productTitle: targetProd?.title || 'Sahasra Handloom Saree',
        productImage: targetProd?.primaryImage || ''
      });
      setReviewerName('');
      setTitle('');
      setBody('');
      setIsWriteOpen(false);
      setStartIndex(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-[#F4EFE6] border-t border-[#E6DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading matching Sullie Jewels reference */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#834328]">
            Let our family speak for us
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#6E5A4F]">
            <div className="flex items-center text-[#834328]" aria-label="4.88 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#834328] text-[#834328]" />
              ))}
            </div>
            <span>·</span>
            <span className="font-mono-tabular">
              from {totalReviewsCount.toLocaleString('en-IN')} verified reviews
            </span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsWriteOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#834328] hover:text-[#5C2D18] underline underline-offset-4 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Write a Verified Buyer Review</span>
            </button>
          </div>
        </div>

        {/* 3-Column Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleReviews.map((rev) => (
            <article
              key={rev.id}
              onClick={() => setSelectedReview(rev)}
              className="bg-white rounded-lg border border-[#E6DFD3] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col cursor-pointer"
            >
              <div className="h-56 w-full bg-[#FAF7F2] overflow-hidden">
                <img
                  src={rev.productImage}
                  alt={rev.productTitle}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between text-center">
                <div>
                  {/* 5 Stars in #834328 */}
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 fill-[#834328] text-[#834328]"
                      />
                    ))}
                  </div>

                  {/* Reviewer Name + Verified text */}
                  <div className="flex items-center justify-center gap-2 text-xs text-[#5C493E] mb-2">
                    <span className="font-semibold uppercase tracking-wide text-[#834328]">
                      {rev.reviewerName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="bg-[#834328] text-white px-2 py-0.5 text-[10px] font-medium rounded-xs">
                      Verified
                    </span>
                  </div>

                  <h3 className="font-serif-display text-lg font-semibold text-[#834328] line-clamp-1">
                    {rev.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#6E5A4F] leading-relaxed line-clamp-3">
                    {rev.body}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F2ECE1] text-[11px] text-[#8C7A6B] flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{rev.productTitle}</span>
                  <span className="font-mono-tabular">{rev.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous reviews"
            className="w-10 h-10 rounded-full border border-[#D8CFC2] bg-white text-[#834328] hover:bg-[#834328] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono-tabular text-[#6E5A4F]">
            Showing {startIndex + 1}–{Math.min(reviews.length, startIndex + visibleCount)} of{' '}
            {reviews.length} featured
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next reviews"
            className="w-10 h-10 rounded-full border border-[#D8CFC2] bg-white text-[#834328] hover:bg-[#834328] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full Review Reader Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden border border-[#E6DFD3] shadow-xl">
            <div className="relative h-60 bg-[#FAF7F2]">
              <img
                src={selectedReview.productImage}
                alt={selectedReview.productTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close review modal"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#231812] flex items-center justify-center hover:bg-[#834328] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: selectedReview.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-[#834328] text-[#834328]" />
                  ))}
                </div>
                <span className="text-xs font-mono-tabular text-[#7A6254]">
                  {selectedReview.date}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#834328] font-semibold mb-3">
                <span>{selectedReview.reviewerName}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-[#1E6B45]">
                  <Check className="w-3.5 h-3.5" /> Verified Buyer
                </span>
              </div>
              <h3 className="font-serif-display text-2xl font-semibold text-[#231812]">
                {selectedReview.title}
              </h3>
              <p className="mt-2 text-sm text-[#4A3B32] leading-relaxed">
                {selectedReview.body}
              </p>
              <div className="mt-5 pt-4 border-t border-[#E6DFD3] text-xs text-[#7A6254]">
                Purchased Item: <strong className="text-[#231812]">{selectedReview.productTitle}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {isWriteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF7F2] rounded-xl max-w-md w-full p-6 border border-[#E6DFD3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD3]">
              <h3 className="font-serif-display text-2xl font-semibold text-[#834328]">
                Share Your Sahasra Experience
              </h3>
              <button
                type="button"
                onClick={() => setIsWriteOpen(false)}
                aria-label="Close write review form"
                className="text-[#6E5A4F] hover:text-[#231812] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#3B2C24] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Meenakshi Nair"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B2C24] mb-1">
                  Product Purchased
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-md"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B2C24] mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= rating
                            ? 'fill-[#834328] text-[#834328]'
                            : 'text-[#D8CFC2]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B2C24] mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Authentic Kasavu weave and fast delivery"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B2C24] mb-1">
                  Your Review
                </label>
                <textarea
                  rows={3}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us about the fabric drape, zari lustre, or jewellery craftsmanship..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC2] rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#834328] hover:bg-[#6B351E] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? 'Submitting Review...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
