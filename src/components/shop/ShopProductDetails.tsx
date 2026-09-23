"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import {
  ArrowBigLeft,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import serverCallFuction, {
  formattedAmount,
  getCurrencyIcon,
} from "@/lib/constantFunction";
import { useCart } from "@/hooks/useCart";
import { AddToCartPayload } from "@/types/cart";

function renderHTML(dirty: string): { __html: string } {
  return {
    __html: DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "strong", "b", "em", "i", "u", "span",
        "ul", "ol", "li",
        "blockquote", "code", "pre",
        "table", "thead", "tbody", "tr", "th", "td",
        "img", "a", "hr",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "style", "class"],
    }),
  };
}

// --- Types ---
interface VariantType {
  id: number;
  sku: string;
  price: number;
  stock: number;
  bv_point: number;
  attr_combinations: Array<{
    attr_id: number;
    attr_value_id: number;
    value: string;
  }>;
}

interface ProductData {
  category?: { id: number; name: string; slug: string };
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    cat_id: number;
    f_image?: string;
    hsn_code?: string;
    mrp_percentage?: number;
    dpc_percentage?: number;
    dpc_price?: number;
    average_rating?: number;
    total_reviews?: number;
    total_stock?: number;
    description?: string;
  };
  variants: VariantType[];
  product_attributes?: Array<{
    id: number;
    name: string;
    values: Array<{ id: number; value: string }>;
  }>;
  tax_data?: { id: number; name: string; percentage: number };
  variant_count?: string;
}

