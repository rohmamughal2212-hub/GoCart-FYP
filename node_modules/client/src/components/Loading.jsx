/* Reusable loading primitives used across the app */

export const Spinner = ({ size = 8, className = "" }) => (
  <div
    className={`rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin ${className}`}
    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
  />
);

export const PageSpinner = () => (
  <div className="flex items-center justify-center py-32">
    <Spinner size={10} />
  </div>
);

/* Mimics a ProductCard skeleton */
export const ProductSkeleton = () => (
  <div className="border border-gray-100 rounded-md px-3 py-2 bg-white animate-pulse">
    <div className="h-32 bg-gray-100 rounded mb-3" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
    <div className="flex justify-between items-center">
      <div className="h-5 bg-gray-100 rounded w-1/3" />
      <div className="h-8 bg-gray-100 rounded w-16" />
    </div>
  </div>
);

/* Grid of skeletons */
export const ProductSkeletonGrid = ({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

/* Simple inline button spinner */
export const BtnSpinner = () => (
  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);
