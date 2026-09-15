import Image from "next/image";
import type { ImageProps } from "next/image";

export type FramedImageAspect = "16/9" | "4/3" | "3/2" | "1/1" | "21/9";

export type FramedImageWidth = "full" | "xs" | "sm" | "md" | "lg" | "xl";

export type FramedImageProps = Omit<ImageProps, "fill" | "width" | "height"> & {
  aspect?: FramedImageAspect;
  width?: FramedImageWidth | number;
  fit?: "cover" | "contain";
  wrapperClassName?: string;
};

const aspectClasses: Record<FramedImageAspect, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
};

const fitClasses = {
  cover: "object-cover",
  contain: "object-contain",
} as const;

// Width is a fluid cap: full frame width below the cap, capped above it,
// so the image stays responsive at every viewport.
const widthClasses: Record<FramedImageWidth, string> = {
  full: "w-full",
  xs: "w-full max-w-xs",
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
  xl: "w-full max-w-xl",
};

export function FramedImage({
  aspect = "16/9",
  width = "full",
  fit = "cover",
  wrapperClassName = "",
  className = "",
  alt,
  ...props
}: FramedImageProps) {
  const fixedWidth = typeof width === "number";
  return (
    <div
      style={fixedWidth ? { maxWidth: width } : undefined}
      className={`relative overflow-hidden ${aspectClasses[aspect]} ${fixedWidth ? "w-full" : widthClasses[width]} ${wrapperClassName}`}
    >
      <Image {...props} alt={alt} fill className={`${fitClasses[fit]} ${className}`} />
    </div>
  );
}
