// LoadingSkeleton.tsx
"use client";

export default function LoadingSpinner({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          {/* Thumbnail */}
          <div className="w-full h-24 bg-gray-300 rounded-md opacity-30 animate-blink"></div>
        </div>
      ))}
    </div>
  );
}
