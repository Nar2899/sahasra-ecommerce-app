import React, { useState } from 'react';
import type { ProductItem } from '../data/catalog';

interface ProductVisualCanvasProps {
  product: ProductItem;
  showSecondary?: boolean;
  className?: string;
}

export const ProductVisualCanvas: React.FC<ProductVisualCanvasProps> = ({
  product,
  showSecondary = false,
  className = ''
}) => {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);

  const activeUrl = showSecondary && !secondaryFailed ? product.secondaryImage : product.primaryImage;
  const isFallback = (showSecondary && secondaryFailed && primaryFailed) || (!showSecondary && primaryFailed);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#F4EFE6] select-none ${className}`}
    >
      {!isFallback ? (
        <>
          <img
            src={product.primaryImage}
            alt={product.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setPrimaryFailed(true)}
            className={`w-full h-full object-cover object-center transition-all duration-200 ease-out ${
              showSecondary && !secondaryFailed ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
          {!secondaryFailed && (
            <img
              src={product.secondaryImage}
              alt={`${product.title} alternate view`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setSecondaryFailed(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-200 ease-out ${
                showSecondary ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            />
          )}
        </>
      ) : (
        /* Resilient Luxury Textile & Temple Jewellery Studio SVG Fallback */
        <div
          className="w-full h-full flex flex-col justify-between p-6 relative"
          style={{
            background: `linear-gradient(145deg, #FAF6EE 0%, #EFE6D5 65%, ${product.accentColor}18 100%)`
          }}
        >
          {/* Traditional Kasavu Zari Border Pattern */}
          <div
            className="w-full h-3 flex items-center justify-between border-y"
            style={{
              borderColor: product.borderHue,
              backgroundColor: product.accentColor
            }}
          />

          <div className="my-auto flex flex-col items-center text-center px-3">
            <svg
              viewBox="0 0 120 120"
              className="w-24 h-24 mb-3 opacity-85"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke={product.accentColor}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle
                cx="60"
                cy="60"
                r="36"
                stroke="#B8860B"
                strokeWidth="2"
              />
              <path
                d="M60 20 L70 46 L98 46 L75 62 L84 90 L60 73 L36 90 L45 62 L22 46 L50 46 Z"
                stroke={product.accentColor}
                strokeWidth="1.5"
                fill="#D4AF37"
                fillOpacity="0.2"
              />
              <circle cx="60" cy="60" r="10" fill={product.accentColor} />
            </svg>
            <span className="text-[11px] tracking-widest uppercase text-[#834328] font-medium">
              {product.craftType}
            </span>
            <p className="font-serif-display text-base font-semibold text-[#231812] mt-1 line-clamp-2">
              {product.title}
            </p>
          </div>

          <div
            className="w-full h-4 border-y-2"
            style={{
              borderColor: '#D4AF37',
              backgroundColor: product.accentColor
            }}
          />
        </div>
      )}
    </div>
  );
};
