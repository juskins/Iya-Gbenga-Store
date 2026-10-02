export default function CartSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading your cart" className="animate-pulse">
      <div className="h-24 rounded-xl bg-surface-container-lowest mb-space-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="h-36 rounded-xl bg-surface-container-lowest" />
          <div className="h-36 rounded-xl bg-surface-container-lowest" />
          <div className="h-36 rounded-xl bg-surface-container-lowest" />
        </div>
        <div className="lg:col-span-4 h-80 rounded-xl bg-surface-container-lowest" />
      </div>
    </div>
  );
}
