"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import serverCallFuction from "@/lib/constantFunction";

type Review = {
    id?: number;
    product_id?: number;
    user_id?: number;
    rating?: number;
    review?: string;
    created_at?: string;
    user_name?: string;
};

type Props = {
    productId: number;
};

type ReviewResponse = {
    status?: boolean;
    success?: boolean;
    message?: string;
    reviews?: unknown;
    data?: unknown;
};

const clampRating = (n: number) => {
    if (Number.isNaN(n)) return 0;
    return Math.max(1, Math.min(5, n));
};

const isRecord = (value: unknown): value is ReviewResponse =>
    typeof value === "object" && value !== null;

const ReviewsSection: React.FC<Props> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [submitMsg, setSubmitMsg] = useState<string | null>(null);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await serverCallFuction<ReviewResponse | Review[]>(
                "GET",
                `api/ecom/reviews/${productId}`,
            );

            if (!Array.isArray(res) && isRecord(res) && (res.status === false || res.success === false)) {
                throw new Error(res.message || "Failed to load reviews");
            }

            const nestedData = !Array.isArray(res) && isRecord(res) ? res.data : undefined;
            const data = Array.isArray(res)
                ? res
                : isRecord(res) && Array.isArray(res.reviews)
                    ? res.reviews as Review[]
                    : Array.isArray(nestedData)
                        ? nestedData as Review[]
                        : isRecord(nestedData) && Array.isArray(nestedData.reviews)
                            ? nestedData.reviews as Review[]
                            : [];

            setReviews(data);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load reviews";
            setError(msg);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMsg(null);

        const trimmed = reviewText.trim();
        if (!trimmed) {
            setSubmitMsg("Please write a review.");
            return;
        }

        const payload = {
            product_id: productId,
            rating: clampRating(Number(rating)),
            review: trimmed,
        };

        try {
            setSubmitting(true);
            setError(null);

            const res = await serverCallFuction(
                "POST",
                `api/ecom/reviews`,
                payload,
            );

            if (isRecord(res) && (res.status === false || res.success === false)) {
                if (res.message === "No token, authorization denied") {
                    setSubmitMsg("You must be logged in to submit a review.");
                } else {
                    setSubmitMsg(res.message || "Failed to submit review.");
                }
                return;
            }

            setSubmitMsg("Review submitted successfully.");
            setReviewText("");
            setRating(5);
            await fetchReviews();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to submit review.";
            setSubmitMsg(msg);
        } finally {
            setSubmitting(false);
        }
    };




    const renderStars = (value: number, size = 16) => (
        <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    className={index < value ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}
                />
            ))}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {averageRating.toFixed(1)} <span className="text-base font-medium text-gray-500">/ 5</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {reviews.length ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}
                    </div>
                </div>
                {renderStars(Math.round(averageRating), 20)}
            </div>

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </p>
            )}

            <div className="space-y-3">
                {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>
                ) : reviews.length ? (
                    reviews.map((review, index) => {
                        const reviewRating = clampRating(Number(review.rating) || 0);
                        const createdAt = review.created_at ? new Date(review.created_at) : null;

                        return (
                            <article
                                key={review.id ?? index}
                                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {review.user_name || "Anonymous"}
                                        </h3>
                                        <div className="mt-1">{renderStars(reviewRating)}</div>
                                    </div>
                                    {createdAt && !Number.isNaN(createdAt.getTime()) && (
                                        <time
                                            className="text-sm text-gray-500 dark:text-gray-400"
                                            dateTime={createdAt.toISOString()}
                                        >
                                            {createdAt.toLocaleDateString("en-IN")}
                                        </time>
                                    )}
                                </div>
                                {review.review && (
                                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                        {review.review}
                                    </p>
                                )}
                            </article>
                        );
                    })
                ) : !error ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to review this product.</p>
                ) : null}
            </div>

            <form
                onSubmit={onSubmit}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Write a review</h3>
                <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your rating
                    </label>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={rating === value}
                                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                onClick={() => setRating(value)}
                                disabled={submitting}
                                className="rounded p-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Star
                                    size={24}
                                    className={value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor={`review-text-${productId}`} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Review
                    </label>
                    <textarea
                        id={`review-text-${productId}`}
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this product..."
                        disabled={submitting}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>

                {submitMsg && (
                    <p
                        role="status"
                        className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                            submitMsg.toLowerCase().includes("success")
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                    >
                        {submitMsg}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Submitting..." : "Submit review"}
                </button>
            </form>
        </div>
    );
};

export default ReviewsSection;
