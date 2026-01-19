import { useEffect, useRef, useState } from "react";
import { SwipeDirection } from "@/types/station";

interface SwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchMove?: boolean;
}

export function useSwipe({
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchMove = true,
}: SwipeOptions) {
  const [isGesturing, setIsGesturing] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const mouseStartY = useRef<number>(0);
  const mouseEndY = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const wheelDelta = useRef<number>(0);

  useEffect(() => {
    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      setIsGesturing(true);
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefaultTouchMove) {
        e.preventDefault();
      }
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      setIsGesturing(false);
      const deltaY = touchStartY.current - touchEndY.current;

      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          // Swipe up
          onSwipeUp?.();
        } else {
          // Swipe down
          onSwipeDown?.();
        }
      }

      touchStartY.current = 0;
      touchEndY.current = 0;
    };

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      setIsGesturing(true);
      mouseStartY.current = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown.current) {
        mouseEndY.current = e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown.current) {
        setIsGesturing(false);
        const deltaY = mouseStartY.current - mouseEndY.current;

        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            // Swipe up
            onSwipeUp?.();
          } else {
            // Swipe down
            onSwipeDown?.();
          }
        }

        isMouseDown.current = false;
        mouseStartY.current = 0;
        mouseEndY.current = 0;
      }
    };

    // Wheel event handler (trackpad/mouse wheel) - debounced and accumulated
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Accumulate scroll delta
      wheelDelta.current += e.deltaY;

      // Clear existing timeout
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }

      // Set new timeout to process accumulated scroll
      wheelTimeout.current = setTimeout(() => {
        const accumulated = wheelDelta.current;
        wheelDelta.current = 0;

        // Only trigger if accumulated scroll exceeds threshold (smoother feel)
        if (Math.abs(accumulated) > 100) {
          if (accumulated > 0) {
            // Scroll down = next station
            onSwipeUp?.();
          } else {
            // Scroll up = previous station
            onSwipeDown?.();
          }
        }
      }, 150); // Wait 150ms after last scroll event
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchMove });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("wheel", handleWheel);

      // Clear wheel timeout on cleanup
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, [onSwipeUp, onSwipeDown, threshold, preventDefaultTouchMove]);

  return { isGesturing };
}
