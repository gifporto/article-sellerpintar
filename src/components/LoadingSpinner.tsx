// LoadingSpinner.tsx
"use client";

export default function LoadingSpinner({ size = 8 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center py-10 w-full">
      <div
        className={`w-${size} h-${size} border-4 border-t-transparent border-black rounded-full animate-spin`}
      ></div>
    </div>
  );
}
