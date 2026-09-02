/** Documents this module's responsibility and public boundary. */
"use client";

import type { ImageProps } from "next/image";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "../user-avatar/user-avatar.module.css";

type AppAvatarProps = {
  image?: string | null;
  listingArtwork?: string | null;
  scholarImageUrl?: string | null;
  text?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  fill?: boolean;
  /** Documents the intent and contract of this field. */ onError?: ImageProps["onError"];
  sizes?: string;
};

type AvatarStage = "listing" | "scholar" | "image" | "fallback";

function AvatarContent({
  source,
  fill,
  sizes,
  size,
  className,
  fallbackText,
  onError,
}: {
  /** Documents the intent and contract of this field. */ source: string | null | undefined;
  fill: boolean;
  sizes: string;
  size: number;
  className?: string;
  fallbackText?: string | null;
  /** Documents the intent and contract of this field. */ onError: ImageProps["onError"];
}) {
  if (source)
    return (
      <AvatarImage
        source={source}
        fill={fill}
        sizes={sizes}
        size={size}
        className={className}
        onError={onError}
      />
    );
  const initial = getAvatarInitial(fallbackText);
  return <AvatarFallback initial={initial} fill={fill} size={size} className={className} />;
}

function AvatarImage({
  source,
  fill,
  sizes,
  size,
  className,
  onError,
}: Pick<
  Parameters<typeof AvatarContent>[0],
  "source" | "fill" | "sizes" | "size" | "className" | "onError"
>) {
  return (
    <Image
      src={source!}
      alt=""
      fill={fill}
      sizes={sizes}
      width={getImageDimension(fill, size)}
      height={getImageDimension(fill, size)}
      className={`${styles.avatar} ${className ?? ""}`}
      unoptimized
      onError={onError}
    />
  );
}

function getImageDimension(fill: boolean, size: number): number | undefined {
  return fill ? undefined : size;
}

function getAvatarInitial(fallbackText?: string | null): string {
  return fallbackText?.trim().charAt(0).toUpperCase() || "?";
}

function AvatarFallback({
  initial,
  fill,
  size,
  className,
}: {
  initial: string;
  fill: boolean;
  size: number;
  className?: string;
}) {
  return (
    <div
      className={`${fill ? styles.fallbackFill : styles.fallback} ${className ?? ""}`}
      style={fill ? undefined : { width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

function nextAvatarStage(
  currentStage: AvatarStage,
  scholarImageUrl?: string | null,
  image?: string | null,
) {
  if (currentStage === "listing" && scholarImageUrl) return "scholar";
  if (currentStage !== "image" && image) return "image";
  return "fallback";
}

function avatarSource(
  stage: AvatarStage,
  listingArtwork?: string | null,
  scholarImageUrl?: string | null,
  image?: string | null,
) {
  if (stage === "listing") return listingArtwork;
  if (stage === "scholar") return scholarImageUrl;
  if (stage === "image") return image;
  return null;
}

/** Documents the intent and contract of this declaration. */
export function AppAvatar({
  image,
  listingArtwork,
  scholarImageUrl,
  text,
  name,
  size = 48,
  className,
  fill = false,
  onError,
  sizes = "(max-width: 640px) 20vw, 14vw",
}: AppAvatarProps) {
  const fallbackText = text ?? name;
  const [stage, setStage] = useState<AvatarStage>(() =>
    getInitialStage(listingArtwork, scholarImageUrl, image),
  );

  useEffect(() => {
    setStage(getInitialStage(listingArtwork, scholarImageUrl, image));
  }, [image, listingArtwork, scholarImageUrl]);

  const handleError: ImageProps["onError"] = (event) => {
    onError?.(event);
    setStage((currentStage) => {
      return nextAvatarStage(currentStage, scholarImageUrl, image);
    });
  };

  const source = avatarSource(stage, listingArtwork, scholarImageUrl, image);

  return (
    <AvatarContent
      source={source}
      fill={fill}
      sizes={sizes}
      size={size}
      className={className}
      fallbackText={fallbackText}
      onError={handleError}
    />
  );
}

function getInitialStage(
  listingArtwork?: string | null,
  scholarImageUrl?: string | null,
  image?: string | null,
): AvatarStage {
  if (listingArtwork) return "listing";
  if (scholarImageUrl) return "scholar";
  if (image) return "image";
  return "fallback";
}
