"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Eye, ShoppingCart, Filter, ChevronDown, Zap, Check, Rocket, ArrowBigLeft, Link } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import serverCallFuction, { formattedAmount, getCurrencyIcon } from "@/lib/constantFunction";
import { useCart, AddToCartPayload } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

// --- Types & Interfaces ---
interface VariantType {
    id: number;
    sku: string;
    price: number;
    stock: number;
    bv_point: number;
    attr_combinations: Array<{ attr_id: number, attr_value_id: number, value: string }>;
}

interface ProductPro {
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
    };
    variants: VariantType[];
    product_attributes?: Array<{
        id: number;
        name: string;
        values: Array<{ id: number, value: string }>;
    }>;
    tax_data?: { id: number; name: string; percentage: number };
    variant_count?: string;
    subcategories?: Array<any>;
}

const AllProducts = () => {

    // const { addToCart, loading: cartLoading } = useCart();
    const navigation = useRouter();
    const { addToCart, loading: cartLoading, items: cartItems, totalAmount: cartTotal } = useCart();
    const [products, setProducts] = useState<ProductPro[]>([]);
    const loading = cartLoading;
    const [selectedVariants, setSelectedVariants] = useState<{
        [key: number]: { variant: VariantType | null; attrs: { [key: number]: number } }
    }>({});
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    // 1. Logic to find matching variant
    const findVariantByAttrs = useCallback((pro: ProductPro, selectedAttrs: { [key: number]: number }): VariantType | null => {
        if (!pro.variants || pro.variants.length === 0) {
            console.log('No variants available');
            return null;
        }

        const selectedValueIds = Object.values(selectedAttrs).filter(id => id !== undefined);
        console.log('VARIANT SEARCH - Product:', pro.product.name, 'Selected IDs:', selectedValueIds);

        const matchingVariant = pro.variants.find(variant => {
            const variantValueIds = variant.attr_combinations.map(comb => Number(comb.attr_value_id));

            // Flexible match: every selected ID must be in variant (partial OK, prioritizes complete)
            const idsMatch = selectedValueIds.every(id => variantValueIds.includes(Number(id)));

            if (idsMatch) {
                console.log('MATCH FOUND - Variant SKU:', variant.sku, 'Variant IDs:', variantValueIds);
                return true;
            }
            return false;
        });

        console.log('VARIANT SEARCH RESULT:', matchingVariant ? matchingVariant.sku : 'NO MATCH');
        return matchingVariant || null;
    }, []);

    // 2. Update Attribute and Price Handler
    const updateAttr = (pro: ProductPro, attrId: number, valueId: number) => {
        const proId = pro.product.id;
        console.log('ATTR UPDATE - Product:', pro.product.name, 'Attr ID:', attrId, 'Value ID:', valueId);

        setSelectedVariants(prev => {
            const currentAttrs = prev[proId]?.attrs || {};
            const nextAttrs = { ...currentAttrs, [attrId]: valueId };

            // Find the variant with new attribute set
            const matchingVariant = findVariantByAttrs(pro, nextAttrs);

            console.log('ATTR UPDATE RESULT - Selected attrs:', nextAttrs, 'Variant:', matchingVariant?.sku || 'none');

            return {
                ...prev,
                [proId]: {
                    variant: matchingVariant,
                    attrs: nextAttrs
                }
            };
        });
    };

    // 3. Fetch Products and Handle Auto-selection
    const fetchProducts = useCallback(async () => {
        try {
            const res = await serverCallFuction('GET', 'api/products/getDproducts');
            if (res.success) {
                const data: ProductPro[] = res.data;
                console.log('FETCHED PRODUCTS:', data.length, 'products');
                // data.forEach(pro => {
                //     console.log('\n\n===== PRODUCT DATA - Name:', pro.product.name, 'HSN - ', pro.hsn_code, 'Has variants?', !!pro.product.variants?.length, 'Variants count:', pro.product.variants?.length || 0);
                //     console.log('ATTRIBUTES:', pro.product_attributes);
                //     if (pro.variants?.[0]) {
                //         console.log('FIRST VARIANT:', pro.variants[0]);
                //     }
                // });

                setProducts(data);

                const initialSelections: any = {};
                data.forEach((pro) => {
                    if (pro.product_attributes && pro.product_attributes.length > 0) {
                        const defaultAttrs: { [key: number]: number } = {};
                        pro.product_attributes.forEach(attr => {
                            if (attr.values.length > 0) {
                                defaultAttrs[attr.id] = attr.values[0].id;
                            }
                        });
                        const variant = findVariantByAttrs(pro, defaultAttrs);
                        initialSelections[pro.product.id] = { variant, attrs: defaultAttrs };
                    }
                });
                setSelectedVariants(initialSelections);
            }
        } catch (error) {
            console.error("API Error:", error);
        }
    }, [findVariantByAttrs]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);


    // Helper to update quantity for a specific product
    const handleQtyChange = (productId: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + delta)
        }));
    };


    const updateQty = (productId: number, value: string | number) => {
        // Convert to number and handle empty/NaN cases
        let newQty = typeof value === 'string' ? parseInt(value) : value;

        // Validation: If it's not a number or less than 1, we set it to 1
        // This prevents 0 or negative numbers
        if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
        }

        setQuantities(prev => ({
            ...prev,
            [productId]: newQty
        }));
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 mb-20 md:mb-4">
            {/* Header Area */}

            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-1 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
                        onClick={() => {
                            navigation.back()
                        }}
                        aria-label="Back"
                    >
                        <ArrowBigLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Our Products</h1>
                        <p className="text-sm text-gray-500">Select size and color to view specific pricing</p>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {products.map((pro) => {
                    const proId = pro.product.id;
                    const selection = selectedVariants[proId];
                    const variant = selection?.variant;
                    const hasAttributes = pro.product_attributes && pro.product_attributes.length > 0;

                    // Priority: Selected Variant Price > Base Price
                    const variantPrice = variant ? Number(variant.price) : 0;
                    const basePrice = pro.product.price;


                    // Calculate DPC Price for distributor view
                    const dpcPercentage = pro.product.dpc_percentage || 0;
                    const dpcPrice = pro.product.dpc_price;

                    // Calculate MRP Price for reference (if needed)
                    const mrpPercentage = pro.product.mrp_percentage || 0;
                    const mrpPrice = pro.product.price ?? (mrpPercentage > 0 ? basePrice * (1 + mrpPercentage / 100) : basePrice);

                    const displayPrice = (variant && variantPrice >= 0) ? variantPrice : dpcPrice;
                    console.log('DISPLAY PRICE - Product:', pro.product.name, 'Variant:', variant?.sku, 'Variant price:', variantPrice, 'Display:', displayPrice);
                    const stock = variant ? variant.stock : pro.total_stock; // Default or unlimited
                    
                    const currency = getCurrencyIcon('INR');
                    const qty = quantities[proId] || 1;
                    return (
                        <div key={proId} className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg">
                            {/* Image Box */}
                            <a href={`/shop/${pro.product.slug}`}>
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">

                                    {pro.product.f_image ? (
                                        <img src={pro.product.f_image} alt={pro.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                    )}

                                    {/* Rating */}
                                    <Badge variant="outline" color="success" className="absolute top-2 left-2 p-0 m-0">
                                        <Badge variant="solid" color="success" className=" me-3">
                                            {pro.product?.average_rating ?? 0} <span className="ml-1 ">★</span>
                                        </Badge>
                                        {pro.product?.total_reviews ?? 0} <span className="ml-1 text-xs">Reviews</span>
                                    </Badge>

                                    {/* {basePrice > displayPrice && */}
                                    {/* <Badge variant="solid" color="primary" className="absolute top-2 right-2 text-md">
                                        {formattedAmount(((basePrice - displayPrice) * 100) / basePrice)} <span className="ml-1 text-md">%</span>
                                    </Badge> */}
                                    {/* } */}
                                </div>
                            </a>

                            {/* Info Box */}
                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">
                                    {pro.category?.name || "Uncategorized"}
                                </span>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white mb-0  line-clamp-2">
                                    {pro.product.name}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    {/* Price Display */}
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase font-medium">Distributor Price</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                {currency}{formattedAmount(displayPrice)}
                                            </span>
                                            {mrpPrice > displayPrice && (
                                                <span className="text-md text-gray-500 line-through">
                                                    {currency}{formattedAmount(mrpPrice)}
                                                </span>
                                            )}

                                        </div>
                                        {variant && <span className="text-[10px] text-gray-500 font-mono">SKU: {variant.sku.trim()}</span>}
                                        {/* <span className="text-[10px] text-gray-900 dark:text-white">HSN Code - {pro.product.hsn_code ?? 'N/A'}</span> */}
                                    </div>
                                    <Badge variant="solid" color={stock > 0 ? 'success' : 'error'} className=" me-3" size="sm">
                                        STOCK
                                        {/* {stock > 0 ? stock : 'Out of Stock'} */}
                                    </Badge>


                                    {/* Attributes Loop */}
                                    {hasAttributes && pro.product_attributes?.map((attr) => (
                                        <div key={attr.id} className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{attr.name}</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {attr.values.map((val) => {
                                                    const isSelected = selection?.attrs[attr.id] === val.id;
                                                    return (
                                                        <Badge
                                                            key={val.id}
                                                            variant={isSelected ? "solid" : "light"}
                                                            color={isSelected ? "primary" : "light"}
                                                            className="cursor-pointer transition-transform active:scale-90"
                                                            onClick={() => updateAttr(pro, attr.id, val.id)}
                                                        >
                                                            {val.value}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cart Button */}
                                <div className="mt-auto">

                                    {/* Quantity Input Section */}
                                    <div className="flex flex-col gap-1.5 mb-4">
                                        {/* <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Quantity</span> */}
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                                            {/* Decrease Button */}
                                            <button
                                                type="button"
                                                onClick={() => updateQty(proId, (quantities[proId] || 1) - 1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                -
                                            </button>

                                            {/* Manual Keyboard Input */}
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[proId] || 1}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow only digits and empty string
                                                    if (/^\d*$/.test(value)) {
                                                        if (parseInt(value) <= stock) {
                                                            updateQty(proId, value);
                                                        } else {
                                                            updateQty(proId, stock);
                                                        }
                                                    }


                                                    // updateQty(proId, e.target.value)
                                                }}
                                                className="flex-1 w-full bg-transparent text-center text-sm font-bold text-gray-800 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />

                                            {/* Increase Button */}
                                            <button
                                                type="button"
                                                onClick={() => updateQty(proId, (quantities[proId] || 1) + 1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>


                                    <Button
                                        className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all shadow-md ${hasAttributes && !variant || stock <= 0
                                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70'
                                            : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                            }`}
                                        disabled={hasAttributes && !variant || stock <= 0}
                                        onClick={async () => {
                                            const price = variant ? variant.price : displayPrice;
                                            const payload: AddToCartPayload = {
                                                product_id: pro.product.id,
                                                ...(variant && { variation_id: variant.id }),
                                                quantity: qty,
                                                price
                                            };
                                            const success = await addToCart(payload);
                                            if (success) {
                                                // Optional: show toast/success message
                                                console.log('Added to cart');
                                            }
                                        }}
                                    >
                                        <ShoppingCart size={18} />
                                        {stock <= 0 ? 'Sold Out' : loading ? 'Adding...' : 'Add to Cart'}
                                    </Button>
                                </div>
                            </div>







                        </div>
                    );
                })}
            </div>

            {/* --- Fixed Bottom Cart Summary --- */}
            {/* Only show if there are items in the cart to keep the UI clean */}
            {cartItems && cartItems.length > 0 && (
                // Change the main container div to include pb-24 or pb-32

                <div className="fixed bottom-3 left-0 right-0 bg-brand-300 rounded  border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-4 py-3 sm:p-4 w-[95%] sm:w-[80%] mx-auto">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">

                        {/* Left Side: Summary Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative hidden sm:block">
                                <div className="bg-brand-100 dark:bg-gray-900/30 p-2.5 rounded-xl ">
                                    <ShoppingCart className="text-brand-600 " size={24} />
                                </div>
                                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                                    {cartItems.length}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs  text-gray-500 dark:text-gray-900 font-medium uppercase tracking-wider">Total Amount</p>
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
                                onClick={() => window.location.href = '/cart'} // Or use router.push('/cart')
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

export default AllProducts;