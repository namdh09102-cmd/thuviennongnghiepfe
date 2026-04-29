import React from 'react';

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 relative overflow-hidden shadow-sm animate-pulse">
      {/* Thumbnail aspect 16:9 */}
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl w-full" />

      {/* Content */}
      <div className="space-y-3">
        {/* Title (2 lines) */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
          <div className="h-4 bg-gray-200 rounded-lg w-4/6" />
        </div>

        {/* Excerpt (3 lines) */}
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-gray-100 rounded-md w-full" />
          <div className="h-3 bg-gray-100 rounded-md w-full" />
          <div className="h-3 bg-gray-100 rounded-md w-4/5" />
        </div>
      </div>

      {/* Meta & Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center space-x-2">
          {/* Avatar 24px */}
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded-md w-16" />
            <div className="h-2 bg-gray-100 rounded-md w-24" />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-4 bg-gray-100 rounded-md" />
          <div className="w-8 h-4 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
