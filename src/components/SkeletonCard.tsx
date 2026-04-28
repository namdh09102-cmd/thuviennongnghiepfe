import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 p-3 border rounded-2xl bg-white animate-pulse">
      <div className="h-36 bg-gray-200 rounded-xl w-full" />
      <div className="space-y-2 mt-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}
