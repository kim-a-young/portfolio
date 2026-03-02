"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductCardProps {
  image1: string;
  image2: string;
  alt?: string;
  title: string;
  subtitle: string;
  date: string;
  contribution: number;
}

export function ProductCard({
  image1,
  image2,
  alt = "Product",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col">
      <div
        className="group relative aspect-[2/3] w-full overflow-hidden rounded-[3px] bg-white cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 첫 번째 이미지 (기본) */}
        <div
          className={`absolute inset-0 z-0 transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={image1}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        </div>

        {/* 두 번째 이미지 (hover 시) */}
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image2}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
