// useResizeObserver.js
import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to observe the size of a DOM element.
 * Returns a ref to be attached to the element and its current size.
 */
export function useResizeObserver() {
  const ref = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = ref.current;
    if (!observeTarget) return;

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(observeTarget);

    // Cleanup on unmount
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, []);

  return [ref, size];
}
