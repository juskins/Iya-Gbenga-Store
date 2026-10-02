"use client";

import Image from "next/image";
import { useState } from "react";
import Badge from "@/components/store/Badge";
import type { Product } from "@/lib/types";

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images;

  return (
    <div className="flex flex-col gap-space-md">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low shadow-sm">
        <Image
          src={images[active]}
          alt={`${product.name}, image ${active + 1} of ${images.length}`}
          fill
          priority
          sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {product.badge && <Badge {...product.badge} className="absolute top-4 left-4 z-10 shadow-md" />}
      </div>
      <div className="grid grid-cols-4 gap-3" role="group" aria-label="Product images">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${images.length}`}
            aria-pressed={i === active}
            className={`relative aspect-square rounded-lg overflow-hidden bg-surface-container p-0.5 shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-primary ${
              i === active ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
            }`}
          >
            <Image src={src} alt="" fill sizes="120px" className="object-cover rounded-md" />
          </button>
        ))}
      </div>
    </div>
  );
}
