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
    if (!el) return;

    let isDragging = false;
    let startPos = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startPos = direction === "horizontal" ? e.pageX : e.pageY;
      startScroll = direction === "horizontal" ? el.scrollLeft : el.scrollTop;
      el.style.cursor = "grabbing";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const pos = direction === "horizontal" ? e.pageX : e.pageY;
      if (direction === "horizontal") {
        el.scrollLeft = startScroll - (pos - startPos);
      } else {
        el.scrollTop = startScroll - (pos - startPos);
      }
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      if (direction === "horizontal") {
        if (e.deltaX !== 0) return; // native horizontal trackpad — let browser handle
        if (e.deltaY === 0) return;
        if (el.scrollWidth <= el.clientWidth) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      } else {
        if (e.deltaY === 0) return;
        if (el.scrollHeight <= el.clientHeight) return;
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [direction]);

  return ref;
}
