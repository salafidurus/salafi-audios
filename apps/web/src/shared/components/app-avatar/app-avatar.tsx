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
  onError?: ImageProps["onError"];
  sizes?: string;
};

type AvatarStage = "listing" | "scholar" | "image" | "fallback";

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

  if (source) {
    return (
      <Image
        src={source}
        alt=""
        fill={fill}
        sizes={sizes}
        width={fill ? undefined : size}
        height={fill ? undefined : size}
        className={`${styles.avatar} ${className ?? ""}`}
        unoptimized
        onError={handleError}
      />
    );
  }

  const initial = fallbackText?.trim().charAt(0).toUpperCase() || "?";
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
