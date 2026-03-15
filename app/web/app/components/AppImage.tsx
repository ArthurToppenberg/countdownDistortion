"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type CSSProperties, type SyntheticEvent } from "react";
import { assetPath } from "../lib/assetPath";
import blurMap from "../lib/blurPlaceholders.json";

type AppImageProps = Omit<ImageProps, "src"> & {
  src: string;
  caption?: string;
};

const BLUR_PLACEHOLDER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "blur(20px)",
  transform: "scale(1.1)",
  transition: "opacity 500ms ease-out",
  pointerEvents: "none",
};

export function AppImage({
  src,
  fill,
  className,
  style,
  onLoad,
  width,
  height,
  caption,
  ...props
}: AppImageProps) {
  const blurDataURL = (blurMap as Record<string, string>)[src];
  const [loaded, setLoaded] = useState(!blurDataURL);

  if (!blurDataURL) {
    const imageContent = (
      <Image
        src={assetPath(src)}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        style={style}
        onLoad={onLoad}
        {...props}
      />
    );
    if (caption) {
      return (
        <figure className="m-0">
          {imageContent}
          <figcaption className="mt-2 text-left text-xs text-muted-foreground tracking-tight">
            {caption}
          </figcaption>
        </figure>
      );
    }
    return imageContent;
  }

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    setLoaded(true);
    if (typeof onLoad === "function") {
      (onLoad as (event: SyntheticEvent<HTMLImageElement>) => void)(event);
    }
  };

  const blurPlaceholder = (
    <img
      src={blurDataURL}
      alt=""
      aria-hidden="true"
      style={{ ...BLUR_PLACEHOLDER_STYLE, opacity: loaded ? 0 : 1 }}
    />
  );

  const fillContent = (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {blurPlaceholder}
      <Image
        src={assetPath(src)}
        fill
        className={className}
        style={{
          ...style,
          transition: "opacity 500ms ease-out",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
  if (fill) {
    if (caption) {
      return (
        <figure className="m-0" style={{ position: "absolute", inset: 0 }}>
          {fillContent}
          <figcaption className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 px-4 py-2 text-left text-xs text-muted-foreground tracking-tight backdrop-blur-sm">
            {caption}
          </figcaption>
        </figure>
      );
    }
    return fillContent;
  }

  const nonFillContent = (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {blurPlaceholder}
      <Image
        src={assetPath(src)}
        width={width}
        height={height}
        className={className}
        style={{
          display: "block",
          ...style,
          transition: "opacity 500ms ease-out",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
  if (caption) {
    return (
      <figure className="m-0">
        {nonFillContent}
        <figcaption className="mt-2 text-left text-xs text-muted-foreground tracking-tight">
          {caption}
        </figcaption>
      </figure>
    );
  }
  return nonFillContent;
}
