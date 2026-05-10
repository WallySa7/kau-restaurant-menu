export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-[linear-gradient(90deg,#f3f4f6_0px,#e5e7eb_40px,#f3f4f6_80px)] bg-[length:800px_100%] animate-shimmer rounded-md ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function RowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pe-3">
          <Skeleton className="h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}
