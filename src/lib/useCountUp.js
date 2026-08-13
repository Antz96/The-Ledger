import { useEffect, useRef, useState } from "react";

// Animates toward `target` with an ease-out curve; jumps straight there when
// the user prefers reduced motion.
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prev.current = target;
      setValue(target);
      return;
    }
    const from = prev.current;
    prev.current = target;
    if (from === target) return;

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round((from + (target - from) * eased) * 100) / 100);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
