'use client';

import { useState, useEffect } from 'react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function ImageWithLoader({ src, alt, width, height }: ImageWithLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError) {
    return (
      <div 
        className="w-full bg-ink/5 flex items-center justify-center"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <span className="text-xs text-slate">Failed to load</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-ink/5"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-ink/10" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ position: 'absolute', inset: 0 }}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}
