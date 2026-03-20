"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  getServerUnistyles,
  hydrateServerUnistyles,
  resetServerUnistyles,
} from "react-native-unistyles/server";
import "./unistyles.desktop.web";

export function UnistylesStyle({ children }: PropsWithChildren) {
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInserted.current) {
      return null;
    }
    isServerInserted.current = true;
    const styles = getServerUnistyles();
    resetServerUnistyles();
    return styles;
  });

  useEffect(() => {
    hydrateServerUnistyles();
  }, []);

  return <>{children}</>;
}
