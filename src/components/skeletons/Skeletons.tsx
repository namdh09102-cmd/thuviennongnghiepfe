import React from 'react';

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
);

export const PostCardSkeleton = () => (
  <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm space-y-4">
    <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="p-6 space-y-4">
      <div className="h-2 w-24 bg-gray-100 rounded-full relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-4 w-3/4 bg-gray-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
      <div className="flex items-center space-x-3 pt-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-2 w-20 bg-gray-100 rounded-full relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex space-x-4 p-4">
    <div className="w-10 h-10 rounded-2xl bg-gray-100 relative overflow-hidden flex-shrink-0">
      <Shimmer />
    </div>
    <div className="flex-1 space-y-3">
      <div className="h-2.5 w-32 bg-gray-100 rounded-full relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-3 w-5/6 bg-gray-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-64 bg-white rounded-[40px] border border-gray-100 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 h-96 bg-white rounded-[40px] border border-gray-100 relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="lg:col-span-8 space-y-6">
        <div className="h-16 bg-white rounded-[24px] border border-gray-100 relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </div>
  </div>
);
