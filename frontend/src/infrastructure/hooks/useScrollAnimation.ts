"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Infrastructure: Scroll Animation Hook
 * Returns a ref to attach to a DOM element and a boolean indicating
 * whether it has entered the viewport. Animation triggers once.
 */
export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}
