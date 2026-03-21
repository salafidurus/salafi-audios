"use client";

import { useEffect, useRef, type PropsWithChildren, type ReactElement } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  getServerUnistyles,
  hydrateServerUnistyles,
  resetServerUnistyles,
} from "react-native-unistyles/server";
import "../../utils/unistyles.web";

export function UnistylesStyleDesktopWeb({ children }: PropsWithChildren): ReactElement {
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