const ShopProductDetails: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const router = useRouter();
  const { addToCart, items: cartItems, totalAmount: cartTotal } = useCart();

  // --- State ---
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<{
    [key: number]: number;
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // --- Fetch product by slug ---
  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await serverCallFuction("GET", "api/products/getDproducts");
      if (res && (res as any).success !== false) {
        const data: ProductData[] = (res as any).data || res;
        const found = data.find((p) => p.product.slug === slug);
        if (found) {
          setProduct(found);
          const defaultAttrs: { [key: number]: number } = {};
          found.product_attributes?.forEach((attr) => {
            if (attr.values.length > 0) {
              defaultAttrs[attr.id] = attr.values[0].id;
            }
          });
          setSelectedAttrs(defaultAttrs);
          setMainImageIndex(0);
        } else {
          setError("Product not found");
        }
      }
    } catch (err: any) {
      console.error("Fetch product error:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // --- Computed values ---
  const variant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0)
      return null;
    const selectedValueIds = Object.values(selectedAttrs).filter(
      (id) => id !== undefined
    );
    const matching = product.variants.find((variant) => {
      const variantValueIds = variant.attr_combinations.map(
        (comb) => Number(comb.attr_value_id)
      );
      return selectedValueIds.every((id) => variantValueIds.includes(Number(id)));
    });
    return matching || null;
  }, [product, selectedAttrs]);

  const basePrice = product?.product.price ?? 0;
  const variantPrice = variant ? Number(variant.price) : 0;
  const dpcPrice = product?.product.dpc_price ?? 0;
  const mrpPercentage = product?.product.mrp_percentage ?? 0;
  const dpcPercentage = product?.product.dpc_percentage ?? 0;
  const mrpPrice =
    basePrice * (1 + mrpPercentage / 100);
  const displayPrice =
    (variant && variantPrice >= 0) ? variantPrice : dpcPrice;
  const stock = variant ? variant.stock : product?.total_stock ?? 0;
  const currency = getCurrencyIcon("INR");
  const discountPercent =
    mrpPrice > displayPrice
      ? ((mrpPrice - displayPrice) / mrpPrice) * 100
      : 0;

  // Image gallery array
  const images = useMemo(() => {
    if (!product) return [];
    const main = product.product.f_image;
    const imgs = main ? [main] : [];
    return imgs;
  }, [product]);

  // --- Handlers ---
  const updateAttr = (attrId: number, valueId: number) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrId]: valueId }));
  };

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stock)));
  };

  const handleQtyInput = (value: string) => {
    if (/^\d*$/.test(value)) {
      const num = parseInt(value) || 1;
      setQuantity(Math.max(1, Math.min(num, stock)));
    }
  };

  

  const handleAddToCart = async () => {
    if (!product || stock <= 0 || addingToCart) return;
    if (hasAttributes && !variant) return;
    setAddingToCart(true);
    setAddedToCart(true);
    try {
      const payload: AddToCartPayload = {
        product_id: product.product.id,
        ...(variant && { variation_id: variant.id }),
        quantity: quantity,
        price: displayPrice,
      };
      const success = await addToCart(payload);
      if (success) {
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setAddedToCart(false);
    } finally {
      setAddingToCart(false);
    }
  };

  // --- Loading & Error states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-error-50 dark:bg-error-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {error || "Product Not Found"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error
              ? error
              : "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/shop")}
              startIcon={<ArrowBigLeft size={16} />}
            >
              Back to Shop
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasAttributes =
    product.product_attributes && product.product_attributes.length > 0;
  const isOutOfStock = stock <= 0;
  const rating = product.product.average_rating ?? 0;
  const totalReviews = product.product.total_reviews ?? 0;

  // --- Star render helper ---
  const renderStars = (value: number) => {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`f${i}`}
            size={16}
            className="fill-brand-500 text-brand-500"
          />
        ))}
        {half && (
          <Star
            size={16}
            className="fill-brand-500/50 text-brand-500"
          />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star
            key={`e${i}`}
            size={16}
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
      </span>
    );
  };

  // --- Breadcrumb items ---
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.product.name },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-gray-400 mx-1">/</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 dark:text-white font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors mb-6"
        >
          <ArrowBigLeft size={18} />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ===== LEFT: Image Gallery ===== */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square">
              {images.length > 0 ? (
                <img
                  src={images[mainImageIndex]}
                  alt={product.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700">
                  <span className="text-5xl mb-2">📦</span>
                  <span className="text-sm">No Image Available</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {discountPercent > 0 && (
                  <Badge variant="solid" color="error" size="sm">
                    {discountPercent.toFixed(0)}% OFF
                  </Badge>
                )}
                {!isOutOfStock && (
                  <Badge variant="solid" color="success" size="sm">
                    In Stock
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="solid" color="error" size="sm">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Wishlist / Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                  title="Add to Wishlist"
                >
                  <Heart size={18} />
                </button>
                <button
                  className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-brand-500 transition-colors"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      mainImageIndex === idx
                        ? "border-brand-500 ring-1 ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT: Product Info ===== */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-2">
              {product.category?.name || "Uncategorized"}
            </span>

            {/* Name */}
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 dark:text-white mb-3 line-clamp-2">
              {product.product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-500">
                {rating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-black text-gray-900 dark:text-white">
                  {currency}
                  {formattedAmount(displayPrice)}
                </span>
                {mrpPrice > displayPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {currency}
                      {formattedAmount(mrpPrice)}
                    </span>
                    <Badge variant="solid" color="success" size="sm">
                      Save {currency}
                      {formattedAmount(mrpPrice - displayPrice)}
                    </Badge>
                  </>
                )}
              </div>
              {dpcPrice > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  DPC Price: {currency}
                  {formattedAmount(dpcPrice)}
                  {dpcPercentage > 0 && ` (${dpcPercentage}% off MRP)`}
                </p>
              )}
            </div>

            {/* HSN Code */}
            {product.product.hsn_code && (
              <div className="mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  HSN Code
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mt-0.5">
                  {product.product.hsn_code}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Availability
              </span>
              <div className="mt-1">
                <Badge
                  variant="solid"
                  color={isOutOfStock ? "error" : "success"}
                  size="sm"
                >
                  {isOutOfStock ? "Out of Stock" : `In Stock`}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {product.product.description && (
              <div className="mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Description
                </span>
                <div
                  className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed"
                  dangerouslySetInnerHTML={renderHTML(product.product.description)}
                />
              </div>
            )}
            

            {/* Attributes / Variants */}
            {hasAttributes && product.product_attributes?.map((attr) => {
              const isSelected = selectedAttrs[attr.id] !== undefined;
              return (
                <div key={attr.id} className="mb-5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    {attr.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => {
                      const valIsSelected = selectedAttrs[attr.id] === val.id;
                      return (
                        <Badge
                          key={val.id}
                          variant={valIsSelected ? "solid" : "light"}
                          color={valIsSelected ? "primary" : "light"}
                          className="cursor-pointer transition-all hover:scale-105 active:scale-95 px-4 py-1.5"
                          onClick={() => updateAttr(attr.id, val.id)}
                        >
                          {val.value}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Selected variant SKU */}
            {variant && (
              <div className="mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Variant
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mt-0.5">
                  SKU: {variant.sku.trim()} &nbsp;|&nbsp; BV Points:{" "}
                  {variant.bv_point}
                </p>
              </div>
            )}

            

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  Quantity
                </span>
                <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={stock}
                    value={quantity}
                    onChange={(e) => handleQtyInput(e.target.value)}
                    className="w-14 h-11 bg-transparent text-center text-sm font-bold text-gray-800 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= stock}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className={`flex-1 h-12 text-base font-bold rounded-xl shadow-lg ${
                    (hasAttributes && !variant) || isOutOfStock
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25"
                  }`}
                  disabled={(hasAttributes && !variant) || isOutOfStock || addingToCart}
                  startIcon={
                    addingToCart ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <ShoppingCart size={18} />
                    )
                  }
                  onClick={handleAddToCart}
                >
                  {addingToCart
                    ? "Adding..."
                    : addedToCart
                    ? "✓ Added to Cart"
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </Button>

                <button
                  className="px-6 h-12 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
                  title="Add to Wishlist"
                >
                  <Heart size={18} />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <Truck size={16} className="text-brand-500 shrink-0" />
                <span>Free Delivery Above ₹700</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <RefreshCw size={16} className="text-brand-500 shrink-0" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <Shield size={16} className="text-brand-500 shrink-0" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Fixed Bottom Cart Summary --- */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-3 left-0 right-0 bg-brand-300 rounded border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-4 py-3 sm:p-4 w-[95%] sm:w-[80%] mx-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Side: Summary Info */}
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <div className="bg-brand-100 dark:bg-gray-900/30 p-2.5 rounded-xl">
                  <ShoppingCart className="text-brand-600" size={24} />
                </div>
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                  {cartItems.length}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-900 font-medium uppercase tracking-wider">Total Amount</p>
                <p className="text-[20px] sm:text-xl font-black text-gray-900 dark:text-gray-900">
                  {getCurrencyIcon('INR')}{formattedAmount(cartTotal)}
                </p>
              </div>
            </div>

            {/* Right Side: Navigation Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="transaparent"
                className="px-8 h-12 rounded-xl font-bold flex items-center gap-2 group transition-all hover:shadow-lg hover:shadow-brand-500/25"
                onClick={() => window.location.href = '/cart'}
                disabled={cartTotal < 700}
              >
                View Cart
                <ChevronDown className="rotate-[-90deg] transition-transform group-hover:translate-x-1" size={18} />
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProductDetails;