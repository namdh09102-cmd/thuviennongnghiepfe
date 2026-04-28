export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 space-y-6 relative overflow-hidden shadow-sm">
      {/* Shimmer Animation Layer */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-100 via-gray-200/50 to-gray-100 animate-[shimmer_1.5s_infinite]" />

      {/* Card Image / Thumbnail */}
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl w-full" />

      {/* Title (2 lines) */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded-xl w-[90%]" />
        <div className="h-5 bg-gray-200 rounded-xl w-[60%]" />
      </div>

      {/* Excerpt (3 lines) */}
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-[80%]" />
      </div>

      {/* Author & Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center space-x-3">
          {/* Circle Avatar 40px */}
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded-lg w-20" />
            <div className="h-2.5 bg-gray-100 rounded-lg w-12" />
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="w-8 h-4 bg-gray-100 rounded-lg" />
          <div className="w-8 h-4 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
