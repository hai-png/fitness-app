import { CSSProperties } from "react";

/**
 * LazyImage — a thin wrapper around <img> that adds P-03 defaults:
 *   - `loading="lazy"`: browser defers loading until the image is near
 *     the viewport, saving bandwidth on long lists.
 *   - `decoding="async"`: image decode does not block the main thread.
 *   - Optional `srcSet` for retina / responsive images.
 *
 * Usage:
 *   <LazyImage src="https://images.unsplash.com/photo-1?w=300" srcSet="https://images.unsplash.com/photo-1?w=300 1x, https://images.unsplash.com/photo-1?w=600 2x" alt="Gym" />
 *
 * For Unsplash URLs, append `&w=300` for 1x and `&w=600` for 2x in the
 * srcSet to get crisp images on retina displays without doubling payload
 * for non-retina users.
 */
interface LazyImageProps {
  src: string;
  srcSet?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  /** Override loading="lazy" (e.g. for above-the-fold hero images). */
  eager?: boolean;
}

export function LazyImage({
  src,
  srcSet,
  alt,
  className,
  style,
  sizes,
  eager = false,
}: LazyImageProps) {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      // fetchPriority is a valid HTML attribute (React 19 supports it natively).
      // Low priority for lazy images; high priority for above-the-fold hero images.
      fetchPriority={eager ? "high" : "low"}
    />
  );
}

export default LazyImage;
