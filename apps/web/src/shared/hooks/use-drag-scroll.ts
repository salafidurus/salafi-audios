"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches drag-to-scroll and wheel-to-scroll to the returned ref.
 * For horizontal: vertical mouse wheel is remapped to horizontal scroll.
 * For vertical: wheel scrolls this element explicitly (prevents a parent
 * scroll container from stealing the event when content fits).
 * Attach the ref to a native HTML element with overflow set appropriately.
 */
export function useDragScroll(direction: "horizontal" | "vertical") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      startScroll = direction === "horizontal" ? el.scrollLeft : el.scrollTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }
      const currentX = e.clientX;
      const currentY = e.clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        if (!hasMoved) {
          hasMoved = true;
          el.style.cursor = "grabbing";
        }
        e.preventDefault();
        const delta = direction === "horizontal" ? dx : dy;
        if (direction === "horizontal") {
          el.scrollLeft = startScroll - delta;
        } else {
          el.scrollTop = startScroll - delta;
        }
      }
    };

    const onMouseUp = () => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      el.style.cursor = "grab";
    };

    const onClick = (e: MouseEvent) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (direction === "horizontal") {
        if (e.deltaX !== 0) {
          return;
        } // native horizontal trackpad — let browser handle
        if (e.deltaY === 0) {
          return;
        }
        if (el.scrollWidth <= el.clientWidth) {
          return;
        }
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      } else {
        if (e.deltaY === 0) {
          return;
        }
        if (el.scrollHeight <= el.clientHeight) {
          return;
        }
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClick, true);
    // passive: false is required because onWheel calls e.preventDefault() to intercept scroll
    // react-doctor-disable-next-line react-doctor/client-passive-event-listeners
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("wheel", onWheel);
    };
  }, [direction]);

  return ref;
}
