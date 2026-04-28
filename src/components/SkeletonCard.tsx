export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="aspect-video bg-gray-100 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-50 rounded-full w-full" />
        <div className="h-3 bg-gray-50 rounded-full w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full" />
          <div className="space-y-1">
            <div className="h-2 bg-gray-100 rounded-full w-16" />
            <div className="h-2 bg-gray-50 rounded-full w-10" />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-6 h-3 bg-gray-50 rounded-full" />
          <div className="w-6 h-3 bg-gray-50 rounded-full" />
        </div>
      </div>
    </div>
  );
}
