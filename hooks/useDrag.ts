import { useEffect, useRef, useState, useCallback } from "react";

// Animation and behavior constants
const DRAG_THRESHOLD = 0.15; // 15% of screen height to trigger snap
const VELOCITY_THRESHOLD = 0.25; // px/ms for flick detection
const RUBBER_BAND_MAX = 150; // max px of overscroll resistance

interface DragOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  preventDefaultTouchMove?: boolean;
}

export interface DragState {
  isDragging: boolean;
  dragOffset: number;
  velocity: number;
}

export function useDrag({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  preventDefaultTouchMove = true,
}: DragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Touch tracking
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastTouchY = useRef<number>(0);

  // Mouse tracking
  const mouseStartY = useRef<number>(0);
  const mouseStartTime = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const lastMouseY = useRef<number>(0);

  // Velocity tracking
  const velocityRef = useRef<number>(0);

  // Apply rubber band resistance at boundaries
  const applyRubberBand = useCallback((offset: number, canMove: boolean): number => {
    if (canMove) return offset;

    // Apply resistance when dragging past boundary
    const overscroll = Math.abs(offset);
    const resistance = 1 - Math.min(overscroll / RUBBER_BAND_MAX, 0.9);
    return offset * resistance;
  }, []);

  // Calculate if we should snap to next/previous based on offset and velocity
  const shouldSnap = useCallback((offset: number, velocity: number, screenHeight: number): 'next' | 'previous' | 'current' => {
    const offsetPercent = Math.abs(offset) / screenHeight;

    // Flick detection: high velocity
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      if (velocity < 0 && canGoNext) return 'next'; // Dragging up (negative offset)
      if (velocity > 0 && canGoPrevious) return 'previous'; // Dragging down (positive offset)
    }

    // Threshold detection: dragged far enough
    if (offsetPercent > DRAG_THRESHOLD) {
      if (offset < 0 && canGoNext) return 'next';
      if (offset > 0 && canGoPrevious) return 'previous';
    }

    return 'current';
  }, [canGoNext, canGoPrevious]);

  // Handle drag end logic
  const handleDragEnd = useCallback((endY: number, startY: number, startTime: number) => {
    setIsDragging(false);

    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;
    const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;

    velocityRef.current = velocity;

    const screenHeight = window.innerHeight;
    const snapDirection = shouldSnap(dragOffset, velocity, screenHeight);

    // Reset drag offset
    setDragOffset(0);

    // Trigger navigation
    if (snapDirection === 'next') {
      onNext?.();
    } else if (snapDirection === 'previous') {
      onPrevious?.();
    }
    // If 'current', just snap back (offset already reset to 0)
  }, [dragOffset, shouldSnap, onNext, onPrevious]);

  useEffect(() => {
    // Check if touch started on an interactive element (iframe, button, etc.)
    const isTouchOnInteractiveElement = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;

      // Check if target or any parent is an iframe or interactive element
      let element: Element | null = target;
      while (element) {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'iframe' || tagName === 'button' || tagName === 'a' || tagName === 'input') {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      // Don't start drag if touching an interactive element
      if (isTouchOnInteractiveElement(e.target)) {
        return;
      }

      setIsDragging(true);
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setDragOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Don't handle move if we didn't start dragging
      if (touchStartY.current === 0) return;

      if (preventDefaultTouchMove) {
        e.preventDefault();
      }

      const currentY = e.touches[0].clientY;
      const rawOffset = currentY - touchStartY.current;

      // Apply rubber band if at boundaries
      let offset = rawOffset;
      if (rawOffset > 0) {
        // Dragging down (going to previous)
        offset = applyRubberBand(rawOffset, canGoPrevious);
      } else {
        // Dragging up (going to next)
        offset = applyRubberBand(rawOffset, canGoNext);
      }

      setDragOffset(offset);
      lastTouchY.current = currentY;
    };

    const handleTouchEnd = () => {
      // Only handle drag end if we were actually dragging
      if (touchStartY.current !== 0) {
        handleDragEnd(lastTouchY.current, touchStartY.current, touchStartTime.current);
      }

      // Reset refs
      touchStartY.current = 0;
      lastTouchY.current = 0;
      touchStartTime.current = 0;
    };

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      setIsDragging(true);
      mouseStartY.current = e.clientY;
      lastMouseY.current = e.clientY;
      mouseStartTime.current = Date.now();
      setDragOffset(0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;

      const currentY = e.clientY;
      const rawOffset = currentY - mouseStartY.current;

      // Apply rubber band if at boundaries
      let offset = rawOffset;
      if (rawOffset > 0) {
        offset = applyRubberBand(rawOffset, canGoPrevious);
      } else {
        offset = applyRubberBand(rawOffset, canGoNext);
      }

      setDragOffset(offset);
      lastMouseY.current = currentY;
    };

    const handleMouseUp = () => {
      if (!isMouseDown.current) return;

      handleDragEnd(lastMouseY.current, mouseStartY.current, mouseStartTime.current);

      // Reset refs
      isMouseDown.current = false;
      mouseStartY.current = 0;
      lastMouseY.current = 0;
      mouseStartTime.current = 0;
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchMove });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onNext, onPrevious, canGoNext, canGoPrevious, preventDefaultTouchMove, applyRubberBand, handleDragEnd]);

  return {
    isDragging,
    dragOffset,
    velocity: velocityRef.current,
  };
}
