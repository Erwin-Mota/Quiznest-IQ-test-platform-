import { useEffect } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ to = 100, duration = 1.2, className }: AnimatedCounterProps) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, v => Math.round(v));
  
  useEffect(() => {
    const controls = animate(mv, to, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [to, duration, mv]);
  
  return <span className={className}>{rounded.get()}</span>;
}
